import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  Copy, Check, Download, Trash2, ChevronDown, ChevronUp,
  Zap, Eye, Columns, BarChart2, RefreshCw, Wand2, Info
} from 'lucide-react';

interface TextCleaningWorkspaceProps {
  toolId: string;
  process: (input: string, options?: any) => string;
  example?: string;
  placeholder?: string;
}

const TOOL_OPTIONS: Record<string, {
  label: string;
  key: string;
  defaultValue: boolean;
  description: string;
}[]> = {
  'text-cleaner': [
    { label: 'Remove HTML Tags', key: 'removeHtml', defaultValue: true, description: 'Strip <b>, <p>, <div> and all HTML' },
    { label: 'Remove Extra Spaces', key: 'removeExtraSpaces', defaultValue: true, description: 'Collapse multiple spaces to one' },
    { label: 'Remove Empty Lines', key: 'removeEmptyLines', defaultValue: true, description: 'Delete blank/empty lines' },
    { label: 'Remove Line Breaks', key: 'removeLineBreaks', defaultValue: false, description: 'Merge all lines into one paragraph' },
    { label: 'Remove Numbers', key: 'removeNumbers', defaultValue: false, description: 'Strip all digits (0-9)' },
    { label: 'Remove Punctuation', key: 'removePunctuation', defaultValue: false, description: 'Strip commas, periods, symbols' },
  ],
};

// Diff calculation
function computeDiff(before: string, after: string) {
  const removedChars = before.length - after.length;
  const removedLines = before.split('\n').length - after.split('\n').length;
  const removedWords = before.trim().split(/\s+/).length - (after.trim() ? after.trim().split(/\s+/).length : 0);
  return { removedChars, removedLines, removedWords };
}

type ViewMode = 'split' | 'preview' | 'diff';

const TextCleaningWorkspace: React.FC<TextCleaningWorkspaceProps> = ({
  toolId,
  process,
  example,
  placeholder = 'Paste your text here...',
}) => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [options, setOptions] = useState<Record<string, boolean>>(() => {
    const toolOpts = TOOL_OPTIONS[toolId] || [];
    return Object.fromEntries(toolOpts.map(o => [o.key, o.defaultValue]));
  });
  const [hasRun, setHasRun] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const toolOptions = TOOL_OPTIONS[toolId] || [];
  const hasOptions = toolOptions.length > 0;

  // Live preview for simple tools (non-text-cleaner)
  useEffect(() => {
    if (toolId !== 'text-cleaner' && input) {
      try {
        const result = process(input, options);
        if (typeof result === 'string') {
          setOutput(result);
          setHasRun(true);
        }
      } catch (e) {}
    }
  }, [input, toolId, process, options]);

  const handleRun = useCallback(() => {
    if (!input) return;
    setIsAnimating(true);
    setTimeout(() => {
      try {
        const result = process(input, options);
        setOutput(typeof result === 'string' ? result : '');
        setHasRun(true);
      } catch (e) {
        setOutput('Error processing text. Please try again.');
      }
      setIsAnimating(false);
    }, 120);
  }, [input, process, options]);

  const handleCopy = useCallback(async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [output]);

  const handleDownload = useCallback(() => {
    if (!output) return;
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cleaned-text.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [output]);

  const handleClear = () => {
    setInput('');
    setOutput('');
    setHasRun(false);
  };

  const handleLoadExample = () => {
    if (example) setInput(example);
  };

  const inputStats = useMemo(() => ({
    chars: input.length,
    words: input.trim() ? input.trim().split(/\s+/).length : 0,
    lines: input ? input.split('\n').length : 0,
  }), [input]);

  const outputStats = useMemo(() => ({
    chars: output.length,
    words: output.trim() ? output.trim().split(/\s+/).length : 0,
    lines: output ? output.split('\n').length : 0,
  }), [output]);

  const diff = useMemo(() => computeDiff(input, output), [input, output]);

  // Inline diff highlighting
  const renderDiff = () => {
    if (!input || !output) return null;
    const inputLines = input.split('\n');
    const outputLines = output.split('\n');
    return (
      <div className="font-mono text-sm leading-relaxed space-y-0.5">
        {inputLines.map((line, i) => {
          const outLine = outputLines[i];
          if (line === outLine) {
            return <div key={i} className="text-slate-600 dark:text-slate-400">{line || '\u00A0'}</div>;
          } else if (outLine === undefined) {
            return <div key={i} className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 line-through px-1 rounded">{line || '\u00A0'}</div>;
          } else {
            return (
              <div key={i}>
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 line-through px-1 rounded">{line}</div>
                <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 px-1 rounded">{outLine}</div>
              </div>
            );
          }
        })}
      </div>
    );
  };

  const isTextCleaner = toolId === 'text-cleaner';

  return (
    <div className="space-y-5">
      {/* View Mode Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/60 rounded-xl p-1">
          {([['split', 'Split View', Columns], ['preview', 'Output Only', Eye], ['diff', 'Diff View', BarChart2]] as [ViewMode, string, any][]).map(([mode, label, Icon]) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === mode
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <Icon size={13} />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {example && (
            <button
              onClick={handleLoadExample}
              className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:opacity-75 transition-opacity uppercase tracking-wider"
            >
              <Zap size={12} />
              Example
            </button>
          )}
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors uppercase tracking-wider"
          >
            <Trash2 size={12} />
            Clear
          </button>
        </div>
      </div>

      {/* Options Panel for text-cleaner */}
      {hasOptions && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border border-blue-100 dark:border-blue-800/30 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Wand2 size={14} className="text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-black text-blue-700 dark:text-blue-400 uppercase tracking-widest">Cleaning Options</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {toolOptions.map(opt => (
              <label
                key={opt.key}
                className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                  options[opt.key]
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-blue-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={!!options[opt.key]}
                  onChange={e => setOptions(prev => ({ ...prev, [opt.key]: e.target.checked }))}
                  className="sr-only"
                />
                <div className={`w-4 h-4 mt-0.5 rounded flex-shrink-0 flex items-center justify-center border-2 transition-all ${
                  options[opt.key] ? 'bg-white border-white' : 'border-current'
                }`}>
                  {options[opt.key] && <Check size={10} className="text-blue-600" strokeWidth={3} />}
                </div>
                <div>
                  <div className="text-xs font-bold leading-tight">{opt.label}</div>
                  <div className={`text-[10px] mt-0.5 leading-tight ${options[opt.key] ? 'text-blue-100' : 'text-slate-400 dark:text-slate-500'}`}>
                    {opt.description}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Main Editor Area */}
      {viewMode === 'split' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Input</span>
              <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                <span>{inputStats.chars}c</span>
                <span>{inputStats.words}w</span>
                <span>{inputStats.lines}L</span>
              </div>
            </div>
            <div className="relative">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={placeholder}
                className="w-full h-52 sm:h-64 p-4 bg-white dark:bg-slate-900/80 border-2 border-slate-200 dark:border-slate-700 rounded-2xl font-mono text-sm text-slate-700 dark:text-slate-300 resize-none focus:border-blue-400 dark:focus:border-blue-500 focus:ring-0 outline-none transition-colors leading-relaxed shadow-sm"
              />
              {!input && (
                <div className="absolute bottom-4 right-4 text-[10px] text-slate-300 dark:text-slate-600 font-mono">
                  paste or type
                </div>
              )}
            </div>
          </div>

          {/* Output */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Output</span>
              <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                {hasRun && output && (
                  <>
                    <span>{outputStats.chars}c</span>
                    <span>{outputStats.words}w</span>
                    <span>{outputStats.lines}L</span>
                  </>
                )}
              </div>
            </div>
            <div
              className={`w-full h-52 sm:h-64 p-4 bg-slate-50 dark:bg-slate-950 border-2 rounded-2xl font-mono text-sm leading-relaxed overflow-auto transition-all ${
                hasRun && output
                  ? 'border-emerald-200 dark:border-emerald-800/50 text-slate-800 dark:text-slate-200'
                  : 'border-slate-100 dark:border-slate-800 text-slate-300 dark:text-slate-600'
              }`}
            >
              {isAnimating ? (
                <div className="flex items-center justify-center h-full gap-2 text-blue-500">
                  <RefreshCw size={16} className="animate-spin" />
                  <span className="text-xs font-bold">Processing...</span>
                </div>
              ) : hasRun && output ? (
                <pre className="whitespace-pre-wrap break-words">{output}</pre>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <span className="text-xs font-mono">
                    {isTextCleaner ? 'Configure options & click Clean' : 'Result appears here instantly'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {viewMode === 'preview' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Cleaned Output</span>
          </div>
          <div className="w-full min-h-48 p-6 bg-white dark:bg-slate-900 border-2 border-emerald-200 dark:border-emerald-800/50 rounded-2xl text-slate-800 dark:text-slate-200 text-base leading-relaxed shadow-sm">
            {output ? <p className="whitespace-pre-wrap">{output}</p> : (
              <p className="text-slate-300 dark:text-slate-600 text-sm font-mono">Cleaned text will appear here...</p>
            )}
          </div>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={placeholder}
            className="w-full h-32 p-4 bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-700 rounded-2xl font-mono text-sm text-slate-700 dark:text-slate-300 resize-none focus:border-blue-400 dark:focus:border-blue-500 focus:ring-0 outline-none transition-colors leading-relaxed"
          />
        </div>
      )}

      {viewMode === 'diff' && (
        <div className="space-y-2">
          <div className="flex items-center gap-3 px-1">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-red-100 dark:bg-red-900/40 border border-red-300 dark:border-red-700" />
              <span className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">Removed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-emerald-100 dark:bg-emerald-900/40 border border-emerald-300 dark:border-emerald-700" />
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Kept</span>
            </div>
          </div>
          <div className="w-full min-h-48 p-5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl overflow-auto">
            {hasRun && input ? renderDiff() : (
              <p className="text-slate-300 dark:text-slate-600 text-sm font-mono">Run the tool to see diff...</p>
            )}
          </div>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={placeholder}
            className="w-full h-32 p-4 bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-700 rounded-2xl font-mono text-sm text-slate-700 dark:text-slate-300 resize-none focus:border-blue-400 dark:focus:border-blue-500 focus:ring-0 outline-none transition-colors"
          />
        </div>
      )}

      {/* Stats Bar */}
      {hasRun && output && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Chars Removed', value: Math.max(0, diff.removedChars), color: 'rose', icon: '✂' },
            { label: 'Words Kept', value: outputStats.words, color: 'blue', icon: '📝' },
            { label: 'Size Reduced', value: input.length > 0 ? `${Math.round((diff.removedChars / input.length) * 100)}%` : '0%', color: 'emerald', icon: '📉' },
          ].map(stat => (
            <div
              key={stat.label}
              className={`p-3 sm:p-4 bg-${stat.color}-50 dark:bg-${stat.color}-900/10 border border-${stat.color}-100 dark:border-${stat.color}-800/30 rounded-2xl text-center`}
            >
              <div className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white">{stat.value}</div>
              <div className={`text-[10px] font-black text-${stat.color}-600 dark:text-${stat.color}-400 uppercase tracking-widest mt-0.5`}>{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Action Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {isTextCleaner && (
          <button
            onClick={handleRun}
            disabled={!input || isAnimating}
            className="flex-1 flex items-center justify-center gap-2.5 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
          >
            {isAnimating ? <RefreshCw size={16} className="animate-spin" /> : <Wand2 size={16} />}
            {isAnimating ? 'Cleaning...' : 'Deep Clean Text'}
          </button>
        )}

        {hasRun && output && (
          <>
            <button
              onClick={handleCopy}
              className={`flex items-center justify-center gap-2 py-4 px-6 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${
                copied
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                  : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 shadow-lg shadow-slate-900/20 dark:shadow-white/10'
              }`}
            >
              {copied ? <Check size={15} /> : <Copy size={15} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center justify-center gap-2 py-4 px-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
            >
              <Download size={15} />
              Download
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default TextCleaningWorkspace;
