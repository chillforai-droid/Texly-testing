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
      ? input.split(/\s+/).reverse().join(' ')
      : input.split('\n').reverse().join('\n')
    : '';

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(['chars', 'words', 'lines'] as const).map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              mode === m
                ? 'bg-violet-600 text-white shadow-md shadow-violet-500/30'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Reverse {m}
          </button>
        ))}
      </div>
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
  const [separator, setSeparator] = useState<'newline' | 'comma' | 'space' | 'none'>('newline');

  const sepChar = separator === 'newline' ? '\n' : separator === 'comma' ? ', ' : separator === 'space' ? ' ' : '';
  const output = input ? new Array(Math.min(count, 1000)).fill(input).join(sepChar) : '';

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Repeat Count</label>
          <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
            <button onClick={() => setCount(Math.max(1, count - 1))} className="w-7 h-7 flex items-center justify-center rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 font-black transition-colors">
              <Minus className="w-3.5 h-3.5" />
            </button>
            <input
              type="number"
              value={count}
              onChange={e => setCount(Math.max(1, Math.min(1000, parseInt(e.target.value) || 1)))}
              className="flex-1 text-center font-black text-lg text-slate-800 dark:text-white bg-transparent outline-none"
            />
            <button onClick={() => setCount(Math.min(1000, count + 1))} className="w-7 h-7 flex items-center justify-center rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 font-black transition-colors">
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex gap-1">
            {[5, 10, 50, 100].map(n => (
              <button key={n} onClick={() => setCount(n)}
                className="flex-1 py-1 text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg hover:bg-violet-100 dark:hover:bg-violet-900/30 hover:text-violet-700 dark:hover:text-violet-400 transition-colors">
                ×{n}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Separator</label>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { value: 'newline', label: 'New Line' },
              { value: 'comma', label: 'Comma' },
              { value: 'space', label: 'Space' },
              { value: 'none', label: 'None' },
            ].map(s => (
              <button
                key={s.value}
                onClick={() => setSeparator(s.value as any)}
                className={`py-2 text-xs font-bold rounded-xl transition-all ${
                  separator === s.value
                    ? 'bg-violet-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>
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

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        {(['paragraphs', 'sentences', 'words'] as const).map(t => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`py-2.5 rounded-xl text-xs font-black uppercase tracking-widest capitalize transition-all ${
              type === t ? 'bg-violet-600 text-white shadow-md shadow-violet-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        <span className="text-sm font-bold text-slate-600 dark:text-slate-400 capitalize">Number of {type}:</span>
        <div className="flex items-center gap-2 ml-auto">
          <button onClick={() => setCount(Math.max(1, count - 1))} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-black text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">-</button>
          <span className="w-10 text-center font-black text-lg text-slate-800 dark:text-white">{count}</span>
          <button onClick={() => setCount(Math.min(20, count + 1))} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-black text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">+</button>
        </div>
      </div>
      <button
        onClick={() => setOutput(generateLorem(type, count))}
        className="w-full py-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:from-violet-700 hover:to-indigo-700 shadow-xl shadow-violet-500/20 transition-all active:scale-[0.98]"
      >
        <Sparkles className="w-4 h-4" /> Generate Lorem Ipsum <ArrowRight className="w-4 h-4" />
      </button>
      {output && (
        <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Generated Text</span>
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
  const [output, setOutput] = useState('');

  const handleRun = () => {
    let result = input;
    for (const { find, replace } of pairs) {
      if (!find) continue;
      const escaped = find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const pattern = wholeWord ? `\\b${escaped}\\b` : escaped;
      const flags = caseSensitive ? 'g' : 'gi';
      try {
        result = result.replace(new RegExp(pattern, flags), replace);
      } catch {}
    }
    setOutput(result);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {pairs.map((pair, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              placeholder="Find..."
              value={pair.find}
              onChange={e => setPairs(p => p.map((x, j) => j === i ? { ...x, find: e.target.value } : x))}
              className="flex-1 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-mono text-slate-700 dark:text-slate-300 focus:border-rose-400 dark:focus:border-rose-500 focus:outline-none transition-colors"
            />
            <ArrowRight className="w-4 h-4 shrink-0 text-slate-400" />
            <input
              placeholder="Replace with..."
              value={pair.replace}
              onChange={e => setPairs(p => p.map((x, j) => j === i ? { ...x, replace: e.target.value } : x))}
              className="flex-1 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-mono text-slate-700 dark:text-slate-300 focus:border-emerald-400 dark:focus:border-emerald-500 focus:outline-none transition-colors"
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
          className="w-full py-2 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-400 dark:text-slate-500 hover:border-violet-400 dark:hover:border-violet-500 hover:text-violet-600 dark:hover:text-violet-400 transition-all flex items-center justify-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" /> Add Another Pair
        </button>
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => setCaseSensitive(!caseSensitive)}
          className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${caseSensitive ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}
        >
          Aa Case Sensitive
        </button>
        <button
          onClick={() => setWholeWord(!wholeWord)}
          className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${wholeWord ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}
        >
          " " Whole Word
        </button>
      </div>
      <IOLayout
        input={input} setInput={setInput}
        output={output}
        onRun={handleRun} onClear={() => { setInput(''); setOutput(''); }}
        onLoadExample={() => setInput(example || 'The quick brown fox jumps over the lazy dog.')}
        toolId="find-replace"
        runLabel="Find & Replace"
        placeholder="Paste your text here..."
      />
    </div>
  );
}

// ─── Sort Lines ───────────────────────────────────────────────────────────────
function SortLinesUI({ example }: TextUtilityWorkspaceProps) {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'az' | 'za' | 'length-asc' | 'length-desc' | 'random' | 'reverse'>('az');
  const [removeDupes, setRemoveDupes] = useState(false);
  const [trimLines, setTrimLines] = useState(true);

  const output = React.useMemo(() => {
    if (!input) return '';
    let lines = input.split('\n');
    if (trimLines) lines = lines.map(l => l.trim());
    if (removeDupes) lines = [...new Set(lines)];
    switch (mode) {
      case 'az': lines = [...lines].sort((a, b) => a.localeCompare(b)); break;
      case 'za': lines = [...lines].sort((a, b) => b.localeCompare(a)); break;
      case 'length-asc': lines = [...lines].sort((a, b) => a.length - b.length); break;
      case 'length-desc': lines = [...lines].sort((a, b) => b.length - a.length); break;
      case 'random': lines = [...lines].sort(() => Math.random() - 0.5); break;
      case 'reverse': lines = [...lines].reverse(); break;
    }
    return lines.join('\n');
  }, [input, mode, removeDupes, trimLines]);

  const modes = [
    { value: 'az', label: 'A → Z', icon: SortAsc },
    { value: 'za', label: 'Z → A', icon: SortDesc },
    { value: 'length-asc', label: 'Short → Long', icon: AlignLeft },
    { value: 'length-desc', label: 'Long → Short', icon: AlignLeft },
    { value: 'random', label: 'Shuffle', icon: Shuffle },
    { value: 'reverse', label: 'Reverse', icon: RotateCcw },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {modes.map(m => (
          <button key={m.value} onClick={() => setMode(m.value as any)}
            className={`py-2.5 rounded-xl text-xs font-black transition-all flex flex-col items-center gap-1 ${
              mode === m.value ? 'bg-violet-600 text-white shadow-md shadow-violet-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <m.icon className="w-3.5 h-3.5" />
            {m.label}
          </button>
        ))}
      </div>
      <div className="flex gap-3">
        <button onClick={() => setRemoveDupes(!removeDupes)}
          className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${removeDupes ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
          Remove Duplicates
        </button>
        <button onClick={() => setTrimLines(!trimLines)}
          className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${trimLines ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
          Trim Lines
        </button>
      </div>
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
  const [listType, setListType] = useState<'bullet' | 'numbered' | 'comma' | 'pipe' | 'html-ul' | 'html-ol'>('bullet');
  const [removeDupes, setRemoveDupes] = useState(false);
  const [skipBlanks, setSkipBlanks] = useState(true);
  const [sortAZ, setSortAZ] = useState(false);

  const output = React.useMemo(() => {
    if (!input) return '';
    let lines = input.split('\n');
    if (skipBlanks) lines = lines.filter(l => l.trim());
    if (removeDupes) lines = [...new Set(lines)];
    if (sortAZ) lines = [...lines].sort((a, b) => a.localeCompare(b));
    switch (listType) {
      case 'bullet': return lines.map(l => `• ${l}`).join('\n');
      case 'numbered': return lines.map((l, i) => `${i + 1}. ${l}`).join('\n');
      case 'comma': return lines.join(', ');
      case 'pipe': return lines.join(' | ');
      case 'html-ul': return `<ul>\n${lines.map(l => `  <li>${l}</li>`).join('\n')}\n</ul>`;
      case 'html-ol': return `<ol>\n${lines.map(l => `  <li>${l}</li>`).join('\n')}\n</ol>`;
      default: return lines.join('\n');
    }
  }, [input, listType, removeDupes, skipBlanks, sortAZ]);

  const types = [
    { value: 'bullet', label: '• Bullet' },
    { value: 'numbered', label: '1. Numbered' },
    { value: 'comma', label: ', Comma' },
    { value: 'pipe', label: '| Pipe' },
    { value: 'html-ul', label: '<ul> HTML' },
    { value: 'html-ol', label: '<ol> HTML' },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {types.map(t => (
          <button key={t.value} onClick={() => setListType(t.value as any)}
            className={`py-2.5 rounded-xl text-xs font-black transition-all ${
              listType === t.value ? 'bg-violet-600 text-white shadow-md shadow-violet-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}>
            {t.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Remove Dupes', val: removeDupes, set: setRemoveDupes },
          { label: 'Skip Blanks', val: skipBlanks, set: setSkipBlanks },
          { label: 'Sort A→Z', val: sortAZ, set: setSortAZ },
        ].map(opt => (
          <button key={opt.label} onClick={() => opt.set(!opt.val)}
            className={`py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${opt.val ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
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

  const output = React.useMemo(() => {
    if (!input) return '';
    return input.split('\n')
      .map(line => {
        if (skipBlanks && !line.trim()) return line;
        return `${prefix}${line}${suffix}`;
      })
      .join('\n');
  }, [input, prefix, suffix, skipBlanks]);

  const presets = [
    { label: '• Bullet', prefix: '• ', suffix: '' },
    { label: '- Dash', prefix: '- ', suffix: '' },
    { label: '" Quote"', prefix: '"', suffix: '"' },
    { label: '> Quote', prefix: '> ', suffix: '' },
    { label: '# Hash', prefix: '# ', suffix: '' },
    { label: ', Comma', prefix: '', suffix: ',' },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Prefix (Add to Start)</label>
          <input value={prefix} onChange={e => setPrefix(e.target.value)}
            placeholder="e.g. • or > or ..."
            className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-mono text-slate-700 dark:text-slate-300 focus:border-violet-400 focus:outline-none transition-colors" />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Suffix (Add to End)</label>
          <input value={suffix} onChange={e => setSuffix(e.target.value)}
            placeholder="e.g. , or ; or ..."
            className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-mono text-slate-700 dark:text-slate-300 focus:border-violet-400 focus:outline-none transition-colors" />
        </div>
      </div>
      <div className="space-y-1.5">
        <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Quick Presets</p>
        <div className="flex flex-wrap gap-2">
          {presets.map(p => (
            <button key={p.label} onClick={() => { setPrefix(p.prefix); setSuffix(p.suffix); }}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-xs font-bold hover:bg-violet-100 dark:hover:bg-violet-900/30 hover:text-violet-700 dark:hover:text-violet-400 transition-colors">
              {p.label}
            </button>
          ))}
        </div>
      </div>
      <button onClick={() => setSkipBlanks(!skipBlanks)}
        className={`w-full py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${skipBlanks ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
        {skipBlanks ? '✓ Skipping Blank Lines' : 'Skip Blank Lines'}
      </button>
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
  const [charType, setCharType] = useState<'zwsp' | 'zwnj' | 'zwj' | 'braille'>('zwsp');
  const [output, setOutput] = useState('');

  const charMap = {
    zwsp: '\u200B',    // Zero-width space
    zwnj: '\u200C',    // Zero-width non-joiner
    zwj: '\u200D',     // Zero-width joiner
    braille: '\u2800', // Braille blank
  };

  const generate = () => {
    setOutput(charMap[charType].repeat(Math.min(count, 500)));
  };

  return (
    <div className="space-y-4">
      <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-2xl flex items-start gap-3">
        <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
        <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
          Invisible characters are zero-width Unicode characters. They appear blank but can be pasted into forms, social media bios, and messages.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[
          { value: 'zwsp', label: 'Zero-Width Space', desc: 'U+200B' },
          { value: 'zwnj', label: 'Zero-Width Non-Joiner', desc: 'U+200C' },
          { value: 'zwj', label: 'Zero-Width Joiner', desc: 'U+200D' },
          { value: 'braille', label: 'Braille Blank', desc: 'U+2800' },
        ].map(c => (
          <button key={c.value} onClick={() => setCharType(c.value as any)}
            className={`p-3 rounded-xl text-left transition-all ${charType === c.value ? 'bg-violet-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>
            <div className="text-xs font-black">{c.label}</div>
            <div className={`text-[10px] font-mono mt-0.5 ${charType === c.value ? 'text-violet-200' : 'text-slate-400'}`}>{c.desc}</div>
          </button>
        ))}
      </div>
      <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        <span className="text-sm font-bold text-slate-600 dark:text-slate-400">Count:</span>
        <input type="number" value={count} onChange={e => setCount(Math.max(1, Math.min(500, parseInt(e.target.value) || 1)))}
          className="w-24 p-2 text-center font-black text-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-slate-800 dark:text-white" />
        <span className="text-xs text-slate-400">max 500</span>
      </div>
      <button onClick={generate}
        className="w-full py-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:from-violet-700 hover:to-indigo-700 shadow-xl shadow-violet-500/20 transition-all active:scale-[0.98]">
        <Eye className="w-4 h-4" /> Generate Invisible Text <ArrowRight className="w-4 h-4" />
      </button>
      {output && (
        <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Invisible Characters Ready</span>
              <p className="text-[10px] text-slate-400 mt-0.5">{count} invisible chars generated • Click copy to use</p>
            </div>
            <CopyBtn text={output} />
          </div>
          <div className="p-5 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl text-center">
            <div className="h-12 flex items-center justify-center">
              <span className="text-slate-300 dark:text-slate-700 text-sm font-mono italic">[{count} invisible characters — copy above to use]</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── WhatsApp Text Formatter ──────────────────────────────────────────────────
function WhatsAppFormatterUI({ example }: TextUtilityWorkspaceProps) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const formats = [
    { label: '**Bold**', symbol: '*', desc: 'Bold', bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800' },
    { label: '_Italic_', symbol: '_', desc: 'Italic', bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-800' },
    { label: '~Strike~', symbol: '~', desc: 'Strikethrough', bg: 'bg-rose-100 dark:bg-rose-900/30', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-200 dark:border-rose-800' },
    { label: '`Mono`', symbol: '`', desc: 'Monospace', bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800' },
    { label: '```Block```', symbol: '```', desc: 'Code Block', bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-700 dark:text-slate-300', border: 'border-slate-200 dark:border-slate-700' },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {formats.map(f => (
          <button
            key={f.symbol}
            onClick={() => {
              const text = input || f.desc;
              setOutput(`${f.symbol}${text}${f.symbol}`);
            }}
            className={`p-3 rounded-xl border-2 ${f.bg} ${f.text} ${f.border} text-center font-bold transition-all hover:scale-105 active:scale-95`}
          >
            <div className="text-base mb-1">{f.label}</div>
            <div className="text-[10px] uppercase tracking-widest opacity-70">{f.desc}</div>
          </button>
        ))}
      </div>
      <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <p className="text-[10px] text-slate-400 dark:text-slate-500">
          💡 Type your message below, then click a format button above. Or apply manually by wrapping text with *bold*, _italic_, ~strikethrough~, or `monospace`.
        </p>
      </div>
      <IOLayout
        input={input} setInput={setInput}
        output={output}
        onClear={() => { setInput(''); setOutput(''); }}
        onLoadExample={() => setInput(example || 'Hello! This is my WhatsApp message.')}
        toolId="whatsapp-text-formatter"
        placeholder="Type your WhatsApp message here..."
        autoRun={false}
        onRun={() => setOutput(input)}
        runLabel="Preview Output"
      />
    </div>
  );
}

// ─── YouTube Timestamp Formatter ──────────────────────────────────────────────
function YTTimestampUI({ example }: TextUtilityWorkspaceProps) {
  const [input, setInput] = useState('');

  const output = React.useMemo(() => {
    if (!input) return '';
    return input.split('\n')
      .map(line => line.trim())
      .filter(line => /^\d{1,2}:\d{2}/.test(line))
      .map(line => {
        // Ensure consistent timestamp format
        const match = line.match(/^(\d{1,2}:\d{2}(?::\d{2})?)\s*(.*)/);
        if (match) return `${match[1]} ${match[2]}`.trim();
        return line;
      })
      .join('\n');
  }, [input]);

  return (
    <div className="space-y-3">
      <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl flex items-start gap-3">
        <Info className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
        <p className="text-xs text-red-700 dark:text-red-300">
          Format: <code className="font-mono bg-red-100 dark:bg-red-900/40 px-1 rounded">00:00 Chapter Title</code> — one per line. Invalid lines are filtered out.
        </p>
      </div>
      <IOLayout
        input={input} setInput={setInput}
        output={output}
        onClear={() => setInput('')}
        onLoadExample={() => setInput(example || '00:00 Intro\n01:30 Setup\n05:00 Main Demo\n10:00 Conclusion')}
        toolId="yt-timestamp-formatter"
        placeholder={"00:00 Intro\n01:30 Setup\n05:00 Demo\n10:00 Outro"}
        autoRun
      />
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
