/**
 * TexlyAIAssistant.tsx
 * =====================
 * Main AI Smart Assistant Component for Texly
 * - Floating button (always visible)
 * - Chat popup (glassmorphism, ChatGPT-feel)
 * - Hybrid JSON + HF AI backend
 * - Tool-aware, language-aware
 * - Exit intent detection
 * - Memory-like experience
 */

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import { useLocation } from 'react-router-dom';
import { Client } from '@gradio/client';
import {
  useAIMessages,
  getKB,
  getToolData,
  getToolIntroMessage,
  getToolGuidance,
  searchTools,
  detectLang,
  KnowledgeBase,
  ToolData,
} from './useTexlyAI';

// ─── Types ─────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: number;
}

// ─── Constants ─────────────────────────────────────────────────────────────

const HF_SPACE = 'Mahendra0160/TexlyKnowlege';
const KB_URL =
  'https://raw.githubusercontent.com/chillforai-droid/texly-ai-data/refs/heads/main/knowledge.json';
const TOOL_USAGE_KEY = 'texly_tool_usage';
const CHAT_HISTORY_KEY = 'texly_chat_session';

// ─── Default fallback data (used before JSON loads) ─────────────────────────

const DEFAULT_FALLBACK: KnowledgeBase = {
  fallback_messages: [
    '🤖 Kuch issue aa gaya, lekin main yahan hoon! Kya main kisi aur tarah help kar sakta hoon?',
    "⚠️ Network slow hai. Please ek second ruko, ya try again karo.",
    '🙏 Sorry, right now AI busy hai. Main JSON se answer dene ki koshish karta hoon.',
  ],
  success_messages: [
    '🎉 Bahut badiya! Aapka kaam ho gaya!',
    '🚀 Done! File taiyar hai!',
    '✅ Perfect! Successfully complete!',
    '🎊 Zabardast! Ab aap download kar sakte hain.',
    '🌟 Great work! Task complete ho gaya!',
  ],
  exit_messages: [
    "😢 Ruk jao! Aapka kaam abhi adha hai.\nTexly AI aapki help kar sakta hai. 💪",
    '🚀 Jaane se pehle — kya aapne ye tools try kiye?\n\n✨ AI Image Generator\n📄 PDF Merger\n🔤 Fancy Text Generator',
    "🤔 Kya koi problem aayi? Main help karne ke liye yahan hoon!",
    '💡 Ek minute! Aapke liye kuch useful tools hain jo aapne abhi try nahi kiye.',
  ],
  recommendations: {
    ai: ['🖼️ Image Generator', '🔄 Face Swap', '🗑️ BG Remover', '✨ Enhancer'],
    pdf: ['📄 PDF Merge', '✂️ PDF Split', '🔄 PDF Convert', '🗜️ PDF Compress'],
    text: ['✨ Fancy Text', '🔤 Text Cleaner', '📊 Word Counter', '🔄 Text Repeater'],
  },
};

// ─── Utility functions ───────────────────────────────────────────────────────

// detectLanguage → imported as detectLang from useTexlyAI

function getToolSlugFromPath(pathname: string): string {
  // /tool/slug, /tools/slug
  const match = pathname.match(/\/tools?\/([^/?#]+)/);
  return match ? match[1] : '';
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 9);
}

// pickRandom → imported from useTexlyAI

// ─── Tool usage tracker ──────────────────────────────────────────────────────

function trackToolUsage(toolSlug: string) {
  try {
    const raw = localStorage.getItem(TOOL_USAGE_KEY);
    const usage: Record<string, number> = raw ? JSON.parse(raw) : {};
    usage[toolSlug] = (usage[toolSlug] || 0) + 1;
    localStorage.setItem(TOOL_USAGE_KEY, JSON.stringify(usage));
  } catch {}
}

function getTopCategories(): string[] {
  try {
    const raw = localStorage.getItem(TOOL_USAGE_KEY);
    if (!raw) return [];
    const usage: Record<string, number> = JSON.parse(raw);
    // Map tool slugs to categories
    const catMap: Record<string, string> = {
      'face-swap': 'ai', 'bg-remover': 'ai', 'enhancer': 'ai',
      'compressor': 'ai', 'image-upscale': 'ai', 'image-generator': 'ai',
      'pdf-merge': 'pdf', 'pdf-split': 'pdf', 'pdf-compress': 'pdf',
    };
    const catCount: Record<string, number> = {};
    Object.entries(usage).forEach(([slug, count]) => {
      const cat = catMap[slug] || 'text';
      catCount[cat] = (catCount[cat] || 0) + count;
    });
    return Object.entries(catCount).sort((a, b) => b[1] - a[1]).map(([c]) => c);
  } catch { return []; }
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function TexlyAIAssistant() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [kb, setKb] = useState<KnowledgeBase>(DEFAULT_FALLBACK);
  const [kbLoaded, setKbLoaded] = useState(false);
  const [showExitPopup, setShowExitPopup] = useState(false);
  const [hasShownIntro, setHasShownIntro] = useState<Record<string, boolean>>({});
  const [toastMessages, setToastMessages] = useState<{
    id: string;
    text: string;
    type?: 'normal' | 'suggestion' | 'rating' | 'rating-nudge';
    tools?: { name: string; url: string; emoji: string }[];
    onRated?: (stars: number, comment: string) => void;
  }[]>([]);
  const engagementTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; initX: number; initY: number } | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const toolSlug = useMemo(() => getToolSlugFromPath(location.pathname), [location.pathname]);

  // Listen for programmatic messages (from useToolSuccess / useToolFailure hooks)
  // → Show as toast, also store in messages for when panel opens later
  useAIMessages((text: string) => {
    addAssistantMessage(text);
    if (!isOpen) {
      showToast(text);
    }
  });

  // ── Load Knowledge Base (delegated to useTexlyAI singleton) ─────────────
  useEffect(() => {
    getKB().then(data => {
      if (data) setKb(data);
      setKbLoaded(true);
    });
  }, []);

  // ── Track tool usage ──────────────────────────────────────────────────────
  useEffect(() => {
    if (toolSlug) trackToolUsage(toolSlug);
  }, [toolSlug]);

  // ── Tool intro popup (JSON-powered, new structure) ───────────────────────
  useEffect(() => {
    if (!toolSlug || !kbLoaded || hasShownIntro[toolSlug]) return;
    const timer = setTimeout(async () => {
      const text = await getToolIntroMessage(toolSlug, 'en');
      if (!text) return;
      addAssistantMessage(text);
      showToast(text);   // ← toast only, panel stays closed
      setHasShownIntro(p => ({ ...p, [toolSlug]: true }));
    }, 1500);
    return () => clearTimeout(timer);
  }, [toolSlug, kbLoaded]);

  // ── Engagement Engine — एक बार preload, एक time पर एक toast, no spam ──
  useEffect(() => {
    if (!toolSlug || !kbLoaded) return;
    if (engagementTimerRef.current) clearTimeout(engagementTimerRef.current);

    // Tool data एक बार cache करो — बार-बार fetch नहीं
    let toolName = toolSlug;
    let relatedCache: { name: string; url: string; emoji: string }[] = [];
    let phase = 0;

    const preload = async () => {
      const tool = await getToolData(toolSlug);
      toolName = tool?.tool_name || toolSlug;
      const kbData = await getKB();
      const slugs = [
        ...(tool?.related_tools || []),
        ...(tool?.alternative_tools || []),
        ...(tool?.recommended_tools || []),
      ].filter((v, i, a) => a.indexOf(v) === i).slice(0, 3);
      const emojiMap: Record<string, string> = {
        'pdf': '📄', 'image': '🖼️', 'face': '😊', 'bg': '✂️',
        'text': '✏️', 'compress': '🗜️', 'enhance': '✨', 'upscale': '🔍',
        'generator': '🎨', 'snapchat': '👻', 'swap': '🔄',
      };
      relatedCache = slugs.map(s => {
        const t = kbData?.tools?.find(x => x.slug === s);
        const emoji = Object.entries(emojiMap).find(([k]) => s.includes(k))?.[1] || '🔧';
        return t ? { name: t.tool_name, url: t.url, emoji } : null;
      }).filter(Boolean) as { name: string; url: string; emoji: string }[];
    };

    // एक toast dismiss होने के बाद अगला — overlap नहीं
    const showAndSchedule = (delayMs: number) => {
      engagementTimerRef.current = setTimeout(async () => {
        // Panel खुला है या पहले से toast है → skip
        if (isOpen) return;
        setToastMessages(current => {
          if (current.length > 0) return current; // already showing something

          if (phase === 0 || phase === 1) {
            if (relatedCache.length === 0) { phase = 2; showAndSchedule(15000); return current; }

            const msgs = [
              `✨ Aap **${toolName}** use kar rahe hain!\nYe related tools bhi try karein 👇`,
              `🚀 **${toolName}** ke saath in tools ka combo kaafi powerful hai! 👇`,
            ];
            const text = msgs[phase % 2];
            const id = generateId();
            setTimeout(() => setToastMessages(p => p.filter(t => t.id !== id)), 10000);
            // Next phase after this toast dismisses
            setTimeout(() => { phase++; showAndSchedule(phase === 2 ? 20000 : 15000); }, 11000);
            return [{ id, text, type: 'suggestion' as const, tools: relatedCache }];

          } else if (phase === 2) {
            // User ने already rate किया है (RatingSystem का localStorage key check)
            try { if (localStorage.getItem(`has_rated_${toolSlug}`)) return current; } catch {}

            // Existing RatingSystem तक scroll कराने का gentle nudge
            const nudgeMsgs = [
              `🥺 **${toolName}** kaisa laga? Neeche ⭐ rating zaroor dein! 💜`,
              `😊 Aapka experience kaisa raha? Rating box neeche hai — ek second lagega! 🙏`,
              `💌 **${toolName}** helpful tha? Neeche scroll karke rating dein! 🌟`,
            ];
            const text = nudgeMsgs[Math.floor(Math.random() * nudgeMsgs.length)];
            const id = generateId();
            setTimeout(() => setToastMessages(p => p.filter(t => t.id !== id)), 8000);
            return [{ id, text, type: 'rating-nudge' as const }];
          }
          return current;
        });
      }, delayMs);
    };

    // Preload silently, then start after 12s
    preload().then(() => showAndSchedule(12000));

    return () => { if (engagementTimerRef.current) clearTimeout(engagementTimerRef.current); };
  }, [toolSlug, kbLoaded]);

  // ── Exit intent ───────────────────────────────────────────────────────────
  useEffect(() => {
    let exitTimer: ReturnType<typeof setTimeout>;
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !showExitPopup) {
        exitTimer = setTimeout(() => setShowExitPopup(true), 200);
      }
    };
    document.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      clearTimeout(exitTimer);
    };
  }, [showExitPopup]);

  // ── Auto scroll ───────────────────────────────────────────────────────────
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // ── Focus input on open ───────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setToastMessages([]); // dismiss toasts when panel opens
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen, isMinimized]);

  // ── Smart memory greeting ─────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen || messages.length > 0) return;
    const topCats = getTopCategories();
    const catLabels: Record<string, string> = {
      ai: 'AI Image Tools', pdf: 'PDF Tools', text: 'Text Tools',
    };
    let greeting = '🤖 **Namaste! Main Texly AI Assistant hoon.**\n\nMain aapki kisi bhi tool ya feature ke baare mein help kar sakta hoon.\n\nAap mujhse Hindi ya English mein pooch sakte hain! 😊';
    if (topCats.length > 0 && catLabels[topCats[0]]) {
      greeting = `🔥 Lagta hai aapko **${catLabels[topCats[0]]}** pasand hain!\n\nKya main aapko related tools suggest karoon? Ya koi specific help chahiye?\n\nHindi/English mein poochh sakte hain! 😊`;
    }
    addAssistantMessage(greeting);
  }, [isOpen]);

  // ─── Message helpers ──────────────────────────────────────────────────────

  function addAssistantMessage(text: string) {
    setMessages(prev => [
      ...prev,
      { id: generateId(), role: 'assistant', text, timestamp: Date.now() },
    ]);
  }

  function addUserMessage(text: string) {
    setMessages(prev => [
      ...prev,
      { id: generateId(), role: 'user', text, timestamp: Date.now() },
    ]);
  }

  // Show a plain floating toast bubble near FAB — does NOT open the panel
  function showToast(text: string) {
    const id = generateId();
    setToastMessages(prev => [...prev, { id, text, type: 'normal' }]);
    setTimeout(() => {
      setToastMessages(prev => prev.filter(t => t.id !== id));
    }, 6000);
  }

  // ─── JSON Lookup (async, new JSON structure) ─────────────────────────────

  async function jsonLookup(query: string): Promise<string | null> {
    const q = query.toLowerCase().trim();
    const lang = detectLang(query);

    // ── Tool-specific knowledge from new JSON structure ──────────────────
    if (toolSlug) {
      const tool = await getToolData(toolSlug);
      if (tool) {
        // How to use / steps / guidance
        if (q.includes('kaise') || q.includes('how') || q.includes('step') || q.includes('guide') || q.includes('batao')) {
          const guidance = await getToolGuidance(toolSlug, lang);
          if (guidance) return guidance;
        }

        // Engagement / tips / tricks
        if (q.includes('tip') || q.includes('trick') || q.includes('pro')) {
          const msgs = lang === 'hi' ? tool.engagement_messages_hi : tool.engagement_messages_en;
          if (msgs?.length) return pickRandom(msgs);
        }

        // Related / alternative tools
        if (q.includes('similar') || q.includes('alternative') || q.includes('related') || q.includes('aur') || q.includes('other')) {
          const altSlugs = tool.alternative_tools?.length ? tool.alternative_tools : tool.related_tools;
          if (altSlugs?.length) {
            const kb2 = await getKB();
            const names = altSlugs.map(s => {
              const t = kb2?.tools?.find(x => x.slug === s);
              return t ? `• [${t.tool_name}](${t.url})` : `• ${s}`;
            });
            return '🔗 **Related Tools:**\n\n' + names.join('\n');
          }
        }

        // What is this tool
        if (q.includes('kya hai') || q.includes('what is') || q.includes('explain') || q.includes('describe')) {
          const desc = lang === 'hi' ? tool.description_hi : tool.description_en;
          return '📖 **' + tool.tool_name + '**\n\n' + desc;
        }

        // Common problems
        if (q.includes('problem') || q.includes('issue') || q.includes('nahi ho raha') || q.includes('not working')) {
          const fallbacks = lang === 'hi' ? tool.fallback_messages_hi : tool.fallback_messages_en;
          if (fallbacks?.length) return pickRandom(fallbacks);
        }

        // Search for other tools user is asking about
        const results = await searchTools(q);
        if (results.length && results[0].slug !== toolSlug) {
          const found = results[0];
          const desc = lang === 'hi' ? found.description_hi : found.description_en;
          return '🔍 **' + found.tool_name + '**\n\n' + desc + '\n\n👉 [Open tool](' + found.url + ')';
        }
      }
    }

    // ── General FAQ ──────────────────────────────────────────────────────
    if (kb.general_faqs) {
      for (const faq of kb.general_faqs) {
        const matched = faq.keywords.some(kw => q.includes(kw.toLowerCase()));
        if (matched) {
          const ans = lang === 'hi' ? (faq.answer_hi || faq.answer) : (faq.answer_en || faq.answer);
          if (ans) return `❓ ${ans}`;
        }
      }
    }

    // ── Category-based recommendations ───────────────────────────────────
    if (q.includes('pdf') || q.includes('document')) {
      const kbData = await getKB();
      const pdfTools = kbData?.tools?.filter(t => t.category === 'pdf-tools').slice(0, 4) || [];
      if (pdfTools.length) {
        const list = pdfTools.map(t => `• [${t.tool_name}](${t.url})`).join('\n');
        return '📄 **PDF Tools aapke liye:**\n\n' + list + '\n\nSab free hain!';
      }
    }
    if (q.includes('image') || q.includes('photo') || q.includes('tasveer')) {
      const kbData = await getKB();
      const imgTools = kbData?.tools?.filter(t => t.category === 'image-tools' || t.category === 'ai-tools').slice(0, 4) || [];
      if (imgTools.length) {
        const list = imgTools.map(t => `• [${t.tool_name}](${t.url})`).join('\n');
        return '🖼️ **Image Tools:**\n\n' + list + '\n\nSab free hain!';
      }
    }

    // ── Greeting ─────────────────────────────────────────────────────────
    if (q.match(/^(hi|hello|hey|namaste|helo|hii|hy|namskar)$/)) {
      return lang === 'hi'
        ? '🙏 Namaste! Main Texly AI hoon. Kisi bhi tool ke baare mein poochh sakte hain!'
        : '👋 Hello! I\'m Texly AI. Ask me anything about our free tools!';
    }

    return null;
  }

  // ─── HF AI call ───────────────────────────────────────────────────────────

  async function callHFAI(message: string): Promise<string> {
    try {
      abortRef.current = new AbortController();
      const client = await Client.connect(HF_SPACE);
      const result = await client.predict('/generate_response', {
        user_message: message,
      });
      const data = result?.data;
      const text = Array.isArray(data) ? data[0] : data;
      if (text && typeof text === 'string' && text.trim()) {
        return text.trim();
      }
      throw new Error('Empty response');
    } catch (err: any) {
      if (err?.name === 'AbortError') throw err;
      // Graceful fallback
      const kbFb = await getKB();
      const fbMsgs = kbFb?.fallback_messages || ['⚠️ AI busy hai. Thodi der baad try karein.'];
      return fbMsgs[Math.floor(Math.random() * fbMsgs.length)];
    }
  }

  // ─── Send message ─────────────────────────────────────────────────────────

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isTyping) return;

    addUserMessage(text);
    setInput('');
    setIsTyping(true);

    try {
      // Fast JSON path first (no API call)
      const jsonAnswer = await jsonLookup(text);
      if (jsonAnswer) {
        await new Promise(r => setTimeout(r, 350));
        addAssistantMessage(jsonAnswer);
        setIsTyping(false);
        return;
      }

      // AI path (only for queries JSON couldn't answer)
      const contextPrefix = toolSlug
        ? `[User is on Texly tool: ${toolSlug}] `
        : '[User is on Texly website] ';
      const aiReply = await callHFAI(contextPrefix + text);
      addAssistantMessage(aiReply);
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        const kb2 = await getKB();
        const fallbacks = kb2?.fallback_messages || ['⚠️ Kuch issue aa gaya. Please try again.'];
        addAssistantMessage(fallbacks[Math.floor(Math.random() * fallbacks.length)]);
      }
    } finally {
      setIsTyping(false);
    }
  }, [input, isTyping, toolSlug, kb]);

  // ─── Quick actions ────────────────────────────────────────────────────────

  function handleQuickAction(action: string) {
    setInput(action);
    setTimeout(() => handleSendRef.current?.(), 50);
  }

  const handleSendRef = useRef<(() => void) | null>(null);
  useEffect(() => { handleSendRef.current = handleSend; }, [handleSend]);

  // ─── Drag support ─────────────────────────────────────────────────────────

  const handleDragStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    dragRef.current = { startX: clientX, startY: clientY, initX: dragPos.x, initY: dragPos.y };
    setIsDragging(true);
  }, [dragPos]);

  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging || !dragRef.current) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      setDragPos({
        x: dragRef.current.initX + (clientX - dragRef.current.startX),
        y: dragRef.current.initY + (clientY - dragRef.current.startY),
      });
    };
    const handleUp = () => setIsDragging(false);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchmove', handleMove, { passive: true });
    window.addEventListener('touchend', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleUp);
    };
  }, [isDragging]);

  // ─── Tool-specific quick actions ──────────────────────────────────────────

  const quickActions = useMemo(() => {
    if (toolSlug) {
      return [
        `${toolSlug} tips kya hain?`,
        `Related tools suggest karo`,
        `${toolSlug} kaise use karein?`,
      ];
    }
    return [
      'AI tools kaunse hain?',
      'PDF tools help',
      'Best text tools?',
    ];
  }, [toolSlug]);

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Exit Intent Popup ── */}
      {showExitPopup && (
        <ExitIntentPopup
          message={(kb.exit_messages || ['😢 Ruk jao! Texly AI aapki help kar sakta hai. 💪'])[Math.floor(Math.random() * (kb.exit_messages?.length || 1))]}
          onClose={() => setShowExitPopup(false)}
          onChat={() => { setShowExitPopup(false); setIsOpen(true); }}
        />
      )}

      {/* ── Toast Bubbles (shown near FAB when panel is closed) ── */}
      {!isOpen && toastMessages.length > 0 && (
        <div className="texly-toast-stack">
          {toastMessages.map((toast) => (
            <div key={toast.id} className={`texly-toast-bubble texly-toast-${toast.type || 'normal'}`}>
              <div className="texly-toast-top-row">
                <div className="texly-toast-avatar">🤖</div>
                <div
                  className="texly-toast-text"
                  dangerouslySetInnerHTML={{
                    __html: toast.text
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\n/g, '<br/>'),
                  }}
                />
                <button
                  className="texly-toast-close"
                  onClick={() => setToastMessages(prev => prev.filter(t => t.id !== toast.id))}
                  aria-label="Dismiss"
                >✕</button>
              </div>

              {/* Suggestion Cards */}
              {toast.type === 'suggestion' && toast.tools && toast.tools.length > 0 && (
                <div className="texly-toast-tool-cards">
                  {toast.tools.map((tool, i) => (
                    <a key={i} href={tool.url} className="texly-toast-tool-card" target="_blank" rel="noopener noreferrer">
                      <span className="texly-tool-card-emoji">{tool.emoji}</span>
                      <span className="texly-tool-card-name">{tool.name}</span>
                      <span className="texly-tool-card-arrow">→</span>
                    </a>
                  ))}
                </div>
              )}

              {/* Rating Nudge — existing RatingSystem तक scroll */}
              {toast.type === 'rating-nudge' && (
                <button
                  className="texly-toast-scroll-btn"
                  onClick={() => {
                    // Toast dismiss first
                    setToastMessages(p => p.filter(t => t.id !== toast.id));

                    // Priority selector list — #rating-section is set on RatingSystem wrapper
                    const el =
                      document.getElementById('rating-section') ||
                      document.querySelector('[id*="rating"]') ||
                      document.querySelector('h3[class*="Rate"]')?.closest('div') ||
                      null;

                    if (el) {
                      // scrollIntoView के साथ थोड़ा offset ताकि navbar cover न करे
                      const yOffset = -80;
                      const top =
                        el.getBoundingClientRect().top + window.pageYOffset + yOffset;
                      window.scrollTo({ top, behavior: 'smooth' });

                      // Visual highlight flash — user को पता चले कहाँ जाएं
                      el.style.transition = 'box-shadow 0.3s ease';
                      el.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.55)';
                      setTimeout(() => {
                        el.style.boxShadow = '';
                      }, 2000);
                    }
                    // Fallback: अगर element नहीं मिला तो कुछ मत करो
                    // (पहले यहाँ scrollTo(scrollHeight) था जो page-end ले जाता था)
                  }}
                >
                  ⭐ Rating दें
                </button>
              )}

              {/* Rating Widget (legacy — kept for backward compat) */}
              {toast.type === 'rating' && toast.onRated && (
                <RatingWidget onSubmit={(stars, comment) => toast.onRated?.(stars, comment)} />
              )}
            </div>
          ))}
          <button
            className="texly-toast-open-btn"
            onClick={() => setIsOpen(true)}
          >
            💬 Chat खोलें
          </button>
        </div>
      )}

      {/* ── Floating Button ── */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="texly-ai-fab"
          aria-label="Open Texly AI Assistant"
        >
          <span className="texly-ai-fab-icon">🤖</span>
          <span className="texly-ai-fab-label">Ask AI</span>
          <span className="texly-ai-fab-pulse" />
        </button>
      )}

      {/* ── Chat Window ── */}
      {isOpen && (
        <div
          ref={popupRef}
          className={`texly-ai-window${isMinimized ? ' minimized' : ''}`}
          style={{
            transform: `translate(${dragPos.x}px, ${dragPos.y}px)`,
          }}
        >
          {/* Header */}
          <div
            className="texly-ai-header"
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
          >
            <div className="texly-ai-header-left">
              <div className="texly-ai-avatar">🤖</div>
              <div>
                <div className="texly-ai-name">Texly AI</div>
                <div className="texly-ai-status">
                  <span className="texly-ai-dot" />
                  Online · Hindi &amp; English
                </div>
              </div>
            </div>
            <div className="texly-ai-header-actions">
              <button
                className="texly-ai-hbtn"
                onClick={() => setIsMinimized(p => !p)}
                aria-label={isMinimized ? 'Expand' : 'Minimize'}
              >
                {isMinimized ? '▲' : '▼'}
              </button>
              <button
                className="texly-ai-hbtn close"
                onClick={() => setIsOpen(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Body */}
          {!isMinimized && (
            <>
              <div className="texly-ai-messages">
                {messages.map(msg => (
                  <ChatBubble key={msg.id} message={msg} />
                ))}
                {isTyping && <TypingIndicator />}
                <div ref={chatEndRef} />
              </div>

              {/* Quick Actions */}
              {messages.length <= 2 && (
                <div className="texly-ai-quick-actions">
                  {quickActions.map((qa, i) => (
                    <button
                      key={i}
                      className="texly-ai-qa-btn"
                      onClick={() => handleQuickAction(qa)}
                    >
                      {qa}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className="texly-ai-input-row">
                <input
                  ref={inputRef}
                  className="texly-ai-input"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  placeholder="Hindi ya English mein poochein..."
                  disabled={isTyping}
                  maxLength={500}
                />
                <button
                  className="texly-ai-send-btn"
                  onClick={handleSend}
                  disabled={isTyping || !input.trim()}
                  aria-label="Send"
                >
                  {isTyping ? (
                    <span className="texly-ai-spinner" />
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  )}
                </button>
              </div>

              <div className="texly-ai-footer">
                Powered by <strong>Texly AI</strong> · texlyonline.in
              </div>
            </>
          )}
        </div>
      )}

      <style>{STYLES}</style>
    </>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ChatBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  // Render markdown-like bold (**text**) and line breaks
  const formatText = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>');
  };

  return (
    <div className={`texly-ai-bubble-wrap ${isUser ? 'user' : 'bot'}`}>
      {!isUser && <div className="texly-ai-bubble-avatar">🤖</div>}
      <div
        className={`texly-ai-bubble ${isUser ? 'user' : 'bot'}`}
        dangerouslySetInnerHTML={{ __html: formatText(message.text) }}
      />
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="texly-ai-bubble-wrap bot">
      <div className="texly-ai-bubble-avatar">🤖</div>
      <div className="texly-ai-bubble bot texly-ai-typing">
        <span /><span /><span />
      </div>
    </div>
  );
}

// ─── Rating Widget ────────────────────────────────────────────────────────────

function RatingWidget({ onSubmit }: { onSubmit: (stars: number, comment: string) => void }) {
  const [stars, setStars] = React.useState(0);
  const [hovered, setHovered] = React.useState(0);
  const [comment, setComment] = React.useState('');
  const [submitted, setSubmitted] = React.useState(false);

  if (submitted) {
    return (
      <div className="texly-rating-thanks">
        🎉 Shukriya aapka! Aapka feedback milgaya! 💜
      </div>
    );
  }

  return (
    <div className="texly-rating-widget">
      <div className="texly-rating-stars">
        {[1, 2, 3, 4, 5].map(s => (
          <button
            key={s}
            className={`texly-star-btn${(hovered || stars) >= s ? ' active' : ''}`}
            onMouseEnter={() => setHovered(s)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => setStars(s)}
            aria-label={`${s} star`}
          >★</button>
        ))}
      </div>
      {stars > 0 && (
        <>
          <input
            className="texly-rating-input"
            placeholder="Koi comment? (optional) 😊"
            value={comment}
            onChange={e => setComment(e.target.value)}
            maxLength={120}
          />
          <button
            className="texly-rating-submit"
            onClick={() => { setSubmitted(true); onSubmit(stars, comment); }}
          >
            💌 Submit करें
          </button>
        </>
      )}
    </div>
  );
}

function ExitIntentPopup({
  message,
  onClose,
  onChat,
}: {
  message: string;
  onClose: () => void;
  onChat: () => void;
}) {
  return (
    <div className="texly-exit-overlay" onClick={onClose}>
      <div className="texly-exit-popup" onClick={e => e.stopPropagation()}>
        <button className="texly-exit-close" onClick={onClose}>✕</button>
        <div
          className="texly-exit-content"
          dangerouslySetInnerHTML={{ __html: message.replace(/\n/g, '<br/>') }}
        />
        <div className="texly-exit-actions">
          <button className="texly-exit-btn primary" onClick={onChat}>
            🤖 AI से पूछें
          </button>
          <button className="texly-exit-btn secondary" onClick={onClose}>
            Website Explore करें
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const STYLES = `
/* ===== TEXLY AI ASSISTANT STYLES ===== */
/* Import font */
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

.texly-ai-fab {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9998;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 13px 20px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a78bfa 100%);
  color: #fff;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.3px;
  box-shadow: 0 4px 24px rgba(99,102,241,0.45), 0 2px 8px rgba(0,0,0,0.12);
  transition: transform 0.2s cubic-bezier(.34,1.56,.64,1), box-shadow 0.2s ease;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}
.texly-ai-fab:hover {
  transform: translateY(-3px) scale(1.04);
  box-shadow: 0 8px 32px rgba(99,102,241,0.55), 0 3px 12px rgba(0,0,0,0.15);
}
.texly-ai-fab:active {
  transform: scale(0.96);
}
.texly-ai-fab-icon { font-size: 18px; line-height: 1; }
.texly-ai-fab-label { white-space: nowrap; }
.texly-ai-fab-pulse {
  position: absolute;
  top: -3px;
  right: -3px;
  width: 12px;
  height: 12px;
  background: #10b981;
  border-radius: 50%;
  border: 2px solid #fff;
  animation: texlyPulse 2s infinite;
}
@keyframes texlyPulse {
  0%,100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.3); opacity: 0.7; }
}

/* ===== CHAT WINDOW ===== */
.texly-ai-window {
  position: fixed;
  bottom: 90px;
  right: 24px;
  z-index: 9999;
  width: 380px;
  max-height: 560px;
  display: flex;
  flex-direction: column;
  border-radius: 20px;
  overflow: hidden;
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(99,102,241,0.18);
  box-shadow: 0 24px 64px rgba(99,102,241,0.22), 0 8px 24px rgba(0,0,0,0.1);
  animation: texlySlideUp 0.35s cubic-bezier(.34,1.4,.64,1) both;
  font-family: 'Plus Jakarta Sans', sans-serif;
}
.texly-ai-window.minimized {
  max-height: 62px;
  overflow: hidden;
}
@keyframes texlySlideUp {
  from { opacity: 0; transform: translateY(30px) scale(0.95); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

/* ===== HEADER ===== */
.texly-ai-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  cursor: grab;
  user-select: none;
  flex-shrink: 0;
}
.texly-ai-header:active { cursor: grabbing; }
.texly-ai-header-left { display: flex; align-items: center; gap: 10px; }
.texly-ai-avatar {
  width: 38px; height: 38px;
  background: rgba(255,255,255,0.2);
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}
.texly-ai-name {
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.2px;
}
.texly-ai-status {
  color: rgba(255,255,255,0.8);
  font-size: 11px;
  display: flex; align-items: center; gap: 5px;
  margin-top: 1px;
}
.texly-ai-dot {
  width: 7px; height: 7px;
  background: #4ade80;
  border-radius: 50%;
  display: inline-block;
  animation: texlyPulse 2s infinite;
}
.texly-ai-header-actions { display: flex; gap: 6px; }
.texly-ai-hbtn {
  background: rgba(255,255,255,0.18);
  border: none;
  color: #fff;
  width: 28px; height: 28px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 12px;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.15s;
}
.texly-ai-hbtn:hover { background: rgba(255,255,255,0.32); }
.texly-ai-hbtn.close:hover { background: rgba(239,68,68,0.7); }

/* ===== MESSAGES ===== */
.texly-ai-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px 14px 8px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  scroll-behavior: smooth;
  min-height: 0;
}
.texly-ai-messages::-webkit-scrollbar { width: 4px; }
.texly-ai-messages::-webkit-scrollbar-track { background: transparent; }
.texly-ai-messages::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.25); border-radius: 2px; }

.texly-ai-bubble-wrap {
  display: flex;
  align-items: flex-end;
  gap: 7px;
  animation: texlyFadeIn 0.25s ease both;
}
.texly-ai-bubble-wrap.user { flex-direction: row-reverse; }
@keyframes texlyFadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

.texly-ai-bubble-avatar {
  font-size: 18px;
  width: 28px; height: 28px;
  display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg,#6366f1,#8b5cf6);
  border-radius: 9px;
  flex-shrink: 0;
}

.texly-ai-bubble {
  max-width: 82%;
  padding: 10px 13px;
  border-radius: 16px;
  font-size: 13.5px;
  line-height: 1.55;
  word-break: break-word;
}
.texly-ai-bubble.bot {
  background: linear-gradient(135deg, #f0f0ff 0%, #f5f3ff 100%);
  color: #1e1b4b;
  border-bottom-left-radius: 5px;
  border: 1px solid rgba(99,102,241,0.12);
}
.texly-ai-bubble.user {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: #fff;
  border-bottom-right-radius: 5px;
}

/* ===== TYPING ===== */
.texly-ai-typing {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 12px 16px;
  min-width: 56px;
}
.texly-ai-typing span {
  width: 7px; height: 7px;
  background: #8b5cf6;
  border-radius: 50%;
  display: inline-block;
  animation: texlyBounce 1.2s infinite;
}
.texly-ai-typing span:nth-child(2) { animation-delay: 0.2s; }
.texly-ai-typing span:nth-child(3) { animation-delay: 0.4s; }
@keyframes texlyBounce {
  0%,60%,100% { transform: translateY(0); }
  30% { transform: translateY(-7px); }
}

/* ===== QUICK ACTIONS ===== */
.texly-ai-quick-actions {
  padding: 6px 14px;
  display: flex;
  gap: 7px;
  flex-wrap: wrap;
  flex-shrink: 0;
}
.texly-ai-qa-btn {
  background: linear-gradient(135deg,#ede9fe,#f0f0ff);
  border: 1px solid rgba(99,102,241,0.22);
  color: #6366f1;
  padding: 6px 11px;
  border-radius: 20px;
  font-size: 11.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.18s;
  font-family: 'Plus Jakarta Sans', sans-serif;
  white-space: nowrap;
}
.texly-ai-qa-btn:hover {
  background: linear-gradient(135deg,#6366f1,#8b5cf6);
  color: #fff;
  border-color: transparent;
  transform: translateY(-1px);
}

/* ===== INPUT ROW ===== */
.texly-ai-input-row {
  display: flex;
  gap: 8px;
  padding: 10px 14px 8px;
  background: rgba(248,248,255,0.8);
  border-top: 1px solid rgba(99,102,241,0.1);
  flex-shrink: 0;
}
.texly-ai-input {
  flex: 1;
  padding: 10px 14px;
  border: 1.5px solid rgba(99,102,241,0.22);
  border-radius: 12px;
  background: #fff;
  font-size: 13.5px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  color: #1e1b4b;
  outline: none;
  transition: border-color 0.18s, box-shadow 0.18s;
}
.texly-ai-input:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
}
.texly-ai-input::placeholder { color: #a8a8c5; }
.texly-ai-input:disabled { opacity: 0.6; cursor: not-allowed; }

.texly-ai-send-btn {
  width: 42px; height: 42px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border: none;
  border-radius: 12px;
  color: #fff;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.18s;
  flex-shrink: 0;
}
.texly-ai-send-btn:hover:not(:disabled) {
  transform: scale(1.08);
  box-shadow: 0 4px 14px rgba(99,102,241,0.4);
}
.texly-ai-send-btn:disabled { opacity: 0.45; cursor: not-allowed; }

.texly-ai-spinner {
  width: 16px; height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: texlySpin 0.7s linear infinite;
}
@keyframes texlySpin { to { transform: rotate(360deg); } }

/* ===== FOOTER ===== */
.texly-ai-footer {
  text-align: center;
  font-size: 10px;
  color: #a8a8c5;
  padding: 4px 14px 8px;
  flex-shrink: 0;
}
.texly-ai-footer strong { color: #6366f1; }

/* ===== EXIT POPUP ===== */
.texly-exit-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: texlyFadeIn 0.2s ease both;
  padding: 16px;
}
.texly-exit-popup {
  background: rgba(255,255,255,0.97);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-radius: 24px;
  padding: 32px 28px 28px;
  max-width: 380px;
  width: 100%;
  text-align: center;
  position: relative;
  box-shadow: 0 32px 80px rgba(99,102,241,0.25), 0 8px 24px rgba(0,0,0,0.1);
  border: 1px solid rgba(99,102,241,0.15);
  animation: texlySlideUp 0.35s cubic-bezier(.34,1.4,.64,1) both;
  font-family: 'Plus Jakarta Sans', sans-serif;
}
.texly-exit-close {
  position: absolute;
  top: 14px; right: 14px;
  background: #f0f0ff;
  border: none;
  width: 30px; height: 30px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  color: #6366f1;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.15s;
}
.texly-exit-close:hover { background: #ede9fe; }
.texly-exit-content {
  font-size: 16px;
  color: #1e1b4b;
  line-height: 1.7;
  margin: 8px 0 24px;
  font-weight: 500;
}
.texly-exit-actions {
  display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;
}
.texly-exit-btn {
  padding: 11px 22px;
  border-radius: 12px;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.18s;
  font-family: 'Plus Jakarta Sans', sans-serif;
}
.texly-exit-btn.primary {
  background: linear-gradient(135deg,#6366f1,#8b5cf6);
  color: #fff;
  box-shadow: 0 4px 14px rgba(99,102,241,0.35);
}
.texly-exit-btn.primary:hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(99,102,241,0.45); }
.texly-exit-btn.secondary {
  background: #f0f0ff;
  color: #6366f1;
}
.texly-exit-btn.secondary:hover { background: #ede9fe; }

/* ===== TOAST BUBBLES ===== */
.texly-toast-stack {
  position: fixed;
  bottom: 90px;
  right: 16px;
  z-index: 9997;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-end;
  width: 300px;
  max-width: calc(100vw - 24px);
}
.texly-toast-bubble {
  width: 100%;
  background: rgba(255,255,255,0.98);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(99,102,241,0.15);
  border-radius: 16px;
  border-bottom-right-radius: 5px;
  padding: 12px 12px 12px 12px;
  box-shadow: 0 6px 20px rgba(99,102,241,0.15), 0 2px 6px rgba(0,0,0,0.07);
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 13px;
  color: #1e1b4b;
  line-height: 1.5;
  animation: texlyToastIn 0.3s cubic-bezier(.34,1.4,.64,1) both;
  box-sizing: border-box;
  word-break: break-word;
}
@keyframes texlyToastIn {
  from { opacity: 0; transform: translateY(12px) scale(0.96); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
.texly-toast-avatar {
  font-size: 17px;
  width: 28px;
  height: 28px;
  min-width: 28px;
  background: linear-gradient(135deg,#6366f1,#8b5cf6);
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.texly-toast-text {
  flex: 1;
  padding-top: 2px;
}
.texly-toast-close {
  background: none;
  border: none;
  color: #a8a8c5;
  font-size: 11px;
  cursor: pointer;
  padding: 0 0 0 4px;
  line-height: 1;
  flex-shrink: 0;
  margin-top: 2px;
  transition: color 0.15s;
}
.texly-toast-close:hover { color: #6366f1; }
.texly-toast-open-btn {
  background: linear-gradient(135deg,#6366f1,#8b5cf6);
  color: #fff;
  border: none;
  border-radius: 20px;
  padding: 7px 16px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  font-family: 'Plus Jakarta Sans', sans-serif;
  box-shadow: 0 3px 10px rgba(99,102,241,0.35);
  transition: all 0.18s;
  align-self: flex-end;
}
.texly-toast-open-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 5px 14px rgba(99,102,241,0.45);
}

/* toast top row layout */
.texly-toast-top-row {
  display: flex;
  align-items: flex-start;
  gap: 9px;
}
.texly-toast-top-row .texly-toast-text { flex: 1; }

/* ── Suggestion tool cards — horizontal chips ── */
.texly-toast-tool-cards {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}
.texly-toast-tool-card {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 10px;
  background: linear-gradient(135deg, #f5f3ff, #ede9fe);
  border: 1px solid rgba(99,102,241,0.2);
  border-radius: 20px;
  text-decoration: none;
  color: #3730a3;
  font-size: 12px;
  font-weight: 600;
  font-family: 'Plus Jakarta Sans', sans-serif;
  transition: all 0.18s;
  white-space: nowrap;
}
.texly-toast-tool-card:hover {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  border-color: transparent;
  transform: translateY(-1px);
}
.texly-tool-card-emoji { font-size: 14px; line-height: 1; }
.texly-tool-card-name { max-width: 90px; overflow: hidden; text-overflow: ellipsis; }
.texly-tool-card-arrow { display: none; }

/* ── Rating widget ── */
.texly-rating-widget {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.texly-rating-stars {
  display: flex;
  gap: 4px;
  justify-content: center;
}
.texly-star-btn {
  background: none;
  border: none;
  font-size: 26px;
  cursor: pointer;
  color: #d1d5db;
  line-height: 1;
  transition: color 0.15s, transform 0.15s;
  padding: 0 2px;
}
.texly-star-btn.active { color: #f59e0b; }
.texly-star-btn:hover { transform: scale(1.2); }
.texly-rating-input {
  width: 100%;
  padding: 8px 11px;
  border: 1.5px solid rgba(99,102,241,0.22);
  border-radius: 10px;
  font-size: 12.5px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  color: #1e1b4b;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.18s;
}
.texly-rating-input:focus { border-color: #6366f1; }
.texly-rating-input::placeholder { color: #a8a8c5; }
.texly-rating-submit {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 8px 14px;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  font-family: 'Plus Jakarta Sans', sans-serif;
  transition: all 0.18s;
  align-self: flex-end;
}
.texly-rating-submit:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(99,102,241,0.4); }
.texly-rating-thanks {
  margin-top: 8px;
  text-align: center;
  font-size: 13px;
  color: #6366f1;
  font-weight: 600;
  padding: 6px 0;
}
/* ── Rating nudge scroll button ── */
.texly-toast-scroll-btn {
  display: block;
  width: 100%;
  margin-top: 10px;
  padding: 9px 14px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  font-family: 'Plus Jakarta Sans', sans-serif;
  transition: all 0.18s;
  text-align: center;
}
.texly-toast-scroll-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(99,102,241,0.4);
}

/* ===== MOBILE RESPONSIVE ===== */
@media (max-width: 480px) {
  .texly-ai-window {
    width: calc(100vw - 16px);
    right: 8px;
    bottom: 80px;
    max-height: 70vh;
    border-radius: 18px;
  }
  .texly-ai-fab {
    bottom: 16px;
    right: 16px;
    padding: 12px 16px;
    font-size: 13px;
  }
  .texly-ai-quick-actions {
    gap: 5px;
  }
  .texly-ai-qa-btn {
    font-size: 11px;
    padding: 5px 9px;
  }
  .texly-ai-bubble {
    font-size: 13px;
  }
  .texly-exit-popup {
    padding: 28px 20px 24px;
    border-radius: 20px;
  }
  .texly-toast-stack {
    right: 8px;
    bottom: 80px;
    width: calc(100vw - 80px);
    max-width: 280px;
  }
  .texly-toast-bubble {
    font-size: 12.5px;
  }
  .texly-toast-tool-card {
    font-size: 11.5px;
    padding: 5px 8px;
  }
}
`;
