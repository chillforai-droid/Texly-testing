import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Copy, Check, Download, Trash2, Play, RefreshCw, Zap,
  ArrowRight, Shuffle, List, Search, SortAsc, SortDesc,
  AlignLeft, Repeat, Type, Hash, Eye, EyeOff, Lock,
  Layers, ChevronDown, Plus, Minus, ExternalLink, Info,
  Sparkles, RotateCcw
} from 'lucide-react';
import { ALL_TOOLS } from '../data/tools';

// ─── Types ────────────────────────────────────────────────────────────────────
interface TextUtilityWorkspaceProps {
  toolId: string;
  process: (input: string, options?: any) => string;
  example?: string;
  placeholder?: string;
  toolName?: string;
}

// ─── Related Tools for internal linking ──────────────────────────────────────
const TOOL_RELATED: Record<string, string[]> = {
  'text-reverser':       ['mirror-text', 'upside-down', 'text-repeater', 'sort-lines'],
  'text-repeater':       ['text-reverser', 'add-prefix', 'lorem-ipsum', 'find-replace'],
  'lorem-ipsum':         ['text-repeater', 'find-replace', 'add-prefix', 'text-to-list'],
  'find-replace':        ['text-reverser', 'sort-lines', 'add-prefix', 'text-to-list'],
  'sort-lines':          ['find-replace', 'text-to-list', 'add-prefix', 'text-reverser'],
  'text-to-list':        ['sort-lines', 'add-prefix', 'find-replace', 'text-repeater'],
  'add-prefix':          ['text-to-list', 'sort-lines', 'find-replace', 'text-repeater'],
  'upside-down':         ['mirror-text', 'fancy-text', 'zalgo-text', 'text-reverser'],
  'mirror-text':         ['upside-down', 'text-reverser', 'fancy-text', 'zalgo-text'],
  'fancy-text':          ['upside-down', 'mirror-text', 'zalgo-text', 'whatsapp-text-formatter'],
  'zalgo-text':          ['fancy-text', 'upside-down', 'mirror-text', 'text-to-ascii-banner'],
  'invisible-text':      ['text-steganography', 'find-replace', 'add-prefix', 'text-repeater'],
  'text-steganography':  ['invisible-text', 'password-gen-strength', 'find-replace', 'text-reverser'],
  'password-gen-strength': ['text-steganography', 'invisible-text', 'random-string', 'find-replace'],
  'random-string':       ['password-gen-strength', 'text-repeater', 'lorem-ipsum', 'add-prefix'],
  'whatsapp-text-formatter': ['fancy-text', 'find-replace', 'text-to-list', 'add-prefix'],
  'yt-timestamp-formatter': ['sort-lines', 'find-replace', 'add-prefix', 'text-to-list'],
  'text-to-ascii-banner': ['fancy-text', 'upside-down', 'zalgo-text', 'mirror-text'],
  'json-formatter':      ['csv-to-json', 'json-to-text', 'text-to-json', 'sql-formatter'],
  'csv-to-json':         ['json-formatter', 'json-to-csv', 'text-to-json', 'sql-formatter'],
  'json-to-csv':         ['csv-to-json', 'json-formatter', 'json-to-text', 'text-to-json'],
  'text-to-json':        ['json-formatter', 'json-to-text', 'csv-to-json', 'sql-formatter'],
  'json-to-text':        ['text-to-json', 'json-formatter', 'csv-to-json', 'sql-formatter'],
  'sql-formatter':       ['json-formatter', 'find-replace', 'text-to-json', 'add-prefix'],
  'sort-lines-reverse':  ['sort-lines', 'text-to-list', 'add-prefix', 'find-replace'],
};

// ─── Stat badges ──────────────────────────────────────────────────────────────
function getStats(text: string) {
  return {
    chars: text.length,
    words: text.trim() ? text.trim().split(/\s+/).length : 0,
    lines: text ? text.split('\n').length : 0,
  };
}

// ─── Copy Button ──────────────────────────────────────────────────────────────
function CopyBtn({ text, className = '' }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const handle = async () => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handle}
      aria-label="Copy to clipboard"
      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
        copied
          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
          : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-700 dark:hover:bg-slate-100 shadow-md'
      } ${className}`}
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}

// ─── Download Button ──────────────────────────────────────────────────────────
function DownloadBtn({ text, filename }: { text: string; filename: string }) {
  const handle = () => {
    if (!text) return;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <button
      onClick={handle}
      aria-label="Download result"
      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition-all"
    >
      <Download className="w-3.5 h-3.5" />
      Download
    </button>
  );
}

// ─── Shared Input/Output Layout ───────────────────────────────────────────────
function IOLayout({
  input, setInput, output, onRun, onClear, onLoadExample,
  loading = false, children, example, placeholder, toolId, filename,
  inputLabel = 'Input', outputLabel = 'Output', runLabel = 'Process',
  autoRun = false,
}: {
  input: string; setInput: (v: string) => void;
  output: string; onRun?: () => void; onClear: () => void;
  onLoadExample?: () => void; loading?: boolean;
  children?: React.ReactNode; example?: string; placeholder?: string;
  toolId: string; filename?: string; inputLabel?: string;
  outputLabel?: string; runLabel?: string; autoRun?: boolean;
}) {
  const stats = getStats(input);
  const outStats = getStats(output);

  return (
    <div className="space-y-6">
      {/* Input */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">{inputLabel}</span>
          <div className="flex items-center gap-3">
            {example && (
              <button
                onClick={onLoadExample}
                className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:opacity-75 transition-opacity uppercase tracking-widest"
              >
                Load Example
              </button>
            )}
            <button
              onClick={onClear}
              className="inline-flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-rose-500 transition-colors uppercase tracking-widest"
            >
              <Trash2 className="w-3 h-3" /> Clear
            </button>
          </div>
        </div>
        <div className="relative">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={placeholder || 'Paste your text here...'}
            className="w-full h-48 sm:h-56 p-4 sm:p-5 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl resize-none font-mono text-sm text-slate-700 dark:text-slate-300 focus:border-violet-400 dark:focus:border-violet-500 focus:outline-none transition-colors leading-relaxed"
          />
          <div className="absolute bottom-3 right-4 flex items-center gap-3 text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest pointer-events-none">
            <span>{stats.chars}c</span>
            <span>{stats.words}w</span>
            <span>{stats.lines}L</span>
          </div>
        </div>
      </div>

      {/* Tool-specific options */}
      {children}

      {/* Run button */}
      {!autoRun && onRun && (
        <button
          onClick={onRun}
          disabled={loading || !input.trim()}
          className="w-full py-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:from-violet-700 hover:to-indigo-700 shadow-xl shadow-violet-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
          {loading ? 'Processing...' : runLabel}
          {!loading && <ArrowRight className="w-4 h-4" />}
        </button>
      )}

      {/* Output */}
      {(output || loading) && (
        <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg flex items-center justify-center">
                <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">{outputLabel}</span>
              {output && (
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-600">
                  ({outStats.chars}c · {outStats.words}w · {outStats.lines}L)
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {output && <DownloadBtn text={output} filename={`${toolId}-result.txt`} />}
              {output && <CopyBtn text={output} />}
            </div>
          </div>
          <pre className="w-full min-h-[120px] max-h-96 overflow-auto p-4 sm:p-5 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl font-mono text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap break-words leading-relaxed">
            {output || 'Processing...'}
          </pre>
        </div>
      )}
    </div>
  );
}

// ─── Related Tools Strip ──────────────────────────────────────────────────────
function RelatedStrip({ toolId }: { toolId: string }) {
  const ids = TOOL_RELATED[toolId] || [];
  const tools = ids.map(id => ALL_TOOLS.find(t => t.id === id)).filter(Boolean);
  if (!tools.length) return null;
  return (
    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
      <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Related Tools</p>
      <div className="flex flex-wrap gap-2">
        {tools.map((t: any) => (
          <Link
            key={t.id}
            to={`/tool/${t.slug}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 hover:border-violet-200 dark:hover:border-violet-800 hover:text-violet-700 dark:hover:text-violet-400 transition-all"
          >
            {t.name.split('–')[0].split('-')[0].trim()}
            <ExternalLink className="w-3 h-3 opacity-50" />
          </Link>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// INDIVIDUAL TOOL UIs
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Text Reverser ────────────────────────────────────────────────────────────
function TextReverserUI({ process, example }: TextUtilityWorkspaceProps) {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'chars' | 'words' | 'lines'>('chars');

  const output = input
    ? mode === 'chars'
      ? input.split('').reverse().join('')
      : mode === 'words'
      ? input.split(/(\s+)/).reverse().join('')
      : input.split('\n').reverse().join('\n')
    : '';

  const modeInfo = {
    chars: { icon: '🔤', label: 'Reverse Characters', desc: 'Flip entire string backwards' },
    words:  { icon: '📝', label: 'Reverse Words',     desc: 'Reverse word order, keep each word intact' },
    lines:  { icon: '📋', label: 'Reverse Lines',     desc: 'Flip line order, keep each line intact' },
  };

  return (
    <div className="space-y-5">
      {/* Mode selector — distinctive orange/amber theme */}
      <div className="p-1 bg-orange-50 dark:bg-orange-950/30 border border-orange-100 dark:border-orange-900/50 rounded-2xl">
        <div className="grid grid-cols-3 gap-1">
          {(['chars', 'words', 'lines'] as const).map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`py-3 px-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                mode === m
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30'
                  : 'text-orange-700 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/30'
              }`}
            >
              <div className="text-base mb-0.5">{modeInfo[m].icon}</div>
              {m}
            </button>
          ))}
        </div>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 px-1">
        <span className="font-bold text-orange-600 dark:text-orange-400">{modeInfo[mode].label}:</span> {modeInfo[mode].desc}
      </p>
      <IOLayout
        input={input} setInput={setInput}
        output={output}
        onClear={() => setInput('')}
        onLoadExample={() => setInput(example || 'Hello World! This is Texly.')}
        toolId="text-reverser"
        placeholder="Type or paste text to reverse..."
        autoRun
      />
    </div>
  );
}

// ─── Text Repeater ────────────────────────────────────────────────────────────
function TextRepeaterUI({ example }: TextUtilityWorkspaceProps) {
  const [input, setInput] = useState('');
  const [count, setCount] = useState(10);
  const [separator, setSeparator] = useState<'newline' | 'comma' | 'space' | 'custom' | 'none'>('newline');
  const [customSep, setCustomSep] = useState('');

  const sepChar = separator === 'newline' ? '\n' : separator === 'comma' ? ', ' : separator === 'space' ? ' ' : separator === 'custom' ? customSep : '';
  const output = input ? new Array(Math.min(count, 1000)).fill(input).join(sepChar) : '';

  const seps = [
    { value: 'newline', label: '↵ New Line' },
    { value: 'comma',   label: ', Comma' },
    { value: 'space',   label: '⎵ Space' },
    { value: 'custom',  label: '✏️ Custom' },
    { value: 'none',    label: '∅ None' },
  ];

  return (
    <div className="space-y-5">
      {/* Teal theme controls */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-teal-600 dark:text-teal-400 uppercase tracking-widest">Repeat Count</label>
          <div className="flex items-center gap-2 p-3 bg-teal-50 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-900/50 rounded-xl">
            <button onClick={() => setCount(Math.max(1, count - 1))} className="w-7 h-7 flex items-center justify-center rounded-lg bg-white dark:bg-slate-800 border border-teal-200 dark:border-teal-800 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/30 font-black transition-colors">
              <Minus className="w-3.5 h-3.5" />
            </button>
            <input
              type="number"
              value={count}
              onChange={e => setCount(Math.max(1, Math.min(1000, parseInt(e.target.value) || 1)))}
              className="flex-1 text-center font-black text-lg text-slate-800 dark:text-white bg-transparent outline-none"
            />
            <button onClick={() => setCount(Math.min(1000, count + 1))} className="w-7 h-7 flex items-center justify-center rounded-lg bg-white dark:bg-slate-800 border border-teal-200 dark:border-teal-800 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/30 font-black transition-colors">
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex gap-1">
            {[5, 10, 50, 100, 500].map(n => (
              <button key={n} onClick={() => setCount(n)}
                className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-colors ${count === n ? 'bg-teal-500 text-white' : 'bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-400 hover:bg-teal-100 dark:hover:bg-teal-900/40'}`}>
                ×{n}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-teal-600 dark:text-teal-400 uppercase tracking-widest">Separator</label>
          <div className="grid grid-cols-1 gap-1">
            {seps.map(s => (
              <button
                key={s.value}
                onClick={() => setSeparator(s.value as any)}
                className={`py-1.5 text-xs font-bold rounded-xl transition-all text-left px-3 ${
                  separator === s.value
                    ? 'bg-teal-500 text-white'
                    : 'bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-400 hover:bg-teal-100 dark:hover:bg-teal-900/40'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
          {separator === 'custom' && (
            <input
              value={customSep}
              onChange={e => setCustomSep(e.target.value)}
              placeholder="e.g.  |  or  ---"
              className="w-full p-2 text-xs font-mono bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 rounded-xl text-slate-700 dark:text-slate-300 outline-none focus:border-teal-400"
            />
          )}
        </div>
      </div>
      {output && (
        <div className="flex items-center gap-2 px-3 py-2 bg-teal-50 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-900/50 rounded-xl">
          <Zap className="w-3.5 h-3.5 text-teal-500" />
          <span className="text-xs text-teal-700 dark:text-teal-400 font-bold">
            {count} repetitions · {output.length.toLocaleString()} total characters
          </span>
        </div>
      )}
      <IOLayout
        input={input} setInput={setInput}
        output={output}
        onClear={() => setInput('')}
        onLoadExample={() => setInput(example || 'Hello!')}
        toolId="text-repeater"
        placeholder="Type text to repeat..."
        autoRun
      />
    </div>
  );
}

// ─── Lorem Ipsum ──────────────────────────────────────────────────────────────
const LOREM_WORDS = 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum'.split(' ');

function generateLorem(type: 'paragraphs' | 'sentences' | 'words', count: number): string {
  const randomWord = () => LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)];
  const sentence = () => {
    const len = 8 + Math.floor(Math.random() * 10);
    const words = Array.from({ length: len }, randomWord);
    words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
    return words.join(' ') + '.';
  };
  const paragraph = () => Array.from({ length: 4 + Math.floor(Math.random() * 4) }, sentence).join(' ');
  if (type === 'words') return Array.from({ length: count }, randomWord).join(' ');
  if (type === 'sentences') return Array.from({ length: count }, sentence).join(' ');
  return Array.from({ length: count }, paragraph).join('\n\n');
}

function LoremIpsumUI() {
  const [type, setType] = useState<'paragraphs' | 'sentences' | 'words'>('paragraphs');
  const [count, setCount] = useState(3);
  const [output, setOutput] = useState('');

  const maxCounts = { paragraphs: 50, sentences: 100, words: 500 };

  return (
    <div className="space-y-5">
      {/* Green theme */}
      <div className="p-1 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 rounded-2xl">
        <div className="grid grid-cols-3 gap-1">
          {(['paragraphs', 'sentences', 'words'] as const).map(t => (
            <button
              key={t}
              onClick={() => { setType(t); setCount(t === 'words' ? 50 : 3); }}
              className={`py-3 rounded-xl text-xs font-black uppercase tracking-widest capitalize transition-all ${
                type === t ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30' : 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30'
              }`}
            >
              {t === 'paragraphs' ? '¶ Paragraphs' : t === 'sentences' ? '— Sentences' : '📝 Words'}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-4 p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-100 dark:border-emerald-900/50">
        <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400 capitalize">Number of {type}:</span>
        <div className="flex items-center gap-2 ml-auto">
          <button onClick={() => setCount(Math.max(1, count - 1))} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800 font-black text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors">-</button>
          <input
            type="number"
            value={count}
            onChange={e => setCount(Math.max(1, Math.min(maxCounts[type], parseInt(e.target.value) || 1)))}
            className="w-16 text-center font-black text-lg text-slate-800 dark:text-white bg-transparent outline-none"
          />
          <button onClick={() => setCount(Math.min(maxCounts[type], count + 1))} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800 font-black text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors">+</button>
        </div>
        <span className="text-xs text-emerald-400 dark:text-emerald-600">max {maxCounts[type]}</span>
      </div>
      <div className="flex gap-2">
        {(type === 'paragraphs' ? [1,3,5,10] : type === 'sentences' ? [5,10,20,50] : [20,50,100,200]).map(n => (
          <button key={n} onClick={() => setCount(n)}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-colors ${count === n ? 'bg-emerald-500 text-white' : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40'}`}>
            {n}
          </button>
        ))}
      </div>
      <button
        onClick={() => setOutput(generateLorem(type, count))}
        className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:from-emerald-600 hover:to-teal-600 shadow-xl shadow-emerald-500/20 transition-all active:scale-[0.98]"
      >
        <Sparkles className="w-4 h-4" /> Generate Lorem Ipsum <ArrowRight className="w-4 h-4" />
      </button>
      {output && (
        <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Generated Text</span>
              <span className="text-[10px] text-slate-400">({output.split(/\s+/).length} words)</span>
            </div>
            <div className="flex items-center gap-2">
              <DownloadBtn text={output} filename="lorem-ipsum.txt" />
              <CopyBtn text={output} />
            </div>
          </div>
          <pre className="w-full max-h-80 overflow-auto p-5 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl font-mono text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap break-words leading-relaxed">
            {output}
          </pre>
        </div>
      )}
    </div>
  );
}

// ─── Find & Replace ───────────────────────────────────────────────────────────
function FindReplaceUI({ example }: TextUtilityWorkspaceProps) {
  const [input, setInput] = useState('');
  const [pairs, setPairs] = useState([{ find: '', replace: '' }]);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);
  const [useRegex, setUseRegex] = useState(false);
  const [output, setOutput] = useState('');
  const [replaceCount, setReplaceCount] = useState(0);

  const handleRun = () => {
    let result = input;
    let total = 0;
    for (const { find, replace } of pairs) {
      if (!find) continue;
      try {
        let pattern: string;
        if (useRegex) {
          pattern = find;
        } else {
          const escaped = find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          pattern = wholeWord ? `\\b${escaped}\\b` : escaped;
        }
        const flags = caseSensitive ? 'g' : 'gi';
        const regex = new RegExp(pattern, flags);
        const matches = result.match(regex);
        total += matches ? matches.length : 0;
        result = result.replace(regex, replace);
      } catch {}
    }
    setOutput(result);
    setReplaceCount(total);
  };

  return (
    <div className="space-y-4">
      {/* Rose/red theme for Find & Replace */}
      <div className="space-y-2">
        {pairs.map((pair, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="flex-1 relative">
              <input
                placeholder="Find..."
                value={pair.find}
                onChange={e => setPairs(p => p.map((x, j) => j === i ? { ...x, find: e.target.value } : x))}
                className="w-full p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-xl text-sm font-mono text-slate-700 dark:text-slate-300 focus:border-rose-400 focus:outline-none transition-colors"
              />
            </div>
            <ArrowRight className="w-4 h-4 shrink-0 text-slate-400" />
            <input
              placeholder="Replace with..."
              value={pair.replace}
              onChange={e => setPairs(p => p.map((x, j) => j === i ? { ...x, replace: e.target.value } : x))}
              className="flex-1 p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 rounded-xl text-sm font-mono text-slate-700 dark:text-slate-300 focus:border-emerald-400 focus:outline-none transition-colors"
            />
            {pairs.length > 1 && (
              <button onClick={() => setPairs(p => p.filter((_, j) => j !== i))}
                className="w-8 h-8 shrink-0 flex items-center justify-center rounded-lg bg-rose-50 dark:bg-rose-900/20 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
        <button
          onClick={() => setPairs(p => [...p, { find: '', replace: '' }])}
          className="w-full py-2 border-2 border-dashed border-rose-200 dark:border-rose-800/50 rounded-xl text-xs font-bold text-rose-400 dark:text-rose-500 hover:border-rose-400 hover:text-rose-600 transition-all flex items-center justify-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" /> Add Another Pair
        </button>
      </div>
      <div className="flex gap-2 flex-wrap">
        {[
          { label: 'Aa Case Sensitive', val: caseSensitive, set: setCaseSensitive },
          { label: '" " Whole Word', val: wholeWord, set: setWholeWord },
          { label: '⚡ Regex Mode', val: useRegex, set: setUseRegex },
        ].map(opt => (
          <button key={opt.label} onClick={() => opt.set(!opt.val)}
            className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${opt.val ? 'bg-rose-500 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
            {opt.label}
          </button>
        ))}
      </div>
      {replaceCount > 0 && output && (
        <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-xl">
          <Check className="w-3.5 h-3.5 text-emerald-500" />
          <span className="text-xs text-emerald-700 dark:text-emerald-400 font-bold">{replaceCount} replacement{replaceCount !== 1 ? 's' : ''} made</span>
        </div>
      )}
      <IOLayout
        input={input} setInput={setInput}
        output={output}
        onRun={handleRun} onClear={() => { setInput(''); setOutput(''); setReplaceCount(0); }}
        onLoadExample={() => setInput(example || 'The quick brown fox jumps over the lazy dog.')}
        toolId="find-replace"
        runLabel="Find & Replace"
        placeholder="Paste text to search and replace in..."
      />
    </div>
  );
}


// ─── Sort Lines ───────────────────────────────────────────────────────────────
function SortLinesUI({ example }: TextUtilityWorkspaceProps) {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'az' | 'za' | 'num-asc' | 'num-desc' | 'length-asc' | 'length-desc' | 'random' | 'reverse'>('az');
  const [removeDupes, setRemoveDupes] = useState(false);
  const [trimLines, setTrimLines] = useState(true);
  const [ignoreCase, setIgnoreCase] = useState(true);

  const output = React.useMemo(() => {
    if (!input) return '';
    let lines = input.split('\n');
    if (trimLines) lines = lines.map(l => l.trim());
    if (removeDupes) {
      const seen = new Set<string>();
      lines = lines.filter(l => {
        const key = ignoreCase ? l.toLowerCase() : l;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    }
    switch (mode) {
      case 'az': lines = [...lines].sort((a, b) => (ignoreCase ? a.toLowerCase() : a).localeCompare(ignoreCase ? b.toLowerCase() : b)); break;
      case 'za': lines = [...lines].sort((a, b) => (ignoreCase ? b.toLowerCase() : b).localeCompare(ignoreCase ? a.toLowerCase() : a)); break;
      case 'num-asc': lines = [...lines].sort((a, b) => parseFloat(a) - parseFloat(b)); break;
      case 'num-desc': lines = [...lines].sort((a, b) => parseFloat(b) - parseFloat(a)); break;
      case 'length-asc': lines = [...lines].sort((a, b) => a.length - b.length); break;
      case 'length-desc': lines = [...lines].sort((a, b) => b.length - a.length); break;
      case 'random': lines = [...lines].sort(() => Math.random() - 0.5); break;
      case 'reverse': lines = [...lines].reverse(); break;
    }
    return lines.join('\n');
  }, [input, mode, removeDupes, trimLines, ignoreCase]);

  const modes = [
    { value: 'az', label: 'A → Z', icon: SortAsc },
    { value: 'za', label: 'Z → A', icon: SortDesc },
    { value: 'num-asc', label: '1 → 9', icon: Hash },
    { value: 'num-desc', label: '9 → 1', icon: Hash },
    { value: 'length-asc', label: 'Short→Long', icon: AlignLeft },
    { value: 'length-desc', label: 'Long→Short', icon: AlignLeft },
    { value: 'random', label: 'Shuffle 🎲', icon: Shuffle },
    { value: 'reverse', label: 'Reverse', icon: RotateCcw },
  ];

  const lineCount = input ? input.split('\n').filter(l => l.trim()).length : 0;

  return (
    <div className="space-y-5">
      {/* Blue theme for Sort */}
      <div className="p-1 bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 rounded-2xl">
        <div className="grid grid-cols-4 gap-1">
          {modes.map(m => (
            <button key={m.value} onClick={() => setMode(m.value as any)}
              className={`py-2.5 px-1 rounded-xl text-xs font-black transition-all flex flex-col items-center gap-1 ${
                mode === m.value ? 'bg-blue-500 text-white shadow-md shadow-blue-500/30' : 'text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30'
              }`}
            >
              <m.icon className="w-3.5 h-3.5" />
              {m.label}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Remove Dupes', val: removeDupes, set: setRemoveDupes },
          { label: 'Trim Lines', val: trimLines, set: setTrimLines },
          { label: 'Ignore Case', val: ignoreCase, set: setIgnoreCase },
        ].map(opt => (
          <button key={opt.label} onClick={() => opt.set(!opt.val)}
            className={`py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${opt.val ? 'bg-blue-500 text-white' : 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30'}`}>
            {opt.label}
          </button>
        ))}
      </div>
      {lineCount > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 rounded-xl">
          <List className="w-3.5 h-3.5 text-blue-500" />
          <span className="text-xs text-blue-700 dark:text-blue-400 font-bold">{lineCount} lines</span>
          {removeDupes && output && <span className="text-xs text-blue-500">· {output.split('\n').filter(l=>l.trim()).length} after deduplication</span>}
        </div>
      )}
      <IOLayout
        input={input} setInput={setInput}
        output={output}
        onClear={() => setInput('')}
        onLoadExample={() => setInput(example || 'Zebra\nApple\nMango\nBanana\nCherry')}
        toolId="sort-lines"
        placeholder="Enter one item per line..."
        autoRun
      />
    </div>
  );
}

// ─── Text to List ─────────────────────────────────────────────────────────────
function TextToListUI({ example }: TextUtilityWorkspaceProps) {
  const [input, setInput] = useState('');
  const [listType, setListType] = useState<'bullet' | 'numbered' | 'comma' | 'pipe' | 'tab' | 'semicolon' | 'html-ul' | 'html-ol' | 'json'>('bullet');
  const [removeDupes, setRemoveDupes] = useState(false);
  const [skipBlanks, setSkipBlanks] = useState(true);
  const [sortAZ, setSortAZ] = useState(false);
  const [trimLines, setTrimLines] = useState(true);

  const output = React.useMemo(() => {
    if (!input) return '';
    let lines = input.split('\n');
    if (trimLines) lines = lines.map(l => l.trim());
    if (skipBlanks) lines = lines.filter(l => l.trim());
    if (removeDupes) lines = [...new Set(lines)];
    if (sortAZ) lines = [...lines].sort((a, b) => a.localeCompare(b));
    switch (listType) {
      case 'bullet': return lines.map(l => `• ${l}`).join('\n');
      case 'numbered': return lines.map((l, i) => `${i + 1}. ${l}`).join('\n');
      case 'comma': return lines.join(', ');
      case 'pipe': return lines.join(' | ');
      case 'tab': return lines.join('\t');
      case 'semicolon': return lines.join('; ');
      case 'html-ul': return `<ul>\n${lines.map(l => `  <li>${l}</li>`).join('\n')}\n</ul>`;
      case 'html-ol': return `<ol>\n${lines.map(l => `  <li>${l}</li>`).join('\n')}\n</ol>`;
      case 'json': return JSON.stringify(lines, null, 2);
      default: return lines.join('\n');
    }
  }, [input, listType, removeDupes, skipBlanks, sortAZ, trimLines]);

  const types = [
    { value: 'bullet',    label: '• Bullet',   },
    { value: 'numbered',  label: '1. Numbered', },
    { value: 'comma',     label: ', Comma',     },
    { value: 'pipe',      label: '| Pipe',      },
    { value: 'semicolon', label: '; Semicolon', },
    { value: 'html-ul',   label: '⟨ul⟩ HTML',  },
    { value: 'html-ol',   label: '⟨ol⟩ HTML',  },
    { value: 'json',      label: '[ ] JSON',    },
  ];

  return (
    <div className="space-y-5">
      {/* Purple theme */}
      <div className="p-1 bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/50 rounded-2xl">
        <div className="grid grid-cols-4 gap-1">
          {types.map(t => (
            <button key={t.value} onClick={() => setListType(t.value as any)}
              className={`py-2.5 px-1 rounded-xl text-xs font-black transition-all ${
                listType === t.value ? 'bg-purple-500 text-white shadow-md shadow-purple-500/30' : 'text-purple-700 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30'
              }`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { label: '✂️ Skip Blanks', val: skipBlanks, set: setSkipBlanks },
          { label: '🔁 Remove Dupes', val: removeDupes, set: setRemoveDupes },
          { label: '↕ Sort A→Z', val: sortAZ, set: setSortAZ },
          { label: '✦ Trim Lines', val: trimLines, set: setTrimLines },
        ].map(opt => (
          <button key={opt.label} onClick={() => opt.set(!opt.val)}
            className={`py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${opt.val ? 'bg-purple-500 text-white' : 'bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30'}`}>
            {opt.label}
          </button>
        ))}
      </div>
      <IOLayout
        input={input} setInput={setInput}
        output={output}
        onClear={() => setInput('')}
        onLoadExample={() => setInput('Apple\nBanana\nCherry\nMango')}
        toolId="text-to-list"
        placeholder="Enter one item per line..."
        autoRun
      />
    </div>
  );
}

// ─── Add Prefix/Suffix ────────────────────────────────────────────────────────
function AddPrefixUI({ example }: TextUtilityWorkspaceProps) {
  const [input, setInput] = useState('');
  const [prefix, setPrefix] = useState('');
  const [suffix, setSuffix] = useState('');
  const [skipBlanks, setSkipBlanks] = useState(true);
  const [trimLines, setTrimLines] = useState(false);

  const output = React.useMemo(() => {
    if (!input) return '';
    return input.split('\n')
      .map(line => {
        const l = trimLines ? line.trim() : line;
        if (skipBlanks && !l.trim()) return l;
        return `${prefix}${l}${suffix}`;
      })
      .join('\n');
  }, [input, prefix, suffix, skipBlanks, trimLines]);

  const presets = [
    { label: '• Bullet',   prefix: '• ',  suffix: ''  },
    { label: '- Dash',     prefix: '- ',  suffix: ''  },
    { label: '"Quotes"',   prefix: '"',   suffix: '"' },
    { label: "'Single'",   prefix: "'",   suffix: "'" },
    { label: '> Blockquote', prefix: '> ', suffix: '' },
    { label: '# Heading',  prefix: '# ',  suffix: ''  },
    { label: ', Comma',    prefix: '',    suffix: ',' },
    { label: '; Semicolon',prefix: '',    suffix: ';' },
    { label: 'SQL val',    prefix: "'",   suffix: "'," },
    { label: '// Comment', prefix: '// ', suffix: ''  },
  ];

  return (
    <div className="space-y-5">
      {/* Indigo theme */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Prefix (Add to Start)</label>
          <input value={prefix} onChange={e => setPrefix(e.target.value)}
            placeholder="e.g. • or > or ..."
            className="w-full p-3 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/50 rounded-xl text-sm font-mono text-slate-700 dark:text-slate-300 focus:border-indigo-400 focus:outline-none transition-colors" />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Suffix (Add to End)</label>
          <input value={suffix} onChange={e => setSuffix(e.target.value)}
            placeholder="e.g. , or ; or ..."
            className="w-full p-3 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/50 rounded-xl text-sm font-mono text-slate-700 dark:text-slate-300 focus:border-indigo-400 focus:outline-none transition-colors" />
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Quick Presets</p>
        <div className="flex flex-wrap gap-2">
          {presets.map(p => (
            <button key={p.label} onClick={() => { setPrefix(p.prefix); setSuffix(p.suffix); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${prefix === p.prefix && suffix === p.suffix ? 'bg-indigo-500 text-white' : 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40'}`}>
              {p.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-2">
        {[
          { label: 'Skip Blank Lines', val: skipBlanks, set: setSkipBlanks },
          { label: 'Trim Lines', val: trimLines, set: setTrimLines },
        ].map(opt => (
          <button key={opt.label} onClick={() => opt.set(!opt.val)}
            className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${opt.val ? 'bg-indigo-500 text-white' : 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/30'}`}>
            {opt.label}
          </button>
        ))}
      </div>
      <IOLayout
        input={input} setInput={setInput}
        output={output}
        onClear={() => setInput('')}
        onLoadExample={() => setInput(example || 'Line 1\nLine 2\nLine 3')}
        toolId="add-prefix"
        placeholder="Enter one item per line..."
        autoRun
      />
    </div>
  );
}

// ─── Random String Generator ──────────────────────────────────────────────────
function RandomStringUI() {
  const [length, setLength] = useState(16);
  const [count, setCount] = useState(1);
  const [useUpper, setUseUpper] = useState(true);
  const [useLower, setUseLower] = useState(true);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useSymbols, setUseSymbols] = useState(false);
  const [output, setOutput] = useState('');

  const generate = () => {
    let chars = '';
    if (useUpper) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (useLower) chars += 'abcdefghijklmnopqrstuvwxyz';
    if (useNumbers) chars += '0123456789';
    if (useSymbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    if (!chars) chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const results = Array.from({ length: count }, () =>
      Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
    );
    setOutput(results.join('\n'));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Length: {length}</label>
          <input type="range" min={4} max={128} value={length} onChange={e => setLength(parseInt(e.target.value))}
            className="w-full accent-violet-600" />
          <div className="flex gap-1">
            {[8, 16, 32, 64].map(n => (
              <button key={n} onClick={() => setLength(n)}
                className="flex-1 py-1 text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg hover:bg-violet-100 dark:hover:bg-violet-900/30 hover:text-violet-700 dark:hover:text-violet-400 transition-colors">
                {n}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Count: {count}</label>
          <input type="range" min={1} max={20} value={count} onChange={e => setCount(parseInt(e.target.value))}
            className="w-full accent-violet-600" />
          <div className="flex gap-1">
            {[1, 5, 10, 20].map(n => (
              <button key={n} onClick={() => setCount(n)}
                className="flex-1 py-1 text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg hover:bg-violet-100 dark:hover:bg-violet-900/30 hover:text-violet-700 dark:hover:text-violet-400 transition-colors">
                ×{n}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: 'A-Z Uppercase', val: useUpper, set: setUseUpper },
          { label: 'a-z Lowercase', val: useLower, set: setUseLower },
          { label: '0-9 Numbers', val: useNumbers, set: setUseNumbers },
          { label: '!@# Symbols', val: useSymbols, set: setUseSymbols },
        ].map(opt => (
          <button key={opt.label} onClick={() => opt.set(!opt.val)}
            className={`py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${opt.val ? 'bg-violet-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
            {opt.label}
          </button>
        ))}
      </div>
      <button onClick={generate}
        className="w-full py-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:from-violet-700 hover:to-indigo-700 shadow-xl shadow-violet-500/20 transition-all active:scale-[0.98]">
        <Shuffle className="w-4 h-4" /> Generate Random String <ArrowRight className="w-4 h-4" />
      </button>
      {output && (
        <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Generated</span>
            <div className="flex items-center gap-2">
              <DownloadBtn text={output} filename="random-strings.txt" />
              <CopyBtn text={output} />
            </div>
          </div>
          <pre className="w-full p-5 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl font-mono text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap break-all">
            {output}
          </pre>
        </div>
      )}
    </div>
  );
}

// ─── Invisible Text ───────────────────────────────────────────────────────────
function InvisibleTextUI() {
  const [count, setCount] = useState(10);
  const [charType, setCharType] = useState<'zwsp' | 'zwnj' | 'zwj' | 'braille' | 'mix'>('zwsp');
  const [output, setOutput] = useState('');

  const charMap = {
    zwsp:    '\u200B',    // Zero-width space
    zwnj:    '\u200C',    // Zero-width non-joiner
    zwj:     '\u200D',    // Zero-width joiner
    braille: '\u2800',   // Braille blank
    mix:     '',         // Mix of all
  };

  const generate = () => {
    if (charType === 'mix') {
      const chars = ['\u200B', '\u200C', '\u200D', '\u2800'];
      setOutput(Array.from({ length: Math.min(count, 500) }, () => chars[Math.floor(Math.random() * chars.length)]).join(''));
    } else {
      setOutput(charMap[charType].repeat(Math.min(count, 500)));
    }
  };

  const charOptions = [
    { value: 'zwsp',    label: 'Zero-Width Space',       desc: 'U+200B · Most compatible', badge: 'bg-slate-700' },
    { value: 'zwnj',    label: 'Zero-Width Non-Joiner',  desc: 'U+200C · Ligature control', badge: 'bg-slate-600' },
    { value: 'zwj',     label: 'Zero-Width Joiner',      desc: 'U+200D · Emoji combiner',   badge: 'bg-slate-500' },
    { value: 'braille', label: 'Braille Blank',          desc: 'U+2800 · Visual blank',      badge: 'bg-slate-400' },
    { value: 'mix',     label: 'Mixed Types',            desc: 'Random combo · Hard to detect', badge: 'bg-violet-600' },
  ];

  return (
    <div className="space-y-5">
      {/* Dark/slate theme for invisible text */}
      <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-2xl flex items-start gap-3">
        <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
        <div className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
          <strong>Invisible characters</strong> are zero-width Unicode characters — present in the text but render with no width. Perfect for social media bios, usernames, and hidden watermarks.
        </div>
      </div>
      <div className="grid grid-cols-1 gap-2">
        {charOptions.map(c => (
          <button key={c.value} onClick={() => setCharType(c.value as any)}
            className={`flex items-center gap-3 p-3 rounded-xl text-left transition-all ${charType === c.value ? 'bg-slate-800 text-white dark:bg-slate-700' : 'bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold text-white ${c.badge}`}>{c.value === 'mix' ? 'MIX' : c.value.toUpperCase()}</span>
            <div>
              <div className="text-xs font-black">{c.label}</div>
              <div className={`text-[10px] mt-0.5 ${charType === c.value ? 'text-slate-400' : 'text-slate-400 dark:text-slate-500'}`}>{c.desc}</div>
            </div>
          </button>
        ))}
      </div>
      <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        <span className="text-sm font-bold text-slate-600 dark:text-slate-400">Count:</span>
        <input type="range" min={1} max={500} value={count} onChange={e => setCount(parseInt(e.target.value))}
          className="flex-1 accent-slate-700" />
        <input type="number" value={count} onChange={e => setCount(Math.max(1, Math.min(500, parseInt(e.target.value) || 1)))}
          className="w-16 p-2 text-center font-black text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-slate-800 dark:text-white" />
      </div>
      <div className="flex gap-2">
        {[1, 5, 10, 50, 100].map(n => (
          <button key={n} onClick={() => setCount(n)}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-colors ${count === n ? 'bg-slate-800 text-white dark:bg-slate-700' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
            {n}
          </button>
        ))}
      </div>
      <button onClick={generate}
        className="w-full py-4 bg-gradient-to-r from-slate-700 to-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:from-slate-800 hover:to-black shadow-xl shadow-slate-500/20 transition-all active:scale-[0.98]">
        <Eye className="w-4 h-4" /> Generate {count} Invisible Character{count !== 1 ? 's' : ''} <ArrowRight className="w-4 h-4" />
      </button>
      {output && (
        <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Invisible Characters Ready</span>
              <p className="text-[10px] text-slate-400 mt-0.5">{count} chars generated · {charType === 'mix' ? 'mixed types' : charMap[charType as keyof typeof charMap].codePointAt(0)?.toString(16).toUpperCase().padStart(4, '0') + ' repeated'}</p>
            </div>
            <CopyBtn text={output} />
          </div>
          <div className="p-5 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl text-center">
            <div className="h-12 flex items-center justify-center">
              <span className="text-slate-300 dark:text-slate-700 text-sm font-mono italic">[{count} invisible chars — copy above ↑]</span>
            </div>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              💡 <strong>Use in:</strong> Instagram/Twitter bio, Discord status, Snapchat name, WhatsApp name, blank social media posts
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── WhatsApp Text Formatter ──────────────────────────────────────────────────
function WhatsAppFormatterUI({ example }: TextUtilityWorkspaceProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Apply format to selected text or entire input
  const applyFormat = (symbol: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = ta.value.substring(start, end);
    if (selected) {
      const newText = ta.value.substring(0, start) + `${symbol}${selected}${symbol}` + ta.value.substring(end);
      setInput(newText);
      // Restore selection
      setTimeout(() => {
        ta.focus();
        ta.setSelectionRange(start + symbol.length, end + symbol.length);
      }, 0);
    } else if (input) {
      setInput(`${symbol}${input}${symbol}`);
    }
  };

  const formats = [
    { label: '*Bold*',      symbol: '*',   desc: 'Bold',          color: 'bg-blue-500 text-white',   idle: 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50' },
    { label: '_Italic_',    symbol: '_',   desc: 'Italic',        color: 'bg-purple-500 text-white',  idle: 'bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-900/50' },
    { label: '~Strike~',    symbol: '~',   desc: 'Strikethrough', color: 'bg-rose-500 text-white',    idle: 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50' },
    { label: '`Mono`',      symbol: '`',   desc: 'Monospace',     color: 'bg-emerald-500 text-white', idle: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50' },
    { label: '```Block```', symbol: '```', desc: 'Code Block',    color: 'bg-slate-700 text-white',   idle: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700' },
  ];

  return (
    <div className="space-y-4">
      {/* Green/WhatsApp theme */}
      <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/50 rounded-xl flex items-start gap-3">
        <Info className="w-4 h-4 shrink-0 mt-0.5 text-green-600 dark:text-green-400" />
        <p className="text-xs text-green-700 dark:text-green-300 leading-relaxed">
          <strong>Select text</strong> in the box below, then click a format button to wrap it. Or click without selection to format the whole message.
        </p>
      </div>
      <div className="grid grid-cols-5 gap-2">
        {formats.map(f => (
          <button
            key={f.symbol}
            onClick={() => applyFormat(f.symbol)}
            className={`p-3 rounded-xl text-center font-bold transition-all hover:scale-105 active:scale-95 ${f.idle}`}
          >
            <div className="text-sm mb-0.5 font-mono">{f.label}</div>
            <div className="text-[9px] uppercase tracking-widest opacity-70">{f.desc}</div>
          </button>
        ))}
      </div>

      {/* Input with ref */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Your Message</span>
          <div className="flex items-center gap-3">
            <button onClick={() => setInput(example || 'Hello! This is my WhatsApp message.')}
              className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:opacity-75 uppercase tracking-widest">
              Load Example
            </button>
            <button onClick={() => setInput('')}
              className="inline-flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-rose-500 transition-colors uppercase tracking-widest">
              <Trash2 className="w-3 h-3" /> Clear
            </button>
          </div>
        </div>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type your WhatsApp message here, then select text and click a format button above..."
          className="w-full h-48 p-4 bg-green-50 dark:bg-green-950/20 border-2 border-green-100 dark:border-green-900/50 rounded-2xl resize-none font-mono text-sm text-slate-700 dark:text-slate-300 focus:border-green-400 focus:outline-none transition-colors leading-relaxed"
        />
      </div>

      {input && (
        <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Formatted Output (Copy to WhatsApp)</span>
            <CopyBtn text={input} />
          </div>
          <div className="p-4 bg-green-50 dark:bg-green-950/20 border-2 border-green-100 dark:border-green-900/50 rounded-2xl font-mono text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap break-words">
            {input}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── YouTube Timestamp Formatter ──────────────────────────────────────────────
function YTTimestampUI({ example }: TextUtilityWorkspaceProps) {
  const [mode, setMode] = useState<'builder' | 'paste'>('builder');
  const [rows, setRows] = useState([
    { time: '0:00', title: 'Intro' },
    { time: '1:30', title: '' },
  ]);
  const [pasteInput, setPasteInput] = useState('');

  const formatTime = (t: string) => {
    const cleaned = t.replace(/[^0-9:]/g, '');
    return cleaned;
  };

  const builderOutput = rows
    .filter(r => r.time.trim() && /^\d{1,2}:\d{2}(:\d{2})?$/.test(r.time.trim()))
    .map(r => `${r.time} ${r.title}`.trim())
    .join('\n');

  const pasteOutput = React.useMemo(() => {
    if (!pasteInput) return '';
    return pasteInput.split('\n')
      .map(line => line.trim())
      .filter(line => /^\d{1,2}:\d{2}/.test(line))
      .map(line => {
        const match = line.match(/^(\d{1,2}:\d{2}(?::\d{2})?)\s*(.*)/);
        if (match) return `${match[1]} ${match[2]}`.trim();
        return line;
      })
      .join('\n');
  }, [pasteInput]);

  const output = mode === 'builder' ? builderOutput : pasteOutput;

  const addRow = () => setRows(r => [...r, { time: '', title: '' }]);
  const removeRow = (i: number) => setRows(r => r.filter((_, j) => j !== i));
  const updateRow = (i: number, field: 'time' | 'title', val: string) =>
    setRows(r => r.map((row, j) => j === i ? { ...row, [field]: field === 'time' ? formatTime(val) : val } : row));

  return (
    <div className="space-y-4">
      {/* Red YouTube theme */}
      <div className="flex gap-2">
        <button onClick={() => setMode('builder')}
          className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${mode === 'builder' ? 'bg-red-500 text-white shadow-md shadow-red-500/30' : 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/50'}`}>
          🔨 Chapter Builder
        </button>
        <button onClick={() => setMode('paste')}
          className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${mode === 'paste' ? 'bg-red-500 text-white shadow-md shadow-red-500/30' : 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/50'}`}>
          📋 Paste & Format
        </button>
      </div>

      {mode === 'builder' ? (
        <div className="space-y-3">
          <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl">
            <p className="text-xs text-red-700 dark:text-red-400">
              ✅ First chapter must start at <strong>0:00</strong> for YouTube chapters to work.
            </p>
          </div>
          <div className="space-y-2">
            {rows.map((row, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  value={row.time}
                  onChange={e => updateRow(i, 'time', e.target.value)}
                  placeholder="0:00"
                  className="w-20 p-2.5 text-center font-mono text-sm bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl text-slate-700 dark:text-slate-300 focus:border-red-400 focus:outline-none"
                />
                <input
                  value={row.title}
                  onChange={e => updateRow(i, 'title', e.target.value)}
                  placeholder={`Chapter ${i + 1} title...`}
                  className="flex-1 p-2.5 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 focus:border-red-400 focus:outline-none"
                />
                {rows.length > 1 && (
                  <button onClick={() => removeRow(i)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 dark:bg-red-950/20 text-red-400 hover:text-red-600 hover:bg-red-100 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button onClick={addRow}
            className="w-full py-2 border-2 border-dashed border-red-200 dark:border-red-800/50 rounded-xl text-xs font-bold text-red-400 hover:border-red-400 hover:text-red-600 transition-all flex items-center justify-center gap-1.5">
            <Plus className="w-3.5 h-3.5" /> Add Chapter
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl flex items-start gap-2">
            <Info className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
            <p className="text-xs text-red-700 dark:text-red-300">
              Paste raw timestamps: <code className="font-mono bg-red-100 dark:bg-red-900/40 px-1 rounded">00:00 Chapter Title</code> — one per line. Invalid lines are removed.
            </p>
          </div>
          <textarea
            value={pasteInput}
            onChange={e => setPasteInput(e.target.value)}
            placeholder={"0:00 Intro\n1:30 Main Topic\n5:00 Demo\n10:00 Conclusion"}
            className="w-full h-40 p-4 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl resize-none font-mono text-sm text-slate-700 dark:text-slate-300 focus:border-red-400 focus:outline-none transition-colors"
          />
          <button onClick={() => setPasteInput('')} className="text-xs font-bold text-slate-400 hover:text-rose-500 flex items-center gap-1">
            <Trash2 className="w-3 h-3" /> Clear
          </button>
        </div>
      )}

      {output && (
        <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">YouTube Description Timestamps</span>
            </div>
            <CopyBtn text={output} />
          </div>
          <pre className="w-full p-5 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl font-mono text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
            {output}
          </pre>
        </div>
      )}
    </div>
  );
}

// ─── Text Steganography ───────────────────────────────────────────────────────
function TextSteganographyUI({ example }: TextUtilityWorkspaceProps) {
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [coverText, setCoverText] = useState('');
  const [secretText, setSecretText] = useState('');
  const [encodeInput, setEncodeInput] = useState('');
  const [output, setOutput] = useState('');

  const handleEncode = () => {
    if (!coverText || !secretText) return;
    const binary = secretText.split('').map(c => c.charCodeAt(0).toString(2).padStart(8, '0')).join('');
    const encoded = binary.split('').map(b => b === '0' ? '\u200C' : '\u200D').join('');
    setOutput(coverText[0] + encoded + coverText.slice(1));
  };

  const handleDecode = () => {
    if (!encodeInput) return;
    const hidden = encodeInput.match(/[\u200C\u200D]+/g);
    if (!hidden) { setOutput('❌ No hidden message found.'); return; }
    const binary = hidden[0].split('').map(c => c === '\u200C' ? '0' : '1').join('');
    const chars = [];
    for (let i = 0; i < binary.length; i += 8) {
      const charCode = parseInt(binary.substr(i, 8), 2);
      if (charCode > 0) chars.push(String.fromCharCode(charCode));
    }
    setOutput(chars.join('') || '❌ Could not decode message.');
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button onClick={() => { setMode('encode'); setOutput(''); }}
          className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${mode === 'encode' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
          <EyeOff className="w-3.5 h-3.5" /> Encode (Hide)
        </button>
        <button onClick={() => { setMode('decode'); setOutput(''); }}
          className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${mode === 'decode' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
          <Eye className="w-3.5 h-3.5" /> Decode (Reveal)
        </button>
      </div>
      {mode === 'encode' ? (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Cover Text (Visible)</label>
            <textarea value={coverText} onChange={e => setCoverText(e.target.value)}
              placeholder="This is normal-looking text that will carry the hidden message..."
              className="w-full h-28 p-4 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl resize-none font-mono text-sm text-slate-700 dark:text-slate-300 focus:border-indigo-400 focus:outline-none transition-colors" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Secret Message (Hidden)</label>
            <textarea value={secretText} onChange={e => setSecretText(e.target.value)}
              placeholder="Your secret message here..."
              className="w-full h-20 p-4 bg-slate-50 dark:bg-slate-950 border-2 border-indigo-200 dark:border-indigo-900 rounded-2xl resize-none font-mono text-sm text-slate-700 dark:text-slate-300 focus:border-indigo-400 focus:outline-none transition-colors" />
          </div>
          <button onClick={handleEncode} disabled={!coverText || !secretText}
            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:from-indigo-700 hover:to-violet-700 shadow-xl shadow-indigo-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
            <Lock className="w-4 h-4" /> Hide Message <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Encoded Text (Paste here)</label>
            <textarea value={encodeInput} onChange={e => setEncodeInput(e.target.value)}
              placeholder="Paste encoded text here to reveal hidden message..."
              className="w-full h-36 p-4 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl resize-none font-mono text-sm text-slate-700 dark:text-slate-300 focus:border-emerald-400 focus:outline-none transition-colors" />
          </div>
          <button onClick={handleDecode} disabled={!encodeInput}
            className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:from-emerald-700 hover:to-teal-700 shadow-xl shadow-emerald-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
            <Eye className="w-4 h-4" /> Reveal Message <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
      {output && (
        <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
              {mode === 'encode' ? 'Encoded Text (Copy & Share)' : 'Revealed Message'}
            </span>
            <CopyBtn text={output} />
          </div>
          <pre className="w-full p-5 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl font-mono text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap break-words">
            {output}
          </pre>
        </div>
      )}
    </div>
  );
}

// ─── Password Generator & Strength ────────────────────────────────────────────
function PasswordUI() {
  const [mode, setMode] = useState<'check' | 'generate'>('check');
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(16);
  const [useUpper, setUseUpper] = useState(true);
  const [useLower, setUseLower] = useState(true);
  const [useNums, setUseNums] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  const [generated, setGenerated] = useState('');

  const strength = React.useMemo(() => {
    if (!password) return null;
    let pool = 0;
    if (/[a-z]/.test(password)) pool += 26;
    if (/[A-Z]/.test(password)) pool += 26;
    if (/[0-9]/.test(password)) pool += 10;
    if (/[^a-zA-Z0-9]/.test(password)) pool += 32;
    const entropy = pool ? Math.log2(Math.pow(pool, password.length)) : 0;
    const level = entropy > 128 ? 'Extremely Strong' : entropy > 80 ? 'Strong' : entropy > 60 ? 'Good' : entropy > 40 ? 'Weak' : 'Very Weak';
    const color = entropy > 80 ? 'emerald' : entropy > 60 ? 'yellow' : entropy > 40 ? 'orange' : 'rose';
    const pct = Math.min(100, (entropy / 128) * 100);
    return { level, color, pct, entropy: entropy.toFixed(1) };
  }, [password]);

  const generate = () => {
    let chars = '';
    if (useUpper) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (useLower) chars += 'abcdefghijklmnopqrstuvwxyz';
    if (useNums) chars += '0123456789';
    if (useSymbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    if (!chars) chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    setGenerated(Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join(''));
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button onClick={() => setMode('check')}
          className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${mode === 'check' ? 'bg-violet-600 text-white shadow-md shadow-violet-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
          Check Strength
        </button>
        <button onClick={() => setMode('generate')}
          className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${mode === 'generate' ? 'bg-violet-600 text-white shadow-md shadow-violet-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
          Generate Password
        </button>
      </div>
      {mode === 'check' ? (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Enter Password to Check</label>
            <input type="text" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Paste or type your password..."
              className="w-full p-4 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl font-mono text-slate-700 dark:text-slate-300 focus:border-violet-400 focus:outline-none transition-colors" />
          </div>
          {strength && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className={`text-lg font-black text-${strength.color}-600 dark:text-${strength.color}-400`}>{strength.level}</span>
                <span className="text-sm font-bold text-slate-500 dark:text-slate-400">{strength.entropy} bits entropy</span>
              </div>
              <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full bg-${strength.color}-500 transition-all duration-500`}
                  style={{ width: `${strength.pct}%` }}
                />
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { check: /[a-z]/.test(password), label: 'Lowercase' },
                  { check: /[A-Z]/.test(password), label: 'Uppercase' },
                  { check: /[0-9]/.test(password), label: 'Numbers' },
                  { check: /[^a-zA-Z0-9]/.test(password), label: 'Symbols' },
                  { check: password.length >= 12, label: '12+ chars' },
                  { check: password.length >= 16, label: '16+ chars' },
                ].map(c => (
                  <div key={c.label} className={`flex items-center gap-2 p-2 rounded-xl ${c.check ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-slate-50 dark:bg-slate-900'}`}>
                    <span className={`text-lg ${c.check ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-600'}`}>{c.check ? '✓' : '×'}</span>
                    <span className={`font-bold ${c.check ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-600'}`}>{c.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Length: {length}</label>
            <input type="range" min={8} max={64} value={length} onChange={e => setLength(parseInt(e.target.value))}
              className="w-full accent-violet-600" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'A-Z Uppercase', val: useUpper, set: setUseUpper },
              { label: 'a-z Lowercase', val: useLower, set: setUseLower },
              { label: '0-9 Numbers', val: useNums, set: setUseNums },
              { label: '!@# Symbols', val: useSymbols, set: setUseSymbols },
            ].map(opt => (
              <button key={opt.label} onClick={() => opt.set(!opt.val)}
                className={`py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${opt.val ? 'bg-violet-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                {opt.label}
              </button>
            ))}
          </div>
          <button onClick={generate}
            className="w-full py-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:from-violet-700 hover:to-indigo-700 shadow-xl shadow-violet-500/20 transition-all active:scale-[0.98]">
            <Lock className="w-4 h-4" /> Generate Password <RefreshCw className="w-4 h-4" />
          </button>
          {generated && (
            <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Generated Password</span>
                <CopyBtn text={generated} />
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl font-mono text-lg text-slate-800 dark:text-slate-200 break-all text-center">
                {generated}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Generic Utility UI (fallback for remaining tools) ────────────────────────
function GenericUtilityUI({ toolId, process, example, placeholder }: TextUtilityWorkspaceProps) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [options, setOptions] = useState<any>({});
  const [loading, setLoading] = useState(false);

  // Live update for simple tools
  useEffect(() => {
    if (input) {
      try {
        const result = process(input, options);
        if (typeof result === 'string') setOutput(result);
      } catch {}
    } else {
      setOutput('');
    }
  }, [input, options]);

  const handleRun = async () => {
    if (!input) return;
    setLoading(true);
    try {
      const result = await process(input, options);
      setOutput(typeof result === 'string' ? result : JSON.stringify(result, null, 2));
    } catch (e) {
      setOutput('Error processing. Please check your input.');
    }
    setLoading(false);
  };

  return (
    <IOLayout
      input={input} setInput={setInput}
      output={output}
      onRun={handleRun}
      onClear={() => { setInput(''); setOutput(''); }}
      onLoadExample={() => setInput(example || '')}
      toolId={toolId}
      placeholder={placeholder}
      loading={loading}
    />
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN WORKSPACE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
const TextUtilityWorkspace: React.FC<TextUtilityWorkspaceProps> = (props) => {
  const { toolId } = props;

  const renderTool = () => {
    switch (toolId) {
      case 'text-reverser':
        return <TextReverserUI {...props} />;
      case 'text-repeater':
        return <TextRepeaterUI {...props} />;
      case 'lorem-ipsum':
        return <LoremIpsumUI />;
      case 'find-replace':
        return <FindReplaceUI {...props} />;
      case 'sort-lines':
        return <SortLinesUI {...props} />;
      case 'text-to-list':
        return <TextToListUI {...props} />;
      case 'add-prefix':
        return <AddPrefixUI {...props} />;
      case 'random-string':
        return <RandomStringUI />;
      case 'invisible-text':
        return <InvisibleTextUI />;
      case 'whatsapp-text-formatter':
        return <WhatsAppFormatterUI {...props} />;
      case 'yt-timestamp-formatter':
        return <YTTimestampUI {...props} />;
      case 'text-steganography':
        return <TextSteganographyUI {...props} />;
      case 'password-gen-strength':
        return <PasswordUI />;
      default:
        return <GenericUtilityUI {...props} />;
    }
  };

  return (
    <div className="space-y-6">
      {renderTool()}
      <RelatedStrip toolId={toolId} />
    </div>
  );
};

export default TextUtilityWorkspace;
