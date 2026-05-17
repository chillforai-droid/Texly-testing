import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  ShieldCheck, Plus, RefreshCw, Globe, AlertTriangle,
  CheckCircle, Clock, Zap, Eye, Code, Settings,
  Trash2, ExternalLink, X, Save,
  Activity, ArrowLeft, Loader2, ChevronDown, Search, Cpu
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────────────────────
const SITEGUARD_API =
  (import.meta as any).env?.VITE_SITEGUARD_API_URL ||
  'https://your-siteguard-app.onrender.com';

const OPENROUTER_API = 'https://openrouter.ai/api/v1';

const FALLBACK_FREE_MODELS = [
  { id: 'deepseek/deepseek-chat:free', name: 'DeepSeek Chat (Free)', context: 65536 },
  { id: 'deepseek/deepseek-r1:free', name: 'DeepSeek R1 (Free)', context: 65536 },
  { id: 'google/gemini-2.0-flash-exp:free', name: 'Gemini 2.0 Flash (Free)', context: 1048576 },
  { id: 'meta-llama/llama-3.1-8b-instruct:free', name: 'Llama 3.1 8B (Free)', context: 131072 },
  { id: 'mistralai/mistral-7b-instruct:free', name: 'Mistral 7B (Free)', context: 32768 },
  { id: 'qwen/qwen-2-7b-instruct:free', name: 'Qwen 2 7B (Free)', context: 32768 },
];

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
// Global Model Picker — always visible in header
// ─────────────────────────────────────────────────────────────
function ModelPicker() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<'free' | 'paid'>('free');
  const [search, setSearch] = useState('');
  const [models, setModels] = useState<{ free: any[]; paid: any[] }>({ free: FALLBACK_FREE_MODELS, paid: [] });
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [selected, setSelected] = useState(() => localStorage.getItem('sg_openrouter_model') || '');
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Fetch models when opened (once)
  useEffect(() => {
    if (!open || fetched) return;
    const key = localStorage.getItem('sg_openrouter_api_key') || '';
    if (!key) { setFetched(true); return; }
    setLoading(true);
    fetch(`${OPENROUTER_API}/models`, { headers: { Authorization: `Bearer ${key}` } })
      .then(r => r.json())
      .then(data => {
        const all = data.data || [];
        const free = all
          .filter((m: any) => m.id.endsWith(':free') || parseFloat(m.pricing?.prompt || '1') === 0)
          .map((m: any) => ({ id: m.id, name: m.name || m.id, context: m.context_length || 0 }))
          .sort((a: any, b: any) => a.name.localeCompare(b.name));
        const paid = all
          .filter((m: any) => !m.id.endsWith(':free') && parseFloat(m.pricing?.prompt || '0') > 0)
          .map((m: any) => ({
            id: m.id, name: m.name || m.id, context: m.context_length || 0,
            price: m.pricing?.prompt ? `$${(parseFloat(m.pricing.prompt) * 1e6).toFixed(2)}/M` : '',
          }))
          .sort((a: any, b: any) => a.name.localeCompare(b.name));
        setModels({ free: free.length ? free : FALLBACK_FREE_MODELS, paid });
        setFetched(true);
      })
      .catch(() => setFetched(true))
      .finally(() => setLoading(false));
  }, [open, fetched]);

  const pick = (id: string) => {
    setSelected(id);
    localStorage.setItem('sg_openrouter_model', id);
    setOpen(false);
    setSearch('');
  };

  const displayed = (tab === 'free' ? models.free : models.paid).filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.id.toLowerCase().includes(search.toLowerCase())
  );

  const selectedName = [...models.free, ...models.paid].find(m => m.id === selected)?.name
    || FALLBACK_FREE_MODELS.find(m => m.id === selected)?.name
    || (selected ? selected.split('/').pop()?.replace(':free', '') : null);

  return (
    <div ref={ref} className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setOpen(v => !v)}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold transition-all ${
          open
            ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300'
            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-300 dark:hover:border-blue-600'
        }`}
      >
        <Cpu className="w-3.5 h-3.5 flex-shrink-0" />
        <span className="max-w-[120px] truncate hidden sm:block">
          {selectedName || 'Choose Model'}
        </span>
        {!selected && <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />}
        <ChevronDown className={`w-3.5 h-3.5 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-[520px] max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-500" /> AI Model चुनें
            </span>
            {loading && <Loader2 className="w-4 h-4 animate-spin text-blue-500" />}
            {!loading && fetched && (
              <span className="text-xs text-slate-400">
                {models.free.length} free · {models.paid.length} paid
              </span>
            )}
          </div>

          {/* Tab switcher */}
          <div className="flex border-b border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setTab('free')}
              className={`flex-1 py-2.5 text-xs font-black transition-colors flex items-center justify-center gap-1.5 ${
                tab === 'free'
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-b-2 border-green-500'
                  : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              🆓 Free Models
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${tab === 'free' ? 'bg-green-200 dark:bg-green-800 text-green-700 dark:text-green-300' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
                {models.free.length}
              </span>
            </button>
            <button
              onClick={() => setTab('paid')}
              className={`flex-1 py-2.5 text-xs font-black transition-colors flex items-center justify-center gap-1.5 ${
                tab === 'paid'
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-b-2 border-blue-500'
                  : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              💳 Paid Models
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${tab === 'paid' ? 'bg-blue-200 dark:bg-blue-800 text-blue-700 dark:text-blue-300' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
                {models.paid.length}
              </span>
            </button>
          </div>

          {/* Search */}
          <div className="px-3 py-2.5 border-b border-slate-100 dark:border-slate-800">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Model search करें..."
                autoFocus
                className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:border-blue-400 dark:text-white"
              />
            </div>
          </div>

          {/* Two-column model list */}
          <div className="overflow-y-auto max-h-72 p-2">
            {loading ? (
              <div className="flex items-center justify-center py-10 text-slate-400 text-xs gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> OpenRouter से models लोड हो रहे हैं...
              </div>
            ) : !localStorage.getItem('sg_openrouter_api_key') ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                <p>OpenRouter API key नहीं मिली।</p>
                <p className="mt-1">Settings में जाकर key add करें।</p>
              </div>
            ) : displayed.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">कोई model नहीं मिला</div>
            ) : (
              <div className="grid grid-cols-2 gap-1.5">
                {displayed.map(model => {
                  const isSelected = selected === model.id;
                  return (
                    <button
                      key={model.id}
                      onClick={() => pick(model.id)}
                      className={`text-left px-3 py-2.5 rounded-xl border transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-sm'
                          : 'border-slate-100 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1 mb-0.5">
                        <span className={`text-[11px] font-black leading-tight line-clamp-2 ${isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-slate-800 dark:text-slate-200'}`}>
                          {model.name}
                        </span>
                        {isSelected && <CheckCircle className="w-3 h-3 text-blue-500 flex-shrink-0 mt-0.5" />}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        {tab === 'free' && (
                          <span className="text-[9px] bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 px-1.5 py-0.5 rounded-full font-bold">FREE</span>
                        )}
                        {tab === 'paid' && model.price && (
                          <span className="text-[9px] bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded-full font-bold">{model.price}</span>
                        )}
                        {model.context > 0 && (
                          <span className="text-[9px] text-slate-400">{(model.context / 1000).toFixed(0)}K ctx</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {selected && (
            <div className="px-4 py-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
              <span className="text-xs text-slate-600 dark:text-slate-300 truncate">
                <span className="font-bold text-emerald-600 dark:text-emerald-400">Selected:</span> {selectedName || selected}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// StatusBadge
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
// Animated Terminal Log
// ─────────────────────────────────────────────────────────────
function TerminalLog({ logs }: { logs: { msg: string; type: string }[] }) {
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [logs]);
  if (!logs.length) return null;

  const colorClass = (type: string) => ({
    info: 'text-blue-300', success: 'text-green-400', error: 'text-red-400',
    warning: 'text-yellow-300', file: 'text-purple-300', step: 'text-cyan-300',
  }[type] || 'text-gray-300');

  const icon = (type: string) => ({
    info: 'ℹ', success: '✅', error: '❌', warning: '⚠', file: '📄', step: '▶'
  }[type] || '·');

  return (
    <div className="bg-slate-950 rounded-xl border border-slate-700 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 border-b border-slate-700">
        <span className="w-3 h-3 rounded-full bg-red-500" />
        <span className="w-3 h-3 rounded-full bg-yellow-500" />
        <span className="w-3 h-3 rounded-full bg-green-500" />
        <span className="text-slate-400 text-xs ml-2 font-mono">AI Editor — Terminal</span>
        <span className="ml-auto flex items-center gap-1.5 text-xs text-green-400">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" /> Live
        </span>
      </div>
      <div className="p-4 font-mono text-xs space-y-1 max-h-64 overflow-y-auto" style={{ background: '#0d1117' }}>
        {logs.map((log, i) => (
          <div key={i} className={`flex gap-2 ${colorClass(log.type)}`}>
            <span className="text-slate-600 w-4 text-right flex-shrink-0">{icon(log.type)}</span>
            <span className="whitespace-pre-wrap break-all">{log.msg}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Realtime File Editor (for AIFixPanel)
// ─────────────────────────────────────────────────────────────
function RealtimeFileEditor({ steps }: { steps: { type: string; content: string }[] }) {
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [steps]);
  if (!steps || steps.length === 0) return null;

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden mb-6">
      <div className="flex items-center gap-2 px-4 py-3 bg-slate-800 border-b border-slate-700">
        <span className="w-3 h-3 rounded-full bg-red-500" />
        <span className="w-3 h-3 rounded-full bg-yellow-500" />
        <span className="w-3 h-3 rounded-full bg-green-500" />
        <span className="text-slate-400 text-xs ml-2 font-mono">AI File Editor — Live</span>
        <span className="ml-auto flex items-center gap-1.5 text-xs text-green-400">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" /> Editing...
        </span>
      </div>
      <div className="max-h-80 overflow-y-auto p-4 font-mono text-xs space-y-1" style={{ background: '#0d1117' }}>
        {steps.map((step, i) => (
          <div key={i} className={`flex gap-3 ${
            step.type === 'file' ? 'text-blue-400' :
            step.type === 'add' ? 'text-green-400' :
            step.type === 'remove' ? 'text-red-400' :
            step.type === 'info' ? 'text-yellow-300' :
            step.type === 'success' ? 'text-green-300' :
            step.type === 'error' ? 'text-red-300' : 'text-slate-400'
          }`}>
            <span className="text-slate-600 select-none w-5 text-right flex-shrink-0">{i + 1}</span>
            <span className="whitespace-pre-wrap break-all">
              {step.type === 'file' && `📄 ${step.content}`}
              {step.type === 'add' && `+ ${step.content}`}
              {step.type === 'remove' && `- ${step.content}`}
              {step.type === 'info' && `  ℹ  ${step.content}`}
              {step.type === 'success' && `✅ ${step.content}`}
              {step.type === 'error' && `❌ ${step.content}`}
              {step.type === 'plain' && `   ${step.content}`}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Fix Summary Panel
// ─────────────────────────────────────────────────────────────
function FixSummary({ summary }: { summary: any }) {
  if (!summary) return null;
  return (
    <div className="bg-slate-900 rounded-xl border border-green-800 p-5 mb-6">
      <h3 className="text-green-400 font-semibold mb-3 flex items-center gap-2">
        📋 Fix Summary — क्या था Error और क्या Fix हुआ
      </h3>
      <div className="space-y-3">
        {summary.errors?.length > 0 && (
          <div>
            <div className="text-red-400 text-xs font-semibold uppercase mb-1">🐛 Errors Found</div>
            {summary.errors.map((e: string, i: number) => (
              <div key={i} className="flex gap-2 text-sm text-slate-300 mb-1">
                <span className="text-red-400 flex-shrink-0">•</span><span>{e}</span>
              </div>
            ))}
          </div>
        )}
        {summary.fixes?.length > 0 && (
          <div>
            <div className="text-green-400 text-xs font-semibold uppercase mb-1">🔧 Applied Fixes</div>
            {summary.fixes.map((f: string, i: number) => (
              <div key={i} className="flex gap-2 text-sm text-slate-300 mb-1">
                <span className="text-green-400 flex-shrink-0">✓</span><span>{f}</span>
              </div>
            ))}
          </div>
        )}
        {summary.filesEdited?.length > 0 && (
          <div>
            <div className="text-blue-400 text-xs font-semibold uppercase mb-1">📁 Files Edited</div>
            <div className="flex flex-wrap gap-2">
              {summary.filesEdited.map((f: string, i: number) => (
                <span key={i} className="text-xs bg-blue-900/40 text-blue-300 px-2 py-1 rounded font-mono">{f}</span>
              ))}
            </div>
          </div>
        )}
        {summary.message && (
          <div className="mt-2 p-3 bg-green-900/20 border border-green-800 rounded-lg text-green-300 text-sm">
            {summary.message}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// GitHub File Browser
// ─────────────────────────────────────────────────────────────
function GitHubFileBrowser({ website }: { website: any }) {
  const [tree, setTree] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<any>(null);
  const [fileLoading, setFileLoading] = useState(false);

  const loadTree = async () => {
    if (tree) { setExpanded(v => !v); return; }
    setLoading(true); setError(null);
    try {
      const data = await apiFetch(`/api/websites/${website.id}/files`);
      setTree(data.tree || []);
      setExpanded(true);
    } catch (err: any) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  const loadFile = async (path: string) => {
    if (selectedFile === path) { setSelectedFile(null); setFileContent(null); return; }
    setSelectedFile(path); setFileLoading(true); setFileContent(null);
    try {
      const data = await apiFetch(`/api/websites/${website.id}/files/content?path=${encodeURIComponent(path)}`);
      setFileContent(data);
    } catch (err: any) {
      setFileContent({ error: err.message });
    } finally { setFileLoading(false); }
  };

  if (!website?.hasGithubToken || !website?.githubRepo) return null;

  const buildTree = (items: any[]) => {
    const dirs: Record<string, any[]> = {};
    const files: any[] = [];
    items.forEach(item => {
      const parts = item.path.split('/');
      if (parts.length === 1) files.push(item);
      else {
        const dir = parts[0];
        if (!dirs[dir]) dirs[dir] = [];
        dirs[dir].push({ ...item, path: parts.slice(1).join('/'), fullPath: item.path });
      }
    });
    return { dirs, files };
  };

  const FileIcon = ({ path }: { path: string }) => {
    const ext = path.split('.').pop()?.toLowerCase();
    const icons: Record<string, string> = { js: '🟨', jsx: '⚛️', ts: '🔷', tsx: '⚛️', json: '📋', html: '🌐', css: '🎨', md: '📝', py: '🐍', sh: '⚡', yml: '⚙️', yaml: '⚙️', env: '🔒' };
    return <span>{icons[ext || ''] || '📄'}</span>;
  };

  const TreeNode = ({ item, depth = 0 }: { item: any; depth?: number }) => {
    const isSelected = selectedFile === (item.fullPath || item.path);
    return (
      <button onClick={() => loadFile(item.fullPath || item.path)}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        className={`w-full flex items-center gap-2 py-1 pr-3 text-left text-xs rounded transition-colors ${isSelected ? 'bg-blue-900/40 text-blue-300' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}>
        <FileIcon path={item.path} />
        <span className="truncate">{item.path.split('/').pop()}</span>
        {item.size && <span className="ml-auto text-slate-600 flex-shrink-0">{(item.size / 1024).toFixed(1)}KB</span>}
      </button>
    );
  };

  const FolderNode = ({ name, items, depth = 0 }: { name: string; items: any[]; depth?: number }) => {
    const [open, setOpen] = useState(false);
    const { dirs, files } = buildTree(items);
    return (
      <div>
        <button onClick={() => setOpen(v => !v)} style={{ paddingLeft: `${depth * 16 + 8}px` }}
          className="w-full flex items-center gap-2 py-1 pr-3 text-left text-xs text-slate-300 hover:bg-slate-800 rounded transition-colors">
          <span>{open ? '📂' : '📁'}</span>
          <span>{name}</span>
          <span className="ml-auto text-slate-600">{items.length}</span>
        </button>
        {open && (
          <div>
            {Object.entries(dirs).map(([dir, children]) => (
              <FolderNode key={dir} name={dir} items={children} depth={depth + 1} />
            ))}
            {files.map(f => <TreeNode key={f.path} item={f} depth={depth + 1} />)}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 mb-6">
      <button onClick={loadTree} disabled={loading}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-750 transition-colors rounded-xl">
        <div className="flex items-center gap-2 text-sm font-medium">
          <span>📁</span>
          <span>GitHub Repository Files</span>
          <span className="text-xs text-slate-500 font-mono">{website.githubRepo?.replace('https://github.com/', '')}</span>
        </div>
        <div className="flex items-center gap-2">
          {loading && <Loader2 className="w-4 h-4 animate-spin text-blue-400" />}
          <span className="text-slate-400 text-xs">{expanded ? '▲ Collapse' : '▼ Expand'}</span>
        </div>
      </button>
      {error && <div className="px-4 pb-3 text-red-400 text-xs">⚠️ {error}</div>}
      {expanded && tree && (
        <div className="border-t border-slate-700">
          <div className="flex" style={{ minHeight: '200px' }}>
            <div className="w-64 border-r border-slate-700 overflow-y-auto max-h-96 py-2 flex-shrink-0">
              {(() => {
                const { dirs, files } = buildTree(tree);
                return (
                  <>
                    {Object.entries(dirs).map(([dir, children]) => (
                      <FolderNode key={dir} name={dir} items={children} />
                    ))}
                    {files.map(f => <TreeNode key={f.path} item={f} />)}
                  </>
                );
              })()}
            </div>
            <div className="flex-1 overflow-auto max-h-96">
              {!selectedFile && (
                <div className="flex items-center justify-center h-full text-slate-500 text-sm">← कोई file select करें</div>
              )}
              {fileLoading && (
                <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading...
                </div>
              )}
              {fileContent && !fileLoading && (
                <div>
                  <div className="px-4 py-2 bg-slate-900 border-b border-slate-700 flex items-center justify-between sticky top-0">
                    <span className="text-xs text-blue-400 font-mono">{selectedFile}</span>
                    {fileContent.size && <span className="text-xs text-slate-500">{(fileContent.size / 1024).toFixed(1)}KB</span>}
                  </div>
                  {fileContent.error ? (
                    <div className="p-4 text-red-400 text-xs">{fileContent.error}</div>
                  ) : fileContent.content ? (
                    <pre className="p-4 text-xs text-slate-300 font-mono overflow-x-auto whitespace-pre-wrap">
                      {fileContent.content.split('\n').map((line: string, i: number) => (
                        <div key={i} className="flex gap-3">
                          <span className="text-slate-600 select-none w-6 text-right flex-shrink-0">{i + 1}</span>
                          <span>{line}</span>
                        </div>
                      ))}
                    </pre>
                  ) : (
                    <div className="p-4 text-slate-500 text-xs">Binary file — preview not available</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// AIFixPanel — Full featured with realtime editor, diff, rollback
// ─────────────────────────────────────────────────────────────
function AIFixPanel({ scan, website, onBack }: { scan: any; website: any; onBack: () => void }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [diff, setDiff] = useState<any>(null);
  const [diffLoading, setDiffLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editorSteps, setEditorSteps] = useState<{ type: string; content: string }[]>([]);
  const [fixSummary, setFixSummary] = useState<any>(null);

  const addStep = (type: string, content: string) => {
    setEditorSteps(prev => [...prev, { type, content }]);
  };

  const approveFix = async (issueIndex: number) => {
    setLoading(true);
    setEditorSteps([]);
    setFixSummary(null);
    setError(null);
    setResult(null);

    const issue = scan.aiAnalysis?.criticalIssues?.[issueIndex];
    const patches = scan.aiAnalysis?.patches || [];

    addStep('info', `Fix शुरू हो रहा है: "${issue?.message}"`);
    addStep('info', `${patches.length} patch(es) apply होंगे`);
    setTimeout(() => addStep('info', 'GitHub repository clone हो रही है...'), 400);
    setTimeout(() => addStep('info', 'Fix branch create हो रही है...'), 900);

    patches.forEach((patch: any, i: number) => {
      setTimeout(() => {
        addStep('file', `Editing: ${patch.file}`);
        const lines = patch.fix?.split('\n') || [];
        lines.slice(0, 8).forEach((line: string, li: number) => {
          setTimeout(() => {
            if (line.startsWith('+')) addStep('add', line.slice(1).trim() || ' ');
            else if (line.startsWith('-')) addStep('remove', line.slice(1).trim() || ' ');
            else if (line.trim()) addStep('plain', line.trim());
          }, li * 80);
        });
      }, 1200 + i * 800);
    });

    setTimeout(() => addStep('info', 'Build verify हो रही है...'), 1200 + patches.length * 800 + 200);
    setTimeout(() => addStep('info', 'Changes commit और push हो रहे हैं...'), 1200 + patches.length * 800 + 600);

    try {
      const data = await apiFetch('/api/fixes/approve', {
        method: 'POST',
        body: JSON.stringify({ scanId: scan.id, issueIndex }),
      });
      if (data.buildWarning) addStep('info', `⚠️ Build warning: ${data.buildWarning}`);
      addStep('success', `PR create हो गया: ${data.prUrl || 'done'}`);
      addStep('success', `Branch: ${data.branch}`);
      setResult(data);
      setFixSummary({
        errors: scan.aiAnalysis?.criticalIssues?.map((i: any) => `${i.type}: ${i.message}`) || [],
        fixes: patches.map((p: any) => `${p.file} में fix apply हुआ (risk: ${p.risk || 'unknown'})`),
        filesEdited: patches.map((p: any) => p.file),
        message: `✅ Fix successfully apply हुआ! Branch "${data.branch}" पर PR create हो गई।`,
      });
    } catch (err: any) {
      addStep('error', `Network error: ${err.message}`);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const viewDiff = async () => {
    setDiffLoading(true); setDiff(null);
    try {
      const data = await apiFetch(`/api/fixes/diff/${scan.id}`);
      setDiff(data);
    } catch (err: any) {
      setError(`Failed to load diff: ${err.message}`);
    } finally { setDiffLoading(false); }
  };

  const rollbackFix = async () => {
    if (!confirm('Rollback करना चाहते हैं? GitHub पर fix branch delete हो जाएगी।')) return;
    setLoading(true); setError(null);
    try {
      await apiFetch(`/api/fixes/rollback/${scan.id}`, { method: 'POST' });
      setResult(null); setDiff(null); setEditorSteps([]); setFixSummary(null);
    } catch (err: any) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  const hasGithubConfig = website?.hasGithubToken && website?.githubRepo;
  const { selectedModel } = getUserKeys();

  return (
    <div>
      <button onClick={onBack} className="mb-6 flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-blue-600 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Scans
      </button>

      {error && (
        <div className="mb-4 p-4 bg-red-900/40 border border-red-700 rounded-xl text-red-300 text-sm flex justify-between items-start">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)} className="ml-2 text-red-400 hover:text-red-200"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* AI Model badge */}
      <div className="mb-4 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <span>🧠 AI Model:</span>
        <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-slate-300">{selectedModel}</span>
      </div>

      {!hasGithubConfig && (
        <div className="mb-6 p-4 bg-amber-900/30 border border-amber-700 rounded-xl text-amber-300 text-sm">
          ⚠️ GitHub token या repository configure नहीं है। Auto-fix के लिए दोनों जरूरी हैं।
        </div>
      )}

      {hasGithubConfig && <GitHubFileBrowser website={website} />}
      {editorSteps.length > 0 && <RealtimeFileEditor steps={editorSteps} />}
      {fixSummary && <FixSummary summary={fixSummary} />}

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 mb-8">
        <h2 className="text-xl font-black text-slate-900 dark:text-white mb-4">AI Analysis & Fix</h2>

        {/* AI Summary */}
        <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 mb-6">
          <div className="text-sm text-slate-400 mb-2">AI Analysis Summary</div>
          <p className="text-slate-700 dark:text-slate-200 leading-relaxed">
            {scan.aiAnalysis?.summary || 'इस scan के लिए कोई analysis नहीं है।'}
          </p>
          <div className="flex gap-4 mt-3">
            {scan.aiAnalysis?.priority && (
              <span className={`text-xs px-2 py-1 rounded font-medium ${
                scan.aiAnalysis.priority === 'high' ? 'bg-red-900 text-red-300' :
                scan.aiAnalysis.priority === 'medium' ? 'bg-amber-900 text-amber-300' : 'bg-green-900 text-green-300'}`}>
                Priority: {scan.aiAnalysis.priority}
              </span>
            )}
            {scan.aiAnalysis?.rootCauses?.length > 0 && (
              <span className="text-xs text-slate-500">{scan.aiAnalysis.rootCauses.length} root cause(s)</span>
            )}
          </div>
        </div>

        {/* Root Causes */}
        {scan.aiAnalysis?.rootCauses?.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-2">Root Causes</h3>
            <ul className="space-y-1">
              {scan.aiAnalysis.rootCauses.map((cause: string, i: number) => (
                <li key={i} className="text-sm text-slate-700 dark:text-slate-300">• {cause}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Critical Issues */}
        {scan.aiAnalysis?.criticalIssues?.length > 0 ? (
          <div className="space-y-4 mb-6">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Critical Issues</h3>
            {scan.aiAnalysis.criticalIssues.map((issue: any, i: number) => (
              <div key={i} className="bg-red-900/20 border border-red-800/30 rounded-2xl p-4">
                <div className="flex items-start justify-between mb-3 gap-2">
                  <div className="min-w-0">
                    <span className="font-bold text-red-400 block">{issue.type}</span>
                    <p className="text-sm mt-1 text-slate-300">{issue.message}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs flex-shrink-0 ${
                    issue.severity === 'error' ? 'bg-red-900 text-red-400' : 'bg-amber-900 text-amber-400'}`}>
                    {issue.severity || 'warning'}
                  </span>
                </div>
                {!scan.fixed && hasGithubConfig && (
                  <button onClick={() => approveFix(i)} disabled={loading}
                    className="w-full py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors flex items-center justify-center gap-2 text-white font-bold text-sm">
                    {loading ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> AI Fix Apply हो रही है...</>
                    ) : '✅ Approve & Auto-Fix'}
                  </button>
                )}
                {scan.fixed && <div className="text-xs text-green-400 mt-2">✓ Fix already applied</div>}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-slate-500">इस scan में कोई critical issues नहीं मिले।</div>
        )}

        {/* Suggested Patches */}
        {scan.aiAnalysis?.patches?.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-3">Suggested Patches</h3>
            {scan.aiAnalysis.patches.map((patch: any, i: number) => (
              <div key={i} className="bg-slate-800 rounded-xl p-4 mb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-400 font-mono">{patch.file}</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    patch.risk === 'low' ? 'bg-green-900 text-green-400' :
                    patch.risk === 'medium' ? 'bg-amber-900 text-amber-400' : 'bg-red-900 text-red-400'}`}>
                    Risk: {patch.risk || 'unknown'}
                  </span>
                </div>
                <pre className="text-xs text-slate-300 overflow-x-auto p-2 bg-black/50 rounded whitespace-pre-wrap">{patch.fix}</pre>
              </div>
            ))}
          </div>
        )}

        {/* Fix Result */}
        {result && (
          <div className={`p-4 rounded-2xl mb-4 ${result.success ? 'bg-green-900/20 border border-green-800' : 'bg-red-900/20 border border-red-800'}`}>
            {result.success ? (
              <div>
                <div className="font-black text-green-400 mb-2 text-lg">✅ Fix Successfully Applied!</div>
                {result.buildWarning && (
                  <div className="mb-3 p-2 bg-amber-900/30 border border-amber-700 rounded-lg text-amber-300 text-xs">
                    ⚠️ Build warning: {result.buildWarning}
                  </div>
                )}
                <div className="text-sm text-slate-300 mb-1">Branch: <code className="bg-slate-700 px-2 py-0.5 rounded text-xs">{result.branch}</code></div>
                {result.prUrl && (
                  <a href={result.prUrl} target="_blank" rel="noreferrer"
                    className="text-blue-400 hover:underline text-sm mt-2 inline-flex items-center gap-1">
                    🔗 GitHub पर Pull Request देखें <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                <div className="flex gap-2 mt-4">
                  <button onClick={viewDiff} disabled={diffLoading}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 rounded-xl text-sm transition-colors">
                    {diffLoading ? '...' : '📄 View Diff'}
                  </button>
                  <button onClick={rollbackFix} disabled={loading}
                    className="px-4 py-2 bg-red-700 hover:bg-red-600 disabled:opacity-50 rounded-xl text-sm transition-colors">
                    ↩ Rollback
                  </button>
                </div>
              </div>
            ) : <div className="text-red-400">❌ {result.error}</div>}
          </div>
        )}

        {/* Diff Viewer */}
        {diff && (
          <div className="mt-6">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-3">Code Changes</h3>
            {diff.files?.length === 0 && <div className="text-slate-500 text-sm">No file changes found.</div>}
            <div className="space-y-4">
              {diff.files?.map((file: any, i: number) => (
                <div key={i} className="bg-slate-800 rounded-xl p-4">
                  <div className="text-sm font-medium text-blue-400 mb-2 font-mono">{file.filename}</div>
                  <div className="text-xs text-slate-400 mb-2">
                    <span className="text-green-400">+{file.additions}</span>{' / '}
                    <span className="text-red-400">-{file.deletions}</span>
                  </div>
                  <pre className="text-xs overflow-x-auto font-mono">
                    {file.patch?.split('\n').map((line: string, j: number) => (
                      <div key={j} className={
                        line.startsWith('+') ? 'text-green-400' :
                        line.startsWith('-') ? 'text-red-400' :
                        line.startsWith('@@') ? 'text-blue-400' : 'text-slate-400'}>
                        {line}
                      </div>
                    ))}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Code Scanner Results
// ─────────────────────────────────────────────────────────────
function CodeScanResults({ results, onClose }: { results: any; onClose: () => void }) {
  const [filter, setFilter] = useState('all');
  if (!results) return null;

  const shown = filter === 'all' ? results.allIssues
    : filter === 'error' ? results.errors
    : filter === 'warning' ? results.warnings
    : results.infos;

  const sevColor: Record<string, string> = {
    error: 'text-red-400 bg-red-900/30 border-red-700',
    warning: 'text-yellow-300 bg-yellow-900/20 border-yellow-700',
    info: 'text-blue-300 bg-blue-900/20 border-blue-700',
  };
  const sevBadge: Record<string, string> = {
    error: 'bg-red-700 text-red-100',
    warning: 'bg-amber-700 text-amber-100',
    info: 'bg-blue-700 text-blue-100',
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Files Scanned', val: results.scannedFiles, color: 'text-slate-300' },
          { label: 'Errors', val: results.errors.length, color: 'text-red-400' },
          { label: 'Warnings', val: results.warnings.length, color: 'text-amber-400' },
          { label: 'Info', val: results.infos.length, color: 'text-blue-400' },
        ].map(({ label, val, color }) => (
          <div key={label} className="bg-slate-800 rounded-2xl p-3 text-center border border-slate-700">
            <div className={`text-2xl font-black ${color}`}>{val}</div>
            <div className="text-slate-400 text-xs mt-1">{label}</div>
          </div>
        ))}
      </div>
      <div className="flex gap-2 flex-wrap">
        {['all', 'error', 'warning', 'info'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-xl text-sm capitalize transition-colors ${filter === f ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
            {f === 'all' ? `All (${results.totalIssues})` :
             f === 'error' ? `Errors (${results.errors.length})` :
             f === 'warning' ? `Warnings (${results.warnings.length})` : `Info (${results.infos.length})`}
          </button>
        ))}
        <button onClick={onClose} className="ml-auto px-3 py-1.5 rounded-xl text-sm bg-slate-700 hover:bg-slate-600 text-slate-300">✕ Close</button>
      </div>
      <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
        {shown.length === 0 ? (
          <div className="text-center text-slate-500 py-8">No issues found for this filter 🎉</div>
        ) : shown.map((issue: any, i: number) => (
          <div key={i} className={`rounded-xl border p-3 ${sevColor[issue.severity]}`}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className={`text-xs px-2 py-0.5 rounded font-semibold ${sevBadge[issue.severity]}`}>{issue.severity.toUpperCase()}</span>
                  <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded">{issue.type}</span>
                </div>
                <div className="text-sm font-medium">{issue.message}</div>
                <div className="text-xs text-slate-400 mt-1 font-mono">📄 {issue.file}{issue.line ? `:${issue.line}` : ''}</div>
                {issue.code && (
                  <div className="text-xs text-slate-500 font-mono mt-1 bg-black/30 rounded px-2 py-1 break-all">{issue.code}</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// AI Editor (AI Text Editor + Code Scanner + History)
// ─────────────────────────────────────────────────────────────
const INSTRUCTION_TEMPLATES = [
  { label: '🎨 Change Theme Color', text: 'Change the primary color theme to dark blue and purple gradient' },
  { label: '📝 Fix Meta Tags', text: 'Add proper meta description, og:title, og:description, and canonical URL tags' },
  { label: '📱 Mobile Fix', text: 'Fix the mobile responsive layout so there is no horizontal scroll' },
  { label: '⚡ Performance', text: 'Add lazy loading to all images and defer non-critical scripts' },
  { label: '♿ Accessibility', text: 'Add aria-labels, alt text to all images, and fix heading hierarchy' },
  { label: '🔒 Security Headers', text: 'Add Content-Security-Policy and other security meta tags to the HTML head' },
  { label: '🔤 Update Footer', text: 'Update the footer with current year and add privacy policy link' },
  { label: '💡 Add Dark Mode', text: 'Add a dark/light mode toggle using CSS variables' },
];

function AIEditorPanel({ website, onBack }: { website: any; onBack: () => void }) {
  const [tab, setTab] = useState<'editor' | 'scanner' | 'history'>('editor');
  const [instruction, setInstruction] = useState('');
  const [targetFile, setTargetFile] = useState('');
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<{ msg: string; type: string }[]>([]);
  const [result, setResult] = useState<any>(null);
  const [scanResults, setScanResults] = useState<any>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  const addLog = (msg: string, type = 'info') => setLogs(prev => [...prev, { msg, type }]);

  useEffect(() => { if (website) fetchHistory(); }, [website]);

  const fetchHistory = async () => {
    try {
      const data = await apiFetch(`/api/editor/history/${website.id}`);
      setHistory(Array.isArray(data) ? data : []);
    } catch {}
  };

  const runCodeScan = async () => {
    setScanning(true); setScanResults(null); setError(null);
    try {
      const data = await apiFetch(`/api/editor/scan-code/${website.id}`, { method: 'POST' });
      setScanResults(data.results);
    } catch (err: any) {
      setError(err.message);
    } finally { setScanning(false); }
  };

  const runAIEdit = async () => {
    if (!instruction.trim()) { setError('Please enter an instruction'); return; }
    if (instruction.length > 1000) {
      setError(`Instruction too long (${instruction.length}/1000 chars). Write a short description.`);
      return;
    }
    setLoading(true); setLogs([]); setResult(null); setError(null);
    addLog('Connecting to GitHub repository...', 'step');
    addLog(`Website: ${website.url}`, 'info');
    addLog(`Framework: ${website.framework || 'Unknown'}`, 'info');
    try {
      const reqBody: any = { websiteId: website.id, instruction };
      if (targetFile.trim()) reqBody.targetFile = targetFile.trim();
      addLog('Cloning repository...', 'step');
      addLog('Reading source files...', 'step');
      addLog('Sending to AI for analysis...', 'step');
      const data = await apiFetch('/api/editor/ai-edit', { method: 'POST', body: JSON.stringify(reqBody) });
      if (data.noChanges) {
        addLog('AI says no changes are needed for this instruction.', 'warning');
        addLog(data.explanation || '', 'info');
        setResult({ noChanges: true, explanation: data.explanation });
        return;
      }
      addLog(`AI generated ${data.appliedFiles?.length || 0} file change(s)`, 'success');
      data.appliedFiles?.forEach((f: any) => addLog(`  📄 ${f.file} — ${f.description || 'updated'}`, 'file'));
      addLog('Running build verification...', 'step');
      addLog('Committing and pushing to GitHub...', 'step');
      addLog('Creating Pull Request...', 'step');
      addLog(`✅ Pull Request created!`, 'success');
      addLog(data.prUrl || '', 'info');
      setResult(data);
      fetchHistory();
    } catch (err: any) {
      addLog(`❌ Error: ${err.message}`, 'error');
      setError(err.message);
    } finally { setLoading(false); }
  };

  if (!website) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button onClick={onBack} className="text-slate-400 hover:text-blue-500 text-sm mb-2 flex items-center gap-1 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">✏️ AI Site Editor</h2>
          <p className="text-slate-400 text-sm mt-1">{website.name} — {website.url}</p>
        </div>
      </div>

      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
        {([
          { id: 'editor', label: '✏️ AI Text Editor', desc: 'Edit site with natural language' },
          { id: 'scanner', label: '🔍 Code Scanner', desc: 'Deep bug analysis' },
          { id: 'history', label: '📜 History', desc: `${history.length} records` },
        ] as const).map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors -mb-px ${tab === t.id ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>
            {t.label}
            <span className="text-xs text-slate-500 ml-1 hidden sm:inline">— {t.desc}</span>
          </button>
        ))}
      </div>

      {/* AI Text Editor Tab */}
      {tab === 'editor' && (
        <div className="space-y-5">
          <div>
            <div className="text-xs text-slate-400 mb-2 uppercase tracking-wide font-bold">Quick Instructions</div>
            <div className="flex flex-wrap gap-2">
              {INSTRUCTION_TEMPLATES.map(t => (
                <button key={t.label} onClick={() => setInstruction(t.text)}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs rounded-xl transition-colors">
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm text-slate-700 dark:text-slate-300 mb-2 font-bold">
              🗣️ What do you want to change? <span className="text-red-400">*</span>
            </label>
            <textarea value={instruction} onChange={e => setInstruction(e.target.value)}
              placeholder="e.g., Change the navbar color to dark blue and add a login button on the right side. Write in plain language — do not paste HTML code here."
              rows={4}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-2xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 resize-none text-sm" />
            <div className={`text-xs mt-1 ${instruction.length > 1000 ? 'text-red-400 font-bold' : instruction.length > 800 ? 'text-amber-400' : 'text-slate-400'}`}>
              {instruction.length}/1000{instruction.length > 1000 ? ' — too long!' : ' chars'}
            </div>
          </div>
          <div>
            <label className="block text-sm text-slate-700 dark:text-slate-300 mb-2 font-bold">
              📄 Target File <span className="text-slate-400 font-normal">(optional — AI auto-detects if blank)</span>
            </label>
            <input value={targetFile} onChange={e => setTargetFile(e.target.value)}
              placeholder="e.g., src/App.jsx  or  index.html  or  src/index.css"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-2xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 text-sm" />
          </div>
          {error && (
            <div className="bg-red-50 dark:bg-red-900/40 border border-red-200 dark:border-red-700 rounded-2xl px-4 py-3 text-red-600 dark:text-red-300 text-sm">
              ⚠️ {error}
            </div>
          )}
          <button onClick={runAIEdit} disabled={loading || !instruction.trim() || instruction.length > 1000}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black transition-all flex items-center justify-center gap-2">
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> AI is editing your site...</>
            ) : '🚀 Apply AI Edit & Create PR'}
          </button>
          {logs.length > 0 && <TerminalLog logs={logs} />}
          {result && !result.noChanges && (
            <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-2xl p-5 space-y-3">
              <div className="text-green-600 dark:text-green-400 font-black text-lg">✅ Edit Applied Successfully!</div>
              <div className="text-slate-600 dark:text-slate-300 text-sm">{result.explanation}</div>
              {result.appliedFiles?.length > 0 && (
                <div>
                  <div className="text-xs text-slate-400 mb-2 uppercase font-bold">Files Changed</div>
                  {result.appliedFiles.map((f: any, i: number) => (
                    <div key={i} className="flex gap-2 text-sm text-slate-600 dark:text-slate-300 mb-1">
                      <span className="text-purple-500">📄</span>
                      <span className="font-mono">{f.file}</span>
                      {f.description && <span className="text-slate-400">— {f.description}</span>}
                    </div>
                  ))}
                </div>
              )}
              {result.prUrl && (
                <a href={result.prUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-xl transition-colors font-bold">
                  🔗 Review Pull Request on GitHub
                </a>
              )}
            </div>
          )}
          {result?.noChanges && (
            <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-2xl p-4 text-amber-700 dark:text-amber-300 text-sm">
              ℹ️ {result.explanation || 'AI determined no changes are needed for this instruction.'}
            </div>
          )}
        </div>
      )}

      {/* Code Scanner Tab */}
      {tab === 'scanner' && (
        <div className="space-y-5">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-700 p-5">
            <h3 className="text-slate-900 dark:text-white font-black mb-2">🔍 Deep GitHub Code Scanner</h3>
            <p className="text-slate-400 text-sm mb-4">
              Scans your entire GitHub repository for bugs, security issues, performance problems, bad practices, and dependency vulnerabilities.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 text-xs">
              {['JS/TS Bugs', 'Security Vulns', 'CSS Issues', 'HTML Errors', 'React Patterns', 'Dependency Risks', 'Performance', 'Code Quality'].map(item => (
                <div key={item} className="bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-2 text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />{item}
                </div>
              ))}
            </div>
            <button onClick={runCodeScan} disabled={scanning}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-500 hover:to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black transition-all flex items-center justify-center gap-2">
              {scanning ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Scanning repository...</>
              ) : '🔍 Start Deep Code Scan'}
            </button>
          </div>
          {error && (
            <div className="bg-red-50 dark:bg-red-900/40 border border-red-200 dark:border-red-700 rounded-2xl px-4 py-3 text-red-600 dark:text-red-300 text-sm">⚠️ {error}</div>
          )}
          {scanResults && <CodeScanResults results={scanResults} onClose={() => setScanResults(null)} />}
        </div>
      )}

      {/* History Tab */}
      {tab === 'history' && (
        <div className="space-y-3">
          {history.length === 0 ? (
            <div className="text-center text-slate-500 py-12">
              <div className="text-4xl mb-3">📭</div>
              <div>No AI edits or scans yet</div>
              <div className="text-sm text-slate-400 mt-1">Use the Editor or Scanner tabs to get started</div>
            </div>
          ) : history.map((item: any, i: number) => (
            <div key={i} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{item.type === 'ai_edit' ? '✏️' : '🔍'}</span>
                  <span className="text-xs text-slate-400 uppercase font-bold">{item.type === 'ai_edit' ? 'AI Edit' : 'Code Scan'}</span>
                </div>
                <span className="text-xs text-slate-400">{new Date(item.timestamp).toLocaleString()}</span>
              </div>
              {item.type === 'ai_edit' && (
                <>
                  <div className="text-slate-900 dark:text-white text-sm mb-1">"{item.instruction}"</div>
                  {item.explanation && <div className="text-slate-400 text-xs mb-2">{item.explanation}</div>}
                  {item.appliedFiles?.length > 0 && (
                    <div className="text-xs text-slate-500 mb-2">Changed: {item.appliedFiles.map((f: any) => f.file).join(', ')}</div>
                  )}
                  {item.prUrl && (
                    <a href={item.prUrl} target="_blank" rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-400 text-xs underline">🔗 View PR</a>
                  )}
                </>
              )}
              {item.type === 'code_scan' && item.codeAnalysis && (
                <div className="flex gap-3 text-sm">
                  <span className="text-red-400">{item.codeAnalysis.errors?.length || 0} errors</span>
                  <span className="text-amber-400">{item.codeAnalysis.warnings?.length || 0} warnings</span>
                  <span className="text-blue-400">{item.codeAnalysis.infos?.length || 0} info</span>
                  <span className="text-slate-500">({item.codeAnalysis.scannedFiles || 0} files)</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Settings Panel (Full — with dynamic OpenRouter model fetching)
// ─────────────────────────────────────────────────────────────
function SettingsPanel({ onSave }: { onSave: () => void }) {
  const [openRouterKey, setOpenRouterKey] = useState('');
  const [monitorApiKey, setMonitorApiKey] = useState('');
  const [githubToken, setGithubToken] = useState('');
  const [saved, setSaved] = useState(false);
  const [showOrKey, setShowOrKey] = useState(false);
  const [showMonKey, setShowMonKey] = useState(false);
  const [models, setModels] = useState<{ free: any[]; paid: any[] }>({ free: [], paid: [] });
  const [modelsLoading, setModelsLoading] = useState(false);
  const [modelsError, setModelsError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState('');
  const [modelTab, setModelTab] = useState('free');
  const [modelSearch, setModelSearch] = useState('');
  const [keyValidated, setKeyValidated] = useState(false);

  useEffect(() => {
    const k = getUserKeys();
    setOpenRouterKey(k.openRouterKey);
    setMonitorApiKey(k.monitorApiKey);
    setGithubToken(k.githubToken);
    setSelectedModel(k.selectedModel);
    if (k.openRouterKey) fetchModels(k.openRouterKey, k.selectedModel);
  }, []);

  const fetchModels = useCallback(async (key: string, currentModel = '') => {
    if (!key || key.length < 10) return;
    setModelsLoading(true); setModelsError(null); setKeyValidated(false);
    try {
      const res = await fetch(`${OPENROUTER_API}/models`, {
        headers: { Authorization: `Bearer ${key}` }
      });
      if (!res.ok) {
        if (res.status === 401) throw new Error('Invalid API key — please check and try again');
        throw new Error(`OpenRouter error: ${res.status}`);
      }
      const data = await res.json();
      const allModels = data.data || [];
      const free = allModels
        .filter((m: any) => m.id.endsWith(':free') || (m.pricing && parseFloat(m.pricing.prompt) === 0))
        .map((m: any) => ({ id: m.id, name: m.name || m.id, context: m.context_length || 0 }))
        .sort((a: any, b: any) => a.name.localeCompare(b.name));
      const paid = allModels
        .filter((m: any) => !m.id.endsWith(':free') && !(m.pricing && parseFloat(m.pricing.prompt) === 0))
        .map((m: any) => ({ id: m.id, name: m.name || m.id, context: m.context_length || 0, promptPrice: m.pricing?.prompt ? `$${(parseFloat(m.pricing.prompt) * 1000000).toFixed(2)}/M` : '' }))
        .sort((a: any, b: any) => a.name.localeCompare(b.name));
      setModels({ free: free.length > 0 ? free : FALLBACK_FREE_MODELS, paid });
      setKeyValidated(true);
      if (!currentModel && free.length > 0) setSelectedModel(free[0].id);
    } catch (err: any) {
      setModelsError(err.message);
      setModels({ free: FALLBACK_FREE_MODELS, paid: [] });
    } finally { setModelsLoading(false); }
  }, []);

  const handleSave = () => {
    localStorage.setItem('sg_openrouter_api_key', openRouterKey.trim());
    localStorage.setItem('sg_monitor_api_key', monitorApiKey.trim());
    localStorage.setItem('sg_openrouter_model', selectedModel);
    localStorage.setItem('sg_github_token', githubToken.trim());
    setSaved(true);
    setTimeout(() => { setSaved(false); onSave(); }, 1000);
  };

  const handleClear = () => {
    ['sg_openrouter_api_key', 'sg_monitor_api_key', 'sg_openrouter_model', 'sg_github_token'].forEach(k => localStorage.removeItem(k));
    setOpenRouterKey(''); setMonitorApiKey(''); setSelectedModel(''); setGithubToken('');
    setModels({ free: [], paid: [] }); setKeyValidated(false);
  };

  const displayedModels = modelTab === 'free' ? models.free : models.paid;
  const filteredModels = displayedModels.filter(m =>
    m.name.toLowerCase().includes(modelSearch.toLowerCase()) ||
    m.id.toLowerCase().includes(modelSearch.toLowerCase())
  );

  const inputClass = "w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm dark:text-white font-mono";

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-1">⚙️ Settings</h2>
        <p className="text-slate-400 text-sm">आपकी API keys सिर्फ browser में store होती हैं — server पर कभी नहीं।</p>
      </div>

      {/* OpenRouter Key */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6">
        <h3 className="text-base font-black text-slate-900 dark:text-white mb-1 flex items-center gap-2">
          🤖 OpenRouter API Key
          {keyValidated && <span className="text-xs font-normal text-green-500 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full">✅ Verified</span>}
        </h3>
        <p className="text-slate-400 text-sm mb-4">AI analysis के लिए। Free key:{' '}
          <a href="https://openrouter.ai" target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">openrouter.ai</a>
        </p>
        <div className="relative">
          <input type={showOrKey ? 'text' : 'password'} value={openRouterKey}
            onChange={e => setOpenRouterKey(e.target.value)}
            onBlur={() => openRouterKey.trim().length > 10 && fetchModels(openRouterKey.trim(), selectedModel)}
            className={inputClass + ' pr-24'} placeholder="sk-or-v1-..." autoComplete="off" />
          <button type="button" onClick={() => setShowOrKey(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-xs px-2">
            {showOrKey ? '🙈 Hide' : '👁 Show'}
          </button>
        </div>
        <div className="flex items-center gap-3 mt-2">
          {openRouterKey ? <p className="text-green-500 text-xs">✅ {openRouterKey.length} chars</p>
            : <p className="text-amber-500 text-xs">⚠️ Key के बिना AI basic mode में चलेगा</p>}
          {openRouterKey && !modelsLoading && !keyValidated && (
            <button onClick={() => fetchModels(openRouterKey.trim(), selectedModel)} className="text-xs text-blue-500 hover:underline">Verify & Fetch Models</button>
          )}
        </div>
      </div>

      {/* Dynamic Model Selector */}
      {openRouterKey && (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6">
          <h3 className="text-base font-black text-slate-900 dark:text-white mb-1 flex items-center gap-2">
            🧠 AI Model चुनें
            {modelsLoading && <Loader2 className="w-4 h-4 animate-spin text-blue-500" />}
          </h3>
          <p className="text-slate-400 text-sm mb-4">कौन सा model AI fixes और analysis के लिए use करे।</p>
          {modelsError && (
            <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-xl text-red-600 dark:text-red-300 text-xs">⚠️ {modelsError} — Default free models दिखाए जा रहे हैं।</div>
          )}
          <div className="flex gap-1 mb-3 bg-slate-100 dark:bg-slate-800 rounded-xl p-1 w-fit">
            {['free', 'paid'].map(tab => (
              <button key={tab} onClick={() => setModelTab(tab)}
                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-colors ${modelTab === tab ? (tab === 'free' ? 'bg-green-600 text-white' : 'bg-blue-600 text-white') : 'text-slate-400 hover:text-slate-700 dark:hover:text-white'}`}>
                {tab === 'free' ? `🆓 Free (${models.free.length})` : `💳 Paid (${models.paid.length})`}
              </button>
            ))}
          </div>
          <input type="text" value={modelSearch} onChange={e => setModelSearch(e.target.value)}
            placeholder="Model search करें..."
            className="w-full px-3 py-2 mb-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:text-white" />
          <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
            {modelsLoading ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                <Loader2 className="w-5 h-5 animate-spin inline mr-2" /> Models fetch हो रहे हैं...
              </div>
            ) : filteredModels.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-sm">कोई model नहीं मिला</div>
            ) : filteredModels.map(model => (
              <button key={model.id} onClick={() => setSelectedModel(model.id)}
                className={`w-full text-left px-3 py-2.5 rounded-xl border transition-colors ${selectedModel === model.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-slate-900 dark:text-white' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'}`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm truncate mr-2">{model.name}</span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {modelTab === 'free' && <span className="text-xs bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 px-1.5 py-0.5 rounded-full">Free</span>}
                    {modelTab === 'paid' && model.promptPrice && <span className="text-xs bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded-full">{model.promptPrice}</span>}
                    {model.context > 0 && <span className="text-xs text-slate-400">{(model.context / 1000).toFixed(0)}K</span>}
                    {selectedModel === model.id && <CheckCircle className="w-3.5 h-3.5 text-blue-500" />}
                  </div>
                </div>
                <div className="text-xs text-slate-400 font-mono mt-0.5 truncate">{model.id}</div>
              </button>
            ))}
          </div>
          {selectedModel && (
            <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl text-xs text-blue-600 dark:text-blue-300">
              ✅ Selected: <span className="font-mono">{selectedModel}</span>
            </div>
          )}
        </div>
      )}

      {/* Monitor API Key */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6">
        <h3 className="text-base font-black text-slate-900 dark:text-white mb-1">🔑 Monitor API Key</h3>
        <p className="text-slate-400 text-sm mb-4">Write operations protect करता है। कोई भी random string — यही app password है।</p>
        <div className="relative">
          <input type={showMonKey ? 'text' : 'password'} value={monitorApiKey}
            onChange={e => setMonitorApiKey(e.target.value)}
            className={inputClass + ' pr-24'} placeholder="my-secret-password-123" autoComplete="off" />
          <button type="button" onClick={() => setShowMonKey(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-xs px-2">
            {showMonKey ? '🙈 Hide' : '👁 Show'}
          </button>
        </div>
        <button type="button" onClick={() => setMonitorApiKey(Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2))}
          className="mt-2 text-xs text-blue-500 hover:text-blue-400">Generate random key</button>
        {monitorApiKey ? <p className="text-green-500 text-xs mt-2">✅ Key saved ({monitorApiKey.length} chars)</p>
          : <p className="text-red-500 text-xs mt-2">⚠️ Required — इसके बिना websites add/scan नहीं होंगी</p>}
      </div>

      {/* GitHub Token */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6">
        <h3 className="text-base font-black text-slate-900 dark:text-white mb-1">
          GitHub Token <span className="text-slate-400 font-normal text-sm">(for code scanning & auto-fix)</span>
        </h3>
        <input type="password" value={githubToken} onChange={e => setGithubToken(e.target.value)}
          className={inputClass} placeholder="ghp_..." />
        <p className="text-xs text-slate-400 mt-2">Code scanning और auto-fix PR create करने के लिए जरूरी है।</p>
      </div>

      <div className="flex gap-3">
        <button onClick={handleSave}
          className={`flex-1 py-3 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 ${saved ? 'bg-emerald-500 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
          {saved ? <><CheckCircle className="w-4 h-4" /> Saved!</> : <><Save className="w-4 h-4" /> Save Settings</>}
        </button>
        {(openRouterKey || monitorApiKey) && (
          <button onClick={handleClear}
            className="px-6 py-3 bg-red-50 dark:bg-red-900/50 hover:bg-red-100 dark:hover:bg-red-900 border border-red-200 dark:border-red-700 rounded-2xl text-red-600 dark:text-red-300 transition-colors text-sm font-bold">
            Clear All
          </button>
        )}
      </div>
      <p className="text-slate-400 text-xs text-center">Keys browser के localStorage में हैं — refresh पर रहेंगे।</p>
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
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">GitHub Token <span className="font-normal normal-case">(optional)</span></label>
            <input type="password" className={inputClass} placeholder="ghp_... (leave blank to use saved token)" value={form.githubToken} onChange={e => setForm(f => ({ ...f, githubToken: e.target.value }))} />
          </div>
        </div>
        {error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400">{error}</div>
        )}
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            Cancel
          </button>
          <button onClick={submit} disabled={loading}
            className="flex-1 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-black transition-colors flex items-center justify-center gap-2">
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
  website, scanning, onSelect, onScan, onDelete, onOpenEditor
}: {
  website: any; scanning: boolean;
  onSelect: (w: any) => void; onScan: (id: string) => void;
  onDelete: (id: string) => void; onOpenEditor: (w: any) => void;
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
          <Clock className="w-3 h-3" /> Last scan: {new Date(website.lastScan).toLocaleString()}
        </div>
      )}

      {/* Lighthouse scores if available */}
      {website.lastScanScores && (
        <div className="grid grid-cols-4 gap-2">
          {Object.entries(website.lastScanScores).map(([k, v]: [string, any]) => (
            <div key={k} className="text-center bg-slate-50 dark:bg-slate-800 rounded-xl p-2">
              <div className={`text-sm font-black ${Number(v) >= 80 ? 'text-emerald-500' : Number(v) >= 50 ? 'text-amber-500' : 'text-red-500'}`}>{Math.round(v)}</div>
              <div className="text-xs text-slate-400 capitalize">{k.replace(/([A-Z])/g, ' $1').trim().split(' ')[0]}</div>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2 pt-2 border-t border-slate-50 dark:border-slate-800">
        <button onClick={() => onSelect(website)}
          className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-all">
          <Eye className="w-3.5 h-3.5" /> View
        </button>
        <button onClick={() => onOpenEditor(website)}
          className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 text-xs font-bold text-purple-600 dark:text-purple-400 transition-all">
          <Code className="w-3.5 h-3.5" /> Edit
        </button>
        <button onClick={() => onScan(website.id)} disabled={scanning}
          className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-xs font-black text-white transition-colors">
          {scanning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
          {scanning ? 'Scanning' : 'Scan'}
        </button>
        <button onClick={() => { if (confirm('Delete this website?')) onDelete(website.id); }}
          className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 flex items-center justify-center text-red-500 transition-colors">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Scan Results View (updated with lighthouse scores, errors/warnings)
// ─────────────────────────────────────────────────────────────
function ScanResultsView({ website, onBack, onOpenFix, onOpenEditor }: {
  website: any; onBack: () => void;
  onOpenFix: (scan: any) => void;
  onOpenEditor: (w: any) => void;
}) {
  const [scans, setScans] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchScans = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const data = await apiFetch(`/api/scans/${website.id}`);
      setScans(data);
      if (data.length > 0) setSelected(data[0]);
    } catch (e: any) {
      setError(e.message);
    } finally { setLoading(false); }
  }, [website.id]);

  useEffect(() => { fetchScans(); }, [fetchScans]);

  const scoreColor = (v: number) => v >= 80 ? 'text-emerald-400' : v >= 50 ? 'text-amber-400' : 'text-red-400';
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
        <div className="ml-auto flex items-center gap-2">
          <StatusBadge status={website.status} />
          <button onClick={() => onOpenEditor(website)}
            className="flex items-center gap-2 px-3 py-2 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 text-purple-600 dark:text-purple-400 rounded-xl text-xs font-bold transition-colors">
            <Code className="w-3.5 h-3.5" /> AI Editor
          </button>
          <button onClick={fetchScans}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500 transition-colors" title="Refresh">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
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

      {/* Latest Scan Summary */}
      {scans[0] && (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-black text-slate-900 dark:text-white">Latest Scan</h3>
            <span className="text-xs text-slate-400">{new Date(scans[0].timestamp || scans[0].createdAt).toLocaleString()}</span>
          </div>

          {/* Lighthouse Scores */}
          {scans[0].lighthouse?.scores && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {Object.entries(scans[0].lighthouse.scores).map(([k, v]: [string, any]) => (
                <div key={k} className="text-center bg-slate-50 dark:bg-slate-800 rounded-2xl p-3">
                  <div className={`text-2xl font-black ${scoreColor(Number(v))}`}>{Math.round(v)}</div>
                  <div className="text-xs text-slate-400 mt-1 capitalize">{k.replace(/([A-Z])/g, ' $1').trim()}</div>
                </div>
              ))}
            </div>
          )}

          {/* Errors */}
          {scans[0].errors?.length > 0 && (
            <div className="mb-4">
              <div className="text-red-500 font-bold mb-2 text-sm">{scans[0].errors.length} Error{scans[0].errors.length !== 1 ? 's' : ''}</div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {scans[0].errors.map((err: any, i: number) => (
                  <div key={i} className="bg-red-50 dark:bg-red-900/20 p-3 rounded-xl text-sm">
                    <span className="font-bold text-red-500">{err.type}:</span>{' '}
                    <span className="text-slate-700 dark:text-slate-300">{err.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Warnings */}
          {scans[0].warnings?.length > 0 && (
            <div>
              <div className="text-amber-500 font-bold mb-2 text-sm">{scans[0].warnings.length} Warning{scans[0].warnings.length !== 1 ? 's' : ''}</div>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {scans[0].warnings.slice(0, 5).map((w: any, i: number) => (
                  <div key={i} className="text-sm text-amber-600 dark:text-amber-300">• {w.message}</div>
                ))}
                {scans[0].warnings.length > 5 && (
                  <div className="text-xs text-slate-400">+{scans[0].warnings.length - 5} more warnings</div>
                )}
              </div>
            </div>
          )}

          {scans[0].aiAnalysis && (
            <button onClick={() => onOpenFix(scans[0])}
              className="mt-4 w-full py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-sm font-black transition-all flex items-center justify-center gap-2">
              🤖 View AI Analysis & Fix →
            </button>
          )}
        </div>
      )}

      {/* Scan History */}
      {selected && (
        <div className="space-y-4">
          {scans.length > 1 && (
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white mb-3">Scan History</h3>
              <div className="space-y-3">
                {scans.map((scan: any) => (
                  <div key={scan.id}
                    className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 hover:border-blue-300 cursor-pointer transition-colors"
                    onClick={() => setSelected(scan)}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-400">{new Date(scan.timestamp || scan.createdAt).toLocaleString()}</span>
                      <div className="flex items-center gap-2">
                        {scan.errors?.length > 0 && <span className="px-2 py-1 bg-red-100 dark:bg-red-900/50 text-red-500 text-xs rounded-full">{scan.errors.length} errors</span>}
                        {scan.warnings?.length > 0 && <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/50 text-amber-500 text-xs rounded-full">{scan.warnings.length} warnings</span>}
                        {scan.fixed && <span className="px-2 py-1 bg-green-100 dark:bg-green-900/50 text-green-500 text-xs rounded-full">Fixed ✓</span>}
                        {scan.issues?.length > 0 && <span className="px-2 py-1 bg-red-100 dark:bg-red-900/50 text-red-500 text-xs rounded-full">{scan.issues.length} issues</span>}
                      </div>
                    </div>
                    {scan.aiAnalysis?.summary && (
                      <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">{scan.aiAnalysis.summary}</p>
                    )}
                    <div className="mt-2 text-xs text-blue-500">Click to view AI analysis →</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Classic issues view (for older scan format) */}
          {selected.issues && (
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
          )}

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
type View = 'dashboard' | 'settings' | 'results' | 'fix' | 'editor';

export default function SiteGuardPage() {
  const [view, setView] = useState<View>('dashboard');
  const [websites, setWebsites] = useState<any[]>([]);
  const [scanningIds, setScanningIds] = useState<Set<string>>(new Set());
  const [selectedWebsite, setSelectedWebsite] = useState<any>(null);
  const [selectedScan, setSelectedScan] = useState<any>(null);
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

  async function scanAll() {
    setLoading(true); setError('');
    try {
      await apiFetch('/api/scans/all', { method: 'POST' });
      await fetchWebsites();
    } catch (e: any) {
      setError(e.message);
    } finally { setLoading(false); }
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
            <button onClick={() => setView('settings')}
              className={`p-2 rounded-xl transition-colors ${view === 'settings' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
              title="Settings">
              <Settings className="w-5 h-5" />
            </button>
            {view === 'dashboard' && hasKeys && (
              <>
                <button onClick={scanAll} disabled={loading}
                  className="px-3 py-2 rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-xs font-black transition-colors flex items-center gap-1.5">
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                  Scan All
                </button>
                <button onClick={fetchWebsites} disabled={loading}
                  className="p-2 rounded-xl text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50" title="Refresh">
                  <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
                <button onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-black rounded-xl transition-colors">
                  <Plus className="w-4 h-4" /> Add Site
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-4></div>
