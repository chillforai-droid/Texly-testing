/**
 * RobotsTxtTester.tsx
 * Route: /tools/robots-txt-tester
 * Target keywords: robots txt tester, robots txt checker, robots validator, robots analyzer
 */

import React, { useState, useCallback, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Copy, Check, ChevronDown, ChevronUp, Shield, CheckCircle2, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';

const BASE = 'https://www.texlyonline.in';
const CANONICAL = `${BASE}/tools/robots-txt-tester`;

// ─── Robots.txt Parser ────────────────────────────────────────────────────
interface RobotsRule {
  userAgent: string;
  allows: string[];
  disallows: string[];
  crawlDelay?: number;
  sitemaps: string[];
}

interface TestResult {
  allowed: boolean;
  matchedRule: string | null;
  matchedAgent: string;
  explanation: string;
  priority: 'specific' | 'wildcard' | 'default';
}

function parseRobots(content: string): RobotsRule[] {
  const lines = content.split('\n').map(l => l.trim());
  const rules: RobotsRule[] = [];
  let current: RobotsRule | null = null;

  for (const line of lines) {
    if (!line || line.startsWith('#')) continue;

    const [directive, ...valueParts] = line.split(':');
    const key = directive.trim().toLowerCase();
    const value = valueParts.join(':').trim();

    if (key === 'user-agent') {
      if (current && (current.allows.length || current.disallows.length || current.crawlDelay !== undefined)) {
        rules.push(current);
      }
      current = { userAgent: value, allows: [], disallows: [], sitemaps: [] };
    } else if (key === 'allow' && current) {
      current.allows.push(value);
    } else if (key === 'disallow' && current) {
      if (value) current.disallows.push(value);
    } else if (key === 'crawl-delay' && current) {
      current.crawlDelay = parseFloat(value);
    } else if (key === 'sitemap') {
      if (current) current.sitemaps.push(value);
      // Also add to all rules as global sitemap
    }
  }

  if (current && (current.allows.length || current.disallows.length || current.crawlDelay !== undefined)) {
    rules.push(current);
  }

  return rules;
}

function pathMatches(pattern: string, path: string): boolean {
  // Convert robots.txt pattern to a simple glob
  const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.');
  try {
    const re = new RegExp('^' + escaped);
    return re.test(path);
  } catch {
    return path.startsWith(pattern);
  }
}

function testUrl(rules: RobotsRule[], urlPath: string, userAgent: string): TestResult {
  // Find matching user-agent groups (specific first, then wildcard)
  const specificRules = rules.filter(r => r.userAgent.toLowerCase() === userAgent.toLowerCase());
  const wildcardRules = rules.filter(r => r.userAgent === '*');
  const searchRules = specificRules.length ? specificRules : wildcardRules;
  const priority = specificRules.length ? 'specific' : wildcardRules.length ? 'wildcard' : 'default';
  const matchedAgent = specificRules.length ? specificRules[0].userAgent : wildcardRules.length ? '*' : 'none';

  if (searchRules.length === 0) {
    return { allowed: true, matchedRule: null, matchedAgent: 'none', explanation: 'No rules found for this user-agent. Crawling is allowed by default.', priority: 'default' };
  }

  // Check most specific matching rule (longest path wins)
  let bestMatch: { rule: string; isAllow: boolean; length: number } | null = null;

  for (const ruleGroup of searchRules) {
    for (const allow of ruleGroup.allows) {
      if (pathMatches(allow, urlPath)) {
        if (!bestMatch || allow.length > bestMatch.length) {
          bestMatch = { rule: allow, isAllow: true, length: allow.length };
        }
      }
    }
    for (const disallow of ruleGroup.disallows) {
      if (pathMatches(disallow, urlPath)) {
        if (!bestMatch || disallow.length > bestMatch.length) {
          bestMatch = { rule: disallow, isAllow: false, length: disallow.length };
        }
      }
    }
  }

  if (!bestMatch) {
    return { allowed: true, matchedRule: null, matchedAgent, explanation: 'No specific allow or disallow rule matched this URL. Crawling is allowed by default.', priority };
  }

  const dirType = bestMatch.isAllow ? 'Allow' : 'Disallow';
  return {
    allowed: bestMatch.isAllow,
    matchedRule: `${dirType}: ${bestMatch.rule}`,
    matchedAgent,
    explanation: bestMatch.isAllow
      ? `Allowed by rule "${bestMatch.rule}" — this URL matches an Allow directive and can be crawled.`
      : `Blocked by rule "${bestMatch.rule}" — this URL matches a Disallow directive and will not be crawled.`,
    priority,
  };
}

// ─── Sample Data ──────────────────────────────────────────────────────────
const SAMPLE_ROBOTS = `User-agent: *
Disallow: /admin/
Disallow: /private/
Disallow: /checkout/
Allow: /api/public/
Crawl-delay: 1

User-agent: Googlebot
Allow: /
Disallow: /no-google/
Crawl-delay: 0.5

User-agent: Bingbot
Disallow: /

Sitemap: https://www.example.com/sitemap.xml`;

const COMMON_BOTS = ['Googlebot', 'Bingbot', 'Slurp', 'DuckDuckBot', 'Baiduspider', 'YandexBot', '*'];

const FAQS = [
  { q: 'What is robots.txt?', a: 'robots.txt is a standard text file placed at the root of a website (e.g., https://example.com/robots.txt) that instructs web crawlers and bots about which pages or sections they should or should not crawl. It is part of the Robots Exclusion Protocol (REP).' },
  { q: 'Does robots.txt block pages from being indexed?', a: 'No. robots.txt only instructs crawlers not to crawl a page — it does not prevent indexing. If other pages link to a disallowed URL, Google can still index it without crawling its content. To prevent indexing, use a noindex meta tag instead.' },
  { q: 'What happens if robots.txt has conflicting rules?', a: 'When Allow and Disallow rules both match a URL, the most specific (longest) rule takes precedence. If they are equally specific, the Allow rule wins in most crawlers.' },
  { q: 'What does "Disallow: /" mean in robots.txt?', a: 'Disallow: / blocks all paths on the website for the specified user-agent. This effectively tells the crawler not to crawl any page on the site. It is commonly used with specific bots you want to block entirely.' },
  { q: 'Does Google always follow robots.txt?', a: 'Googlebot respects robots.txt directives for crawling, but it is advisory — not enforced technically. Google may still index URLs it has not crawled if they appear in links. For sensitive content, use authentication rather than relying on robots.txt alone.' },
];

export default function RobotsTxtTester() {
  const [robotsContent, setRobotsContent] = useState(SAMPLE_ROBOTS);
  const [testUrl, setTestUrl] = useState('/admin/dashboard');
  const [userAgent, setUserAgent] = useState('Googlebot');
  const [customAgent, setCustomAgent] = useState('');
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchUrl, setFetchUrl] = useState('');
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const parsedRules = useMemo(() => {
    try { return parseRobots(robotsContent); } catch { return []; }
  }, [robotsContent]);

  const handleTest = useCallback(() => {
    const agent = userAgent === 'custom' ? customAgent : userAgent;
    if (!agent || !testUrl || !robotsContent.trim()) return;

    let path = testUrl;
    if (path.startsWith('http://') || path.startsWith('https://')) {
      try { path = new URL(path).pathname; } catch {}
    }
    if (!path.startsWith('/')) path = '/' + path;

    const result = testUrl ? testUrl_inner(parsedRules, path, agent) : null;
    setTestResult(result);
  }, [parsedRules, testUrl, userAgent, customAgent, robotsContent]);

  function testUrl_inner(rules: RobotsRule[], path: string, agent: string) {
    return testUrl(rules, path, agent);
  }

  const handleFetch = useCallback(async () => {
    if (!fetchUrl.trim()) return;
    setLoading(true);
    setFetchError(null);
    try {
      let url = fetchUrl.trim();
      if (!url.startsWith('http')) url = 'https://' + url;
      const base = new URL(url).origin;
      const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(base + '/robots.txt')}`);
      const data = await res.json();
      if (data.contents) {
        setRobotsContent(data.contents);
      } else {
        setFetchError('Could not fetch robots.txt from this URL. Try pasting manually.');
      }
    } catch {
      setFetchError('Network error. Try pasting the robots.txt content manually.');
    } finally {
      setLoading(false);
    }
  }, [fetchUrl]);

  const handleCopy = async () => {
    if (!testResult) return;
    const text = `URL: ${testUrl}\nUser-Agent: ${userAgent === 'custom' ? customAgent : userAgent}\nResult: ${testResult.allowed ? 'ALLOWED' : 'BLOCKED'}\nMatched Rule: ${testResult.matchedRule || 'none'}\nExplanation: ${testResult.explanation}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const schemaOrg = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'SoftwareApplication', name: 'Robots.txt Tester', applicationCategory: 'WebApplication', operatingSystem: 'Any', offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }, url: CANONICAL },
      { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: BASE }, { '@type': 'ListItem', position: 2, name: 'Tools', item: `${BASE}/tools` }, { '@type': 'ListItem', position: 3, name: 'Robots.txt Tester', item: CANONICAL }] },
      { '@type': 'FAQPage', mainEntity: FAQS.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
    ],
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4">
      <Helmet>
        <title>Robots.txt Tester — Free Robots Validator & Checker | Texly</title>
        <meta name="description" content="Free robots.txt tester and validator. Test any URL against your robots.txt rules, check Googlebot access, detect crawl blocks, and validate robots syntax instantly." />
        <meta name="keywords" content="robots txt tester, robots txt checker, robots validator, robots analyzer, robots.txt tool, googlebot tester, crawl checker, seo robots checker" />
        <link rel="canonical" href={CANONICAL} />
        <meta property="og:title" content="Robots.txt Tester — Free Robots Validator & Checker" />
        <meta property="og:description" content="Test any URL against robots.txt rules, check Googlebot access, and validate robots syntax." />
        <meta property="og:url" content={CANONICAL} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify(schemaOrg)}</script>
      </Helmet>

      <div className="max-w-3xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-6">
          <Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400">Home</Link>
          <ChevronDown className="w-3 h-3 rotate-[-90deg]" />
          <span>Robots.txt Tester</span>
        </nav>

        {/* Hero */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 mb-4">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-3">Robots.txt Tester</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Test any URL against your robots.txt rules. Instantly see if Googlebot, Bingbot,
            or any crawler is allowed or blocked, and which rule applies.
          </p>
        </div>

        {/* Fetch from URL */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5 mb-4">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Fetch robots.txt from a website (optional)
          </label>
          <div className="flex gap-3">
            <input
              type="url"
              value={fetchUrl}
              onChange={e => setFetchUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleFetch()}
              placeholder="https://example.com"
              className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder:text-slate-400"
            />
            <button onClick={handleFetch} disabled={!fetchUrl.trim() || loading}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-teal-600 text-white font-semibold text-sm hover:bg-teal-700 disabled:opacity-50 transition-colors">
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
              {loading ? 'Fetching…' : 'Fetch'}
            </button>
          </div>
          {fetchError && <p className="mt-2 text-sm text-red-500">{fetchError}</p>}
        </div>

        {/* Robots.txt Content */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5 mb-4">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Robots.txt Content
          </label>
          <textarea
            value={robotsContent}
            onChange={e => setRobotsContent(e.target.value)}
            rows={12}
            placeholder="Paste your robots.txt content here…"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-y"
            spellCheck={false}
          />

          {/* Parsed rules summary */}
          {parsedRules.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {parsedRules.map((r, i) => (
                <span key={i} className="text-xs px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-800">
                  {r.userAgent}: {r.disallows.length} disallow, {r.allows.length} allow
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Test Configuration */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5 mb-4">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Test a URL</h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">URL / Path to Test</label>
              <input
                type="text"
                value={testUrl}
                onChange={e => setTestUrl(e.target.value)}
                placeholder="/admin/dashboard or https://example.com/page"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">User-Agent (Crawler Bot)</label>
              <select
                value={userAgent}
                onChange={e => setUserAgent(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {COMMON_BOTS.map(bot => (
                  <option key={bot} value={bot}>{bot}</option>
                ))}
                <option value="custom">Custom…</option>
              </select>
            </div>
          </div>

          {userAgent === 'custom' && (
            <div className="mb-4">
              <input
                type="text"
                value={customAgent}
                onChange={e => setCustomAgent(e.target.value)}
                placeholder="Enter custom user-agent name"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          )}

          <button
            onClick={handleTest}
            disabled={!robotsContent.trim() || !testUrl.trim()}
            className="w-full py-3 rounded-xl bg-teal-600 text-white font-semibold text-sm hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Test URL
          </button>
        </div>

        {/* Result */}
        {testResult && (
          <div className={`rounded-2xl border-2 p-5 mb-8 ${testResult.allowed ? 'border-emerald-400 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/10' : 'border-red-400 dark:border-red-700 bg-red-50 dark:bg-red-900/10'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {testResult.allowed
                  ? <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                  : <XCircle className="w-8 h-8 text-red-500 dark:text-red-400" />}
                <div>
                  <div className={`text-xl font-bold ${testResult.allowed ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-600 dark:text-red-400'}`}>
                    {testResult.allowed ? '✓ Allowed' : '✗ Blocked'}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Agent: <strong>{testResult.matchedAgent}</strong> ({testResult.priority} rule)
                  </div>
                </div>
              </div>
              <button onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy Result'}
              </button>
            </div>

            {testResult.matchedRule && (
              <div className="mb-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Matched Rule</span>
                <code className="font-mono text-sm text-slate-800 dark:text-slate-200">{testResult.matchedRule}</code>
              </div>
            )}

            <p className={`text-sm leading-relaxed ${testResult.allowed ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-600 dark:text-red-400'}`}>
              {testResult.explanation}
            </p>
          </div>
        )}

        {/* Educational Content */}
        <section className="prose prose-slate dark:prose-invert max-w-none mb-10">
          <h2>What is robots.txt?</h2>
          <p>The <strong>robots.txt</strong> file is a plain text file at the root of a website that follows the Robots Exclusion Protocol (REP). It tells web crawlers (like Googlebot, Bingbot, and others) which pages they are allowed or not allowed to access and index.</p>

          <h3>robots.txt Syntax</h3>
          <pre className="bg-slate-100 dark:bg-slate-800 rounded-xl p-4 text-sm font-mono">
{`User-agent: Googlebot
Disallow: /private/
Allow: /private/public-file.html

User-agent: *
Disallow: /admin/
Crawl-delay: 1

Sitemap: https://example.com/sitemap.xml`}
          </pre>

          <h3>Key Directives</h3>
          <ul>
            <li><strong>User-agent</strong> — Which bot the following rules apply to. Use <code>*</code> for all bots.</li>
            <li><strong>Disallow</strong> — Path the bot should NOT crawl. Empty Disallow means "allow everything."</li>
            <li><strong>Allow</strong> — Overrides a Disallow for a more specific path.</li>
            <li><strong>Crawl-delay</strong> — Seconds to wait between requests (respects server load).</li>
            <li><strong>Sitemap</strong> — URL to your sitemap, helps crawlers find all your pages.</li>
          </ul>

          <h3>robots.txt vs. noindex</h3>
          <p>robots.txt prevents crawling. The <code>noindex</code> meta tag prevents indexing. A page blocked in robots.txt can still be indexed if Google discovers it through links. For true removal from search results, use noindex alongside robots.txt, or remove the page entirely.</p>

          <h3>SEO Best Practices</h3>
          <ul>
            <li>Always test your robots.txt before deploying with this tool.</li>
            <li>Don't block CSS, JavaScript, or image files that Google needs to render your pages.</li>
            <li>Include your sitemap URL in robots.txt.</li>
            <li>Use specific user-agent rules for crawlers you want to treat differently.</li>
            <li>Monitor Google Search Console for crawl errors related to robots.txt.</li>
          </ul>
        </section>

        {/* FAQ */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Frequently Asked Questions</h2>
          <div className="space-y-2">
            {FAQS.map((faq, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  aria-expanded={openFaq === i}>
                  {faq.q}
                  {openFaq === i ? <ChevronUp className="w-4 h-4 flex-shrink-0 text-slate-400" /> : <ChevronDown className="w-4 h-4 flex-shrink-0 text-slate-400" />}
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3">{faq.a}</div>
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
              { to: '/tools/redirect-chain-checker', name: 'Redirect Chain Checker' },
              { to: '/tools/json-path-finder', name: 'JSON Path Finder' },
              { to: '/tools/regex-explainer', name: 'AI Regex Explainer' },
              { to: '/tools/cron-expression-generator', name: 'Cron Expression Generator' },
            ].map(({ to, name }) => (
              <Link key={to} to={to} className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 hover:border-teal-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors shadow-sm">{name}</Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
