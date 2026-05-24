/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Settings, Save, Check, RefreshCw, AlertTriangle, ShieldCheck, 
  Github, Cloud, Cpu, Sparkles 
} from "lucide-react";

interface ConfigState {
  githubRepo: string;
  githubToken: string;
  vercelWebhookUrl: string;
  automatedFrequency: string;
  targetPagesPerDay: number;
  useGroq: boolean;
  groqApiKey: string;
  groqModel: string;
}

interface ConfigTabProps {
  initialConfig: ConfigState | null;
  onSaveConfig: (cfg: Partial<ConfigState>) => Promise<boolean>;
}

export default function ConfigTab({
  initialConfig,
  onSaveConfig
}: ConfigTabProps) {
  const [githubRepo, setGithubRepo] = useState("");
  const [githubToken, setGithubToken] = useState("");
  const [vercelWebhookUrl, setVercelWebhookUrl] = useState("");
  const [automatedFrequency, setAutomatedFrequency] = useState("24-hours");
  const [targetPagesPerDay, setTargetPagesPerDay] = useState(3);
  const [useGroq, setUseGroq] = useState(false);
  const [groqApiKey, setGroqApiKey] = useState("");
  const [groqModel, setGroqModel] = useState("llama3-70b-8192");

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (initialConfig) {
      setGithubRepo(initialConfig.githubRepo || "mahendragope/texlyonline.in");
      setGithubToken(initialConfig.githubToken || "");
      setVercelWebhookUrl(initialConfig.vercelWebhookUrl || "");
      setAutomatedFrequency(initialConfig.automatedFrequency || "24-hours");
      setTargetPagesPerDay(initialConfig.targetPagesPerDay || 3);
      setUseGroq(initialConfig.useGroq || false);
      setGroqApiKey(initialConfig.groqApiKey || "");
      setGroqModel(initialConfig.groqModel || "llama3-70b-8192");
    }
  }, [initialConfig]);

  // Normalize GitHub repo: accept full URL or owner/repo format
  const normalizeGithubRepo = (repo: string): string => {
    let r = repo.trim();
    if (r.includes("github.com/")) {
      r = r.split("github.com/")[1].replace(/\.git$/, "").replace(/\/$/, "");
    }
    return r;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const success = await onSaveConfig({
      githubRepo: normalizeGithubRepo(githubRepo),
      githubToken,
      vercelWebhookUrl,
      automatedFrequency,
      targetPagesPerDay,
      useGroq,
      groqApiKey,
      groqModel
    });
    setSaving(false);
    if (success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(null as any), 2000);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" id="config_tab">
      {/* Visual Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left hand panel inputs */}
        <div className="lg:col-span-8 bg-zinc-900/50 border border-zinc-805 rounded-xl p-6 space-y-5">
          <div>
            <h2 className="text-base font-semibold text-white tracking-tight flex items-center gap-1.5">
              <Settings size={16} className="text-cyan-400" />
              Automated Pipeline Configurator
            </h2>
            <p className="text-zinc-500 text-xs">Establish API parameters, GitHub repositories, and automated growth rates safely.</p>
          </div>

          <div className="space-y-4 pt-2">
            
            {/* Git repositories settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                  <Github size={12} /> Target GitHub Repository
                </label>
                <input 
                  type="text" 
                  value={githubRepo}
                  onChange={(e) => setGithubRepo(e.target.value)}
                  placeholder="e.g. mahendragope/texlyonline.in"
                  className="w-full bg-zinc-950 border border-zinc-800 text-sm px-3.5 py-2.5 rounded-lg outline-none text-zinc-300 focus:border-cyan-500/40"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                  GitHub Personal Access Token
                </label>
                <input 
                  type="password" 
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxxx"
                  className="w-full bg-zinc-950 border border-zinc-800 text-sm px-3.5 py-2.5 rounded-lg outline-none text-zinc-300 focus:border-cyan-500/40"
                />
              </div>
            </div>

            {/* Vercel deploy hook */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                <Cloud size={12} /> Vercel Deploy Webhook URL
              </label>
              <input 
                type="text" 
                value={vercelWebhookUrl}
                onChange={(e) => setVercelWebhookUrl(e.target.value)}
                placeholder="https://api.vercel.com/v1/integrations/deploy/..."
                className="w-full bg-zinc-950 border border-zinc-800 text-sm px-3.5 py-2.5 rounded-lg outline-none text-zinc-300 focus:border-cyan-500/40 font-mono"
              />
            </div>

            {/* Target pages and rate limits */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-zinc-850">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Automated Cycle Frequency</label>
                <select 
                  value={automatedFrequency}
                  onChange={(e) => setAutomatedFrequency(e.target.value)}
                  className="w-full bg-zinc-955 border border-zinc-800 text-sm px-3.5 py-2.5 rounded-lg text-zinc-400 outline-none hover:text-white cursor-pointer"
                >
                  <option value="24-hours">Every 24 Hours</option>
                  <option value="12-hours">Every 12 Hours</option>
                  <option value="8-hours">Every 8 Hours (1 page at a time)</option>
                  <option value="manual">Manual / Trigger On-Demand</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex justify-between">
                  <span>Target Pages Daily Max</span>
                  <span className="text-amber-400 font-bold font-mono text-[10px]">Safe-Zone Guard</span>
                </label>
                <input 
                  type="number" 
                  min={1} 
                  max={10}
                  value={targetPagesPerDay}
                  onChange={(e) => setTargetPagesPerDay(parseInt(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-800 text-sm px-3.5 py-2 rounded-lg outline-none text-zinc-300 focus:border-cyan-500/40 font-mono"
                />
              </div>
            </div>

            {/* Toggle Groq Support OR Gemini */}
            <div className="pt-4 border-t border-zinc-850 space-y-4">
              <div className="flex justify-between items-center bg-zinc-950 p-4 rounded-lg">
                <div className="space-y-1.5">
                  <h4 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                    <Cpu size={14} className="text-amber-400" />
                    Alternative Model Provider (Groq API Settings)
                  </h4>
                  <p className="text-[11px] text-zinc-550 leading-relaxed max-w-md">
                    Toggle this option if you explicitly want to override natural built-in Gemini models to parse metadata schemas using Groq's low-latency SDKs.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setUseGroq(!useGroq)}
                  className={`w-11 h-6 rounded-full transition flex items-center p-1 cursor-pointer ${useGroq ? "bg-emerald-500 justify-end" : "bg-zinc-800 justify-start"}`}
                >
                  <span className="w-4 h-4 rounded-full bg-white"></span>
                </button>
              </div>

              {/* Collapsible Groq Inputs */}
              {useGroq && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-zinc-955/60 p-4 rounded-lg border border-zinc-805 animate-fade-in">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Groq API Secret Key</label>
                    <input 
                      type="password" 
                      value={groqApiKey}
                      onChange={(e) => setGroqApiKey(e.target.value)}
                      placeholder="gsk_xxxxxxxxxxxxxxxxxxxxx"
                      className="w-full bg-zinc-950 border border-zinc-800 text-sm px-3.5 py-2 rounded-lg outline-none text-zinc-300 focus:border-cyan-500/40"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Preferred Groq Model</label>
                    <select 
                      value={groqModel}
                      onChange={(e) => setGroqModel(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 text-sm px-3.5 py-2 rounded-lg text-zinc-400 outline-none hover:text-white cursor-pointer"
                    >
                      <option value="llama3-70b-8192">llama3-70b-8192</option>
                      <option value="deepseek-r1-distill-llama-70b">deepseek-r1-distill-llama-70b</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Right hand instruction side information panels */}
        <div className="lg:col-span-4 bg-zinc-900/10 space-y-4" id="config_sidebar">
          
          {/* Safeguard block */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 space-y-3">
            <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck size={14} className="text-emerald-400" />
              SEO spam Protection
            </h3>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Why do we restrict creation speeds to <strong>3 landing pages every 24 hours</strong> by default?
            </p>
            <p className="text-[11px] text-zinc-550 leading-relaxed">
              Google algorithms evaluate indexed densities. Mass generating hundreds of shallow web pages in a day signals artificial generation ("doorway pages"), which can trigger a manual penalty. Slow, controlled index growth of premium, descriptive tools guarantees safe, organic ranking.
            </p>
          </div>

          {/* Core Submit action button */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
            <button 
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 py-3 bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs uppercase tracking-widest font-mono rounded-lg transition disabled:opacity-40 cursor-pointer"
            >
              {saving ? (
                <>
                  <RefreshCw size={13} className="animate-spin" />
                  Saving Parameters...
                </>
              ) : saveSuccess ? (
                <>
                  <Check size={13} />
                  Parameters Saved!
                </>
              ) : (
                <>
                  <Save size={13} />
                  Save Configurations
                </>
              )}
            </button>
          </div>

        </div>

      </div>
    </form>
  );
}
