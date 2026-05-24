/**
 * StatusBar.tsx
 * ─────────────────────────────────────────────
 * VS Code-style bottom status bar
 */

import React from 'react';

interface StatusBarProps {
  branch: string;
  activeFile: string;
  language: string;
  changes: number;
  aiStatus: string;
}

export function StatusBar({ branch, activeFile, language, changes, aiStatus }: StatusBarProps) {
  return (
    <div
      className="flex items-center h-6 px-3 gap-4 flex-shrink-0 text-[11px]"
      style={{ background: '#007acc', color: 'rgba(255,255,255,0.9)' }}
    >
      {/* Left side */}
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1">
          <span>⎇</span>
          <span>{branch}</span>
        </span>
        {changes > 0 && (
          <span className="flex items-center gap-1">
            <span>⊙</span>
            <span>{changes} changes</span>
          </span>
        )}
      </div>

      {/* Center - AI status */}
      <div className="flex-1 text-center">
        {aiStatus && (
          <span className="text-white/90">{aiStatus}</span>
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3 ml-auto">
        {activeFile && (
          <>
            <span>{activeFile}</span>
            <span style={{ textTransform: 'capitalize' }}>{language}</span>
          </>
        )}
        <span className="flex items-center gap-1">
          <span>⚡</span>
          <span>Groq · Llama3.3</span>
        </span>
        <span className="opacity-70 text-[10px]">DevStudio for Texly</span>
      </div>
    </div>
  );
}
