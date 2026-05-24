/**
 * useTexlyAI.ts - Smart JSON-first KB system for Texly AI Assistant.
 * Fetches knowledge.json ONCE → caches in sessionStorage → zero repeated calls.
 * All tool-specific messages come from JSON — no AI API calls for standard responses.
 */

import { useEffect, useRef, useCallback } from 'react';

const KB_URL =
  'https://raw.githubusercontent.com/chillforai-droid/texly-ai-data/refs/heads/main/knowledge.json';
const KB_SESSION_KEY = 'texly_kb_v2';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ToolData {
  tool_name: string;
  slug: string;
  url: string;
  category: string;
  description_en: string;
  description_hi: string;
  keywords: string[];
  search_terms: string[];
  common_user_problems: string[];
  tool_intro_messages_en: string[];
  tool_intro_messages_hi: string[];
  success_messages_en: string[];
  success_messages_hi: string[];
  error_messages_en: string[];
  error_messages_hi: string[];
  fallback_messages_en: string[];
  fallback_messages_hi: string[];
  related_tools: string[];
  alternative_tools: string[];
  recommended_tools: string[];
  user_guidance_en: string[];
  user_guidance_hi: string[];
  engagement_messages_en: string[];
  engagement_messages_hi: string[];
}

export interface KnowledgeBase {
  site_info?: Record<string, any>;
  global_messages?: {
    welcome_en?: string;
    welcome_hi?: string;
    not_found_en?: string;
    not_found_hi?: string;
  };
  tool_categories?: Array<{ slug: string; name_en: string; name_hi: string; icon: string }>;
  tools?: ToolData[];
  general_faqs?: Array<{
    question: string;
    answer_en?: string;
    answer_hi?: string;
    answer?: string;
    keywords: string[];
  }>;
  fallback_messages?: string[];
  success_messages?: string[];
  exit_messages?: string[];
  recommendations?: Record<string, string[]>;
  alternatives?: Record<string, string[]>;
}

// ─── Singleton cache ──────────────────────────────────────────────────────────
let _kbCache: KnowledgeBase | null = null;
let _kbFetchPromise: Promise<KnowledgeBase | null> | null = null;

export async function getKB(): Promise<KnowledgeBase | null> {
  if (_kbCache) return _kbCache;
  if (_kbFetchPromise) return _kbFetchPromise;

  try {
    const cached = sessionStorage.getItem(KB_SESSION_KEY);
    if (cached) {
      _kbCache = JSON.parse(cached);
      return _kbCache;
    }
  } catch {}

  _kbFetchPromise = fetch(KB_URL)
    .then(r => r.json())
    .then((data: KnowledgeBase) => {
      _kbCache = data;
      try { sessionStorage.setItem(KB_SESSION_KEY, JSON.stringify(data)); } catch {}
      return data;
    })
    .catch(() => null)
    .finally(() => { _kbFetchPromise = null; });

  return _kbFetchPromise;
}

export async function getToolData(slug: string): Promise<ToolData | null> {
  const kb = await getKB();
  if (!kb?.tools) return null;
  return kb.tools.find(t => t.slug === slug) ?? null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function detectLang(text: string): 'hi' | 'en' {
  if (/[\u0900-\u097F]/.test(text)) return 'hi';
  const hinglish = ['kya','hai','kaise','mujhe','aap','nahi','bhi','yeh','woh','karein','karo'];
  const hits = hinglish.filter(w => text.toLowerCase().includes(w));
  return hits.length >= 2 ? 'hi' : 'en';
}

export function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─── Event bus ────────────────────────────────────────────────────────────────
const AI_EVENT = 'texly:ai:message';

export function emitAIMessage(text: string) {
  window.dispatchEvent(new CustomEvent(AI_EVENT, { detail: { text } }));
}

// ─── useToolSuccess ───────────────────────────────────────────────────────────
export function useToolSuccess(toolSlug: string) {
  const celebrate = useCallback(async () => {
    const tool = await getToolData(toolSlug);
    let msgs: string[] = [];
    if (tool) {
      msgs = [
        ...(tool.success_messages_en || []),
        ...(tool.success_messages_hi || []),
      ];
    }
    if (!msgs.length) {
      const kb = await getKB();
      msgs = kb?.success_messages || ['🎉 Done! Successfully complete!', '✅ Kaam ho gaya!'];
    }
    emitAIMessage(pickRandom(msgs));
  }, [toolSlug]);
  return { celebrate };
}

// ─── useToolFailure ───────────────────────────────────────────────────────────
export function useToolFailure(toolSlug: string) {
  const reportFailure = useCallback(async (customMsg?: string) => {
    if (customMsg) { emitAIMessage(customMsg); return; }

    const tool = await getToolData(toolSlug);
    let errorMsg = '';
    let altText = '';

    if (tool) {
      const errorMsgs = [
        ...(tool.error_messages_en || []),
        ...(tool.error_messages_hi || []),
        ...(tool.fallback_messages_en || []),
        ...(tool.fallback_messages_hi || []),
      ];
      if (errorMsgs.length) errorMsg = pickRandom(errorMsgs);

      const altSlugs = tool.alternative_tools?.length ? tool.alternative_tools : (tool.related_tools || []);
      if (altSlugs.length) {
        const kb = await getKB();
        const names = altSlugs
          .map(s => kb?.tools?.find(t => t.slug === s)?.tool_name || s)
          .map(n => '• ' + n);
        altText = '\n\n🔗 **Ye tools bhi try karein:**\n' + names.join('\n');
      }
    }

    if (!errorMsg) errorMsg = '⚠️ Kuch problem aa gayi. Thodi der baad try karein ya page reload karein.';
    emitAIMessage(errorMsg + altText);
  }, [toolSlug]);
  return { reportFailure };
}

// ─── Tool Intro ───────────────────────────────────────────────────────────────
export async function getToolIntroMessage(toolSlug: string, lang: 'hi' | 'en' = 'en'): Promise<string | null> {
  const tool = await getToolData(toolSlug);
  if (!tool) return null;
  const msgs = lang === 'hi' ? tool.tool_intro_messages_hi : tool.tool_intro_messages_en;
  if (msgs?.length) return pickRandom(msgs);
  const desc = lang === 'hi' ? tool.description_hi : tool.description_en;
  const steps = lang === 'hi' ? tool.user_guidance_hi : tool.user_guidance_en;
  return `🤖 **${tool.tool_name}** pe welcome!\n\n${desc}${steps?.length ? '\n\n📋 ' + steps.map((s,i) => `${i+1}. ${s}`).join('\n') : ''}`;
}

// ─── Guidance ─────────────────────────────────────────────────────────────────
export async function getToolGuidance(toolSlug: string, lang: 'hi' | 'en' = 'en'): Promise<string | null> {
  const tool = await getToolData(toolSlug);
  if (!tool) return null;
  const steps = lang === 'hi' ? tool.user_guidance_hi : tool.user_guidance_en;
  if (!steps?.length) return null;
  return `📋 **${tool.tool_name} — Kaise use karein:**\n\n${steps.map((s,i) => `${i+1}. ${s}`).join('\n')}`;
}

// ─── Tool Search ──────────────────────────────────────────────────────────────
export async function searchTools(query: string): Promise<ToolData[]> {
  const kb = await getKB();
  if (!kb?.tools) return [];
  const q = query.toLowerCase();
  return kb.tools.filter(t =>
    t.keywords?.some(k => k.toLowerCase().includes(q)) ||
    t.search_terms?.some(s => s.toLowerCase().includes(q)) ||
    t.tool_name.toLowerCase().includes(q) ||
    t.description_en.toLowerCase().includes(q)
  );
}

// ─── Internal listener ────────────────────────────────────────────────────────
export function useAIMessages(onMessage: (text: string) => void) {
  const ref = useRef(onMessage);
  ref.current = onMessage;
  useEffect(() => {
    const handler = (e: Event) => {
      const text = (e as CustomEvent).detail?.text;
      if (text) ref.current(text);
    };
    window.addEventListener(AI_EVENT, handler);
    return () => window.removeEventListener(AI_EVENT, handler);
  }, []);
}
