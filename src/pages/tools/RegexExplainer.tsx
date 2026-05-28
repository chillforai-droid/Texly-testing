/**
 * RegexExplainer.tsx
 * Route: /tools/regex-explainer
 * Target keywords: regex explainer, explain regex, regex meaning, regex analyzer
 */

import React, { useState, useMemo, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Copy, Check, ChevronDown, ChevronUp, Sparkles, AlertTriangle } from 'lucide-react';

const BASE = 'https://www.texlyonline.in';
const CANONICAL = `${BASE}/tools/regex-explainer`;

// ─── Regex Token Types ─────────────────────────────────────────────────────
interface RegexToken {
  raw: string;
  type: 'anchor' | 'quantifier' | 'group' | 'charclass' | 'escape' | 'literal' | 'alternation' | 'flag' | 'dot';
  explanation: string;
  color: string;
}

const TOKEN_COLORS: Record<string, string> = {
  anchor: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20',
  quantifier: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20',
  group: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20',
  charclass: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20',
  escape: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20',
  literal: 'text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800',
  alternation: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20',
  flag: 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20',
  dot: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20',
};

// ─── Regex Token Parser ───────────────────────────────────────────────────
function explainRegex(pattern: string): { tokens: RegexToken[]; summary: string; flags: string } {
  // Extract flags from /pattern/flags format
  let corePattern = pattern;
  let flags = '';
  if (pattern.startsWith('/')) {
    const lastSlash = pattern.lastIndexOf('/');
    if (lastSlash > 0) {
      corePattern = pattern.slice(1, lastSlash);
      flags = pattern.slice(lastSlash + 1);
    }
  }

  const tokens: RegexToken[] = [];
  let i = 0;
  const p = corePattern;

  while (i < p.length) {
    const ch = p[i];

    // Anchors
    if (ch === '^' && i === 0) {
      tokens.push({ raw: ch, type: 'anchor', explanation: 'Start of string (or line with multiline flag)', color: TOKEN_COLORS.anchor });
      i++; continue;
    }
    if (ch === '$' && i === p.length - 1) {
      tokens.push({ raw: ch, type: 'anchor', explanation: 'End of string (or line with multiline flag)', color: TOKEN_COLORS.anchor });
      i++; continue;
    }
    if (ch === '^') {
      tokens.push({ raw: ch, type: 'anchor', explanation: 'Start of string anchor (inside string means literal ^ in most contexts)', color: TOKEN_COLORS.anchor });
      i++; continue;
    }

    // Dot
    if (ch === '.') {
      tokens.push({ raw: ch, type: 'dot', explanation: 'Any character except newline (with s flag, matches newlines too)', color: TOKEN_COLORS.dot });
      i++; continue;
    }

    // Alternation
    if (ch === '|') {
      tokens.push({ raw: ch, type: 'alternation', explanation: 'OR — matches either the expression before or after this pipe', color: TOKEN_COLORS.alternation });
      i++; continue;
    }

    // Escaped sequences
    if (ch === '\\' && i + 1 < p.length) {
      const next = p[i + 1];
      const escapeMap: Record<string, string> = {
        'd': 'Any digit [0-9]',
        'D': 'Any non-digit [^0-9]',
        'w': 'Any word character [a-zA-Z0-9_]',
        'W': 'Any non-word character',
        's': 'Any whitespace character (space, tab, newline)',
        'S': 'Any non-whitespace character',
        'b': 'Word boundary — position between a word char and a non-word char',
        'B': 'Non-word boundary',
        'n': 'Newline character',
        'r': 'Carriage return character',
        't': 'Tab character',
        '0': 'Null character',
        '.': 'Literal dot (escaped)',
        '*': 'Literal asterisk (escaped)',
        '+': 'Literal plus sign (escaped)',
        '?': 'Literal question mark (escaped)',
        '(': 'Literal opening parenthesis (escaped)',
        ')': 'Literal closing parenthesis (escaped)',
        '[': 'Literal opening bracket (escaped)',
        ']': 'Literal closing bracket (escaped)',
        '{': 'Literal opening brace (escaped)',
        '}': 'Literal closing brace (escaped)',
        '^': 'Literal caret (escaped)',
        '$': 'Literal dollar sign (escaped)',
        '|': 'Literal pipe (escaped)',
        '\\': 'Literal backslash (escaped)',
      };
      tokens.push({
        raw: '\\' + next,
        type: 'escape',
        explanation: escapeMap[next] || `Escaped character: \\${next}`,
        color: TOKEN_COLORS.escape,
      });
      i += 2; continue;
    }

    // Character class [...]
    if (ch === '[') {
      let j = i + 1;
      let cls = '[';
      let negate = false;
      if (j < p.length && p[j] === '^') { negate = true; cls += '^'; j++; }
      while (j < p.length && p[j] !== ']') {
        if (p[j] === '\\') { cls += p[j] + (p[j + 1] || ''); j += 2; }
        else { cls += p[j]; j++; }
      }
      if (j < p.length) { cls += ']'; j++; }
      const inner = cls.slice(negate ? 2 : 1, -1);
      tokens.push({
        raw: cls,
        type: 'charclass',
        explanation: negate
          ? `Character class — matches any single character NOT in: ${inner}`
          : `Character class — matches any one character in: ${inner}`,
        color: TOKEN_COLORS.charclass,
      });
      i = j; continue;
    }

    // Groups
    if (ch === '(') {
      let j = i + 1;
      let depth = 1;
      let groupContent = '(';
      while (j < p.length && depth > 0) {
        if (p[j] === '(' && p[j - 1] !== '\\') depth++;
        if (p[j] === ')' && p[j - 1] !== '\\') depth--;
        groupContent += p[j];
        j++;
      }
      let groupType = 'Capturing group';
      if (groupContent.startsWith('(?:')) groupType = 'Non-capturing group (?: — groups without capturing)';
      else if (groupContent.startsWith('(?=')) groupType = 'Positive lookahead (?= — asserts what follows without consuming)';
      else if (groupContent.startsWith('(?!')) groupType = 'Negative lookahead (?! — asserts what does NOT follow)';
      else if (groupContent.startsWith('(?<=')) groupType = 'Positive lookbehind (?<= — asserts what precedes without consuming)';
      else if (groupContent.startsWith('(?<!')) groupType = 'Negative lookbehind (?<! — asserts what does NOT precede)';
      else if (groupContent.startsWith('(?<')) groupType = 'Named capturing group';
      tokens.push({ raw: groupContent, type: 'group', explanation: groupType, color: TOKEN_COLORS.group });
      i = j; continue;
    }

    // Quantifiers
    if ('*+?'.includes(ch) || (ch === '{' && /^\{\d+/.test(p.slice(i)))) {
      let q = ch;
      let explanation = '';
      if (ch === '*') explanation = 'Zero or more of the preceding element (greedy)';
      else if (ch === '+') explanation = 'One or more of the preceding element (greedy)';
      else if (ch === '?') explanation = 'Zero or one of the preceding element (optional)';
      else if (ch === '{') {
        let j = i + 1;
        while (j < p.length && p[j] !== '}') { q += p[j]; j++; }
        q += '}'; j++;
        const inner = q.slice(1, -1);
        if (inner.includes(',')) {
          const [min, max] = inner.split(',');
          explanation = max ? `Between ${min} and ${max} of the preceding element` : `${min} or more of the preceding element`;
        } else {
          explanation = `Exactly ${inner} of the preceding element`;
        }
        // Check for lazy modifier
        if (j < p.length && p[j] === '?') { q += '?'; j++; explanation += ' (lazy — as few as possible)'; }
        i = j;
        tokens.push({ raw: q, type: 'quantifier', explanation, color: TOKEN_COLORS.quantifier });
        continue;
      }
      // Check for lazy
      if (i + 1 < p.length && p[i + 1] === '?') {
        q += '?';
        i++;
        explanation = explanation.replace('(greedy)', '(lazy — as few as possible)');
      }
      tokens.push({ raw: q, type: 'quantifier', explanation, color: TOKEN_COLORS.quantifier });
      i++; continue;
    }

    // Literal
    tokens.push({ raw: ch, type: 'literal', explanation: `Literal character: "${ch}"`, color: TOKEN_COLORS.literal });
    i++;
  }

  const summary = buildSummary(tokens, flags);
  return { tokens, summary, flags };
}

function buildSummary(tokens: RegexToken[], flags: string): string {
  const parts: string[] = [];
  const hasAnchorStart = tokens.some(t => t.raw === '^');
  const hasAnchorEnd = tokens.some(t => t.raw === '$');
  if (hasAnchorStart && hasAnchorEnd) parts.push('Matches an exact string from start to end');
  else if (hasAnchorStart) parts.push('Matches from the start of the string');
  else if (hasAnchorEnd) parts.push('Matches until the end of the string');
  else parts.push('Matches anywhere in the string');

  if (flags.includes('i')) parts.push('case-insensitive');
  if (flags.includes('g')) parts.push('global (all matches)');
  if (flags.includes('m')) parts.push('multiline');
  if (flags.includes('s')) parts.push('dot-all mode');
  return parts.join(', ') + '.';
}

// ─── Test strings ─────────────────────────────────────────────────────────
function testRegex(pattern: string, testStr: string): { matches: RegExpMatchArray[]; error?: string } {
  try {
    let corePattern = pattern;
    let flags = 'g';
    if (pattern.startsWith('/')) {
      const lastSlash = pattern.lastIndexOf('/');
      if (lastSlash > 0) {
        corePattern = pattern.slice(1, lastSlash);
        flags = pattern.slice(lastSlash + 1) || 'g';
        if (!flags.includes('g')) flags += 'g';
      }
    }
    const re = new RegExp(corePattern, flags);
    const matches: RegExpMatchArray[] = [];
    let m: RegExpExecArray | null;
    while ((m = re.exec(testStr)) !== null) {
      matches.push(m);
      if (m[0].length === 0) re.lastIndex++;
    }
    return { matches };
  } catch (e: unknown) {
    return { matches: [], error: (e as Error).message };
  }
}

// ─── Sample Regexes ──────────────────────────────────────────────────────
const SAMPLES = [
  { label: 'Email', pattern: '/^[\\w.-]+@[\\w.-]+\\.[a-zA-Z]{2,}$/i', test: 'user@example.com' },
  { label: 'URL', pattern: '/https?:\\/\\/[\\w.-]+(?:\\/[\\w.\\-_~:/?#@!$&\'()*+,;=%]*)*/i', test: 'https://texlyonline.in/tools' },
  { label: 'Phone (US)', pattern: '/^\\+?1?[-.\\s]?\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}$/', test: '(555) 123-4567' },
  { label: 'IPv4', pattern: '/^(?:(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)$/', test: '192.168.1.1' },
  { label: 'Hex Color', pattern: '/^#?([a-f\\d]{2})([a-f\\d]{2})([a-f\\d]{2})$/i', test: '#ff5733' },
  { label: 'Date (YYYY-MM-DD)', pattern: '/^\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\d|3[01])$/', test: '2025-12-31' },
];

const FAQS = [
  { q: 'What is a regex?', a: 'A regular expression (regex) is a sequence of characters that defines a search pattern. It\'s used for string matching, validation, search-and-replace, and data extraction in programming languages and text editors.' },
  { q: 'What does .* mean in regex?', a: '\\. matches any single character (except newline), and * means zero or more of the preceding element. So .* greedily matches any sequence of characters as long as possible.' },
  { q: 'What is the difference between + and * in regex?', a: '+ means one or more (at least one occurrence required), while * means zero or more (the element is optional). For example, \\d+ requires at least one digit, while \\d* allows zero digits.' },
  { q: 'What is a capturing group in regex?', a: 'A capturing group (...) groups part of the regex together and captures the matched substring so you can use it later with back-references or in replacement strings. Non-capturing groups (?:...) group without capturing.' },
  { q: 'What do regex flags do?', a: 'Flags modify how the regex engine works: "i" makes matching case-insensitive, "g" finds all matches (not just the first), "m" makes ^ and $ match line starts/ends instead of string starts/ends, and "s" makes . match newlines.' },
];

export default function RegexExplainer() {
  const [pattern, setPattern] = useState('/^[\\w.-]+@[\\w.-]+\\.[a-zA-Z]{2,}$/i');
  const [testStr, setTestStr] = useState('user@example.com, invalid@, another@test.org');
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const analysis = useMemo(() => {
    if (!pattern.trim()) return null;
    try { return explainRegex(pattern); } catch { return null; }
  }, [pattern]);

  const testResult = useMemo(() => {
    if (!pattern.trim() || !testStr) return null;
    return testRegex(pattern, testStr);
  }, [pattern, testStr]);

  const isValidRegex = useMemo(() => {
    if (!pattern) return true;
    try {
      let p = pattern;
      if (p.startsWith('/')) { const last = p.lastIndexOf('/'); p = p.slice(1, last); }
      new RegExp(p); return true;
    } catch { return false; }
  }, [pattern]);

  const handleCopy = async () => {
    if (!analysis) return;
    const text = analysis.tokens.map(t => `${t.raw}: ${t.explanation}`).join('\n');
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const highlightMatches = useCallback((str: string): React.ReactNode => {
    if (!testResult?.matches.length) return str;
    let last = 0;
    const nodes: React.ReactNode[] = [];
    for (const m of testResult.matches) {
      if (m.index === undefined) continue;
      if (m.index > last) nodes.push(<span key={`l${m.index}`}>{str.slice(last, m.index)}</span>);
      nodes.push(<mark key={`m${m.index}`} className="bg-yellow-200 dark:bg-yellow-800/60 text-yellow-900 dark:text-yellow-200 rounded px-0.5">{m[0] || '(empty)'}</mark>);
      last = m.index + m[0].length;
    }
    if (last < str.length) nodes.push(<span key="tail">{str.slice(last)}</span>);
    return nodes;
  }, [testResult]);

  const schemaOrg = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'SoftwareApplication', name: 'AI Regex Explainer', applicationCategory: 'WebApplication', operatingSystem: 'Any', offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }, url: CANONICAL },
      { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: BASE }, { '@type': 'ListItem', position: 2, name: 'Tools', item: `${BASE}/tools` }, { '@type': 'ListItem', position: 3, name: 'AI Regex Explainer', item: CANONICAL }] },
      { '@type': 'FAQPage', mainEntity: FAQS.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
    ],
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4">
      <Helmet>
        <title>AI Regex Explainer — Explain & Analyze Regex Patterns Free | Texly</title>
        <meta name="description" content="Free AI-powered regex explainer. Paste any regular expression and get a token-by-token breakdown, human-readable explanation, and live test results instantly." />
        <meta name="keywords" content="regex explainer, explain regex, regex meaning, regex analyzer, regex parser, regex tester, regular expression explainer, regex breakdown" />
        <link rel="canonical" href={CANONICAL} />
        <meta property="og:title" content="AI Regex Explainer — Explain & Analyze Regex Patterns Free" />
        <meta property="og:description" content="Paste any regex and get a token-by-token breakdown with human-readable explanations." />
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
          <span>AI Regex Explainer</span>
        </nav>

        {/* Hero */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 mb-4">
            <Sparkles className="w-8 h-8" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-3">AI Regex Explainer</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Paste any regular expression and get an instant token-by-token breakdown.
            Understand what every part does — with live match highlighting.
          </p>
        </div>

        {/* Pattern Input */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5 mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Regex Pattern</label>
            {!isValidRegex && <span className="flex items-center gap-1 text-xs text-red-500"><AlertTriangle className="w-3.5 h-3.5" />Invalid regex</span>}
            {isValidRegex && pattern && <span className="text-xs text-emerald-500">✓ Valid</span>}
          </div>
          <input
            type="text"
            value={pattern}
            onChange={e => setPattern(e.target.value)}
            placeholder="/^your-regex-here$/flags"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 mb-3"
            spellCheck={false}
          />
          <div className="flex flex-wrap gap-2">
            {SAMPLES.map(s => (
              <button key={s.label} onClick={() => { setPattern(s.pattern); setTestStr(s.test); }}
                className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-rose-300 hover:text-rose-600 dark:hover:text-rose-400 transition-colors bg-white dark:bg-slate-900">
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Token Breakdown */}
        {analysis && isValidRegex && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5 mb-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-800 dark:text-slate-200">Token Breakdown</h2>
              <button onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                {copied ? <><Check className="w-3.5 h-3.5 text-emerald-500" />Copied!</> : <><Copy className="w-3.5 h-3.5" />Copy</>}
              </button>
            </div>

            {/* Summary */}
            <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/40">
              <p className="text-sm text-rose-700 dark:text-rose-300"><strong>Summary:</strong> {analysis.summary}</p>
              {analysis.flags && <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">Flags: <code className="font-mono">{analysis.flags}</code> — {analysis.flags.includes('i') ? 'case-insensitive' : ''}{analysis.flags.includes('g') ? ' global' : ''}{analysis.flags.includes('m') ? ' multiline' : ''}</p>}
            </div>

            {/* Token list */}
            <div className="space-y-2">
              {analysis.tokens.map((token, i) => (
                <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${token.color} border-current/10`}>
                  <code className="font-mono text-sm font-bold flex-shrink-0 min-w-[60px]">{token.raw}</code>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-semibold uppercase tracking-wide opacity-70 mr-2">{token.type}</span>
                    <span className="text-sm">{token.explanation}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Test Area */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5 mb-8">
          <h2 className="font-semibold text-slate-800 dark:text-slate-200 mb-3">Live Tester</h2>
          <textarea
            value={testStr}
            onChange={e => setTestStr(e.target.value)}
            placeholder="Enter test string here…"
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-rose-500 resize-y mb-3"
          />
          {testResult && (
            <>
              <div className="mb-2">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Matches:</span>
                {testResult.error ? (
                  <span className="ml-2 text-sm text-red-500">{testResult.error}</span>
                ) : (
                  <span className="ml-2 text-sm text-emerald-600 dark:text-emerald-400">{testResult.matches.length} match{testResult.matches.length !== 1 ? 'es' : ''}</span>
                )}
              </div>
              {testStr && !testResult.error && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 font-mono text-sm whitespace-pre-wrap break-all">
                  {highlightMatches(testStr)}
                </div>
              )}
            </>
          )}
        </div>

        {/* Educational Content */}
        <section className="prose prose-slate dark:prose-invert max-w-none mb-10">
          <h2>What is a Regular Expression?</h2>
          <p>A <strong>regular expression</strong> (regex or regexp) is a sequence of characters that forms a search pattern. Used in programming, text editors, and command-line tools, regex enables powerful string matching, validation, extraction, and replacement operations with concise syntax.</p>

          <h3>Core Regex Concepts</h3>
          <ul>
            <li><strong>Literals</strong> — match themselves exactly (e.g., <code>cat</code> matches "cat")</li>
            <li><strong>Metacharacters</strong> — have special meaning (<code>. * + ? ^ $ { } [ ] | ( ) \</code>)</li>
            <li><strong>Character classes</strong> — <code>[abc]</code> matches any one of a, b, or c</li>
            <li><strong>Quantifiers</strong> — specify how many times to match: <code>*</code> (0+), <code>+</code> (1+), <code>?</code> (0 or 1), <code>{'{n}'}</code> (exactly n)</li>
            <li><strong>Anchors</strong> — <code>^</code> (start of string), <code>$</code> (end of string), <code>\b</code> (word boundary)</li>
            <li><strong>Groups</strong> — <code>(...)</code> captures, <code>(?:...)</code> groups without capturing</li>
          </ul>

          <h3>Common Regex Patterns</h3>
          <ul>
            <li>Email: <code>/^[\w.-]+@[\w.-]+\.[a-zA-Z]{'{2,}'}$/i</code></li>
            <li>URL: <code>/https?:\/\/[\w.-]+/</code></li>
            <li>Only numbers: <code>/^\d+$/</code></li>
            <li>Hex color: <code>/^#?[a-f\d]{'{6}'}$/i</code></li>
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
              { to: '/tools/cron-expression-generator', name: 'Cron Expression Generator' },
              { to: '/tools/json-path-finder', name: 'JSON Path Finder' },
              { to: '/tools/redirect-chain-checker', name: 'Redirect Chain Checker' },
              { to: '/tools/robots-txt-tester', name: 'Robots.txt Tester' },
            ].map(({ to, name }) => (
              <Link key={to} to={to} className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 hover:border-rose-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors shadow-sm">{name}</Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
