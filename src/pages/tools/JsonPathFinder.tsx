/**
 * JsonPathFinder.tsx
 * Route: /tools/json-path-finder
 * Target keywords: json path finder, json path generator, json structure analyzer
 */

import React, { useState, useCallback, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Copy, Check, ChevronDown, ChevronUp, ChevronRight, FileJson, Trash2 } from 'lucide-react';

const BASE = 'https://www.texlyonline.in';
const CANONICAL = `${BASE}/tools/json-path-finder`;

// ─── JSON Tree Types ──────────────────────────────────────────────────────
interface JsonNode {
  key: string;
  path: string;
  value: unknown;
  type: 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null';
  children?: JsonNode[];
}

function getType(val: unknown): JsonNode['type'] {
  if (val === null) return 'null';
  if (Array.isArray(val)) return 'array';
  return typeof val as JsonNode['type'];
}

function buildTree(val: unknown, key: string, path: string): JsonNode {
  const type = getType(val);
  const node: JsonNode = { key, path, value: val, type };

  if (type === 'object' && val !== null) {
    node.children = Object.entries(val as Record<string, unknown>).map(([k, v]) =>
      buildTree(v, k, `${path}.${k}`)
    );
  } else if (type === 'array' && Array.isArray(val)) {
    node.children = (val as unknown[]).map((v, i) =>
      buildTree(v, String(i), `${path}[${i}]`)
    );
  }
  return node;
}

// ─── Type Colors ──────────────────────────────────────────────────────────
const TYPE_COLORS: Record<JsonNode['type'], string> = {
  string: 'text-emerald-600 dark:text-emerald-400',
  number: 'text-blue-600 dark:text-blue-400',
  boolean: 'text-amber-600 dark:text-amber-400',
  null: 'text-slate-400 dark:text-slate-500',
  object: 'text-purple-600 dark:text-purple-400',
  array: 'text-rose-600 dark:text-rose-400',
};

function formatValue(val: unknown, type: JsonNode['type']): string {
  if (type === 'string') return `"${String(val)}"`;
  if (type === 'null') return 'null';
  return String(val);
}

// ─── Tree Node Component ──────────────────────────────────────────────────
function TreeNode({
  node,
  depth,
  onPathCopy,
  copiedPath,
}: {
  node: JsonNode;
  depth: number;
  onPathCopy: (path: string) => void;
  copiedPath: string | null;
}) {
  const [expanded, setExpanded] = useState(depth < 2);
  const hasChildren = node.children && node.children.length > 0;
  const isLeaf = !hasChildren;

  return (
    <div className="font-mono text-sm">
      <div
        className={`flex items-center gap-1.5 group hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg px-2 py-0.5 cursor-pointer transition-colors ${depth === 0 ? '' : ''}`}
        onClick={() => hasChildren && setExpanded(e => !e)}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {hasChildren ? (
          <span className="w-4 h-4 flex items-center justify-center flex-shrink-0 text-slate-400">
            {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </span>
        ) : (
          <span className="w-4 flex-shrink-0" />
        )}

        {/* Key */}
        {node.key && (
          <span className="text-slate-700 dark:text-slate-300 flex-shrink-0">
            {node.type === 'array' ? (
              <span className="text-rose-500">[{node.key}]</span>
            ) : (
              <><span className="text-slate-500">"</span><span className="text-indigo-600 dark:text-indigo-400">{node.key}</span><span className="text-slate-500">"</span></>
            )}
            <span className="text-slate-400 mx-1">:</span>
          </span>
        )}

        {/* Value */}
        <span className={TYPE_COLORS[node.type]}>
          {isLeaf
            ? formatValue(node.value, node.type)
            : node.type === 'object'
              ? `{ ${(node.children?.length ?? 0)} }`
              : `[ ${(node.children?.length ?? 0)} ]`}
        </span>

        {/* Type badge */}
        <span className="text-xs text-slate-400 dark:text-slate-500 ml-1 flex-shrink-0">{node.type}</span>

        {/* Copy path button */}
        <button
          onClick={e => { e.stopPropagation(); onPathCopy(node.path); }}
          className="ml-auto opacity-0 group-hover:opacity-100 flex items-center gap-1 text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 hover:text-blue-600 dark:hover:text-blue-400 transition-all flex-shrink-0"
        >
          {copiedPath === node.path ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
          {copiedPath === node.path ? 'Copied!' : node.path}
        </button>
      </div>

      {/* Children */}
      {expanded && hasChildren && node.children!.map((child, i) => (
        <TreeNode key={i} node={child} depth={depth + 1} onPathCopy={onPathCopy} copiedPath={copiedPath} />
      ))}
    </div>
  );
}

// ─── Sample JSON ──────────────────────────────────────────────────────────
const SAMPLE_JSON = `{
  "user": {
    "id": 1,
    "name": "Jane Smith",
    "email": "jane@example.com",
    "roles": ["admin", "editor"],
    "address": {
      "city": "New York",
      "zip": "10001"
    }
  },
  "settings": {
    "theme": "dark",
    "notifications": true,
    "limit": 100
  }
}`;

const FAQS = [
  { q: 'What is a JSON path?', a: 'A JSON path is a string that describes the location of a value inside a JSON structure, similar to file system paths. For example, $.user.address.city navigates to the city field nested inside the user and address objects.' },
  { q: 'What is JSONPath syntax?', a: 'JSONPath uses $ to represent the root, dot notation ($.user.name) to access object properties, and bracket notation ($.users[0]) to access array elements. It was created by Stefan Goessner and is widely used in API testing tools like Postman.' },
  { q: 'How do I access nested array elements in JSON path?', a: 'Use bracket notation with the index: $.users[0].name gets the name of the first user. You can also use wildcards like $.users[*].name to get all names.' },
  { q: 'What tools use JSON paths?', a: 'JSON paths are used in Postman (test assertions), AWS Step Functions (data transformation), JMESPath for AWS CLI, Kubernetes (JSON patch), jq command-line tool, and many API testing frameworks.' },
  { q: 'What is the difference between dot and bracket notation in JSON path?', a: 'Both achieve the same result for simple keys. Dot notation ($.user.name) is cleaner and more readable. Bracket notation ($.user["name"]) is required when keys contain special characters, spaces, or start with numbers.' },
];

export default function JsonPathFinder() {
  const [input, setInput] = useState(SAMPLE_JSON);
  const [copiedPath, setCopiedPath] = useState<string | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [queryCopied, setQueryCopied] = useState(false);

  const tree = useMemo(() => {
    if (!input.trim()) { setParseError(null); return null; }
    try {
      const parsed = JSON.parse(input);
      setParseError(null);
      return buildTree(parsed, '', '$');
    } catch (e: unknown) {
      setParseError((e as Error).message);
      return null;
    }
  }, [input]);

  const handlePathCopy = useCallback(async (path: string) => {
    await navigator.clipboard.writeText(path);
    setCopiedPath(path);
    setTimeout(() => setCopiedPath(null), 2000);
  }, []);

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(input);
      setInput(JSON.stringify(parsed, null, 2));
    } catch {}
  };

  const handleMinify = () => {
    try {
      const parsed = JSON.parse(input);
      setInput(JSON.stringify(parsed));
    } catch {}
  };

  const handleCopyFormatted = async () => {
    try {
      const parsed = JSON.parse(input);
      await navigator.clipboard.writeText(JSON.stringify(parsed, null, 2));
      setQueryCopied(true);
      setTimeout(() => setQueryCopied(false), 2000);
    } catch {}
  };

  const schemaOrg = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'SoftwareApplication', name: 'JSON Path Finder', applicationCategory: 'WebApplication', operatingSystem: 'Any', offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }, url: CANONICAL },
      { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: BASE }, { '@type': 'ListItem', position: 2, name: 'Tools', item: `${BASE}/tools` }, { '@type': 'ListItem', position: 3, name: 'JSON Path Finder', item: CANONICAL }] },
      { '@type': 'FAQPage', mainEntity: FAQS.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
    ],
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4">
      <Helmet>
        <title>JSON Path Finder — Free JSON Structure Analyzer & Path Generator | Texly</title>
        <meta name="description" content="Free JSON path finder and analyzer. Paste JSON to explore its structure as an interactive tree, click any value to copy its JSON path instantly." />
        <meta name="keywords" content="json path finder, json path generator, json structure analyzer, jsonpath tool, json path extractor, json tree viewer, json explorer" />
        <link rel="canonical" href={CANONICAL} />
        <meta property="og:title" content="JSON Path Finder — Free JSON Structure Analyzer & Path Generator" />
        <meta property="og:description" content="Paste JSON to explore its structure as an interactive tree and copy JSON paths instantly." />
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
          <span>JSON Path Finder</span>
        </nav>

        {/* Hero */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 mb-4">
            <FileJson className="w-8 h-8" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-3">JSON Path Finder</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Paste any JSON and explore it as an interactive tree.
            Hover any value and click to copy its JSON path instantly.
          </p>
        </div>

        {/* Input */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5 mb-4">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">JSON Input</label>
            <div className="flex gap-2">
              <button onClick={handleFormat} className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Format</button>
              <button onClick={handleMinify} className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Minify</button>
              <button onClick={handleCopyFormatted} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                {queryCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                Copy
              </button>
              <button onClick={() => setInput('')} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
                Clear
              </button>
            </div>
          </div>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            rows={12}
            placeholder='Paste your JSON here…'
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
            spellCheck={false}
          />
          {parseError && (
            <p className="mt-2 text-sm text-red-500 flex items-center gap-1.5">
              <span className="font-semibold">Parse error:</span> {parseError}
            </p>
          )}
        </div>

        {/* Tree */}
        {tree && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5 mb-8 overflow-x-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-800 dark:text-slate-200">JSON Tree — hover any value to copy its path</h2>
              <div className="flex gap-3 text-xs text-slate-500 dark:text-slate-400">
                <span className="text-purple-600 dark:text-purple-400">■ object</span>
                <span className="text-rose-500">■ array</span>
                <span className="text-emerald-600 dark:text-emerald-400">■ string</span>
                <span className="text-blue-600 dark:text-blue-400">■ number</span>
              </div>
            </div>
            <div className="min-w-0 overflow-x-auto">
              <TreeNode node={tree} depth={0} onPathCopy={handlePathCopy} copiedPath={copiedPath} />
            </div>
          </div>
        )}

        {/* Educational Content */}
        <section className="prose prose-slate dark:prose-invert max-w-none mb-10">
          <h2>What is JSON Path?</h2>
          <p><strong>JSONPath</strong> is a query language for JSON data, analogous to XPath for XML. It allows you to navigate, filter, and extract data from complex JSON structures using a compact path expression syntax. JSONPath is used in API testing (Postman, REST-assured), AWS services, database queries, and many programming frameworks.</p>

          <h3>JSONPath Syntax Reference</h3>
          <ul>
            <li><code>$</code> — Root element</li>
            <li><code>.key</code> or <code>["key"]</code> — Child element</li>
            <li><code>[n]</code> — Array index (0-based)</li>
            <li><code>[*]</code> — All elements in array or object</li>
            <li><code>..key</code> — Recursive descent (find "key" anywhere)</li>
            <li><code>[start:end]</code> — Array slice</li>
          </ul>

          <h3>Examples</h3>
          <ul>
            <li><code>$.user.name</code> — Access user's name</li>
            <li><code>$.users[0].email</code> — First user's email</li>
            <li><code>$.users[*].id</code> — All user IDs</li>
            <li><code>$.settings.theme</code> — Settings theme value</li>
          </ul>

          <h3>Where is JSONPath Used?</h3>
          <p>JSONPath expressions are used in Postman test assertions, AWS CloudFormation and Step Functions, Kubernetes JSON patches, the <code>jq</code> command-line tool, Spring Framework, and many REST API clients. Knowing JSON paths helps you quickly extract the data you need from any API response.</p>
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
              { to: '/tools/regex-explainer', name: 'AI Regex Explainer' },
              { to: '/tools/cron-expression-generator', name: 'Cron Expression Generator' },
              { to: '/tools/redirect-chain-checker', name: 'Redirect Chain Checker' },
              { to: '/tools/robots-txt-tester', name: 'Robots.txt Tester' },
            ].map(({ to, name }) => (
              <Link key={to} to={to} className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shadow-sm">{name}</Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
