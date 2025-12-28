import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import AppWrapper from './AppWrapper';

function showFatalError(message: string, details?: string) {
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="min-height: 100vh; background: white; display: flex; align-items: center; justify-content: center; padding: 20px; font-family: system-ui, -apple-system, sans-serif;">
        <div style="max-width: 600px; width: 100%; background: white; border: 2px solid #e2e8f0; border-radius: 8px; padding: 32px; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
          <h1 style="font-size: 24px; font-weight: bold; color: #0f172a; margin-bottom: 16px;">
            Application Error
          </h1>
          <p style="color: #475569; margin-bottom: 24px;">
            ${message}
          </p>
          ${details ? `
            <details style="text-align: left; margin-bottom: 24px; padding: 16px; background: #f1f5f9; border-radius: 4px;">
              <summary style="cursor: pointer; font-weight: 600; font-size: 14px; color: #334155; margin-bottom: 8px;">
                Error Details
              </summary>
              <pre style="font-size: 12px; color: #dc2626; overflow: auto; white-space: pre-wrap; font-family: monospace;">
${details}
              </pre>
            </details>
          ` : ''}
          <button onclick="window.location.reload()" style="padding: 12px 24px; background: #0f172a; color: white; border: none; border-radius: 6px; font-weight: 500; cursor: pointer;">
            Reload Page
          </button>
        </div>
      </div>
    `;
  }
}

window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  showFatalError('An unexpected error occurred', event.error?.stack || event.message);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  showFatalError('An unexpected error occurred', event.reason?.stack || String(event.reason));
});

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error("Could not find root element to mount to");
  }

  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <AppWrapper />
    </React.StrictMode>
  );
} catch (error) {
  console.error('Failed to initialize application:', error);
  showFatalError(
    'Failed to initialize the application',
    error instanceof Error ? error.stack : String(error)
  );
}
