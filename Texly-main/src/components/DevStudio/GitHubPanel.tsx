/**
 * GitHubPanel.tsx
 * ─────────────────────────────────────────────
 * GitHub integration panel:
 *  - Token + Repo URL input
 *  - Browse repository files
 *  - Commit message + Push
 *  - View changed files
 */

import React, { useState } from 'react';

interface GitHubPanelProps {
  token: string;
  repo: string;
  branch: string;
  onTokenChange: (v: string) => void;
  onRepoChange: (v: string) => void;
  onBranchChange: (v: string) => void;
  onPush: (message: string) => void;
  changes: string[];
  allFiles: Record<string, string>;
  onFileClick: (path: string) => void;
}

export function GitHubPanel({
  token, repo, branch, onTokenChange, onRepoChange, onBranchChange,
  onPush, changes, allFiles, onFileClick,
}: GitHubPanelProps) {
  const [commitMsg, setCommitMsg] = useState('');
  const [pushing, setPushing] = useState(false);
  const [tab, setTab] = useState<'push' | 'browse'>('push');
  const [ghFiles, setGhFiles] = useState<{ name: string; path: string; type: string }[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [showToken, setShowToken] = useState(false);

  const handlePush = async () => {
    if (!commitMsg.trim()) return;
    setPushing(true);
    await onPush(commitMsg.trim());
    setPushing(false);
    setCommitMsg('');
  };

  const browseRepo = async () => {
    if (!token || !repo) return;
    setLoadingFiles(true);
    try {
      const match = repo.match(/github\.com\/([^/]+)\/([^/]+)/);
      if (!match) { setLoadingFiles(false); return; }
      const [, owner, repoName] = match;
      const clean = repoName.replace('.git', '');
      const res = await fetch(
        `https://api.github.com/repos/${owner}/${clean}/contents`,
        { headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github.v3+json' } }
      );
      const data = await res.json();
      if (Array.isArray(data)) {
        setGhFiles(data.map((f: any) => ({ name: f.name, path: f.path, type: f.type })));
        setTab('browse');
      }
    } catch {}
    setLoadingFiles(false);
  };

  return (
    <div className="flex flex-col h-full text-[12px]">
      {/* Token & Repo inputs */}
      <div className="p-3 border-b border-[#3c3c3c] space-y-2">
        <div>
          <label className="text-[10px] text-[#888] uppercase tracking-wider block mb-1">GitHub Token</label>
          <div className="flex gap-1">
            <input
              type={showToken ? 'text' : 'password'}
              value={token}
              onChange={(e) => onTokenChange(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxx"
              className="flex-1 bg-[#3c3c3c] text-[#ccc] text-[11px] px-2 py-1.5 rounded border border-[#555] outline-none focus:border-[#007acc] placeholder-[#555] font-mono"
            />
            <button
              onClick={() => setShowToken(!showToken)}
              className="px-2 text-[#666] hover:text-[#ccc] text-[11px]"
              style={{ minHeight: 'unset', minWidth: 'unset' }}
            >
              {showToken ? '🙈' : '👁'}
            </button>
          </div>
        </div>
        <div>
          <label className="text-[10px] text-[#888] uppercase tracking-wider block mb-1">Repository URL</label>
          <input
            type="text"
            value={repo}
            onChange={(e) => onRepoChange(e.target.value)}
            placeholder="https://github.com/user/repo"
            className="w-full bg-[#3c3c3c] text-[#ccc] text-[11px] px-2 py-1.5 rounded border border-[#555] outline-none focus:border-[#007acc] placeholder-[#555]"
          />
        </div>
        <div className="flex gap-1">
          <div className="flex-1">
            <label className="text-[10px] text-[#888] uppercase tracking-wider block mb-1">Branch</label>
            <input
              type="text"
              value={branch}
              onChange={(e) => onBranchChange(e.target.value)}
              className="w-full bg-[#3c3c3c] text-[#ccc] text-[11px] px-2 py-1.5 rounded border border-[#555] outline-none focus:border-[#007acc]"
            />
          </div>
          <button
            onClick={browseRepo}
            disabled={!token || !repo || loadingFiles}
            className="self-end px-3 py-1.5 bg-[#3c3c3c] hover:bg-[#4c4c4c] disabled:opacity-40 text-[#ccc] text-[11px] rounded border border-[#555] transition-colors"
            style={{ minHeight: 'unset', minWidth: 'unset' }}
          >
            {loadingFiles ? '⟳' : '⎇ Browse'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#3c3c3c]">
        {(['push', 'browse'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-1.5 text-[10px] transition-colors ${
              tab === t ? 'text-[#ccc] border-b-2 border-[#007acc] bg-[#1e1e1e]' : 'text-[#666] hover:text-[#999]'
            }`}
            style={{ minHeight: 'unset', minWidth: 'unset' }}
          >
            {t === 'push' ? `⬆ Push (${changes.length})` : '📂 Browse Repo'}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {tab === 'push' && (
          <div className="p-3 space-y-3">
            {/* Changed files */}
            {changes.length > 0 ? (
              <div>
                <p className="text-[10px] text-[#888] uppercase tracking-wider mb-1">Changed Files</p>
                {changes.map((path) => (
                  <div
                    key={path}
                    onClick={() => onFileClick(path)}
                    className="flex items-center gap-1.5 py-1 cursor-pointer hover:text-[#ccc] text-[#9ca3af] border-b border-[#3c3c3c]"
                  >
                    <span className="text-[10px] text-[#4ec9b0] font-semibold font-mono">M</span>
                    <span className="text-[11px] truncate">{path.split('/').pop()}</span>
                    <span className="text-[9px] text-[#555] ml-auto truncate">{path.split('/').slice(-2, -1)[0]}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[#555] text-center py-4 text-[11px]">No uncommitted changes</p>
            )}

            {/* Commit & Push */}
            <div>
              <label className="text-[10px] text-[#888] uppercase tracking-wider block mb-1">Commit Message</label>
              <textarea
                value={commitMsg}
                onChange={(e) => setCommitMsg(e.target.value)}
                placeholder="feat: my changes..."
                rows={2}
                className="w-full bg-[#3c3c3c] text-[#ccc] text-[11px] px-2 py-1.5 rounded border border-[#555] outline-none focus:border-[#007acc] placeholder-[#555] resize-none font-mono"
              />
            </div>
            <button
              onClick={handlePush}
              disabled={pushing || !commitMsg.trim() || !token || !repo}
              className="w-full py-2 bg-[#007acc] hover:bg-[#1a8ad4] disabled:bg-[#3c3c3c] disabled:text-[#555] text-white text-[12px] rounded transition-colors font-semibold"
              style={{ minHeight: 'unset', minWidth: 'unset' }}
            >
              {pushing ? '⟳ Pushing...' : `⬆ Push to ${branch}`}
            </button>
          </div>
        )}

        {tab === 'browse' && (
          <div className="p-2">
            {ghFiles.length === 0 ? (
              <p className="text-[#555] text-center py-4 text-[11px]">Token + Repo enter करके Browse करें</p>
            ) : (
              ghFiles.map((f) => (
                <div
                  key={f.path}
                  className="flex items-center gap-1.5 py-1 hover:bg-[#2a2d2e] px-1 rounded cursor-pointer"
                >
                  <span className="text-[11px]">{f.type === 'dir' ? '📁' : '📄'}</span>
                  <span className="text-[11px] text-[#ccc]">{f.name}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
