import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
  Copy, Check, Download, Trash2, Zap, ArrowLeftRight,
  RefreshCw, Wand2, ChevronDown, BarChart2
} from 'lucide-react';

interface TextConverterWorkspaceProps {
  toolId: string;
  process: (input: string, options?: any) => string;
  example?: string;
  placeholder?: string;
  toolName?: string;
}

// ─── Per-tool option configs ──────────────────────────────────────────────────
const TOOL_OPTIONS: Record<string, {
  label: string;
  key: string;
  type: 'select' | 'toggle';
  options?: { value: string; label: string }[];
  defaultValue: string | boolean;
  description?: string;
}[]> = {
  'military-alphabet-converter': [
    {
      label: 'Direction',
      key: 'mode',
      type: 'select',
      options: [
        { value: 'text-to-nato', label: 'Text → NATO' },
        { value: 'nato-to-text', label: 'NATO → Text' },
      ],
      defaultValue: 'text-to-nato',
    },
  ],
  'nato-phonetic': [
    {
      label: 'Direction',
      key: 'mode',
      type: 'select',
      options: [
        { value: 'text-to-nato', label: 'Text → NATO' },
        { value: 'nato-to-text', label: 'NATO → Text' },
      ],
      defaultValue: 'text-to-nato',
    },
  ],
  'morse-code': [
    {
      label: 'Direction',
      key: 'mode',
      type: 'select',
      options: [
        { value: 'text-to-morse', label: 'Text → Morse' },
        { value: 'morse-to-text', label: 'Morse → Text' },
      ],
      defaultValue: 'text-to-morse',
    },
  ],
  'number-to-words': [
    {
      label: 'Format',
      key: 'format',
      type: 'select',
      options: [
        { value: 'indian', label: 'Indian (Lakh/Crore)' },
        { value: 'international', label: 'International (Million/Billion)' },
      ],
      defaultValue: 'indian',
    },
  ],
  'unit-converter': [
    {
      label: 'From',
      key: 'from',
      type: 'select',
      options: [
        { value: 'km', label: 'Kilometers' },
        { value: 'miles', label: 'Miles' },
        { value: 'kg', label: 'Kilograms' },
        { value: 'lbs', label: 'Pounds' },
        { value: 'c', label: 'Celsius' },
        { value: 'f', label: 'Fahrenheit' },
        { value: 'm', label: 'Meters' },
        { value: 'ft', label: 'Feet' },
      ],
      defaultValue: 'km',
    },
    {
      label: 'To',
      key: 'to',
      type: 'select',
      options: [
        { value: 'miles', label: 'Miles' },
        { value: 'km', label: 'Kilometers' },
        { value: 'lbs', label: 'Pounds' },
        { value: 'kg', label: 'Kilograms' },
        { value: 'f', label: 'Fahrenheit' },
        { value: 'c', label: 'Celsius' },
        { value: 'ft', label: 'Feet' },
        { value: 'm', label: 'Meters' },
      ],
      defaultValue: 'miles',
    },
  ],
};

// ─── Stat badges ──────────────────────────────────────────────────────────────
function getStats(text: string) {
  return {
    chars: text.length,
    words: text.trim() ? text.trim().split(/\s+/).length : 0,
    lines: text ? text.split('\n').length : 0,
  };
}

// ─── Copy button ──────────────────────────────────────────────────────────────
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      disabled={!text}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
        copied
          ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
      }`}
    >
      {copied ? <Check size={12} strokeWidth={3} /> : <Copy size={12} />}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
const TextConverterWorkspace: React.FC<TextConverterWorkspaceProps> = ({
  toolId,
  process,
  example,
  placeholder = 'Paste or type your text here...',
  toolName,
}) => {
  const toolOptConfig = TOOL_OPTIONS[toolId] || [];
  const [options, setOptions] = useState<Record<string, string | boolean>>(() =>
    Object.fromEntries(toolOptConfig.map(o => [o.key, o.defaultValue]))
  );

  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [flash, setFlash] = useState(false);
  const prevOutput = useRef('');

  // Live conversion (instant for all converter tools)
  useEffect(() => {
    if (!input.trim()) {
      setOutput('');
      setHasRun(false);
      return;
    }
    setIsProcessing(true);
    const timer = setTimeout(() => {
      try {
        const result = process(input, options);
        const str = typeof result === 'string' ? result : String(result);
        setOutput(str);
        if (str !== prevOutput.current) {
          setFlash(true);
          setTimeout(() => setFlash(false), 350);
          prevOutput.current = str;
        }
        setHasRun(true);
      } catch {
        setOutput('⚠ Error processing input. Please check your text.');
      }
      setIsProcessing(false);
    }, 80);
    return () => clearTimeout(timer);
  }, [input, options, process]);

  const handleLoadExample = () => {
    if (example) setInput(example);
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setHasRun(false);
  };

  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${toolId}-output.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const inputStats = useMemo(() => getStats(input), [input]);
  const outputStats = useMemo(() => getStats(output), [output]);

  const reduction = input.length > 0
    ? Math.round(((input.length - output.length) / input.length) * 100)
    : 0;

  return (
    <div className="space-y-4">

      {/* ── Toolbar ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Options (selects) */}
          {toolOptConfig.map(opt => (
            opt.type === 'select' && (
              <div key={opt.key} className="flex items-center gap-1.5">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  {opt.label}
                </label>
                <div className="relative">
                  <select
                    value={String(options[opt.key] ?? opt.defaultValue)}
                    onChange={e => setOptions(prev => ({ ...prev, [opt.key]: e.target.value }))}
                    className="appearance-none pl-3 pr-7 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 focus:border-blue-400 dark:focus:border-blue-500 focus:ring-0 outline-none cursor-pointer"
                  >
                    {opt.options?.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
            )
          ))}
        </div>

        <div className="flex items-center gap-3">
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
            className="flex items-center gap-1.5 text-xs font-bold text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 transition-colors uppercase tracking-wider"
          >
            <Trash2 size={12} />
            Clear
          </button>
        </div>
      </div>

      {/* ── Input / Output split ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Input */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between px-0.5">
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Input</span>
            <div className="flex items-center gap-3 text-[10px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-wider">
              <span>{inputStats.chars} ch</span>
              <span>{inputStats.words} w</span>
              <span>{inputStats.lines} ln</span>
            </div>
          </div>
          <div className="relative flex-1">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={placeholder}
              className="w-full h-56 sm:h-64 p-4 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700/80 rounded-2xl font-mono text-sm text-slate-700 dark:text-slate-300 resize-none focus:border-blue-400 dark:focus:border-blue-500 focus:ring-0 outline-none transition-colors leading-relaxed shadow-sm placeholder:text-slate-300 dark:placeholder:text-slate-600"
            />
            {!input && (
              <div className="absolute bottom-3 right-3 text-[10px] text-slate-200 dark:text-slate-700 font-mono select-none pointer-events-none">
                type or paste
              </div>
            )}
          </div>
        </div>

        {/* Output */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between px-0.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-blue-500 dark:text-blue-400 uppercase tracking-widest">Output</span>
              {isProcessing && (
                <RefreshCw size={10} className="animate-spin text-blue-400" />
              )}
            </div>
            <div className="flex items-center gap-2">
              {hasRun && output && (
                <div className="flex items-center gap-3 text-[10px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-wider">
                  <span>{outputStats.chars} ch</span>
                  <span>{outputStats.words} w</span>
                </div>
              )}
              <CopyButton text={output} />
            </div>
          </div>

          <div
            className={`relative w-full h-56 sm:h-64 p-4 rounded-2xl font-mono text-sm leading-relaxed overflow-auto border-2 transition-all duration-200 ${
              hasRun && output
                ? `bg-slate-50 dark:bg-slate-950 border-blue-100 dark:border-blue-900/40 text-slate-800 dark:text-slate-200 ${flash ? 'bg-blue-50 dark:bg-blue-950/30' : ''}`
                : 'bg-slate-50/50 dark:bg-slate-950/50 border-slate-100 dark:border-slate-800'
            }`}
          >
            {hasRun && output ? (
              <pre className="whitespace-pre-wrap break-words">{output}</pre>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-center">
                <ArrowLeftRight size={20} className="text-slate-200 dark:text-slate-700" />
                <span className="text-xs text-slate-300 dark:text-slate-600 font-mono">
                  Converted output appears here live
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Stats bar ───────────────────────────────────────────────── */}
      {hasRun && output && (
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              label: 'Input Length',
              value: inputStats.chars,
              sub: 'characters',
              color: 'slate',
            },
            {
              label: 'Output Length',
              value: outputStats.chars,
              sub: 'characters',
              color: 'blue',
            },
            {
              label: reduction > 0 ? 'Reduced By' : reduction < 0 ? 'Expanded By' : 'No Change',
              value: `${Math.abs(reduction)}%`,
              sub: reduction > 0 ? 'size reduction' : reduction < 0 ? 'size increase' : '',
              color: reduction > 0 ? 'emerald' : reduction < 0 ? 'amber' : 'slate',
            },
          ].map(stat => (
            <div
              key={stat.label}
              className={`p-3 rounded-2xl text-center bg-${stat.color}-50 dark:bg-${stat.color}-900/10 border border-${stat.color}-100 dark:border-${stat.color}-900/30`}
            >
              <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tabular-nums">
                {stat.value}
              </div>
              <div className={`text-[10px] font-black text-${stat.color}-500 uppercase tracking-widest mt-0.5`}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Action row ──────────────────────────────────────────────── */}
      {hasRun && output && (
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => {
              navigator.clipboard.writeText(output);
            }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 py-3 px-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:shadow-blue-500/35 hover:-translate-y-0.5 active:translate-y-0 transition-all"
          >
            <Copy size={14} />
            Copy Result
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center justify-center gap-2 py-3 px-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-700/70 transition-all shadow-sm"
          >
            <Download size={14} />
            Download
          </button>
        </div>
      )}
    </div>
  );
};

export default TextConverterWorkspace;
