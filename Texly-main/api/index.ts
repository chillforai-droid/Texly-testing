console.log("API: Script starting...");
import express from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import helmet from "helmet";
import compression from "compression";
import autoIndexHandler from "./auto-index.js";
import aiRouter from "./ai.js";
import sitemapHandler from "./sitemap.js";

console.log("API: Initializing...");

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";

let supabase: any = null;

async function getSupabase() {
  if (supabase) return supabase;
  if (supabaseUrl && supabaseAnonKey) {
    try {
      const { createClient } = await import("@supabase/supabase-js");
      supabase = createClient(supabaseUrl, supabaseAnonKey);
      return supabase;
    } catch (e) {
      console.error("API: Failed to initialize Supabase client:", e);
    }
  }
  return null;
}

const app = express();

// Security Headers (Helmet)
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

// Gzip Compression
app.use(compression());

app.use(express.json());

// Helper for email validation
const isValidEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Health check route
app.get("/api/health", async (req, res) => {
  try {
    const client = await getSupabase();
    res.json({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV,
      supabase: !!client
    });
  } catch (error: any) {
    console.error("Health check failed:", error);
    res.status(500).json({ error: "Health check failed", message: error.message });
  }
});

// API Route for Contact Form
app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message || !isValidEmail(email)) {
      return res.status(400).json({ error: "Missing or invalid required fields" });
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log("Contact form from", email, "received (Email credentials not set)");
      return res.json({ success: true, message: "Form received (Email credentials not set)" });
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      // Fix for Railway: IPv4 and timeouts
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
      family: 4
    } as any);

    const mailOptions = {
      from: `"Texly Contact" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      replyTo: email,
      subject: `Contact Form: ${subject || "General Inquiry"}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 600px; margin: auto;">
          <h2 style="color: #2563eb;">New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject || "N/A"}</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p><strong>Message:</strong></p>
          <p style="white-space: pre-wrap;">${message}</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: "Message sent successfully" });
  } catch (error: any) {
    console.error("Error in /api/contact:", error);
    res.status(500).json({ error: "Failed to send message", details: error.message });
  }
});

// ─── In-memory stores (Supabase-backed when available) ────────────────────────
let linksMapStore: Record<string, string> = {};
let configStore: Record<string, any> = {};

async function getLinksMap(client: any): Promise<Record<string, string>> {
  if (client) {
    try {
      const { data } = await client.from("automation_links_map").select("slug, url");
      if (data && data.length > 0) return Object.fromEntries(data.map((r: any) => [r.slug, r.url]));
    } catch {}
  }
  return linksMapStore;
}

async function saveLinksMap(client: any, map: Record<string, string>) {
  linksMapStore = map;
  if (client) {
    try {
      await client.from("automation_links_map").upsert(Object.entries(map).map(([slug, url]) => ({ slug, url })), { onConflict: "slug" });
    } catch {}
  }
}

// GET /api/pages
app.get("/api/pages", async (req: express.Request, res: express.Response) => {
  const client = await getSupabase();
  if (!client) return res.json({ success: true, pages: [] });
  try {
    const { data, error } = await client.from("seo_pages").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    res.json({ success: true, pages: data || [] });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

// DELETE /api/pages/:slug
app.delete("/api/pages/:slug", async (req: express.Request, res: express.Response) => {
  const { slug } = req.params;
  const client = await getSupabase();
  if (!client) return res.json({ success: true });
  try {
    await client.from("seo_pages").delete().eq("slug", slug);
    res.json({ success: true, message: "Page deleted." });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

// POST /api/pages/update-details
app.post("/api/pages/update-details", async (req: express.Request, res: express.Response) => {
  const { originalSlug, slug, keyword, title, category, intro, relatedTools } = req.body;
  const client = await getSupabase();
  if (!client) return res.status(503).json({ success: false, message: "Supabase not configured." });
  try {
    const { error } = await client.from("seo_pages").update({ slug, keyword, title, category, intro, relatedTools }).eq("slug", originalSlug);
    if (error) throw error;
    res.json({ success: true, message: "Page details updated." });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

// POST /api/pages/rewrite-intro
app.post("/api/pages/rewrite-intro", async (req: express.Request, res: express.Response) => {
  const { keyword, currentIntro, category } = req.body;
  try {
    const groqKey = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;
    if (!groqKey) return res.json({ success: true, intro: `${keyword} एक powerful ${category} tool है। यह आपके काम को आसान और तेज बनाता है।` });
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${groqKey}` },
      body: JSON.stringify({ model: "llama3-70b-8192", messages: [{ role: "user", content: `Write a 2-3 sentence Hinglish SEO intro for tool "${keyword}" in category "${category}". Current: "${currentIntro}". Return ONLY the paragraph.` }], max_tokens: 200 })
    });
    const d: any = await groqRes.json();
    res.json({ success: true, intro: d?.choices?.[0]?.message?.content?.trim() || currentIntro });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

// POST /api/pages/update-links
app.post("/api/pages/update-links", async (req: express.Request, res: express.Response) => {
  const { slug, relatedTools } = req.body;
  const client = await getSupabase();
  if (!client) return res.status(503).json({ success: false, message: "Supabase not configured." });
  try {
    await client.from("seo_pages").update({ relatedTools }).eq("slug", slug);
    res.json({ success: true, message: "Links updated." });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

// GET /api/sitemap/slugs
app.get("/api/sitemap/slugs", async (req: express.Request, res: express.Response) => {
  const client = await getSupabase();
  try {
    const map = await getLinksMap(client);
    res.json({ success: true, slugs: Object.keys(map), slugToUrlMap: map, sourceUrl: process.env.BASE_URL || "" });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

// POST /api/sitemap/save-link
app.post("/api/sitemap/save-link", async (req: express.Request, res: express.Response) => {
  const { slug, url } = req.body;
  if (!slug || !url) return res.status(400).json({ success: false, message: "slug और url जरूरी हैं।" });
  const client = await getSupabase();
  try {
    const map = await getLinksMap(client);
    map[slug] = url;
    await saveLinksMap(client, map);
    res.json({ success: true, message: "Link saved.", slugToUrlMap: map });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

// POST /api/sitemap/delete-link
app.post("/api/sitemap/delete-link", async (req: express.Request, res: express.Response) => {
  const { slug } = req.body;
  const client = await getSupabase();
  try {
    const map = await getLinksMap(client);
    delete map[slug];
    await saveLinksMap(client, map);
    res.json({ success: true, message: "Link deleted.", slugToUrlMap: map });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

// GET /api/links/audit
app.get("/api/links/audit", async (req: express.Request, res: express.Response) => {
  const client = await getSupabase();
  try {
    let pages: any[] = [];
    if (client) { const { data } = await client.from("seo_pages").select("slug, relatedTools"); pages = data || []; }
    const allSlugs = new Set(pages.map((p: any) => p.slug));
    let workingCount = 0, brokenCount = 0;
    const brokenLinks: { sourceSlug: string; targetSlug: string }[] = [];
    pages.forEach((page: any) => {
      (page.relatedTools || []).forEach((t: string) => {
        if (allSlugs.has(t)) workingCount++; else { brokenCount++; brokenLinks.push({ sourceSlug: page.slug, targetSlug: t }); }
      });
    });
    res.json({ success: true, scannedPagesCount: pages.length, workingCount, brokenCount, brokenLinks });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

// POST /api/links/repair
app.post("/api/links/repair", async (req: express.Request, res: express.Response) => {
  const client = await getSupabase();
  if (!client) return res.status(503).json({ success: false, message: "Supabase not configured." });
  try {
    const { data: pages } = await client.from("seo_pages").select("slug, relatedTools");
    if (!pages) return res.json({ success: true, message: "No pages found." });
    const allSlugs = new Set(pages.map((p: any) => p.slug));
    let repairedCount = 0;
    for (const page of pages) {
      const cleaned = (page.relatedTools || []).filter((t: string) => allSlugs.has(t));
      if (cleaned.length !== (page.relatedTools || []).length) {
        await client.from("seo_pages").update({ relatedTools: cleaned }).eq("slug", page.slug);
        repairedCount++;
      }
    }
    res.json({ success: true, message: `Self-heal complete! ${repairedCount} pages repaired.` });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

// GET /api/logs
app.get("/api/logs", async (req: express.Request, res: express.Response) => {
  const client = await getSupabase();
  if (!client) return res.json({ success: true, logs: [] });
  try {
    const { data } = await client.from("automation_logs").select("*").order("timestamp", { ascending: false }).limit(100);
    res.json({ success: true, logs: data || [] });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

// POST /api/logs/clear
app.post("/api/logs/clear", async (req: express.Request, res: express.Response) => {
  const client = await getSupabase();
  if (!client) return res.json({ success: true });
  try {
    await client.from("automation_logs").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    res.json({ success: true, message: "Logs cleared." });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

// GET /api/config
app.get("/api/config", async (req: express.Request, res: express.Response) => {
  const client = await getSupabase();
  if (client) {
    try {
      const { data } = await client.from("automation_config").select("*").eq("id", 1).maybeSingle();
      if (data) return res.json({ success: true, config: data });
    } catch {}
  }
  res.json({ success: true, config: configStore });
});

// POST /api/config/save
app.post("/api/config/save", async (req: express.Request, res: express.Response) => {
  const config = req.body;
  configStore = config;
  const client = await getSupabase();
  if (client) { try { await client.from("automation_config").upsert({ id: 1, ...config }); } catch {} }
  res.json({ success: true, message: "Config saved." });
});

// POST /api/gap-analyzer/scan
app.post("/api/gap-analyzer/scan", async (req: express.Request, res: express.Response) => {
  const client = await getSupabase();
  try {
    let existingTools: string[] = [];
    if (client) { const { data } = await client.from("seo_pages").select("slug"); existingTools = (data || []).map((p: any) => p.slug); }
    const groqKey = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;
    if (!groqKey) return res.json({ success: true, source: "Preset Engine", gaps: [
      { keyword: "word counter online", slug: "word-counter-online", category: "Text Tools", difficulty: "Low", volume: "High", rationale: "High demand text utility" },
      { keyword: "remove duplicate lines", slug: "remove-duplicate-lines", category: "Text Cleaners", difficulty: "Low", volume: "Medium", rationale: "Popular developer tool" },
      { keyword: "text to slug converter", slug: "text-to-slug-converter", category: "Converters", difficulty: "Low", volume: "Medium", rationale: "SEO and dev utility" }
    ]});
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${groqKey}` },
      body: JSON.stringify({ model: "llama3-70b-8192", max_tokens: 800, messages: [{ role: "user", content: `Existing tools: ${existingTools.slice(0,30).join(", ")}. Suggest 8 new text/SEO tools NOT in this list. Return ONLY JSON array: [{"keyword":"...","slug":"...","category":"Text Tools|Converters|Text Cleaners|Formatting","difficulty":"Low|Medium","volume":"High|Medium","rationale":"..."}]` }] })
    });
    const d: any = await groqRes.json();
    const gaps = JSON.parse((d?.choices?.[0]?.message?.content || "[]").replace(/```json|```/g, "").trim());
    res.json({ success: true, source: "Groq AI Scanner", gaps });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

// POST /api/generate-content
app.post("/api/generate-content", async (req: express.Request, res: express.Response) => {
  const { keyword, slug, category } = req.body;
  const groqKey = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;
  try {
    let title = `${keyword} - Free Online Tool`, intro = `${keyword} एक उपयोगी tool है।`, metaDescription = `Free ${keyword} tool online.`;
    if (groqKey) {
      const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${groqKey}` },
        body: JSON.stringify({ model: "llama3-70b-8192", max_tokens: 300, messages: [{ role: "user", content: `For SEO tool "${keyword}" (category: ${category}), return ONLY JSON: {"title":"...","intro":"2-3 sentence Hinglish intro...","metaDescription":"155 char SEO desc..."}` }] })
      });
      const d: any = await r.json();
      const p = JSON.parse((d?.choices?.[0]?.message?.content || "{}").replace(/```json|```/g, "").trim());
      if (p.title) title = p.title; if (p.intro) intro = p.intro; if (p.metaDescription) metaDescription = p.metaDescription;
    }
    const newPage = { slug, keyword, title, category, intro, metaDescription, relatedTools: [], created_at: new Date().toISOString() };
    const client = await getSupabase();
    if (client) await client.from("seo_pages").upsert(newPage, { onConflict: "slug" });
    res.json({ success: true, message: `Page /${slug} generated!`, page: newPage });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

// POST /api/automation/run
app.post("/api/automation/run", async (req: express.Request, res: express.Response) => {
  const client = await getSupabase();
  if (client) { try { await client.from("automation_logs").insert([{ step: "CRON", message: "Manual automation cycle triggered.", status: "success", timestamp: new Date().toISOString() }]); } catch {} }
  res.json({ success: true, message: "Automation cycle started." });
});

// POST /api/github/push
app.post("/api/github/push", async (req: express.Request, res: express.Response) => {
  const githubToken = process.env.SEO_GITHUB_TOKEN, githubRepo = process.env.SEO_GITHUB_REPO;
  if (!githubToken || !githubRepo) return res.status(503).json({ success: false, message: "SEO_GITHUB_TOKEN और SEO_GITHUB_REPO Vercel env में set करें।" });
  try {
    const client = await getSupabase();
    let pages: any[] = [];
    if (client) { const { data } = await client.from("seo_pages").select("*"); pages = data || []; }
    const content = Buffer.from(JSON.stringify(pages, null, 2)).toString("base64");
    const shaRes = await fetch(`https://api.github.com/repos/${githubRepo}/contents/data/pages.json`, { headers: { Authorization: `Bearer ${githubToken}`, Accept: "application/vnd.github+json" } });
    const shaData: any = await shaRes.json();
    const pushRes = await fetch(`https://api.github.com/repos/${githubRepo}/contents/data/pages.json`, {
      method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${githubToken}`, Accept: "application/vnd.github+json" },
      body: JSON.stringify({ message: "Auto: Update pages.json via Texly Automation", content, ...(shaData?.sha ? { sha: shaData.sha } : {}) })
    });
    if (pushRes.ok) res.json({ success: true, message: "GitHub पर push हो गया! Vercel deployment शुरू हो गई।" });
    else { const err: any = await pushRes.json(); res.status(400).json({ success: false, message: err.message || "GitHub push failed." }); }
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

// POST /api/android/generate-config
app.post("/api/android/generate-config", async (req: express.Request, res: express.Response) => {
  const { appId, appName, webUrl } = req.body;
  if (!appId || !appName || !webUrl) return res.status(400).json({ success: false, message: "appId, appName, webUrl required." });
  res.json({ success: true,
    capConfig: { appId, appName, webDir: "dist", server: { url: webUrl, cleartext: true }, android: { allowMixedContent: true } },
    androidManifestXml: `<?xml version="1.0" encoding="utf-8"?><manifest xmlns:android="http://schemas.android.com/apk/res/android" package="${appId}"><uses-permission android:name="android.permission.INTERNET"/><application android:label="${appName}" android:usesCleartextTraffic="true"><activity android:name=".MainActivity" android:exported="true"><intent-filter><action android:name="android.intent.action.MAIN"/><category android:name="android.intent.category.LAUNCHER"/></intent-filter></activity></application></manifest>`,
    mainActivityJava: `package ${appId};
import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
public class MainActivity extends BridgeActivity {
  @Override protected void onCreate(Bundle s){super.onCreate(s);}
}`
  });
});

// POST /api/database/sanitize
app.post("/api/database/sanitize", async (req: express.Request, res: express.Response) => {
  const client = await getSupabase();
  if (!client) return res.status(503).json({ success: false, message: "Supabase not configured." });
  try {
    await client.from("seo_pages").delete().or("slug.eq.,title.eq.");
    const { data: pages } = await client.from("seo_pages").select("id, slug").order("created_at", { ascending: false });
    if (pages) {
      const seen = new Set<string>(); const toDelete: string[] = [];
      for (const p of pages) { if (seen.has(p.slug)) toDelete.push(p.id); else seen.add(p.slug); }
      if (toDelete.length > 0) await client.from("seo_pages").delete().in("id", toDelete);
    }
    res.json({ success: true, message: "Database sanitize complete! Duplicate और empty entries हट गए।" });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
});

// GET /api/models/openrouter
app.get("/api/models/openrouter", async (req: express.Request, res: express.Response) => {
  try {
    const r = await fetch("https://openrouter.ai/api/v1/models");
    const d: any = await r.json();
    const models = (d?.data || []).slice(0, 50).map((m: any) => ({ id: m.id, name: m.name || m.id, isFree: m.id.includes(":free") || m.pricing?.prompt === "0" }));
    res.json({ success: true, models });
  } catch {
    res.json({ success: true, models: [{ id: "google/gemini-flash-1.5:free", name: "Gemini Flash 1.5 (Free)", isFree: true }, { id: "meta-llama/llama-3-70b-instruct:free", name: "Llama 3 70B (Free)", isFree: true }] });
  }
});

// GET /api/models/groq
app.get("/api/models/groq", async (req: express.Request, res: express.Response) => {
  const apiKey = (req.query.apiKey as string) || process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;
  const presets = [{ id: "llama3-70b-8192", name: "llama3-70b-8192 (Free)", isFree: true }, { id: "deepseek-r1-distill-llama-70b", name: "deepseek-r1 70B (Free)", isFree: true }, { id: "gemma2-9b-it", name: "gemma2-9b-it (Free)", isFree: true }, { id: "mixtral-8x7b-32768", name: "mixtral-8x7b (Free)", isFree: true }];
  if (!apiKey) return res.json({ success: true, models: presets });
  try {
    const r = await fetch("https://api.groq.com/openai/v1/models", { headers: { Authorization: `Bearer ${apiKey}` } });
    const d: any = await r.json();
    res.json({ success: true, models: (d?.data || []).map((m: any) => ({ id: m.id, name: m.id, isFree: true })) });
  } catch { res.json({ success: true, models: presets }); }
});


// ─── Auth Routes (Login / Register / Verify) ──────────────────────────────────
// Simple token: base64(username:password) — verified against Supabase users table
// or against env-var ADMIN_USERNAME / ADMIN_PASSWORD as fallback.

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

function makeToken(username: string, password: string): string {
  return Buffer.from(`${username}:${password}`).toString("base64");
}

// POST /api/register — store new user in Supabase texly_users table
app.post("/api/register", async (req: express.Request, res: express.Response) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ success: false, message: "Username और password जरूरी हैं।" });
    }
    if (username.length < 3) {
      return res.status(400).json({ success: false, message: "Username कम से कम 3 characters का होना चाहिए।" });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "Password कम से कम 6 characters का होना चाहिए।" });
    }

    const client = await getSupabase();
    if (!client) {
      // Fallback: if no Supabase, only allow single admin user
      if (username === ADMIN_USERNAME) {
        return res.status(409).json({ success: false, message: "यह username पहले से exist करता है।" });
      }
      // Without DB we can't persist, but we accept it gracefully
      return res.json({ success: true, message: "Registration सफल! अब login करें।" });
    }

    // Check if user already exists
    const { data: existing } = await client
      .from("texly_users")
      .select("username")
      .eq("username", username.trim())
      .maybeSingle();

    if (existing) {
      return res.status(409).json({ success: false, message: "यह username पहले से exist करता है। कोई और नाम चुनें।" });
    }

    // Insert new user (password stored as-is — for production use hashing)
    const { error: insertErr } = await client
      .from("texly_users")
      .insert([{ username: username.trim(), password: password.trim(), created_at: new Date().toISOString() }]);

    if (insertErr) {
      console.error("texly_users insert failed:", insertErr.message);
      return res.status(500).json({ success: false, message: `Registration failed: ${insertErr.message}. Supabase में texly_users table check करें।` });
    }

    res.json({ success: true, message: "Registration सफल! अब login करें।" });
  } catch (err: any) {
    console.error("/api/register error:", err);
    res.status(500).json({ success: false, message: "Server error। थोड़ी देर बाद try करें।" });
  }
});

// POST /api/login — verify credentials and return token
app.post("/api/login", async (req: express.Request, res: express.Response) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ success: false, message: "Username और password जरूरी हैं।" });
    }

    // 1. Check env-based admin credentials first
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      return res.json({ success: true, token: makeToken(username, password), message: "Login सफल!" });
    }

    // 2. Check Supabase texly_users table
    const client = await getSupabase();
    if (client) {
      const { data: user, error: loginErr } = await client
        .from("texly_users")
        .select("username, password")
        .eq("username", username.trim())
        .eq("password", password.trim())
        .maybeSingle();
      
      if (loginErr) console.error("Login DB error:", loginErr.message);

      if (user) {
        return res.json({ success: true, token: makeToken(username, password), message: "Login सफल!" });
      }
    }

    res.status(401).json({ success: false, message: "गलत username या password।" });
  } catch (err: any) {
    console.error("/api/login error:", err);
    res.status(500).json({ success: false, message: "Server error। थोड़ी देर बाद try करें।" });
  }
});

// GET /api/verify-auth — validate a token
app.get("/api/verify-auth", async (req: express.Request, res: express.Response) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.replace("Bearer ", "").trim();
    if (!token) return res.json({ valid: false });

    // Decode base64 token
    let decoded = "";
    try { decoded = Buffer.from(token, "base64").toString("utf8"); } catch { return res.json({ valid: false }); }

    const [username, ...rest] = decoded.split(":");
    const password = rest.join(":");
    if (!username || !password) return res.json({ valid: false });

    // Check admin env
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      return res.json({ valid: true, username });
    }

    // Check Supabase
    const client = await getSupabase();
    if (client) {
      const { data: user } = await client
        .from("texly_users")
        .select("username")
        .eq("username", username.trim())
        .eq("password", password.trim())
        .maybeSingle();

      if (user) return res.json({ valid: true, username });
    }

    res.json({ valid: false });
  } catch (err: any) {
    console.error("/api/verify-auth error:", err);
    res.json({ valid: false });
  }
});
// ──────────────────────────────────────────────────────────────────────────────

// Auto-Index Route (IndexNow)
app.get("/api/auto-index", autoIndexHandler);

// Sitemap Route (for local dev and redundancy)
app.get("/sitemap.xml", sitemapHandler);

// AI Tools Routes
app.use("/api/ai", aiRouter);


// Catch-all for undefined API routes
app.all("/api/*", (req, res) => {
  res.status(404).json({ error: "API route not found" });
});

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Global Error Handler:", err);
  res.status(500).json({ 
    error: "Internal Server Error", 
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Vercel Serverless Function handler
export default function handler(req: any, res: any) {
  return app(req, res);
}
