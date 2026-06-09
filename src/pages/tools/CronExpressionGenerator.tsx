/**
 * CronExpressionGenerator.tsx
 * Route: /tools/cron-expression-generator
 * Target keywords: cron expression generator, cron builder, cron maker, cron parser
 */

import { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  Copy,
  Check,
  Clock,
  ChevronDown,
  ChevronUp,
  Zap,
} from 'lucide-react';

const BASE = 'https://www.texlyonline.in';
const CANONICAL = `${BASE}/tools/cron-expression-generator`;

// ─── Types ───────────────────────────────────────────────────────────────────
interface CronField {
  minute: string;
  hour: string;
  dayOfMonth: string;
  month: string;
  dayOfWeek: string;
}

const MONTH_NAMES: Record<string, string> = {
  '1':'January','2':'February','3':'March','4':'April','5':'May','6':'June',
  '7':'July','8':'August','9':'September','10':'October','11':'November','12':'December',
};
const DAY_NAMES: Record<string, string> = {
  '0':'Sunday','1':'Monday','2':'Tuesday','3':'Wednesday','4':'Thursday','5':'Friday','6':'Saturday',
};

// ─── Cron parser/explainer ────────────────────────────────────────────────────
function parseCronExpression(expr: string): { fields: CronField; error?: string } {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) return { fields: { minute: '*', hour: '*', dayOfMonth: '*', month: '*', dayOfWeek: '*' }, error: 'Cron expression must have exactly 5 fields' };
  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;
  return { fields: { minute, hour, dayOfMonth, month, dayOfWeek } };
}

function explainField(val: string, fieldName: string, names?: Record<string, string>): string {
  if (val === '*') return `every ${fieldName}`;
  if (val.startsWith('*/')) {
    const n = val.slice(2);
    return `every ${n} ${fieldName}s`;
  }
  if (val.includes('-')) {
    const [from, to] = val.split('-');
    const fn = names ? (names[from] || from) : from;
    const tn = names ? (names[to] || to) : to;
    return `from ${fn} to ${tn}`;
  }
  if (val.includes(',')) {
    const parts = val.split(',').map(v => names ? (names[v] || v) : v);
    return parts.join(', ');
  }
  return names ? (names[val] || val) : val;
}

function cronToHuman(fields: CronField): string {
  const { minute, hour, dayOfMonth, month, dayOfWeek } = fields;

  const m = explainField(minute, 'minute');
  const h = explainField(hour, 'hour');
  const dom = explainField(dayOfMonth, 'day of month');
  const mo = explainField(month, 'month', MONTH_NAMES);
  const dow = explainField(dayOfWeek, 'day of week', DAY_NAMES);

  if (minute === '0' && hour === '0' && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') return 'At midnight every day';
  if (minute === '0' && hour === '0' && dayOfMonth === '1' && month === '*' && dayOfWeek === '*') return 'At midnight on the 1st of every month';
  if (minute === '0' && hour === '*' && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') return 'At the start of every hour';
  if (minute === '*' && hour === '*' && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') return 'Every minute';
  if (minute.startsWith('*/') && hour === '*' && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') return `Every ${minute.slice(2)} minutes`;
  if (minute === '0' && hour === '0' && dayOfMonth === '*' && month === '*' && dayOfWeek === '0') return 'At midnight every Sunday';
  if (minute === '0' && hour === '9' && dayOfMonth === '*' && month === '*' && dayOfWeek === '1-5') return 'At 9:00 AM every weekday (Monday–Friday)';

  const parts: string[] = [];
  if (minute !== '*' || hour !== '*') {
    const hPart = hour === '*' ? 'every hour' : `${hour.padStart(2, '0')}:${minute === '*' ? '00' : minute.padStart(2, '0')}`;
    if (minute.startsWith('*/')) parts.push(`every ${minute.slice(2)} minutes past every hour`);
    else if (hour === '*') parts.push(`at minute ${minute} of every hour`);
    else parts.push(`at ${hPart}`);
  }
  if (dayOfWeek !== '*') parts.push(`on ${dow}`);
  else if (dayOfMonth !== '*') parts.push(`on day ${dom} of the month`);
  if (month !== '*') parts.push(`in ${mo}`);

  return parts.length ? parts.join(', ') : `At ${m} of ${h}, day ${dom}, month ${mo}, weekday ${dow}`;
}

function buildCron(fields: CronField): string {
  return `${fields.minute} ${fields.hour} ${fields.dayOfMonth} ${fields.month} ${fields.dayOfWeek}`;
}

function validateCron(expr: string): string | null {
  const { error } = parseCronExpression(expr);
  if (error) return error;
  // Basic validation
  const parts = expr.trim().split(/\s+/);
  const ranges = [
    { name: 'minute', min: 0, max: 59 },
    { name: 'hour', min: 0, max: 23 },
    { name: 'day of month', min: 1, max: 31 },
    { name: 'month', min: 1, max: 12 },
    { name: 'day of week', min: 0, max: 7 },
  ];
  for (let i = 0; i < 5; i++) {
    const val = parts[i];
    if (val === '*') continue;
    if (val.startsWith('*/')) {
      const n = parseInt(val.slice(2));
      if (isNaN(n) || n < 1) return `Invalid step value in ${ranges[i].name}`;
      continue;
    }
    const nums = val.split(/[,\-]/).map(Number);
    for (const n of nums) {
      if (isNaN(n) || n < ranges[i].min || n > ranges[i].max) {
        return `${ranges[i].name} value out of range (${ranges[i].min}-${ranges[i].max}): ${n}`;
      }
    }
  }
  return null;
}

// ─── Presets ─────────────────────────────────────────────────────────────────
const PRESETS = [
  { label: 'Every minute', expr: '* * * * *' },
  { label: 'Every 5 minutes', expr: '*/5 * * * *' },
  { label: 'Every 15 minutes', expr: '*/15 * * * *' },
  { label: 'Every 30 minutes', expr: '*/30 * * * *' },
  { label: 'Every hour', expr: '0 * * * *' },
  { label: 'Every 6 hours', expr: '0 */6 * * *' },
  { label: 'Daily at midnight', expr: '0 0 * * *' },
  { label: 'Daily at noon', expr: '0 12 * * *' },
  { label: 'Every weekday 9 AM', expr: '0 9 * * 1-5' },
  { label: 'Every Sunday midnight', expr: '0 0 * * 0' },
  { label: 'Every Monday 8 AM', expr: '0 8 * * 1' },
  { label: '1st of every month', expr: '0 0 1 * *' },
  { label: 'Every year (Jan 1)', expr: '0 0 1 1 *' },
  { label: 'Every quarter', expr: '0 0 1 */3 *' },
];

const FAQS = [
  { q: 'What is a cron expression?', a: 'A cron expression is a string with 5 fields (minute, hour, day-of-month, month, day-of-week) that defines a schedule for automated tasks. It\'s used in Unix/Linux cron jobs, Kubernetes, AWS EventBridge, GitHub Actions, and many other schedulers.' },
  { q: 'What does * mean in cron?', a: 'The asterisk (*) means "every" — every minute, every hour, every day, etc. For example, * * * * * runs every single minute.' },
  { q: 'What is the difference between day-of-month and day-of-week?', a: 'Day-of-month (field 3) refers to the numeric day in the month (1–31). Day-of-week (field 5) refers to the day of the week (0=Sunday through 6=Saturday). You can use either or both, but using both with non-asterisk values may produce unexpected results.' },
  { q: 'How do I run a cron job every 5 minutes?', a: 'Use the expression */5 * * * * — the */5 in the minute field means "every 5 minutes." The slash (/) is used for step values.' },
  { q: 'What is the cron expression for midnight every day?', a: 'Use 0 0 * * * — this means "at minute 0, of hour 0 (midnight), every day, every month, every weekday."' },
];

export default function CronExpressionGenerator() {
  const [cronExpr, setCronExpr] = useState('0 * * * *');
  const [fields, setFields] = useState<CronField>({ minute: '0', hour: '*', dayOfMonth: '*', month: '*', dayOfWeek: '*' });
  const [mode, setMode] = useState<'visual' | 'raw'>('visual');
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const expression = useMemo(() => mode === 'visual' ? buildCron(fields) : cronExpr, [mode, fields, cronExpr]);
  const validationError = useMemo(() => validateCron(expression), [expression]);
  const humanReadable = useMemo(() => {
    if (validationError) return '';
    const { fields: f } = parseCronExpression(expression);
    return cronToHuman(f);
  }, [expression, validationError]);

  const handleFieldChange = (field: keyof CronField, val: string) => {
    setFields(prev => ({ ...prev, [field]: val || '*' }));
  };

  const handlePreset = (expr: string) => {
    setCronExpr(expr);
    const { fields: f } = parseCronExpression(expr);
    setFields(f);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(expression);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRawChange = (val: string) => {
    setCronExpr(val);
    const { fields: f } = parseCronExpression(val);
    if (!parseCronExpression(val).error) setFields(f);
  };

  const schemaOrg = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: 'Cron Expression Generator',
        applicationCategory: 'WebApplication',
        operatingSystem: 'Any',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        url: CANONICAL,
        description: 'Free online cron expression generator. Build cron schedules visually and get human-readable explanations.',
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: BASE },
          { '@type': 'ListItem', position: 2, name: 'Tools', item: `${BASE}/tools` },
          { '@type': 'ListItem', position: 3, name: 'Cron Expression Generator', item: CANONICAL },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: FAQS.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
      },
    ],
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4">
      <Helmet>
        <title>Cron Expression Generator — Free Cron Builder & Parser | Texly</title>
        <meta name="description" content="Free cron expression generator and parser. Build cron schedules visually, get human-readable explanations, use presets, and validate cron syntax instantly." />
        <meta name="keywords" content="cron expression generator, cron builder, cron maker, cron parser, cron syntax generator, cron schedule generator, cron job generator, crontab generator" />
        <link rel="canonical" href={CANONICAL} />
        <meta property="og:title" content="Cron Expression Generator — Free Cron Builder & Parser" />
        <meta property="og:description" content="Build cron schedules visually, get human-readable explanations, and validate cron syntax instantly." />
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
          <span>Cron Expression Generator</span>
        </nav>

        {/* Hero */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 mb-4">
            <Clock className="w-8 h-8" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-3">Cron Expression Generator</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Build cron schedules visually or parse any cron expression into plain English.
            Works with crontab, AWS EventBridge, GitHub Actions, Kubernetes, and more.
          </p>
        </div>

        {/* Output Expression */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5 mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Cron Expression</span>
            <button onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl px-5 py-4 text-center tracking-widest mb-3 break-all">
            {expression}
          </div>
          {validationError ? (
            <p className="text-sm text-red-500 dark:text-red-400 text-center">{validationError}</p>
          ) : (
            <p className="text-sm text-slate-600 dark:text-slate-400 text-center italic">{humanReadable}</p>
          )}
        </div>

        {/* Mode Tabs */}
        <div className="flex gap-2 mb-4">
          <button onClick={() => setMode('visual')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${mode === 'visual' ? 'bg-emerald-600 text-white' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
            Visual Builder
          </button>
          <button onClick={() => setMode('raw')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${mode === 'raw' ? 'bg-emerald-600 text-white' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
            Raw Input / Parser
          </button>
        </div>

        {mode === 'visual' ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5 mb-4">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Visual Builder</h2>
            <div className="grid sm:grid-cols-5 gap-4">
              {([
                { key: 'minute', label: 'Minute', placeholder: '0-59 or *', hint: '* = every minute' },
                { key: 'hour', label: 'Hour', placeholder: '0-23 or *', hint: '* = every hour' },
                { key: 'dayOfMonth', label: 'Day (Month)', placeholder: '1-31 or *', hint: '* = every day' },
                { key: 'month', label: 'Month', placeholder: '1-12 or *', hint: '* = every month' },
                { key: 'dayOfWeek', label: 'Weekday', placeholder: '0-7 or *', hint: '0/7=Sun' },
              ] as const).map(({ key, label, placeholder, hint }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">{label}</label>
                  <input
                    type="text"
                    value={fields[key as keyof CronField]}
                    onChange={e => handleFieldChange(key as keyof CronField, e.target.value)}
                    placeholder={placeholder}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-center"
                  />
                  <p className="text-xs text-slate-400 mt-1 text-center">{hint}</p>
                </div>
              ))}
            </div>

            {/* Field labels */}
            <div className="mt-4 flex justify-around text-[10px] text-slate-400 dark:text-slate-500 font-mono">
              <span>MIN</span><span>HOUR</span><span>DOM</span><span>MON</span><span>DOW</span>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5 mb-4">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Enter Cron Expression to Parse</h2>
            <input
              type="text"
              value={cronExpr}
              onChange={e => handleRawChange(e.target.value)}
              placeholder="e.g. 0 9 * * 1-5"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono text-base focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <p className="text-xs text-slate-400 mt-2">Format: minute hour day-of-month month day-of-week</p>
          </div>
        )}

        {/* Presets */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5 mb-8">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-500" /> Common Presets
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {PRESETS.map(({ label, expr }) => (
              <button key={expr} onClick={() => handlePreset(expr)}
                className={`text-left px-3 py-2.5 rounded-xl border text-sm transition-colors ${expression === expr ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' : 'border-slate-200 dark:border-slate-700 hover:border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 text-slate-700 dark:text-slate-300'}`}>
                <div className="font-medium text-xs mb-0.5">{label}</div>
                <div className="font-mono text-xs text-slate-500 dark:text-slate-400">{expr}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Educational Content */}
        <section className="prose prose-slate dark:prose-invert max-w-none mb-10">
          <h2>What is a Cron Expression?</h2>
          <p>A <strong>cron expression</strong> is a string of 5 whitespace-separated fields that define a recurring schedule. Cron was originally a Unix job scheduler, but today cron expressions are used everywhere: AWS EventBridge, GCP Cloud Scheduler, GitHub Actions, Kubernetes CronJobs, Heroku Scheduler, and nearly every CI/CD platform.</p>

          <h3>Cron Expression Format</h3>
          <pre className="bg-slate-100 dark:bg-slate-800 rounded-xl p-4 text-sm font-mono overflow-x-auto">
{`┌──────── minute (0-59)
│ ┌────── hour (0-23)
│ │ ┌──── day of month (1-31)
│ │ │ ┌── month (1-12)
│ │ │ │ ┌ day of week (0-7, 0=Sun)
│ │ │ │ │
* * * * *`}
          </pre>

          <h3>Special Characters</h3>
          <ul>
            <li><code>*</code> — any value (wildcard)</li>
            <li><code>*/n</code> — every n units (e.g., <code>*/5</code> = every 5)</li>
            <li><code>n-m</code> — range (e.g., <code>1-5</code> = Monday through Friday)</li>
            <li><code>a,b,c</code> — list (e.g., <code>1,3,5</code> = Mon, Wed, Fri)</li>
          </ul>

          <h3>Common Use Cases</h3>
          <ul>
            <li>Database backups — <code>0 2 * * *</code> (2 AM daily)</li>
            <li>Cache clearing — <code>*/15 * * * *</code> (every 15 minutes)</li>
            <li>Email digests — <code>0 9 * * 1</code> (Monday 9 AM)</li>
            <li>Health checks — <code>* * * * *</code> (every minute)</li>
            <li>Monthly reports — <code>0 0 1 * *</code> (1st of month, midnight)</li>
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
              { to: '/tools/regex-explainer', name: 'AI Regex Explainer' },
              { to: '/tools/json-path-finder', name: 'JSON Path Finder' },
              { to: '/tools/robots-txt-tester', name: 'Robots.txt Tester' },
            ].map(({ to, name }) => (
              <Link key={to} to={to}
                className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 hover:border-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors shadow-sm">
                {name}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
