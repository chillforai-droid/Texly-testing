/**
 * RemoveSpecialCharacters.tsx
 * Full SEO landing page + working tool for /tool/remove-special-characters-online
 * Converted from standalone HTML to React TSX
 */

import React, { useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';

// ─── SEO Constants ──────────────────────────────────────────────────────────
const SEO_TITLE = 'Remove Special Characters Online — Free, Instant, No Signup | Texly';
const SEO_DESC = 'Remove special characters from text instantly. Paste your text and get clean output in one click — free, no login required. Perfect for CSV, SEO, email, coding and more.';
const SEO_KEYWORDS = 'remove special characters online free, remove special characters from text, special character remover online, strip special characters free, remove symbols from text online, remove punctuation from text online, special character cleaner, remove non alphanumeric characters online, sanitize text online free, remove special chars excel, remove special characters python';
const CANONICAL = 'https://www.texlyonline.in/tool/remove-special-characters-online';

type PresetKey = 'csv' | 'seo' | 'email' | 'code' | 'database' | 'plain';

interface Options {
  punctuation: boolean;
  symbols: boolean;
  numbers: boolean;
  extraSpaces: boolean;
  singleLine: boolean;
}

const PRESETS: Record<PresetKey, Options> = {
  csv:      { punctuation: true,  symbols: true,  numbers: false, extraSpaces: true,  singleLine: false },
  seo:      { punctuation: false, symbols: true,  numbers: false, extraSpaces: true,  singleLine: false },
  email:    { punctuation: false, symbols: true,  numbers: false, extraSpaces: true,  singleLine: false },
  code:     { punctuation: true,  symbols: true,  numbers: false, extraSpaces: false, singleLine: false },
  database: { punctuation: false, symbols: true,  numbers: false, extraSpaces: true,  singleLine: true  },
  plain:    { punctuation: true,  symbols: true,  numbers: false, extraSpaces: true,  singleLine: true  },
};

const SAMPLE = `Hello! How are you? My email is user@example.com — let's talk #soon 😊\n\nProduct: "Shirt (Blue) — Size L" @ $29.99\nKeywords: SEO, content-marketing, #google, [2026] trends!\nSQL field: user's data & more... (special chars: @#$%^&*)`;

export default function RemoveSpecialCharacters() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [opts, setOpts] = useState<Options>({ punctuation: true, symbols: true, numbers: false, extraSpaces: false, singleLine: false });
  const [removedCount, setRemovedCount] = useState(0);
  const [savedPct, setSavedPct] = useState(0);
  const [processed, setProcessed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  }, []);

  const processText = useCallback(() => {
    if (!inputText.trim()) { showToast('⚠️ Please paste some text first'); return; }
    let result = inputText;
    if (opts.symbols)     result = result.replace(/[@#$%^&*+=\[\]{};'"\\|<>\/`~]/g, '');
    if (opts.punctuation) result = result.replace(/[!?,.:;()\-–—""'']/g, '');
    if (opts.numbers)     result = result.replace(/[0-9]/g, '');
    if (opts.extraSpaces) result = result.replace(/\s+/g, ' ').trim();
    if (opts.singleLine)  result = result.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();

    const removed = inputText.length - result.length;
    const pct = inputText.length > 0 ? Math.round((removed / inputText.length) * 100) : 0;

    setOutputText(result);
    setRemovedCount(removed);
    setSavedPct(pct);
    setProcessed(true);
    setCopied(false);
  }, [inputText, opts, showToast]);

  const copyOutput = useCallback(() => {
    if (!outputText) { showToast('⚠️ Nothing to copy yet'); return; }
    navigator.clipboard.writeText(outputText).then(() => {
      setCopied(true);
      showToast('✅ Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    });
  }, [outputText, showToast]);

  const clearAll = () => {
    setInputText(''); setOutputText(''); setProcessed(false); setCopied(false);
    setRemovedCount(0); setSavedPct(0);
  };

  const loadSample = () => { setInputText(SAMPLE); };

  const applyPreset = (key: PresetKey) => {
    setOpts(PRESETS[key]);
    showToast(`✅ ${key.charAt(0).toUpperCase() + key.slice(1)} preset applied`);
  };

  const setOpt = (key: keyof Options, val: boolean) => setOpts(prev => ({ ...prev, [key]: val }));

  const faqs = [
    { q: 'Does this tool store my text or data?', a: "No. Everything happens entirely in your browser. Your text is never sent to any server. We don't log, store, or see anything you paste into this tool." },
    { q: 'Can I remove specific characters I choose?', a: 'Yes — use the checkboxes at the top to customize which types of characters get removed. You can remove only symbols, only punctuation, only numbers, or any combination. For very specific patterns, try our Find & Replace tool.' },
    { q: 'Will this remove accents from letters like é, ñ, ü?', a: 'This tool focuses on symbols and punctuation, not accented letters. If you need to remove accents (convert é → e, ñ → n), use our dedicated Remove Accents tool.' },
    { q: 'How do I clean text for uploading to a database?', a: 'Use the "Database / SQL" preset. It removes characters that commonly cause SQL injection risks or parsing errors — single quotes, double quotes, backslashes, and semicolons — while preserving readable text.' },
    { q: 'Is there a limit on how much text I can clean?', a: "There's no hard limit. The tool runs locally in your browser, so performance depends on your device. We've tested it with texts up to 500,000 characters without issues." },
    { q: 'Can I use this on mobile?', a: 'Absolutely. Texly is fully responsive and works on any smartphone or tablet browser. No app download needed.' },
  ];

  return (
    <>
      <Helmet>
        <title>{SEO_TITLE}</title>
        <meta name="description" content={SEO_DESC} />
        <meta name="keywords" content={SEO_KEYWORDS} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={CANONICAL} />
        <meta property="og:title" content="Remove Special Characters Online — Free & Instant | Texly" />
        <meta property="og:description" content="Paste text, remove special chars in one click. No signup. Works for CSV, SEO, emails, code and databases." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={CANONICAL} />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "Remove Special Characters Online",
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
        .rsc-hero {
          background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%);
          color: white; padding: 56px 24px 48px; text-align: center;
        }
        .rsc-badge {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(255,255,255,0.15); backdrop-filter: blur(8px);
          padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 600;
          text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 20px;
          border: 1px solid rgba(255,255,255,0.2);
        }
        .rsc-hero h1 {
          font-size: clamp(28px, 5vw, 48px); font-weight: 700; letter-spacing: -1px;
          line-height: 1.15; margin-bottom: 16px;
        }
        .rsc-hero h1 em { color: #fbbf24; font-style: normal; }
        .rsc-hero p { font-size: 17px; opacity: 0.88; max-width: 560px; margin: 0 auto 28px; }
        .rsc-trust { display: flex; justify-content: center; flex-wrap: wrap; gap: 20px; font-size: 13px; opacity: 0.8; }
        .rsc-trust span { display: flex; align-items: center; gap: 5px; }
        .rsc-trust span::before { content: '✓'; color: #4ade80; font-weight: 700; }
        .rsc-container { max-width: 1100px; margin: 0 auto; padding: 0 20px; }
        .rsc-card {
          background: #fff; border-radius: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.06);
          margin-top: 32px; overflow: hidden; border: 1px solid #e2e8f0;
        }
        .dark .rsc-card { background: #0f172a; border-color: #1e293b; box-shadow: 0 2px 8px rgba(0,0,0,0.3); }
        .rsc-tool-header {
          background: #f8fafc; border-bottom: 1px solid #e2e8f0;
          padding: 16px 20px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;
        }
        .dark .rsc-tool-header { background: #1e293b; border-bottom-color: #334155; }
        .rsc-options-row { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }
        .rsc-opt-chip {
          display: flex; align-items: center; gap: 6px;
          background: #fff; border: 1px solid #e2e8f0; border-radius: 8px;
          padding: 5px 12px; font-size: 13px; font-weight: 500; cursor: pointer;
          transition: all 0.15s; color: #475569; user-select: none;
        }
        .dark .rsc-opt-chip { background: #0f172a; border-color: #334155; color: #94a3b8; }
        .rsc-opt-chip.checked { background: #eff6ff; border-color: #2563eb; color: #2563eb; }
        .dark .rsc-opt-chip.checked { background: #0c1a2e; border-color: #3b82f6; color: #60a5fa; }
        .rsc-editors { display: grid; grid-template-columns: 1fr 1fr; min-height: 300px; }
        @media (max-width: 680px) { .rsc-editors { grid-template-columns: 1fr; } }
        .rsc-editor-col:first-child { border-right: 1px solid #e2e8f0; }
        .dark .rsc-editor-col:first-child { border-right-color: #334155; }
        .rsc-editor-label {
          padding: 10px 16px; font-size: 11px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.8px; color: #94a3b8;
          border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;
        }
        .dark .rsc-editor-label { border-bottom-color: #334155; }
        .rsc-textarea {
          width: 100%; height: 280px; padding: 16px; border: none; resize: vertical; outline: none;
          font-family: 'DM Mono', 'Fira Code', monospace; font-size: 14px;
          line-height: 1.6; color: #0f172a; background: transparent;
        }
        .dark .rsc-textarea { color: #e2e8f0; }
        .rsc-textarea::placeholder { color: #94a3b8; }
        .rsc-output {
          width: 100%; height: 280px; padding: 16px; overflow-y: auto;
          font-family: 'DM Mono', 'Fira Code', monospace; font-size: 14px;
          line-height: 1.6; color: #0f172a; white-space: pre-wrap; word-break: break-word;
          background: #eff6ff;
        }
        .dark .rsc-output { background: #0c1a2e; color: #e2e8f0; }
        .rsc-footer {
          padding: 14px 20px; border-top: 1px solid #e2e8f0;
          display: flex; gap: 10px; align-items: center; flex-wrap: wrap;
        }
        .dark .rsc-footer { border-top-color: #334155; }
        .rsc-btn {
          padding: 10px 20px; border-radius: 9px; border: none;
          font-size: 14px; font-weight: 600; cursor: pointer;
          transition: all 0.15s; display: inline-flex; align-items: center; gap: 7px;
        }
        .rsc-btn-primary { background: #2563eb; color: white; }
        .rsc-btn-primary:hover { background: #1d4ed8; transform: translateY(-1px); }
        .rsc-btn-secondary { background: #f8fafc; color: #475569; border: 1px solid #e2e8f0; font-size: 13px; padding: 7px 14px; }
        .dark .rsc-btn-secondary { background: #1e293b; color: #94a3b8; border-color: #334155; }
        .rsc-btn-secondary:hover { background: #e2e8f0; color: #0f172a; }
        .dark .rsc-btn-secondary:hover { background: #334155; color: #e2e8f0; }
        .rsc-presets-section { padding: 36px 0; }
        .rsc-section-title { font-size: 22px; font-weight: 700; margin-bottom: 6px; letter-spacing: -0.4px; color: #0f172a; }
        .dark .rsc-section-title { color: #f1f5f9; }
        .rsc-section-sub { color: #475569; margin-bottom: 24px; font-size: 15px; }
        .dark .rsc-section-sub { color: #94a3b8; }
        .rsc-presets-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 14px; }
        .rsc-preset-card {
          background: #fff; border: 1px solid #e2e8f0; border-radius: 12px;
          padding: 18px 16px; cursor: pointer; transition: all 0.15s;
        }
        .dark .rsc-preset-card { background: #1e293b; border-color: #334155; }
        .rsc-preset-card:hover { border-color: #2563eb; box-shadow: 0 4px 12px rgba(37,99,235,0.1); transform: translateY(-2px); }
        .rsc-preset-icon { font-size: 24px; margin-bottom: 10px; }
        .rsc-preset-name { font-weight: 600; font-size: 15px; margin-bottom: 4px; color: #0f172a; }
        .dark .rsc-preset-name { color: #f1f5f9; }
        .rsc-preset-desc { font-size: 13px; color: #475569; }
        .dark .rsc-preset-desc { color: #94a3b8; }
        .rsc-article-section { padding: 0 0 40px; }
        .rsc-article-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 28px; }
        @media (max-width: 768px) { .rsc-article-grid { grid-template-columns: 1fr; } }
        .rsc-article-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 28px; }
        .dark .rsc-article-card { background: #1e293b; border-color: #334155; }
        .rsc-article-card h2 { font-size: 20px; font-weight: 700; margin-bottom: 14px; letter-spacing: -0.3px; color: #0f172a; }
        .dark .rsc-article-card h2 { color: #f1f5f9; }
        .rsc-article-card h3 { font-size: 16px; font-weight: 600; margin: 20px 0 8px; color: #2563eb; }
        .rsc-article-card p { color: #475569; font-size: 15px; line-height: 1.7; margin-bottom: 12px; }
        .dark .rsc-article-card p { color: #94a3b8; }
        .rsc-article-card ul { list-style: none; padding: 0; }
        .rsc-article-card li { padding: 6px 0 6px 20px; position: relative; color: #475569; font-size: 15px; line-height: 1.6; }
        .dark .rsc-article-card li { color: #94a3b8; }
        .rsc-article-card li::before { content: '→'; position: absolute; left: 0; color: #2563eb; font-weight: 700; }
        .rsc-steps-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; margin-top: 20px; }
        .rsc-step-card { background: #f8fafc; border-radius: 12px; padding: 20px; border: 1px solid #e2e8f0; text-align: center; }
        .dark .rsc-step-card { background: #1e293b; border-color: #334155; }
        .rsc-step-card h4 { font-size: 14px; font-weight: 600; margin-bottom: 4px; color: #0f172a; }
        .dark .rsc-step-card h4 { color: #f1f5f9; }
        .rsc-step-card p { font-size: 13px; color: #475569; }
        .dark .rsc-step-card p { color: #94a3b8; }
        .rsc-step-num {
          width: 36px; height: 36px; border-radius: 50%; background: #2563eb; color: white;
          font-weight: 700; font-size: 16px; display: flex; align-items: center; justify-content: center; margin: 0 auto 10px;
        }
        .rsc-faq-item { border-bottom: 1px solid #e2e8f0; }
        .dark .rsc-faq-item { border-bottom-color: #334155; }
        .rsc-faq-q { padding: 14px 0; font-weight: 600; font-size: 15px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; color: #0f172a; }
        .dark .rsc-faq-q { color: #f1f5f9; }
        .rsc-faq-a { font-size: 14px; color: #475569; padding-bottom: 14px; line-height: 1.7; }
        .dark .rsc-faq-a { color: #94a3b8; }
        .rsc-tools-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; }
        .rsc-tool-link {
          background: #fff; border: 1px solid #e2e8f0; border-radius: 10px;
          padding: 14px 16px; text-decoration: none; color: #0f172a;
          display: flex; align-items: center; gap: 10px; font-size: 14px; font-weight: 500; transition: all 0.15s;
        }
        .dark .rsc-tool-link { background: #1e293b; border-color: #334155; color: #e2e8f0; }
        .rsc-tool-link:hover { border-color: #2563eb; color: #2563eb; transform: translateY(-1px); box-shadow: 0 4px 8px rgba(37,99,235,0.08); }
        code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 13px; }
        .dark code { background: #334155; color: #e2e8f0; }
      `}</style>

      {/* HERO */}
      <header className="rsc-hero">
        <div className="rsc-badge">⚡ Instant Tool — No Signup Needed</div>
        <h1>Remove <em>Special Characters</em><br />from Text Online</h1>
        <p>Paste your text below. One click removes all special symbols, punctuation, or custom characters — clean output, instantly. No account, no ads, free forever.</p>
        <div className="rsc-trust">
          <span>100% Free</span>
          <span>Works in Browser</span>
          <span>No Data Stored</span>
          <span>Instant Results</span>
        </div>
      </header>

      <div className="rsc-container">
        {/* TOOL CARD */}
        <div className="rsc-card">
          <div className="rsc-tool-header">
            <div className="rsc-options-row">
              {([
                ['punctuation', 'Remove Punctuation'],
                ['symbols', 'Remove Symbols (@#$%…)'],
                ['numbers', 'Remove Numbers'],
                ['extraSpaces', 'Trim Extra Spaces'],
                ['singleLine', 'Single Line Output'],
              ] as [keyof Options, string][]).map(([key, label]) => (
                <label key={key} className={`rsc-opt-chip${opts[key] ? ' checked' : ''}`}>
                  <input type="checkbox" checked={opts[key]} onChange={e => setOpt(key, e.target.checked)} style={{ accentColor: '#2563eb' }} />
                  {label}
                </label>
              ))}
            </div>
          </div>

          <div className="rsc-editors">
            <div className="rsc-editor-col">
              <div className="rsc-editor-label">
                <span>📋 Paste Your Text</span>
                <span style={{ fontFamily: 'monospace', fontSize: 11 }}>{inputText.length.toLocaleString()} chars</span>
              </div>
              <textarea
                className="rsc-textarea"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                placeholder={`Paste or type your text here…\n\nExample: Hello! How are you? My email is user@example.com — let's talk #soon 😊`}
              />
            </div>
            <div className="rsc-editor-col">
              <div className="rsc-editor-label">
                <span>✅ Clean Output</span>
                <span style={{ fontFamily: 'monospace', fontSize: 11 }}>{outputText.length.toLocaleString()} chars</span>
              </div>
              <div className="rsc-output">{outputText || 'Your cleaned text will appear here…'}</div>
            </div>
          </div>

          <div className="rsc-footer">
            <button className="rsc-btn rsc-btn-primary" onClick={processText}>⚡ Remove Characters</button>
            <button className="rsc-btn rsc-btn-secondary" onClick={clearAll}>Clear</button>
            <button className="rsc-btn rsc-btn-secondary" onClick={loadSample}>Load Sample</button>
            {processed && (
              <button className="rsc-btn rsc-btn-secondary" onClick={copyOutput}>
                {copied ? '✅ Copied!' : '📋 Copy Result'}
              </button>
            )}
            {processed && (
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 16, fontSize: 12, color: '#94a3b8', alignItems: 'center' }}>
                <span>Removed: <strong style={{ color: '#475569' }}>{removedCount.toLocaleString()}</strong> chars</span>
                <span>Saved: <strong style={{ color: '#475569' }}>{savedPct}</strong>%</span>
              </div>
            )}
          </div>
        </div>

        {/* QUICK PRESETS */}
        <div className="rsc-presets-section">
          <h2 className="rsc-section-title">Quick Presets — One Click Clean</h2>
          <p className="rsc-section-sub">Pick what kind of content you're cleaning. Each preset applies the right settings automatically.</p>
          <div className="rsc-presets-grid">
            {([
              ['csv',      '📊', 'CSV / Spreadsheet Data',     'Removes quotes, pipes, brackets for clean CSV rows'],
              ['seo',      '🔍', 'SEO / Meta Tags',             'Clean keywords by removing em-dashes, pipes, brackets'],
              ['email',    '📧', 'Email Content',               'Strip symbols but keep periods and commas for readability'],
              ['code',     '💻', 'Code / Variable Names',       'Remove non-alphanumeric chars, keep underscores & hyphens'],
              ['database', '🗄️', 'Database / SQL',              'Sanitize input by removing quotes, slashes, escape chars'],
              ['plain',    '📝', 'Plain Readable Text',         'Keep only letters, numbers, spaces — nothing else'],
            ] as [PresetKey, string, string, string][]).map(([key, icon, name, desc]) => (
              <div key={key} className="rsc-preset-card" onClick={() => applyPreset(key)}>
                <div className="rsc-preset-icon">{icon}</div>
                <div className="rsc-preset-name">{name}</div>
                <div className="rsc-preset-desc">{desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* HOW TO USE */}
        <div className="rsc-article-section">
          <div className="rsc-article-card" style={{ marginBottom: 24 }}>
            <h2>How to Remove Special Characters — 3 Simple Steps</h2>
            <div className="rsc-steps-grid">
              {[
                ['1', 'Paste Your Text', 'Copy text from anywhere — Word, Excel, PDF, website, database — and paste in the left box.'],
                ['2', 'Choose Options', 'Select which characters to remove: punctuation, symbols, numbers, or use a ready-made preset.'],
                ['3', 'Copy Clean Text', 'Click "Remove Characters" — your cleaned text appears instantly. Copy and use anywhere.'],
              ].map(([num, title, desc]) => (
                <div key={num} className="rsc-step-card">
                  <div className="rsc-step-num">{num}</div>
                  <h4>{title}</h4>
                  <p>{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ARTICLE + SIDEBAR */}
          <div className="rsc-article-grid">
            <div className="rsc-article-card">
              <h2>Why You Need to Remove Special Characters</h2>
              <p>Special characters are symbols like <code>@</code>, <code>#</code>, <code>$</code>, <code>%</code>, <code>&amp;</code>, <code>*</code>, brackets, pipes, and punctuation marks that often cause problems when text moves between systems.</p>
              <h3>When Does This Actually Happen?</h3>
              <p>You export data from one system, paste it into another — and things break. A product name like <em>"Shirt (Blue) — Size L"</em> creates errors in a CSV file. An email subject with <em>"20% OFF!!!"</em> lands in spam. A variable name with spaces or dashes won't compile.</p>
              <p>This tool solves that in one click. No formulas, no scripting, no technical knowledge needed.</p>
              <h3>Common Use Cases</h3>
              <ul>
                <li><strong>SEO writers</strong> cleaning keyword lists before uploading to tools</li>
                <li><strong>Developers</strong> sanitizing user input or normalizing data</li>
                <li><strong>Data analysts</strong> cleaning CSV exports from CRMs or databases</li>
                <li><strong>Email marketers</strong> fixing subject lines for better deliverability</li>
                <li><strong>Content writers</strong> converting AI-generated text to clean plain text</li>
                <li><strong>Students</strong> cleaning citations and references for formatting</li>
              </ul>
              <h3>What Counts as a "Special Character"?</h3>
              <p>Any character that isn't a standard letter (A-Z), number (0-9), or basic space. This includes:</p>
              <ul>
                <li>Punctuation: <code>! ? . , ; : ' " -</code></li>
                <li>Symbols: <code>@ # $ % ^ &amp; * ( ) + = [ ] {'{'} {'}'} | \ / &lt; &gt;</code></li>
                <li>Unicode extras: em-dashes, curly quotes, bullet points, copyright symbols</li>
                <li>Emoji and decorative characters</li>
              </ul>
            </div>

            {/* SIDEBAR */}
            <div>
              <div className="rsc-article-card" style={{ marginBottom: 16 }}>
                <h2 style={{ fontSize: 17 }}>🔗 Related Text Tools</h2>
                <p style={{ fontSize: 13 }}>These tools work great alongside this one:</p>
                <ul>
                  {[
                    ['/tool/clean-text-online-free', 'Clean Text Online Free — full deep clean'],
                    ['/tool/remove-extra-spaces-online', 'Remove Extra Spaces — fix whitespace'],
                    ['/tool/remove-duplicate-lines-tool', 'Remove Duplicate Lines — deduplicate'],
                    ['/tool/remove-html-tags-online', 'Remove HTML Tags — strip markup'],
                    ['/tool/remove-punctuation-tool', 'Remove Punctuation — punctuation only'],
                    ['/tool/remove-line-breaks-tool', 'Remove Line Breaks — flatten to one line'],
                  ].map(([href, label]) => (
                    <li key={href}><a href={href} style={{ color: '#2563eb' }}>{label}</a></li>
                  ))}
                </ul>
              </div>
              <div className="rsc-article-card">
                <h2 style={{ fontSize: 17 }}>💡 Pro Tips</h2>
                <ul>
                  <li>Use the <strong>CSV preset</strong> before uploading product data to Shopify, WooCommerce, or Amazon</li>
                  <li>Use <strong>SEO preset</strong> to clean keyword lists before pasting into Ahrefs or SEMrush</li>
                  <li>Combine with <a href="/tool/remove-extra-spaces-online" style={{ color: '#2563eb' }}>Remove Extra Spaces</a> for fully clean output</li>
                  <li>Use <strong>Code preset</strong> to create safe slug or variable names from product titles</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="rsc-article-section">
          <div className="rsc-article-card">
            <h2>Frequently Asked Questions</h2>
            {faqs.map((faq, i) => (
              <div key={i} className="rsc-faq-item">
                <div className="rsc-faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span>{faq.q}</span>
                  <span style={{ fontSize: 20, color: '#2563eb' }}>{openFaq === i ? '−' : '+'}</span>
                </div>
                {openFaq === i && <div className="rsc-faq-a">{faq.a}</div>}
              </div>
            ))}
          </div>
        </div>

        {/* MORE TOOLS */}
        <div style={{ paddingBottom: 48 }}>
          <h2 className="rsc-section-title">More Free Text Tools</h2>
          <p className="rsc-section-sub">Explore 50+ free tools on Texly — all in your browser, no signup needed.</p>
          <div className="rsc-tools-grid">
            {[
              ['/tool/text-to-list-converter', '📋', 'Text to List Converter'],
              ['/tool/remove-duplicate-lines-tool', '🗂', 'Remove Duplicate Lines'],
              ['/tool/find-and-replace-text-online', '🔄', 'Find & Replace Text'],
              ['/tool/word-counter-online-free', '📊', 'Word Counter'],
              ['/tool/upper-case-converter', '🔤', 'Uppercase Converter'],
              ['/tool/title-case-converter', '🅣', 'Title Case Converter'],
              ['/tool/morse-code-translator', '📡', 'Morse Code Translator'],
              ['/tool/character-counter-tool', '🔢', 'Character Counter'],
              ['/tool/remove-line-breaks-tool', '↩', 'Remove Line Breaks'],
              ['/tool/pdf-editor-online', '📄', 'PDF Editor Online'],
              ['/ai-tools', '🤖', 'AI Tools'],
            ].map(([href, icon, label]) => (
              <a key={href} href={href} className="rsc-tool-link">
                <span style={{ fontSize: 18 }}>{icon}</span>
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* TOAST */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24,
          background: '#1e293b', color: 'white', padding: '12px 20px',
          borderRadius: 10, fontSize: 14, fontWeight: 500, zIndex: 999,
        }}>{toast}</div>
      )}
    </>
  );
}
