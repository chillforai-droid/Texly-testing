import { createElement, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

if (typeof window !== 'undefined' && !window.console) {
  (window as any).console = { log: () => {}, error: () => {}, warn: () => {} };
}

function showFatalError(message: string) {
  const loader = document.getElementById('texly-boot-loader');
  if (loader) loader.style.display = 'none';
  const root = document.getElementById('root');
  if (!root) return;
  root.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f8fafc;font-family:sans-serif;padding:20px;">
      <div style="max-width:480px;width:100%;background:white;border-radius:16px;padding:40px;box-shadow:0 4px 24px rgba(0,0,0,0.08);border:1px solid #fee2e2;text-align:center;">
        <div style="font-size:48px;margin-bottom:16px;">⚠️</div>
        <h1 style="color:#dc2626;font-size:20px;margin-bottom:12px;">Unable to load Texly</h1>
        <p style="color:#64748b;font-size:14px;line-height:1.6;margin-bottom:24px;">${message}</p>
        <button onclick="window.location.reload()" style="background:#2563eb;color:white;border:none;padding:12px 28px;border-radius:8px;cursor:pointer;font-weight:bold;font-size:14px;">Reload Page</button>
      </div>
    </div>
  `;
}

try {
  const container = document.getElementById('root');
  if (!container) throw new Error('Root element not found.');
  container.removeAttribute('data-loading');
  const root = createRoot(container);
  if (import.meta.env.DEV) {
    root.render(createElement(StrictMode, null, createElement(App)));
  } else {
    root.render(createElement(App));
  }
} catch (err) {
  const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
  console.error('[Texly Boot Error]', err);
  showFatalError(message);
}
