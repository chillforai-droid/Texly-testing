/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  FileCode, Copy, Check, Terminal, FolderOpen, GitPullRequest, 
  HelpCircle, ChevronRight, BookOpen, Layers, Settings, Globe 
} from "lucide-react";

export default function ExporterTab() {
  const [activeFile, setActiveFile] = useState<"next_page" | "sitemap" | "cron_worker" | "pages_json">("next_page");
  const [copied, setCopied] = useState(false);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // Next.js dynamic routing component code
  const nextPageRouteCode = `/**
 * Next.js Dynamic Route File: /app/[slug]/page.jsx
 * Instantly parses pages.json dynamically with Vercel Static Prop Generation
 */

import fs from "fs";
import path from "path";
import { notFound } from "next/navigation";
import Script from "next/script";

// Load local database node safely
function getPageBySlug(slug) {
  try {
    const dataPath = path.join(process.cwd(), "data", "pages.json");
    if (!fs.existsSync(dataPath)) return null;
    const pages = JSON.parse(fs.readFileSync(dataPath, "utf8"));
    return pages.find((p) => p.slug === slug) || null;
  } catch (err) {
    return null;
  }
}

// 1. Generate Static HTML Routes during Vercel Build (generateStaticParams)
export async function generateStaticParams() {
  try {
    const dataPath = path.join(process.cwd(), "data", "pages.json");
    if (!fs.existsSync(dataPath)) return [];
    const pages = JSON.parse(fs.readFileSync(dataPath, "utf8"));
    return pages.map((p) => ({ slug: p.slug }));
  } catch (err) {
    return [];
  }
}

// 2. Dynamic Metadata Injection matching Google standards
export async function generateMetadata({ params }) {
  const { slug } = params;
  const page = getPageBySlug(slug);
  if (!page) return {};

  return {
    title: page.title,
    description: page.metaDescription,
    alternates: {
      canonical: \`https://www.texlyonline.in/\${slug}\`,
    },
    openGraph: {
      title: page.title,
      description: page.metaDescription,
      url: \`https://www.texlyonline.in/\${slug}\`,
      type: "website",
    },
  };
}

// 3. Render HTML Dynamic Landing Page
export default function DynamicSEOPage({ params }) {
  const { slug } = params;
  const page = getPageBySlug(slug);

  if (!page) {
    notFound();
  }

  return (
    <article className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* 1. Rich LD Schema Injection */}
      <Script
        id="schema-markup-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(page.schemaMarkup || page.schema || {}) }}
      />

      <main className="max-w-4xl mx-auto px-4 py-16 space-y-12">
        {/* Banner Headers */}
        <section className="space-y-4 text-center">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full">
            {page.category || "SEO Utility"}
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-2">
            {page.title.split(" - ")[0]}
          </h1>
          <p className="text-slate-400 text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
            {page.intro}
          </p>
        </section>

        {/* Real Live Text Cleaner Integration Panel */}
        <section className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
          <h2 className="text-lg font-bold text-white">Browser-Native Text Sanitizer</h2>
          <textarea
            className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl text-sm font-mono focus:border-emerald-500/50 outline-none text-slate-200"
            rows={6}
            placeholder="Paste your raw character segments here to clean..."
          />
          <div className="flex justify-between items-center bg-slate-955 p-3 rounded-lg border border-slate-800/60">
            <span className="text-xs text-slate-400">⚡ Client processing: Zero data server leaks</span>
            <button className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition uppercase tracking-wide">
              Perform Cleanse
            </button>
          </div>
        </section>

        {/* Practical Use Cases Grid */}
        <section className="space-y-4">
          <h3 className="text-lg font-bold text-white">Key Use Cases & Workflows</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {page.useCases?.map((u, i) => (
              <div key={i} className="bg-slate-900/40 border border-slate-850 p-4 rounded-xl">
                <h4 className="font-semibold text-sm text-white">{u.title}</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{u.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Interactive FAQ Accordeon */}
        <section className="space-y-4">
          <h3 className="text-lg font-bold text-white">Frequently Asked Questions</h3>
          <div className="space-y-3">
            {page.faqList?.map((faq, i) => (
              <details key={i} className="bg-slate-900/40 border border-slate-850 p-4 rounded-xl group cursor-pointer transition">
                <summary className="font-semibold text-sm text-slate-200 list-none flex justify-between items-center">
                  <span>{faq.question}</span>
                  <span className="text-xs text-slate-500 group-open:rotate-180 transition">▼</span>
                </summary>
                <p className="text-xs text-slate-400 leading-relaxed mt-2.5 pl-2 border-l border-slate-800">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* Internal Linking matrix widget */}
        <footer className="pt-8 border-t border-slate-900 text-xs text-slate-500 text-center space-y-3">
          <p>Looking for similar text cleansers? Check out these companion utilities:</p>
          <div className="flex gap-2 justify-center flex-wrap">
            {page.relatedTools?.map((rel) => (
              <a key={rel} href={\`/\${rel}\`} className="bg-slate-900 hover:text-white px-3 py-1.5 rounded-lg border border-slate-850 font-mono">
                /{rel}
              </a>
            ))}
          </div>
        </footer>
      </main>
    </article>
  );
}`;

  // Next.js dynamic sitemap generator file content
  const sitemapCode = `/**
 * Next.js Dynamic Sitemap: /app/sitemap.js
 * Automatically aggregates JSON files into sitemap.xml routes for spiders
 */

import fs from "fs";
import path from "path";

export default async function sitemap() {
  const domainUrl = "https://www.texlyonline.in";
  
  // Base core indexes
  const routes = [
    {
      url: domainUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
  ];

  try {
    const dataPath = path.join(process.cwd(), "data", "pages.json");
    if (fs.existsSync(dataPath)) {
      const pages = JSON.parse(fs.readFileSync(dataPath, "utf8"));
      pages.forEach((page) => {
        routes.push({
          url: \`\${domainUrl}/\${page.slug}\`,
          lastModified: new Date(page.updatedAt || new Date()),
          changeFrequency: "daily",
          priority: 0.8,
        });
      });
    }
  } catch (err) {
    console.error("Failed to parse dynamic sitemap routes:", err);
  }

  return routes;
}`;

  // Node standalone cron automated scheduler file content
  const cronWorkerCode = `/**
 * Autonomous Cron Scheduler: cron-worker.js
 * Runs on Render.com or VPS to research, compile, and push updates securely
 */

const axios = require("axios");
const cron = require("node-cron");
require("dotenv").config();

// AI Target SEO Panel trigger route configured in env
const BACKEND_API = process.env.SEO_PANEL_URL || "https://ais-pre-x75p5cqrhsb5peyubkwuhx-407213539158.asia-southeast1.run.app";

console.log("--------------------------------------------------");
console.log("Autonomous Programmatic SEO Cron Worker active.");
console.log(\`Target backend: \${BACKEND_API}\`);
console.log("Scheduled: Every 8 Hours (0 */8 * * *)");
console.log("--------------------------------------------------");

async function runSeoAutopilot() {
  console.log(\`[\${new Date().toISOString()}] Initiating Staggered 8-Hour Autonomous Loop...\`);
  try {
    const response = await axios.post(\`\${BACKEND_API}/api/automation/run\`);
    if (response.data.success) {
      console.log(\`Success. Staggered exactly \${response.data.processedCount} brand new SEO landing node!\`);
      response.data.logs.forEach(l => {
        console.log(\`  - [\${l.step}] \${l.message}\`);
      });
    } else {
      console.warn("Automation process returned dormant status.");
    }
  } catch (err) {
    console.error("Failed to run Autopilot Cron Job loop:", err.message);
  }
}

// 1. Run Autonomous crawl every 8 hours
cron.schedule("0 */8 * * *", () => {
  runSeoAutopilot();
});

// Run immediate check on initialization
setTimeout(() => {
  console.log("Ensuring connectivity. Running initial diagnostic trigger...");
  runSeoAutopilot();
}, 2000);`;

  // Sample pages.json data structure template
  const pagesJsonTemplate = `[
  {
    "slug": "remove-symbols-online",
    "keyword": "remove symbols online",
    "title": "Remove Symbols and Special Characters Online - Text Cleaner | Texly",
    "metaDescription": "Easily clean your text by removing stars, brackets, currency signs, and symbols online.",
    "intro": "Welcome to the ultimate online text cleaner.",
    "faqList": [
      {
        "question": "Is my text safe?",
        "answer": "Yes, all parsing runs purely client-side inside your browser."
      }
    ],
    "useCases": [],
    "examples": [],
    "relatedTools": ["remove-emojis-from-text"],
    "schemaMarkup": {},
    "category": "Text Cleaners",
    "canonicalUrl": "https://www.texlyonline.in/remove-symbols-online",
    "createdAt": "2026-05-18T12:00:00Z",
    "updatedAt": "2026-05-18T12:00:00Z"
  }
]`;

  const getCode = () => {
    switch (activeFile) {
      case "next_page": return nextPageRouteCode;
      case "sitemap": return sitemapCode;
      case "cron_worker": return cronWorkerCode;
      case "pages_json": return pagesJsonTemplate;
    }
  };

  const currentCode = getCode();

  return (
    <div className="space-y-6" id="exporter_tab">
      {/* Introduction Banner code */}
      <div className="bg-gradient-to-r from-zinc-950 to-zinc-900 border border-zinc-805 rounded-xl p-5 flex items-center gap-4">
        <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400 shrink-0">
          <Layers size={22} />
        </div>
        <div>
          <h2 className="text-sm font-bold text-white tracking-tight">Vercel & Next.js Dynamic Integration Codebase</h2>
          <p className="text-zinc-550 text-xs">
            Copy these functional static generation structures directly into your Next.js directory to build immediate, blazingly fast pages mapped directly from Pages.json.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Hand File Navigation list */}
        <div className="lg:col-span-3 bg-zinc-900/40 border border-zinc-800 rounded-xl p-4 space-y-4" id="exporter_file_list">
          <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Integrative Files Directory</h3>

          <div className="space-y-1">
            <button
              onClick={() => setActiveFile("next_page")}
              className={`w-full flex items-center justify-between p-2.5 rounded-lg text-xs font-mono transition text-left cursor-pointer ${
                activeFile === "next_page" 
                  ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-semibold" 
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/40"
              }`}
            >
              <span className="flex items-center gap-1.5 truncate">
                <FileCode size={13} />
                app/[slug]/page.jsx
              </span>
              <ChevronRight size={12} className="opacity-40" />
            </button>

            <button
              onClick={() => setActiveFile("sitemap")}
              className={`w-full flex items-center justify-between p-2.5 rounded-lg text-xs font-mono transition text-left cursor-pointer ${
                activeFile === "sitemap" 
                  ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-semibold" 
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/40"
              }`}
            >
              <span className="flex items-center gap-1.5 truncate">
                <FileCode size={13} />
                app/sitemap.js
              </span>
              <ChevronRight size={12} className="opacity-40" />
            </button>

            <button
              onClick={() => setActiveFile("cron_worker")}
              className={`w-full flex items-center justify-between p-2.5 rounded-lg text-xs font-mono transition text-left cursor-pointer ${
                activeFile === "cron_worker" 
                  ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-semibold" 
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/40"
              }`}
            >
              <span className="flex items-center gap-1.5 truncate">
                <Terminal size={13} />
                cron-worker.js
              </span>
              <ChevronRight size={12} className="opacity-40" />
            </button>

            <button
              onClick={() => setActiveFile("pages_json")}
              className={`w-full flex items-center justify-between p-2.5 rounded-lg text-xs font-mono transition text-left cursor-pointer ${
                activeFile === "pages_json" 
                  ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-semibold" 
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/40"
              }`}
            >
              <span className="flex items-center gap-1.5 truncate">
                <Layers size={13} />
                data/pages.json
              </span>
              <ChevronRight size={12} className="opacity-40" />
            </button>
          </div>

          {/* Quick instructions panel */}
          <div className="bg-zinc-950/40 border border-zinc-800 p-4 rounded-lg space-y-3 pt-4">
            <h4 className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              <Globe size={13} className="text-cyan-400" />
              Dynamic Scaling Plan
            </h4>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              When the AI SEO Panel generates new files, it pushes changes to GitHub. Vercel automatically watches your repository on the <code className="bg-zinc-900 px-1 py-0.5 rounded text-zinc-300 font-mono">main</code> branch, triggers a static rebuild, and serves new static SEO tools safely in seconds!
            </p>
          </div>
        </div>

        {/* Code Output panel on Right Hand side */}
        <div className="lg:col-span-9 bg-zinc-950 border border-zinc-805/85 rounded-xl overflow-hidden flex flex-col h-[525px]" id="exporter_code_panel">
          {/* Header Code toolbar */}
          <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-3 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/80"></span>
              <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
              <span className="text-xs font-mono text-zinc-550 ml-2 select-none">
                {activeFile === "next_page" ? "app/[slug]/page.jsx" : activeFile === "sitemap" ? "app/sitemap.js" : activeFile === "cron_worker" ? "cron-worker.js" : "data/pages.json"}
              </span>
            </div>
            
            <button 
              onClick={() => copyCode(currentCode)}
              className="flex items-center gap-1.5 py-1.5 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-mono text-xs rounded border border-zinc-700 transition cursor-pointer"
            >
              {copied ? (
                <>
                  <Check size={12} className="text-emerald-400" />
                  Copied Output!
                </>
              ) : (
                <>
                  <Copy size={12} />
                  Copy File Content
                </>
              )}
            </button>
          </div>

          {/* Substantial Code display boxes */}
          <div className="flex-1 overflow-auto p-4 select-text selection:bg-cyan-500/30 font-mono text-xs text-zinc-300 leading-relaxed scrollbar-thin scrollbar-thumb-zinc-800 bg-zinc-950">
            <pre className="whitespace-pre">{currentCode}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
