/**
 * SEOPanelPage.tsx — Texly AI SEO Automation Panel
 * Full-screen panel (DevStudio जैसा pattern)
 * Route: /seo-panel
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  Compass, LayoutDashboard, Wand2, Wrench, Settings, Layers,
  Sparkles, Menu, X
} from "lucide-react";

import { SEOPage, AutomationLog, KeywordResult } from "./types";
import DashboardTab from "./DashboardTab";
import KeywordTab from "./KeywordTab";
import ContentTab from "./ContentTab";
import SandboxTab from "./SandboxTab";
import ExporterTab from "./ExporterTab";
import ConfigTab from "./ConfigTab";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ConfigState {
  githubRepo: string;
  githubToken: string;
  vercelWebhookUrl: string;
  automatedFrequency: string;
  targetPagesPerDay: number;
  useGroq: boolean;
  groqApiKey: string;
}

type TabId = "dashboard" | "keywords" | "content" | "sandbox" | "exporter" | "config";

interface Tab {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TABS: Tab[] = [
  { id: "dashboard",  label: "Dashboard",  icon: <LayoutDashboard className="w-4 h-4" /> },
  { id: "keywords",   label: "Keywords",   icon: <Compass className="w-4 h-4" /> },
  { id: "content",    label: "Content",    icon: <Wand2 className="w-4 h-4" /> },
  { id: "sandbox",    label: "Sandbox",    icon: <Layers className="w-4 h-4" /> },
  { id: "exporter",   label: "Exporter",   icon: <Wrench className="w-4 h-4" /> },
  { id: "config",     label: "Config",     icon: <Settings className="w-4 h-4" /> },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function SEOPanelPage() {
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");
  const [pages, setPages] = useState<SEOPage[]>([]);
  const [logs, setLogs] = useState<AutomationLog[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingMap, setIsGeneratingMap] = useState<Record<string, boolean>>({});
  const [config, setConfig] = useState<ConfigState | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ─── Data fetchers ─────────────────────────────────────────────────────────

  const refreshPages = useCallback(async () => {
    try {
      const res = await fetch("/api/seo/pages");
      if (res.ok) {
        const data = await res.json();
        setPages(data ?? []);
      }
    } catch {
      // silently ignore – panel works offline
    }
  }, []);

  const refreshLogs = useCallback(async () => {
    try {
      const res = await fetch("/api/seo/logs");
      if (res.ok) {
        const data = await res.json();
        setLogs(data ?? []);
      }
    } catch {
      // silently ignore
    }
  }, []);

  useEffect(() => {
    refreshPages();
    refreshLogs();
  }, [refreshPages, refreshLogs]);

  // ─── Actions ───────────────────────────────────────────────────────────────

  const handleRunCron = async () => {
    setIsProcessing(true);
    try {
      await fetch("/api/seo/run-cron", { method: "POST" });
      await refreshPages();
      await refreshLogs();
    } catch {
      // ignore
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeletePage = async (slug: string) => {
    try {
      await fetch(`/api/seo/pages/${slug}`, { method: "DELETE" });
      setPages((prev) => prev.filter((p) => p.slug !== slug));
    } catch {
      // ignore
    }
  };

  const handleClearLogs = () => setLogs([]);

  const handleGenerate = async (
    keyword: string,
    slug: string,
    category: string
  ): Promise<SEOPage | null> => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/seo/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword, slug, category }),
      });
      if (!res.ok) return null;
      const page: SEOPage = await res.json();
      setPages((prev) => [page, ...prev.filter((p) => p.slug !== page.slug)]);
      return page;
    } catch {
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeywordSearch = async (seed: string): Promise<KeywordResult[]> => {
    try {
      const res = await fetch(`/api/seo/keywords?seed=${encodeURIComponent(seed)}`);
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  };

  const handleGenerateFromKeyword = async (
    keyword: string,
    slug: string,
    category: string
  ) => {
    setIsGeneratingMap((prev) => ({ ...prev, [slug]: true }));
    try {
      await handleGenerate(keyword, slug, category);
    } finally {
      setIsGeneratingMap((prev) => ({ ...prev, [slug]: false }));
    }
  };

  const handleSaveConfig = async (cfg: Partial<ConfigState>): Promise<boolean> => {
    try {
      const res = await fetch("/api/seo/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cfg),
      });
      if (res.ok) {
        setConfig((prev) => ({ ...(prev ?? ({} as ConfigState)), ...cfg }));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  const renderTab = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <DashboardTab
            pages={pages}
            logs={logs}
            onRefreshPages={refreshPages}
            onRefreshLogs={refreshLogs}
            onRunCron={handleRunCron}
            onDeletePage={handleDeletePage}
            onClearLogs={handleClearLogs}
            isProcessing={isProcessing}
          />
        );
      case "keywords":
        return (
          <KeywordTab
            onSearch={handleKeywordSearch}
            onGenerateFromKeyword={handleGenerateFromKeyword}
            isGeneratingMap={isGeneratingMap}
          />
        );
      case "content":
        return (
          <ContentTab
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
          />
        );
      case "sandbox":
        return <SandboxTab />;
      case "exporter":
        return <ExporterTab />;
      case "config":
        return (
          <ConfigTab
            initialConfig={config}
            onSaveConfig={handleSaveConfig}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <Sparkles className="w-5 h-5 text-violet-400 shrink-0" />
          <h1 className="font-black text-base text-white tracking-tight">
            Texly SEO Panel
          </h1>
          <span className="ml-auto text-[10px] font-bold uppercase tracking-widest text-slate-500">
            AI Automation
          </span>
        </div>

        {/* Tab nav — desktop */}
        <nav className="hidden md:flex gap-1 px-4 pb-0 border-t border-slate-800/50">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-black uppercase tracking-widest transition-all border-b-2 -mb-px ${
                activeTab === tab.id
                  ? "border-violet-500 text-violet-400"
                  : "border-transparent text-slate-500 hover:text-slate-300 hover:border-slate-700"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-20 bg-slate-950/90 backdrop-blur-sm">
          <div className="absolute top-16 left-0 right-0 bg-slate-900 border-b border-slate-800 p-4">
            <nav className="flex flex-col gap-1">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setSidebarOpen(false); }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                    activeTab === tab.id
                      ? "bg-violet-600/20 text-violet-400 border border-violet-600/30"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">
        {renderTab()}
      </main>
    </div>
  );
}
