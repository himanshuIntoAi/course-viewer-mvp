import { OnboardingProgress, OnboardingStore } from '@/components/form/types';

class IndexedDBStore implements OnboardingStore {
  private dbName = 'onboardingDB';
  private progressStoreName = 'onboardingProgress';
  private sessionStoreName = 'sessionStore';
  private version = 1;

  private async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.progressStoreName)) {
          db.createObjectStore(this.progressStoreName);
        }
        if (!db.objectStoreNames.contains(this.sessionStoreName)) {
          db.createObjectStore(this.sessionStoreName);
        }
      };
    });
  }

  async getProgress(): Promise<OnboardingProgress | null> {
    try {
      const db = await this.openDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(this.progressStoreName, 'readonly');
        const store = transaction.objectStore(this.progressStoreName);
        const request = store.get('currentProgress');

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result || null);
      });
    } catch (error) {
      return null;
    }
  }

  async saveProgress(progress: OnboardingProgress): Promise<OnboardingProgress> {
    if (!progress.session_id) {
      throw new Error('Cannot save progress without a session_id');
    }

    try {
      const db = await this.openDB();
      
      // Save progress data
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(this.progressStoreName, 'readwrite');
        const store = transaction.objectStore(this.progressStoreName);
        const request = store.put(progress, 'currentProgress');

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });

      // Save session ID
      await this.saveSessionId(progress.session_id);

      return progress;
    } catch (error) {
      throw error;
    }
  }

  async clearProgress(): Promise<void> {
    try {
      const db = await this.openDB();
      await Promise.all([
        new Promise<void>((resolve, reject) => {
          const transaction = db.transaction(this.progressStoreName, 'readwrite');
          const store = transaction.objectStore(this.progressStoreName);
          const request = store.delete('currentProgress');

          request.onerror = () => reject(request.error);
          request.onsuccess = () => resolve();
        }),
        new Promise<void>((resolve, reject) => {
          const transaction = db.transaction(this.sessionStoreName, 'readwrite');
          const store = transaction.objectStore(this.sessionStoreName);
          const request = store.delete('currentSession');

          request.onerror = () => reject(request.error);
          request.onsuccess = () => resolve();
        })
      ]);
    } catch (error) {
      throw error;
    }
  }

  async getSessionId(): Promise<string | null> {
    try {
      const db = await this.openDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(this.sessionStoreName, 'readonly');
        const store = transaction.objectStore(this.sessionStoreName);
        const request = store.get('currentSession');

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result || null);
      });
    } catch (error) {
      return null;
    }
  }

  async saveSessionId(sessionId: string): Promise<void> {
    if (!sessionId) {
      throw new Error('Cannot save empty session_id');
    }

    try {
      const db = await this.openDB();
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(this.sessionStoreName, 'readwrite');
        const store = transaction.objectStore(this.sessionStoreName);
        const request = store.put(sessionId, 'currentSession');

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    } catch (error) {
      throw error;
    }
  }
}

export const indexedDBStore = new IndexedDBStore(); 