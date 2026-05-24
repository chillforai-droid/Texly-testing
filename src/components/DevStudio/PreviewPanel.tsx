/**
 * PreviewPanel.tsx
 * ─────────────────────────────────────────────
 * Live preview panel using iframe sandbox
 * For static HTML projects: blob URL
 * For React/Vite: connect to Render dev server
 */

import React, { useState } from 'react';

interface PreviewPanelProps {
  previewUrl: string | null;
  onBuild: () => void;
  allFiles: Record<string, string>;
  onUpload: () => void;
}

const FRAMEWORKS = [
  { name: 'React + Vite', icon: '⚛', color: '#61dafb' },
  { name: 'Next.js', icon: '▲', color: '#fff' },
  { name: 'Vue 3', icon: '🍃', color: '#42b883' },
  { name: 'Static HTML', icon: '🌐', color: '#e34c26' },
  { name: 'Nuxt', icon: '💚', color: '#00dc82' },
  { name: 'SvelteKit', icon: '🔥', color: '#ff3e00' },
];

export function PreviewPanel({ previewUrl, onBuild, allFiles, onUpload }: PreviewPanelProps) {
  const [renderUrl, setRenderUrl] = useState('');
  const [activeUrl, setActiveUrl] = useState<string | null>(previewUrl);
  const [refreshKey, setRefreshKey] = useState(0);

  const hasFiles = Object.keys(allFiles).length > 0;
  const hasHtml = Object.keys(allFiles).some(
    (k) => k.endsWith('index.html') && !k.includes('node_modules')
  );

  const connectRender = () => {
    const url = renderUrl.trim();
    if (!url) return;
    setActiveUrl(url.startsWith('http') ? url : `https://${url}`);
  };

  const currentUrl = activeUrl || previewUrl;

  return (
    <div className="flex flex-col h-full">
      {/* URL bar */}
      <div className="flex items-center gap-1.5 p-2 border-b border-[#3c3c3c] bg-[#252526]">
        <div className="flex-1 bg-[#3c3c3c] text-[#ccc] text-[11px] px-2 py-1 rounded border border-[#555] truncate font-mono">
          {currentUrl ? currentUrl.slice(0, 40) + (currentUrl.length > 40 ? '...' : '') : 'No preview'}
        </div>
        <button
          onClick={() => setRefreshKey((k) => k + 1)}
          disabled={!currentUrl}
          className="text-[#888] hover:text-[#ccc] text-[12px] disabled:opacity-40"
          style={{ minHeight: 'unset', minWidth: 'unset' }}
          title="Refresh"
        >
          ⟳
        </button>
        {currentUrl && (
          <a
            href={currentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#888] hover:text-[#ccc] text-[11px]"
            style={{ minHeight: 'unset', minWidth: 'unset' }}
            title="New tab में open करें"
          >
            ↗
          </a>
        )}
      </div>

      {/* Preview iframe or placeholder */}
      {currentUrl ? (
        <iframe
          key={refreshKey}
          src={currentUrl}
          className="flex-1 w-full border-none bg-white"
          sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups"
          title="Live Preview"
        />
      ) : (
        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* No project uploaded */}
          {!hasFiles ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-4">
              <div className="text-5xl">📦</div>
              <p className="text-[#888] text-xs">ZIP project upload करें</p>
              <button
                onClick={onUpload}
                className="px-3 py-1.5 bg-[#0e639c] hover:bg-[#1177bb] text-white text-[11px] rounded transition-colors"
                style={{ minHeight: 'unset', minWidth: 'unset' }}
              >
                Upload ZIP
              </button>
            </div>
          ) : (
            <div className="p-3 space-y-3">
              {/* Static preview */}
              {hasHtml && (
                <div>
                  <p className="text-[10px] text-[#888] uppercase tracking-wider mb-1.5">Static Preview</p>
                  <button
                    onClick={onBuild}
                    className="w-full py-1.5 bg-[#1D9E75]/80 hover:bg-[#1D9E75] text-white text-[11px] rounded transition-colors"
                    style={{ minHeight: 'unset', minWidth: 'unset' }}
                  >
                    ▶ index.html Preview खोलें
                  </button>
                </div>
              )}

              {/* Render backend */}
              <div>
                <p className="text-[10px] text-[#888] uppercase tracking-wider mb-1.5">Render Backend Connect</p>
                <div className="flex gap-1">
                  <input
                    type="text"
                    value={renderUrl}
                    onChange={(e) => setRenderUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && connectRender()}
                    placeholder="https://your-app.onrender.com"
                    className="flex-1 bg-[#3c3c3c] text-[#ccc] text-[11px] px-2 py-1.5 rounded border border-[#555] outline-none focus:border-[#007acc] placeholder-[#555]"
                  />
                  <button
                    onClick={connectRender}
                    className="px-2 py-1.5 bg-[#0e639c] hover:bg-[#1177bb] text-white text-[11px] rounded transition-colors"
                    style={{ minHeight: 'unset', minWidth: 'unset' }}
                  >
                    ⇒
                  </button>
                </div>
                <p className="text-[#555] text-[10px] mt-1">Render पर deploy करके URL paste करें</p>
              </div>

              {/* Supported frameworks */}
              <div>
                <p className="text-[10px] text-[#888] uppercase tracking-wider mb-1.5">Supported Frameworks</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {FRAMEWORKS.map((f) => (
                    <div
                      key={f.name}
                      className="flex items-center gap-1.5 px-2 py-1.5 rounded border border-[#3c3c3c] bg-[#252526]"
                    >
                      <span className="text-[13px]">{f.icon}</span>
                      <span className="text-[10px]" style={{ color: f.color }}>{f.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
