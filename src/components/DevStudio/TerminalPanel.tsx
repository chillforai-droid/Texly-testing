/**
 * TerminalPanel.tsx
 * ─────────────────────────────────────────────
 * Terminal panel for DevStudio right panel
 * Real execution via WebSocket → Render backend
 * 
 * FIXED: URL input section तभी दिखे जब env URL नहीं है
 *        या connection fail/disconnect हो और env URL भी नहीं है
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';

interface TerminalPanelProps {
  log: string[];
  onCommand: (cmd: string) => void;
}

// Env से URL लो — Vercel में VITE_DEVSTUDIO_WS_URL set करो
const ENV_WS_URL = (import.meta.env.VITE_DEVSTUDIO_WS_URL as string) || '';

const QUICK_CMDS = [
  'npm run dev', 'npm install', 'npm run build',
  'git status', 'git log --oneline -5', 'ls -la', 'pwd', 'clear',
];

type ConnStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export function TerminalPanel({ log, onCommand }: TerminalPanelProps) {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);

  const [wsUrl, setWsUrl] = useState(ENV_WS_URL);
  const [connStatus, setConnStatus] = useState<ConnStatus>('disconnected');
  const [wsOutput, setWsOutput] = useState<string[]>([]);
  const [sessionId, setSessionId] = useState('');
  const [autoConnected, setAutoConnected] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const pingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [log, wsOutput]);

  useEffect(() => {
    return () => {
      wsRef.current?.close();
      if (pingRef.current) clearInterval(pingRef.current);
    };
  }, []);

  const connectWs = useCallback((url?: string) => {
    const target = (url ?? wsUrl).trim();
    if (!target) return;

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.close();
    }

    setConnStatus('connecting');
    setWsOutput((p) => [...p, `[Connecting to ${target}...]`]);

    try {
      const ws = new WebSocket(target);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnStatus('connected');
        setWsOutput((p) => [...p, '[Connected ✓]']);
        pingRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }));
          }
        }, 25000);
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'connected') {
            setSessionId(msg.sessionId || '');
            setWsOutput((p) => [...p, msg.message || 'Terminal ready']);
          } else if (msg.type === 'output') {
            const lines = msg.data.split(/\r?\n/).filter((l: string) => l.length > 0);
            setWsOutput((p) => [...p, ...lines]);
          } else if (msg.type === 'error') {
            setWsOutput((p) => [...p, `[Error] ${msg.message}`]);
          }
        } catch {
          setWsOutput((p) => [...p, event.data]);
        }
      };

      ws.onerror = () => {
        setConnStatus('error');
        setWsOutput((p) => [...p, '[Connection Error — URL check करें]']);
      };

      ws.onclose = () => {
        setConnStatus('disconnected');
        setWsOutput((p) => [...p, '[Disconnected]']);
        if (pingRef.current) clearInterval(pingRef.current);
      };
    } catch (err: any) {
      setConnStatus('error');
      setWsOutput((p) => [...p, `[Failed: ${err.message}]`]);
    }
  }, [wsUrl]);

  // Auto-connect जब env URL मिले
  useEffect(() => {
    if (ENV_WS_URL && !autoConnected) {
      setAutoConnected(true);
      const t = setTimeout(() => connectWs(ENV_WS_URL), 800);
      return () => clearTimeout(t);
    }
  }, [autoConnected, connectWs]);

  const disconnectWs = useCallback(() => {
    wsRef.current?.close();
    if (pingRef.current) clearInterval(pingRef.current);
  }, []);

  const run = (cmd?: string) => {
    const c = (cmd ?? input).trim();
    if (!c) return;
    setHistory((h) => [c, ...h.slice(0, 49)]);
    setHistIdx(-1);
    setInput('');

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'input', data: c + '\n' }));
    } else {
      onCommand(c);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { run(); return; }
    if (e.key === 'ArrowUp') {
      const idx = Math.min(histIdx + 1, history.length - 1);
      setHistIdx(idx);
      setInput(history[idx] ?? '');
    }
    if (e.key === 'ArrowDown') {
      const idx = Math.max(histIdx - 1, -1);
      setHistIdx(idx);
      setInput(idx === -1 ? '' : history[idx] ?? '');
    }
    if (e.ctrlKey && e.key === 'c') {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'input', data: '\x03' }));
      }
    }
  };

  const stripAnsi = (s: string) => s.replace(/\x1b\[[0-9;]*[a-zA-Z]/g, '');

  const getLineColor = (line: string) => {
    if (line.includes('✓') || line.includes('Connected') || line.includes('ready')) return '#6ee7b7';
    if (line.includes('Error') || line.includes('error') || line.includes('❌') || line.includes('Failed')) return '#f87171';
    if (line.includes('⚠') || line.includes('warn') || line.includes('Connecting')) return '#fbbf24';
    if (line.startsWith('[') && line.endsWith(']')) return '#67e8f9';
    if (line.trimStart().startsWith('$')) return '#4ec9b0';
    return '#9ca3af';
  };

  const statusColor: Record<ConnStatus, string> = {
    disconnected: '#555', connecting: '#fbbf24', connected: '#6ee7b7', error: '#f87171',
  };

  const displayLines = wsOutput.length > 0 ? wsOutput : log;

  // ── FIXED: URL section सिर्फ तब दिखे जब env URL नहीं है ──────────────────
  // अगर env URL है तो connect bar बिल्कुल नहीं दिखेगा (auto-connect होगा)
  // अगर env URL नहीं है और error/disconnect है तो manual connect bar दिखेगा
  const showConnectBar = !ENV_WS_URL;

  return (
    <div className="flex flex-col h-full bg-[#0c0c0c]">

      {/* Connect Bar — सिर्फ तब दिखे जब env में URL नहीं है */}
      {showConnectBar && (
        <div className="p-2 border-b border-[#1e1e1e] bg-[#111] space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[9px] text-[#555] uppercase tracking-wider font-semibold">Render Backend</span>
            <span className="text-[9px] font-mono" style={{ color: statusColor[connStatus] }}>
              ● {connStatus}
            </span>
          </div>
          <div className="flex gap-1">
            <input
              type="text"
              value={wsUrl}
              onChange={(e) => setWsUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && connectWs()}
              placeholder="wss://your-app.onrender.com/terminal"
              className="flex-1 bg-[#1e1e1e] text-[#ccc] text-[10px] px-2 py-1 rounded border border-[#2a2a2a] outline-none focus:border-[#007acc] placeholder-[#3a3a3a] font-mono"
            />
            <button
              onClick={() => connectWs()}
              disabled={connStatus === 'connecting' || !wsUrl.trim()}
              className="px-2.5 py-1 bg-[#0e639c] hover:bg-[#1177bb] disabled:opacity-40 text-white text-[10px] rounded transition-colors flex-shrink-0"
              style={{ minHeight: 'unset', minWidth: 'unset' }}
            >
              {connStatus === 'connecting' ? '⟳' : 'Connect'}
            </button>
          </div>
          <p className="text-[9px] text-[#333]">
            💡 Vercel में VITE_DEVSTUDIO_WS_URL set करें — फिर auto-connect होगा
          </p>
        </div>
      )}

      {/* Connected status pill */}
      {connStatus === 'connected' && (
        <div className="flex items-center justify-between px-3 py-1.5 bg-[#0a1a0a] border-b border-[#1a2a1a]">
          <span className="text-[9px] text-[#6ee7b7] font-mono">
            ● Connected{sessionId ? ` · #${sessionId}` : ''} · {(wsUrl || ENV_WS_URL).replace('wss://', '').split('/')[0]}
          </span>
          <button
            onClick={disconnectWs}
            className="text-[9px] text-[#333] hover:text-[#f87171] transition-colors"
            style={{ minHeight: 'unset', minWidth: 'unset' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Connecting indicator */}
      {connStatus === 'connecting' && (
        <div className="px-3 py-1.5 bg-[#111] border-b border-[#1e1e1e]">
          <span className="text-[9px] text-[#fbbf24] font-mono animate-pulse">◌ Connecting...</span>
        </div>
      )}

      {/* Connection error — env URL है पर connect नहीं हुआ */}
      {ENV_WS_URL && connStatus === 'error' && (
        <div className="flex items-center justify-between px-3 py-1.5 bg-[#1a0a0a] border-b border-[#2a1a1a]">
          <span className="text-[9px] text-[#f87171] font-mono">● Connection failed</span>
          <button
            onClick={() => connectWs(ENV_WS_URL)}
            className="text-[9px] px-2 py-0.5 bg-[#3c3c3c] hover:bg-[#4c4c4c] text-[#ccc] rounded transition-colors"
            style={{ minHeight: 'unset', minWidth: 'unset' }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Env URL disconnected — retry button */}
      {ENV_WS_URL && connStatus === 'disconnected' && autoConnected && (
        <div className="flex items-center justify-between px-3 py-1.5 bg-[#111] border-b border-[#1e1e1e]">
          <span className="text-[9px] text-[#555] font-mono">● Disconnected</span>
          <button
            onClick={() => connectWs(ENV_WS_URL)}
            className="text-[9px] px-2 py-0.5 bg-[#3c3c3c] hover:bg-[#4c4c4c] text-[#ccc] rounded transition-colors"
            style={{ minHeight: 'unset', minWidth: 'unset' }}
          >
            Reconnect
          </button>
        </div>
      )}

      {/* Quick Commands */}
      <div className="flex flex-wrap gap-1 p-2 border-b border-[#1a1a1a]">
        {QUICK_CMDS.map((cmd) => (
          <button
            key={cmd}
            onClick={() => run(cmd)}
            className="px-1.5 py-0.5 text-[9px] bg-[#1e1e1e] hover:bg-[#2a2a2a] text-[#4ec9b0] border border-[#2a2a2a] rounded transition-colors font-mono"
            style={{ minHeight: 'unset', minWidth: 'unset' }}
          >
            {cmd}
          </button>
        ))}
      </div>

      {/* Output */}
      <div className="flex-1 overflow-y-auto p-3 font-mono text-[11px] leading-5">
        {displayLines.length === 0 ? (
          <div className="text-[#2a2a2a] text-center py-8">
            {ENV_WS_URL ? 'Backend से connect हो रहा है...' : 'Backend connect करें और commands run करें'}
          </div>
        ) : (
          displayLines.map((line, i) => (
            <div key={i} className="whitespace-pre-wrap break-all" style={{ color: getLineColor(stripAnsi(line)) }}>
              {stripAnsi(line)}
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 px-3 py-2 border-t border-[#1a1a1a] bg-[#111]">
        <span className="text-[#4ec9b0] text-[11px] font-mono flex-shrink-0">$</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder={connStatus === 'connected' ? 'command enter करें... (↑↓ history, Ctrl+C)' : 'Backend connect करें...'}
          className="flex-1 bg-transparent text-[#ccc] text-[11px] font-mono outline-none placeholder-[#333]"
          spellCheck={false}
          autoComplete="off"
        />
        <button
          onClick={() => run()}
          className="text-[#4ec9b0] text-[11px] hover:text-white transition-colors"
          style={{ minHeight: 'unset', minWidth: 'unset' }}
        >
          ↵
        </button>
      </div>
    </div>
  );
}
