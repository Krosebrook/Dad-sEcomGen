export function registerServiceWorker(): void {
  // Skip Service Worker registration in unsupported environments (e.g., StackBlitz)
  if (!('serviceWorker' in navigator)) {
    console.log('Service Worker not supported in this environment');
    return;
  }

  try {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration);

          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (!newWorker) return;

            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                showUpdateNotification();
              }
            });
          });
        })
        .catch((error) => {
          // Service Worker registration failed - this is non-critical
          console.warn('Service Worker registration failed (non-critical):', error.message || error);
        });
    });
  } catch (error) {
    // Catch any synchronous errors
    console.warn('Service Worker initialization error (non-critical):', error);
  }
}

function showUpdateNotification(): void {
  if (confirm('A new version is available. Reload to update?')) {
    window.location.reload();
  }
}

export function unregisterServiceWorker(): Promise<boolean> {
  if ('serviceWorker' in navigator) {
    return navigator.serviceWorker
      .getRegistrations()
      .then((registrations) => {
        return Promise.all(registrations.map((r) => r.unregister())).then(() => true);
      })
      .catch(() => false);
  }
  return Promise.resolve(false);
}

export interface InstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export class PWAInstallManager {
  private deferredPrompt: InstallPromptEvent | null = null;
  private listeners: Set<(canInstall: boolean) => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeinstallprompt', this.handleBeforeInstallPrompt);
      window.addEventListener('appinstalled', this.handleAppInstalled);
    }
  }

  private handleBeforeInstallPrompt = (e: Event): void => {
    e.preventDefault();
    this.deferredPrompt = e as InstallPromptEvent;
    this.notify(true);
  };

  private handleAppInstalled = (): void => {
    this.deferredPrompt = null;
    this.notify(false);
  };

  private notify(canInstall: boolean): void {
    this.listeners.forEach((listener) => listener(canInstall));
  }

  subscribe(callback: (canInstall: boolean) => void): () => void {
    this.listeners.add(callback);
    callback(this.canInstall());

    return () => {
      this.listeners.delete(callback);
    };
  }

  canInstall(): boolean {
    return this.deferredPrompt !== null;
  }

  async promptInstall(): Promise<boolean> {
    if (!this.deferredPrompt) {
      return false;
    }

    await this.deferredPrompt.prompt();
    const choice = await this.deferredPrompt.userChoice;

    this.deferredPrompt = null;
    this.notify(false);

    return choice.outcome === 'accepted';
  }

  cleanup(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('beforeinstallprompt', this.handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', this.handleAppInstalled);
    }
    this.listeners.clear();
  }
}

export const globalPWAInstallManager = new PWAInstallManager();
