/**
 * DevStudioPage.tsx
 * ==================
 * Full VS Code-like IDE for Texly
 * Features:
 *  - Monaco Editor (syntax highlight, IntelliSense, multi-tab)
 *  - ZIP project upload & file tree
 *  - Live preview (iframe sandbox)
 *  - Integrated terminal (WebSocket → Render backend)
 *  - GitHub push (token + repo URL)
 *  - AI Modify (Groq API - Llama 3.3 70B, Free & Fast)
 *
 * Route: /devstudio
 * Add to App.tsx:
 *   const DevStudioPage = lazy(() => import('./components/DevStudio/DevStudioPage'));
 *   <Route path="/devstudio" element={<RouteErrorBoundary><DevStudioPage /></RouteErrorBoundary>} />
 */

import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  lazy,
  Suspense,
} from 'react';
import { Helmet } from 'react-helmet-async';
import JSZip from 'jszip';
import {
  FileTree,
  type FileNode,
} from './FileTree';
import { TerminalPanel } from './TerminalPanel';
import { GitHubPanel } from './GitHubPanel';
import { PreviewPanel } from './PreviewPanel';
import { AiBar } from './AiBar';
import { EditorTabs } from './EditorTabs';
import { StatusBar } from './StatusBar';

// ─── Monaco lazy load ────────────────────────────────────────────────────────
const MonacoEditor = lazy(() =>
  import('@monaco-editor/react').then((m) => ({ default: m.default }))
);

// ─── Groq Config ─────────────────────────────────────────────────────────────
// Free tier: console.groq.com पर sign up करें और API key लें
const GROQ_API_KEY = (import.meta.env.VITE_GROQ_API_KEY as string) || '';
const GROQ_MODEL = 'llama-3.3-70b-versatile'; // coding के लिए best free model

// ─── Types ───────────────────────────────────────────────────────────────────
export interface OpenTab {
  path: string;
  name: string;
  content: string;
  language: string;
  modified: boolean;
}

type RightPanel = 'preview' | 'terminal' | 'github' | 'info';
type SidebarTab = 'files' | 'search' | 'git';

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getLanguage(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  const map: Record<string, string> = {
    tsx: 'typescript', ts: 'typescript', jsx: 'javascript', js: 'javascript',
    css: 'css', scss: 'scss', html: 'html', json: 'json', md: 'markdown',
    py: 'python', sh: 'shell', yaml: 'yaml', yml: 'yaml', env: 'plaintext',
    txt: 'plaintext', sql: 'sql', toml: 'plaintext',
  };
  return map[ext] ?? 'plaintext';
}

function getFileIcon(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  const map: Record<string, string> = {
    tsx: '⚛', ts: '🔷', jsx: '⚛', js: '🟨', css: '🎨', scss: '🎨',
    html: '🌐', json: '📋', md: '📝', sql: '🗃', sh: '⚙', env: '🔑',
  };
  return map[ext] ?? '📄';
}

async function buildFileTree(zip: JSZip): Promise<{ nodes: FileNode[]; files: Record<string, string> }> {
  const files: Record<string, string> = {};
  const rootMap: Record<string, FileNode> = {};

  const promises: Promise<void>[] = [];

  zip.forEach((relativePath, zipEntry) => {
    if (zipEntry.dir) return;
    // Skip binary / image files
    const ext = relativePath.split('.').pop()?.toLowerCase() ?? '';
    const binaryExts = ['png', 'jpg', 'jpeg', 'gif', 'ico', 'webp', 'svg', 'woff', 'woff2', 'ttf', 'eot'];
    if (binaryExts.includes(ext)) return;

    promises.push(
      zipEntry.async('string').then((content) => {
        files[relativePath] = content;
        // Build tree structure
        const parts = relativePath.split('/');
        let current = rootMap;
        for (let i = 0; i < parts.length - 1; i++) {
          const part = parts[i];
          if (!current[part]) {
            current[part] = { name: part, path: parts.slice(0, i + 1).join('/'), type: 'folder', children: {} };
          }
          current = current[part].children as Record<string, FileNode>;
        }
        const fname = parts[parts.length - 1];
        current[fname] = { name: fname, path: relativePath, type: 'file', language: getLanguage(fname), icon: getFileIcon(fname) };
      })
    );
  });

  await Promise.all(promises);

  function mapToArray(obj: Record<string, FileNode>): FileNode[] {
    return Object.values(obj)
      .map((node) => ({
        ...node,
        children: node.type === 'folder' ? mapToArray(node.children as Record<string, FileNode>) : undefined,
      }))
      .sort((a, b) => {
        if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
  }

  return { nodes: mapToArray(rootMap), files };
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DevStudioPage() {
  // File state
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [allFiles, setAllFiles] = useState<Record<string, string>>({});
  const [openTabs, setOpenTabs] = useState<OpenTab[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [projectName, setProjectName] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // UI state
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('files');
  const [rightPanel, setRightPanel] = useState<RightPanel>('preview');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarWidth] = useState(220);
  const [rightWidth] = useState(280);
  const [isDragging, setIsDragging] = useState(false);
  const [terminalLog, setTerminalLog] = useState<string[]>(['$ Terminal ready. Connect a backend to execute commands.']);
  const [ghToken, setGhToken] = useState('');
  const [ghRepo, setGhRepo] = useState('');
  const [ghBranch, setGhBranch] = useState('main');
  const [gitChanges, setGitChanges] = useState<string[]>([]);

  // ─── Mobile responsiveness state ──────────────────────────────────────────
  const [isMobileScreen, setIsMobileScreen] = useState(false);
  const [mobileActiveView, setMobileActiveView] = useState<'sidebar' | 'editor' | 'panel'>('editor');

  useEffect(() => {
    const handleResize = () => setIsMobileScreen(window.innerWidth < 1024);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<any>(null);

  // ─── ZIP Upload handler ──────────────────────────────────────────────────
  const handleZipUpload = useCallback(async (file: File) => {
    const zip = new JSZip();
    const loaded = await zip.loadAsync(file);
    const { nodes, files } = await buildFileTree(loaded);

    // Detect root folder name
    const firstKey = Object.keys(files)[0] ?? '';
    const rootFolder = firstKey.split('/')[0];
    setProjectName(rootFolder || file.name.replace('.zip', ''));

    setFileTree(nodes);
    setAllFiles(files);
    setOpenTabs([]);
    setActiveTab(null);
    setGitChanges([]);

    // Try to find entry file and open it
    const entryFiles = ['src/App.tsx', 'src/main.tsx', 'index.html', 'App.tsx', 'main.tsx'];
    for (const entry of entryFiles) {
      const fullPath = Object.keys(files).find((k) => k.endsWith(entry));
      if (fullPath) {
        openFile(fullPath, files[fullPath], files);
        break;
      }
    }
  }, []);

  const openFile = useCallback((path: string, content: string, filesMap?: Record<string, string>) => {
    const files = filesMap ?? allFiles;
    const name = path.split('/').pop() ?? path;
    const language = getLanguage(name);
    const icon = getFileIcon(name);

    setOpenTabs((prev) => {
      if (prev.find((t) => t.path === path)) return prev;
      return [...prev, { path, name, content: files[path] ?? content, language, modified: false }];
    });
    setActiveTab(path);
    setMobileActiveView('editor');
  }, [allFiles]);

  // ─── Editor content change ───────────────────────────────────────────────
  const handleEditorChange = useCallback((value: string | undefined) => {
    if (!activeTab || value === undefined) return;
    setOpenTabs((prev) =>
      prev.map((t) =>
        t.path === activeTab ? { ...t, content: value, modified: true } : t
      )
    );
    setAllFiles((prev) => ({ ...prev, [activeTab]: value }));
    if (!gitChanges.includes(activeTab)) {
      setGitChanges((prev) => [...prev, activeTab]);
    }
  }, [activeTab, gitChanges]);

  const saveFile = useCallback(() => {
    if (!activeTab) return;
    setOpenTabs((prev) =>
      prev.map((t) => t.path === activeTab ? { ...t, modified: false } : t)
    );
  }, [activeTab]);

  // Ctrl+S save
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveFile();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [saveFile]);

  const closeTab = useCallback((path: string) => {
    setOpenTabs((prev) => {
      const next = prev.filter((t) => t.path !== path);
      if (activeTab === path) {
        setActiveTab(next[next.length - 1]?.path ?? null);
      }
      return next;
    });
  }, [activeTab]);

  // ─── AI Modify via Groq (Free, Fast, Llama 3.3 70B) ─────────────────────
  const handleAiModify = useCallback(async (prompt: string) => {
    if (!activeTab) return;
    const currentCode = allFiles[activeTab] ?? '';
    if (!currentCode) return;

    if (!GROQ_API_KEY) {
      setAiStatus('⚠ VITE_GROQ_API_KEY set करें (.env में)');
      setTimeout(() => setAiStatus(''), 5000);
      return;
    }

    setAiLoading(true);
    setAiStatus('⟳ Groq AI सोच रहा है...');

    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [
            {
              role: 'system',
              content: 'You are an expert code editor. Return ONLY the modified code. No explanations, no markdown fences, no preamble. Raw code only.',
            },
            {
              role: 'user',
              content: `INSTRUCTION: ${prompt}\n\nFILE: ${activeTab}\n${currentCode.slice(0, 6000)}\n\nReturn ONLY the modified code.`,
            },
          ],
          max_tokens: 4096,
          temperature: 0.1,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error?.message || `HTTP ${res.status}`);
      }

      const data = await res.json();
      let result: string = data?.choices?.[0]?.message?.content ?? '';

      // Strip accidental markdown fences
      result = result.replace(/^```[\w]*\r?\n/, '').replace(/\r?\n```$/, '').trim();

      if (result) {
        setAllFiles((prev) => ({ ...prev, [activeTab]: result }));
        setOpenTabs((prev) =>
          prev.map((t) =>
            t.path === activeTab ? { ...t, content: result, modified: true } : t
          )
        );
        if (editorRef.current) {
          editorRef.current.setValue(result);
        }
        setAiStatus('✓ Modified!');
      } else {
        setAiStatus('⚠ Empty response');
      }
    } catch (err: any) {
      setAiStatus(`⚠ ${err?.message ?? 'Groq error'}`);
    } finally {
      setAiLoading(false);
      setTimeout(() => setAiStatus(''), 4000);
    }
  }, [activeTab, allFiles]);

  // ─── Live preview builder ─────────────────────────────────────────────────
  const buildPreview = useCallback(() => {
    // For static HTML projects, create blob URL
    const indexPath = Object.keys(allFiles).find(
      (k) => k.endsWith('index.html') && !k.includes('node_modules')
    );
    if (!indexPath) {
      setAiStatus('⚠ index.html not found for preview');
      return;
    }
    let html = allFiles[indexPath];
    // Inline referenced CSS files
    const cssRefs = [...html.matchAll(/href="([^"]+\.css)"/g)];
    for (const match of cssRefs) {
      const cssPath = Object.keys(allFiles).find((k) => k.endsWith(match[1]));
      if (cssPath) {
        html = html.replace(
          `href="${match[1]}"`,
          `style="${allFiles[cssPath].replace(/"/g, "'")}"` // basic inline
        );
      }
    }
    const blob = new Blob([html], { type: 'text/html' });
    setPreviewUrl(URL.createObjectURL(blob));
    setRightPanel('preview');
    setMobileActiveView('panel');
  }, [allFiles]);

  // ─── GitHub push ─────────────────────────────────────────────────────────
  const handleGithubPush = useCallback(async (message: string) => {
    if (!ghToken || !ghRepo) {
      setTerminalLog((p) => [...p, '$ ❌ GitHub token और repo URL enter करें']);
      return;
    }
    if (gitChanges.length === 0) {
      setTerminalLog((p) => [...p, '$ ⚠ कोई changed file नहीं है push करने के लिए']);
      return;
    }

    // Extract owner/repo from URL
    const match = ghRepo.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) {
      setTerminalLog((p) => [...p, '$ ❌ Invalid GitHub URL — example: https://github.com/user/repo']);
      return;
    }
    const [, owner, repo] = match;
    const repoName = repo.replace('.git', '');

    setTerminalLog((p) => [...p, `$ git push origin ${ghBranch} (${gitChanges.length} files)...`]);

    // Unicode-safe base64 encode (btoa Unicode crash fix)
    const toBase64 = (str: string): string => {
      const bytes = new TextEncoder().encode(str);
      let binary = '';
      bytes.forEach((b) => { binary += String.fromCharCode(b); });
      return btoa(binary);
    };

    const headers = {
      Authorization: `Bearer ${ghToken}`,
      'Content-Type': 'application/json',
      Accept: 'application/vnd.github.v3+json',
    };

    // Verify token & repo access first
    const checkRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}`, { headers });
    if (!checkRes.ok) {
      const err = await checkRes.json().catch(() => ({}));
      setTerminalLog((p) => [...p, `$ ❌ Repo access failed: ${err?.message || checkRes.status} — token और repo URL check करें`]);
      return;
    }

    let pushed = 0;
    let failed = 0;
    const successPaths: string[] = [];

    for (const filePath of gitChanges.slice(0, 20)) {
      const content = allFiles[filePath];
      if (content === undefined) continue;

      // Remove root folder prefix (e.g. "Texly-final/src/..." → "src/...")
      const cleanPath = filePath.replace(/^[^/]+\//, '');
      const fileName = filePath.split('/').pop() ?? filePath;

      try {
        // Get existing file SHA (required to update existing files)
        const getRes = await fetch(
          `https://api.github.com/repos/${owner}/${repoName}/contents/${cleanPath}?ref=${ghBranch}`,
          { headers }
        );

        let sha: string | undefined;
        if (getRes.ok) {
          const data = await getRes.json();
          // contents API returns object for file, array for directory
          sha = Array.isArray(data) ? undefined : data?.sha;
        } else if (getRes.status !== 404) {
          // 404 = new file (ok), anything else = real error
          const err = await getRes.json().catch(() => ({}));
          setTerminalLog((p) => [...p, `$ ⚠ ${fileName}: ${err?.message || getRes.status}`]);
          failed++;
          continue;
        }

        // Push file
        const putRes = await fetch(
          `https://api.github.com/repos/${owner}/${repoName}/contents/${cleanPath}`,
          {
            method: 'PUT',
            headers,
            body: JSON.stringify({
              message: `${message} — ${fileName}`,
              content: toBase64(content),
              sha,           // undefined = new file, string = update existing
              branch: ghBranch,
            }),
          }
        );

        if (putRes.ok) {
          pushed++;
          successPaths.push(fileName);
        } else {
          const err = await putRes.json().catch(() => ({}));
          setTerminalLog((p) => [...p, `$ ⚠ ${fileName}: ${err?.message || putRes.status}`]);
          failed++;
        }
      } catch (err: any) {
        setTerminalLog((p) => [...p, `$ ⚠ ${fileName}: ${err?.message ?? 'Network error'}`]);
        failed++;
      }
    }

    if (pushed > 0) {
      setTerminalLog((p) => [
        ...p,
        `$ ✓ Pushed ${pushed} files → ${owner}/${repoName}@${ghBranch}`,
        ...successPaths.map((f) => `$   ✓ ${f}`),
        ...(failed > 0 ? [`$ ⚠ ${failed} files failed`] : []),
      ]);
      // Clear only successfully pushed files
      const failedPaths = gitChanges.filter((p) => !successPaths.includes(p.split('/').pop() ?? ''));
      setGitChanges(failedPaths);
      setOpenTabs((prev) => prev.map((t) => ({
        ...t,
        modified: failedPaths.includes(t.path),
      })));
    } else {
      setTerminalLog((p) => [...p, `$ ❌ Push failed — सभी ${failed} files में error आई`]);
    }
  }, [ghToken, ghRepo, ghBranch, gitChanges, allFiles]);

  // ─── Active tab content ──────────────────────────────────────────────────
  const activeTabData = openTabs.find((t) => t.path === activeTab);

  // ─── Search results ───────────────────────────────────────────────────────
  const searchResults = searchQuery.length > 1
    ? Object.entries(allFiles)
        .filter(([path, content]) =>
          path.toLowerCase().includes(searchQuery.toLowerCase()) ||
          content.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 20)
    : [];

  // ─── Drag & drop ─────────────────────────────────────────────────────────
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file?.name.endsWith('.zip')) handleZipUpload(file);
  }, [handleZipUpload]);

  // ─── Monaco options ───────────────────────────────────────────────────────
  const monacoOptions = {
    fontSize: 13,
    fontFamily: '"JetBrains Mono", "Fira Code", monospace',
    fontLigatures: true,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    automaticLayout: true,
    tabSize: 2,
    wordWrap: 'off' as const,
    lineNumbers: 'on' as const,
    glyphMargin: false,
    folding: true,
    lineDecorationsWidth: 8,
    renderLineHighlight: 'line' as const,
    smoothScrolling: true,
    cursorBlinking: 'smooth' as const,
    cursorSmoothCaretAnimation: 'on' as const,
    formatOnPaste: true,
    formatOnType: true,
    bracketPairColorization: { enabled: true },
    guides: { bracketPairs: true, indentation: true },
    suggest: { showKeywords: true, showSnippets: true },
    padding: { top: 12, bottom: 12 },
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div
      className="flex flex-col bg-[#1e1e1e] text-sm select-none"
      style={{ height: '100dvh', fontFamily: '"JetBrains Mono", monospace' }}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <Helmet>
        <title>DevStudio Online IDE - Free Browser-Based Code Editor & Compiler | Texly</title>
        <meta name="description" content="Texly DevStudio is a powerful, free online IDE & editor inside your web browser. Edit codes with Monaco Editor, upload ZIP files, experience live preview, synchronize commits directly with GitHub, and utilize LLaMA AI auto-generation. No installation required." />
        <meta name="keywords" content="online ide, web-based code editor, free online compiler, monaco editor online, upload zip ide, web ide github compiler, online react editor, online python editor, git browser code commit tool" />
        <link rel="canonical" href="https://www.texlyonline.in/devstudio" />

        {/* Schema.org */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "DevStudio Online IDE",
            "description": "Powerful web-based dynamic IDE featuring Monaco editor with syntax typing highlights, drag-and-drop zip project extraction, git integration panels, and live sandboxed preview frames.",
            "url": "https://www.texlyonline.in/devstudio",
            "applicationCategory": "DeveloperApplication",
            "operatingSystem": "All",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            }
          })}
        </script>
      </Helmet>

      {/* ── Top bar ─────────────────────────────────────────────────── */}
      <TopBar
        projectName={projectName}
        onUploadClick={() => fileInputRef.current?.click()}
        onPreview={buildPreview}
        onSave={saveFile}
        hasProject={Object.keys(allFiles).length > 0}
        rightPanel={rightPanel}
        setRightPanel={(p) => {
          setRightPanel(p);
          setMobileActiveView('panel');
        }}
      />

      {/* ── Mobile responsive tab selectors ─────────────────────────── */}
      {isMobileScreen && (
        <div className="flex bg-[#252526] border-b border-[#3c3c3c] text-[11px] h-10 items-center justify-around flex-shrink-0">
          <button
            onClick={() => setMobileActiveView('sidebar')}
            className={`flex-1 h-full text-center font-bold flex items-center justify-center gap-1 transition-all ${
              mobileActiveView === 'sidebar' ? 'bg-[#1e1e1e] text-amber-500 border-b-2 border-amber-500' : 'text-[#aaa] hover:text-white'
            }`}
          >
            <span>📁</span> Files ({Object.keys(allFiles).length})
          </button>
          <button
            onClick={() => setMobileActiveView('editor')}
            className={`flex-1 h-full text-center font-bold flex items-center justify-center gap-1 transition-all ${
              mobileActiveView === 'editor' ? 'bg-[#1e1e1e] text-white border-b-2 border-[#007acc]' : 'text-[#aaa] hover:text-white'
            }`}
          >
            <span>📝</span> Editor {activeTabData ? `(${activeTabData.name})` : ''}
          </button>
          <button
            onClick={() => setMobileActiveView('panel')}
            className={`flex-1 h-full text-center font-bold flex items-center justify-center gap-1 transition-all ${
              mobileActiveView === 'panel' ? 'bg-[#1e1e1e] text-cyan-400 border-b-2 border-cyan-400' : 'text-[#aaa] hover:text-white'
            }`}
          >
            <span>👁</span> {rightPanel.toUpperCase()} {gitChanges.length > 0 && `(${gitChanges.length})`}
          </button>
        </div>
      )}

      {/* ── Body ────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── Activity bar ─────────────────────────────────────────── */}
        {(!isMobileScreen || mobileActiveView === 'sidebar') && (
          <ActivityBar
            sidebarTab={sidebarTab}
            setSidebarTab={setSidebarTab}
            gitChanges={gitChanges.length}
          />
        )}

        {/* ── Sidebar ──────────────────────────────────────────────── */}
        {(!isMobileScreen || mobileActiveView === 'sidebar') && (
          <div
            className="flex flex-col border-r border-[#3c3c3c] overflow-hidden flex-shrink-0"
            style={{ width: isMobileScreen ? 'calc(100% - 44px)' : sidebarWidth, background: '#252526' }}
          >
            {/* Sidebar header */}
            <div className="px-3 py-2 text-[10px] font-semibold text-[#bbb] uppercase tracking-widest border-b border-[#3c3c3c]">
              {sidebarTab === 'files' && 'Explorer'}
              {sidebarTab === 'search' && 'Search'}
              {sidebarTab === 'git' && 'Source Control'}
            </div>

            <div className="flex-1 overflow-y-auto">
              {sidebarTab === 'files' && (
                <>
                  {fileTree.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-3 px-4 text-center">
                      <div className="text-4xl">📁</div>
                      <p className="text-[#888] text-xs">ZIP project upload करें</p>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 text-xs bg-[#0e639c] hover:bg-[#1177bb] text-white rounded transition-colors"
                      >
                        Upload ZIP
                      </button>
                    </div>
                  ) : (
                    <div className="py-1">
                      <div className="px-2 py-1 text-[11px] font-semibold text-[#bbb] flex items-center gap-1">
                        <span>📂</span>
                        <span className="truncate">{projectName.toUpperCase()}</span>
                      </div>
                      <FileTree
                        nodes={fileTree}
                        activeFile={activeTab ?? ''}
                        onFileClick={(node) => {
                          if (node.type === 'file') {
                            openFile(node.path, allFiles[node.path] ?? '');
                          }
                        }}
                      />
                    </div>
                  )}
                </>
              )}

              {sidebarTab === 'search' && (
                <div className="p-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Files में search करें..."
                    className="w-full px-2 py-1.5 text-[12px] bg-[#3c3c3c] text-[#ccc] border border-[#555] rounded outline-none focus:border-[#007acc] placeholder-[#666]"
                    style={{ fontFamily: 'inherit' }}
                  />
                  <div className="mt-2">
                    {searchResults.length === 0 && searchQuery.length > 1 && (
                      <p className="text-[#666] text-xs text-center py-4">No results</p>
                    )}
                    {searchResults.map(([path]) => (
                      <div
                        key={path}
                        onClick={() => openFile(path, allFiles[path] ?? '')}
                        className="flex items-center gap-1.5 px-1 py-1 rounded hover:bg-[#2a2d2e] cursor-pointer"
                      >
                        <span className="text-[11px]">{getFileIcon(path.split('/').pop() ?? '')}</span>
                        <span className="text-[11px] text-[#ccc] truncate">{path.split('/').pop()}</span>
                        <span className="text-[10px] text-[#666] truncate ml-auto">{path.split('/').slice(-2, -1)[0]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {sidebarTab === 'git' && (
                <div className="p-2">
                  <p className="text-[11px] text-[#888] mb-2">Changed Files ({gitChanges.length})</p>
                  {gitChanges.length === 0 ? (
                    <p className="text-[#555] text-xs text-center py-4">No changes</p>
                  ) : (
                    gitChanges.map((path) => (
                      <div
                        key={path}
                        onClick={() => openFile(path, allFiles[path] ?? '')}
                        className="flex items-center gap-1.5 px-1 py-1 rounded hover:bg-[#2a2d2e] cursor-pointer"
                      >
                        <span className="text-[11px]">{getFileIcon(path.split('/').pop() ?? '')}</span>
                        <span className="text-[11px] text-[#ccc] truncate flex-1">{path.split('/').pop()}</span>
                        <span className="text-[10px] text-[#4ec9b0] font-semibold">M</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Editor area ──────────────────────────────────────────── */}
        {(!isMobileScreen || mobileActiveView === 'editor') && (
          <div className="flex flex-col flex-1 overflow-hidden min-w-0">
            {/* Editor tabs */}
            <EditorTabs
              tabs={openTabs}
              activeTab={activeTab ?? ''}
              onTabClick={setActiveTab}
              onTabClose={closeTab}
            />

            {/* Monaco Editor */}
            <div className="flex-1 overflow-hidden relative">
              {openTabs.length === 0 ? (
                <WelcomeScreen onUpload={() => fileInputRef.current?.click()} />
              ) : (
                <Suspense fallback={<EditorLoader />}>
                  <MonacoEditor
                    height="100%"
                    language={activeTabData?.language ?? 'plaintext'}
                    value={activeTabData?.content ?? ''}
                    theme="vs-dark"
                    options={monacoOptions}
                    onChange={handleEditorChange}
                    onMount={(editor) => { editorRef.current = editor; }}
                  />
                </Suspense>
              )}
            </div>

            {/* AI bar */}
            <AiBar
              onModify={handleAiModify}
              loading={aiLoading}
              status={aiStatus}
              disabled={!activeTab}
            />
          </div>
        )}

        {/* ── Right panel ──────────────────────────────────────────── */}
        {(!isMobileScreen || mobileActiveView === 'panel') && (
          <div
            className="flex flex-col border-l border-[#3c3c3c] flex-shrink-0 overflow-hidden"
            style={{ width: isMobileScreen ? '100%' : rightWidth, background: '#1e1e1e' }}
          >
            {/* Right panel tab bar */}
            <div className="flex border-b border-[#3c3c3c] bg-[#252526]">
              {(['preview', 'terminal', 'github', 'info'] as RightPanel[]).map((panel) => {
                const labels: Record<RightPanel, string> = {
                  preview: '👁 Preview', terminal: '> Terminal',
                  github: '⎇ GitHub', info: 'ℹ Info',
                };
                return (
                  <button
                    key={panel}
                    onClick={() => setRightPanel(panel)}
                    className={`flex-1 py-1.5 text-[10px] transition-colors ${
                      rightPanel === panel
                        ? 'text-white border-b-2 border-[#007acc] bg-[#1e1e1e]'
                        : 'text-[#888] hover:text-[#ccc]'
                    }`}
                    style={{ minHeight: 'unset', minWidth: 'unset' }}
                  >
                    {labels[panel]}
                  </button>
                );
              })}
            </div>

            <div className="flex-1 overflow-hidden">
              {rightPanel === 'preview' && (
                <PreviewPanel
                  previewUrl={previewUrl}
                  onBuild={buildPreview}
                  allFiles={allFiles}
                  onUpload={() => fileInputRef.current?.click()}
                />
              )}
              {rightPanel === 'terminal' && (
                <TerminalPanel
                  log={terminalLog}
                  onCommand={(cmd) => {
                    setTerminalLog((p) => [...p, `$ ${cmd}`, '⚡ Connect Render backend to execute']);
                  }}
                />
              )}
              {rightPanel === 'github' && (
                <GitHubPanel
                  token={ghToken}
                  repo={ghRepo}
                  branch={ghBranch}
                  onTokenChange={setGhToken}
                  onRepoChange={setGhRepo}
                  onBranchChange={setGhBranch}
                  onPush={handleGithubPush}
                  changes={gitChanges}
                  allFiles={allFiles}
                  onFileClick={(path) => openFile(path, allFiles[path] ?? '')}
                />
              )}
              {rightPanel === 'info' && (
                <InfoPanel
                  projectName={projectName}
                  fileCount={Object.keys(allFiles).length}
                  tabCount={openTabs.length}
                  changes={gitChanges.length}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Status bar ───────────────────────────────────────────────── */}
      <StatusBar
        branch={ghBranch}
        activeFile={activeTabData?.name ?? ''}
        language={activeTabData?.language ?? ''}
        changes={gitChanges.length}
        aiStatus={aiStatus}
      />

      {/* ── Hidden file input ─────────────────────────────────────── */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".zip"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleZipUpload(file);
          e.target.value = '';
        }}
      />

      {/* ── Drag overlay ─────────────────────────────────────────── */}
      {isDragging && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 border-2 border-dashed border-[#007acc] pointer-events-none">
          <div className="text-center">
            <div className="text-6xl mb-3">📦</div>
            <p className="text-white text-xl font-semibold">ZIP Project Drop करें</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sub-components (inline) ───────────────────────────────────────────────────

function TopBar({
  projectName, onUploadClick, onPreview, onSave, hasProject, rightPanel, setRightPanel
}: {
  projectName: string; onUploadClick: () => void; onPreview: () => void; onSave: () => void;
  hasProject: boolean; rightPanel: string; setRightPanel: (p: RightPanel) => void;
}) {
  return (
    <div className="flex items-center h-9 bg-[#323233] border-b border-[#3c3c3c] px-3 gap-2 flex-shrink-0 justify-between sm:justify-start">
      <div className="flex items-center gap-1.5 mr-2 flex-shrink-0">
        <span className="text-[#4ec9b0] font-bold text-sm">⟨/⟩</span>
        <span className="text-[#ccc] text-xs font-semibold">DevStudio</span>
        {projectName && (
          <span className="hidden md:inline text-[#666] text-xs truncate max-w-[120px]">— {projectName}</span>
        )}
      </div>

      <div className="flex items-center gap-1 text-[11px] flex-shrink-0">
        <TbBtn onClick={onUploadClick} title="Upload ZIP">📦 <span className="hidden sm:inline">Upload</span></TbBtn>
        {hasProject && <>
          <TbBtn onClick={onSave} title="Save (Ctrl+S)">💾 <span className="hidden sm:inline">Save</span></TbBtn>
          <TbBtn onClick={onPreview} title="Live Preview">▶ <span className="hidden sm:inline">Preview</span></TbBtn>
        </>}
      </div>

      <div className="hidden sm:block flex-1" />

      <div className="flex items-center gap-1 text-[11px] flex-shrink-0">
        <TbBtn onClick={() => setRightPanel('terminal')} active={rightPanel === 'terminal'} title="Open Terminal">⌨ <span className="hidden sm:inline">Terminal</span></TbBtn>
        <TbBtn onClick={() => setRightPanel('github')} active={rightPanel === 'github'} title="Push to GitHub">⎇ <span className="hidden sm:inline">GitHub</span></TbBtn>
        <a href="/" className="text-[#888] hover:text-[#ccc] text-[11px] px-1.5 transition-colors" title="Go to Texly Home" style={{ minHeight: 'unset', minWidth: 'unset' }}>← <span className="hidden sm:inline">Texly</span></a>
      </div>
    </div>
  );
}

function TbBtn({ children, onClick, title, active }: {
  children: React.ReactNode; onClick?: () => void; title?: string; active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
        active
          ? 'bg-[#007acc] text-white'
          : 'text-[#ccc] hover:bg-[#3c3c3c] bg-transparent border border-[#555]'
      }`}
      style={{ minHeight: 'unset', minWidth: 'unset' }}
    >
      {children}
    </button>
  );
}

function ActivityBar({
  sidebarTab, setSidebarTab, gitChanges
}: { sidebarTab: SidebarTab; setSidebarTab: (t: SidebarTab) => void; gitChanges: number }) {
  const items: { id: SidebarTab; icon: string; title: string }[] = [
    { id: 'files', icon: '📁', title: 'Explorer' },
    { id: 'search', icon: '🔍', title: 'Search' },
    { id: 'git', icon: '⎇', title: 'Source Control' },
  ];
  return (
    <div className="flex flex-col items-center w-11 bg-[#333333] border-r border-[#3c3c3c] py-1 flex-shrink-0">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => setSidebarTab(item.id)}
          title={item.title}
          className={`relative w-10 h-10 flex items-center justify-center text-lg transition-colors ${
            sidebarTab === item.id
              ? 'text-white before:absolute before:left-0 before:top-1 before:bottom-1 before:w-0.5 before:bg-[#007acc] before:rounded-r'
              : 'text-[#858585] hover:text-[#ccc]'
          }`}
          style={{ minHeight: 'unset', minWidth: 'unset' }}
        >
          {item.icon}
          {item.id === 'git' && gitChanges > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-[#007acc] rounded-full text-[9px] text-white flex items-center justify-center font-bold">
              {gitChanges}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

function WelcomeScreen({ onUpload }: { onUpload: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center gap-5 bg-[#1e1e1e]">
      <div style={{ fontSize: 64 }}>⟨/⟩</div>
      <div>
        <h2 className="text-[#ccc] text-xl font-semibold mb-1">Texly DevStudio</h2>
        <p className="text-[#666] text-sm">ZIP project upload करें और coding शुरू करें</p>
      </div>
      <div className="flex flex-col gap-2 items-center">
        <button
          onClick={onUpload}
          className="px-5 py-2 bg-[#0e639c] hover:bg-[#1177bb] text-white rounded text-sm transition-colors"
          style={{ minHeight: 'unset', minWidth: 'unset' }}
        >
          📦 ZIP Upload करें
        </button>
        <p className="text-[#555] text-xs">या files यहाँ drag & drop करें</p>
      </div>
      <div className="grid grid-cols-3 gap-3 text-xs text-[#555] mt-2">
        {['React', 'Vue', 'Next.js', 'Vite', 'Static HTML', 'Node.js'].map((f) => (
          <span key={f} className="px-2 py-1 border border-[#3c3c3c] rounded">{f}</span>
        ))}
      </div>
    </div>
  );
}

function EditorLoader() {
  return (
    <div className="flex items-center justify-center h-full bg-[#1e1e1e]">
      <div className="text-[#666] text-sm">Monaco Editor load हो रहा है...</div>
    </div>
  );
}

function InfoPanel({ projectName, fileCount, tabCount, changes }: {
  projectName: string; fileCount: number; tabCount: number; changes: number;
}) {
  const rows = [
    ['Project', projectName || '—'],
    ['Total Files', String(fileCount)],
    ['Open Tabs', String(tabCount)],
    ['Unsaved Changes', String(changes)],
    ['AI Model', 'Groq · Llama 3.3 70B'],
    ['Framework', 'Auto-detect'],
  ];
  return (
    <div className="p-3">
      <p className="text-[10px] text-[#888] uppercase tracking-wider mb-2">Project Info</p>
      {rows.map(([label, val]) => (
        <div key={label} className="flex justify-between py-1.5 border-b border-[#3c3c3c] text-[11px]">
          <span className="text-[#888]">{label}</span>
          <span className="text-[#ccc] font-mono">{val}</span>
        </div>
      ))}
    </div>
  );
}
