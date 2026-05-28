/**
 * TextAnalysisWorkspace.tsx — FULLY REBUILT v2.0
 * Rich, bold, visual workspace for all "analysis" category tools.
 * Every tool has its own dedicated, polished output panel.
 */

import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
  Copy, Check, Trash2, Play, ArrowRight, Download,
  FileText, Type, AlignLeft, Clock, Hash, BarChart2,
  Mail, Link2, Image, Upload, Loader2, Calendar,
  Activity, PieChart, List, Zap, Shield, ShieldCheck,
  Eye, EyeOff, TrendingUp, Users, BookOpen, Diff,
  Sparkles, Target, Layers
} from 'lucide-react';
import Tesseract from 'tesseract.js';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Props {
  toolId: string;
  process: (input: string, options?: any) => string;
  example?: string;
  placeholder?: string;
  toolName?: string;
  theme?: {
    primaryText: string;
    gradient: string;
    bg: string;
    border: string;
    iconBg: string;
    darkBg: string;
    darkBorder: string;
    darkText: string;
    darkSecondaryText: string;
    hoverShadow: string;
    shadow: string;
    darkShadow: string;
    darkHoverShadow: string;
  };
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
  label, value, icon: Icon, accent, subtitle, large
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  accent: string;
  subtitle?: string;
  large?: boolean;
}) {
  return (
    <div className={`flex flex-col items-center justify-center gap-1.5 rounded-2xl border p-4 bg-white dark:bg-slate-900 shadow-sm transition-all hover:shadow-lg hover:-translate-y-0.5 ${accent}`}>
      <Icon className="w-5 h-5 opacity-50 mb-0.5" />
      <span className={`font-black tabular-nums leading-none text-slate-800 dark:text-slate-100 ${large ? 'text-3xl sm:text-4xl' : 'text-2xl sm:text-3xl'}`}>
        {value}
      </span>
      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 text-center leading-tight tracking-wide uppercase">{label}</span>
      {subtitle && <span className="text-[10px] text-slate-400 dark:text-slate-500 text-center">{subtitle}</span>}
    </div>
  );
}

// ─── Bar Row ──────────────────────────────────────────────────────────────────
function BarRow({ label, count, total, color, showPct = true }: { label: string; count: number; total: number; color: string; showPct?: boolean }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3 group">
      <span className="w-24 sm:w-28 text-xs font-mono font-bold text-slate-600 dark:text-slate-400 truncate">{label}</span>
      <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${color}`}
          style={{ width: `${Math.max(pct, 1)}%` }}
        />
      </div>
      <span className="w-10 text-xs font-black text-right text-slate-700 dark:text-slate-300 tabular-nums">{count.toLocaleString()}</span>
      {showPct && <span className="w-10 text-[10px] text-right text-slate-400 dark:text-slate-500 tabular-nums">{pct}%</span>}
    </div>
  );
}

// ─── Section Box ──────────────────────────────────────────────────────────────
function SectionBox({ title, children, accent }: { title: string; children: React.ReactNode; accent?: string }) {
  return (
    <div className={`rounded-2xl border overflow-hidden ${accent || 'bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-800'}`}>
      <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60">
        <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">{title}</p>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// ─── Badge List (emails, URLs) ────────────────────────────────────────────────
function BadgeList({ items, color, onCopy }: { items: string[]; color: string; onCopy: (s: string) => void }) {
  if (!items.length) return (
    <div className="flex flex-col items-center gap-2 py-8 text-slate-400 dark:text-slate-500">
      <Target className="w-8 h-8 opacity-30" />
      <p className="text-sm font-semibold italic">Nothing found</p>
    </div>
  );
  return (
    <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto pr-1">
      {items.map((item, i) => (
        <button
          key={i}
          onClick={() => onCopy(item)}
          title="Click to copy"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-semibold border transition-all hover:scale-105 active:scale-95 ${color}`}
        >
          <Copy className="w-3 h-3 opacity-60 flex-shrink-0" />
          <span className="max-w-[200px] truncate">{item}</span>
        </button>
      ))}
    </div>
  );
}

// ─── Word Counter Output ──────────────────────────────────────────────────────
function WordCounterResult({ text }: { text: string }) {
  const s = useMemo(() => {
    const wordList = text.trim() ? text.trim().split(/\s+/) : [];
    const words = wordList.length;
    const chars = text.length;
    const charsNoSp = text.replace(/\s/g, '').length;
    const letters = (text.match(/[a-zA-Z]/g) || []).length;
    const digits = (text.match(/\d/g) || []).length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim()).length || (text.trim() ? 1 : 0);
    const readingTime = words > 0 ? Math.max(1, Math.ceil(words / 200)) : 0;
    const speakingTime = words > 0 ? Math.max(1, Math.ceil(words / 130)) : 0;
    const avgWordLen = words > 0
      ? (wordList.reduce((a, w) => a + w.replace(/[^a-zA-Z]/g, '').length, 0) / words).toFixed(1)
      : '0';
    const uniqueWords = new Set(wordList.map(w => w.toLowerCase().replace(/[^a-z]/g, ''))).size;
    return { words, chars, charsNoSp, letters, digits, sentences, paragraphs, readingTime, speakingTime, avgWordLen, uniqueWords };
  }, [text]);

  if (!text.trim()) return null;

  return (
    <div className="space-y-5">
      {/* Hero count */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white text-center shadow-lg shadow-blue-500/20">
        <p className="text-xs font-black uppercase tracking-[0.2em] opacity-70 mb-1">Total Words</p>
        <p className="text-5xl sm:text-6xl font-black tabular-nums">{s.words.toLocaleString()}</p>
        <p className="text-sm opacity-70 mt-1">{s.uniqueWords} unique words</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatCard label="Characters" value={s.chars.toLocaleString()} icon={Hash} accent="border-violet-100 dark:border-violet-900/30 text-violet-600 dark:text-violet-400" />
        <StatCard label="No Spaces" value={s.charsNoSp.toLocaleString()} icon={Type} accent="border-indigo-100 dark:border-indigo-900/30 text-indigo-600 dark:text-indigo-400" />
        <StatCard label="Letters" value={s.letters.toLocaleString()} icon={AlignLeft} accent="border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400" />
        <StatCard label="Sentences" value={s.sentences.toLocaleString()} icon={BookOpen} accent="border-amber-100 dark:border-amber-900/30 text-amber-600 dark:text-amber-400" />
        <StatCard label="Paragraphs" value={s.paragraphs.toLocaleString()} icon={AlignLeft} accent="border-orange-100 dark:border-orange-900/30 text-orange-600 dark:text-orange-400" />
        <StatCard label="Avg Word" value={s.avgWordLen} icon={TrendingUp} accent="border-cyan-100 dark:border-cyan-900/30 text-cyan-600 dark:text-cyan-400" subtitle="letters" />
      </div>

      <SectionBox title="Reading & Speaking Estimates">
        <div className="space-y-4">
          {[
            { label: 'Slow Reader', wpm: 150, time: Math.max(1, Math.ceil(s.words / 150)), pct: 33, color: 'bg-rose-400', textColor: 'text-rose-600 dark:text-rose-400' },
            { label: 'Average Reader', wpm: 200, time: s.readingTime, pct: 55, color: 'bg-amber-400', textColor: 'text-amber-600 dark:text-amber-400' },
            { label: 'Fast Reader', wpm: 300, time: Math.max(1, Math.ceil(s.words / 300)), pct: 80, color: 'bg-emerald-400', textColor: 'text-emerald-600 dark:text-emerald-400' },
            { label: 'Speaking Aloud', wpm: 130, time: s.speakingTime, pct: 25, color: 'bg-blue-400', textColor: 'text-blue-600 dark:text-blue-400' },
          ].map(r => (
            <div key={r.label} className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400 w-28 shrink-0">{r.label}</span>
              <span className="text-[10px] text-slate-400 w-16 shrink-0">{r.wpm} wpm</span>
              <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <div className={`h-full rounded-full ${r.color}`} style={{ width: `${r.pct}%` }} />
              </div>
              <span className={`text-sm font-black tabular-nums w-16 text-right ${r.textColor}`}>~{r.time}m</span>
            </div>
          ))}
        </div>
      </SectionBox>
    </div>
  );
}

// ─── Character Counter Output ─────────────────────────────────────────────────
function CharacterCounterResult({ text }: { text: string }) {
  const s = useMemo(() => ({
    withSpaces: text.length,
    withoutSpaces: text.replace(/\s/g, '').length,
    words: text.trim() ? text.trim().split(/\s+/).length : 0,
    letters: (text.match(/[a-zA-Z]/g) || []).length,
    digits: (text.match(/\d/g) || []).length,
    spaces: (text.match(/[ \t]/g) || []).length,
    newlines: (text.match(/\n/g) || []).length,
    special: (text.match(/[^a-zA-Z0-9\s]/g) || []).length,
    uppercase: (text.match(/[A-Z]/g) || []).length,
    lowercase: (text.match(/[a-z]/g) || []).length,
  }), [text]);

  if (!text) return null;

  const total = s.withSpaces || 1;
  const segments = [
    { label: 'Letters', count: s.letters, color: 'bg-blue-500' },
    { label: 'Digits', count: s.digits, color: 'bg-emerald-500' },
    { label: 'Spaces', count: s.spaces, color: 'bg-amber-400' },
    { label: 'Special', count: s.special, color: 'bg-rose-500' },
    { label: 'Newlines', count: s.newlines, color: 'bg-violet-400' },
  ];
  const nonZero = segments.filter(s => s.count > 0);

  return (
    <div className="space-y-5">
      <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-6 text-white text-center shadow-lg shadow-violet-500/20">
        <p className="text-xs font-black uppercase tracking-[0.2em] opacity-70 mb-1">Characters (with spaces)</p>
        <p className="text-5xl sm:text-6xl font-black tabular-nums">{s.withSpaces.toLocaleString()}</p>
        <p className="text-sm opacity-70 mt-1">{s.withoutSpaces.toLocaleString()} without spaces</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Letters" value={s.letters.toLocaleString()} icon={AlignLeft} accent="border-blue-100 dark:border-blue-900/30 text-blue-600 dark:text-blue-400" />
        <StatCard label="Digits" value={s.digits.toLocaleString()} icon={Hash} accent="border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400" />
        <StatCard label="Spaces" value={s.spaces.toLocaleString()} icon={Type} accent="border-amber-100 dark:border-amber-900/30 text-amber-600 dark:text-amber-400" />
        <StatCard label="Special" value={s.special.toLocaleString()} icon={Zap} accent="border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400" />
      </div>

      <SectionBox title="Character Breakdown">
        {/* Stacked proportion bar */}
        <div className="flex h-5 rounded-xl overflow-hidden gap-0.5 mb-5">
          {nonZero.map(seg => (
            <div
              key={seg.label}
              className={`${seg.color} transition-all`}
              style={{ flex: seg.count }}
              title={`${seg.label}: ${seg.count}`}
            />
          ))}
        </div>
        <div className="space-y-2.5">
          {segments.map(seg => (
            <BarRow key={seg.label} label={seg.label} count={seg.count} total={total} color={seg.color} />
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-3">
          <div className="text-center">
            <p className="text-xs text-slate-400 uppercase tracking-wide font-bold">Uppercase</p>
            <p className="text-xl font-black text-blue-600 dark:text-blue-400">{s.uppercase}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-400 uppercase tracking-wide font-bold">Lowercase</p>
            <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">{s.lowercase}</p>
          </div>
        </div>
      </SectionBox>
    </div>
  );
}

// ─── Letter Counter Output ────────────────────────────────────────────────────
function LetterCounterResult({ text }: { text: string }) {
  const { total, uniqueCount, topLetters, vowelCount, consonantCount } = useMemo(() => {
    const letters = (text.match(/[a-zA-Z]/g) || []);
    const freq: Record<string, number> = {};
    letters.forEach(l => { const k = l.toLowerCase(); freq[k] = (freq[k] || 0) + 1; });
    const topLetters = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 12);
    const VOWELS = new Set(['a','e','i','o','u']);
    const vowelCount = letters.filter(l => VOWELS.has(l.toLowerCase())).length;
    return { total: letters.length, uniqueCount: Object.keys(freq).length, topLetters, vowelCount, consonantCount: letters.length - vowelCount };
  }, [text]);

  if (!text.trim()) return null;

  const maxCount = topLetters[0]?.[1] || 1;
  const COLORS = ['bg-emerald-500','bg-teal-500','bg-cyan-500','bg-blue-500','bg-indigo-500','bg-violet-500','bg-purple-500','bg-fuchsia-500','bg-pink-500','bg-rose-500','bg-orange-500','bg-amber-500'];

  return (
    <div className="space-y-5">
      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg shadow-emerald-500/20">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] opacity-70 mb-1">Total Letters</p>
            <p className="text-5xl font-black tabular-nums">{total.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-black uppercase tracking-[0.2em] opacity-70 mb-1">Unique</p>
            <p className="text-5xl font-black tabular-nums">{uniqueCount}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Vowels" value={vowelCount.toLocaleString()} icon={Type} accent="border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400" subtitle="a e i o u" />
        <StatCard label="Consonants" value={consonantCount.toLocaleString()} icon={AlignLeft} accent="border-blue-100 dark:border-blue-900/30 text-blue-600 dark:text-blue-400" />
      </div>

      {topLetters.length > 0 && (
        <SectionBox title="Top 12 Letters by Frequency">
          <div className="space-y-2.5">
            {topLetters.map(([l, n], i) => (
              <BarRow key={l} label={`'${l.toUpperCase()}'`} count={n} total={maxCount} color={COLORS[i % COLORS.length]} showPct={false} />
            ))}
          </div>
        </SectionBox>
      )}
    </div>
  );
}

// ─── Reading Time Output ──────────────────────────────────────────────────────
function ReadingTimeResult({ text }: { text: string }) {
  const s = useMemo(() => {
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    return {
      words,
      chars,
      slow: words > 0 ? Math.max(1, Math.ceil(words / 150)) : 0,
      avg: words > 0 ? Math.max(1, Math.ceil(words / 200)) : 0,
      fast: words > 0 ? Math.max(1, Math.ceil(words / 300)) : 0,
      speaking: words > 0 ? Math.max(1, Math.ceil(words / 130)) : 0,
      pages: (words / 250).toFixed(1),
    };
  }, [text]);

  if (!text.trim()) return null;

  const tiers = [
    { label: 'Slow Reader', wpm: 150, time: s.slow, bar: 75, color: 'from-rose-400 to-rose-500', textColor: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-900/10 border-rose-100 dark:border-rose-900/30' },
    { label: 'Average Reader', wpm: 200, time: s.avg, bar: 55, color: 'from-amber-400 to-amber-500', textColor: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/30' },
    { label: 'Speed Reader', wpm: 300, time: s.fast, bar: 35, color: 'from-emerald-400 to-emerald-500', textColor: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30' },
    { label: 'Speaking Aloud', wpm: 130, time: s.speaking, bar: 88, color: 'from-blue-400 to-blue-500', textColor: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30' },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Words" value={s.words.toLocaleString()} icon={FileText} accent="border-blue-100 dark:border-blue-900/30 text-blue-600 dark:text-blue-400" />
        <StatCard label="Avg Read" value={`${s.avg}m`} icon={Clock} accent="border-amber-100 dark:border-amber-900/30 text-amber-600 dark:text-amber-400" subtitle="200 wpm" />
        <StatCard label="~Pages" value={s.pages} icon={BookOpen} accent="border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400" subtitle="250 w/pg" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {tiers.map(t => (
          <div key={t.label} className={`rounded-2xl border p-4 ${t.bg}`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-black uppercase tracking-widest ${t.textColor}`}>{t.label}</span>
              <span className="text-[10px] text-slate-400 font-semibold">{t.wpm} wpm</span>
            </div>
            <p className={`text-3xl font-black tabular-nums ${t.textColor}`}>~{t.time} <span className="text-base">min</span></p>
            <div className="mt-3 h-1.5 bg-white/50 dark:bg-black/20 rounded-full overflow-hidden">
              <div className={`h-full bg-gradient-to-r ${t.color} rounded-full`} style={{ width: `${t.bar}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Line / Sentence / Paragraph Counter ──────────────────────────────────────
function SimpleCounterResult({ text, toolId }: { text: string; toolId: string }) {
  const s = useMemo(() => {
    const lines = text ? text.split(/\r?\n/) : [];
    const nonEmpty = lines.filter(l => l.trim() !== '');
    const emptyLines = lines.length - nonEmpty.length;
    // Proper sentence splitting: split on .!? followed by space/end, filter empties
    const sentences = text.trim()
      ? text.split(/(?<=[.!?])\s+(?=[A-Z"'\u201C\u2018])|(?<=[.!?])$/).map(s => s.trim()).filter(s => s.length > 0)
      : [];
    const sentenceCount = sentences.length || (text.trim() ? 1 : 0);
    const paragraphs = text.trim()
      ? text.split(/\n\s*\n/).filter(p => p.trim().length > 0)
      : [];
    const paragraphCount = paragraphs.length || (text.trim() ? 1 : 0);
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    const avgWordsPerSentence = sentenceCount > 0 ? Math.round(words / sentenceCount) : 0;
    const avgWordsPerParagraph = paragraphCount > 0 ? Math.round(words / paragraphCount) : 0;
    return { lines: lines.length, nonEmpty: nonEmpty.length, emptyLines, sentences: sentenceCount, paragraphs: paragraphCount, words, chars, avgWordsPerSentence, avgWordsPerParagraph };
  }, [text]);

  if (!text.trim()) return null;

  const gradients: Record<string, string> = {
    'line-counter': 'from-blue-500 to-cyan-600',
    'sentence-counter': 'from-violet-500 to-purple-600',
    'paragraph-counter': 'from-orange-500 to-amber-600',
  };
  const mainValue = toolId === 'line-counter' ? s.lines : toolId === 'sentence-counter' ? s.sentences : s.paragraphs;
  const mainLabel = toolId === 'line-counter' ? 'Lines' : toolId === 'sentence-counter' ? 'Sentences' : 'Paragraphs';

  const cards = toolId === 'line-counter' ? [
    { label: 'Non-Empty', value: s.nonEmpty, icon: AlignLeft, accent: 'border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400' },
    { label: 'Empty Lines', value: s.emptyLines, icon: Type, accent: 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400' },
    { label: 'Words', value: s.words, icon: FileText, accent: 'border-amber-100 dark:border-amber-900/30 text-amber-600 dark:text-amber-400' },
    { label: 'Characters', value: s.chars, icon: Hash, accent: 'border-violet-100 dark:border-violet-900/30 text-violet-600 dark:text-violet-400' },
  ] : toolId === 'sentence-counter' ? [
    { label: 'Words', value: s.words, icon: FileText, accent: 'border-blue-100 dark:border-blue-900/30 text-blue-600 dark:text-blue-400' },
    { label: 'Paragraphs', value: s.paragraphs, icon: AlignLeft, accent: 'border-amber-100 dark:border-amber-900/30 text-amber-600 dark:text-amber-400' },
    { label: 'Lines', value: s.lines, icon: List, accent: 'border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400' },
    { label: 'Avg Words/Sent', value: s.avgWordsPerSentence, icon: Activity, accent: 'border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400' },
  ] : [
    { label: 'Words', value: s.words, icon: FileText, accent: 'border-blue-100 dark:border-blue-900/30 text-blue-600 dark:text-blue-400' },
    { label: 'Sentences', value: s.sentences, icon: Type, accent: 'border-violet-100 dark:border-violet-900/30 text-violet-600 dark:text-violet-400' },
    { label: 'Lines', value: s.lines, icon: List, accent: 'border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400' },
    { label: 'Avg Words/Para', value: s.avgWordsPerParagraph, icon: Activity, accent: 'border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400' },
  ];

  return (
    <div className="space-y-5">
      <div className={`bg-gradient-to-br ${gradients[toolId] || 'from-slate-600 to-slate-800'} rounded-2xl p-6 text-white text-center shadow-lg`}>
        <p className="text-xs font-black uppercase tracking-[0.2em] opacity-70 mb-1">{mainLabel}</p>
        <p className="text-5xl sm:text-6xl font-black tabular-nums">{mainValue.toLocaleString()}</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {cards.map(c => (
          <StatCard key={c.label} label={c.label} value={c.value.toLocaleString()} icon={c.icon} accent={c.accent} />
        ))}
      </div>
    </div>
  );
}

// ─── Text Density Output ──────────────────────────────────────────────────────
function TextDensityResult({ text }: { text: string }) {
  const [showStopWords, setShowStopWords] = useState(false);
  const { freq, allFreq, total, uniqueWords } = useMemo(() => {
    const STOP = new Set(['the','a','an','is','it','in','on','at','to','for','of','and','or','but','not','be','are','was','were','has','have','had','do','does','did','will','would','could','should','may','might','that','this','these','those','with','from','by','as','if','so','up','out','no','my','we','you','he','she','they','i','its','than','then','when','where','how','what','who','which','their','there','here','about','after','before','into','over','just','more','also','can','all','been','your','our','us','am','her','his','him','they','them','its','your','been']);
    const words = text.toLowerCase().match(/\b[a-z]{2,}\b/g) || [];
    const allMap: Record<string, number> = {};
    words.forEach(w => { allMap[w] = (allMap[w] || 0) + 1; });
    const allFreq = Object.entries(allMap).sort((a, b) => b[1] - a[1]);
    const keywordFreq = allFreq.filter(([w]) => !STOP.has(w));
    const uniqueWords = Object.keys(allMap).length;
    return { freq: keywordFreq.slice(0, 15), allFreq: allFreq.slice(0, 15), total: words.length, uniqueWords };
  }, [text]);

  if (!text.trim() || !freq.length) return null;

  const displayFreq = showStopWords ? allFreq : freq;
  const maxCount = displayFreq[0]?.[1] || 1;
  const COLORS = ['bg-violet-500','bg-blue-500','bg-cyan-500','bg-teal-500','bg-emerald-500','bg-green-500','bg-lime-500','bg-yellow-500','bg-amber-500','bg-orange-500','bg-red-500','bg-rose-500','bg-pink-500','bg-fuchsia-500','bg-purple-500'];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Total Words" value={total.toLocaleString()} icon={BarChart2} accent="border-violet-100 dark:border-violet-900/30 text-violet-600 dark:text-violet-400" />
        <StatCard label="Unique Words" value={uniqueWords.toLocaleString()} icon={Sparkles} accent="border-blue-100 dark:border-blue-900/30 text-blue-600 dark:text-blue-400" />
        <StatCard label="Keywords" value={freq.length} icon={Target} accent="border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400" />
      </div>
      <div className="rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
          <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
            {showStopWords ? 'All Words' : 'Keywords'} (top 15)
          </p>
          <button
            onClick={() => setShowStopWords(v => !v)}
            className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            {showStopWords ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            {showStopWords ? 'Hide stop words' : 'Show all words'}
          </button>
        </div>
        <div className="p-5 space-y-2.5 bg-slate-50 dark:bg-slate-950">
          {displayFreq.map(([word, count], i) => (
            <BarRow key={word} label={word} count={count} total={maxCount} color={COLORS[i % COLORS.length]} showPct={false} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Case Distribution Output ─────────────────────────────────────────────────
function CaseDistributionResult({ text }: { text: string }) {
  const s = useMemo(() => {
    const upper = (text.match(/[A-Z]/g) || []).length;
    const lower = (text.match(/[a-z]/g) || []).length;
    const nums = (text.match(/[0-9]/g) || []).length;
    const space = (text.match(/[ \t]/g) || []).length;
    const newlines = (text.match(/\n/g) || []).length;
    const special = text.length - upper - lower - nums - space - newlines;
    const total = text.length || 1;
    const letters = upper + lower;
    const caseRatio = letters > 0 ? Math.round((upper / letters) * 100) : 0;
    return { upper, lower, nums, space, newlines, special, total, caseRatio };
  }, [text]);

  if (!text) return null;

  const segments = [
    { label: 'Uppercase', count: s.upper, color: 'bg-blue-500', badge: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' },
    { label: 'Lowercase', count: s.lower, color: 'bg-emerald-500', badge: 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300' },
    { label: 'Numbers', count: s.nums, color: 'bg-amber-500', badge: 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300' },
    { label: 'Spaces', count: s.space, color: 'bg-slate-400', badge: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400' },
    { label: 'Special', count: s.special + s.newlines, color: 'bg-rose-500', badge: 'bg-rose-100 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300' },
  ];
  const nonZero = segments.filter(s => s.count > 0);

  return (
    <div className="space-y-5">
      {/* Proportion bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5">
        <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4">Character Distribution</p>
        <div className="flex h-8 rounded-xl overflow-hidden gap-0.5 mb-5 shadow-inner">
          {nonZero.map(seg => (
            <div
              key={seg.label}
              className={`${seg.color} transition-all flex items-center justify-center`}
              style={{ flex: seg.count }}
              title={`${seg.label}: ${seg.count} (${s.total > 0 ? Math.round(seg.count / s.total * 100) : 0}%)`}
            />
          ))}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {segments.map(seg => (
            <div key={seg.label} className={`flex flex-col items-center p-3 rounded-xl ${seg.badge}`}>
              <span className="text-2xl font-black tabular-nums">{seg.count.toLocaleString()}</span>
              <span className="text-[10px] font-bold text-center mt-0.5 opacity-80">{seg.label}</span>
              <span className="text-[10px] opacity-60">{s.total > 0 ? Math.round(seg.count / s.total * 100) : 0}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-2xl p-5 text-center">
          <p className="text-xs font-black uppercase tracking-wide text-blue-600 dark:text-blue-400 mb-1">Upper/Lower Ratio</p>
          <p className="text-3xl font-black text-blue-600 dark:text-blue-400">{s.caseRatio}%</p>
          <p className="text-[10px] text-slate-400 mt-1">uppercase of all letters</p>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl p-5 text-center">
          <p className="text-xs font-black uppercase tracking-wide text-emerald-600 dark:text-emerald-400 mb-1">Total Characters</p>
          <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{s.total.toLocaleString()}</p>
          <p className="text-[10px] text-slate-400 mt-1">including all types</p>
        </div>
      </div>
    </div>
  );
}

// ─── Extract Emails Output ────────────────────────────────────────────────────
function ExtractEmailsResult({ text, onCopySingle }: { text: string; onCopySingle: (s: string) => void }) {
  const emails = useMemo(() => {
    const found = (text.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/gi) || []);
    return [...new Set(found)]; // deduplicate
  }, [text]);

  const domains = useMemo(() => {
    const domainMap: Record<string, number> = {};
    emails.forEach(e => {
      const d = e.split('@')[1]?.toLowerCase();
      if (d) domainMap[d] = (domainMap[d] || 0) + 1;
    });
    return Object.entries(domainMap).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [emails]);

  if (!text.trim()) return null;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Emails Found" value={emails.length} icon={Mail} accent="border-blue-100 dark:border-blue-900/30 text-blue-600 dark:text-blue-400" large />
        <StatCard label="Unique Domains" value={domains.length} icon={Hash} accent="border-violet-100 dark:border-violet-900/30 text-violet-600 dark:text-violet-400" large />
      </div>

      {domains.length > 0 && (
        <SectionBox title="Top Domains">
          <div className="space-y-2">
            {domains.map(([domain, count]) => (
              <BarRow key={domain} label={domain} count={count} total={emails.length} color="bg-blue-500" />
            ))}
          </div>
        </SectionBox>
      )}

      <SectionBox title={`Extracted Emails — ${emails.length} found (click to copy)`}>
        <BadgeList
          items={emails}
          color="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30"
          onCopy={onCopySingle}
        />
      </SectionBox>
    </div>
  );
}

// ─── Extract URLs Output ──────────────────────────────────────────────────────
function ExtractURLsResult({ text, onCopySingle }: { text: string; onCopySingle: (s: string) => void }) {
  const urls = useMemo(() => {
    const found = (text.match(/https?:\/\/[^\s"'<>)\]]+/g) || []).map(u => u.replace(/[.,;:!?]+$/, ''));
    return [...new Set(found)];
  }, [text]);

  const protocols = useMemo(() => {
    const https = urls.filter(u => u.startsWith('https')).length;
    return { https, http: urls.length - https };
  }, [urls]);

  if (!text.trim()) return null;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="URLs Found" value={urls.length} icon={Link2} accent="border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400" large />
        <StatCard label="HTTPS" value={protocols.https} icon={ShieldCheck} accent="border-blue-100 dark:border-blue-900/30 text-blue-600 dark:text-blue-400" />
        <StatCard label="HTTP" value={protocols.http} icon={Shield} accent="border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400" />
      </div>

      <SectionBox title={`Extracted URLs — ${urls.length} found (click to copy)`}>
        <BadgeList
          items={urls}
          color="bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/30"
          onCopy={onCopySingle}
        />
      </SectionBox>
    </div>
  );
}

// ─── Character Frequency Output ───────────────────────────────────────────────
function CharFrequencyResult({ text }: { text: string }) {
  const [showAll, setShowAll] = useState(false);
  const { entries, total, uniqueCount } = useMemo(() => {
    const freq: Record<string, number> = {};
    text.split('').forEach(c => { freq[c] = (freq[c] || 0) + 1; });
    const entries = Object.entries(freq).sort((a, b) => b[1] - a[1]);
    return { entries, total: text.length, uniqueCount: entries.length };
  }, [text]);

  if (!text) return null;

  const display = showAll ? entries : entries.slice(0, 20);
  const maxCount = entries[0]?.[1] || 1;
  const COLORS = ['bg-violet-500','bg-blue-500','bg-cyan-500','bg-teal-500','bg-emerald-500','bg-green-500','bg-lime-500','bg-yellow-500','bg-amber-500','bg-orange-500','bg-red-500','bg-rose-500','bg-pink-500','bg-fuchsia-500','bg-purple-500','bg-indigo-500','bg-sky-500','bg-slate-500','bg-zinc-500','bg-stone-500'];

  const getLabel = (c: string) => {
    if (c === ' ') return 'SPACE';
    if (c === '\n') return '↵ NEWLINE';
    if (c === '\t') return '⇥ TAB';
    if (c === '\r') return 'CR';
    return `'${c}'`;
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Unique Chars" value={uniqueCount} icon={Hash} accent="border-violet-100 dark:border-violet-900/30 text-violet-600 dark:text-violet-400" large />
        <StatCard label="Total Chars" value={total.toLocaleString()} icon={FileText} accent="border-blue-100 dark:border-blue-900/30 text-blue-600 dark:text-blue-400" large />
      </div>

      <div className="rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
          <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
            Character Frequency (top {display.length} of {entries.length})
          </p>
          {entries.length > 20 && (
            <button
              onClick={() => setShowAll(v => !v)}
              className="text-[10px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              {showAll ? 'Show less' : `Show all ${entries.length}`}
            </button>
          )}
        </div>
        <div className="p-5 bg-slate-50 dark:bg-slate-950 space-y-2 max-h-96 overflow-y-auto">
          {display.map(([c, n], i) => (
            <BarRow key={i} label={getLabel(c)} count={n} total={maxCount} color={COLORS[i % COLORS.length]} showPct={false} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Word Length Stats Output ─────────────────────────────────────────────────
function WordLengthResult({ text }: { text: string }) {
  const s = useMemo(() => {
    const words = text.match(/\b\w+\b/g);
    if (!words || words.length === 0) return null;
    const lengths = words.map(w => w.length);
    const totalLen = words.reduce((a, w) => a + w.length, 0);
    const avg = (totalLen / words.length).toFixed(2);
    const max = Math.max(...lengths);
    const min = Math.min(...lengths);
    const longestWord = words.reduce((a, b) => a.length >= b.length ? a : b, '');
    const shortestWord = words.reduce((a, b) => a.length <= b.length ? a : b, words[0]);

    const dist: Record<number, number> = {};
    lengths.forEach(l => { dist[l] = (dist[l] || 0) + 1; });
    const distEntries = Object.entries(dist)
      .map(([len, count]) => ({ len: parseInt(len), count }))
      .sort((a, b) => a.len - b.len);
    const maxDist = Math.max(...distEntries.map(e => e.count));

    // Most common length
    const mode = distEntries.reduce((a, b) => a.count >= b.count ? a : b, distEntries[0]);

    return { avg, max, min, longestWord, shortestWord, total: words.length, distEntries, maxDist, mode };
  }, [text]);

  if (!text.trim() || !s) return null;

  const COLORS = ['bg-violet-500','bg-blue-500','bg-cyan-500','bg-teal-500','bg-emerald-500','bg-green-500','bg-lime-500','bg-yellow-500','bg-amber-500','bg-orange-500','bg-red-500','bg-rose-500','bg-pink-500','bg-fuchsia-500','bg-purple-500'];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total Words" value={s.total} icon={FileText} accent="border-blue-100 dark:border-blue-900/30 text-blue-600 dark:text-blue-400" />
        <StatCard label="Avg Length" value={s.avg} icon={Activity} accent="border-violet-100 dark:border-violet-900/30 text-violet-600 dark:text-violet-400" subtitle="letters/word" />
        <StatCard label="Shortest" value={`${s.min}L`} icon={TrendingUp} accent="border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400" subtitle={`"${s.shortestWord}"`} />
        <StatCard label="Longest" value={`${s.max}L`} icon={TrendingUp} accent="border-amber-100 dark:border-amber-900/30 text-amber-600 dark:text-amber-400" subtitle={`"${s.longestWord.slice(0,10)}${s.longestWord.length > 10 ? '…' : ''}"`} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl p-4 text-center">
          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-1">Most Common Length</p>
          <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{s.mode?.len} <span className="text-base">letters</span></p>
          <p className="text-[10px] text-slate-400 mt-1">{s.mode?.count} words</p>
        </div>
        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-2xl p-4 text-center">
          <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-1">Longest Word</p>
          <p className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono break-all">
            {s.longestWord.length > 16 ? s.longestWord.slice(0, 16) + '…' : s.longestWord}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">{s.max} letters</p>
        </div>
      </div>

      <SectionBox title="Word Length Distribution">
        <div className="space-y-2">
          {s.distEntries.map(({ len, count }, i) => (
            <BarRow key={len} label={`${len} letter${len !== 1 ? 's' : ''}`} count={count} total={s.maxDist} color={COLORS[i % COLORS.length]} showPct={false} />
          ))}
        </div>
      </SectionBox>
    </div>
  );
}

// ─── Age Calculator Output ────────────────────────────────────────────────────
function AgeCalculatorOutput({ dateValue }: { dateValue: string }) {
  const result = useMemo(() => {
    if (!dateValue) return null;
    const birth = new Date(dateValue);
    const now = new Date();
    if (isNaN(birth.getTime()) || birth > now) return null;

    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();
    let days = now.getDate() - birth.getDate();
    if (days < 0) { months--; days += new Date(now.getFullYear(), now.getMonth(), 0).getDate(); }
    if (months < 0) { years--; months += 12; }

    const totalDays = Math.floor((now.getTime() - birth.getTime()) / 86400000);
    const totalWeeks = Math.floor(totalDays / 7);
    const totalMonths = years * 12 + months;
    const totalHours = totalDays * 24;
    const nextBirthday = new Date(now.getFullYear(), birth.getMonth(), birth.getDate());
    if (nextBirthday <= now) nextBirthday.setFullYear(now.getFullYear() + 1);
    const daysToNext = Math.ceil((nextBirthday.getTime() - now.getTime()) / 86400000);
    const dayOfWeek = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][birth.getDay()];
    const zodiac = getZodiac(birth.getMonth() + 1, birth.getDate());

    return { years, months, days, totalDays, totalWeeks, totalMonths, totalHours, daysToNext, dayOfWeek, zodiac };
  }, [dateValue]);

  if (!result) return null;

  return (
    <div className="space-y-5">
      <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl p-6 text-white shadow-lg shadow-amber-500/20">
        <p className="text-xs font-black uppercase tracking-[0.2em] opacity-70 mb-2 text-center">Your Age</p>
        <p className="text-5xl sm:text-6xl font-black text-center tabular-nums">
          {result.years} <span className="text-2xl font-semibold opacity-80">years</span>
        </p>
        <p className="text-center text-lg opacity-80 mt-2">
          {result.months} months & {result.days} days
        </p>
        {result.zodiac && (
          <p className="text-center text-sm opacity-60 mt-1">{result.zodiac} • Born on {result.dayOfWeek}</p>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total Days" value={result.totalDays.toLocaleString()} icon={Calendar} accent="border-blue-100 dark:border-blue-900/30 text-blue-600 dark:text-blue-400" />
        <StatCard label="Total Weeks" value={result.totalWeeks.toLocaleString()} icon={Calendar} accent="border-violet-100 dark:border-violet-900/30 text-violet-600 dark:text-violet-400" />
        <StatCard label="Total Months" value={result.totalMonths.toLocaleString()} icon={Calendar} accent="border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400" />
        <StatCard label="Days to Birthday" value={result.daysToNext} icon={Zap} accent="border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400" />
      </div>
      <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl p-5">
        <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">Fun Facts</p>
        <div className="grid grid-cols-2 gap-3 text-center">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Hours Lived</p>
            <p className="text-xl font-black text-slate-700 dark:text-slate-300 tabular-nums">{result.totalHours.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Next Birthday In</p>
            <p className="text-xl font-black text-slate-700 dark:text-slate-300 tabular-nums">{result.daysToNext} days</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function getZodiac(month: number, day: number): string {
  const signs = [
    { name: '♑ Capricorn', start: [12, 22] }, { name: '♒ Aquarius', start: [1, 20] },
    { name: '♓ Pisces', start: [2, 19] }, { name: '♈ Aries', start: [3, 21] },
    { name: '♉ Taurus', start: [4, 20] }, { name: '♊ Gemini', start: [5, 21] },
    { name: '♋ Cancer', start: [6, 21] }, { name: '♌ Leo', start: [7, 23] },
    { name: '♍ Virgo', start: [8, 23] }, { name: '♎ Libra', start: [9, 23] },
    { name: '♏ Scorpio', start: [10, 23] }, { name: '♐ Sagittarius', start: [11, 22] },
  ];
  for (let i = signs.length - 1; i >= 0; i--) {
    const [m, d] = signs[i].start;
    if (month > m || (month === m && day >= d)) return signs[i].name;
  }
  return signs[0].name;
}

// ─── JWT Decoder Output ───────────────────────────────────────────────────────
function JWTResult({ text }: { text: string }) {
  const [showRaw, setShowRaw] = useState(false);
  const result = useMemo(() => {
    const t = text.trim();
    if (!t) return null;
    try {
      const parts = t.split('.');
      if (parts.length !== 3) return { error: 'Invalid JWT: expected 3 dot-separated parts' };
      
      // Handle URL-safe base64 padding
      const b64decode = (s: string) => {
        const pad = s.length % 4 === 0 ? s : s + '='.repeat(4 - s.length % 4);
        return atob(pad.replace(/-/g, '+').replace(/_/g, '/'));
      };
      
      const header = JSON.parse(b64decode(parts[0]));
      const payload = JSON.parse(b64decode(parts[1]));
      const now = Math.floor(Date.now() / 1000);
      const isExpired = payload.exp ? payload.exp < now : null;
      const expiresAt = payload.exp ? new Date(payload.exp * 1000).toLocaleString() : null;
      const issuedAt = payload.iat ? new Date(payload.iat * 1000).toLocaleString() : null;
      const notBefore = payload.nbf ? new Date(payload.nbf * 1000).toLocaleString() : null;
      return { header, payload, isExpired, expiresAt, issuedAt, notBefore, signature: parts[2] };
    } catch (e) {
      return { error: `Decode error: ${(e as Error).message}` };
    }
  }, [text]);

  if (!text.trim()) return null;

  if (!result) return null;

  if ('error' in result) return (
    <div className="flex items-center gap-3 p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-2xl">
      <Shield className="w-5 h-5 text-rose-500 flex-shrink-0" />
      <p className="text-sm text-rose-700 dark:text-rose-300 font-semibold">{result.error}</p>
    </div>
  );

  const { header, payload, isExpired, expiresAt, issuedAt } = result;

  return (
    <div className="space-y-4">
      {/* Status banner */}
      {isExpired !== null && (
        <div className={`flex items-center gap-3 p-4 rounded-2xl border font-bold text-sm ${isExpired ? 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300' : 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'}`}>
          <ShieldCheck className="w-5 h-5 flex-shrink-0" />
          <div>
            <p>{isExpired ? '⚠ Token is EXPIRED' : '✓ Token is valid (not expired)'}</p>
            {expiresAt && <p className="text-xs opacity-70 mt-0.5 font-normal">Expires: {expiresAt}</p>}
            {issuedAt && <p className="text-xs opacity-70 font-normal">Issued: {issuedAt}</p>}
          </div>
        </div>
      )}

      {/* Algorithm badge */}
      {header?.alg && (
        <div className="flex gap-2">
          <span className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs font-black rounded-lg uppercase tracking-wide border border-blue-200 dark:border-blue-800">
            {header.alg}
          </span>
          {header?.typ && (
            <span className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-black rounded-lg uppercase tracking-wide border border-slate-200 dark:border-slate-700">
              {header.typ}
            </span>
          )}
        </div>
      )}

      {/* Header */}
      <div className="rounded-2xl border border-blue-100 dark:border-blue-900/30 overflow-hidden">
        <div className="px-4 py-2.5 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-900/30">
          <p className="text-[11px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">Header</p>
        </div>
        <pre className="p-4 text-xs font-mono text-slate-700 dark:text-slate-300 overflow-auto bg-white dark:bg-slate-900 max-h-48">
          {JSON.stringify(header, null, 2)}
        </pre>
      </div>

      {/* Payload */}
      <div className="rounded-2xl border border-emerald-100 dark:border-emerald-900/30 overflow-hidden">
        <div className="px-4 py-2.5 bg-emerald-50 dark:bg-emerald-900/20 border-b border-emerald-100 dark:border-emerald-900/30">
          <p className="text-[11px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Payload</p>
        </div>
        <pre className="p-4 text-xs font-mono text-slate-700 dark:text-slate-300 overflow-auto bg-white dark:bg-slate-900 max-h-64">
          {JSON.stringify(payload, null, 2)}
        </pre>
      </div>

      {/* Signature */}
      <div className="rounded-2xl border border-amber-100 dark:border-amber-900/30 overflow-hidden">
        <div className="px-4 py-2.5 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-100 dark:border-amber-900/30">
          <p className="text-[11px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">Signature (encoded)</p>
        </div>
        <p className="p-4 text-xs font-mono text-slate-600 dark:text-slate-400 break-all bg-white dark:bg-slate-900">
          {result.signature}
        </p>
      </div>
    </div>
  );
}

// ─── Text Diff Output ─────────────────────────────────────────────────────────
function TextDiffWorkspace() {
  const [original, setOriginal] = useState('');
  const [modified, setModified] = useState('');

  const diff = useMemo(() => {
    if (!original && !modified) return null;
    
    // Line-level diff using LCS
    const origLines = original.split('\n');
    const modLines = modified.split('\n');

    // LCS table
    const m = origLines.length, n = modLines.length;
    const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    for (let i = m - 1; i >= 0; i--) {
      for (let j = n - 1; j >= 0; j--) {
        if (origLines[i] === modLines[j]) dp[i][j] = dp[i+1][j+1] + 1;
        else dp[i][j] = Math.max(dp[i+1][j], dp[i][j+1]);
      }
    }

    // Backtrack to build diff
    const result: Array<{ type: 'equal' | 'removed' | 'added'; text: string }> = [];
    let i = 0, j = 0;
    while (i < m || j < n) {
      if (i < m && j < n && origLines[i] === modLines[j]) {
        result.push({ type: 'equal', text: origLines[i] });
        i++; j++;
      } else if (j < n && (i >= m || dp[i][j+1] >= dp[i+1][j])) {
        result.push({ type: 'added', text: modLines[j] });
        j++;
      } else {
        result.push({ type: 'removed', text: origLines[i] });
        i++;
      }
    }

    const added = result.filter(r => r.type === 'added').length;
    const removed = result.filter(r => r.type === 'removed').length;
    const unchanged = result.filter(r => r.type === 'equal').length;
    return { lines: result, added, removed, unchanged };
  }, [original, modified]);

  const stats = diff ? { added: diff.added, removed: diff.removed, unchanged: diff.unchanged } : null;

  return (
    <div className="space-y-5">
      {/* Two input panels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">
            Original Text
          </label>
          <textarea
            value={original}
            onChange={e => setOriginal(e.target.value)}
            placeholder="Paste original text here..."
            className="w-full h-48 p-4 bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-2xl focus:border-rose-400 dark:focus:border-rose-600 focus:ring-0 transition-all resize-none font-mono text-slate-700 dark:text-slate-300 text-sm shadow-inner"
            spellCheck={false}
          />
          <p className="text-[10px] text-slate-400 mt-1 font-semibold">{original.split('\n').length} lines · {original.length} chars</p>
        </div>
        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">
            Modified Text
          </label>
          <textarea
            value={modified}
            onChange={e => setModified(e.target.value)}
            placeholder="Paste modified text here..."
            className="w-full h-48 p-4 bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-2xl focus:border-emerald-400 dark:focus:border-emerald-600 focus:ring-0 transition-all resize-none font-mono text-slate-700 dark:text-slate-300 text-sm shadow-inner"
            spellCheck={false}
          />
          <p className="text-[10px] text-slate-400 mt-1 font-semibold">{modified.split('\n').length} lines · {modified.length} chars</p>
        </div>
      </div>

      {/* Stats */}
      {stats && (original || modified) && (
        <>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl p-4 text-center">
              <p className="text-xs font-black uppercase tracking-wide text-emerald-600 dark:text-emerald-400 mb-1">Added</p>
              <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">+{stats.added}</p>
              <p className="text-[10px] text-slate-400">lines</p>
            </div>
            <div className="bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30 rounded-2xl p-4 text-center">
              <p className="text-xs font-black uppercase tracking-wide text-rose-600 dark:text-rose-400 mb-1">Removed</p>
              <p className="text-3xl font-black text-rose-600 dark:text-rose-400">-{stats.removed}</p>
              <p className="text-[10px] text-slate-400">lines</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-center">
              <p className="text-xs font-black uppercase tracking-wide text-slate-500 mb-1">Unchanged</p>
              <p className="text-3xl font-black text-slate-600 dark:text-slate-300">{stats.unchanged}</p>
              <p className="text-[10px] text-slate-400">lines</p>
            </div>
          </div>

          {/* Diff view */}
          {diff && diff.lines.length > 0 && (
            <div className="rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Diff View</p>
              </div>
              <div className="font-mono text-xs overflow-auto max-h-96 bg-slate-50 dark:bg-slate-950">
                {diff.lines.map((line, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-3 px-4 py-1 border-b border-opacity-50 ${
                      line.type === 'added' ? 'bg-emerald-50 dark:bg-emerald-900/15 border-emerald-100 dark:border-emerald-900/20' :
                      line.type === 'removed' ? 'bg-rose-50 dark:bg-rose-900/15 border-rose-100 dark:border-rose-900/20' :
                      'border-transparent'
                    }`}
                  >
                    <span className={`w-4 shrink-0 font-black text-center mt-0.5 ${
                      line.type === 'added' ? 'text-emerald-500' :
                      line.type === 'removed' ? 'text-rose-500' :
                      'text-slate-300 dark:text-slate-700'
                    }`}>
                      {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '}
                    </span>
                    <span className={`flex-1 whitespace-pre-wrap break-all ${
                      line.type === 'added' ? 'text-emerald-800 dark:text-emerald-200' :
                      line.type === 'removed' ? 'text-rose-800 dark:text-rose-200 line-through opacity-70' :
                      'text-slate-600 dark:text-slate-400'
                    }`}>
                      {line.text || ' '}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {!original && !modified && (
        <div className="text-center py-8 text-slate-400 dark:text-slate-500">
          <Diff className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-semibold">Paste text in both boxes to see differences</p>
        </div>
      )}
    </div>
  );
}

// ─── Image to Text (OCR) ──────────────────────────────────────────────────────
function ImageToTextInput({ onResult }: { onResult: (text: string) => void }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    setFileName(file.name);
    setLoading(true);
    setError('');
    setProgress(0);
    try {
      const result = await Tesseract.recognize(file, 'eng', {
        logger: (m) => { if (m.status === 'recognizing text') setProgress(Math.round(m.progress * 100)); }
      });
      onResult(result.data.text);
    } catch (err) {
      setError('OCR failed. Please try a clearer image.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <label className="block cursor-pointer">
        <div className={`relative border-2 border-dashed rounded-3xl p-8 transition-all ${preview ? 'border-amber-300 dark:border-amber-700 bg-amber-50/30 dark:bg-amber-900/10' : 'border-slate-200 dark:border-slate-700 hover:border-amber-400 dark:hover:border-amber-600 bg-slate-50/50 dark:bg-slate-950/30'}`}>
          <input type="file" accept="image/*" onChange={handleFile} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            {preview ? (
              <>
                <div className="relative w-full max-w-sm aspect-video rounded-2xl overflow-hidden border border-amber-200 dark:border-amber-800 shadow-xl">
                  <img src={preview} alt="Preview" className="w-full h-full object-contain bg-white dark:bg-slate-800" />
                </div>
                <p className="text-sm font-bold text-slate-600 dark:text-slate-400">{fileName} — click to change</p>
              </>
            ) : (
              <>
                <div className="p-6 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-3xl shadow-lg">
                  <Upload className="w-10 h-10 text-amber-500" />
                </div>
                <div>
                  <p className="text-lg font-black text-slate-900 dark:text-white">Drop image or click to upload</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">PNG, JPG, WEBP, GIF supported</p>
                </div>
              </>
            )}
          </div>
        </div>
      </label>
      {loading && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center gap-3">
            <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />
            <span className="text-sm font-bold text-amber-700 dark:text-amber-300">Extracting text... {progress}%</span>
          </div>
          <div className="h-2.5 bg-amber-100 dark:bg-amber-900/30 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}
      {error && <p className="text-sm text-rose-600 dark:text-rose-400 font-semibold bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl p-3">{error}</p>}
    </div>
  );
}

// ─── Generic Plain Output ─────────────────────────────────────────────────────
function PlainOutput({ text }: { text: string }) {
  if (!text) return null;
  return (
    <pre className="w-full min-h-[100px] p-6 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl font-mono text-slate-800 dark:text-slate-200 text-sm whitespace-pre-wrap break-all overflow-auto shadow-inner">
      {text}
    </pre>
  );
}

// ─── Main Workspace ───────────────────────────────────────────────────────────
const TextAnalysisWorkspace: React.FC<Props> = ({
  toolId, process, example, placeholder, toolName, theme
}) => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [ocrText, setOcrText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isAgeCalc = toolId === 'age-calculator';
  const isImageOCR = toolId === 'image-to-text';
  const isJWT = toolId === 'jwt-decoder';
  const isTextDiff = toolId === 'text-diff';

  const isLiveAnalysis = [
    'word-counter', 'character-counter', 'letter-counter', 'reading-time',
    'line-counter', 'sentence-counter', 'paragraph-counter',
    'text-density', 'case-distribution', 'extract-emails', 'extract-urls',
    'char-frequency', 'word-length-stats', 'jwt-decoder',
  ].includes(toolId);

  const stats = useMemo(() => ({
    chars: input.length,
    words: input.trim() ? input.trim().split(/\s+/).length : 0,
    lines: input ? input.split(/\n/).length : 0,
  }), [input]);

  const handleProcess = useCallback(async () => {
    if (isImageOCR || isTextDiff) { setHasRun(true); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 80));
    try {
      const result = process(input);
      setOutput(result);
      setHasRun(true);
    } finally {
      setLoading(false);
    }
  }, [input, process, isImageOCR, isTextDiff]);

  const handleCopy = useCallback(async () => {
    const text = isImageOCR ? ocrText : output;
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [output, ocrText, isImageOCR]);

  const handleCopySingle = useCallback(async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const handleClear = useCallback(() => {
    setInput('');
    setOutput('');
    setHasRun(false);
    setOcrText('');
    textareaRef.current?.focus();
  }, []);

  const handleDownload = useCallback(() => {
    const text = isImageOCR ? ocrText : output;
    if (!text) return;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${toolId}-result.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [output, ocrText, toolId, isImageOCR]);

  const gradientClass = theme?.gradient || 'from-amber-500 to-orange-600';
  const primaryText = theme?.primaryText || 'text-amber-600';
  const bg = theme?.bg || 'bg-amber-50';
  const border = theme?.border || 'border-amber-100';
  const iconBg = theme?.iconBg || 'bg-amber-100 text-amber-600';
  const darkBg = theme?.darkBg || 'dark:bg-amber-900/10';
  const darkBorder = theme?.darkBorder || 'dark:border-amber-800/50';
  const darkSecText = theme?.darkSecondaryText || 'dark:text-amber-400';

  const showLivePanel = isLiveAnalysis && input.trim().length > 0;

  const renderOutput = () => {
    if (isTextDiff) return null; // TextDiffWorkspace renders inline

    if (isImageOCR && ocrText) {
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Extracted Text</p>
            <span className="text-xs text-slate-400 font-semibold">{ocrText.trim().split(/\s+/).filter(Boolean).length} words · {ocrText.length} chars</span>
          </div>
          <pre className="w-full min-h-[120px] max-h-96 p-5 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl font-mono text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap overflow-auto shadow-inner">
            {ocrText}
          </pre>
        </div>
      );
    }

    if (!hasRun && !showLivePanel) return null;

    switch (toolId) {
      case 'word-counter': return <WordCounterResult text={input} />;
      case 'character-counter': return <CharacterCounterResult text={input} />;
      case 'letter-counter': return <LetterCounterResult text={input} />;
      case 'reading-time': return <ReadingTimeResult text={input} />;
      case 'line-counter': return <SimpleCounterResult text={input} toolId="line-counter" />;
      case 'sentence-counter': return <SimpleCounterResult text={input} toolId="sentence-counter" />;
      case 'paragraph-counter': return <SimpleCounterResult text={input} toolId="paragraph-counter" />;
      case 'text-density': return <TextDensityResult text={input} />;
      case 'case-distribution': return <CaseDistributionResult text={input} />;
      case 'extract-emails': return <ExtractEmailsResult text={input} onCopySingle={handleCopySingle} />;
      case 'extract-urls': return <ExtractURLsResult text={input} onCopySingle={handleCopySingle} />;
      case 'char-frequency': return <CharFrequencyResult text={input} />;
      case 'word-length-stats': return <WordLengthResult text={input} />;
      case 'age-calculator': return <AgeCalculatorOutput dateValue={input} />;
      case 'jwt-decoder': return <JWTResult text={input} />;
      default: return output ? <PlainOutput text={output} /> : null;
    }
  };

  const hasOutput = isImageOCR ? !!ocrText : isTextDiff ? false : (hasRun || showLivePanel);
  const outputText = isImageOCR ? ocrText : output;

  // Text-diff is self-contained; render it directly
  if (isTextDiff) {
    return (
      <div className="space-y-6">
        <TextDiffWorkspace />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ─── Input Panel ─── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${iconBg} ${darkBg} ${darkSecText}`}>
              <FileText className="w-5 h-5" />
            </div>
            <label htmlFor="analysis-input" className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">
              Input
            </label>
          </div>
          <div className="flex items-center gap-3">
            {example && !isAgeCalc && !isImageOCR && (
              <button
                onClick={() => { setInput(example); setHasRun(isLiveAnalysis); }}
                className={`text-xs font-black uppercase tracking-widest ${primaryText} ${darkSecText} hover:opacity-80 transition-opacity`}
              >
                Load Example
              </button>
            )}
            <button
              onClick={handleClear}
              className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear
            </button>
          </div>
        </div>

        {/* Image OCR Upload */}
        {isImageOCR ? (
          <ImageToTextInput onResult={(text) => { setOcrText(text); setHasRun(true); }} />
        ) : isAgeCalc ? (
          <div className={`p-5 ${bg} ${darkBg} rounded-2xl border ${border} ${darkBorder}`}>
            <label htmlFor="birth-date" className="block text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-3">
              Select Birth Date
            </label>
            <input
              id="birth-date"
              type="date"
              className={`w-full p-4 bg-white dark:bg-slate-900 border ${border} ${darkBorder} rounded-xl font-black ${primaryText} ${darkSecText} focus:ring-2 focus:ring-amber-500/20 outline-none text-lg`}
              value={input}
              onChange={(e) => { setInput(e.target.value); setHasRun(true); }}
            />
          </div>
        ) : isJWT ? (
          <div className="relative">
            <textarea
              id="analysis-input"
              ref={textareaRef}
              value={input}
              onChange={(e) => { setInput(e.target.value); if (isLiveAnalysis) setHasRun(true); }}
              placeholder={placeholder || 'Paste your JWT token here (eyJ...)'}
              className="w-full h-32 p-4 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl focus:border-amber-500 dark:focus:border-amber-400 focus:ring-0 transition-all resize-none font-mono text-slate-700 dark:text-slate-300 text-sm leading-relaxed shadow-inner"
              spellCheck={false}
            />
          </div>
        ) : (
          <div className="relative">
            <textarea
              id="analysis-input"
              ref={textareaRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                if (isLiveAnalysis) setHasRun(true);
                else setHasRun(false);
              }}
              placeholder={placeholder || 'Type or paste your text here...'}
              className="w-full h-48 sm:h-56 p-4 sm:p-6 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl sm:rounded-[2rem] focus:border-amber-500 dark:focus:border-amber-400 focus:ring-0 transition-all resize-none font-mono text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed shadow-inner"
            />
            <div className="absolute bottom-4 right-5 flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 pointer-events-none">
              <span>{stats.chars.toLocaleString()} Chars</span>
              <span>{stats.words.toLocaleString()} Words</span>
              <span>{stats.lines} Lines</span>
            </div>
          </div>
        )}

        {/* Live indicator */}
        {isLiveAnalysis && input.trim() && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Live Analysis</span>
          </div>
        )}
      </div>

      {/* ─── Analyse Button (non-live tools) ─── */}
      {!isLiveAnalysis && !isAgeCalc && !isImageOCR && (
        <div className="flex justify-center">
          <button
            onClick={handleProcess}
            disabled={loading || !input.trim()}
            className={`group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r ${gradientClass} text-white rounded-[2rem] font-black text-base uppercase tracking-widest shadow-lg hover:shadow-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 w-full sm:w-auto justify-center`}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-current" />}
            <span>{loading ? 'Processing...' : 'Analyse'}</span>
            {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />}
          </button>
        </div>
      )}

      {/* ─── Output Panel ─── */}
      {hasOutput && (
        <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                <Check className="w-5 h-5" />
              </div>
              <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">
                {isLiveAnalysis ? 'Live Analysis' : 'Result'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {outputText && (
                <>
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Download</span>
                  </button>
                  <button
                    onClick={handleCopy}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md ${copied ? 'bg-emerald-500 text-white shadow-emerald-500/30' : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100'}`}
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                </>
              )}
            </div>
          </div>
          {renderOutput()}
        </div>
      )}
    </div>
  );
};

export default TextAnalysisWorkspace;
