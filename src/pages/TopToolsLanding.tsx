/**
 * TopToolsLanding.tsx
 * High-CTR landing page for Texly's top 5 tools with strong SEO signals
 * Route: /best-free-text-tools-online
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const SEO_TITLE = 'Best Free Online Text Tools — Uppercase, Find & Replace, Text Cleaner, URL Decoder & More | Texly';
const SEO_DESC = 'Instantly clean, convert & format text online — free, no login, no download. Top-rated tools: Uppercase Converter, Find & Replace, Text Repeater, URL Decoder, Text Cleaner. Works on all devices!';
const SEO_KEYWORDS = 'free online text tools, text converter online free, clean text online, uppercase converter free, find and replace text online, text repeater tool, url decode online, text cleaner online free, best text tools 2025, text formatting tools';
const CANONICAL = 'https://www.texlyonline.in/best-free-text-tools-online';

const TOP_TOOLS = [
  {
    slug: 'upper-case-converter',
    icon: '🔡',
    color: '#0ea5e9',
    darkColor: '#38bdf8',
    bg: '#f0f9ff',
    darkBg: '#0c1a2e',
    badge: 'MOST POPULAR',
    name: 'Uppercase Converter',
    tagline: 'Convert any text to ALL CAPS instantly',
    desc: 'Turn any text UPPERCASE in one click — perfect for code constants, headings, emphasis, and more. Handles accented letters too.',
    usedFor: ['Code constants (MAX_VALUE)', 'Warning headings', 'Acronyms & abbreviations', 'Social media emphasis'],
    cta: 'Convert to UPPERCASE →',
    impressions: '227',
    position: '25',
  },
  {
    slug: 'find-and-replace-text-online',
    icon: '🔍',
    color: '#8b5cf6',
    darkColor: '#a78bfa',
    bg: '#faf5ff',
    darkBg: '#130a2e',
    badge: 'POWER TOOL',
    name: 'Find & Replace Text',
    tagline: 'Bulk replace words and phrases in any text',
    desc: 'Replace single words or bulk-swap dozens of phrases at once. Supports case-sensitive search, whole-word match, and multiple replacements.',
    usedFor: ['Document editing', 'Code refactoring', 'Template customization', 'Batch text cleanup'],
    cta: 'Find & Replace Now →',
    impressions: '257',
    position: '22',
  },
  {
    slug: 'text-repeater-tool',
    icon: '🔁',
    color: '#10b981',
    darkColor: '#34d399',
    bg: '#f0fdf4',
    darkBg: '#0a2018',
    badge: 'FUN & USEFUL',
    name: 'Text Repeater',
    tagline: 'Repeat any text up to 1000× instantly',
    desc: 'Repeat any word, phrase, or paragraph as many times as you need. Choose custom separators — newline, comma, space, or your own.',
    usedFor: ['Load & stress testing', 'Placeholder content', 'Social media fun', 'Data generation'],
    cta: 'Repeat Text Now →',
    impressions: '196',
    position: '9',
  },
  {
    slug: 'url-decode-online',
    icon: '🔗',
    color: '#f59e0b',
    darkColor: '#fbbf24',
    bg: '#fffbeb',
    darkBg: '#1a1200',
    badge: 'DEV ESSENTIAL',
    name: 'URL Decoder',
    tagline: 'Convert %20 encoded URLs to readable text',
    desc: 'Decode percent-encoded URL strings (%20, %2F, %3A) back to human-readable text in one click. Essential for debugging API calls and web dev.',
    usedFor: ['API debugging', 'SEO URL analysis', 'Query string reading', 'Web scraping cleanup'],
    cta: 'Decode URL Now →',
    impressions: '143',
    position: '35',
  },
  {
    slug: 'clean-text-online-free',
    icon: '🧹',
    color: '#ef4444',
    darkColor: '#f87171',
    bg: '#fff1f2',
    darkBg: '#1a0808',
    badge: 'EDITOR FAVORITE',
    name: 'Text Cleaner',
    tagline: 'Remove spaces, HTML tags & hidden characters',
    desc: 'Clean messy copy-pasted text — remove extra spaces, smart quotes, HTML tags, invisible Unicode chars, and more. One click, perfect output.',
    usedFor: ['Cleaning PDF copy-paste', 'Blog post formatting', 'Database import prep', 'Removing hidden chars'],
    cta: 'Clean Text Now →',
    impressions: '142',
    position: '16',
  },
];

const TRUST_BADGES = [
  { icon: '⚡', label: 'Instant Results', sub: 'No waiting, no loading' },
  { icon: '🔒', label: '100% Private', sub: 'Runs in your browser' },
  { icon: '🎁', label: 'Always Free', sub: 'No hidden costs ever' },
  { icon: '📱', label: 'Works Everywhere', sub: 'Mobile & desktop ready' },
];

export default function TopToolsLanding() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    { q: 'Are all these text tools really free?', a: 'Yes, completely free — no sign-up, no credit card, no subscription. Every tool on Texly is free forever. We keep the lights on with unobtrusive ads.' },
    { q: 'Is my text data private?', a: 'Absolutely. Every tool processes your text locally in your browser using JavaScript. Your text is never sent to any server or stored anywhere. We have zero access to what you type.' },
    { q: 'Do these tools work on mobile phones?', a: 'Yes, all Texly tools are fully responsive and work on any smartphone or tablet. No app download required — just open in your mobile browser.' },
    { q: 'Is there a character or word limit?', a: 'No hard limits. Since everything runs in your browser, the only constraint is your device\'s memory. We\'ve tested with texts over 500,000 characters without issues.' },
    { q: 'Which tool should I use to clean copy-pasted text?', a: 'Use the Text Cleaner — it removes extra spaces, smart quotes, HTML tags, invisible Unicode characters, and other formatting artifacts that sneak in when you copy text from PDFs, Word docs, or websites.' },
  ];

  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Best Free Online Text Tools",
    "description": SEO_DESC,
    "url": CANONICAL,
    "numberOfItems": TOP_TOOLS.length,
    "itemListElement": TOP_TOOLS.map((tool, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "name": tool.name,
      "url": `https://www.texlyonline.in/tool/${tool.slug}`,
      "description": tool.desc
    }))
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(f => ({
      "@type": "Question",
      "name": f.q,
      "acceptedAnswer": { "@type": "Answer", "text": f.a }
    }))
  };

  return (
    <>
      <Helmet>
        <title>{SEO_TITLE}</title>
        <meta name="description" content={SEO_DESC} />
        <meta name="keywords" content={SEO_KEYWORDS} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={CANONICAL} />
        <meta property="og:title" content="5 Best Free Online Text Tools — Clean, Convert & Format Text Instantly" />
        <meta property="og:description" content={SEO_DESC} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={CANONICAL} />
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      <style>{`
        /* ===== BASE / MOBILE-FIRST ===== */
        * { box-sizing: border-box; }

        .ttl-hero {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
          color: white;
          padding: 40px 16px 36px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .ttl-hero::before {
          content: ''; position: absolute; top: -100px; left: 50%; transform: translateX(-50%);
          width: 100%; max-width: 700px; height: 400px;
          background: radial-gradient(ellipse, rgba(59,130,246,0.15) 0%, transparent 70%);
          pointer-events: none;
        }
        .ttl-hero::after {
          content: ''; position: absolute; inset: 0;
          background-image: linear-gradient(rgba(100,116,139,0.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(100,116,139,0.07) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none;
        }
        .ttl-hero-inner { position: relative; z-index: 1; max-width: 800px; margin: 0 auto; }

        .ttl-super-badge {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(59,130,246,0.15); border: 1px solid rgba(59,130,246,0.3);
          padding: 5px 12px; border-radius: 100px; font-size: 10px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 1.5px; color: #60a5fa; margin-bottom: 16px;
        }
        .ttl-hero h1 {
          font-size: clamp(26px, 7vw, 56px); font-weight: 900; line-height: 1.1;
          letter-spacing: -1px; margin-bottom: 16px;
        }
        .ttl-hero h1 em { color: #60a5fa; font-style: normal; }
        .ttl-hero h1 strong { color: #34d399; font-weight: 900; }
        .ttl-hero p {
          font-size: 15px; color: #94a3b8; max-width: 560px;
          margin: 0 auto 28px; line-height: 1.65;
        }

        /* Trust chips — wrap freely on small screens */
        .ttl-trust-row {
          display: flex; flex-wrap: wrap; justify-content: center; gap: 8px;
        }
        .ttl-trust-chip {
          display: flex; align-items: center; gap: 6px;
          background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
          padding: 6px 12px; border-radius: 100px; font-size: 12px; color: #cbd5e1; font-weight: 500;
        }

        /* Container */
        .ttl-container { max-width: 1100px; margin: 0 auto; padding: 0 16px; }
        .ttl-section { padding: 40px 0 12px; }

        .ttl-section-label {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px;
          color: #3b82f6; margin-bottom: 8px;
        }
        .ttl-section-title {
          font-size: clamp(20px, 5vw, 32px); font-weight: 800; letter-spacing: -0.5px;
          color: #0f172a; margin-bottom: 6px;
        }
        .dark .ttl-section-title { color: #f1f5f9; }
        .ttl-section-sub { font-size: 15px; color: #64748b; margin-bottom: 28px; }
        .dark .ttl-section-sub { color: #94a3b8; }

        /* ===== TOOL CARDS — mobile: stacked column ===== */
        .ttl-tools-list { display: flex; flex-direction: column; gap: 16px; margin-bottom: 32px; }

        .ttl-tool-card {
          background: #fff; border: 1px solid #e2e8f0; border-radius: 16px;
          overflow: hidden; transition: all 0.2s; display: flex; flex-direction: column;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
        }
        .dark .ttl-tool-card { background: #1e293b; border-color: #334155; }
        .ttl-tool-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.1); }
        .dark .ttl-tool-card:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.3); }

        /* Header = icon + name row */
        .ttl-tool-header {
          display: flex; flex-direction: column; gap: 0;
          padding: 18px 18px 14px;
        }
        .ttl-tool-header-top {
          display: flex; align-items: center; gap: 12px; margin-bottom: 12px;
        }
        .ttl-tool-icon-wrap {
          width: 48px; height: 48px; border-radius: 12px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center; font-size: 22px;
        }
        .ttl-tool-badge {
          display: inline-block; font-size: 9px; font-weight: 800; letter-spacing: 1.5px;
          text-transform: uppercase; padding: 2px 8px; border-radius: 4px; margin-bottom: 4px;
        }
        .ttl-tool-name { font-size: 17px; font-weight: 800; color: #0f172a; letter-spacing: -0.3px; }
        .dark .ttl-tool-name { color: #f1f5f9; }
        .ttl-tool-tagline { font-size: 13px; font-weight: 600; color: #64748b; margin-bottom: 8px; }
        .dark .ttl-tool-tagline { color: #94a3b8; }
        .ttl-tool-desc { font-size: 13px; color: #475569; line-height: 1.65; }
        .dark .ttl-tool-desc { color: #94a3b8; }

        /* Body = chips + CTA */
        .ttl-tool-body {
          padding: 0 18px 18px;
          display: flex; flex-direction: column; gap: 14px;
        }
        .ttl-use-list { flex: 1; }
        .ttl-use-title {
          font-size: 10px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 1px; color: #94a3b8; margin-bottom: 6px;
        }
        .ttl-use-chips { display: flex; flex-wrap: wrap; gap: 5px; }
        .ttl-use-chip {
          background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;
          padding: 4px 9px; font-size: 11px; font-weight: 500; color: #475569;
        }
        .dark .ttl-use-chip { background: #0f172a; border-color: #334155; color: #94a3b8; }

        /* CTA full width on mobile */
        .ttl-tool-cta {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          padding: 12px 18px; border-radius: 10px; font-size: 14px; font-weight: 700;
          text-decoration: none; color: white; transition: all 0.15s;
          white-space: nowrap; width: 100%;
        }
        .ttl-tool-cta:hover { opacity: 0.9; transform: translateY(-1px); }

        /* Trust badges grid — 2 cols on mobile */
        .ttl-badges-grid {
          display: grid; grid-template-columns: repeat(2, 1fr);
          gap: 12px; margin: 0 0 40px;
        }
        .ttl-badge-card {
          background: #fff; border: 1px solid #e2e8f0; border-radius: 12px;
          padding: 14px 14px; display: flex; align-items: center; gap: 10px;
        }
        .dark .ttl-badge-card { background: #1e293b; border-color: #334155; }
        .ttl-badge-icon { font-size: 24px; flex-shrink: 0; }
        .ttl-badge-label { font-weight: 700; font-size: 13px; color: #0f172a; margin-bottom: 2px; }
        .dark .ttl-badge-label { color: #f1f5f9; }
        .ttl-badge-sub { font-size: 11px; color: #64748b; }
        .dark .ttl-badge-sub { color: #94a3b8; }

        /* FAQ */
        .ttl-faq-section { padding: 0 0 40px; }
        .ttl-faq-wrap { background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; overflow: hidden; }
        .dark .ttl-faq-wrap { background: #1e293b; border-color: #334155; }
        .ttl-faq-item { border-bottom: 1px solid #e2e8f0; }
        .dark .ttl-faq-item { border-bottom-color: #334155; }
        .ttl-faq-item:last-child { border-bottom: none; }
        .ttl-faq-q {
          padding: 16px 18px; font-weight: 600; font-size: 14px;
          cursor: pointer; display: flex; justify-content: space-between; align-items: center;
          color: #0f172a; gap: 12px;
        }
        .dark .ttl-faq-q { color: #f1f5f9; }
        .ttl-faq-a { padding: 0 18px 16px; font-size: 13px; color: #475569; line-height: 1.7; }
        .dark .ttl-faq-a { color: #94a3b8; }

        /* CTA Banner */
        .ttl-cta-banner {
          background: linear-gradient(135deg, #1e40af 0%, #3b82f6 60%, #06b6d4 100%);
          border-radius: 16px; padding: 28px 20px; text-align: center; margin-bottom: 40px; color: white;
        }
        .ttl-cta-banner h2 {
          font-size: clamp(18px, 5vw, 30px); font-weight: 800; margin-bottom: 10px; letter-spacing: -0.4px;
        }
        .ttl-cta-banner p { font-size: 14px; opacity: 0.85; margin-bottom: 20px; }
        .ttl-cta-banner a {
          display: inline-flex; align-items: center; gap: 8px;
          background: white; color: #1e40af; font-weight: 700; font-size: 14px;
          padding: 11px 24px; border-radius: 100px; text-decoration: none; transition: all 0.15s;
        }
        .ttl-cta-banner a:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.15); }

        /* ===== TABLET (≥ 480px) ===== */
        @media (min-width: 480px) {
          .ttl-hero { padding: 52px 24px 44px; }
          .ttl-hero p { font-size: 16px; }
          .ttl-tool-header { padding: 22px 22px 16px; }
          .ttl-tool-icon-wrap { width: 52px; height: 52px; font-size: 24px; }
          .ttl-tool-name { font-size: 18px; }
          .ttl-tool-body { padding: 0 22px 22px; }
          .ttl-tool-cta { width: auto; align-self: flex-start; }
          .ttl-badges-grid { grid-template-columns: repeat(2, 1fr); gap: 14px; }
          .ttl-cta-banner { padding: 34px 28px; }
        }

        /* ===== DESKTOP (≥ 768px) ===== */
        @media (min-width: 768px) {
          .ttl-hero { padding: 64px 24px 52px; }
          .ttl-hero p { font-size: 17px; margin-bottom: 36px; }
          .ttl-trust-chip { font-size: 13px; padding: 8px 16px; }
          .ttl-container { padding: 0 24px; }
          .ttl-section { padding: 56px 0 16px; }
          .ttl-section-sub { font-size: 16px; margin-bottom: 40px; }
          .ttl-tools-list { gap: 24px; margin-bottom: 40px; }

          /* Side-by-side card layout on desktop */
          .ttl-tool-card { flex-direction: row; align-items: stretch; }
          .ttl-tool-header {
            flex: 1; border-right: 1px solid #e2e8f0;
            padding: 28px; flex-direction: column; justify-content: flex-start;
          }
          .dark .ttl-tool-header { border-right-color: #334155; }
          .ttl-tool-body {
            flex: 1.4; flex-direction: column; padding: 28px; justify-content: space-between;
          }
          .ttl-tool-icon-wrap { width: 56px; height: 56px; font-size: 26px; }
          .ttl-tool-name { font-size: 20px; }
          .ttl-tool-desc { font-size: 14px; }
          .ttl-use-chip { font-size: 12px; }
          .ttl-tool-cta { width: auto; align-self: flex-start; padding: 12px 22px; }

          .ttl-badges-grid { grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; margin: 0 0 56px; }
          .ttl-badge-card { padding: 20px 18px; border-radius: 14px; }
          .ttl-badge-icon { font-size: 28px; }
          .ttl-badge-label { font-size: 15px; }
          .ttl-badge-sub { font-size: 12px; }

          .ttl-faq-section { padding: 0 0 56px; }
          .ttl-faq-q { padding: 18px 24px; font-size: 15px; }
          .ttl-faq-a { padding: 0 24px 18px; font-size: 14px; }

          .ttl-cta-banner { border-radius: 20px; padding: 40px 32px; margin-bottom: 56px; }
          .ttl-cta-banner p { font-size: 15px; }
          .ttl-cta-banner a { font-size: 15px; padding: 12px 28px; }
        }

        /* ===== LARGE (≥ 1024px) ===== */
        @media (min-width: 1024px) {
          .ttl-super-badge { font-size: 11px; padding: 6px 16px; }
          .ttl-section-label { font-size: 11px; }
        }
      `}</style>

      {/* HERO */}
      <header className="ttl-hero">
        <div className="ttl-hero-inner">
          <div className="ttl-super-badge">
            <span>🏆</span> Texly's Top 5 Free Text Tools
          </div>
          <h1>
            The Best <em>Free Online</em><br />
            Text Tools for <strong>2025</strong>
          </h1>
          <p>
            Clean, convert, format, and transform your text in seconds — no login, no download, no cost. Used by writers, developers, SEO pros, and students daily.
          </p>
          <div className="ttl-trust-row">
            {TRUST_BADGES.map(b => (
              <div key={b.label} className="ttl-trust-chip">
                <span>{b.icon}</span> {b.label}
              </div>
            ))}
          </div>
        </div>
      </header>

      <div className="ttl-container">

        {/* TOP 5 TOOLS */}
        <section className="ttl-section" aria-label="Top 5 text tools">
          <div className="ttl-section-label">⚡ Ranked by Popularity & Usefulness</div>
          <h2 className="ttl-section-title">Top 5 Free Online Text Tools</h2>
          <p className="ttl-section-sub">Each tool opens instantly — no signup, no download, works on any device.</p>

          <div className="ttl-tools-list">
            {TOP_TOOLS.map((tool, i) => (
              <article key={tool.slug} className="ttl-tool-card">
                <div className="ttl-tool-header">
                  <div className="ttl-tool-header-top">
                    <div className="ttl-tool-icon-wrap" style={{ background: tool.bg }}>
                      {tool.icon}
                    </div>
                    <div>
                      <div
                        className="ttl-tool-badge"
                        style={{ background: tool.bg, color: tool.color }}
                      >
                        #{i + 1} {tool.badge}
                      </div>
                      <div className="ttl-tool-name">{tool.name}</div>
                    </div>
                  </div>
                  <div className="ttl-tool-tagline">↗ {tool.tagline}</div>
                  <div className="ttl-tool-desc">{tool.desc}</div>
                </div>

                <div className="ttl-tool-body">
                  <div className="ttl-use-list">
                    <div className="ttl-use-title">Used For</div>
                    <div className="ttl-use-chips">
                      {tool.usedFor.map(u => (
                        <span key={u} className="ttl-use-chip">{u}</span>
                      ))}
                    </div>
                  </div>
                  <Link
                    to={`/tool/${tool.slug}`}
                    className="ttl-tool-cta"
                    style={{ background: tool.color }}
                  >
                    {tool.cta}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* WHY TEXLY TRUST BADGES */}
        <section aria-label="Why choose Texly">
          <h2 className="ttl-section-title" style={{ marginBottom: 20 }}>Why Millions Use Texly</h2>
          <div className="ttl-badges-grid">
            {TRUST_BADGES.map(b => (
              <div key={b.label} className="ttl-badge-card">
                <div className="ttl-badge-icon">{b.icon}</div>
                <div>
                  <div className="ttl-badge-label">{b.label}</div>
                  <div className="ttl-badge-sub">{b.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="ttl-faq-section" aria-label="Frequently asked questions">
          <h2 className="ttl-section-title" style={{ marginBottom: 20 }}>Frequently Asked Questions</h2>
          <div className="ttl-faq-wrap">
            {faqs.map((faq, i) => (
              <div key={i} className="ttl-faq-item">
                <div
                  className="ttl-faq-q"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  role="button"
                  aria-expanded={openFaq === i}
                >
                  <span>{faq.q}</span>
                  <span style={{ flexShrink: 0, transition: 'transform 0.2s', transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0deg)', fontSize: 18, color: '#94a3b8' }}>⌄</span>
                </div>
                {openFaq === i && (
                  <div className="ttl-faq-a">{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* CTA BANNER */}
        <div className="ttl-cta-banner">
          <h2>Explore 100+ Free Text Tools</h2>
          <p>From case converters to AI-powered rewriters — everything you need to work with text, all in one place.</p>
          <Link to="/">Browse All Tools →</Link>
        </div>

      </div>
    </>
  );
}
