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


// ─── WhatsApp Text Formatter — Fully Rewritten (Mobile-First + SEO) ──────────
function WhatsAppFormatterUI({ example }: TextUtilityWorkspaceProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [input, setInput]         = useState('');
  const [preview, setPreview]     = useState(false);
  const [copied, setCopied]       = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'format' | 'templates' | 'tips' | 'faq'>('format');
  const [openFaq, setOpenFaq]     = useState<number | null>(null);

  /* ── apply / toggle format symbol around selection or full text ── */
  const applyFormat = useCallback((symbol: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const s = ta.selectionStart, e = ta.selectionEnd;
    const sel = ta.value.substring(s, e);
    let newText = '', newStart = s, newEnd = e;
    if (sel) {
      // toggle: if already wrapped, unwrap
      const pre = ta.value.substring(0, s), post = ta.value.substring(e);
      if (pre.endsWith(symbol) && post.startsWith(symbol)) {
        newText  = pre.slice(0, -symbol.length) + sel + post.slice(symbol.length);
        newStart = s - symbol.length;
        newEnd   = e - symbol.length;
      } else {
        newText  = pre + symbol + sel + symbol + post;
        newStart = s + symbol.length;
        newEnd   = e + symbol.length;
      }
    } else if (input.trim()) {
      newText  = symbol + input + symbol;
      newStart = symbol.length;
      newEnd   = input.length + symbol.length;
    } else return;
    setInput(newText);
    setTimeout(() => { ta.focus(); ta.setSelectionRange(newStart, newEnd); }, 0);
  }, [input]);

  /* ── copy full output ── */
  const copyOutput = async () => {
    if (!input) return;
    await navigator.clipboard.writeText(input);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  /* ── copy template ── */
  const copyTemplate = async (text: string, idx: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  /* ── WhatsApp-like HTML preview renderer ── */
  const renderPreview = (raw: string) => {
    const esc = (s: string) => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    let html = esc(raw);
    html = html.replace(/```([\s\S]*?)```/g, '<code class="block font-mono bg-black/10 dark:bg-white/10 px-2 py-1 rounded text-[12px] whitespace-pre-wrap my-1">$1</code>');
    html = html.replace(/`([^`\n]+)`/g,       '<code class="font-mono bg-black/10 dark:bg-white/10 px-1 rounded text-[12px]">$1</code>');
    html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*(.*?)\*/g,          '<strong>$1</strong>');
    html = html.replace(/_(.*?)_/g,             '<em class="italic">$1</em>');
    html = html.replace(/~(.*?)~/g,             '<del>$1</del>');
    html = html.replace(/\n/g,                  '<br/>');
    return html;
  };

  const formats = [
    { label: 'B',    symbol: '*',    title: 'Bold',          kbd: '*text*',    color: 'bg-[#25D366] hover:bg-[#1ebe5c]',  textStyle: 'font-extrabold text-lg' },
    { label: 'I',    symbol: '_',    title: 'Italic',        kbd: '_text_',    color: 'bg-violet-500 hover:bg-violet-600', textStyle: 'italic text-base' },
    { label: 'S',    symbol: '~',    title: 'Strike',        kbd: '~text~',    color: 'bg-rose-500 hover:bg-rose-600',     textStyle: 'line-through text-base' },
    { label: '</>',  symbol: '`',    title: 'Mono',          kbd: '`text`',    color: 'bg-amber-500 hover:bg-amber-600',   textStyle: 'font-mono text-sm' },
    { label: '{ }',  symbol: '```',  title: 'Code',          kbd: '``` ```',   color: 'bg-slate-700 hover:bg-slate-800',   textStyle: 'font-mono text-sm' },
  ];

  const quickActions = [
    { label: '🧹 Clear',   action: () => setInput(''), disabled: !input },
    { label: '📄 Example', action: () => setInput('Hello! *This is bold* and _this is italic_.\n~Old price: ₹999~ → *New: ₹499* 🎉\nUse code: `SAVE50`'), disabled: false },
    { label: preview ? '🙈 Hide Preview' : '👁️ Preview', action: () => setPreview(p => !p), disabled: !input },
  ];

  const templates = [
    { label: '📢 Announcement', text: '*📢 Important Announcement*\n\nDear all,\n\n_Please note that_ our office will be *closed on Monday*.\n\nWe will resume on *Tuesday at 9:00 AM*.\n\nThank you! 🙏' },
    { label: '✅ Task Update',  text: '*✅ Task Update*\n\nHello team,\n\nHere is today\'s status:\n\n• Task 1 — *Done* ✅\n• Task 2 — _In Progress_ 🔄\n• Task 3 — ~Cancelled~ ❌\n\nLet me know if you need anything!' },
    { label: '🎉 Celebration',  text: '🎉 *Congratulations!* 🎉\n\n_You did an amazing job!_\n\nWe are so proud of your achievement. Keep it up! 💪\n\n*Well done!* 🏆' },
    { label: '📅 Meeting',      text: '*📅 Meeting Reminder*\n\nHi,\n\n*Date:* _Monday, 10 June_\n*Time:* _3:00 PM IST_\n*Platform:* _Google Meet_\n\nPlease join on time. Thank you!' },
    { label: '🛒 Offer',        text: '🛒 *Special Offer Just for You!* 🛒\n\n_Don\'t miss out!_\n\nGet *50% OFF* today only.\n\n~₹999~  *₹499*\n\n👉 Use code: `SAVE50`\n\n⏰ Offer ends at midnight!' },
    { label: '👋 Introduction', text: '👋 *Hello, I am [Your Name]*\n\n_Nice to meet you!_\n\nI am a *[profession]* based in *[city]*.\n\nI specialize in:\n• [Skill 1]\n• [Skill 2]\n\nFeel free to reach out! 😊' },
    { label: '🚨 Urgent Alert', text: '🚨 *URGENT*\n\nHi [Name],\n\n_Action required immediately._\n\nPlease review and respond to this ASAP.\n\n*Deadline:* Today by *6:00 PM*.\n\nThank you!' },
    { label: '📦 Order Update', text: '*📦 Order Update*\n\nHi [Name],\n\nYour order *#12345* has been _dispatched_ ✅\n\n*Expected Delivery:* _2–3 business days_\n\nTrack here: [link]\n\nThank you for shopping with us! 🛍️' },
  ];

  const tips = [
    { sym: '*text*',    label: 'Bold',          preview: 'Hello World',  previewClass: 'font-bold', desc: 'Wrap with asterisks (*) on both sides. Works in messages on Android, iOS, and WhatsApp Web.' },
    { sym: '_text_',    label: 'Italic',         preview: 'Important',    previewClass: 'italic',    desc: 'Wrap with underscores (_) on both sides. Use for emphasis or highlighting key information.' },
    { sym: '~text~',    label: 'Strikethrough',  preview: 'Old Price',    previewClass: 'line-through', desc: 'Wrap with tildes (~) on both sides. Great for price comparisons or correcting old info.' },
    { sym: '`text`',    label: 'Monospace',      preview: 'code here',    previewClass: 'font-mono text-sm', desc: 'Wrap with backticks (`) for monospace font. Use for codes, commands, or technical terms.' },
    { sym: '```text```',label: 'Code Block',     preview: 'multi\nline',  previewClass: 'font-mono text-sm block', desc: 'Triple backticks create a fixed-width code block. Supports multi-line content.' },
  ];

  const faqs = [
    { q: 'How do I bold text in WhatsApp?', a: 'To bold text in WhatsApp, put an asterisk (*) before and after the word — like *Hello*. In our tool, select the word and click the Bold (B) button. It works on Android, iPhone, and WhatsApp Web.' },
    { q: 'How do I make text italic in WhatsApp?', a: 'Surround your text with underscores: _Hello_ shows as italic in WhatsApp. Select your text in our formatter and click the Italic (I) button to apply it automatically.' },
    { q: 'How do I do strikethrough text in WhatsApp?', a: 'Use tilde (~) on both sides: ~Hello~ appears with a line through it. Our tool handles this automatically when you select text and click the Strikethrough (S) button.' },
    { q: 'Does WhatsApp text formatting work on Android and iPhone?', a: 'Yes — Bold (*), Italic (_), Strikethrough (~), Monospace (`), and Code Block (```) formatting all work on WhatsApp for Android, iOS (iPhone), and WhatsApp Web on desktop.' },
    { q: 'Can I combine bold and italic in WhatsApp?', a: 'Yes. Nest the symbols like this: *_bold italic_* to get bold italic text. You can also combine with strikethrough: *~bold strikethrough~*. Apply multiple formats using our tool.' },
    { q: 'Why is my WhatsApp formatting not working?', a: 'Common reasons: (1) There is a space between the symbol and the first or last character — formatting symbols must touch the text directly. (2) You are trying to format a group/contact name — WhatsApp formatting only works in messages, not names. (3) You are using the wrong symbol — use * for bold, _ for italic, ~ for strikethrough, and ` for monospace.' },
    { q: 'Can I format text in WhatsApp group names?', a: 'No. WhatsApp bold, italic, and strikethrough formatting only works in chat messages. It does not apply to group names, contact names, or WhatsApp status updates.' },
    { q: 'Is there a limit to WhatsApp message length?', a: 'WhatsApp allows up to 65,536 characters per message. For most messages, this is more than enough. Our formatter shows a character counter so you can track your message length.' },
    { q: 'Does this WhatsApp formatter work on mobile?', a: 'Yes — our WhatsApp Text Formatter is fully mobile-responsive and works on all smartphones and tablets. It is designed to be fast and easy to use on touchscreens.' },
    { q: 'Is the WhatsApp Text Formatter free?', a: 'Yes, 100% free. No signup, no account, no limits. Format as many messages as you want — instantly, in your browser, for free.' },
  ];

  const wordCount = input.trim() ? input.trim().split(/\s+/).length : 0;
  const charCount = input.length;
  const waLimit   = 65536;
  const limitPct  = Math.min(100, Math.round((charCount / waLimit) * 100));

  return (
    <div className="w-full space-y-3 sm:space-y-4">

      {/* ── Tab bar (sticky on mobile) ── */}
      <div className="sticky top-0 z-20 -mx-1 px-1 pt-1 pb-1 bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm">
        <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl overflow-x-auto no-scrollbar">
          {(['format','templates','tips','faq'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-1 min-w-[70px] py-2.5 px-2 rounded-xl text-[11px] sm:text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                activeTab === tab
                  ? 'bg-white dark:bg-slate-900 text-[#25D366] shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}>
              {tab === 'format' ? '✏️ Format' : tab === 'templates' ? '📋 Templates' : tab === 'tips' ? '💡 Tips' : '❓ FAQ'}
            </button>
          ))}
        </div>
      </div>

      {/* ══════════════ FORMAT TAB ══════════════ */}
      {activeTab === 'format' && (
        <div className="space-y-3 sm:space-y-4">

          {/* Mobile hint */}
          <div className="flex items-start gap-2.5 p-3 bg-[#25D366]/10 border border-[#25D366]/25 rounded-xl">
            <span className="text-lg flex-shrink-0 mt-0.5">💬</span>
            <p className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed">
              <strong>Mobile:</strong> Tap &amp; hold to select text, then tap a button. <strong>Desktop:</strong> Select text with mouse, then click a button.
            </p>
          </div>

          {/* Format buttons — full row, big tap targets on mobile */}
          <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
            {formats.map(f => (
              <button key={f.symbol} onClick={() => applyFormat(f.symbol)}
                aria-label={`Apply ${f.title} formatting`}
                title={`${f.title} — ${f.kbd}`}
                className={`group flex flex-col items-center justify-center gap-0.5 sm:gap-1 py-3 sm:py-3.5 px-1 rounded-2xl text-white font-bold transition-all active:scale-95 touch-manipulation ${f.color}`}>
                <span className={`text-base sm:text-lg leading-none ${f.textStyle}`}>{f.label}</span>
                <span className="text-[9px] sm:text-[10px] uppercase tracking-widest opacity-90 font-black">{f.title}</span>
                <span className="hidden sm:block text-[9px] font-mono opacity-60">{f.kbd}</span>
              </button>
            ))}
          </div>

          {/* Textarea + header + footer in one card */}
          <div className="rounded-2xl border-2 border-[#25D366]/30 dark:border-[#25D366]/20 overflow-hidden bg-white dark:bg-slate-900 focus-within:border-[#25D366] transition-colors shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between px-3 sm:px-4 py-2 bg-[#075E54]">
              <span className="text-xs font-black text-white/80 uppercase tracking-widest">✏️ Your Message</span>
              <div className="flex items-center gap-2">
                <button onClick={() => setInput(example || 'Hello! *This is bold* and _this is italic_.\n~Old: ₹999~ → *New: ₹499* 🎉\nUse code: `SAVE50`')}
                  className="text-[10px] font-black text-white/60 hover:text-white transition-colors uppercase tracking-widest touch-manipulation">
                  Example
                </button>
                {input && (
                  <button onClick={() => setInput('')}
                    className="text-[10px] font-black text-white/60 hover:text-rose-300 transition-colors uppercase tracking-widest flex items-center gap-1 touch-manipulation">
                    <Trash2 className="w-3 h-3" /> Clear
                  </button>
                )}
              </div>
            </div>
            {/* Textarea — min-height bigger on mobile for touch ease */}
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type or paste your WhatsApp message here... then select text &amp; tap a format button above."
              rows={6}
              inputMode="text"
              className="w-full px-3 sm:px-4 py-3 bg-transparent resize-y font-mono text-sm sm:text-base text-slate-700 dark:text-slate-300 focus:outline-none leading-relaxed placeholder:text-slate-400 dark:placeholder:text-slate-600 min-h-[140px] sm:min-h-[160px]"
            />
            {/* Footer: counters + preview toggle */}
            <div className="flex items-center justify-between px-3 sm:px-4 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 gap-2">
              <div className="flex items-center gap-2 flex-wrap min-w-0">
                <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap">{charCount.toLocaleString()} chars</span>
                <span className="text-[10px] text-slate-300 dark:text-slate-600">·</span>
                <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap">{wordCount} words</span>
                {charCount > 0 && (
                  <div className="flex items-center gap-1 min-w-0">
                    <div className="w-16 sm:w-24 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${limitPct > 80 ? 'bg-rose-400' : 'bg-[#25D366]'}`} style={{ width: `${limitPct}%` }} />
                    </div>
                    <span className="text-[9px] text-slate-400 whitespace-nowrap">{limitPct}%</span>
                  </div>
                )}
              </div>
              <button onClick={() => setPreview(p => !p)}
                disabled={!input}
                className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1 transition-colors flex-shrink-0 touch-manipulation ${
                  preview ? 'text-[#25D366]' : 'text-slate-400 hover:text-slate-600 disabled:opacity-40'
                }`}>
                {preview ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                <span className="hidden sm:inline">{preview ? 'Hide' : 'Preview'}</span>
                <span className="sm:hidden">👁️</span>
              </button>
            </div>
          </div>

          {/* WhatsApp preview panel */}
          {preview && input && (
            <div className="rounded-2xl border-2 border-[#25D366]/30 overflow-hidden shadow-sm">
              <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-[#075E54]">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-black text-white/80 uppercase tracking-widest">WhatsApp Preview</span>
                <span className="text-[9px] text-white/40 ml-1 hidden sm:inline">(How it looks in WhatsApp)</span>
              </div>
              {/* Simulated WhatsApp chat background */}
              <div className="px-3 sm:px-4 py-4 sm:py-5"
                style={{ background: '#E5DDD5', backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'300\' height=\'300\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h300v300H0z\' fill=\'%23E5DDD5\'/%3E%3C/svg%3E")' }}>
                <div className="flex justify-end">
                  <div className="max-w-[85%] sm:max-w-[75%] bg-[#DCF8C6] rounded-2xl rounded-tr-sm px-3 sm:px-4 py-2 sm:py-2.5 shadow-sm">
                    <div className="text-sm sm:text-base text-slate-800 leading-relaxed break-words"
                      dangerouslySetInnerHTML={{ __html: renderPreview(input) }} />
                    <div className="text-right text-[10px] text-slate-500 mt-1 flex items-center justify-end gap-1">
                      <span>12:00 PM</span>
                      <svg className="w-4 h-3 text-blue-500" viewBox="0 0 16 11" fill="currentColor">
                        <path d="M11.071.653a.75.75 0 0 1 .025 1.06l-6.79 7.25a.75.75 0 0 1-1.085 0L.693 6.086A.75.75 0 1 1 1.807 5.1l1.996 2.127 6.208-6.6a.75.75 0 0 1 1.06-.025z"/>
                        <path d="M14.571.653a.75.75 0 0 1 .025 1.06l-6.79 7.25a.75.75 0 0 1-.282.194l.247-1.04 6.74-7.19a.75.75 0 0 1 1.06.026z"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Copy button — large, full-width, prominent on mobile */}
          {input && (
            <button onClick={copyOutput}
              className={`w-full flex items-center justify-center gap-2.5 py-4 sm:py-4.5 rounded-2xl font-black text-base sm:text-lg transition-all active:scale-98 touch-manipulation shadow-lg ${
                copied
                  ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                  : 'bg-[#25D366] hover:bg-[#1ebe5c] text-white shadow-[#25D366]/30'
              }`}>
              {copied
                ? <><Check className="w-5 h-5" /> Copied to Clipboard!</>
                : <><Copy className="w-5 h-5" /> Copy &amp; Paste to WhatsApp</>
              }
            </button>
          )}

          {/* Formatted output (raw, for manual copy) */}
          {input && (
            <div className="rounded-2xl border-2 border-[#25D366]/20 overflow-hidden">
              <div className="flex items-center justify-between px-3 sm:px-4 py-2 bg-[#128C7E]">
                <span className="text-[10px] font-black text-white/80 uppercase tracking-widest">📋 Formatted Output</span>
                <button onClick={copyOutput}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all touch-manipulation ${
                    copied ? 'bg-emerald-400 text-white' : 'bg-white/20 text-white hover:bg-white/30'
                  }`}>
                  {copied ? <><Check className="w-3 h-3" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy</>}
                </button>
              </div>
              <div className="px-3 sm:px-4 py-3 bg-white dark:bg-slate-900">
                <pre className="font-mono text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap break-words leading-relaxed select-all">{input}</pre>
              </div>
            </div>
          )}

          {/* How to use steps */}
          <div className="pt-2">
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mb-3">
              How to Use WhatsApp Text Formatter
            </h2>
            <ol className="space-y-2">
              {[
                'Type or paste your WhatsApp message in the text box.',
                'On mobile: tap &amp; hold to select the text you want to format. On desktop: click and drag to select.',
                'Tap one of the 5 buttons above — Bold (B), Italic (I), Strikethrough (S), Monospace, or Code Block.',
                'Toggle the Preview button to see exactly how it will look inside WhatsApp.',
                'Tap the big green Copy button and paste directly into any WhatsApp chat.',
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#25D366] text-white text-xs font-black flex items-center justify-center mt-0.5">{i+1}</span>
                  <span dangerouslySetInnerHTML={{ __html: step }} />
                </li>
              ))}
            </ol>
          </div>

        </div>
      )}

      {/* ══════════════ TEMPLATES TAB ══════════════ */}
      {activeTab === 'templates' && (
        <div className="space-y-3">
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Tap any template to load it. Then customise the text and copy it to WhatsApp.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {templates.map((tpl, i) => (
              <div key={tpl.label} className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden hover:border-[#25D366]/40 transition-all">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-sm font-black text-slate-900 dark:text-white">{tpl.label}</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => copyTemplate(tpl.text, i)}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all touch-manipulation ${
                        copiedIdx === i ? 'bg-emerald-500 text-white' : 'bg-[#25D366]/15 text-[#25D366] hover:bg-[#25D366]/25'
                      }`}>
                      {copiedIdx === i ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
                    </button>
                    <button onClick={() => { setInput(tpl.text); setActiveTab('format'); }}
                      className="px-2.5 py-1.5 rounded-xl text-[10px] font-black bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 transition-all touch-manipulation uppercase tracking-widest">
                      Edit
                    </button>
                  </div>
                </div>
                <pre className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400 font-mono whitespace-pre-wrap line-clamp-4 leading-relaxed">{tpl.text}</pre>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════ TIPS TAB ══════════════ */}
      {activeTab === 'tips' && (
        <div className="space-y-3">
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            WhatsApp supports these 5 text formatting styles. They work on Android, iOS, and WhatsApp Web.
          </p>
          <div className="space-y-3">
            {tips.map(tip => (
              <div key={tip.sym} className="flex items-start gap-3 sm:gap-4 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 flex items-center justify-center bg-[#25D366]/10 rounded-xl">
                  <code className="text-[10px] sm:text-xs font-mono text-[#25D366] font-black text-center break-all">{tip.sym}</code>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-sm font-black text-slate-900 dark:text-white">{tip.label}</span>
                    <span className={`text-xs sm:text-sm text-slate-700 dark:text-slate-200 ${tip.previewClass}`}>{tip.preview}</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{tip.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-2xl">
            <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
              ⚠️ <strong>Important:</strong> WhatsApp formatting only works in chat messages — <strong>not</strong> in group names, contact names, or status updates. The symbol must directly touch the first and last character with no space.
            </p>
          </div>
        </div>
      )}

      {/* ══════════════ FAQ TAB ══════════════ */}
      {activeTab === 'faq' && (
        <div className="space-y-3">
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Everything you need to know about WhatsApp text formatting — answered.
          </p>
          <div className="space-y-2">
            {faqs.map((item, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors touch-manipulation"
                  aria-expanded={openFaq === i}>
                  <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-snug">{item.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-4 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed pt-3">{item.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── SEO Content Block (below tool, above footer) ── */}
      <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800/60 space-y-8">

        {/* What is this tool */}
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-3">
            What Is a WhatsApp Text Formatter?
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
            A <strong>WhatsApp Text Formatter</strong> is a free online tool that helps you add text formatting to your WhatsApp messages — including <strong>bold text</strong>, <strong>italic text</strong>, <strong>strikethrough</strong>, and <strong>monospace (code font)</strong> — without memorising symbols or typing them manually.
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            WhatsApp uses special Markdown-style symbols to format text. Instead of manually typing <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono">*Hello*</code> to make it bold, our tool lets you select the word and click a button — making it instant, error-free, and accessible on any device including mobile phones.
          </p>
        </div>

        {/* Format reference table */}
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-3">
            WhatsApp Text Formatting Symbols — Complete Reference
          </h2>
          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-[#075E54] text-white">
                  <th className="px-3 sm:px-4 py-2.5 text-left text-xs font-black uppercase tracking-widest rounded-tl-xl">Format</th>
                  <th className="px-3 sm:px-4 py-2.5 text-left text-xs font-black uppercase tracking-widest">Symbol</th>
                  <th className="px-3 sm:px-4 py-2.5 text-left text-xs font-black uppercase tracking-widest">Example</th>
                  <th className="px-3 sm:px-4 py-2.5 text-left text-xs font-black uppercase tracking-widest rounded-tr-xl hidden sm:table-cell">Works On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {[
                  { fmt: '**Bold**', sym: '*text*', ex: '*Hello*', result: <strong>Hello</strong>, works: 'Android, iOS, Web' },
                  { fmt: '*Italic*', sym: '_text_', ex: '_Hello_', result: <em>Hello</em>, works: 'Android, iOS, Web' },
                  { fmt: '~~Strikethrough~~', sym: '~text~', ex: '~Hello~', result: <del>Hello</del>, works: 'Android, iOS, Web' },
                  { fmt: '`Monospace`', sym: '`text`', ex: '`Hello`', result: <code className="font-mono text-xs">Hello</code>, works: 'Android, iOS, Web' },
                  { fmt: 'Code Block', sym: '```text```', ex: '```Hello```', result: <code className="font-mono text-xs block bg-black/5 px-1 rounded">Hello</code>, works: 'Android, iOS, Web' },
                ].map(row => (
                  <tr key={row.sym} className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-3 sm:px-4 py-3 font-bold text-slate-900 dark:text-white text-xs">{row.fmt}</td>
                    <td className="px-3 sm:px-4 py-3 font-mono text-[#25D366] text-xs font-bold">{row.sym}</td>
                    <td className="px-3 sm:px-4 py-3 text-slate-600 dark:text-slate-300 text-xs sm:text-sm">{row.result}</td>
                    <td className="px-3 sm:px-4 py-3 text-slate-400 text-[11px] hidden sm:table-cell">{row.works}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Key features */}
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-3">
            Why Use Texly's WhatsApp Formatter?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { icon: '📱', title: 'Mobile Friendly', desc: 'Fully optimised for smartphones. Large tap targets, easy text selection, one-tap copy.' },
              { icon: '🆓', title: '100% Free, No Signup', desc: 'Use it as many times as you want. No account, no email, no limits — ever.' },
              { icon: '🔒', title: 'Completely Private', desc: 'Your messages are processed entirely in your browser. Nothing is sent to any server.' },
              { icon: '⚡', title: 'Instant Results', desc: 'Format text and copy it in under 5 seconds. No waiting, no loading, no processing time.' },
              { icon: '👁️', title: 'Live WhatsApp Preview', desc: 'See exactly how your formatted message will look inside WhatsApp before you send it.' },
              { icon: '📋', title: '8 Ready Templates', desc: 'Pre-made message templates for announcements, celebrations, offers, meetings, and more.' },
            ].map(item => (
              <div key={item.title} className="flex items-start gap-3 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                <span className="text-2xl flex-shrink-0">{item.icon}</span>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white mb-1">{item.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

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
