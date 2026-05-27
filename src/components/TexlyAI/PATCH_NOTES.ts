/**
 * PATCH NOTES — TexlyAI Assistant
 * ================================
 * v7.0 — Gemini + Groq Powered, Full Bilingual
 * ---------------------------------------------
 * ADDED:
 * - Gemini Flash (gemini-2.0-flash) as primary AI — free tier
 * - Groq llama-3.3-70b as fallback AI — free models
 * - Auto bilingual: detects Hindi vs English per message, responds in same language
 * - Full personality system (texlyPersonality.ts):
 *   • Welcome toasts on first visit (Hindi/English)
 *   • Tool intro on tool pages
 *   • Loading jokes cycling every 8s when tool is processing
 *   • Exit intent popup (funny + innocent, bilingual)
 *   • Share/comment/rating nudges (funny)
 *   • Mid-session engagement messages
 *   • Tool suggestions with cards
 * - Multi-turn chat history (Gemini remembers conversation)
 * - AI text work: when user asks AI to write/summarize/translate etc. directly in chat
 * - window.texlyStartLoading() / texlyStopLoading() — for tool pages to trigger loading jokes
 * - window.texlySuccess() / texlyError() — for tool pages to trigger celebrations/errors
 * - window.texlyAIDoWork(task, text) — for tools to use AI as fallback
 * - Lang saved to localStorage (LANG_KEY) — persists across sessions
 *
 * FIXED:
 * - Removed broken Hugging Face Gradio dependency
 * - Removed old HF_SPACE calls
 * - Footer now correctly shows "Powered by Gemini + Groq"
 *
 * REQUIRED ENV:
 * - VITE_GEMINI_API_KEY=... (https://aistudio.google.com/app/apikey)
 * - VITE_GROQ_API_KEY=...   (https://console.groq.com — already existed)
 */
export const PATCH_VERSION = '7.0';
