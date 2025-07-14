import { OnboardingProgress, OnboardingStore } from '@/components/onboarding-form/types';
import { indexedDBStore } from './indexedDB';
import { supabaseStore } from './supabase';
import { generateUUID } from '@/app/utils/utils';

class CombinedStore implements OnboardingStore {
  private sessionInitPromise: Promise<string | null> | null = null;

  private async initializeSession(): Promise<string> {
    // Try to get existing session ID from IndexedDB first
    const localSessionId = await indexedDBStore.getSessionId();
    if (localSessionId) {
      // Verify session exists in API
      try {
        await supabaseStore.verifySession(localSessionId);
        return localSessionId;
      } catch {
        console.warn('Local session not found in API, will create new session');
      }
    }

    // Try to get from API
    try {
      const remoteProgress = await supabaseStore.getProgress();
      if (remoteProgress?.session_id) {
        await indexedDBStore.saveSessionId(remoteProgress.session_id);
        return remoteProgress.session_id;
      }
    } catch (error) {
      console.warn('Failed to get remote progress:', error);
    }

    // Create new session
    const newSessionId = generateUUID();
    await Promise.all([
      indexedDBStore.saveSessionId(newSessionId),
      supabaseStore.initializeSession(newSessionId)
    ]);
    return newSessionId;
  }

  async getSessionId(): Promise<string | null> {
    if (!this.sessionInitPromise) {
      this.sessionInitPromise = this.initializeSession();
    }
    return this.sessionInitPromise;
  }

  async getProgress(): Promise<OnboardingProgress | null> {
    const sessionId = await this.getSessionId();
    if (!sessionId) return null;

    // Try IndexedDB first
    const localProgress = await indexedDBStore.getProgress();
    if (localProgress && localProgress.session_id === sessionId) {
      return localProgress;
    }

    // Fall back to API
    const remoteProgress = await supabaseStore.getProgress();
    if (remoteProgress) {
      // Sync back to IndexedDB
      await indexedDBStore.saveProgress(remoteProgress);
      return remoteProgress;
    }

    return null;
  }

  async saveProgress(data: OnboardingProgress): Promise<OnboardingProgress> {
    const sessionId = await this.getSessionId();
    if (!sessionId) {
      throw new Error('No session ID available');
    }

    const progressData = {
      ...data,
      session_id: sessionId
    };

    // Save to both stores in parallel
    // Store in indexedDB but only return the remote result
    const [, remoteProgress] = await Promise.all([
      indexedDBStore.saveProgress(progressData),
      supabaseStore.saveProgress(progressData)
    ]);

    return remoteProgress;
  }

  async clearProgress(): Promise<void> {
    const sessionId = await this.getSessionId();
    if (!sessionId) return;

    // Clear both stores and reset session
    await Promise.all([
      indexedDBStore.clearProgress(),
      supabaseStore.clearProgress()
    ]);
    this.sessionInitPromise = null;
  }
}

export const onboardingStore = new CombinedStore(); 