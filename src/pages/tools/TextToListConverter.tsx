/**
 * TextToListConverter.tsx
 * Full SEO landing page + working tool for /tool/text-to-list-converter
 * Converted from standalone HTML to React TSX
 */

import React, { useState, useRef, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';

// ─── SEO Constants ──────────────────────────────────────────────────────────
const SEO_TITLE = 'Text to List Converter — Convert Text to Bulleted, Numbered or Comma List | Texly';
const SEO_DESC = 'Convert any text to a clean list instantly — bullet list, numbered list, comma-separated, or custom separator. Free, no signup. Works for grocery lists, to-do lists, CSV data and more.';
const SEO_KEYWORDS = 'text to list converter, text to list converter online free, convert text to list, turn text into list online, bullet point generator online free, numbered list maker online free, comma separated list generator, html list generator online, text to bullet points converter, list maker from text online';
const CANONICAL = 'https://www.texlyonline.in/tool/text-to-list-converter';

type Format = 'bullet' | 'numbered' | 'alpha' | 'comma' | 'pipe' | 'html-ul' | 'html-ol' | 'custom';

const FORMATS: { id: Format; label: string }[] = [
  { id: 'bullet', label: '• Bullet List' },
  { id: 'numbered', label: '1. Numbered List' },
  { id: 'alpha', label: 'a. Alphabetical' },
  { id: 'comma', label: 'Comma Separated' },
  { id: 'pipe', label: 'Pipe | Separated' },
  { id: 'html-ul', label: '<ul> HTML' },
  { id: 'html-ol', label: '<ol> HTML' },
  { id: 'custom', label: 'Custom' },
];

const SAMPLE = `Apple\nBanana\nCherry\nMango\nOrange\nStrawberry\nWatermelon\nPineapple\nGrape\nKiwi`;

export default function TextToListConverter() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [format, setFormat] = useState<Format>('bullet');
  const [customSep, setCustomSep] = useState(' | ');
  const [optTrim, setOptTrim] = useState(true);
  const [optEmpty, setOptEmpty] = useState(false);
  const [optSort, setOptSort] = useState(false);
  const [optDedup, setOptDedup] = useState(false);
  const [itemCount, setItemCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState('');
  const [converted, setConverted] = useState(false);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  }, []);

  const getItems = useCallback((text: string) => {
    let lines = text.split('\n');
    if (optTrim) lines = lines.map(l => l.trim());
    if (optEmpty) lines = lines.filter(l => l.trim() !== '');
    if (optDedup) lines = [...new Set(lines)];
    if (optSort) lines = [...lines].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
    return lines;
  }, [optTrim, optEmpty, optSort, optDedup]);

  const convertToList = useCallback(() => {
    if (!inputText.trim()) { showToast('⚠️ Please paste some text first'); return; }
    const items = getItems(inputText);
    const sep = customSep || ' | ';
    let result = '';

    switch (format) {
      case 'bullet':    result = items.map(i => `• ${i}`).join('\n'); break;
      case 'numbered':  result = items.map((i, idx) => `${idx + 1}. ${i}`).join('\n'); break;
      case 'alpha':     result = items.map((i, idx) => `${String.fromCharCode(97 + (idx % 26))}. ${i}`).join('\n'); break;
      case 'comma':     result = items.join(', '); break;
      case 'pipe':      result = items.join(' | '); break;
      case 'html-ul':   result = '<ul>\n' + items.map(i => `  <li>${i}</li>`).join('\n') + '\n</ul>'; break;
      case 'html-ol':   result = '<ol>\n' + items.map(i => `  <li>${i}</li>`).join('\n') + '\n</ol>'; break;
      case 'custom':    result = items.join(sep); break;
    }

    setOutputText(result);
    setItemCount(items.length);
    setConverted(true);
    setCopied(false);
  }, [inputText, format, customSep, getItems, showToast]);

  const copyOutput = useCallback(() => {
    if (!outputText) { showToast('⚠️ Nothing to copy yet'); return; }
    navigator.clipboard.writeText(outputText).then(() => {
      setCopied(true);
      showToast('✅ Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    });
  }, [outputText, showToast]);

  const clearAll = () => {
    setInputText(''); setOutputText(''); setItemCount(0); setConverted(false); setCopied(false);
  };

  const loadSample = () => {
    setInputText(SAMPLE);
  };

  const inputLineCount = inputText ? inputText.split('\n').filter(l => l.trim()).length : 0;

  const faqs = [
    { q: 'What formats can I convert text to?', a: 'You can convert to: bullet list (• item), numbered list (1. item), alphabetical list (a. item), comma-separated (item1, item2), pipe-separated (item1 | item2), HTML unordered list (<ul>), HTML ordered list (<ol>), or a custom separator you define yourself.' },
    { q: 'How does the input need to be formatted?', a: "Each item should be on a separate line. If you have a paragraph of comma-separated items, first paste it into a text editor and add line breaks between items, then use this tool. For text that's already on separate lines, just paste and convert." },
    { q: 'Can I convert comma-separated text to a list?', a: 'Currently, the tool works best with line-separated input. To convert comma-separated text to a list, try using our Find & Replace tool to replace , with a newline first, then use this converter.' },
    { q: 'Is my data private?', a: 'Completely. All processing happens in your browser. Nothing you type is ever sent to a server. We have no access to your text.' },
    { q: 'Can I sort and deduplicate at the same time?', a: 'Yes — check both "Sort A→Z" and "Remove Duplicates" together. The tool will remove duplicate entries first, then sort the remaining unique items alphabetically.' },
    { q: 'Does it work on mobile phones?', a: 'Yes, fully. Texly is designed to work on any device — iPhone, Android, tablet, or desktop. No app download required.' },
  ];

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <>
      <Helmet>
        <title>{SEO_TITLE}</title>
        <meta name="description" content={SEO_DESC} />
        <meta name="keywords" content={SEO_KEYWORDS} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={CANONICAL} />
        <meta property="og:title" content="Text to List Converter — Free Online Tool | Texly" />
        <meta property="og:description" content="Turn any text into a structured list in one click — bullets, numbers, comma-separated. Free, instant, no signup." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={CANONICAL} />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "Text to List Converter",
          "applicationCategory": "UtilitiesApplication",
          "operatingSystem": "Web",
          "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
          "description": SEO_DESC,
          "url": CANONICAL
        })}</script>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": faqs.map(f => ({
            "@type": "Question",
            "name": f.q,
            "acceptedAnswer": { "@type": "Answer", "text": f.a }
          }))
        })}</script>
      </Helmet>

      <style>{`
        .ttl-hero {
          background: linear-gradient(135deg, #075985 0%, #0ea5e9 60%, #38bdf8 100%);
          color: white; padding: 52px 24px 40px; text-align: center;
          position: relative; overflow: hidden;
        }
        .ttl-hero::before {
          content: ''; position: absolute; top: -40px; right: -40px;
          width: 300px; height: 300px; background: rgba(255,255,255,0.05); border-radius: 50%;
        }
        .ttl-hero::after {
          content: ''; position: absolute; bottom: -60px; left: -60px;
          width: 200px; height: 200px; background: rgba(255,255,255,0.05); border-radius: 50%;
        }
        .ttl-badge {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(255,255,255,0.18); padding: 5px 14px; border-radius: 20px;
          font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;
          margin-bottom: 20px; border: 1px solid rgba(255,255,255,0.25);
        }
        .ttl-hero h1 {
          font-size: clamp(26px, 5vw, 46px); font-weight: 800; letter-spacing: -1.5px;
          line-height: 1.1; margin-bottom: 16px;
        }
        .ttl-hero h1 em { color: #fde68a; font-style: normal; }
        .ttl-hero p { font-size: 16px; opacity: 0.9; max-width: 520px; margin: 0 auto 24px; }
        .ttl-tags { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; max-width: 500px; margin: 0 auto; }
        .ttl-tag {
          background: rgba(255,255,255,0.15); padding: 4px 12px; border-radius: 20px;
          font-size: 12px; font-weight: 600; border: 1px solid rgba(255,255,255,0.2);
        }
        .ttl-container { max-width: 1100px; margin: 0 auto; padding: 0 20px; }
        .ttl-card {
          background: #fff; border-radius: 16px; border: 1px solid #e2e8f0;
          box-shadow: 0 2px 8px rgba(0,0,0,0.07), 0 8px 24px rgba(0,0,0,0.05);
          margin-top: 32px; overflow: hidden;
        }
        .ttl-format-bar { background: #f8fafc; border-bottom: 1px solid #e2e8f0; padding: 14px 20px; }
        .ttl-format-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #94a3b8; margin-bottom: 10px; }
        .ttl-format-btns { display: flex; flex-wrap: wrap; gap: 8px; }
        .ttl-fmt-btn {
          padding: 7px 16px; border-radius: 8px; border: 1.5px solid #e2e8f0;
          font-size: 13px; font-weight: 600; cursor: pointer;
          background: #fff; color: #475569; transition: all 0.15s;
        }
        .ttl-fmt-btn:hover, .ttl-fmt-btn.active { background: #0ea5e9; border-color: #0ea5e9; color: white; }
        .ttl-options-bar {
          background: #f8fafc; border-bottom: 1px solid #e2e8f0;
          padding: 10px 20px; display: flex; flex-wrap: wrap; gap: 10px; align-items: center;
        }
        .ttl-opt-chip {
          display: flex; align-items: center; gap: 6px;
          background: #fff; border: 1px solid #e2e8f0; border-radius: 7px;
          padding: 5px 12px; font-size: 13px; font-weight: 500; cursor: pointer;
          color: #475569; transition: all 0.15s;
        }
        .ttl-opt-chip.checked { background: #f0f9ff; border-color: #0ea5e9; color: #0284c7; }
        .ttl-editors { display: grid; grid-template-columns: 1fr 1fr; min-height: 280px; }
        @media (max-width: 680px) { .ttl-editors { grid-template-columns: 1fr; } }
        .ttl-editor-col:first-child { border-right: 1px solid #e2e8f0; }
        .ttl-editor-label {
          padding: 10px 16px; font-size: 11px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.8px; color: #94a3b8;
          border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;
        }
        .ttl-textarea {
          width: 100%; height: 260px; padding: 16px; border: none; resize: vertical; outline: none;
          font-family: 'JetBrains Mono', 'Fira Code', monospace; font-size: 13.5px;
          line-height: 1.65; color: #0f172a; background: transparent;
        }
        .ttl-textarea::placeholder { color: #94a3b8; }
        .ttl-output {
          width: 100%; min-height: 260px; padding: 16px;
          font-family: 'JetBrains Mono', 'Fira Code', monospace; font-size: 13.5px;
          line-height: 1.65; overflow-y: auto; white-space: pre-wrap; word-break: break-word;
          background: #f0f9ff; color: #0f172a;
        }
        .ttl-footer {
          border-top: 1px solid #e2e8f0; padding: 14px 20px;
          display: flex; gap: 10px; align-items: center; flex-wrap: wrap;
        }
        .ttl-btn {
          padding: 9px 18px; border-radius: 9px; border: none;
          font-size: 13px; font-weight: 700; cursor: pointer;
          transition: all 0.15s; display: inline-flex; align-items: center; gap: 6px;
        }
        .ttl-btn-primary { background: #0ea5e9; color: white; }
        .ttl-btn-primary:hover { background: #0284c7; transform: translateY(-1px); }
        .ttl-btn-ghost { background: #f8fafc; color: #475569; border: 1px solid #e2e8f0; }
        .ttl-btn-ghost:hover { background: #e2e8f0; }
        .ttl-section { padding: 36px 0; }
        .ttl-section-title { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; margin-bottom: 6px; }
        .ttl-section-sub { color: #475569; font-size: 15px; margin-bottom: 24px; }
        .ttl-usecases { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 14px; }
        .ttl-usecase {
          background: #fff; border: 1px solid #e2e8f0; border-radius: 12px;
          padding: 20px 18px; transition: all 0.15s;
        }
        .ttl-usecase:hover { border-color: #0ea5e9; transform: translateY(-2px); box-shadow: 0 6px 16px rgba(14,165,233,0.12); }
        .ttl-usecase-icon { font-size: 28px; margin-bottom: 10px; }
        .ttl-usecase-title { font-weight: 700; font-size: 15px; margin-bottom: 5px; }
        .ttl-usecase-desc { font-size: 13px; color: #475569; line-height: 1.55; }
        .ttl-article-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 24px; }
        @media (max-width: 768px) { .ttl-article-grid { grid-template-columns: 1fr; } }
        .ttl-article-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 26px; }
        .ttl-article-card h2 { font-size: 20px; font-weight: 800; margin-bottom: 12px; letter-spacing: -0.3px; }
        .ttl-article-card h3 { font-size: 15px; font-weight: 700; margin: 18px 0 8px; color: #0284c7; }
        .ttl-article-card p { color: #475569; font-size: 15px; line-height: 1.7; margin-bottom: 10px; }
        .ttl-article-card ul { list-style: none; padding: 0; }
        .ttl-article-card li { padding: 5px 0 5px 18px; position: relative; color: #475569; font-size: 14px; line-height: 1.6; }
        .ttl-article-card li::before { content: '▸'; position: absolute; left: 0; color: #0ea5e9; }
        .ttl-faq-item { border-bottom: 1px solid #e2e8f0; }
        .ttl-faq-q {
          padding: 14px 0; font-weight: 600; font-size: 14px;
          cursor: pointer; display: flex; justify-content: space-between; align-items: center; color: #0f172a;
        }
        .ttl-faq-a { font-size: 14px; color: #475569; padding-bottom: 14px; line-height: 1.7; }
        .ttl-tools-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(195px, 1fr)); gap: 10px; }
        .ttl-tool-link {
          background: #fff; border: 1px solid #e2e8f0; border-radius: 10px;
          padding: 13px 15px; text-decoration: none; color: #0f172a;
          display: flex; align-items: center; gap: 9px; font-size: 13px; font-weight: 600; transition: all 0.15s;
        }
        .ttl-tool-link:hover { border-color: #0ea5e9; color: #0ea5e9; transform: translateY(-1px); }
        code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 13px; }
      `}</style>

      {/* HERO */}
      <header className="ttl-hero">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="ttl-badge">🔁 Text → List — Instant Conversion</div>
          <h1>Convert Text to a<br /><em>Clean, Formatted List</em></h1>
          <p>Turn any block of text into a bullet list, numbered list, comma-separated list, or your own custom format — instantly, free, no account needed.</p>
          <div className="ttl-tags">
            {['• Bullet List', '1. Numbered List', 'a, b, c Comma List', 'Custom Separator', 'HTML <ul> / <ol>'].map(t => (
              <span key={t} className="ttl-tag">{t}</span>
            ))}
          </div>
        </div>
      </header>

      <div className="ttl-container">
        {/* TOOL CARD */}
        <div className="ttl-card">
          {/* FORMAT TABS */}
          <div className="ttl-format-bar">
            <div className="ttl-format-label">Choose Output Format</div>
            <div className="ttl-format-btns">
              {FORMATS.map(f => (
                <button
                  key={f.id}
                  className={`ttl-fmt-btn${format === f.id ? ' active' : ''}`}
                  onClick={() => { setFormat(f.id); if (inputText.trim()) setTimeout(convertToList, 0); }}
                  dangerouslySetInnerHTML={{ __html: f.label }}
                />
              ))}
            </div>
          </div>

          {/* OPTIONS */}
          <div className="ttl-options-bar">
            <span style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', marginRight: 4 }}>Options:</span>
            {[
              { id: 'trim', label: 'Trim Spaces', val: optTrim, set: setOptTrim },
              { id: 'empty', label: 'Remove Blank Lines', val: optEmpty, set: setOptEmpty },
              { id: 'sort', label: 'Sort A→Z', val: optSort, set: setOptSort },
              { id: 'dedup', label: 'Remove Duplicates', val: optDedup, set: setOptDedup },
            ].map(o => (
              <label key={o.id} className={`ttl-opt-chip${o.val ? ' checked' : ''}`}>
                <input type="checkbox" checked={o.val} onChange={e => o.set(e.target.checked)} style={{ accentColor: '#0ea5e9' }} />
                {o.label}
              </label>
            ))}
            {format === 'custom' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: '#475569' }}>Separator:</label>
                <input
                  value={customSep}
                  onChange={e => setCustomSep(e.target.value)}
                  style={{ width: 60, padding: '5px 10px', borderRadius: 7, border: '1px solid #e2e8f0', fontFamily: 'monospace', fontSize: 13 }}
                />
              </div>
            )}
          </div>

          {/* EDITORS */}
          <div className="ttl-editors">
            <div className="ttl-editor-col">
              <div className="ttl-editor-label">
                <span>📋 Input Text</span>
                <span style={{ fontFamily: 'monospace', fontSize: 11 }}>{inputLineCount} lines</span>
              </div>
              <textarea
                className="ttl-textarea"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                placeholder={`Paste or type text here — one item per line:\n\nApple\nBanana\nCherry\nMango\nOrange`}
              />
            </div>
            <div className="ttl-editor-col">
              <div className="ttl-editor-label">
                <span>✅ Your List</span>
                <span style={{ fontFamily: 'monospace', fontSize: 11 }}>{converted ? `${itemCount} items` : '0 items'}</span>
              </div>
              <div className="ttl-output">
                {outputText || 'Your formatted list will appear here…'}
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="ttl-footer">
            <button className="ttl-btn ttl-btn-primary" onClick={convertToList}>⚡ Convert to List</button>
            <button className="ttl-btn ttl-btn-ghost" onClick={clearAll}>Clear</button>
            <button className="ttl-btn ttl-btn-ghost" onClick={loadSample}>Load Sample</button>
            {converted && (
              <button className="ttl-btn ttl-btn-ghost" onClick={copyOutput}>
                {copied ? '✅ Copied!' : '📋 Copy'}
              </button>
            )}
            {converted && (
              <span style={{ marginLeft: 'auto', fontSize: 12, color: '#94a3b8' }}>
                <strong style={{ color: '#475569' }}>{itemCount}</strong> items converted
              </span>
            )}
          </div>
        </div>

        {/* USE CASES */}
        <div className="ttl-section">
          <h2 className="ttl-section-title">When Do You Need Text to List?</h2>
          <p className="ttl-section-sub">This tool saves time in dozens of real situations every day:</p>
          <div className="ttl-usecases">
            {[
              { icon: '🛒', title: 'Grocery & Shopping Lists', desc: 'Turn a paragraph of items into a clean bullet list you can share or print.' },
              { icon: '📧', title: 'Email Bullet Points', desc: 'Convert scattered notes into professional bullet points for emails and reports.' },
              { icon: '💻', title: 'Coding & Dev Work', desc: 'Convert text to arrays, comma-separated values, or HTML lists for web development.' },
              { icon: '📊', title: 'Data & Spreadsheets', desc: 'Create pipe-separated or comma-separated data ready for CSV or Excel imports.' },
              { icon: '📝', title: 'To-Do Lists', desc: 'Turn a brain dump of tasks into a numbered or bulleted list instantly.' },
              { icon: '🎓', title: 'Students & Writers', desc: 'Format references, vocabulary words, or outline points into clean numbered lists.' },
            ].map(uc => (
              <div key={uc.title} className="ttl-usecase">
                <div className="ttl-usecase-icon">{uc.icon}</div>
                <div className="ttl-usecase-title">{uc.title}</div>
                <div className="ttl-usecase-desc">{uc.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ARTICLE + SIDEBAR */}
        <div style={{ paddingBottom: 36 }}>
          <div className="ttl-article-grid">
            <div className="ttl-article-card">
              <h2>How to Use the Text to List Converter</h2>
              <p>The tool is simple by design — but more powerful than it looks.</p>
              <h3>Step 1 — Paste Your Text</h3>
              <p>Type or paste text in the left box. Each line becomes one item in your list. So if you have a block of words or phrases, make sure each item is on its own line before converting.</p>
              <h3>Step 2 — Choose Your Format</h3>
              <p>Pick from the format buttons: bullet list (<code>•</code>), numbered list, alphabetical list, comma-separated, pipe-separated, or raw HTML. Each is useful in different situations.</p>
              <h3>Step 3 — Use the Options</h3>
              <p>The option checkboxes let you refine the output further:</p>
              <ul>
                <li><strong>Trim Spaces</strong> — removes leading/trailing whitespace from each item</li>
                <li><strong>Remove Blank Lines</strong> — skips empty lines so you don't get empty list items</li>
                <li><strong>Sort A→Z</strong> — alphabetically sorts all items automatically</li>
                <li><strong>Remove Duplicates</strong> — keeps only unique items, removes repeated entries</li>
              </ul>
              <h3>Step 4 — Copy and Use</h3>
              <p>Click "Convert to List" — your formatted list appears on the right. Copy it and paste it anywhere: Word, Google Docs, email, HTML code, or a spreadsheet.</p>
              <h3>What's the HTML Option For?</h3>
              <p>If you're a web developer or content writer building web pages, the <code>&lt;ul&gt;</code> and <code>&lt;ol&gt;</code> formats generate proper HTML list markup. Paste directly into your code editor or CMS.</p>
              <h3>Can It Handle Large Lists?</h3>
              <p>Yes. The converter runs in your browser and handles thousands of items efficiently. We've tested it with lists over 10,000 lines — no lag, no crash.</p>
            </div>

            <div>
              <div className="ttl-article-card" style={{ marginBottom: 16 }}>
                <h2 style={{ fontSize: 17 }}>🔗 Related Tools</h2>
                <ul>
                  {[
                    ['/tool/remove-duplicate-lines-tool', 'Remove Duplicate Lines'],
                    ['/tool/sort-lines-alphabetically', 'Sort Lines A–Z'],
                    ['/tool/remove-empty-lines-online', 'Remove Empty Lines'],
                    ['/tool/remove-special-characters-online', 'Remove Special Chars'],
                    ['/tool/add-prefix-suffix-to-lines', 'Add Prefix / Suffix'],
                    ['/tool/find-and-replace-text-online', 'Find & Replace'],
                    ['/tool/remove-line-breaks-tool', 'Remove Line Breaks'],
                    ['/tool/clean-text-online-free', 'Clean Text Online'],
                  ].map(([href, label]) => (
                    <li key={href}><a href={href} style={{ color: '#2563eb' }}>{label}</a></li>
                  ))}
                </ul>
              </div>
              <div className="ttl-article-card">
                <h2 style={{ fontSize: 17 }}>💡 Power User Tips</h2>
                <ul>
                  <li>Combine with <a href="/tool/remove-special-characters-online" style={{ color: '#0ea5e9' }}>Remove Special Characters</a> to get super-clean CSV data</li>
                  <li>Use the <strong>Sort + Dedup</strong> combo to quickly clean messy keyword lists</li>
                  <li>HTML output works great in WordPress, Notion, or any blog CMS</li>
                  <li>Comma-separated output can be directly imported to Google Sheets using <code>split()</code></li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div style={{ paddingBottom: 32 }}>
          <div className="ttl-article-card">
            <h2>Frequently Asked Questions</h2>
            {faqs.map((faq, i) => (
              <div key={i} className="ttl-faq-item">
                <div className="ttl-faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span>{faq.q}</span>
                  <span style={{ fontSize: 20, color: '#0ea5e9' }}>{openFaq === i ? '−' : '+'}</span>
                </div>
                {openFaq === i && <div className="ttl-faq-a">{faq.a}</div>}
              </div>
            ))}
          </div>
        </div>

        {/* MORE TOOLS */}
        <div style={{ paddingBottom: 48 }}>
          <h2 className="ttl-section-title">More Free Text Tools on Texly</h2>
          <p className="ttl-section-sub">50+ free tools — all in your browser, all free, no login needed.</p>
          <div className="ttl-tools-grid">
            {[
              ['/tool/remove-special-characters-online', '🧹 Remove Special Characters'],
              ['/tool/remove-duplicate-lines-tool', '🗂 Remove Duplicate Lines'],
              ['/tool/find-and-replace-text-online', '🔄 Find & Replace'],
              ['/tool/morse-code-translator', '📡 Morse Code Translator'],
              ['/tool/upper-case-converter', '🔠 UPPERCASE Converter'],
              ['/tool/word-counter-online-free', '📊 Word Counter'],
              ['/tool/clean-text-online-free', '✨ Clean Text Online'],
              ['/tool/pdf-editor-online', '📄 PDF Editor'],
              ['/tool/base64-encode-online', '🔑 Base64 Encode'],
              ['/tool/json-to-text-converter', '{ } JSON to Text'],
              ['/ai-tools', '🤖 AI Tools'],
            ].map(([href, label]) => (
              <a key={href} href={href} className="ttl-tool-link">{label}</a>
            ))}
          </div>
        </div>
      </div>

      {/* TOAST */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24,
          background: '#0f172a', color: 'white', padding: '11px 18px',
          borderRadius: 10, fontSize: 14, fontWeight: 500, zIndex: 999,
          animation: 'fadeIn 0.3s ease',
        }}>{toast}</div>
      )}
    </>
  );
}
