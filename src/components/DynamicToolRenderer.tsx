import React, { useRef, useEffect, useState, useCallback } from 'react';

interface DynamicToolRendererProps {
  componentCode: string;
  toolName: string;
}

const scriptCache: Record<string, string> = {};

async function fetchScript(url: string): Promise<string> {
  if (scriptCache[url]) return scriptCache[url];
  try {
    const res = await fetch(url);
    const text = await res.text();
    scriptCache[url] = text;
    return text;
  } catch (e) {
    return `/* Failed: ${url} */`;
  }
}

const CDNS = {
  react: 'https://unpkg.com/react@18/umd/react.production.min.js',
  reactDom: 'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
  babel: 'https://unpkg.com/@babel/standalone/babel.min.js',
};

let preloadPromise: Promise<Record<string, string>> | null = null;
function preloadScripts() {
  if (!preloadPromise) {
    preloadPromise = Promise.all(
      Object.entries(CDNS).map(async ([key, url]) => [key, await fetchScript(url)])
    ).then(Object.fromEntries);
  }
  return preloadPromise;
}
preloadScripts();

// ✅ TypeScript को strip karo BEFORE Babel transform
function stripTypeScript(code: string): string {
  return code
    // interface declarations
    .replace(/^[ \t]*interface\s+\w+[^{]*\{[^}]*\}/gms, '')
    // type aliases
    .replace(/^[ \t]*type\s+\w+\s*(<[^>]*>)?\s*=\s*[^;]+;/gm, '')
    // generic type params in function/arrow: <T>(  →  (
    .replace(/<([A-Z]\w*(?:\s*,\s*[A-Z]\w*)*)>\s*\(/g, '(')
    // type assertions: as Type  (but not JSX)
    .replace(/\)\s+as\s+[A-Z]\w*(\[\])?/g, ')')
    .replace(/\bas\s+[A-Z]\w+(\[\])?(?=[\s,;)}\]])/g, '')
    // variable type annotations:  const x: Type =  →  const x =
    .replace(/:\s*(string|number|boolean|any|void|never|null|undefined|unknown|object|File|Blob|React\.\w+|HTMLElement|HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement|HTMLDivElement|HTMLCanvasElement|Event|MouseEvent|KeyboardEvent|DragEvent|ChangeEvent|React\.FC|React\.RefObject|Record|Map|Set|Array|Promise)\s*(?=[=,;)\]])/g, '')
    // typed parameters:  (x: Type)  →  (x)  — handles most common cases
    .replace(/(\w+)\s*:\s*(string|number|boolean|any|void|never|null|undefined|unknown|object|File|Blob|React\.\w+|HTMLElement|HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement|HTMLDivElement|HTMLCanvasElement|Event|MouseEvent|KeyboardEvent|DragEvent|ChangeEvent)\b(\[\])?(\s*[=,);])/g, '$1$4')
    // function return types:  ): Type {  →  ) {
    .replace(/\)\s*:\s*\w+(\[\])?\s*\{/g, ') {')
    .replace(/\)\s*:\s*\w+(\[\])?\s*=>/g, ') =>')
    // React.FC<Props> or FC<Props>
    .replace(/:\s*(React\.FC|FC)<[^>]*>/g, '')
    .replace(/<[A-Z]\w*(?:\[\])?>/g, '')
    // useState<Type>( → useState(
    .replace(/\b(useState|useRef|useCallback|useMemo|useContext|createContext|forwardRef)\s*<[^>()]+>/g, '$1')
    // Array<Type> → Array, Record<K,V> etc
    .replace(/\b(Array|Record|Map|Set|Promise|Partial|Required|Readonly|Pick|Omit|Exclude|Extract|NonNullable|ReturnType|InstanceType)\s*<[^>]+>/g, 'Array')
    // remaining imports (already stripped but safety)
    .replace(/import\s+type\s+.*?from\s+['"][^'"]+['"]\s*;?\n?/g, '')
    .replace(/import\s*\{[^}]*\}\s*from\s*['"][^'"]+['"]\s*;?\n?/g, '')
    .replace(/import\s+\w+\s*from\s*['"][^'"]+['"]\s*;?\n?/g, '')
    .replace(/export\s+default\s+function\s+(\w+)/, 'function $1')
    .replace(/export\s+default\s+(\w+)\s*;?\s*$/, '')
    .replace(/^export\s+(?!default)/gm, '');
}

const DynamicToolRenderer: React.FC<DynamicToolRendererProps> = ({ componentCode, toolName }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeHeight, setIframeHeight] = useState(500);
  const blobUrlRef = useRef<string | null>(null);

  const buildAndRender = useCallback(async () => {
    if (!componentCode) return;
    const iframe = iframeRef.current;
    if (!iframe) return;

    const scripts = await preloadScripts();

    // ✅ TypeScript strip → phir Babel transform
    const cleanCode = stripTypeScript(componentCode);

    const patterns = [
      /function\s+([A-Z]\w+)\s*\(/,
      /const\s+([A-Z]\w+)\s*=\s*(?:React\.memo\()?(?:\([^)]*\)|[^=])\s*=>/,
      /const\s+([A-Z]\w+)\s*=\s*\(/,
    ];
    let componentName = '';
    for (const p of patterns) {
      const m = cleanCode.match(p);
      if (m) { componentName = m[1]; break; }
    }

    const transformedCode = `
(function() {
  var _src = ${JSON.stringify(cleanCode)};
  try {
    var _result = Babel.transform(_src, {
      presets: [
        ['react', { runtime: 'classic' }],
        ['env', { targets: { browsers: ['last 2 versions'] }, modules: false }]
      ],
      plugins: ['transform-class-properties'],
      filename: 'tool.jsx',
    });

    var _fn = new Function(
      'React','ReactDOM',
      'useState','useEffect','useRef','useCallback','useMemo',
      'useReducer','useContext','createContext','forwardRef','Fragment','memo',
      'cn','clsx',
      _result.code + '\\nreturn (typeof ${componentName} !== "undefined") ? ${componentName} : null;'
    );

    var Comp = _fn(
      React, ReactDOM,
      React.useState, React.useEffect, React.useRef, React.useCallback, React.useMemo,
      React.useReducer, React.useContext, React.createContext,
      React.forwardRef, React.Fragment, React.memo,
      window.cn, window.clsx
    );

    if (typeof Comp === 'function') {
      dbg('✅ Mounting: ${componentName}');
      ReactDOM.createRoot(document.getElementById('root')).render(
        React.createElement(Comp)
      );
    } else {
      throw new Error('Component "${componentName}" is not a function');
    }
  } catch(err) {
    dbg('❌ ' + err.message);
    document.getElementById('root').innerHTML =
      '<div style="padding:16px;color:#dc2626;background:#fef2f2;border-radius:8px;' +
      'font-size:12px;font-family:monospace;margin:8px;white-space:pre-wrap">' +
      '<b>⚠️ Render Error</b>\\n\\n' + err.message + '</div>';
  }
  function sendH() {
    var h = Math.max(400, document.documentElement.scrollHeight + 32);
    try { window.parent.postMessage({ type:'iframeHeight', height:h },'*'); } catch(e){}
  }
  setTimeout(sendH, 300); setTimeout(sendH, 1000); setTimeout(sendH, 2500);
  new MutationObserver(sendH).observe(document.body,{childList:true,subtree:true});
})();
`;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>${toolName.replace(/[<>"&]/g, '')}</title>
  <style>
    *,*::before,*::after{box-sizing:border-box}
    html,body{margin:0;padding:0;font-family:system-ui,-apple-system,sans-serif;background:transparent}
    #root{padding:16px}
    #debug{font-size:11px;color:#6b7280;padding:6px 10px;background:#f9fafb;border-top:1px solid #e5e7eb;font-family:monospace;white-space:pre-wrap}
  </style>
</head>
<body>
  <div id="root"><p style="color:#9ca3af;padding:20px;text-align:center">Loading...</p></div>
  <div id="debug"></div>
  <script>
    function dbg(m){
      var el=document.getElementById('debug');
      if(el)el.textContent+=m+'\\n';
      try{window.parent.postMessage({type:'debug',msg:m},'*')}catch(e){}
    }
    dbg('Page loaded');
    var _I=function(p){return React.createElement('span',{style:{display:'inline-flex',width:p.size||16,height:p.size||16,background:'#cbd5e1',borderRadius:3}});};
    ['ShieldCheck','Cpu','Zap','Sparkles','ChevronDown','ChevronUp','ChevronRight','ChevronLeft','Check','X','Plus','Minus','ArrowRight','ArrowLeft','Upload','Download','Copy','Trash','Trash2','Edit','Edit2','Search','Filter','Settings','Info','AlertCircle','AlertTriangle','Star','Heart','Bookmark','Share','Link','ExternalLink','File','FileText','Folder','Image','Camera','Video','User','Users','Mail','Phone','Globe','Calendar','Clock','Timer','RefreshCw','Loader','Loader2','Eye','EyeOff','Lock','Unlock','Key','Shield','Home','Menu','Grid','List','Code','Terminal','Database','Server','Play','Pause','BarChart','TrendingUp','Activity','Wrench','Wand','Wand2','Layers','Palette','Pen','Scan','Monitor','Smartphone','DollarSign','CreditCard','Tag','ThumbsUp','ThumbsDown','Smile','ImageIcon','Images','Compress','Maximize','Minimize','Sliders','ToggleLeft','ToggleRight','Repeat','RotateCcw','RotateCw','ZoomIn','ZoomOut','CheckCircle','XCircle','HelpCircle','MessageCircle','Send','Archive','Package','Box'].forEach(function(n){window[n]=_I;});
    window.LucideIcon=_I;
    var cn=function(){return Array.prototype.slice.call(arguments).flat().filter(Boolean).join(' ');};
    window.cn=cn;window.clsx=cn;window.classNames=cn;
  </script>
  <script>${scripts.react}</script>
  <script>${scripts.reactDom}</script>
  <script>${scripts.babel}</script>
  <script>
    dbg('React:'+(typeof React!=='undefined'?'✅':'❌'));
    dbg('ReactDOM:'+(typeof ReactDOM!=='undefined'?'✅':'❌'));
    dbg('Babel:'+(typeof Babel!=='undefined'?'✅':'❌'));
  </script>
  <script>${transformedCode}</script>
  <script>
    (function(){var s=document.createElement('script');s.src='https://cdn.tailwindcss.com';s.onload=function(){dbg('Tailwind ✅');};s.onerror=function(){dbg('Tailwind ❌');};document.head.appendChild(s);})();
  </script>
</body>
</html>`;

    if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    const blob = new Blob([html], { type: 'text/html' });
    blobUrlRef.current = URL.createObjectURL(blob);
    iframe.src = blobUrlRef.current;
  }, [componentCode, toolName]);

  useEffect(() => { buildAndRender(); }, [buildAndRender]);
  useEffect(() => () => { if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current); }, []);

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'iframeHeight') setIframeHeight(Math.max(400, e.data.height));
      if (e.data?.type === 'debug') console.log('[Tool]', e.data.msg);
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  if (!componentCode) {
    return (
      <div className="p-8 text-center border-2 border-dashed border-red-300 rounded-2xl bg-red-50">
        <p className="text-red-600 font-bold">⚠️ componentCode empty है</p>
        <p className="text-red-400 text-sm mt-1">Supabase से component_code नहीं मिला</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        <iframe
          ref={iframeRef}
          title={toolName}
          className="w-full border-0 transition-all duration-300"
          style={{ height: `${iframeHeight}px`, minHeight: '400px' }}
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    </div>
  );
};

export default DynamicToolRenderer;
