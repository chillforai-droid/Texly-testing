/**
 * WordCounterPage.tsx
 * Merged Word Counter + Character Counter + Letter Counter
 * Targets: word counter, character counter, letter counter, word count tool, character count tool
 * Routes: /tool/word-counter-online-free  AND  /tool/character-counter-tool
 */

import React, { useState, useMemo, useCallback, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Copy, Check, Trash2, ChevronRight, FileText, Type, AlignLeft, Clock, Hash, BarChart2 } from 'lucide-react';

// ─── SEO ─────────────────────────────────────────────────────────────────────
const SEO_TITLE = 'Word Counter & Character Counter Online Free ⚡ — Letter Count, Word Count Tool';
const SEO_DESC  = 'Free word counter and character counter online. Count words, letters, characters (with & without spaces), sentences, and paragraphs in real time. No login. Works on any device.';
const SEO_KW    = 'word counter online free, character counter online, letter counter, count words in text, character count tool, word count tool, letter count online, count letters in text free, word and character counter, text statistics';
const CANONICAL = 'https://www.texlyonline.in/tool/word-counter-online-free';

const SAMPLE = `The quick brown fox jumps over the lazy dog. This classic pangram contains every letter of the English alphabet at least once.

It has been used to test typewriters, fonts, and keyboards for over a century. Try pasting your own text here to see your word count, character count, and letter count instantly.`;

// ─── Helpers ─────────────────────────────────────────────────────────────────
function calcStats(text: string) {
  const words       = text.trim() ? text.trim().split(/\s+/).length : 0;
  const chars       = text.length;
  const charsNoSp   = text.replace(/\s/g, '').length;
  const letters     = (text.match(/[a-zA-Z]/g) || []).length;
  const sentences   = text.split(/[.!?]+/).filter(s => s.trim()).length;
  const paragraphs  = text.split(/\n\s*\n/).filter(p => p.trim()).length || (text.trim() ? 1 : 0);
  const readingTime = Math.ceil(words / 200);
  const avgWordLen  = words > 0
    ? (text.trim().split(/\s+/).reduce((a, w) => a + w.replace(/[^a-zA-Z]/g, '').length, 0) / words).toFixed(1)
    : '0';

  // Letter frequency (top 5)
  const freq: Record<string, number> = {};
  (text.match(/[a-zA-Z]/g) || []).forEach(l => {
    const k = l.toLowerCase();
    freq[k] = (freq[k] || 0) + 1;
  });
  const topLetters = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return { words, chars, charsNoSp, letters, sentences, paragraphs, readingTime, avgWordLen, topLetters };
}

// ─── Stat Card ───────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, accent }: {
  label: string; value: string | number; icon: React.ElementType; accent: string;
}) {
  return (
    <div className={`flex flex-col items-center justify-center gap-1 rounded-2xl border p-4 bg-white dark:bg-slate-900 shadow-sm ${accent}`}>
      <Icon className="w-5 h-5 opacity-60 mb-1" />
      <span className="text-2xl sm:text-3xl font-bold tabular-nums leading-none">{value}</span>
      <span className="text-xs text-slate-500 dark:text-slate-400 text-center leading-tight">{label}</span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function WordCounterPage() {
  const [text, setText] = useState('');
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const stats = useMemo(() => calcStats(text), [text]);

  const handleClear = useCallback(() => {
    setText('');
    textareaRef.current?.focus();
  }, []);

  const handleSample = useCallback(() => {
    setText(SAMPLE);
    textareaRef.current?.focus();
  }, []);

  const handleCopy = useCallback(async () => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);

  // Progress bar width for reading time (capped at 100%)
  const rtWidth = Math.min(100, (stats.readingTime / 10) * 100);

  return (
    <main className="min-h-screen bg-slate-50/50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">

      {/* ── SEO ── */}
      <Helmet>
        <title>{SEO_TITLE}</title>
        <meta name="description" content={SEO_DESC} />
        <meta name="keywords" content={SEO_KW} />
        <link rel="canonical" href={CANONICAL} />
        <meta property="og:title" content={SEO_TITLE} />
        <meta property="og:description" content={SEO_DESC} />
        <meta property="og:url" content={CANONICAL} />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "Word Counter & Character Counter Online Free",
          "url": CANONICAL,
          "description": SEO_DESC,
          "applicationCategory": "UtilitiesApplication",
          "operatingSystem": "Any",
          "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
        })}</script>
      </Helmet>

      <div className="max-w-5xl mx-auto">

        {/* ── Breadcrumb ── */}
        <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400 mb-10">
          <Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4 opacity-50" />
          <span className="text-slate-900 dark:text-white font-semibold" aria-current="page">Word Counter & Character Counter</span>
        </nav>

        {/* ── Header ── */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 mb-4">
            <FileText className="w-8 h-8" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-3">
            Word Counter & Character Counter
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Free online word counter, character counter, and letter counter — all in one tool.
            Counts update <strong>in real time</strong> as you type.
          </p>
        </div>

        {/* ── Stat Grid ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatCard label="Words" value={stats.words} icon={FileText}
            accent="border-amber-100 dark:border-amber-800/40 text-amber-600 dark:text-amber-400" />
          <StatCard label="Characters (with spaces)" value={stats.chars} icon={Hash}
            accent="border-blue-100 dark:border-blue-800/40 text-blue-600 dark:text-blue-400" />
          <StatCard label="Characters (no spaces)" value={stats.charsNoSp} icon={Type}
            accent="border-indigo-100 dark:border-indigo-800/40 text-indigo-600 dark:text-indigo-400" />
          <StatCard label="Letters only (A–Z)" value={stats.letters} icon={AlignLeft}
            accent="border-emerald-100 dark:border-emerald-800/40 text-emerald-600 dark:text-emerald-400" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <StatCard label="Sentences" value={stats.sentences} icon={BarChart2}
            accent="border-rose-100 dark:border-rose-800/40 text-rose-500 dark:text-rose-400" />
          <StatCard label="Paragraphs" value={stats.paragraphs} icon={BarChart2}
            accent="border-purple-100 dark:border-purple-800/40 text-purple-600 dark:text-purple-400" />
          <StatCard label="Avg word length" value={stats.avgWordLen} icon={Hash}
            accent="border-slate-100 dark:border-slate-800/40 text-slate-500 dark:text-slate-400" />
          <StatCard label="Reading time (min)" value={stats.readingTime || '<1'} icon={Clock}
            accent="border-teal-100 dark:border-teal-800/40 text-teal-600 dark:text-teal-400" />
        </div>

        {/* ── Textarea ── */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden mb-6">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Your Text</span>
            <div className="flex gap-2">
              <button
                onClick={handleSample}
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Load Sample
              </button>
              <button
                onClick={handleCopy}
                disabled={!text}
                className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-40"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button
                onClick={handleClear}
                disabled={!text}
                className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors disabled:opacity-40"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear
              </button>
            </div>
          </div>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Type or paste your text here — word count, character count, and letter count update instantly..."
            rows={12}
            className="w-full px-5 py-4 text-base text-slate-800 dark:text-slate-200 bg-transparent resize-y focus:outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600 leading-relaxed"
            aria-label="Text input for counting"
          />
          {/* Live status bar */}
          <div className="flex items-center justify-between px-5 py-2 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400 dark:text-slate-500">
            <span>{stats.words} words · {stats.chars} chars · {stats.letters} letters</span>
            <span>~{stats.readingTime || '<1'} min read</span>
          </div>
        </div>

        {/* ── Letter Frequency ── */}
        {stats.topLetters.length > 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5 mb-8">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Top 5 Letters</h2>
            <div className="flex flex-wrap gap-3">
              {stats.topLetters.map(([letter, count]) => (
                <div key={letter} className="flex flex-col items-center bg-amber-50 dark:bg-amber-900/20 rounded-xl px-4 py-2 min-w-[56px]">
                  <span className="text-xl font-bold text-amber-600 dark:text-amber-400 uppercase">{letter}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{count}×</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Platform Limits Reference ── */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5 mb-10">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Platform Character Limits</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { platform: 'Meta Title', limit: 60 },
              { platform: 'Meta Description', limit: 160 },
              { platform: 'Twitter / X', limit: 280 },
              { platform: 'SMS', limit: 160 },
              { platform: 'Instagram Bio', limit: 150 },
              { platform: 'LinkedIn Headline', limit: 220 },
              { platform: 'YouTube Title', limit: 100 },
              { platform: 'WhatsApp Status', limit: 139 },
            ].map(({ platform, limit }) => {
              const pct = Math.min(100, Math.round((stats.chars / limit) * 100));
              const over = stats.chars > limit;
              return (
                <div key={platform} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">{platform}</span>
                    <span className={over ? 'text-red-500 font-semibold' : 'text-slate-400'}>
                      {stats.chars}/{limit}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${over ? 'bg-red-400' : 'bg-amber-400'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── SEO Content ── */}
        <section className="prose prose-slate dark:prose-invert max-w-none mb-12">
          <h2>Word Counter, Character Counter & Letter Counter — All in One</h2>
          <p>
            Whether you need a <strong>word counter</strong>, a <strong>character counter</strong>, or a <strong>letter counter</strong>,
            this is the single tool that does everything — in real time, for free, with no login required.
          </p>

          <h3>What each count means</h3>
          <ul>
            <li><strong>Word count</strong> — Total space-separated words. Matches the count shown in Google Docs and Microsoft Word.</li>
            <li><strong>Character count (with spaces)</strong> — Every character including spaces, punctuation, and numbers. Used by Twitter, Instagram, and most character-limited fields.</li>
            <li><strong>Character count (without spaces)</strong> — Only non-space characters. Useful for SMS pricing or forms that ignore spaces.</li>
            <li><strong>Letter count</strong> — Only A–Z alphabetic characters. Excludes spaces, digits, and punctuation. Useful for word games, crosswords, and linguistic analysis.</li>
            <li><strong>Sentence count</strong> — Splits on . ! ? for a rough sentence count.</li>
            <li><strong>Reading time</strong> — Estimated at 200 words per minute, the average silent reading speed for adults.</li>
          </ul>

          <h3>Common character limits to remember</h3>
          <ul>
            <li>Google meta title: <strong>60 characters</strong></li>
            <li>Google meta description: <strong>160 characters</strong></li>
            <li>Twitter / X post: <strong>280 characters</strong></li>
            <li>SMS message: <strong>160 characters</strong> (one segment)</li>
            <li>Instagram caption: <strong>2,200 characters</strong> (but only ~125 show before "more")</li>
          </ul>

          <h3>Frequently asked questions</h3>
          <dl>
            <dt><strong>What is the difference between a character counter and a letter counter?</strong></dt>
            <dd>A character counter counts every character — spaces, numbers, punctuation included. A letter counter counts only A–Z letters, ignoring everything else.</dd>

            <dt><strong>How accurate is this word counter?</strong></dt>
            <dd>Words are split on whitespace, matching the logic used by Google Docs, Microsoft Word, and most publishing platforms.</dd>

            <dt><strong>Does it count emojis?</strong></dt>
            <dd>Yes — emojis count as characters (sometimes 2, since many emoji are encoded as Unicode surrogate pairs).</dd>

            <dt><strong>Is my text private?</strong></dt>
            <dd>100% yes. All counting happens in your browser. No text is ever sent to any server.</dd>
          </dl>
        </section>

        {/* ── Related Tools ── */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">Related Tools</h2>
          <div className="flex flex-wrap gap-3">
            {[
              { slug: 'letter-counter-online-free', name: 'Letter Counter' },
              { slug: 'reading-time-calculator-online', name: 'Reading Time Calculator' },
              { slug: 'lorem-ipsum-generator-online', name: 'Lorem Ipsum Generator' },
              { slug: 'text-density-analyzer', name: 'Text Density Analyzer' },
              { slug: 'word-length-statistics', name: 'Word Length Statistics' },
            ].map(({ slug, name }) => (
              <Link
                key={slug}
                to={`/tool/${slug}`}
                className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 hover:border-amber-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors shadow-sm"
              >
                {name}
              </Link>
            ))}
          </div>
        </section>

      </div>
    </main>
  );
}
