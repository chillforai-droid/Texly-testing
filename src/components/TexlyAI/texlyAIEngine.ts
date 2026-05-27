/**
 * texlyAIEngine.ts
 * =====================
 * Gemini + Groq powered AI engine for Texly
 * - Gemini Flash (free tier) → primary
 * - Groq (free models) → fallback
 * - Bilingual: auto-detects Hindi vs English and responds accordingly
 */

import { buildSystemPrompt, Lang } from './texlyPersonality';

// ─── Config ───────────────────────────────────────────────────────────────────
// Keys should be in .env as VITE_GEMINI_API_KEY and VITE_GROQ_API_KEY
const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY || '';

// ─── Conversation history (for multi-turn context) ────────────────────────────
export interface ChatMessage {
  role: 'user' | 'model' | 'assistant';
  content: string;
}

// ─── Gemini API call ──────────────────────────────────────────────────────────
async function callGemini(
  userMessage: string,
  history: ChatMessage[],
  systemPrompt: string,
  signal?: AbortSignal
): Promise<string> {
  if (!GEMINI_KEY) throw new Error('No Gemini key');

  // Build Gemini contents array (history + new message)
  // Gemini uses 'user' / 'model' roles
  const contents = [
    ...history
      .filter(m => m.role === 'user' || m.role === 'model')
      .map(m => ({
        role: m.role as 'user' | 'model',
        parts: [{ text: m.content }],
      })),
    { role: 'user' as const, parts: [{ text: userMessage }] },
  ];

  const body = {
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents,
    generationConfig: {
      maxOutputTokens: 300,
      temperature: 0.85,
      topP: 0.9,
    },
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
    ],
  };

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal,
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini error ${res.status}: ${err}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty Gemini response');
  return text.trim();
}

// ─── Groq API call ────────────────────────────────────────────────────────────
async function callGroq(
  userMessage: string,
  history: ChatMessage[],
  systemPrompt: string,
  signal?: AbortSignal
): Promise<string> {
  if (!GROQ_KEY) throw new Error('No Groq key');

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    { role: 'user', content: userMessage },
  ];

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GROQ_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile', // free Groq model
      messages,
      max_tokens: 300,
      temperature: 0.85,
    }),
    signal,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq error ${res.status}: ${err}`);
  }

  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error('Empty Groq response');
  return text.trim();
}

// ─── Main AI call — Gemini first, Groq fallback ───────────────────────────────
export async function callAI(
  userMessage: string,
  history: ChatMessage[],
  lang: Lang,
  toolSlug: string,
  toolName: string,
  signal?: AbortSignal
): Promise<string> {
  const systemPrompt = buildSystemPrompt(lang, toolSlug, toolName);

  // Try Gemini first
  if (GEMINI_KEY) {
    try {
      return await callGemini(userMessage, history, systemPrompt, signal);
    } catch (e: any) {
      if (e?.name === 'AbortError') throw e;
      console.warn('[Texly AI] Gemini failed, trying Groq...', e?.message);
    }
  }

  // Fallback to Groq
  if (GROQ_KEY) {
    try {
      // Groq uses 'assistant' role, convert history
      const groqHistory = history.map(m => ({
        ...m,
        role: m.role === 'model' ? 'assistant' as const : m.role as 'user' | 'assistant',
      }));
      return await callGroq(userMessage, groqHistory, systemPrompt, signal);
    } catch (e: any) {
      if (e?.name === 'AbortError') throw e;
      console.warn('[Texly AI] Groq also failed', e?.message);
    }
  }

  throw new Error('Both AI providers failed');
}

// ─── Text tool AI helper ──────────────────────────────────────────────────────
// Jab text tool fail ho, AI directly kaam kar ke de
export async function aiDoTextWork(
  task: string,
  inputText: string,
  lang: Lang,
  signal?: AbortSignal
): Promise<string> {
  const systemPrompt = lang === 'hi'
    ? `Tu ek expert text processing AI hai. Sirf result return kar — koi explanation, koi intro nahi. Pure output do.`
    : `You are an expert text processing AI. Return ONLY the result — no explanation, no intro, just pure output.`;

  const prompt = lang === 'hi'
    ? `Kaam: ${task}\n\nText:\n${inputText}`
    : `Task: ${task}\n\nText:\n${inputText}`;

  // Try Gemini first for text work too
  if (GEMINI_KEY) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: systemPrompt }] },
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 2000, temperature: 0.3 },
          }),
          signal,
        }
      );
      if (res.ok) {
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text.trim();
      }
    } catch (e: any) {
      if (e?.name === 'AbortError') throw e;
    }
  }

  // Fallback to Groq
  if (GROQ_KEY) {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        max_tokens: 2000,
        temperature: 0.3,
      }),
      signal,
    });
    if (res.ok) {
      const data = await res.json();
      const text = data?.choices?.[0]?.message?.content;
      if (text) return text.trim();
    }
  }

  throw new Error('AI text work failed');
}

