import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  ShieldCheck, Plus, RefreshCw, Globe, AlertTriangle,
  CheckCircle, Clock, Zap, Eye, Code, Settings,
  Trash2, ExternalLink, ChevronRight, X, Save,
  Activity, Lock, Wifi, ArrowLeft, Loader2
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────
// CONFIG — change this to your actual Render deployment URL
// ─────────────────────────────────────────────────────────────
const SITEGUARD_API =
  (import.meta as any).env?.VITE_SITEGUARD_API_URL ||
  'https://your-siteguard-app.onrender.com';

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
function getUserKeys() {
  return {
    monitorApiKey: localStorage.getItem('sg_monitor_api_key') || '',
    openRouterKey: localStorage.getItem('sg_openrouter_api_key') || '',
    selectedModel: localStorage.getItem('sg_openrouter_model') || 'anthropic/claude-3-haiku',
    githubToken: localStorage.getItem('sg_github_token') || '',
  };
}

async function apiFetch(path: string, options: RequestInit = {}) {
  const { monitorApiKey, openRouterKey, selectedModel } = getUserKeys();
  const res = await fetch(`${SITEGUARD_API}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(monitorApiKey ? { 'x-api-key': monitorApiKey } : {}),
      ...(openRouterKey ? { 'x-openrouter-key': openRouterKey } : {}),
      ...(selectedModel ? { 'x-openrouter-model': selectedModel } : {}),
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    throw new Error(err.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

// ─────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────
type StatusType = 'healthy' | 'issues_found' | 'pending' | 'error' | string;

function StatusBadge({ status }: { status: StatusType }) {
  const map: Record<string, { color: string; label: string; icon: React.ReactNode }> = {
    healthy: { color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', label: 'Healthy', icon: <CheckCircle className="w-3 h-3" /> },
    issues_found: { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', label: 'Issues Found', icon: <AlertTriangle className="w-3 h-3" /> },
    pending: { color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', label: 'Pending', icon: <Clock className="w-3 h-3" /> },
    error: { color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400', label: 'Error', icon: <AlertTriangle className="w-3 h-3" /> },
  };
  const s = map[status] || map.pending;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${s.color}`}>
      {s.icon} {s.label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// Settings Panel
// ─────────────────────────────────────────────────────────────
function SettingsPanel({ onSave }: { onSave: () => void }) {
  const [keys, setKeys] = useState(getUserKeys());
  const [saved, setSaved] = useState(false);

  function save() {
    localStorage.setItem('sg_monitor_api_key', keys.monitorApiKey);
    localStorage.setItem('sg_openrouter_api_key', keys.openRouterKey);
    localStorage.setItem('sg_openrouter_model', keys.selectedModel);
    localStorage.setItem('sg_github_token', keys.githubToken);
    setSaved(true);
    setTimeout(() => { setSaved(false); onSave(); }, 1000);
  }

  const inputClass = "w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm dark:text-white font-mono";

  return (
    <div className="max-w-xl mx-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
            <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">SiteGuard Settings</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Keys are stored only in your browser</p>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
              Monitor API Key <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              className={inputClass}
              placeholder="Set any secret key (e.g. my-secret-123)"
              value={keys.monitorApiKey}
              onChange={e => setKeys(k => ({ ...k, monitorApiKey: e.target.value }))}
            />
            <p className="text-xs text-slate-400 mt-1">Create any password — used to protect your monitor data</p>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
              OpenRouter API Key <span className="text-slate-400 font-normal">(for AI features)</span>
            </label>
            <input
              type="password"
              className={inputClass}
              placeholder="sk-or-v1-..."
              value={keys.openRouterKey}
              onChange={e => setKeys(k => ({ ...k, openRouterKey: e.target.value }))}
            />
            <p className="text-xs text-slate-400 mt-1">
              Get free key at{' '}
              <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">openrouter.ai</a>
            </p>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
              AI Model
            </label>
            <select
              className={inputClass}
              value={keys.selectedModel}
              onChange={e => setKeys(k => ({ ...k, selectedModel: e.target.value }))}
            >
              <option value="anthropic/claude-3-haiku">Claude 3 Haiku (fast, free tier)</option>
              <option value="anthropic/claude-3-sonnet">Claude 3 Sonnet (balanced)</option>
              <option value="openai/gpt-4o-mini">GPT-4o Mini</option>
              <option value="google/gemini-flash-1.5">Gemini Flash 1.5</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
              GitHub Token <span className="text-slate-400 font-normal">(for code scanning)</span>
            </label>
            <input
              type="password"
              className={inputClass}
              placeholder="ghp_..."
              value={keys.githubToken}
              onChange={e => setKeys(k => ({ ...k, githubToken: e.target.value }))}
            />
          </div>
        </div>

        <button
          onClick={save}
          className={`mt-6 w-full py-3 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 ${
            saved
              ? 'bg-emerald-500 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {saved ? <><CheckCircle className="w-4 h-4" /> Saved!</> : <><Save className="w-4 h-4" /> Save Settings</>}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Add Website Modal
// ─────────────────────────────────────────────────────────────
function AddWebsiteModal({ onClose, onAdded }: { onClose: () => void; onAdded: () => void }) {
  const [form, setForm] = useState({ name: '', url: '', githubRepo: '', githubToken: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit() {
    if (!form.name || !form.url) { setError('Name and URL are required'); return; }
    setLoading(true); setError('');
    try {
      await apiFetch('/api/websites', {
        method: 'POST',
        body: JSON.stringify({
          name: form.name,
          url: form.url.startsWith('http') ? form.url : `https://${form.url}`,
          githubRepo: form.githubRepo || undefined,
          githubToken: form.githubToken || getUserKeys().githubToken || undefined,
        }),
      });
      onAdded();
      onClose();
    } catch (e: any) {
      setError(e.message);
    } finally { setLoading(false); }
  }

  const inputClass = "w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm dark:text-white";

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 w-full max-w-md shadow-2xl border border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-black text-slate-900 dark:text-white">Add Website</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">Site Name *</label>
            <input className={inputClass} placeholder="My Awesome Site" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">URL *</label>
            <input className={inputClass} placeholder="https://example.com" value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">GitHub Repo <span className="font-normal normal-case">(optional)</span></label>
            <input className={inputClass} placeholder="owner/repo-name" value={form.githubRepo} onChange={e => setForm(f => ({ ...f, githubRepo: e.target.value }))} />
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={loading}
            className="flex-1 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-black transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            {loading ? 'Adding...' : 'Add Website'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Website Card
// ─────────────────────────────────────────────────────────────
function WebsiteCard({
  website, scanning, onSelect, onScan, onDelete
}: {
  website: any; scanning: boolean; onSelect: (w: any) => void;
  onScan: (id: string) => void; onDelete: (id: string) => void;
}) {
  return (
    <div className="group bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-6 hover:shadow-xl hover:border-blue-500/30 transition-all flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center shrink-0">
            <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="min-w-0">
            <h3 className="font-black text-slate-900 dark:text-white truncate">{website.name}</h3>
            <a href={website.url} target="_blank" rel="noopener noreferrer" className="text-xs text-slate-400 hover:text-blue-500 transition-colors flex items-center gap-1 truncate">
              {website.url.replace(/^https?:\/\//, '')} <ExternalLink className="w-3 h-3 shrink-0" />
            </a>
          </div>
        </div>
        <StatusBadge status={website.status || 'pending'} />
      </div>

      {website.lastScan && (
        <div className="text-xs text-slate-400 flex items-center gap-1.5">
          <Clock className="w-3 h-3" />
          Last scan: {new Date(website.lastScan).toLocaleString()}
        </div>
      )}

      <div className="flex gap-2 pt-2 border-t border-slate-50 dark:border-slate-800">
        <button
          onClick={() => onSelect(website)}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-all"
        >
          <Eye className="w-3.5 h-3.5" /> View Report
        </button>
        <button
          onClick={() => onScan(website.id)}
          disabled={scanning}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-xs font-black text-white transition-colors"
        >
          {scanning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
          {scanning ? 'Scanning...' : 'Scan Now'}
        </button>
        <button
          onClick={() => { if (confirm('Delete this website?')) onDelete(website.id); }}
          className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 flex items-center justify-center text-red-500 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Scan Results View
// ─────────────────────────────────────────────────────────────
function ScanResultsView({ website, onBack }: { website: any; onBack: () => void }) {
  const [scans, setScans] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch(`/api/scans/${website.id}`)
      .then(data => { setScans(data); if (data.length > 0) setSelected(data[0]); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [website.id]);

  const severityColor = (s: string) => ({
    critical: 'text-red-600 dark:text-red-400',
    high: 'text-orange-500 dark:text-orange-400',
    medium: 'text-amber-500 dark:text-amber-400',
    low: 'text-blue-500 dark:text-blue-400',
    info: 'text-slate-500 dark:text-slate-400',
  }[s] || 'text-slate-500');

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-blue-600 transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </button>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
          <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">{website.name}</h2>
          <p className="text-sm text-slate-500">{website.url}</p>
        </div>
        <div className="ml-auto"><StatusBadge status={website.status} /></div>
      </div>

      {loading && (
        <div className="text-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-slate-500">Loading scan history...</p>
        </div>
      )}

      {error && <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl text-red-600 dark:text-red-400 text-sm">{error}</div>}

      {!loading && scans.length === 0 && (
        <div className="text-center py-16 text-slate-500">
          <Activity className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No scans yet. Click "Scan Now" to start.</p>
        </div>
      )}

      {selected && (
        <div className="space-y-4">
          {/* Scan selector */}
          {scans.length > 1 && (
            <select
              value={selected.id}
              onChange={e => setSelected(scans.find(s => s.id === e.target.value))}
              className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm dark:text-white outline-none"
            >
              {scans.map(s => (
                <option key={s.id} value={s.id}>
                  {new Date(s.createdAt).toLocaleString()} — {s.issues?.length || 0} issues
                </option>
              ))}
            </select>
          )}

          {/* Issues */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6">
            <h3 className="text-base font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Issues Found ({selected.issues?.length || 0})
            </h3>
            {selected.issues?.length === 0 ? (
              <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
                <CheckCircle className="w-5 h-5" />
                <span className="font-bold">All clear! No issues detected.</span>
              </div>
            ) : (
              <div className="space-y-3">
                {selected.issues?.map((issue: any, i: number) => (
                  <div key={i} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">{issue.title || issue.type}</span>
                      <span className={`text-xs font-black uppercase ${severityColor(issue.severity)}`}>{issue.severity}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{issue.description}</p>
                    {issue.fix && (
                      <div className="mt-2 p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-xs text-emerald-700 dark:text-emerald-400">
                        💡 Fix: {issue.fix}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Performance metrics */}
          {selected.performance && (
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6">
              <h3 className="text-base font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-500" /> Performance
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {Object.entries(selected.performance).map(([k, v]: [string, any]) => (
                  <div key={k} className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 text-center">
                    <div className="text-xl font-black text-slate-900 dark:text-white">{v}</div>
                    <div className="text-xs text-slate-400 capitalize mt-1">{k.replace(/_/g, ' ')}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Summary */}
          {selected.aiSummary && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/10 border border-blue-100 dark:border-blue-800 rounded-3xl p-6">
              <h3 className="text-base font-black text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" /> AI Analysis
              </h3>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{selected.aiSummary}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main SiteGuard Page Component
// ─────────────────────────────────────────────────────────────
type View = 'dashboard' | 'settings' | 'results';

export default function SiteGuardPage() {
  const [view, setView] = useState<View>('dashboard');
  const [websites, setWebsites] = useState<any[]>([]);
  const [scanningIds, setScanningIds] = useState<Set<string>>(new Set());
  const [selectedWebsite, setSelectedWebsite] = useState<any>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasKeys, setHasKeys] = useState(false);

  useEffect(() => {
    const { monitorApiKey } = getUserKeys();
    setHasKeys(!!monitorApiKey);
    if (!monitorApiKey) setView('settings');
  }, []);

  const fetchWebsites = useCallback(async () => {
    if (!getUserKeys().monitorApiKey) return;
    setLoading(true); setError('');
    try {
      const data = await apiFetch('/api/websites');
      setWebsites(data);
    } catch (e: any) {
      if (e.message.toLowerCase().includes('api key') || e.message.includes('401') || e.message.includes('Unauthorized')) {
        setError('API key missing or incorrect — check Settings');
        setView('settings');
      } else {
        setError(`Failed to load: ${e.message}`);
      }
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { if (hasKeys) fetchWebsites(); }, [fetchWebsites, hasKeys]);

  async function triggerScan(websiteId: string) {
    setScanningIds(prev => new Set([...prev, websiteId]));
    try {
      await apiFetch(`/api/scans/${websiteId}`, { method: 'POST' });
      await fetchWebsites();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setScanningIds(prev => { const n = new Set(prev); n.delete(websiteId); return n; });
    }
  }

  async function deleteWebsite(id: string) {
    try {
      await apiFetch(`/api/websites/${id}`, { method: 'DELETE' });
      setWebsites(w => w.filter(x => x.id !== id));
    } catch (e: any) { setError(e.message); }
  }

  const stats = {
    total: websites.length,
    healthy: websites.filter(w => w.status === 'healthy').length,
    issues: websites.filter(w => w.status === 'issues_found').length,
    pending: websites.filter(w => w.status === 'pending').length,
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Helmet>
        <title>SiteGuard AI – Free Website Security Monitor | Texly</title>
        <meta name="description" content="Monitor your websites for uptime, security issues and vulnerabilities using AI. Free tool by Texly." />
      </Helmet>

      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-black text-slate-900 dark:text-white leading-none">SiteGuard AI</h1>
              <p className="text-[11px] text-slate-400">Website Security Monitor</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setView('settings')}
              className={`p-2 rounded-xl transition-colors ${view === 'settings' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
            {view !== 'results' && (
              <button
                onClick={fetchWebsites}
                disabled={loading}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                title="Refresh"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            )}
            {view === 'dashboard' && (
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-black rounded-xl transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Site
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Nav tabs */}
        {view !== 'results' && (
          <div className="flex gap-2 mb-8">
            {(['dashboard', 'settings'] as View[]).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-2 rounded-xl text-sm font-bold capitalize transition-all ${
                  view === v
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-800 hover:border-blue-300'
                }`}
              >
                {v === 'dashboard' ? '🌐 Dashboard' : '⚙️ Settings'}
              </button>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-2xl flex items-center justify-between gap-3">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            <button onClick={() => setError('')} className="text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* Settings view */}
        {view === 'settings' && (
          <SettingsPanel onSave={() => { setHasKeys(true); setView('dashboard'); fetchWebsites(); }} />
        )}

        {/* Dashboard view */}
        {view === 'dashboard' && (
          <>
            {/* Setup prompt */}
            {!hasKeys && (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <ShieldCheck className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-3">Set up SiteGuard AI</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
                  Set your Monitor API key to start tracking websites for uptime, security, and code issues.
                </p>
                <button
                  onClick={() => setView('settings')}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl transition-colors"
                >
                  Open Settings →
                </button>
              </div>
            )}

            {hasKeys && (
              <>
                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                  {[
                    { label: 'Total', value: stats.total, color: 'text-slate-900 dark:text-white', bg: 'bg-white dark:bg-slate-900' },
                    { label: 'Healthy', value: stats.healthy, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
                    { label: 'Issues', value: stats.issues, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20' },
                    { label: 'Pending', value: stats.pending, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
                  ].map(s => (
                    <div key={s.label} className={`${s.bg} border border-slate-100 dark:border-slate-800 rounded-2xl p-5`}>
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{s.label}</div>
                      <div className={`text-3xl font-black ${s.color}`}>{s.value}</div>
                    </div>
                  ))}
                </div>

                {/* Websites grid */}
                {loading && (
                  <div className="text-center py-16">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
                    <p className="text-slate-400">Loading websites...</p>
                  </div>
                )}

                {!loading && websites.length === 0 && (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-3xl flex items-center justify-center mx-auto mb-4">
                      <Globe className="w-8 h-8 text-blue-500" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">No websites yet</h3>
                    <p className="text-slate-400 mb-5">Add your first website to start monitoring</p>
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl transition-colors"
                    >
                      <Plus className="w-4 h-4 inline mr-2" /> Add Website
                    </button>
                  </div>
                )}

                {!loading && websites.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {websites.map(w => (
                      <WebsiteCard
                        key={w.id}
                        website={w}
                        scanning={scanningIds.has(w.id)}
                        onSelect={site => { setSelectedWebsite(site); setView('results'); }}
                        onScan={triggerScan}
                        onDelete={deleteWebsite}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* Scan Results view */}
        {view === 'results' && selectedWebsite && (
          <ScanResultsView website={selectedWebsite} onBack={() => { setView('dashboard'); setSelectedWebsite(null); }} />
        )}
      </div>

      {/* How it works — below the tool (SEO) */}
      {view === 'dashboard' && (
        <section className="border-t border-slate-100 dark:border-slate-800 mt-12 py-12">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-8 text-center">How SiteGuard AI Works</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { icon: <Plus className="w-6 h-6" />, title: '1. Add Your Website', desc: 'Enter your site URL and optional GitHub repo for code scanning.', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' },
                { icon: <Zap className="w-6 h-6" />, title: '2. AI Scans It', desc: 'AI checks uptime, security headers, broken links, and code issues.', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' },
                { icon: <ShieldCheck className="w-6 h-6" />, title: '3. Get Fix Suggestions', desc: 'Receive AI-powered recommendations and auto-fix options.', color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' },
              ].map(s => (
                <div key={s.title} className="text-center p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800">
                  <div className={`w-14 h-14 ${s.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>{s.icon}</div>
                  <h3 className="font-black text-slate-900 dark:text-white mb-2">{s.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Add Website Modal */}
      {showAddModal && (
        <AddWebsiteModal
          onClose={() => setShowAddModal(false)}
          onAdded={fetchWebsites}
        />
      )}
    </div>
  );
}
