import { OnboardingProgress, OnboardingStore, FormData } from '@/components/onboarding-form/types';
import { onboardingApiClient } from '@/services/api/onboarding/api';

class SupabaseStore implements OnboardingStore {
  private dbName = 'onboardingDB';
  private storeName = 'sessionStore';
  private version = 1;
  private sessionKey = 'sessionId';

  private async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
        }
      };
    });
  }

  async getSessionId(): Promise<string | null> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(this.sessionKey);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  private async setSessionId(sessionId: string): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put(sessionId, this.sessionKey);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  private async removeSessionId(): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(this.sessionKey);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getProgress(): Promise<OnboardingProgress | null> {
    try {
      const sessionId = await this.getSessionId();
      if (!sessionId) return null;

      const response = await onboardingApiClient.getOnboardingProgress(sessionId);
      if (!response.data || !response.session_id) return null;

      // Convert API response to OnboardingProgress type
      return {
        session_id: response.session_id,
        step_number: response.step_number || 1,
        data: response.data as unknown as FormData,
        user_id: response.user_id,
        created_at: response.created_at,
        updated_at: response.updated_at
      };
    } catch (error) {
      console.error('Error getting progress:', error);
      return null;
    }
  }

  async saveProgress(data: OnboardingProgress): Promise<OnboardingProgress> {
    try {
      // Get or create session ID
      const sessionId = data.session_id || await this.getSessionId();
      const isNewSession = !sessionId;
      
      let result;
      if (isNewSession) {
        // Create new onboarding progress
        result = await onboardingApiClient.createOnboardingProgress({
          session_id: sessionId!,
          step_number: data.step_number || null,
          data: data.data as unknown as Record<string, unknown>,
          user_id: data.user_id || null
        });
        
        if (!result) {
          throw new Error('Failed to create onboarding progress');
        }
        
        await this.setSessionId(result.session_id);
      } else {
        // Update existing onboarding progress
        result = await onboardingApiClient.updateOnboardingProgress(sessionId!, {
          session_id: sessionId!,
          step_number: data.step_number,
          data: data.data as unknown as Record<string, unknown>,
          user_id: data.user_id
        });
        
        if (!result) {
          throw new Error('Failed to update onboarding progress');
        }
      }

      // Convert API response to OnboardingProgress type
      return {
        session_id: result.session_id,
        step_number: result.step_number,
        data: result.data as unknown as FormData,
        user_id: result.user_id,
        created_at: result.created_at,
        updated_at: result.updated_at
      };
    } catch (error) {
      console.error('Error saving progress:', error);
      throw error;
    }
  }

  async clearProgress(): Promise<void> {
    try {
      const sessionId = await this.getSessionId();
      if (!sessionId) return;

      await onboardingApiClient.deleteOnboardingProgress(sessionId);
      await this.removeSessionId();
    } catch (error) {
      console.error('Error clearing progress:', error);
      throw error;
    }
  }

  async verifySession(sessionId: string): Promise<boolean> {
    try {
      await onboardingApiClient.getOnboardingProgress(sessionId);
      return true;
    } catch {
      return false;
    }
  }

  async initializeSession(sessionId: string): Promise<void> {
    try {
      await onboardingApiClient.createOnboardingProgress({
        session_id: sessionId,
        step_number: 1,
        data: {}
      });
    } catch (error) {
      console.error('Failed to initialize session:', error);
      throw error;
    }
  }
}

export const supabaseStore = new SupabaseStore(); 