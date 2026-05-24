/**
 * EditorTabs.tsx
 * ─────────────────────────────────────────────
 * Tab bar for open files in Monaco Editor
 */

import React, { useRef, useEffect } from 'react';
import type { OpenTab } from './DevStudioPage';

function getFileColor(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  const map: Record<string, string> = {
    tsx: '#4ec9b0', ts: '#4ec9b0', jsx: '#f0db4f', js: '#f0db4f',
    css: '#a78bfa', scss: '#a78bfa', html: '#e34c26', json: '#fbbf24',
    md: '#94a3b8', py: '#4ade80',
  };
  return map[ext] ?? '#9ca3af';
}

function getIcon(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  const map: Record<string, string> = {
    tsx: '⚛', ts: '🔷', jsx: '⚛', js: '🟨', css: '🎨', scss: '🎨',
    html: '🌐', json: '📋', md: '📝', sql: '🗃', py: '🐍', sh: '⚙',
  };
  return map[ext] ?? '📄';
}

interface EditorTabsProps {
  tabs: OpenTab[];
  activeTab: string;
  onTabClick: (path: string) => void;
  onTabClose: (path: string) => void;
}

export function EditorTabs({ tabs, activeTab, onTabClick, onTabClose }: EditorTabsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll active tab into view
  useEffect(() => {
    const activeEl = scrollRef.current?.querySelector('[data-active="true"]') as HTMLElement;
    if (activeEl) {
      activeEl.scrollIntoView({ inline: 'nearest', behavior: 'smooth' });
    }
  }, [activeTab]);

  if (tabs.length === 0) {
    return (
      <div className="h-9 bg-[#252526] border-b border-[#3c3c3c] flex items-center px-3">
        <span className="text-[#555] text-xs">No files open</span>
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      className="flex h-9 bg-[#252526] border-b border-[#3c3c3c] overflow-x-auto flex-shrink-0"
      style={{ scrollbarWidth: 'none' }}
    >
      {tabs.map((tab) => {
        const isActive = tab.path === activeTab;
        return (
          <div
            key={tab.path}
            data-active={isActive}
            onClick={() => onTabClick(tab.path)}
            className={`flex items-center gap-1.5 px-3 h-full flex-shrink-0 cursor-pointer border-r border-[#3c3c3c] transition-colors group ${
              isActive
                ? 'bg-[#1e1e1e] border-t-2 border-t-[#007acc]'
                : 'bg-[#2d2d2d] hover:bg-[#333] border-t-2 border-t-transparent'
            }`}
            style={{ maxWidth: 180, minWidth: 80 }}
          >
            <span className="text-[11px]" style={{ color: getFileColor(tab.name) }}>
              {getIcon(tab.name)}
            </span>
            <span
              className="text-[12px] truncate"
              style={{ color: isActive ? '#fff' : '#9d9d9d' }}
            >
              {tab.name}
            </span>
            {tab.modified && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#007acc] flex-shrink-0" title="Unsaved" />
            )}
            <button
              onClick={(e) => { e.stopPropagation(); onTabClose(tab.path); }}
              className="opacity-0 group-hover:opacity-100 text-[#858585] hover:text-[#ccc] text-[10px] ml-0.5 leading-none flex-shrink-0 transition-opacity"
              style={{ minHeight: 'unset', minWidth: 'unset' }}
              title="Close"
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}
