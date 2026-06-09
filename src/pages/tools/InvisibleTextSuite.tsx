/**
 * InvisibleTextSuite.tsx
 * 5-in-1 Invisible Text & Blank Message Generator
 *
 * Tools:
 *  1. Invisible Text Generator
 *  2. Blank Text Copy Tool
 *  3. WhatsApp Blank Message
 *  4. Discord Invisible Name Generator
 *  5. Fancy Font Generator
 */

import { useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Copy, Check, EyeOff, MessageSquare, Hash,
  Type, Sparkles, Zap, ChevronDown,
  Shield, Clock, Star
} from 'lucide-react';

// ─── SEO Meta ─────────────────────────────────────────────────────────────────
const SEO_TITLE = 'Invisible Text Generator & Blank Message Tool — Copy in 1 Click ⚡ | Texly';
const SEO_DESC = 'Generate invisible text, send blank WhatsApp messages, create Discord invisible names, copy blank characters, and style text with fancy fonts — all free, no signup, instant copy.';
const SEO_KEYWORDS = 'invisible text generator, blank text copy, whatsapp blank message, discord invisible name, fancy font generator, invisible character copy paste, send blank message whatsapp, empty text generator, blank message sender, invisible text copy';
const CANONICAL = 'https://www.texlyonline.in/tools/invisible-text-suite';

// ─── Unicode Character Sets ────────────────────────────────────────────────────
const INVISIBLE_CHARS: { name: string; code: string; unicode: string; desc: string }[] = [
  { name: 'Zero Width Space', code: '\u200B', unicode: 'U+200B', desc: 'Most versatile — works on almost all platforms' },
  { name: 'Hangul Filler', code: '\u3164', unicode: 'U+3164', desc: 'Best for Discord & gaming usernames' },
  { name: 'Zero Width Non-Joiner', code: '\u200C', unicode: 'U+200C', desc: 'Great for WhatsApp blank messages' },
  { name: 'Zero Width Joiner', code: '\u200D', unicode: 'U+200D', desc: 'Works in most apps & browsers' },
  { name: 'Word Joiner', code: '\u2060', unicode: 'U+2060', desc: 'Ideal for Instagram spacing hacks' },
  { name: 'Invisible Separator', code: '\u2063', unicode: 'U+2063', desc: 'Used in advanced text formatting' },
];

// ─── Fancy Font Maps ───────────────────────────────────────────────────────────
const FONT_MAPS: { name: string; emoji: string; map: (c: string) => string }[] = [
  {
    name: '𝓒𝓾𝓻𝓼𝓲𝓿𝓮',
    emoji: '✍️',
    map: (c: string) => {
      const cursive = 'abcdefghijklmnopqrstuvwxyz';
      const cursiveMap = '𝓪𝓫𝓬𝓭𝓮𝓯𝓰𝓱𝓲𝓳𝓴𝓵𝓶𝓷𝓸𝓹𝓺𝓻𝓼𝓽𝓾𝓿𝔀𝔁𝔂𝔃'.split('');
      const i = cursive.indexOf(c.toLowerCase());
      if (i >= 0) return c === c.toUpperCase() ? cursiveMap[i] : cursiveMap[i];
      return c;
    },
  },
  {
    name: '𝔻𝕠𝕦𝕓𝕝𝕖',
    emoji: '𝔻',
    map: (c: string) => {
      const normal = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      const double = '𝕒𝕓𝕔𝕕𝕖𝕗𝕘𝕙𝕚𝕛𝕜𝕝𝕞𝕟𝕠𝕡𝕢𝕣𝕤𝕥𝕦𝕧𝕨𝕩𝕪𝕫𝔸𝔹ℂ𝔻𝔼𝔽𝔾ℍ𝕀𝕁𝕂𝕃𝕄ℕ𝕆ℙℚℝ𝕊𝕋𝕌𝕍𝕎𝕏𝕐ℤ𝟘𝟙𝟚𝟛𝟜𝟝𝟞𝟟𝟠𝟡'.split('');
      const i = normal.indexOf(c);
      return i >= 0 ? double[i] : c;
    },
  },
  {
    name: '𝗕𝗼𝗹𝗱',
    emoji: '𝗕',
    map: (c: string) => {
      const normal = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const bold = '𝗮𝗯𝗰𝗱𝗲𝗳𝗴𝗵𝗶𝗷𝗸𝗹𝗺𝗻𝗼𝗽𝗾𝗿𝘀𝘁𝘂𝘃𝘄𝘅𝘆𝘇𝗔𝗕𝗖𝗗𝗘𝗙𝗚𝗛𝗜𝗝𝗞𝗟𝗠𝗡𝗢𝗣𝗤𝗥𝗦𝗧𝗨𝗩𝗪𝗫𝗬𝗭'.split('');
      const i = normal.indexOf(c);
      return i >= 0 ? bold[i] : c;
    },
  },
  {
    name: '𝘐𝘵𝘢𝘭𝘪𝘤',
    emoji: '𝘐',
    map: (c: string) => {
      const normal = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const italic = '𝘢𝘣𝘤𝘥𝘦𝘧𝘨𝘩𝘪𝘫𝘬𝘭𝘮𝘯𝘰𝘱𝘲𝘳𝘴𝘵𝘶𝘷𝘸𝘹𝘺𝘻𝘈𝘉𝘊𝘋𝘌𝘍𝘎𝘏𝘐𝘑𝘒𝘓𝘔𝘕𝘖𝘗𝘘𝘙𝘚𝘛𝘜𝘝𝘞𝘟𝘠𝘡'.split('');
      const i = normal.indexOf(c);
      return i >= 0 ? italic[i] : c;
    },
  },
  {
    name: 'Ⓢⓒⓘⓡⓒⓛⓔ',
    emoji: 'Ⓢ',
    map: (c: string) => {
      const normal = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const circle = 'ⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛⓜⓝⓞⓟⓠⓡⓢⓣⓤⓥⓦⓧⓨⓩⒶⒷⒸⒹⒺⒻⒼⒽⒾⒿⓀⓁⓂⓃⓄⓅⓆⓇⓈⓉⓊⓋⓌⓍⓎⓏ'.split('');
      const i = normal.indexOf(c);
      return i >= 0 ? circle[i] : c;
    },
  },
  {
    name: 'S̶t̶r̶i̶k̶e̶',
    emoji: '✗',
    map: (c: string) => (c === ' ' ? c : c + '\u0336'),
  },
];

// ─── Copy Button Component ─────────────────────────────────────────────────────
function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [text]);
  return (
    <button
      onClick={copy}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
        copied
          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-95'
          : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 hover:shadow-lg hover:scale-105'
      }`}
    >
      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      {copied ? 'Copied!' : label}
    </button>
  );
}

// ─── Tab Data ──────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'invisible', label: 'Invisible Text', icon: EyeOff, color: 'violet' },
  { id: 'blank', label: 'Blank Text Copy', icon: Copy, color: 'blue' },
  { id: 'whatsapp', label: 'WhatsApp Blank', icon: MessageSquare, color: 'emerald' },
  { id: 'discord', label: 'Discord Name', icon: Hash, color: 'indigo' },
  { id: 'fancy', label: 'Fancy Fonts', icon: Type, color: 'fuchsia' },
];

// ─── Tab: Invisible Text Generator ────────────────────────────────────────────
function InvisibleTextTab() {
  const [selectedChar, setSelectedChar] = useState(INVISIBLE_CHARS[0]);
  const [count, setCount] = useState(1);
  const generated = selectedChar.code.repeat(count);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white mb-1">Invisible Text Generator</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Choose a Unicode invisible character and generate as many copies as you need.</p>
      </div>

      {/* Character Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {INVISIBLE_CHARS.map((ch) => (
          <button
            key={ch.unicode}
            onClick={() => setSelectedChar(ch)}
            className={`text-left p-4 rounded-2xl border-2 transition-all duration-200 ${
              selectedChar.unicode === ch.unicode
                ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/30'
                : 'border-slate-100 dark:border-slate-800 hover:border-violet-300 dark:hover:border-violet-800 bg-white dark:bg-slate-900'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-black text-slate-700 dark:text-slate-200">{ch.name}</span>
              <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-lg">{ch.unicode}</span>
            </div>
            <p className="text-[11px] text-slate-400">{ch.desc}</p>
          </button>
        ))}
      </div>

      {/* Count Selector */}
      <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">How many?</label>
        <input
          type="range" min={1} max={50} value={count}
          onChange={e => setCount(Number(e.target.value))}
          className="flex-1 accent-violet-500"
        />
        <span className="text-sm font-black text-violet-600 w-8 text-center">{count}</span>
      </div>

      {/* Output */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-dashed border-violet-200 dark:border-violet-800/50">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-500">Generated Characters ({count}x {selectedChar.unicode})</span>
          <CopyButton text={generated} label="Copy Invisible Text" />
        </div>
        <div className="min-h-[48px] bg-slate-50 dark:bg-slate-800 rounded-xl p-3 text-center text-slate-400 dark:text-slate-500 text-xs font-mono italic select-all">
          [Invisible text — paste anywhere to use]
          <textarea readOnly value={generated} className="sr-only" />
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-violet-50 dark:bg-violet-950/20 border border-violet-100 dark:border-violet-900/40">
        <p className="text-xs text-violet-700 dark:text-violet-300 font-medium">
          💡 <strong>How to use:</strong> Click "Copy Invisible Text", then paste into any app — Discord name, Instagram bio, WhatsApp message, or gaming username. The text will appear completely blank!
        </p>
      </div>
    </div>
  );
}

// ─── Tab: Blank Text Copy Tool ─────────────────────────────────────────────────
function BlankTextTab() {
  const BLANK_SETS = [
    { label: 'Single Blank', chars: '\u3164', desc: 'One invisible character' },
    { label: '5 Blanks', chars: '\u3164'.repeat(5), desc: 'Short blank space' },
    { label: '10 Blanks', chars: '\u3164'.repeat(10), desc: 'Medium blank space' },
    { label: '20 Blanks', chars: '\u3164'.repeat(20), desc: 'Long blank space' },
    { label: 'Blank Line', chars: '\n\u3164\n', desc: 'Empty line in text' },
    { label: 'Multi-line Blank', chars: '\u3164\n\u3164\n\u3164', desc: '3 empty lines' },
  ];
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white mb-1">Blank Text Copy Tool</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">One-click copy of blank/invisible text in different lengths. Perfect for creating empty spaces anywhere.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {BLANK_SETS.map((set) => (
          <div key={set.label} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-800 transition-all hover:shadow-lg hover:shadow-blue-500/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-black text-slate-800 dark:text-slate-200">{set.label}</span>
            </div>
            <p className="text-xs text-slate-400 mb-3">{set.desc}</p>
            <CopyButton text={set.chars} label="Copy" />
          </div>
        ))}
      </div>

      {/* Custom Length */}
      <CustomBlankGenerator />

      <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40">
        <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">
          💡 <strong>Use cases:</strong> Empty username fields, blank Instagram bio, silent Twitter/X posts, blank Minecraft usernames, empty Discord status messages.
        </p>
      </div>
    </div>
  );
}

function CustomBlankGenerator() {
  const [num, setNum] = useState(5);
  const chars = '\u3164'.repeat(num);
  return (
    <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
      <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 mb-3">Custom Length Blank Text</h3>
      <div className="flex items-center gap-3 mb-4">
        <input
          type="number" min={1} max={200} value={num}
          onChange={e => setNum(Math.min(200, Math.max(1, Number(e.target.value))))}
          className="w-24 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-bold text-center focus:outline-none focus:border-blue-500"
        />
        <span className="text-xs text-slate-500">invisible characters</span>
        <CopyButton text={chars} label="Copy Custom" />
      </div>
    </div>
  );
}

// ─── Tab: WhatsApp Blank Message ───────────────────────────────────────────────
function WhatsAppTab() {
  const [msgCount, setMsgCount] = useState(1);
  const blankMsg = '\u200C'.repeat(msgCount);
  const [showSteps, setShowSteps] = useState(false);

  const STEPS = [
    'Click "Copy Blank Message" button below',
    'Open WhatsApp on your phone or desktop',
    'Open any chat (friend, group, or "Message to myself")',
    'Long-press the text input field and tap Paste',
    'Hit Send — your blank message will be delivered! 🎉',
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white mb-1">WhatsApp Blank Message Sender</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Send completely empty messages on WhatsApp that bypass the "empty message" restriction.</p>
      </div>

      {/* How it works toggle */}
      <button
        onClick={() => setShowSteps(!showSteps)}
        className="w-full flex items-center justify-between p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 text-left"
      >
        <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">📱 How to send a blank WhatsApp message?</span>
        <ChevronDown className={`w-4 h-4 text-emerald-500 transition-transform ${showSteps ? 'rotate-180' : ''}`} />
      </button>
      {showSteps && (
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 -mt-3">
          <ol className="space-y-2">
            {STEPS.map((step, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 text-xs font-black flex items-center justify-center">{i + 1}</span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Message count */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Blank characters count: {msgCount}</label>
        </div>
        <input
          type="range" min={1} max={20} value={msgCount}
          onChange={e => setMsgCount(Number(e.target.value))}
          className="w-full accent-emerald-500 mb-4"
        />
        <div className="flex items-center gap-3">
          <div className="flex-1 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-400 italic">
            [Empty WhatsApp message ready — {msgCount} invisible char{msgCount > 1 ? 's' : ''}]
          </div>
          <CopyButton text={blankMsg} label="Copy Blank Message" />
        </div>
      </div>

      {/* Quick platform cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { platform: 'WhatsApp', char: '\u200C', color: 'emerald' },
          { platform: 'Telegram', char: '\u200B', color: 'blue' },
          { platform: 'Signal', char: '\u2063', color: 'indigo' },
          { platform: 'iMessage', char: '\u3164', color: 'gray' },
          { platform: 'Instagram DM', char: '\u200D', color: 'pink' },
          { platform: 'Discord DM', char: '\u3164', color: 'violet' },
        ].map(({ platform, char, color }) => (
          <div key={platform} className={`p-3 rounded-2xl bg-${color}-50 dark:bg-${color}-950/20 border border-${color}-100 dark:border-${color}-900/40`}>
            <div className="text-xs font-black text-slate-700 dark:text-slate-200 mb-2">{platform}</div>
            <CopyButton text={char} label="Copy" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Tab: Discord Invisible Name ───────────────────────────────────────────────
function DiscordTab() {
  const DISCORD_TIPS = [
    { title: 'Invisible Username', value: '\u3164\u3164\u3164', desc: 'Triple Hangul Filler for blank Discord username' },
    { title: 'Invisible Nickname', value: '\u3164', desc: 'Single char for server nickname' },
    { title: 'Blank Status', value: '\u200B', desc: 'Empty custom status message' },
    { title: 'Invisible Bio', value: '\u3164\u200B\u3164', desc: 'Clear Discord About Me section' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white mb-1">Discord Invisible Name Generator</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Create invisible Discord usernames, nicknames, and status messages with one click.</p>
      </div>

      {/* Quick Copy Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {DISCORD_TIPS.map((tip) => (
          <div key={tip.title} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800 transition-all">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <div className="text-sm font-black text-slate-800 dark:text-slate-200">{tip.title}</div>
                <p className="text-xs text-slate-400 mt-0.5">{tip.desc}</p>
              </div>
              <CopyButton text={tip.value} label="Copy" />
            </div>
          </div>
        ))}
      </div>

      {/* Custom invisible name maker */}
      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 mb-3">Custom Invisible Name Maker</h3>
        <div className="flex items-center gap-2 mb-3">
          <input
            type="number" min={1} max={30}
            placeholder="Length"
            defaultValue={3}
            id="discord-len"
            className="w-20 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm text-center focus:outline-none focus:border-indigo-500"
          />
          <span className="text-xs text-slate-500">characters</span>
          <CopyButton
            text={'\u3164'.repeat(Number((document.getElementById('discord-len') as HTMLInputElement)?.value || 3))}
            label="Generate & Copy"
          />
        </div>
        <p className="text-xs text-slate-400">⚠️ Discord requires at least 2 characters in username. Use 2+ invisible chars.</p>
      </div>

      <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40">
        <p className="text-xs text-indigo-700 dark:text-indigo-300 font-medium">
          💡 <strong>Discord Tip:</strong> The Hangul Filler (U+3164) works best for Discord usernames. Paste the copied character in the "Display Name" or "Server Nickname" field. Works on mobile and desktop!
        </p>
      </div>
    </div>
  );
}

// ─── Tab: Fancy Font Generator ─────────────────────────────────────────────────
function FancyFontTab() {
  const [input, setInput] = useState('Texly');

  const convertFont = (text: string, fontMap: (c: string) => string) =>
    text.split('').map(fontMap).join('');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white mb-1">Fancy Font Generator</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Transform your text into stylish Unicode fonts — perfect for Instagram bios, Discord names, and social media posts.</p>
      </div>

      {/* Input */}
      <div className="relative">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type your text here..."
          className="w-full px-5 py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-base font-medium focus:outline-none focus:border-fuchsia-500 focus:ring-4 focus:ring-fuchsia-500/10 transition-all"
        />
        {input && (
          <button
            onClick={() => setInput('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg"
          >
            Clear
          </button>
        )}
      </div>

      {/* Font Results */}
      <div className="space-y-3">
        {FONT_MAPS.map((font) => {
          const converted = convertFont(input || 'Texly', font.map);
          return (
            <div key={font.name} className="flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-fuchsia-300 dark:hover:border-fuchsia-800 transition-all hover:shadow-md">
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{font.name}</div>
                <div className="text-lg text-slate-800 dark:text-slate-100 truncate select-all">{converted}</div>
              </div>
              <CopyButton text={converted} label="Copy" />
            </div>
          );
        })}
      </div>

      <div className="p-4 rounded-2xl bg-fuchsia-50 dark:bg-fuchsia-950/20 border border-fuchsia-100 dark:border-fuchsia-900/40">
        <p className="text-xs text-fuchsia-700 dark:text-fuchsia-300 font-medium">
          💡 <strong>Works everywhere:</strong> Copy any font style and paste it into Instagram bio, Twitter/X display name, Discord username, WhatsApp name, TikTok bio, and more!
        </p>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function InvisibleTextSuite() {
  const [activeTab, setActiveTab] = useState<string>('invisible');

  const schemaMarkup = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Invisible Text Generator & Blank Message Tool',
    url: CANONICAL,
    description: SEO_DESC,
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'All',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    featureList: [
      'Invisible Text Generator',
      'Blank Text Copy Tool',
      'WhatsApp Blank Message Sender',
      'Discord Invisible Name Generator',
      'Fancy Font Generator',
    ],
  };

  const FAQs = [
    {
      q: 'How do I generate invisible text?',
      a: 'Use the "Invisible Text" tab to select a Unicode character like Zero Width Space (U+200B) or Hangul Filler (U+3164), set the count, and click "Copy Invisible Text". Paste it anywhere — Instagram, Discord, WhatsApp, or gaming apps.',
    },
    {
      q: 'How to send a blank message on WhatsApp?',
      a: 'Go to the "WhatsApp Blank" tab, click "Copy Blank Message", open WhatsApp, paste in the message box, and send. The recipient will see a completely empty message bubble.',
    },
    {
      q: 'How to make an invisible Discord name?',
      a: 'Use the "Discord Name" tab and copy the Hangul Filler (U+3164) character. Paste it in your Discord Display Name or Server Nickname field. Use at least 2 characters to meet Discord\'s minimum username requirement.',
    },
    {
      q: 'Which invisible character works best?',
      a: 'The Hangul Filler (U+3164) is the most universally reliable — it works on Discord, Steam, PUBG, and most gaming platforms. Zero Width Space (U+200B) is best for WhatsApp and Telegram.',
    },
    {
      q: 'Are these invisible characters safe?',
      a: 'Yes, 100% safe. These are standard Unicode characters recognized globally. Our tool runs entirely in your browser — no data is sent to any server. No sign-up, no tracking.',
    },
    {
      q: 'Do fancy fonts work on all platforms?',
      a: 'Fancy Unicode fonts work wherever Unicode is supported — Instagram, Twitter/X, TikTok, Facebook, Discord, WhatsApp, and most modern apps and websites.',
    },
  ];

  const renderTab = () => {
    switch (activeTab) {
      case 'invisible': return <InvisibleTextTab />;
      case 'blank': return <BlankTextTab />;
      case 'whatsapp': return <WhatsAppTab />;
      case 'discord': return <DiscordTab />;
      case 'fancy': return <FancyFontTab />;
      default: return <InvisibleTextTab />;
    }
  };

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950">
      {/* SEO */}
      <Helmet>
        <title>{SEO_TITLE}</title>
        <meta name="description" content={SEO_DESC} />
        <meta name="keywords" content={SEO_KEYWORDS} />
        <link rel="canonical" href={CANONICAL} />
        {/* Open Graph */}
        <meta property="og:title" content={SEO_TITLE} />
        <meta property="og:description" content={SEO_DESC} />
        <meta property="og:url" content={CANONICAL} />
        <meta property="og:type" content="website" />
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={SEO_TITLE} />
        <meta name="twitter:description" content={SEO_DESC} />
        {/* Schema */}
        <script type="application/ld+json">{JSON.stringify(schemaMarkup)}</script>
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: FAQs.map(faq => ({
            '@type': 'Question',
            name: faq.q,
            acceptedAnswer: { '@type': 'Answer', text: faq.a },
          })),
        })}</script>
      </Helmet>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900 pt-16 pb-12">
        <div className="absolute inset-0 pointer-events-none -z-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.4) 0%, transparent 70%)' }} />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full opacity-15"
            style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.4) 0%, transparent 70%)' }} />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm mb-6">
            <Sparkles className="w-3.5 h-3.5 text-violet-300" />
            <span className="text-xs font-black text-violet-200 uppercase tracking-widest">5-in-1 Free Tool</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-4 leading-tight">
            Invisible Text &amp;<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">Blank Message</span> Generator
          </h1>
          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
            Generate invisible characters, send blank WhatsApp messages, create Discord invisible names, and style text with fancy fonts — all in one free tool.
          </p>
          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            {[
              { icon: Shield, text: 'No Signup' },
              { icon: Zap, text: 'Instant Copy' },
              { icon: Star, text: '100% Free' },
              { icon: Clock, text: 'Works Offline' },
            ].map(({ icon: Icon, text }) => (
              <span key={text} className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                <Icon className="w-3.5 h-3.5 text-violet-400" /> {text}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Tool Section */}
      <section className="max-w-4xl mx-auto px-4 py-10">
        {/* Tab Navigation */}
        <div className="flex overflow-x-auto gap-2 pb-2 mb-6 -mx-1 px-1 scrollbar-hide">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/25 scale-105'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Active Tab Content */}
        <div className="p-5 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50">
          {renderTab()}
        </div>
      </section>

      {/* What is Invisible Text — SEO Content */}
      <section className="max-w-4xl mx-auto px-4 pb-10">
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">What is Invisible Text?</h2>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
            Invisible text refers to special Unicode characters that take up space in digital text but are completely invisible to the naked eye. Unlike a regular space (U+0020) that most platforms automatically strip out, invisible Unicode characters like the <strong>Zero Width Space (U+200B)</strong> and <strong>Hangul Filler (U+3164)</strong> are recognized as valid text by applications — meaning they pass through input validation and arrive at the destination intact.
          </p>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
            Our <strong>Invisible Text Generator</strong> makes it effortless to create these characters for any purpose — from sending a <strong>blank WhatsApp message</strong> to creating an <strong>invisible Discord username</strong>, adding empty lines on Instagram, or making your gaming profile stand out with a blank name.
          </p>

          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">5 Tools in One Place</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {[
              { title: '1. Invisible Text Generator', desc: 'Generate any number of invisible Unicode characters. Choose from 6 different types including Zero Width Space, Hangul Filler, and more.' },
              { title: '2. Blank Text Copy Tool', desc: 'One-click copy of blank text in preset lengths — single blank, 5 blanks, 10 blanks, or custom length. Perfect for any platform.' },
              { title: '3. WhatsApp Blank Message', desc: 'Send completely empty messages on WhatsApp using invisible characters that bypass WhatsApp\'s empty message restriction.' },
              { title: '4. Discord Invisible Name', desc: 'Create an invisible Discord username, server nickname, or status. The Hangul Filler works best for Discord name fields.' },
              { title: '5. Fancy Font Generator', desc: 'Transform plain text into beautiful Unicode font styles — cursive, bold, italic, double-struck, circled, and strikethrough. Works on all platforms.' },
            ].map(item => (
              <div key={item.title} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 mb-1">{item.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 pb-16">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {FAQs.map((faq, i) => (
            <FAQItem key={i} question={faq.q} answer={faq.a} />
          ))}
        </div>
      </section>
    </main>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <span className="text-sm font-bold text-slate-800 dark:text-slate-200 pr-4">{question}</span>
        <ChevronDown className={`flex-shrink-0 w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-4 pb-4">
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
}
