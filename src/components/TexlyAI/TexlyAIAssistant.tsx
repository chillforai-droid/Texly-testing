/**
 * TexlyAIAssistant.tsx  — v7 (Gemini + Groq Powered, Bilingual)
 * ================================================================
 * Features:
 *  ✅ Gemini Flash → primary AI  |  Groq → fallback
 *  ✅ Auto bilingual: Hindi user → Hindi, English user → English
 *  ✅ Funny personality — jaise koi dost kaam kar raha ho
 *  ✅ Welcome toast on first visit
 *  ✅ Tool intro on tool page
 *  ✅ Loading jokes when tool is processing
 *  ✅ Exit intent popup (innocent + funny)
 *  ✅ Share/Comment/Rating nudge (funny)
 *  ✅ Tool suggestions mid-session
 *  ✅ AI fallback for text tools (when tool fails, AI does the work)
 *  ✅ Multi-turn chat history for context
 */

import React, {
  useState, useEffect, useRef, useCallback, useMemo,
} from 'react';
import { useLocation } from 'react-router-dom';
import {
  detectLang, Lang,
  WELCOME, LOADING_JOKES, SUCCESS, ERROR_MSGS, EXIT, ENGAGEMENT, SHARE_NUDGE,
  getToolIntro, getToolSuggestion,
  AI_FALLBACK,
  APK_SUGGESTIONS, APK_TRIGGER_KEYWORDS, APK_DOWNLOAD_URL, APK_VERSION,
} from './texlyPersonality';
import {
  callAI, aiDoTextWork, ChatMessage,
} from './texlyAIEngine';
import {
  useAIMessages, getKB, getToolData, searchTools,
  getToolIntroMessage, getToolGuidance,
  emitAIMessage, pickRandom,
  KnowledgeBase, ToolData,
} from './useTexlyAI';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: number;
  isAIWork?: boolean; // special flag for AI-did-the-work messages
}

type ToastType = 'normal' | 'suggestion' | 'rating-nudge' | 'loading-joke' | 'ai-fallback';

interface Toast {
  id: string;
  text: string;
  type: ToastType;
  tools?: { name: string; url: string; emoji: string }[];
  persistent?: boolean; // loading jokes stay until dismissed
}

// ─── Constants ────────────────────────────────────────────────────────────────
const TOOL_USAGE_KEY = 'texly_tool_usage';
const LANG_KEY = 'texly_user_lang';
const VISIT_KEY = 'texly_visited';

function generateId() { return Math.random().toString(36).slice(2, 9); }

function getToolSlug(pathname: string): string {
  const m = pathname.match(/\/tools?\/([^/?#]+)/);
  return m ? m[1] : '';
}

function trackUsage(slug: string) {
  try {
    const raw = localStorage.getItem(TOOL_USAGE_KEY);
    const usage: Record<string, number> = raw ? JSON.parse(raw) : {};
    usage[slug] = (usage[slug] || 0) + 1;
    localStorage.setItem(TOOL_USAGE_KEY, JSON.stringify(usage));
  } catch {}
}

function slugToName(slug: string): string {
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function TexlyAIAssistant() {
  const location = useLocation();
  const toolSlug = useMemo(() => getToolSlug(location.pathname), [location.pathname]);
  const toolName = useMemo(() => slugToName(toolSlug || 'Texly'), [toolSlug]);

  // ── State ──────────────────────────────────────────────────────────────────
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [lang, setLang] = useState<Lang>('en');
  const [showExitPopup, setShowExitPopup] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [hasShownIntro, setHasShownIntro] = useState<Record<string, boolean>>({});
  const [kb, setKb] = useState<KnowledgeBase>({ fallback_messages: [] });
  const [kbLoaded, setKbLoaded] = useState(false);
  const [fabCollapsed, setFabCollapsed] = useState(false);
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [msgCount, setMsgCount] = useState(0); // APK suggest ke liye counter

  // Loading joke cycling
  const [loadingJokeActive, setLoadingJokeActive] = useState(false);
  const loadingJokeRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const loadingToastIdRef = useRef<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const dragRef = useRef<{ startX: number; startY: number; initX: number; initY: number } | null>(null);
  const lastScrollY = useRef(0);
  const engagementTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSendRef = useRef<(() => void) | null>(null);

  // ── Load KB ────────────────────────────────────────────────────────────────
  useEffect(() => {
    getKB().then(data => { if (data) setKb(data); setKbLoaded(true); });
  }, []);

  // ── Track tool usage ───────────────────────────────────────────────────────
  useEffect(() => { if (toolSlug) trackUsage(toolSlug); }, [toolSlug]);

  // ── FAB collapse on scroll ─────────────────────────────────────────────────
  useEffect(() => {
    const handle = () => {
      const y = window.scrollY;
      setFabCollapsed(y > lastScrollY.current && y > 100);
      lastScrollY.current = y;
    };
    window.addEventListener('scroll', handle, { passive: true });
    return () => window.removeEventListener('scroll', handle);
  }, []);

  // ── Listen for programmatic messages (useToolSuccess/Failure hooks) ────────
  useAIMessages((text: string) => {
    addBot(text);
    if (!isOpen) showToast(text, 'normal');
  });

  // ── Welcome toast on first visit ───────────────────────────────────────────
  useEffect(() => {
    try {
      if (localStorage.getItem(VISIT_KEY)) return;
      localStorage.setItem(VISIT_KEY, '1');
    } catch {}
    const timer = setTimeout(() => {
      const savedLang = (localStorage.getItem(LANG_KEY) as Lang) || 'en';
      const msg = pickRandom(WELCOME[savedLang]);
      showToast(msg, 'normal', 8000);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // ── Tool intro popup (when user lands on a tool page) ─────────────────────
  useEffect(() => {
    if (!toolSlug || !kbLoaded || hasShownIntro[toolSlug]) return;
    const timer = setTimeout(async () => {
      // Try JSON-based intro first
      const savedLang = (localStorage.getItem(LANG_KEY) as Lang) || lang;
      const jsonIntro = await getToolIntroMessage(toolSlug, savedLang);
      const msg = jsonIntro || getToolIntro(toolName, savedLang);
      addBot(msg);
      showToast(msg, 'normal', 7000);
      setHasShownIntro(p => ({ ...p, [toolSlug]: true }));
    }, 1500);
    return () => clearTimeout(timer);
  }, [toolSlug, kbLoaded]);

  // ── Engagement engine ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!toolSlug || !kbLoaded) return;
    if (engagementTimerRef.current) clearTimeout(engagementTimerRef.current);

    let phase = 0;
    let relatedCache: { name: string; url: string; emoji: string }[] = [];

    const preload = async () => {
      const tool = await getToolData(toolSlug);
      const kbData = await getKB();
      const emojiMap: Record<string, string> = {
        'pdf': '📄', 'image': '🖼️', 'face': '😊', 'bg': '✂️',
        'text': '✏️', 'compress': '🗜️', 'enhance': '✨', 'upscale': '🔍',
        'generator': '🎨', 'snapchat': '👻', 'swap': '🔄', 'ai': '🤖',
      };
      const slugs = [
        ...(tool?.related_tools || []),
        ...(tool?.recommended_tools || []),
      ].slice(0, 3);
      relatedCache = slugs.map(s => {
        const t = kbData?.tools?.find(x => x.slug === s);
        const emoji = Object.entries(emojiMap).find(([k]) => s.includes(k))?.[1] || '🔧';
        return t ? { name: t.tool_name, url: t.url, emoji } : null;
      }).filter(Boolean) as { name: string; url: string; emoji: string }[];
    };

    const schedule = (delayMs: number) => {
      engagementTimerRef.current = setTimeout(() => {
        if (isOpen) return;
        setToasts(current => {
          if (current.length > 0) return current;
          const savedLang = (localStorage.getItem(LANG_KEY) as Lang) || 'en';

          if (phase === 0 && relatedCache.length > 0) {
            const text = savedLang === 'hi'
              ? `✨ **${toolName}** ke saath ye tools bhi try karo! 👇`
              : `✨ Using **${toolName}**? These tools pair perfectly with it! 👇`;
            const id = generateId();
            phase = 1;
            setTimeout(() => { removeToast(id); schedule(20000); }, 10000);
            return [{ id, text, type: 'suggestion', tools: relatedCache }];
          } else if (phase === 1) {
            try { if (localStorage.getItem(`has_rated_${toolSlug}`)) return current; } catch {}
            const nudgeArr = SHARE_NUDGE[savedLang];
            const text = pickRandom(nudgeArr);
            const id = generateId();
            phase = 2;
            setTimeout(() => removeToast(id), 8000);
            return [{ id, text, type: 'rating-nudge' }];
          } else {
            const text = pickRandom(ENGAGEMENT[savedLang]);
            const id = generateId();
            setTimeout(() => removeToast(id), 8000);
            return [{ id, text, type: 'normal' }];
          }
        });
      }, delayMs);
    };

    preload().then(() => schedule(12000));
    return () => { if (engagementTimerRef.current) clearTimeout(engagementTimerRef.current); };
  }, [toolSlug, kbLoaded]);

  // ── Exit intent ────────────────────────────────────────────────────────────
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const handle = (e: MouseEvent) => {
      if (e.clientY <= 0 && !showExitPopup) {
        t = setTimeout(() => setShowExitPopup(true), 200);
      }
    };
    document.addEventListener('mouseleave', handle);
    return () => { document.removeEventListener('mouseleave', handle); clearTimeout(t); };
  }, [showExitPopup]);

  // ── Auto scroll ────────────────────────────────────────────────────────────
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // ── Focus on open ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setToasts([]);
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen, isMinimized]);

  // ── Smart greeting when panel opens ───────────────────────────────────────
  useEffect(() => {
    if (!isOpen || messages.length > 0) return;
    const savedLang = (localStorage.getItem(LANG_KEY) as Lang) || 'en';
    setLang(savedLang);
    const msg = pickRandom(WELCOME[savedLang]);
    addBot(msg);
  }, [isOpen]);

  // ── Drag ───────────────────────────────────────────────────────────────────
  const handleDragStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const cX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const cY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    dragRef.current = { startX: cX, startY: cY, initX: dragPos.x, initY: dragPos.y };
    setIsDragging(true);
  }, [dragPos]);

  useEffect(() => {
    const move = (e: MouseEvent | TouchEvent) => {
      if (!isDragging || !dragRef.current) return;
      const cX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const cY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      setDragPos({ x: dragRef.current.initX + (cX - dragRef.current.startX), y: dragRef.current.initY + (cY - dragRef.current.startY) });
    };
    const up = () => setIsDragging(false);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    window.addEventListener('touchmove', move, { passive: true });
    window.addEventListener('touchend', up);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
      window.removeEventListener('touchmove', move);
      window.removeEventListener('touchend', up);
    };
  }, [isDragging]);

  // ─── Helpers ──────────────────────────────────────────────────────────────

  function addBot(text: string, isAIWork = false) {
    setMessages(prev => [...prev, { id: generateId(), role: 'assistant', text, timestamp: Date.now(), isAIWork }]);
  }

  function addUser(text: string) {
    setMessages(prev => [...prev, { id: generateId(), role: 'user', text, timestamp: Date.now() }]);
  }

  function showToast(text: string, type: ToastType = 'normal', autoMs = 6000, persistent = false) {
    const id = generateId();
    setToasts(prev => [...prev, { id, text, type, persistent }]);
    if (!persistent && autoMs > 0) {
      setTimeout(() => removeToast(id), autoMs);
    }
    return id;
  }

  function removeToast(id: string) {
    setToasts(prev => prev.filter(t => t.id !== id));
  }

  // ── Loading joke cycle (shows while tool is processing) ───────────────────
  function startLoadingJokes(userLang: Lang) {
    setLoadingJokeActive(true);
    const jokes = LOADING_JOKES[userLang];
    let idx = 0;

    const show = () => {
      if (loadingToastIdRef.current) removeToast(loadingToastIdRef.current);
      const id = showToast(jokes[idx % jokes.length], 'loading-joke', 0, true);
      loadingToastIdRef.current = id;
      idx++;
    };

    show(); // immediate first joke
    loadingJokeRef.current = setInterval(show, 8000);
  }

  function stopLoadingJokes() {
    setLoadingJokeActive(false);
    if (loadingJokeRef.current) { clearInterval(loadingJokeRef.current); loadingJokeRef.current = null; }
    if (loadingToastIdRef.current) { removeToast(loadingToastIdRef.current); loadingToastIdRef.current = null; }
  }

  // ── JSON-based quick lookup (fast, no API) ────────────────────────────────
  async function jsonLookup(query: string, userLang: Lang): Promise<string | null> {
    const q = query.toLowerCase().trim();

    // 📱 APK keyword detect — seedha suggestion do
    const isApkQuery = APK_TRIGGER_KEYWORDS.some(kw => q.includes(kw));
    if (isApkQuery) {
      const apkMsgs = APK_SUGGESTIONS[userLang];
      return apkMsgs[Math.floor(Math.random() * apkMsgs.length)];
    }

    if (toolSlug) {
      const tool = await getToolData(toolSlug);
      if (tool) {
        if (q.match(/kaise|how|step|guide|batao|tutorial/)) {
          const guidance = await getToolGuidance(toolSlug, userLang);
          if (guidance) return guidance;
        }
        if (q.match(/similar|alternative|related|aur|other|jaisa/)) {
          const alts = [...(tool.alternative_tools || []), ...(tool.related_tools || [])].slice(0, 4);
          if (alts.length) {
            const kbData = await getKB();
            const names = alts.map(s => {
              const t = kbData?.tools?.find(x => x.slug === s);
              return t ? `• [${t.tool_name}](${t.url})` : `• ${s}`;
            });
            return (userLang === 'hi' ? '🔗 **Related Tools:**\n\n' : '🔗 **Related Tools:**\n\n') + names.join('\n');
          }
        }
        if (q.match(/kya hai|what is|explain|describe|batao/)) {
          const desc = userLang === 'hi' ? tool.description_hi : tool.description_en;
          return `📖 **${tool.tool_name}**\n\n${desc}`;
        }
      }
    }

    // Greeting
    if (q.match(/^(hi|hello|hey|namaste|helo|hii|hy|namskar|namaskar)$/)) {
      return pickRandom(WELCOME[userLang]);
    }

    // General tool search
    const results = await searchTools(q);
    if (results.length && results[0].slug !== toolSlug) {
      const found = results[0];
      const desc = userLang === 'hi' ? found.description_hi : found.description_en;
      return `🔍 **${found.tool_name}**\n\n${desc}\n\n👉 [${userLang === 'hi' ? 'Tool खोलें' : 'Open tool'}](${found.url})`;
    }

    return null;
  }

  // ── Main send handler ──────────────────────────────────────────────────────
  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isTyping) return;

    // Detect language from THIS message
    const userLang = detectLang(text);
    setLang(userLang);
    try { localStorage.setItem(LANG_KEY, userLang); } catch {}

    addUser(text);
    setInput('');
    setIsTyping(true);

    // Update chat history for multi-turn context
    const newHistory: ChatMessage[] = [
      ...chatHistory,
      { role: 'user', content: text },
    ];

    try {
      // 1️⃣ Fast JSON lookup first
      const jsonAnswer = await jsonLookup(text, userLang);
      if (jsonAnswer) {
        await new Promise(r => setTimeout(r, 300));
        addBot(jsonAnswer);
        setChatHistory([...newHistory, { role: 'model', content: jsonAnswer }]);
        setIsTyping(false);
        return;
      }

      // 2️⃣ Check if user wants AI to do text work
      const lowerText = text.toLowerCase();
      const textWorkTriggers = [
        'likh do', 'likh de', 'likhdo', 'write', 'create', 'banao', 'bana do',
        'summarize', 'summary', 'translate', 'translate karo', 'anuvad',
        'rewrite', 'improve', 'better banao', 'paraphrase', 'expand',
        'ek paragraph', 'essay', 'blog', 'content', 'copy',
      ];
      const isTextWorkRequest = textWorkTriggers.some(t => lowerText.includes(t));

      if (isTextWorkRequest && text.length > 20) {
        abortRef.current = new AbortController();
        const result = await aiDoTextWork(text, '', userLang, abortRef.current.signal);
        const prefix = userLang === 'hi'
          ? `✅ Done! Ye raha aapka content:\n\n`
          : `✅ Done! Here's what I created:\n\n`;
        const fullMsg = prefix + result;
        addBot(fullMsg, true);
        setChatHistory([...newHistory, { role: 'model', content: fullMsg }]);
        setIsTyping(false);
        return;
      }

      // 3️⃣ AI chat (Gemini → Groq)
      abortRef.current = new AbortController();
      const contextMsg = toolSlug
        ? `[Tool: ${toolSlug}] ${text}`
        : text;

      const reply = await callAI(contextMsg, chatHistory, userLang, toolSlug, toolName, abortRef.current.signal);
      addBot(reply);
      setChatHistory([...newHistory, { role: 'model', content: reply }]);

      // 📱 APK periodic suggestion — har 5 messages mein ek baar
      const newCount = msgCount + 1;
      setMsgCount(newCount);
      if (newCount % 5 === 0) {
        const apkMsg = APK_SUGGESTIONS[userLang][Math.floor(Math.random() * APK_SUGGESTIONS[userLang].length)];
        setTimeout(() => {
          addBot(apkMsg);
          if (!isOpen) showToast(apkMsg, 'suggestion', 10000);
        }, 1500);
      }

    } catch (err: any) {
      if (err?.name === 'AbortError') { setIsTyping(false); return; }
      const userLangForError = (localStorage.getItem(LANG_KEY) as Lang) || 'en';
      addBot(pickRandom(AI_FALLBACK[userLangForError]));
    } finally {
      setIsTyping(false);
    }
  }, [input, isTyping, toolSlug, toolName, chatHistory, lang]);

  useEffect(() => { handleSendRef.current = handleSend; }, [handleSend]);

  // ── Quick actions (language-aware) ─────────────────────────────────────────
  const quickActions = useMemo(() => {
    const savedLang = (localStorage.getItem(LANG_KEY) as Lang) || lang;
    if (savedLang === 'hi') {
      return toolSlug
        ? [`${toolName} kaise use karein?`, 'Related tools kaunse hain?', 'Koi tips doge?']
        : ['AI tools kaunse hain?', 'PDF tools help karo', 'Text tools suggest karo'];
    } else {
      return toolSlug
        ? [`How to use ${toolName}?`, 'Show related tools', 'Any tips?']
        : ['What AI tools are available?', 'Help with PDF tools', 'Best text tools?'];
    }
  }, [toolSlug, toolName, lang]);

  // ── Expose loading joke API for other tools ────────────────────────────────
  useEffect(() => {
    (window as any).texlyStartLoading = () => {
      const savedLang = (localStorage.getItem(LANG_KEY) as Lang) || 'en';
      startLoadingJokes(savedLang);
    };
    (window as any).texlyStopLoading = () => stopLoadingJokes();
    (window as any).texlySuccess = () => {
      const savedLang = (localStorage.getItem(LANG_KEY) as Lang) || 'en';
      const msg = pickRandom(SUCCESS[savedLang]);
      showToast(msg, 'normal', 6000);
      addBot(msg);
    };
    (window as any).texlyError = () => {
      const savedLang = (localStorage.getItem(LANG_KEY) as Lang) || 'en';
      const msg = pickRandom(ERROR_MSGS[savedLang]);
      showToast(msg, 'normal', 6000);
      addBot(msg);
    };
    (window as any).texlyAIDoWork = async (task: string, inputText: string) => {
      const savedLang = (localStorage.getItem(LANG_KEY) as Lang) || 'en';
      return aiDoTextWork(task, inputText, savedLang);
    };
    return () => {
      delete (window as any).texlyStartLoading;
      delete (window as any).texlyStopLoading;
      delete (window as any).texlySuccess;
      delete (window as any).texlyError;
      delete (window as any).texlyAIDoWork;
    };
  }, []);

  // ── Exit popup content ─────────────────────────────────────────────────────
  const exitMessage = useMemo(() => {
    const savedLang = (localStorage.getItem(LANG_KEY) as Lang) || 'en';
    return pickRandom(EXIT[savedLang]);
  }, [showExitPopup]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Exit Intent Popup */}
      {showExitPopup && (
        <ExitPopup
          message={exitMessage}
          lang={(localStorage.getItem(LANG_KEY) as Lang) || 'en'}
          onClose={() => setShowExitPopup(false)}
          onChat={() => { setShowExitPopup(false); setIsOpen(true); }}
        />
      )}

      {/* Toast Stack */}
      {!isOpen && toasts.length > 0 && (
        <div className="tai-toast-stack">
          {toasts.map(toast => (
            <div key={toast.id} className={`tai-toast tai-toast-${toast.type}`}>
              <div className="tai-toast-row">
                <div className="tai-toast-avatar">🤖</div>
                <div className="tai-toast-text"
                  dangerouslySetInnerHTML={{
                    __html: toast.text
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\n/g, '<br/>'),
                  }}
                />
                <button className="tai-toast-x" onClick={() => removeToast(toast.id)}>✕</button>
              </div>
              {toast.type === 'suggestion' && toast.tools && (
                <div className="tai-tool-cards">
                  {toast.tools.map((tool, i) => (
                    <a key={i} href={tool.url} className="tai-tool-card" target="_blank" rel="noopener noreferrer">
                      <span>{tool.emoji}</span>
                      <span className="tai-tool-card-name">{tool.name}</span>
                      <span>→</span>
                    </a>
                  ))}
                </div>
              )}
              {toast.type === 'rating-nudge' && (
                <button className="tai-scroll-btn" onClick={() => {
                  removeToast(toast.id);
                  const el = document.getElementById('rating-section') || document.querySelector('[id*="rating"]');
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    (el as HTMLElement).style.boxShadow = '0 0 0 3px rgba(99,102,241,0.55)';
                    setTimeout(() => { (el as HTMLElement).style.boxShadow = ''; }, 2000);
                  }
                }}>⭐ {(localStorage.getItem(LANG_KEY) as Lang) === 'hi' ? 'Rating दें' : 'Give Rating'}</button>
              )}
            </div>
          ))}
          <button className="tai-open-btn" onClick={() => setIsOpen(true)}>
            💬 {(localStorage.getItem(LANG_KEY) as Lang) === 'hi' ? 'Chat खोलें' : 'Open Chat'}
          </button>
        </div>
      )}

      {/* FAB */}
      {!isOpen && (
        <button
          onClick={() => { setIsOpen(true); setFabCollapsed(false); }}
          className={`tai-fab${fabCollapsed ? ' tai-fab--collapsed' : ''}`}
          aria-label="Texly AI"
        >
          <span className="tai-fab-icon">🤖</span>
          {!fabCollapsed && <span className="tai-fab-label">Ask AI</span>}
          <span className="tai-fab-pulse" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          ref={popupRef}
          className={`tai-window${isMinimized ? ' tai-minimized' : ''}`}
          style={{ transform: `translate(${dragPos.x}px,${dragPos.y}px)` }}
        >
          {/* Header */}
          <div className="tai-header" onMouseDown={handleDragStart} onTouchStart={handleDragStart}>
            <div className="tai-header-left">
              <div className="tai-avatar-box">🤖</div>
              <div>
                <div className="tai-ai-name">Texly AI</div>
                <div className="tai-ai-status">
                  <span className="tai-dot" />
                  {lang === 'hi' ? 'Online · Hindi & English' : 'Online · Hindi & English'}
                </div>
              </div>
            </div>
            <div className="tai-header-btns">
              <button className="tai-hbtn" onClick={() => setIsMinimized(p => !p)}>
                {isMinimized ? '▲' : '▼'}
              </button>
              <button className="tai-hbtn tai-close-btn" onClick={() => setIsOpen(false)}>✕</button>
            </div>
          </div>

          {!isMinimized && (
            <>
              <div className="tai-messages">
                {messages.map(msg => (
                  <ChatBubble key={msg.id} message={msg} />
                ))}
                {isTyping && <TypingDots />}
                <div ref={chatEndRef} />
              </div>

              {messages.length <= 2 && (
                <div className="tai-quick-actions">
                  {quickActions.map((qa, i) => (
                    <button key={i} className="tai-qa-btn" onClick={() => {
                      setInput(qa);
                      setTimeout(() => handleSendRef.current?.(), 50);
                    }}>{qa}</button>
                  ))}
                </div>
              )}

              <div className="tai-input-row">
                <input
                  ref={inputRef}
                  className="tai-input"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  placeholder={lang === 'hi' ? 'Hindi ya English mein poochein...' : 'Ask me anything...'}
                  disabled={isTyping}
                  maxLength={500}
                />
                <button
                  className="tai-send"
                  onClick={handleSend}
                  disabled={isTyping || !input.trim()}
                >
                  {isTyping ? <span className="tai-spin" /> : (
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  )}
                </button>
              </div>

              <div className="tai-footer">
                Powered by <strong>Gemini + Groq</strong> · texlyonline.in
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
  const html = message.text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color:#6366f1;text-decoration:underline">$1</a>')
    .replace(/\n/g, '<br/>');

  return (
    <div className={`tai-bubble-wrap ${isUser ? 'user' : 'bot'}`}>
      {!isUser && <div className="tai-bubble-avatar">🤖</div>}
      <div className={`tai-bubble ${isUser ? 'user' : 'bot'}${message.isAIWork ? ' tai-bubble-aiwork' : ''}`}
        dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}

function TypingDots() {
  return (
    <div className="tai-bubble-wrap bot">
      <div className="tai-bubble-avatar">🤖</div>
      <div className="tai-bubble bot tai-typing"><span /><span /><span /></div>
    </div>
  );
}

function ExitPopup({ message, lang, onClose, onChat }: { message: string; lang: Lang; onClose: () => void; onChat: () => void }) {
  return (
    <div className="tai-exit-overlay" onClick={onClose}>
      <div className="tai-exit-popup" onClick={e => e.stopPropagation()}>
        <button className="tai-exit-x" onClick={onClose}>✕</button>
        <div className="tai-exit-content" dangerouslySetInnerHTML={{ __html: message.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') }} />
        <div className="tai-exit-actions">
          <button className="tai-exit-primary" onClick={onChat}>
            🤖 {lang === 'hi' ? 'AI से पूछें' : 'Ask AI'}
          </button>
          <button className="tai-exit-secondary" onClick={onClose}>
            {lang === 'hi' ? 'Website Explore करें' : 'Keep Exploring'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

/* FAB */
.tai-fab {
  position: fixed; bottom: 24px; right: 24px; z-index: 9998;
  display: flex; align-items: center; gap: 8px;
  padding: 13px 20px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a78bfa 100%);
  color: #fff; border: none; border-radius: 50px;
  cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 14px; font-weight: 600; letter-spacing: 0.3px;
  box-shadow: 0 4px 24px rgba(99,102,241,0.45), 0 2px 8px rgba(0,0,0,0.12);
  transition: transform 0.2s cubic-bezier(.34,1.56,.64,1), box-shadow 0.2s, width 0.25s, padding 0.25s, border-radius 0.25s, opacity 0.2s;
  user-select: none; -webkit-tap-highlight-color: transparent;
}
.tai-fab:hover { transform: translateY(-3px) scale(1.04); box-shadow: 0 8px 32px rgba(99,102,241,0.55), 0 3px 12px rgba(0,0,0,0.15); }
.tai-fab:active { transform: scale(0.96); }
.tai-fab--collapsed { padding: 13px; border-radius: 50%; width: 48px; height: 48px; justify-content: center; opacity: 0.75; }
.tai-fab--collapsed:hover { opacity: 1; border-radius: 50px; width: auto; padding: 13px 20px; }
.tai-fab-icon { font-size: 18px; }
.tai-fab-label { white-space: nowrap; }
.tai-fab-pulse {
  position: absolute; top: -3px; right: -3px;
  width: 12px; height: 12px; background: #10b981;
  border-radius: 50%; border: 2px solid #fff;
  animation: taiPulse 2s infinite;
}
@keyframes taiPulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.3);opacity:0.7} }

/* Chat Window */
.tai-window {
  position: fixed; bottom: 90px; right: 24px; z-index: 9999;
  width: 380px; max-height: 560px;
  display: flex; flex-direction: column;
  border-radius: 20px; overflow: hidden;
  background: rgba(255,255,255,0.93);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(99,102,241,0.18);
  box-shadow: 0 24px 64px rgba(99,102,241,0.22), 0 8px 24px rgba(0,0,0,0.1);
  animation: taiSlideUp 0.35s cubic-bezier(.34,1.4,.64,1) both;
  font-family: 'Plus Jakarta Sans', sans-serif;
}
.tai-minimized { max-height: 62px; overflow: hidden; }
@keyframes taiSlideUp { from{opacity:0;transform:translateY(30px) scale(0.95)} to{opacity:1;transform:translateY(0) scale(1)} }

/* Header */
.tai-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 16px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  cursor: grab; user-select: none; flex-shrink: 0;
}
.tai-header:active { cursor: grabbing; }
.tai-header-left { display: flex; align-items: center; gap: 10px; }
.tai-avatar-box {
  width: 38px; height: 38px;
  background: rgba(255,255,255,0.2); border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  font-size: 20px; flex-shrink: 0;
}
.tai-ai-name { color: #fff; font-size: 15px; font-weight: 700; }
.tai-ai-status { color: rgba(255,255,255,0.8); font-size: 11px; display: flex; align-items: center; gap: 5px; margin-top: 1px; }
.tai-dot { width: 7px; height: 7px; background: #4ade80; border-radius: 50%; animation: taiPulse 2s infinite; }
.tai-header-btns { display: flex; gap: 6px; }
.tai-hbtn {
  background: rgba(255,255,255,0.18); border: none; color: #fff;
  width: 28px; height: 28px; border-radius: 8px; cursor: pointer;
  font-size: 12px; display: flex; align-items: center; justify-content: center; transition: background 0.15s;
}
.tai-hbtn:hover { background: rgba(255,255,255,0.32); }
.tai-close-btn:hover { background: rgba(239,68,68,0.7) !important; }

/* Messages */
.tai-messages {
  flex: 1; overflow-y: auto; padding: 16px 14px 8px;
  display: flex; flex-direction: column; gap: 10px;
  scroll-behavior: smooth; min-height: 0;
}
.tai-messages::-webkit-scrollbar { width: 4px; }
.tai-messages::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.25); border-radius: 2px; }

.tai-bubble-wrap { display: flex; align-items: flex-end; gap: 7px; animation: taiFadeIn 0.25s ease both; }
.tai-bubble-wrap.user { flex-direction: row-reverse; }
@keyframes taiFadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }

.tai-bubble-avatar {
  font-size: 18px; width: 28px; height: 28px;
  background: linear-gradient(135deg,#6366f1,#8b5cf6);
  border-radius: 9px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.tai-bubble {
  max-width: 82%; padding: 10px 13px; border-radius: 16px;
  font-size: 13.5px; line-height: 1.55; word-break: break-word;
}
.tai-bubble.bot {
  background: linear-gradient(135deg, #f0f0ff, #f5f3ff);
  color: #1e1b4b; border-bottom-left-radius: 5px;
  border: 1px solid rgba(99,102,241,0.12);
}
.tai-bubble.user {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff; border-bottom-right-radius: 5px;
}
.tai-bubble-aiwork {
  background: linear-gradient(135deg, #ecfdf5, #d1fae5) !important;
  border-color: rgba(16,185,129,0.2) !important;
  color: #064e3b !important;
}

/* Typing dots */
.tai-typing { display: flex; align-items: center; gap: 5px; padding: 12px 16px; min-width: 56px; }
.tai-typing span {
  width: 7px; height: 7px; background: #8b5cf6; border-radius: 50%;
  animation: taiBounce 1.2s infinite;
}
.tai-typing span:nth-child(2){animation-delay:0.2s}
.tai-typing span:nth-child(3){animation-delay:0.4s}
@keyframes taiBounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-7px)}}

/* Quick actions */
.tai-quick-actions { padding: 6px 14px; display: flex; gap: 7px; flex-wrap: wrap; flex-shrink: 0; }
.tai-qa-btn {
  background: linear-gradient(135deg,#ede9fe,#f0f0ff);
  border: 1px solid rgba(99,102,241,0.22); color: #6366f1;
  padding: 6px 11px; border-radius: 20px;
  font-size: 11.5px; font-weight: 600; cursor: pointer;
  transition: all 0.18s; font-family: 'Plus Jakarta Sans', sans-serif; white-space: nowrap;
}
.tai-qa-btn:hover { background: linear-gradient(135deg,#6366f1,#8b5cf6); color: #fff; border-color: transparent; transform: translateY(-1px); }

/* Input */
.tai-input-row {
  display: flex; gap: 8px; padding: 10px 14px 8px;
  background: rgba(248,248,255,0.8);
  border-top: 1px solid rgba(99,102,241,0.1); flex-shrink: 0;
}
.tai-input {
  flex: 1; padding: 10px 14px;
  border: 1.5px solid rgba(99,102,241,0.22); border-radius: 12px;
  background: #fff; font-size: 13.5px;
  font-family: 'Plus Jakarta Sans', sans-serif; color: #1e1b4b; outline: none;
  transition: border-color 0.18s, box-shadow 0.18s;
}
.tai-input:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.12); }
.tai-input::placeholder { color: #a8a8c5; }
.tai-input:disabled { opacity: 0.6; cursor: not-allowed; }
.tai-send {
  width: 42px; height: 42px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border: none; border-radius: 12px; color: #fff; cursor: pointer;
  display: flex; align-items: center; justify-content: center; transition: all 0.18s; flex-shrink: 0;
}
.tai-send:hover:not(:disabled) { transform: scale(1.08); box-shadow: 0 4px 14px rgba(99,102,241,0.4); }
.tai-send:disabled { opacity: 0.45; cursor: not-allowed; }
.tai-spin {
  width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff; border-radius: 50%; animation: taiSpin 0.7s linear infinite;
}
@keyframes taiSpin{to{transform:rotate(360deg)}}

/* Footer */
.tai-footer { text-align: center; font-size: 10px; color: #a8a8c5; padding: 4px 14px 8px; flex-shrink: 0; }
.tai-footer strong { color: #6366f1; }

/* Toast */
.tai-toast-stack {
  position: fixed; bottom: 90px; right: 16px; z-index: 9997;
  display: flex; flex-direction: column; gap: 8px; align-items: flex-end;
  width: 300px; max-width: calc(100vw - 24px);
}
.tai-toast {
  width: 100%; background: rgba(255,255,255,0.98);
  backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(99,102,241,0.15); border-radius: 16px;
  border-bottom-right-radius: 5px; padding: 12px;
  box-shadow: 0 6px 20px rgba(99,102,241,0.15), 0 2px 6px rgba(0,0,0,0.07);
  font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px; color: #1e1b4b;
  line-height: 1.5; animation: taiToastIn 0.3s cubic-bezier(.34,1.4,.64,1) both;
  box-sizing: border-box; word-break: break-word;
}
.tai-toast-loading-joke { border-color: rgba(245,158,11,0.3); background: rgba(255,253,235,0.98); }
.tai-toast-ai-fallback { border-color: rgba(16,185,129,0.3); background: rgba(236,253,245,0.98); }
@keyframes taiToastIn{from{opacity:0;transform:translateY(12px) scale(0.96)}to{opacity:1;transform:translateY(0) scale(1)}}
.tai-toast-row { display: flex; align-items: flex-start; gap: 9px; }
.tai-toast-avatar {
  font-size: 17px; width: 28px; height: 28px; min-width: 28px;
  background: linear-gradient(135deg,#6366f1,#8b5cf6); border-radius: 9px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.tai-toast-text { flex: 1; padding-top: 2px; }
.tai-toast-x { background: none; border: none; color: #a8a8c5; font-size: 11px; cursor: pointer; padding: 0 0 0 4px; flex-shrink: 0; transition: color 0.15s; }
.tai-toast-x:hover { color: #6366f1; }
.tai-tool-cards { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
.tai-tool-card {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 5px 10px; background: linear-gradient(135deg, #f5f3ff, #ede9fe);
  border: 1px solid rgba(99,102,241,0.2); border-radius: 20px;
  text-decoration: none; color: #3730a3; font-size: 12px; font-weight: 600;
  font-family: 'Plus Jakarta Sans', sans-serif; transition: all 0.18s; white-space: nowrap;
}
.tai-tool-card:hover { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; border-color: transparent; transform: translateY(-1px); }
.tai-tool-card-name { max-width: 90px; overflow: hidden; text-overflow: ellipsis; }
.tai-scroll-btn {
  display: block; width: 100%; margin-top: 10px; padding: 9px 14px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff;
  border: none; border-radius: 10px; font-size: 13px; font-weight: 700;
  cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; transition: all 0.18s; text-align: center;
}
.tai-scroll-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 14px rgba(99,102,241,0.4); }
.tai-open-btn {
  background: linear-gradient(135deg,#6366f1,#8b5cf6); color: #fff; border: none;
  border-radius: 20px; padding: 7px 16px; font-size: 12px; font-weight: 600;
  cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif;
  box-shadow: 0 3px 10px rgba(99,102,241,0.35); transition: all 0.18s; align-self: flex-end;
}
.tai-open-btn:hover { transform: translateY(-1px); box-shadow: 0 5px 14px rgba(99,102,241,0.45); }

/* Exit popup */
.tai-exit-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.45);
  z-index: 99999; display: flex; align-items: center; justify-content: center;
  animation: taiFadeIn 0.2s ease both; padding: 16px;
}
.tai-exit-popup {
  background: rgba(255,255,255,0.97); backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px); border-radius: 24px; padding: 32px 28px 28px;
  max-width: 380px; width: 100%; text-align: center; position: relative;
  box-shadow: 0 32px 80px rgba(99,102,241,0.25), 0 8px 24px rgba(0,0,0,0.1);
  border: 1px solid rgba(99,102,241,0.15);
  animation: taiSlideUp 0.35s cubic-bezier(.34,1.4,.64,1) both;
  font-family: 'Plus Jakarta Sans', sans-serif;
}
.tai-exit-x {
  position: absolute; top: 14px; right: 14px;
  background: #f0f0ff; border: none; width: 30px; height: 30px;
  border-radius: 8px; cursor: pointer; font-size: 13px; color: #6366f1;
  display: flex; align-items: center; justify-content: center; transition: background 0.15s;
}
.tai-exit-x:hover { background: #ede9fe; }
.tai-exit-content { font-size: 16px; color: #1e1b4b; line-height: 1.7; margin: 8px 0 24px; font-weight: 500; }
.tai-exit-actions { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
.tai-exit-primary {
  padding: 11px 22px; border-radius: 12px; font-size: 13.5px; font-weight: 600;
  cursor: pointer; border: none; transition: all 0.18s;
  background: linear-gradient(135deg,#6366f1,#8b5cf6); color: #fff;
  box-shadow: 0 4px 14px rgba(99,102,241,0.35); font-family: 'Plus Jakarta Sans', sans-serif;
}
.tai-exit-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(99,102,241,0.45); }
.tai-exit-secondary {
  padding: 11px 22px; border-radius: 12px; font-size: 13.5px; font-weight: 600;
  cursor: pointer; border: none; background: #f0f0ff; color: #6366f1; transition: all 0.18s;
  font-family: 'Plus Jakarta Sans', sans-serif;
}
.tai-exit-secondary:hover { background: #ede9fe; }

/* Mobile */
@media(max-width:480px){
  .tai-window{width:calc(100vw - 16px);right:8px;bottom:80px;max-height:70vh;border-radius:18px}
  .tai-fab{bottom:16px;right:16px;padding:12px 16px;font-size:13px}
  .tai-fab--collapsed{padding:12px;width:44px;height:44px}
  .tai-bubble{font-size:13px}
  .tai-toast-stack{right:8px;bottom:80px;width:calc(100vw - 80px);max-width:280px}
  .tai-toast{font-size:12.5px}
  .tai-exit-popup{padding:28px 20px 24px;border-radius:20px}
}
`;

