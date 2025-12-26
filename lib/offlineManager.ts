export interface OfflineQueueItem {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: string;
  data: any;
  timestamp: number;
  retries: number;
}

export class OfflineManager {
  private static readonly QUEUE_KEY = 'offline_queue';
  private static readonly MAX_RETRIES = 3;
  private listeners: Set<(isOnline: boolean) => void> = new Set();
  private isOnline: boolean = navigator.onLine;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline);
      window.addEventListener('offline', this.handleOffline);

      if (this.isOnline) {
        this.processQueue();
      }
    }
  }

  private handleOnline = () => {
    this.isOnline = true;
    this.notify(true);
    this.processQueue();
  };

  private handleOffline = () => {
    this.isOnline = false;
    this.notify(false);
  };

  private notify(online: boolean): void {
    this.listeners.forEach(listener => listener(online));
  }

  subscribe(callback: (isOnline: boolean) => void): () => void {
    this.listeners.add(callback);
    callback(this.isOnline);

    return () => {
      this.listeners.delete(callback);
    };
  }

  getOnlineStatus(): boolean {
    return this.isOnline;
  }

  async queueOperation(item: Omit<OfflineQueueItem, 'id' | 'timestamp' | 'retries'>): Promise<void> {
    const queue = await this.getQueue();
    const queueItem: OfflineQueueItem = {
      ...item,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      retries: 0
    };

    queue.push(queueItem);
    await this.saveQueue(queue);
  }

  async getQueue(): Promise<OfflineQueueItem[]> {
    try {
      const stored = localStorage.getItem(OfflineManager.QUEUE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private async saveQueue(queue: OfflineQueueItem[]): Promise<void> {
    try {
      localStorage.setItem(OfflineManager.QUEUE_KEY, JSON.stringify(queue));
    } catch (error) {
      console.error('Failed to save offline queue:', error);
    }
  }

  async processQueue(): Promise<void> {
    if (!this.isOnline) return;

    const queue = await this.getQueue();
    if (queue.length === 0) return;

    const processed: string[] = [];
    const failed: OfflineQueueItem[] = [];

    for (const item of queue) {
      try {
        await this.executeOperation(item);
        processed.push(item.id);
      } catch (error) {
        console.error(`Failed to process queue item ${item.id}:`, error);

        if (item.retries < OfflineManager.MAX_RETRIES) {
          failed.push({ ...item, retries: item.retries + 1 });
        } else {
          console.error(`Max retries reached for item ${item.id}, discarding`);
          processed.push(item.id);
        }
      }
    }

    const remainingQueue = [...failed, ...queue.filter(item => !processed.includes(item.id))];
    await this.saveQueue(remainingQueue);
  }

  private async executeOperation(item: OfflineQueueItem): Promise<void> {
    console.log(`Executing offline operation: ${item.type} ${item.entity}`);
  }

  async clearQueue(): Promise<void> {
    await this.saveQueue([]);
  }

  async getQueueSize(): Promise<number> {
    const queue = await this.getQueue();
    return queue.length;
  }

  cleanup(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline);
      window.removeEventListener('offline', this.handleOffline);
    }
    this.listeners.clear();
  }
}

export const globalOfflineManager = new OfflineManager();

export function useOfflineStorage<T>(key: string, initialValue: T) {
  const getStoredValue = (): T => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  };

  const setValue = (value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to store value:', error);
    }
  };

  return { getStoredValue, setValue };
}

export async function cacheData(key: string, data: any): Promise<void> {
  try {
    const cache = await caches.open('app-data-v1');
    const response = new Response(JSON.stringify(data));
    await cache.put(key, response);
  } catch (error) {
    console.error('Failed to cache data:', error);
  }
}

export async function getCachedData(key: string): Promise<any> {
  try {
    const cache = await caches.open('app-data-v1');
    const response = await cache.match(key);
    if (response) {
      return await response.json();
    }
  } catch (error) {
    console.error('Failed to get cached data:', error);
  }
  return null;
}
