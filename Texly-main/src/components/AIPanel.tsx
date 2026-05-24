import React, { useState } from 'react';
import { Sparkles, Loader2, ChevronDown, ChevronUp, Wand2, Copy, Check } from 'lucide-react';

// ─── HF Space config ──────────────────────────────────────────────────────────
const HF_SPACE_URL = 'https://mahendra0160-freellmtexly.hf.space';

// ─── Cold-start / junk response detector ─────────────────────────────────────
// HF Space sleep mode से wake होते समय generic messages देता है — इन्हें reject करो
const JUNK_PHRASES = [
  'hello there', 'personalized message', 'texly ai bot', 'how can i help',
  'how can i assist', 'i am an ai', "i'm an ai", 'as an ai language model',
  'i cannot fulfill', 'please provide', 'please give me', 'what would you like',
  'let me know what', 'feel free to', 'certainly!', 'of course!', 'sure!',
];

function isJunkResponse(text: string): boolean {
  if (!text || text.trim().length < 8) return true;
  const lower = text.toLowerCase();
  return JUNK_PHRASES.some((p) => lower.includes(p));
}

// ─── Direct Fetch — gradio @client की जगह plain fetch use करो ─────────────────
// @gradio/client में parameter passing का issue है — direct REST ज़्यादा reliable है
async function callHFSpace(prompt: string, retries = 2): Promise<string> {
  // Gradio spaces दो REST endpoints support करते हैं — दोनों try करो
  const endpoints = ['/run/predict', '/api/predict'];

  for (let attempt = 0; attempt <= retries; attempt++) {
    for (const endpoint of endpoints) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 28000);

        const res = await fetch(`${HF_SPACE_URL}${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          // Gradio expects: { data: [prompt_string] }
          body: JSON.stringify({ data: [prompt] }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        if (!res.ok) continue;

        const json = await res.json();

        // Gradio response: { data: ["result text"], duration: ... }
        const raw = json?.data?.[0] ?? json?.output ?? json?.result ?? '';
        const text = typeof raw === 'string' ? raw.trim() : '';

        if (text && !isJunkResponse(text)) return text;

        // Junk मिला = space अभी wake हो रहा है — wait करके retry
        if (attempt < retries) await new Promise((r) => setTimeout(r, 4000));

      } catch (e: unknown) {
        const isAbort = e instanceof Error && e.name === 'AbortError';
        if (!isAbort && attempt < retries) await new Promise((r) => setTimeout(r, 2500));
      }
    }
  }

  throw new Error('HF_EXHAUSTED');
}

// ─── Mode definition ──────────────────────────────────────────────────────────
interface Mode {
  label: string;
  emoji: string;
  prompt: (text: string) => string;
}

// ─── Prompt writing rules ─────────────────────────────────────────────────────
// 1. Task: clearly बताओ क्या करना है
// 2. Constraint: length/format specify करो
// 3. "Return ONLY ..." — यह critical है ताकि model preamble न दे
// 4. Text: label लगाकर input दो

const makeModes = (taskHints: {
  catchy: string; professional: string; emojis: string; shorten: string;
}): Mode[] => [
  {
    label: 'Make Catchy',
    emoji: '🔥',
    prompt: (t) =>
      `Task: ${taskHints.catchy}\nConstraint: Under 120 words. Add 1-2 emojis.\nReturn ONLY the result, no explanation.\n\nText: ${t}`,
  },
  {
    label: 'Professional',
    emoji: '💼',
    prompt: (t) =>
      `Task: ${taskHints.professional}\nConstraint: Formal tone, no emojis, fix grammar.\nReturn ONLY the result, no explanation.\n\nText: ${t}`,
  },
  {
    label: 'Add Emojis',
    emoji: '😄',
    prompt: (t) =>
      `Task: ${taskHints.emojis}\nConstraint: Keep ALL original words exactly. Only insert emojis between phrases.\nReturn ONLY the emoji-added text, no explanation.\n\nText: ${t}`,
  },
  {
    label: 'Shorten',
    emoji: '✂️',
    prompt: (t) =>
      `Task: ${taskHints.shorten}\nConstraint: Maximum 2 sentences. Remove filler words only.\nReturn ONLY the shortened text, no explanation.\n\nText: ${t}`,
  },
];

const TOOL_MODES: Record<string, Mode[]> = {
  'whatsapp-text-formatter': makeModes({
    catchy: 'Rewrite this WhatsApp message to be catchy and conversational. Use *bold* for key words and _italic_ for emphasis.',
    professional: 'Rewrite this WhatsApp message in a professional, respectful tone. Use *bold* for key points.',
    emojis: 'Add relevant emojis to this WhatsApp message to make it expressive.',
    shorten: 'Shorten this WhatsApp message while keeping all key information.',
  }),
  'text-repeater': makeModes({
    catchy: 'Turn this repeated text into ONE punchy viral social media post with a hook.',
    professional: 'Rewrite this text in a formal professional tone, removing all repetition.',
    emojis: 'Add fitting emojis to this text at natural pause points.',
    shorten: 'Condense this text to its core idea in 1-2 sentences, removing repetition.',
  }),
  'fancy-text': makeModes({
    catchy: 'Write a viral social media caption with a hook, energy, and hashtags based on this text.',
    professional: 'Rewrite this as a polished professional tagline or headline. Max 12 words.',
    emojis: 'Add fitting emojis to this fancy text to make it more expressive.',
    shorten: 'Compress this into a punchy 5-8 word slogan.',
  }),
  'text-cleaner': makeModes({
    catchy: 'Rewrite this cleaned text to be engaging and attention-grabbing.',
    professional: 'Rewrite this text in a clean, formal professional tone with proper structure.',
    emojis: 'Add appropriate emojis to this text to make it visually appealing.',
    shorten: 'Shorten this text to its main message in 1-2 sentences.',
  }),
  'remove-extra-spaces': makeModes({
    catchy: 'Rewrite this text to be lively and engaging with a strong opening.',
    professional: 'Rewrite this text in a polished professional format with proper paragraph structure.',
    emojis: 'Insert fitting emojis at key points in this text. Keep all words.',
    shorten: 'Condense this text to the most essential 1-2 sentences.',
  }),
  'find-replace': makeModes({
    catchy: 'Rewrite this text to be punchy and engaging with a strong opening.',
    professional: 'Fix all grammar and spelling in this text, then improve sentence clarity.',
    emojis: 'Add relevant emojis to this text at appropriate places. Keep all words.',
    shorten: 'Shorten this to the core message in 1-2 sentences.',
  }),
  'text-to-list': makeModes({
    catchy: 'Turn this list into an engaging social media post with emojis and hashtags.',
    professional: 'Format this list as a clean professional bulleted list using • bullets with bold labels.',
    emojis: 'Add a fitting emoji before each item in this list. Keep all text.',
    shorten: 'Trim this list to the 3-5 most important items only.',
  }),
  'morse-code': makeModes({
    catchy: 'Write a fun dramatic spy-mission caption inspired by this text. Under 60 words.',
    professional: 'Rewrite this as a clear, formal message. Remove informal language.',
    emojis: 'Add fitting emojis to this text at natural points. Keep all words.',
    shorten: 'Shorten this to 1 punchy sentence.',
  }),
  'paraphrase': makeModes({
    catchy: 'Rewrite this text to be exciting and engaging with a strong hook.',
    professional: 'Rewrite this in a sophisticated, formal tone with polished vocabulary.',
    emojis: 'Add fitting emojis to this text without changing any words.',
    shorten: 'Condense this to the core idea in 1-2 sentences.',
  }),
};

// Default — जो tools TOOL_MODES में नहीं हैं उनके लिए
const DEFAULT_MODES: Mode[] = makeModes({
  catchy: 'Rewrite this text to be more engaging and attention-grabbing.',
  professional: 'Rewrite this text in a formal, professional tone. Fix grammar.',
  emojis: 'Add relevant emojis to this text. Keep all words intact.',
  shorten: 'Shorten this text to 1-2 sentences keeping the main point.',
});

// ─── Component ────────────────────────────────────────────────────────────────

interface AIPanelProps {
  toolId: string;
  input: string;
}

export default function AIPanel({ toolId, input }: AIPanelProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [activeMode, setActiveMode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const modes = TOOL_MODES[toolId] ?? DEFAULT_MODES;

  const handleMode = async (mode: Mode) => {
    const trimmed = input?.trim() ?? '';

    if (trimmed.length < 3) {
      setError('पहले ऊपर text box में कुछ लिखें या paste करें।');
      return;
    }
    if (trimmed.length > 3000) {
      setError('Text बहुत लंबा है। 3000 characters से कम रखें।');
      return;
    }

    setLoading(true);
    setError('');
    setResult('');
    setActiveMode(mode.label);

    try {
      const text = await callHFSpace(mode.prompt(trimmed));
      setResult(text);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      if (msg === 'HF_EXHAUSTED') {
        setError('AI model अभी wake हो रहा है। 15 seconds बाद दोबारा try करें।');
      } else {
        setError('कुछ गड़बड़ हुई। दोबारा try करें।');
      }
    } finally {
      setLoading(false);
    }
  };

  const copyResult = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-8 rounded-2xl overflow-hidden border border-purple-200 dark:border-purple-800 shadow-lg">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          <span className="font-semibold text-sm sm:text-base">AI Enhance</span>
          <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">FREE</span>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {isOpen && (
        <div className="bg-slate-900 p-4">

          {/* Hint जब input empty हो */}
          {!input?.trim() && !loading && !result && (
            <p className="text-xs text-slate-500 mb-3 px-1">
              ⬆️ ऊपर text paste करें, फिर कोई button दबाएँ।
            </p>
          )}

          {/* 4 Mode buttons — always 2×2 grid */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {modes.map((mode) => (
              <button
                key={mode.label}
                onClick={() => handleMode(mode)}
                disabled={loading}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                  ${loading && activeMode === mode.label
                    ? 'bg-purple-700 text-white'
                    : loading
                    ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 hover:border-purple-500 cursor-pointer'
                  }`}
              >
                <span className="text-base leading-none">{mode.emoji}</span>
                <span className="truncate">{mode.label}</span>
                {loading && activeMode === mode.label && (
                  <Loader2 className="w-3 h-3 animate-spin ml-auto shrink-0" />
                )}
              </button>
            ))}
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center gap-3 text-purple-300 text-sm py-2 px-1">
              <Loader2 className="w-4 h-4 animate-spin shrink-0" />
              <span>AI processing… 15-25 seconds लग सकते हैं</span>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3">
              ⚠️ {error}
            </div>
          )}

          {/* Result */}
          {result && !loading && (
            <div className="mt-2">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-green-400 text-xs font-medium">
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>AI Result — {activeMode}</span>
                </div>
                <button
                  onClick={copyResult}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded-lg transition-colors"
                >
                  {copied
                    ? <><Check className="w-3 h-3 text-green-400" /> Copied!</>
                    : <><Copy className="w-3 h-3" /> Copy</>
                  }
                </button>
              </div>
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-3 text-slate-200 text-sm leading-relaxed whitespace-pre-wrap max-h-52 overflow-y-auto">
                {result}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
