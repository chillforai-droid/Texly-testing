/**
 * AiBar.tsx
 * AI modification bar - Groq API (Free & Fast)
 * Model: llama-3.3-70b-versatile (coding के लिए best, free tier available)
 */

import React, { useState, useRef } from 'react';

interface AiBarProps {
  onModify: (prompt: string) => void;
  loading: boolean;
  status: string;
  disabled: boolean;
}

const SUGGESTIONS = [
  'Add TypeScript types',
  'Add error handling',
  'Optimize performance',
  'Add dark mode support',
  'Add comments',
  'Refactor to hooks',
  'Add loading state',
  'Make responsive',
  'Fix bugs',
  'Add prop validation',
];

export function AiBar({ onModify, loading, status, disabled }: AiBarProps) {
  const [prompt, setPrompt] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    const trimmed = prompt.trim();
    if (!trimmed || loading || disabled) return;
    onModify(trimmed);
    setPrompt('');
    setShowSuggestions(false);
  };

  return (
    <div className="border-t border-[#3c3c3c] bg-[#252526] flex-shrink-0">
      {showSuggestions && !disabled && (
        <div className="flex flex-wrap gap-1 px-3 py-1.5 border-b border-[#3c3c3c]">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => {
                setPrompt(s);
                setShowSuggestions(false);
                inputRef.current?.focus();
              }}
              className="px-2 py-0.5 text-[10px] bg-[#3c3c3c] hover:bg-[#4c4c4c] text-[#ccc] rounded transition-colors"
              style={{ minHeight: 'unset', minWidth: 'unset' }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 px-3 py-2">
        <div className="flex items-center gap-1 flex-shrink-0">
          <span className="text-[10px] px-1.5 py-0.5 bg-[#f97316]/20 text-[#f97316] rounded font-semibold border border-[#f97316]/30">
            AI
          </span>
          <span className="text-[10px] text-[#666]">Groq · Llama3.3</span>
        </div>

        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            placeholder={disabled ? 'File open करें फिर AI modify करें...' : 'AI से code modify करें — e.g. "Add dark mode toggle"...'}
            disabled={disabled || loading}
            className="w-full bg-[#3c3c3c] text-[#ccc] text-[12px] px-3 py-1.5 rounded border border-[#555] outline-none focus:border-[#f97316] placeholder-[#555] disabled:opacity-40 transition-colors"
            style={{ fontFamily: '"JetBrains Mono", monospace' }}
          />
        </div>

        {status && (
          <span className="text-[11px] text-[#f97316] flex-shrink-0 max-w-[120px] truncate">{status}</span>
        )}

        <button
          onClick={handleSubmit}
          disabled={disabled || loading || !prompt.trim()}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f97316] hover:bg-[#ea6c0a] disabled:bg-[#3c3c3c] disabled:text-[#555] text-white text-[11px] rounded transition-colors flex-shrink-0"
          style={{ minHeight: 'unset', minWidth: 'unset' }}
        >
          {loading ? (
            <>
              <span className="animate-spin inline-block">⟳</span>
              <span>Thinking...</span>
            </>
          ) : (
            <>
              <span>⚡</span>
              <span>Modify</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
