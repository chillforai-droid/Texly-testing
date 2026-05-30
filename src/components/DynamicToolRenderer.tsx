import React, { useRef, useEffect } from 'react';

interface DynamicToolRendererProps {
  componentCode: string;
  toolName: string;
}

/**
 * Admin panel se generate hue React component code ko
 * sandboxed iframe mein safely render karta hai.
 * Same approach jo admin panel ka SandboxTab use karta hai.
 */
const DynamicToolRenderer: React.FC<DynamicToolRendererProps> = ({ componentCode, toolName }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !componentCode) return;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${toolName}</title>
  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { margin: 0; padding: 16px; font-family: system-ui, sans-serif; background: transparent; }
    * { box-sizing: border-box; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    const { useState, useEffect, useRef, useCallback, useMemo } = React;
    
    ${componentCode}
    
    // Component ka naam dhundho (export default ke baad)
    const match = \`${componentCode}\`.match(/export\\s+default\\s+(\\w+)/);
    const ComponentName = match ? match[1] : null;
    
    // Render karo
    const root = ReactDOM.createRoot(document.getElementById('root'));
    if (ComponentName && typeof eval(ComponentName) === 'function') {
      root.render(React.createElement(eval(ComponentName)));
    } else {
      root.render(React.createElement('div', {
        style: { padding: '20px', color: '#ef4444', background: '#fef2f2', borderRadius: '8px' }
      }, 'Component render nahi ho saka. Code check karein.'));
    }
  </script>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    iframe.src = url;

    // Auto-resize iframe to content height
    const handleLoad = () => {
      try {
        const body = iframe.contentDocument?.body;
        if (body) {
          iframe.style.height = Math.max(400, body.scrollHeight + 32) + 'px';
        }
      } catch {}
    };
    iframe.addEventListener('load', handleLoad);

    return () => {
      URL.revokeObjectURL(url);
      iframe.removeEventListener('load', handleLoad);
    };
  }, [componentCode, toolName]);

  if (!componentCode) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-500">
        <p>Tool component available nahi hai.</p>
      </div>
    );
  }

  return (
    <div className="w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
      <iframe
        ref={iframeRef}
        title={toolName}
        className="w-full border-0"
        style={{ minHeight: '400px', height: '500px' }}
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
};

export default DynamicToolRenderer;
