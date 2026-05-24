/**
 * AITextSuite.tsx
 * AI-Powered All-in-One Text Tool
 * Uses Groq Free API (llama-3.3-70b-versatile)
 *
 * Features:
 *  - Remove Special Characters (AI-smart)
 *  - Text to List
 *  - Text Repeater
 *  - Find & Replace (AI-assisted)
 *  - Text Cleaner
 */

import React, { useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Sparkles, Copy, Check, Loader2, Trash2,
  List, Repeat, Search, Eraser, X, ChevronDown,
  Wand2, ArrowRight, Zap
} from 'lucide-react';
import AdPlaceholder from '../../components/AdPlaceholder';

// ─── Groq Config ──────────────────────────────────────────────────────────────
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || '';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

async function callGroq(systemPrompt: string, userText: string): Promise<string> {
  if (!GROQ_API_KEY) throw new Error('NO_KEY');

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      max_tokens: 2048,
      temperature: 0.3,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userText },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `HTTP ${res.status}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || '';
}

// ─── Tool Definitions ─────────────────────────────────────────────────────────
const TOOLS = [
  {
    id: 'remove-special',
    label: 'Remove Special Characters',
    icon: ShieldAlert,
    color: 'emerald',
    desc: 'Symbols, @#$%! हटाओ — smart AI से',
    placeholder: 'Text यहाँ paste करें जैसे: Hello @World! #Test$123',
    system: `You are a text cleaning assistant. Remove all special characters and symbols from the text.
Keep only: letters (a-z, A-Z), numbers (0-9), spaces, and basic punctuation (. , ! ? - ').
Return ONLY the cleaned text, nothing else.`,
  },
  {
    id: 'text-to-list',
    label: 'Text to List',
    icon: List,
    color: 'blue',
    desc: 'Lines को bullet list में बदलो',
    placeholder: 'हर line एक item होगा:\nसेब\nकेला\nआम',
    system: `You are a list formatting assistant. Convert the given text into a clean, well-formatted bullet list.
- Each line or item should become a separate bullet point using "•"
- If the text is already a list, reformat it nicely
- Add proper capitalization to each item
- Return ONLY the formatted list, nothing else.`,
  },
  {
    id: 'text-repeater',
    label: 'Text Repeater',
    icon: Repeat,
    color: 'purple',
    desc: 'Text को repeat करो — custom separator के साथ',
    placeholder: 'जो text repeat करना हो वो लिखें',
    hasOptions: true,
    system: '', // handled locally
  },
  {
    id: 'find-replace',
    label: 'Find & Replace',
    icon: Search,
    color: 'amber',
    desc: 'AI smart find & replace — context समझकर',
    placeholder: 'वो text paste करें जिसमें replacement करनी है',
    hasOptions: true,
    system: '', // built dynamically
  },
  {
    id: 'text-cleaner',
    label: 'Text Cleaner',
    icon: Eraser,
    color: 'rose',
    desc: 'Extra spaces, blank lines, formatting साफ करो',
    placeholder: 'गंदा    text    यहाँ paste करें\n\n\nजिसमें extra spaces हों',
    system: `You are a text cleaning assistant. Clean and fix the given text by:
- Removing extra spaces (keep single spaces between words)
- Removing extra blank lines (keep max one blank line between paragraphs)
- Fixing basic punctuation spacing
- Removing trailing/leading spaces from each line
- Fixing common formatting issues
Return ONLY the cleaned text, nothing else. Do not add any explanation.`,
  },
];

// ─── Workaround for ShieldAlert import ───────────────────────────────────────
import { ShieldAlert } from 'lucide-react';

// ─── Color map ────────────────────────────────────────────────────────────────
const COLOR = {
  emerald: {
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    border: 'border-emerald-200 dark:border-emerald-800',
    text: 'text-emerald-700 dark:text-emerald-400',
    btn: 'bg-emerald-600 hover:bg-emerald-700',
    icon: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
    active: 'ring-emerald-500',
  },
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800',
    text: 'text-blue-700 dark:text-blue-400',
    btn: 'bg-blue-600 hover:bg-blue-700',
    icon: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    active: 'ring-blue-500',
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    border: 'border-purple-200 dark:border-purple-800',
    text: 'text-purple-700 dark:text-purple-400',
    btn: 'bg-purple-600 hover:bg-purple-700',
    icon: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    active: 'ring-purple-500',
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-200 dark:border-amber-800',
    text: 'text-amber-700 dark:text-amber-400',
    btn: 'bg-amber-600 hover:bg-amber-700',
    icon: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
    active: 'ring-amber-500',
  },
  rose: {
    bg: 'bg-rose-50 dark:bg-rose-900/20',
    border: 'border-rose-200 dark:border-rose-800',
    text: 'text-rose-700 dark:text-rose-400',
    btn: 'bg-rose-600 hover:bg-rose-700',
    icon: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400',
    active: 'ring-rose-500',
  },
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AITextSuite() {
  const [activeTool, setActiveTool] = useState(TOOLS[0].id);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // Text Repeater options
  const [repeatCount, setRepeatCount] = useState(3);
  const [repeatSeparator, setRepeatSeparator] = useState('\\n');

  // Find & Replace options
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [useAI, setUseAI] = useState(false);

  const tool = TOOLS.find(t => t.id === activeTool)!;
  const c = COLOR[tool.color as keyof typeof COLOR];

  const handleProcess = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed) { setError('पहले text लिखें या paste करें।'); return; }
    if (trimmed.length > 5000) { setError('Text 5000 characters से कम रखें।'); return; }

    setLoading(true);
    setError('');
    setOutput('');

    try {
      // ── Text Repeater — local, no AI needed ──
      if (activeTool === 'text-repeater') {
        const sep = repeatSeparator === '\\n' ? '\n'
          : repeatSeparator === '\\t' ? '\t'
          : repeatSeparator;
        setOutput(Array(repeatCount).fill(trimmed).join(sep));
        return;
      }

      // ── Find & Replace ──
      if (activeTool === 'find-replace') {
        if (!findText) { setError('Find field खाली है।'); return; }

        if (!useAI) {
          // Simple local replace
          const result = trimmed.split(findText).join(replaceText);
          setOutput(result);
          return;
        }

        // AI-assisted replace
        const system = `You are a smart find-and-replace assistant.
Replace all occurrences of "${findText}" with "${replaceText}" in the given text.
Be context-aware — fix grammar and sentence flow if needed after replacement.
Return ONLY the final text, no explanations.`;
        const result = await callGroq(system, trimmed);
        setOutput(result);
        return;
      }

      // ── All other tools — Groq AI ──
      const result = await callGroq(tool.system, trimmed);
      setOutput(result);

    } catch (err: any) {
      if (err.message === 'NO_KEY') {
        setError('VITE_GROQ_API_KEY नहीं मिली। .env में add करें।');
      } else {
        setError(`Error: ${err.message || 'दोबारा try करें।'}`);
      }
    } finally {
      setLoading(false);
    }
  }, [activeTool, input, repeatCount, repeatSeparator, findText, replaceText, useAI, tool]);

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setError('');
  };

  return (
    <>
      <Helmet>
        <title>AI Text Suite — Remove Special Chars, Text to List, Cleaner & More | Texly</title>
        <meta name="description" content="5 powerful AI text tools in one place — Remove Special Characters, Text to List, Text Repeater, Find & Replace, Text Cleaner. Free, fast, no signup." />
      </Helmet>

      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4">
        <div className="max-w-5xl mx-auto">

          {/* ── Header ── */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold px-4 py-1.5 rounded-full mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              AI POWERED • FREE
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-3">
              AI Text Suite
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-base max-w-xl mx-auto">
              5 powerful text tools — एक ही जगह पर। Remove special chars, list बनाओ, repeat करो, find-replace करो, या clean करो।
            </p>
          </div>

          {/* ── Tool Selector ── */}
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {TOOLS.map(t => {
              const Icon = t.icon;
              const tc = COLOR[t.color as keyof typeof COLOR];
              const isActive = activeTool === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => { setActiveTool(t.id); setOutput(''); setError(''); }}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border-2
                    ${isActive
                      ? `${tc.bg} ${tc.border} ${tc.text} ring-2 ${tc.active} ring-offset-1`
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* ── Main Card ── */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">

            {/* Card Header */}
            <div className={`flex items-center gap-3 px-6 py-4 ${c.bg} border-b ${c.border}`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${c.icon}`}>
                <tool.icon className="w-5 h-5" />
              </div>
              <div>
                <h2 className={`font-bold text-sm ${c.text}`}>{tool.label}</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">{tool.desc}</p>
              </div>
              {activeTool !== 'text-repeater' && activeTool !== 'find-replace' && (
                <div className="ml-auto flex items-center gap-1.5 text-xs text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20 px-2.5 py-1 rounded-full font-medium">
                  <Sparkles className="w-3 h-3" />
                  Groq AI
                </div>
              )}
            </div>

            <div className="p-5 sm:p-6 space-y-4">

              {/* ── Tool-specific Options ── */}

              {/* Text Repeater Options */}
              {activeTool === 'text-repeater' && (
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Repeat:</label>
                    <input
                      type="number"
                      min={1} max={100}
                      value={repeatCount}
                      onChange={e => setRepeatCount(Number(e.target.value))}
                      className="w-16 text-center text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 bg-white dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <span className="text-xs text-slate-400">बार</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Separator:</label>
                    <select
                      value={repeatSeparator}
                      onChange={e => setRepeatSeparator(e.target.value)}
                      className="text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 bg-white dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="\n">New Line</option>
                      <option value=" ">Space</option>
                      <option value=", ">Comma</option>
                      <option value=" | ">Pipe (|)</option>
                      <option value="\t">Tab</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Find & Replace Options */}
              {activeTool === 'find-replace' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Find:</label>
                      <input
                        type="text"
                        value={findText}
                        onChange={e => setFindText(e.target.value)}
                        placeholder="ढूंढना क्या है..."
                        className="w-full text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Replace with:</label>
                      <input
                        type="text"
                        value={replaceText}
                        onChange={e => setReplaceText(e.target.value)}
                        placeholder="बदलना क्या है..."
                        className="w-full text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer w-fit">
                    <input
                      type="checkbox"
                      checked={useAI}
                      onChange={e => setUseAI(e.target.checked)}
                      className="rounded accent-amber-500"
                    />
                    <span className="text-xs text-slate-600 dark:text-slate-400">
                      <Sparkles className="w-3 h-3 inline mr-1 text-violet-500" />
                      AI Smart Replace (grammar fix करेगा)
                    </span>
                  </label>
                </div>
              )}

              {/* ── Input / Output Grid ── */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Input */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Input</label>
                    <span className="text-xs text-slate-400">{input.length} / 5000</span>
                  </div>
                  <div className="relative">
                    <textarea
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      placeholder={tool.placeholder}
                      rows={10}
                      className="w-full text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 leading-relaxed"
                    />
                    {input && (
                      <button
                        onClick={handleClear}
                        className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Output */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Output</label>
                    {output && (
                      <button
                        onClick={handleCopy}
                        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-2.5 py-1 rounded-lg transition-colors"
                      >
                        {copied ? <><Check className="w-3 h-3 text-green-500" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy</>}
                      </button>
                    )}
                  </div>
                  <div className={`relative min-h-[260px] rounded-xl border-2 transition-colors ${output ? `${c.border} ${c.bg}` : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800'}`}>
                    {loading ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                        <Loader2 className="w-7 h-7 animate-spin text-violet-500" />
                        <p className="text-xs text-slate-500 dark:text-slate-400">AI processing…</p>
                      </div>
                    ) : output ? (
                      <pre className={`p-4 text-sm whitespace-pre-wrap break-words leading-relaxed font-sans ${c.text} h-full`}>
                        {output}
                      </pre>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <Wand2 className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                          <p className="text-xs text-slate-400 dark:text-slate-500">Result यहाँ आएगा</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-xl px-4 py-3">
                  ⚠️ {error}
                </div>
              )}

              {/* Process Button */}
              <button
                onClick={handleProcess}
                disabled={loading || !input.trim()}
                className={`w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-white font-bold text-sm transition-all
                  ${loading || !input.trim()
                    ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed text-slate-400'
                    : `${c.btn} shadow-lg hover:shadow-xl active:scale-[0.98]`
                  }`}
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</>
                ) : (
                  <><Zap className="w-4 h-4" /> {tool.label} करो</>
                )}
              </button>

            </div>
          </div>

          {/* ── Ad ── */}
          <div className="my-8">
            <AdPlaceholder slot="ai-text-suite-mid" />
          </div>

          {/* ── How It Works ── */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 mb-8">
            <h2 className="text-lg font-black text-slate-900 dark:text-white mb-5">कैसे use करें?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { step: '1', title: 'Tool चुनें', desc: 'ऊपर से अपना tool select करें' },
                { step: '2', title: 'Text paste करें', desc: 'Input box में text डालें' },
                { step: '3', title: 'Process करें', desc: 'Button दबाएँ और result copy करें' },
              ].map(s => (
                <div key={s.step} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 font-black text-sm flex items-center justify-center shrink-0">
                    {s.step}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-slate-800 dark:text-slate-200">{s.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── FAQ ── */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <h2 className="text-lg font-black text-slate-900 dark:text-white mb-5">अक्सर पूछे जाने वाले सवाल</h2>
            <div className="space-y-4">
              {[
                { q: 'क्या यह tool बिल्कुल free है?', a: 'हाँ! AI Text Suite पूरी तरह free है। कोई signup या payment नहीं चाहिए।' },
                { q: 'मेरा data safe है?', a: 'हाँ। आपका text सीधे Groq API पर जाता है और process होकर वापस आता है। हम कोई data store नहीं करते।' },
                { q: 'कितना बड़ा text process हो सकता है?', a: 'एक बार में 5000 characters तक process हो सकते हैं।' },
                { q: 'Find & Replace में AI Smart Replace क्या है?', a: 'Normal replace सिर्फ word बदलता है, AI Smart Replace grammar और context भी fix करता है।' },
              ].map((faq, i) => (
                <details key={i} className="group border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden">
                  <summary className="flex items-center justify-between px-4 py-3 cursor-pointer text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 list-none">
                    {faq.q}
                    <ChevronDown className="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform shrink-0" />
                  </summary>
                  <div className="px-4 pb-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
