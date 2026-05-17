import React, { useState } from 'react';
import { Sparkles, Loader2, ChevronDown, ChevronUp, Wand2 } from 'lucide-react';

// Tool-specific AI modes
const TOOL_MODES: Record<string, { label: string; emoji: string; prompt: (text: string) => string }[]> = {
  'text-repeater': [
    { label: 'Funny Version', emoji: '😂', prompt: (t) => `Take this text and make it funny, viral, and entertaining with emojis. Repeat the core idea 3 times in different humorous ways. Text: "${t}"` },
    { label: 'Stylish Format', emoji: '✨', prompt: (t) => `Format this text in a stylish, aesthetic way with Unicode decorations and symbols. Make it Instagram-worthy. Text: "${t}"` },
    { label: 'Viral Post', emoji: '🔥', prompt: (t) => `Turn this into a viral social media post with hashtags, emojis, and hooks. Text: "${t}"` },
  ],
  'remove-special-characters': [
    { label: 'Smart Clean', emoji: '🧹', prompt: (t) => `Clean this text by removing special characters while preserving meaning and readability. Return ONLY the cleaned text: "${t}"` },
    { label: 'SEO Optimize', emoji: '🎯', prompt: (t) => `Clean and optimize this text for SEO — remove special chars, normalize spacing, keep it readable. Return ONLY the result: "${t}"` },
  ],
  'text-to-list': [
    { label: 'Organize', emoji: '📋', prompt: (t) => `Convert this text into a clean, organized bullet list. Group related items. Return ONLY the list: "${t}"` },
    { label: 'Categorize', emoji: '🗂️', prompt: (t) => `Analyze this text and organize items under emoji category headers. Return ONLY the categorized list: "${t}"` },
  ],
  'find-replace': [
    { label: 'Fix Grammar', emoji: '✏️', prompt: (t) => `Fix all grammar, spelling and punctuation errors in this text. Return ONLY the corrected text: "${t}"` },
    { label: 'Improve Writing', emoji: '🚀', prompt: (t) => `Improve the overall quality and clarity of this text. Return ONLY the improved version: "${t}"` },
  ],
  'morse-code': [
    { label: 'Spy Message', emoji: '🕵️', prompt: (t) => `Transform this into a dramatic spy-style secret message with mission codenames and intrigue. Under 120 words. Text: "${t}"` },
    { label: 'Fun Story', emoji: '📖', prompt: (t) => `Create a short fun story using Morse code as a theme around this text. Text: "${t}"` },
  ],
  'fancy-text': [
    { label: 'Instagram Bio', emoji: '📸', prompt: (t) => `Create 3 amazing aesthetic Instagram bio options using this text. Add emojis, line breaks, and make them viral. Text: "${t}"` },
    { label: 'Gaming Name', emoji: '🎮', prompt: (t) => `Generate 5 epic gaming username variations from this text using special symbols. Make them powerful and unique. Text: "${t}"` },
    { label: 'Viral Caption', emoji: '🌟', prompt: (t) => `Write a viral social media caption inspired by this text with hooks, emojis, and hashtags. Text: "${t}"` },
  ],
  'remove-extra-spaces': [
    { label: 'Professional Format', emoji: '💼', prompt: (t) => `Format this text professionally with proper spacing and paragraph structure. Return ONLY the formatted text: "${t}"` },
    { label: 'Clean Paragraph', emoji: '📝', prompt: (t) => `Remove all extra spaces and reformat into clean, well-spaced paragraphs. Return ONLY the result: "${t}"` },
  ],
  'paraphrase': [
    { label: 'Simplify', emoji: '💡', prompt: (t) => `Paraphrase this text in simpler, easier to understand language. Return ONLY the paraphrased version: "${t}"` },
    { label: 'Professional', emoji: '👔', prompt: (t) => `Rewrite this in a formal, professional tone. Return ONLY the rewritten text: "${t}"` },
    { label: 'Creative', emoji: '🎨', prompt: (t) => `Rewrite this in a creative, engaging, and vivid way. Return ONLY the rewritten text: "${t}"` },
  ],
  'whatsapp-text-formatter': [
    { label: 'Make Catchy', emoji: '💬', prompt: (t) => `Rewrite this WhatsApp message to be more catchy, engaging, and conversational. Use *bold* for key words, _italic_ for emphasis, and emojis where appropriate. Return ONLY the formatted WhatsApp message: "${t}"` },
    { label: 'Professional', emoji: '💼', prompt: (t) => `Rewrite this as a professional WhatsApp message. Use *bold* for important points. Keep it concise and clear. Return ONLY the formatted message: "${t}"` },
    { label: 'Add Emojis', emoji: '😄', prompt: (t) => `Add relevant emojis throughout this WhatsApp message to make it fun and expressive. Keep the original meaning. Return ONLY the emoji-enhanced message: "${t}"` },
    { label: 'Shorten', emoji: '✂️', prompt: (t) => `Shorten this WhatsApp message to be concise while keeping all key information. Return ONLY the shortened message: "${t}"` },
  ],
  'text-cleaner': [
    { label: 'Deep Clean', emoji: '🧽', prompt: (t) => `Remove all formatting artifacts, smart quotes, invisible chars and clean this text completely. Return ONLY clean plain text: "${t}"` },
    { label: 'Professional', emoji: '✅', prompt: (t) => `Clean and professionally format this text. Fix spacing, normalize punctuation. Return ONLY the result: "${t}"` },
  ],
};

// Default modes for tools not in the list above
const DEFAULT_MODES = [
  { label: 'Improve Text', emoji: '✨', prompt: (t: string) => `Improve this text to be clearer and more professional. Return ONLY the improved version: "${t}"` },
  { label: 'Fix Grammar', emoji: '✏️', prompt: (t: string) => `Fix all grammar and spelling errors in this text. Return ONLY the corrected text: "${t}"` },
  { label: 'Make Viral', emoji: '🔥', prompt: (t: string) => `Rewrite this text to be engaging and shareable on social media. Return ONLY the result: "${t}"` },
];

const HF_SPACE = 'Mahendra0160/FreeLLMTexly';

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

  const modes = TOOL_MODES[toolId] || DEFAULT_MODES;

  const callGradio = async (promptText: string, modeLabel: string) => {
    if (!input || input.trim().length < 3) {
      setError('Please enter some text in the tool first.');
      return;
    }
    if (input.length > 4000) {
      setError('Text too long. Please use less than 4000 characters.');
      return;
    }

    setLoading(true);
    setError('');
    setResult('');
    setActiveMode(modeLabel);

    try {
      // Dynamic import to avoid build issues
      const { Client } = await import('@gradio/client');
      const client = await Client.connect(HF_SPACE);
      const response = await client.predict('/generate_text', { prompt: promptText });

      const data = response?.data;
      const text = Array.isArray(data) ? data[0] : data;

      if (text && typeof text === 'string' && text.trim()) {
        setResult(text.trim());
      } else {
        setError('No response received. Please try again.');
      }
    } catch (err: any) {
      console.error('Gradio error:', err);
      setError('AI service temporarily unavailable. Please try again in a moment.');
    } finally {
      setLoading(false);
    }
  };

  const copyResult = () => {
    if (result) {
      navigator.clipboard.writeText(result);
    }
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

      {/* Body */}
      {isOpen && (
        <div className="bg-slate-900 p-4">
          {/* Mode buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
            {modes.map((mode) => (
              <button
                key={mode.label}
                onClick={() => callGradio(mode.prompt(input), mode.label)}
                disabled={loading}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                  ${loading && activeMode === mode.label
                    ? 'bg-purple-700 text-white'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 hover:border-purple-500'
                  }`}
              >
                <span>{mode.emoji}</span>
                <span className="truncate">{mode.label}</span>
                {loading && activeMode === mode.label && (
                  <Loader2 className="w-3 h-3 animate-spin ml-auto shrink-0" />
                )}
              </button>
            ))}
          </div>

          {/* Loading state */}
          {loading && (
            <div className="flex items-center gap-3 text-purple-300 text-sm py-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>AI is processing your text...</span>
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
                  className="text-xs text-slate-400 hover:text-white bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded-lg transition-colors"
                >
                  Copy
                </button>
              </div>
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-3 text-slate-200 text-sm leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
                {result}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
