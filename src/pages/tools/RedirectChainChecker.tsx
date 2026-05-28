/**
 * RedirectChainChecker.tsx
 * Route: /tools/redirect-chain-checker
 * Target keywords: redirect chain checker, redirect checker, url redirect checker, redirect path checker
 */

import React, { useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Copy,
  Check,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ExternalLink,
  Link2,
  Clock,
  ChevronDown,
  ChevronUp,
  Download,
} from 'lucide-react';

const BASE = 'https://www.texlyonline.in';
const CANONICAL = `${BASE}/tools/redirect-chain-checker`;

interface RedirectStep {
  url: string;
  status: number;
  statusText: string;
  timing: number;
  type: '301' | '302' | '307' | '308' | '200' | 'error' | 'other';
}

interface ChainResult {
  steps: RedirectStep[];
  finalUrl: string;
  depth: number;
  hasLoop: boolean;
  totalTime: number;
  warnings: string[];
  error?: string;
}

const STATUS_COLORS: Record<string, string> = {
  '200': 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
  '301': 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
  '302': 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
  '307': 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
  '308': 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800',
  'error': 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
};

function getStatusColor(status: number): string {
  const key = String(status);
  return STATUS_COLORS[key] || 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700';
}

function getStatusLabel(status: number): string {
  const labels: Record<number, string> = {
    200: 'OK', 301: 'Moved Permanently', 302: 'Found', 303: 'See Other',
    307: 'Temporary Redirect', 308: 'Permanent Redirect', 404: 'Not Found',
    403: 'Forbidden', 500: 'Server Error', 0: 'Network Error',
  };
  return labels[status] || `HTTP ${status}`;
}

// Simulate redirect chain analysis (client-side via fetch with no-redirect)
async function analyzeRedirects(inputUrl: string): Promise<ChainResult> {
  const steps: RedirectStep[] = [];
  const warnings: string[] = [];
  const visitedUrls = new Set<string>();
  let currentUrl = inputUrl;
  let totalTime = 0;
  const maxRedirects = 10;

  if (!inputUrl.startsWith('http://') && !inputUrl.startsWith('https://')) {
    currentUrl = 'https://' + inputUrl;
  }

  try {
    new URL(currentUrl);
  } catch {
    return {
      steps: [], finalUrl: inputUrl, depth: 0, hasLoop: false,
      totalTime: 0, warnings: [], error: 'Invalid URL format. Please enter a valid URL.',
    };
  }

  for (let i = 0; i < maxRedirects; i++) {
    if (visitedUrls.has(currentUrl)) {
      warnings.push('🔄 Redirect loop detected! This URL chains back to a previously visited URL.');
      return { steps, finalUrl: currentUrl, depth: steps.length, hasLoop: true, totalTime, warnings };
    }
    visitedUrls.add(currentUrl);

    const start = performance.now();
    try {
      const res = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(currentUrl)}`, {
        method: 'HEAD',
        redirect: 'manual',
      });

      const timing = Math.round(performance.now() - start);
      totalTime += timing;

      const status = res.status;
      const isRedirect = [301, 302, 303, 307, 308].includes(status);
      const location = res.headers.get('location');

      const step: RedirectStep = {
        url: currentUrl,
        status,
        statusText: getStatusLabel(status),
        timing,
        type: isRedirect ? (String(status) as RedirectStep['type']) : status === 200 ? '200' : 'other',
      };
      steps.push(step);

      if (!isRedirect || !location) break;

      // Resolve relative location
      try {
        currentUrl = new URL(location, currentUrl).href;
      } catch {
        currentUrl = location;
      }

      if (steps.length >= 3) warnings.push('⚠️ Deep redirect chain detected — 3+ hops hurt page speed and may dilute link equity.');
    } catch {
      const timing = Math.round(performance.now() - start);
      totalTime += timing;
      steps.push({ url: currentUrl, status: 0, statusText: 'Network Error', timing, type: 'error' });
      warnings.push('❌ Could not reach this URL. Check CORS or network connectivity.');
      break;
    }
  }

  if (steps.length >= maxRedirects) {
    warnings.push(`⚠️ Maximum redirect depth (${maxRedirects}) reached. Possible infinite redirect loop.`);
  }

  const finalStep = steps[steps.length - 1];
  if (finalStep?.status === 301 || finalStep?.status === 308) {
    // Good — permanent redirect
  } else if (finalStep?.status === 302 || finalStep?.status === 307) {
    warnings.push('💡 Final redirect is temporary (302/307). For SEO, prefer 301 (permanent redirect) when moving content permanently.');
  }

  return {
    steps,
    finalUrl: currentUrl,
    depth: steps.length,
    hasLoop: false,
    totalTime,
    warnings,
  };
}

// ─── FAQ Data ────────────────────────────────────────────────────────────────
const FAQS = [
  { q: 'What is a redirect chain?', a: 'A redirect chain occurs when URL A redirects to URL B, which then redirects to URL C. Each hop in the chain adds latency and can dilute SEO link equity, so Google recommends keeping chains to 1 hop.' },
  { q: 'How do redirect chains affect SEO?', a: 'Each redirect adds server round-trips, slowing page load. Google passes PageRank through 301 redirects but loses some equity per hop. Long chains can also confuse crawlers and cause indexing delays.' },
  { q: 'What is a redirect loop?', a: 'A redirect loop happens when URL A → B → C → A, creating an infinite cycle. Browsers detect this after a few hops and show an error. Loops prevent pages from ever loading.' },
  { q: 'What is the difference between 301 and 302 redirects?', a: '301 is a permanent redirect — it signals that the page has moved forever and browsers/bots should update their cache. 302 is temporary — the original URL should remain bookmarked. For SEO, use 301 when moving content permanently.' },
  { q: 'How many redirects is too many?', a: 'Google recommends no more than 5 redirects per chain. Ideally, you want direct 301 redirects (1 hop). Each hop beyond that costs roughly 200–500ms and reduces link equity transfer.' },
];

export default function RedirectChainChecker() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<ChainResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleCheck = useCallback(async () => {
    if (!url.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await analyzeRedirects(url.trim());
      setResult(data);
    } finally {
      setLoading(false);
    }
  }, [url]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleCheck();
  };

  const handleCopy = async () => {
    if (!result) return;
    const text = result.steps.map((s, i) => `${i + 1}. [${s.status}] ${s.url} (${s.timing}ms)`).join('\n') +
      `\nFinal URL: ${result.finalUrl}\nTotal time: ${result.totalTime}ms`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    if (!result) return;
    const csv = ['Step,Status,Status Text,URL,Time(ms)',
      ...result.steps.map((s, i) => `${i + 1},${s.status},"${s.statusText}","${s.url}",${s.timing}`),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'redirect-chain.csv';
    a.click();
  };

  const schemaOrg = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: 'Redirect Chain Checker',
        applicationCategory: 'WebApplication',
        operatingSystem: 'Any',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        url: CANONICAL,
        description: 'Free online redirect chain checker. Analyze URL redirect paths, detect redirect loops, and see HTTP status codes.',
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: BASE },
          { '@type': 'ListItem', position: 2, name: 'Tools', item: `${BASE}/tools` },
          { '@type': 'ListItem', position: 3, name: 'Redirect Chain Checker', item: CANONICAL },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: FAQS.map(f => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
    ],
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4">
      <Helmet>
        <title>Redirect Chain Checker — Free URL Redirect Path Analyzer | Texly</title>
        <meta name="description" content="Free redirect chain checker. Analyze URL redirect paths, detect redirect loops, check HTTP status codes (301, 302, 307, 308), and measure redirect depth for SEO." />
        <meta name="keywords" content="redirect chain checker, redirect checker, url redirect checker, redirect path checker, 301 redirect checker, redirect loop detector, http redirect analyzer" />
        <link rel="canonical" href={CANONICAL} />
        <meta property="og:title" content="Redirect Chain Checker — Free URL Redirect Path Analyzer" />
        <meta property="og:description" content="Analyze URL redirect chains, detect loops, and check HTTP status codes for free." />
        <meta property="og:url" content={CANONICAL} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Redirect Chain Checker — Free URL Redirect Path Analyzer" />
        <meta name="twitter:description" content="Analyze URL redirect chains, detect loops, and check HTTP status codes for free." />
        <script type="application/ld+json">{JSON.stringify(schemaOrg)}</script>
      </Helmet>

      <div className="max-w-3xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-6">
          <Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400">Home</Link>
          <ChevronDown className="w-3 h-3 rotate-[-90deg]" />
          <span>Redirect Chain Checker</span>
        </nav>

        {/* Hero */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-4">
            <Link2 className="w-8 h-8" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-3">
            Redirect Chain Checker
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Analyze URL redirect paths, detect redirect loops, and check HTTP status codes.
            Fix redirect chains to improve SEO and page speed.
          </p>
        </div>

        {/* Input */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5 mb-6">
          <label htmlFor="url-input" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Enter URL to check
          </label>
          <div className="flex gap-3">
            <input
              id="url-input"
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="https://example.com/old-page"
              className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              aria-label="URL to analyze for redirects"
            />
            <button
              onClick={handleCheck}
              disabled={!url.trim() || loading}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              {loading ? 'Checking…' : 'Check'}
            </button>
          </div>
          <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
            Supports HTTP and HTTPS URLs. Checks up to 10 redirect hops.
          </p>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-4 mb-8">
            {/* Summary */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-slate-800 dark:text-slate-200">Redirect Chain Analysis</h2>
                <div className="flex gap-2">
                  <button onClick={handleCopy} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                  <button onClick={handleExport} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                    <Download className="w-3.5 h-3.5" />
                    CSV
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="text-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">{result.depth}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Hops</div>
                </div>
                <div className="text-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <div className={`text-2xl font-bold ${result.hasLoop ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {result.hasLoop ? '⚠️' : '✓'}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{result.hasLoop ? 'Loop Detected' : 'No Loop'}</div>
                </div>
                <div className="text-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <div className="text-2xl font-bold text-slate-900 dark:text-white flex items-center justify-center gap-1">
                    <Clock className="w-5 h-5 text-slate-400" />{result.totalTime}ms
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Total Time</div>
                </div>
              </div>

              {/* Chain steps */}
              <div className="space-y-2">
                {result.steps.map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</div>
                      {i < result.steps.length - 1 && <div className="w-0.5 h-4 bg-slate-200 dark:bg-slate-700 my-0.5" />}
                    </div>
                    <div className="flex-1 min-w-0 pb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${getStatusColor(step.status)}`}>
                          {step.status || 'ERR'}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">{step.statusText}</span>
                        <span className="text-xs text-slate-400 dark:text-slate-500 ml-auto">{step.timing}ms</span>
                      </div>
                      <div className="mt-1 flex items-center gap-1.5">
                        <a href={step.url} target="_blank" rel="noopener noreferrer"
                          className="text-sm text-blue-600 dark:text-blue-400 hover:underline truncate flex-1 min-w-0">
                          {step.url}
                        </a>
                        <ExternalLink className="w-3 h-3 text-slate-400 flex-shrink-0" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Final URL */}
              {result.depth > 0 && (
                <div className="mt-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                  <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-1">Final Destination</div>
                  <a href={result.finalUrl} target="_blank" rel="noopener noreferrer"
                    className="text-sm text-emerald-600 dark:text-emerald-300 hover:underline break-all">
                    {result.finalUrl}
                  </a>
                </div>
              )}

              {result.error && (
                <div className="mt-3 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
                  {result.error}
                </div>
              )}
            </div>

            {/* Warnings */}
            {result.warnings.length > 0 && (
              <div className="bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-200 dark:border-amber-800 p-5">
                <h3 className="font-semibold text-amber-800 dark:text-amber-400 flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4" /> Warnings & Recommendations
                </h3>
                <ul className="space-y-2">
                  {result.warnings.map((w, i) => (
                    <li key={i} className="text-sm text-amber-700 dark:text-amber-300">{w}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Educational Content */}
        <section className="prose prose-slate dark:prose-invert max-w-none mb-10">
          <h2>What is a Redirect Chain?</h2>
          <p>A <strong>redirect chain</strong> is a sequence of HTTP redirects where URL A sends the browser to URL B, which then sends it to URL C, and so on. Every hop adds latency and can negatively impact SEO by diluting link equity and slowing crawling.</p>

          <h3>How Redirect Chains Affect SEO</h3>
          <p>Google's crawlers follow redirect chains, but each hop consumes crawl budget and can result in a small loss of PageRank. Long chains also increase page load time, hurting Core Web Vitals scores. The best practice is to redirect directly from the old URL to the final destination in a single 301 hop.</p>

          <h3>301 vs 302 Redirects</h3>
          <ul>
            <li><strong>301 Moved Permanently</strong> — Signals the page has permanently moved. Search engines transfer link equity and update their index. Use for permanent content moves.</li>
            <li><strong>302 Found</strong> — Signals a temporary move. Search engines keep the original URL indexed. Use for A/B testing or seasonal redirects.</li>
            <li><strong>307 Temporary Redirect</strong> — Like 302 but preserves the HTTP method (POST stays POST).</li>
            <li><strong>308 Permanent Redirect</strong> — Like 301 but preserves the HTTP method.</li>
          </ul>

          <h3>How to Fix a Redirect Chain</h3>
          <ul>
            <li>Use this tool to map the full chain from start to finish.</li>
            <li>Update the origin redirect to point directly to the final destination URL.</li>
            <li>Test again to confirm the chain collapses to a single hop.</li>
            <li>Update any internal links that still point to intermediate URLs.</li>
          </ul>
        </section>

        {/* FAQ */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Frequently Asked Questions</h2>
          <div className="space-y-2">
            {FAQS.map((faq, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  aria-expanded={openFaq === i}
                >
                  {faq.q}
                  {openFaq === i ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />}
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Related Tools */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">Related Tools</h2>
          <div className="flex flex-wrap gap-3">
            {[
              { to: '/tools/robots-txt-tester', name: 'Robots.txt Tester' },
              { to: '/tools/json-path-finder', name: 'JSON Path Finder' },
              { to: '/tools/regex-explainer', name: 'AI Regex Explainer' },
              { to: '/tools/cron-expression-generator', name: 'Cron Expression Generator' },
            ].map(({ to, name }) => (
              <Link key={to} to={to}
                className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors shadow-sm">
                {name}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
