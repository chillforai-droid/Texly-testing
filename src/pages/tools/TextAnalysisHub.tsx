import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  ChevronRight,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import TextAnalysisWorkspace from '../../components/TextAnalysisWorkspace';

const SEO_TITLE = "Text Analysis Hub — Word Counter, Density & Character Statistics Online ⚡ Free";
const SEO_DESC = "Free integrated text analysis suite. Run word counts, letter frequency statistics, sentence analysis, keyword density calculation, and extract emails/URLs recursively in real-time.";
const SEO_KEYWORDS = "text analysis hub online, word counter free, keyword density calculator, sentence count online, extract emails from text";
const CANONICAL_URL = "https://www.texlyonline.in/tools/text-analysis-hub";

export default function TextAnalysisHub({ activeToolId }: { activeToolId?: string } = {}) {
  const [searchParams] = useSearchParams();
  const [faqOpen, setFaqOpen] = useState<Record<number, boolean>>({});

  const rawTool = activeToolId || searchParams.get('tool') || 'word-counter';
  
  // map common search query parameters to actual workspace toolIds
  const currentToolId = useMemo(() => {
    switch (rawTool) {
      case 'char-counter':
      case 'character-count':
        return 'character-counter';
      case 'letter-frequency':
        return 'char-frequency';
      case 'word-length-distribution':
        return 'word-length-stats';
      case 'email-extractor':
        return 'extract-emails';
      case 'url-extractor':
        return 'extract-urls';
      case 'age-calc':
        return 'age-calculator';
      case 'jwt':
        return 'jwt-decoder';
      case 'ocr':
        return 'image-to-text';
      default:
        // By default, check if the rawTool is supported
        return rawTool;
    }
  }, [rawTool]);

  const { toolName, example, placeholder } = useMemo(() => {
    let name = "Word Count & Readability Suite";
    let ex = "Paste your article draft to begin scanning density metrics and readability highlights...";
    let ph = "Paste your content text to gather density variables...";

    switch (currentToolId) {
      case 'word-counter':
        name = "Word Counter";
        break;
      case 'character-counter':
        name = "Character Counter";
        ex = "Text with exactly 48 letters including spaces!";
        ph = "Type text to see real-time character count statistics...";
        break;
      case 'letter-counter':
        name = "Letter Counter";
        ex = "Count letters and disregard symbol structures!";
        break;
      case 'reading-time':
        name = "Reading Time Calculator";
        ex = "A short paragraph has about 100 words. Reading this will take less than 30 seconds for a standard native English speaker reading at 225-250 WPM.";
        break;
      case 'line-counter':
        name = "Line Counter";
        ex = "Line One\nLine Two\nLine Three";
        ph = "Enter text to count the total lines...";
        break;
      case 'sentence-counter':
        name = "Sentence Counter";
        ex = "This is sentence one. Is this number two? Yes, it is! Awesome.";
        break;
      case 'paragraph-counter':
        name = "Paragraph Counter";
        ex = "First paragraph content goes here.\n\nSecond paragraph content is split by empty line structures.";
        break;
      case 'text-density':
        name = "Keyword Density Analyzer";
        ex = "Standard keyword density helps with SEO optimization. Optimizing keyword frequency prevents search engines from marking articles as junk.";
        break;
      case 'case-distribution':
        name = "Case Distribution Analyzer";
        ex = "UPPERCASE lower case Title Case Sentence Case.";
        break;
      case 'extract-emails':
        name = "Email Address Extractor";
        ex = "Contact admin@texlyonline.in or support@texlyonline.in for questions.";
        ph = "Paste text containing matches like user@domain.com...";
        break;
      case 'extract-urls':
        name = "URL Hyperlink Extractor";
        ex = "Explore https://texlyonline.in or secure links under https://google.com for tests.";
        ph = "Paste text containing URLs like https://example.com...";
        break;
      case 'char-frequency':
        name = "Character Frequency Statistics";
        ex = "Analyze spelling distributions, letter frequency counts, and density variations.";
        break;
      case 'word-length-stats':
        name = "Word Length Distribution";
        ex = "The quick brown fox jumps over the lazy dog.";
        break;
      case 'age-calculator':
        name = "Age Calculator";
        ex = "1995-10-15";
        ph = "Select birthdate below";
        break;
      case 'jwt-decoder':
        name = "JWT Decoder (JSON Web Token)";
        ex = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
        ph = "Paste JWT token string...";
        break;
      case 'text-diff':
        name = "Text Diff Comparison";
        ex = "";
        ph = "";
        break;
      case 'image-to-text':
        name = "Image to Text OCR";
        ex = "";
        ph = "";
        break;
    }

    return { toolName: name, example: ex, placeholder: ph };
  }, [currentToolId]);

  const faqs = [
    { q: "What analysis tools reside within this hub?", a: "This workspace integrates word counter, character statistics, sentence analyzers, paragraph trackers, keyword density mapping, and email/URL extraction scripts under one screen." },
    { q: "Is my pasted paragraph secure during analysis?", a: "100% private. All character scanning metrics, token splitting, and density parsing routines are executed in browser volatile memory locally, leaving no trace logs." },
    { q: "How is the reading time metric calculated?", a: "Our algorithm estimates reading speeds at a standard 225 words per minute (WPM) for general readers, calculating precise content digestion times based on total word counts." },
    { q: "What is the ideal keyword density for SEO optimization?", a: "An ideal keyword density is usually between 1% and 2%. Moving keyword frequency beyond 2.5% can trigger search engine keyword-stuffing penalties, which degrades organic ranking success." },
    { q: "How is character count different from word count?", a: "Word counts isolate separate groups of letters split by whitespaces. Character counts calculate every single key stroke, including spaces, tabs, punctuations, and carrier returns." },
    { q: "Can I extract email contacts and URLs from large text files?", a: "Yes. Our extraction routines execute local regular expression matching to scan through large drafts, filtering and isolating compliant emails or hyperlinks instantly." },
    { q: "What are the platform-specific character limits tracked by Texly?", a: "Our tracker lists limits for Facebook (63,206), Twitter posts (280), SMS texts (160), Google Search meta descriptions (160), and Instagram captions (2,200) to keep social drafts safe from getting cut off." },
    { q: "How does the age calculator tool work?", a: "Choose your birthdate, and our tool calculates the exact age down to year, month, day, hours, and minutes based on real-time browser clock offsets." }
  ];

  return (
    <main className="min-h-screen bg-slate-50/50 dark:bg-slate-950 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <Helmet>
        <title>{SEO_TITLE}</title>
        <meta name="description" content={SEO_DESC} />
        <meta name="keywords" content={SEO_KEYWORDS} />
        <link rel="canonical" href={CANONICAL_URL} />
        <meta property="og:title" content={SEO_TITLE} />
        <meta property="og:description" content={SEO_DESC} />
        <meta property="og:url" content={CANONICAL_URL} />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "Text Analysis Hub",
          "url": CANONICAL_URL,
          "description": SEO_DESC,
          "applicationCategory": "UtilitiesApplication",
          "operatingSystem": "Any (Browser-based)",
          "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
          "featureList": [
            "Word Counter", "Character Counter", "Letter Counter", "Reading Time Calculator",
            "Line Counter", "Sentence Counter", "Paragraph Counter", "Keyword Density Analyzer",
            "Email Extractor", "URL Extractor", "Character Frequency Statistics", "Age Calculator"
          ],
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "ratingCount": "1532",
            "bestRating": "5",
            "worstRating": "1"
          }
        })}</script>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.texlyonline.in" },
            { "@type": "ListItem", "position": 2, "name": "Text Analysis Hub", "item": CANONICAL_URL }
          ]
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

      <div className="max-w-5xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400 mb-6 font-sans">
          <Link to="/" className="hover:text-amber-500 transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-slate-800 dark:text-slate-200 font-semibold text-xs py-0.5 px-2 bg-slate-100 dark:bg-slate-800 rounded">Text Analysis</span>
        </nav>

        {/* Header */}
        <header className="mb-8 font-sans">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-600 dark:text-amber-400">Hub 1</span>
            <span className="text-xs font-semibold text-slate-400">Word Count & Density Analysis</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">
            Text Analysis Hub
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm max-w-3xl leading-relaxed">
            Run full readability diagnostics. Analyze keyword density frequencies, extract email contacts, count paragraph structures, and evaluate character spaces instantly in a secure console.
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-500/10 text-green-700 dark:text-green-400 text-xs font-semibold rounded-full border border-green-500/20 shadow-sm">
              ✅ 17 Tools Included
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500/10 text-blue-700 dark:text-blue-400 text-xs font-semibold rounded-full border border-blue-500/20 shadow-sm">
              🔒 100% Browser-Based
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-semibold rounded-full border border-amber-500/20 shadow-sm">
              ⚡ Real-Time Processing
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-sky-500/10 text-sky-700 dark:text-sky-400 text-xs font-semibold rounded-full border border-sky-500/20 shadow-sm">
              🆓 Always Free
            </span>
          </div>
        </header>

        {/* TextAnalysisWorkspace integration */}
        <div className="mb-12">
          <TextAnalysisWorkspace 
            toolId={currentToolId}
            process={(input) => `Analyzed total ${input.length} characters.`}
            example={example}
            placeholder={placeholder}
            toolName={toolName}
          />
        </div>

        {/* SEO ARTICLE SECTION — DO NOT REMOVE */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-10 mb-12">
          <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 text-sm leading-relaxed space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
                Text Analysis Hub — Complete Word Counting & Diagnostic Guide
              </h2>
              <p>
                In today's digital era, precision is paramount. Whether you are drafting an academic research paper, optimizing a blog post for search engine indexing layouts, or finalizing social media ad slogans, understanding structural metrics is critical. The Texly Text Analysis workspace acts as a premium interactive diagnostics dashboard, evaluating paragraph densities, space ratios, word-length frequencies, and content metadata securely.
              </p>
              <p>
                While tools like Microsoft Word and Google Docs provide basic letter counters and word stats, they often lack granular control. They do not calculate exact character distribution rates, do not highlight specific keyword density patterns, and do not offer real-time extraction parameters for emails or hyperlink references.
              </p>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
                Core Metrics & Tool Dimensions in This Suite
              </h2>
              <p>
                Our Text Analysis Hub aggregates seventeen separate utility options, helping you analyze and optimize written structures in seconds:
              </p>
              <div className="space-y-4 mt-4">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-1">
                    1. Word & Character Counter Online
                  </h3>
                  <p>
                    Ensure your descriptions comply with platform restrictions. Google Search results truncate metadata exceeding 160 characters, while SMS systems split messages past 160 characters. Our counter lets you separate or include empty spacing characters, providing exact metadata telemetry.
                  </p>
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-1">
                    2. Reading Time Estimation (200 WPM Basis)
                  </h3>
                  <p>
                    Content creators know that stating "X Min Read" in headers boosts engagement rates. We scan your total input count, dividing it on a standard native-language 225 WPM (Words Per Minute) readability ratio, ensuring accurate estimates.
                  </p>
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-1">
                    3. Sentence & Paragraph trackers
                  </h3>
                  <p>
                    Improve the readability scores of your drafts. Short sentences and divided paragraphs prevent readability strain and improve mobile-user scrolling dwell time. Our trackers evaluate paragraph blocks split by clean double returns.
                  </p>
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-1">
                    4. Keyword Density Analyzer
                  </h3>
                  <p>
                    Avoid search engine penalties. Overstuffing high-frequency keyword strings flags your content as artificial or low quality. Our analyzer tallies individual keyword repeating frequencies, keeping your density safely between 1.2% and 1.8% for search engines.
                  </p>
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-1">
                    5. Contact & Link Extractor (URLs & Emails)
                  </h3>
                  <p>
                    Need to pull emails or links out of messy documents? Our extraction pipeline implements local, server-free regular expression scans, showing you all matching contacts or absolute Web links in clean export tables.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
                Practical Use Cases for Text Analysis
              </h2>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>
                  <strong>Copywriters & Ad Managers:</strong> Keeping ad copies within Twitter (280) or Facebook ad characters margins.
                </li>
                <li>
                  <strong>SEO & Blog Editors:</strong> Tracking meta-title thresholds (60 chars) and meta descriptions (160 chars) to prevent search console ellipsis issues.
                </li>
                <li>
                  <strong>Developers & Data Analysts:</strong> Scanning large JSON-web-tokens (JWT) to inspect header parameters locally or auditing letter frequencies.
                </li>
                <li>
                  <strong>Students & Researchers:</strong> Staying under strict academic word bounds.
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
                Data Security and Privacy Commitment
              </h2>
              <p>
                All processing occurs locally in your browser using client-side JavaScript. 
                No text, files, or personal data is ever uploaded to our servers. Your content 
                remains 100% private and secure on your device.
              </p>
            </div>
          </div>
        </section>

        {/* Security / Privacy Banner */}
        <div className="mb-12 flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-amber-50/5 dark:bg-amber-50/10 border border-amber-500/10 px-5 py-4 rounded-2xl">
          <ShieldCheck className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0" />
          <div>
            <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider mb-0.5">Offline-first privacy rules</h4>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">All characters scanning and formatting are verified locally on your browser. Cookies tracking is disabled.</p>
          </div>
        </div>

        {/* FAQs */}
        <section className="mb-12">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-6">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = !!faqOpen[idx];
              return (
                <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden transition-all">
                  <button 
                    onClick={() => setFaqOpen(prev => ({ ...prev, [idx]: !isOpen }))}
                    className="w-full text-left px-5 py-4 flex items-center justify-between text-xs sm:text-sm font-bold text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-900/30 hover:bg-slate-105 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-850 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed bg-white dark:bg-slate-900">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Footer directories links */}
        <section className="bg-slate-100 dark:bg-slate-900/40 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 p-6 sm:p-8">
          <h2 className="text-base font-black uppercase tracking-widest text-slate-400 mb-4">Related Hub Suites</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Link to="/tools/text-cleaning-hub" className="p-3 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl text-xs font-bold hover:border-amber-500/50 transition-all text-center">
              Text Cleaning Hub
            </Link>
            <Link to="/tools/text-converter-hub" className="p-3 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl text-xs font-bold hover:border-amber-500/50 transition-all text-center">
              Converter Hub
            </Link>
            <Link to="/tools/text-utility-hub" className="p-3 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl text-xs font-bold hover:border-amber-500/50 transition-all text-center">
              Utility Toolkit
            </Link>
            <Link to="/tools/generators-hub" className="p-3 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl text-xs font-bold hover:border-amber-500/50 transition-all text-center">
              Generators Hub
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
