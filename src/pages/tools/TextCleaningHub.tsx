import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Trash2, 
  Sparkles, 
  RotateCcw, 
  Copy, 
  Check, 
  ChevronRight,
  Info,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';

const SEO_TITLE = "Text Cleaning Suite — Remove Spaces, Duplicates, HTML Tags & More ⚡ Free";
const SEO_DESC = "Free all-in-one text cleaner. Remove extra spaces, duplicate lines, HTML tags, empty lines, emojis, accents, punctuation, numbers, and special characters instantly. No login. Real-time browser-based processing.";
const SEO_KEYWORDS = "text cleaner online free, remove extra spaces online, remove duplicate lines, remove html tags online, remove emojis from text, text cleaning tool, strip punctuation online";
const CANONICAL_URL = "https://www.texlyonline.in/tools/text-cleaning-hub";

interface CleaningOptions {
  removeExtraSpaces: boolean;
  removeLineBreaks: boolean;
  removeDuplicateLines: boolean;
  removeEmptyLines: boolean;
  removeNumbers: boolean;
  removeSpecialChars: boolean;
  removeHtmlTags: boolean;
  removeAccents: boolean;
  removeEmojis: boolean;
  removePunctuation: boolean;
  removeAllWhitespace: boolean;
  removeDuplicateWords: boolean;
  trimEachLine: boolean;
  whitespaceRemover: boolean;
  markdownToPlain: boolean;
}

const DEFAULT_OPTIONS: CleaningOptions = {
  removeExtraSpaces: false,
  removeLineBreaks: false,
  removeDuplicateLines: false,
  removeEmptyLines: false,
  removeNumbers: false,
  removeSpecialChars: false,
  removeHtmlTags: false,
  removeAccents: false,
  removeEmojis: false,
  removePunctuation: false,
  removeAllWhitespace: false,
  removeDuplicateWords: false,
  trimEachLine: false,
  whitespaceRemover: false,
  markdownToPlain: false,
};

export default function TextCleaningHub({ activeToolId }: { activeToolId?: string } = {}) {
  const [searchParams] = useSearchParams();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [options, setOptions] = useState<CleaningOptions>(DEFAULT_OPTIONS);
  const [copied, setCopied] = useState(false);
  const [faqOpen, setFaqOpen] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const tool = activeToolId || searchParams.get('tool');
    if (!tool) return;

    let optionKey: keyof CleaningOptions | null = null;
    let sampleText = '';

    switch (tool) {
      case 'remove-extra-spaces':
        optionKey = 'removeExtraSpaces';
        sampleText = 'This    is    a    text    with    too    many    spaces.';
        break;
      case 'remove-line-breaks':
        optionKey = 'removeLineBreaks';
        sampleText = 'This is a text\nwith multiple\nline breaks.';
        break;
      case 'remove-duplicate-lines':
        optionKey = 'removeDuplicateLines';
        sampleText = 'Apple\nBanana\nApple\nOrange\nBanana';
        break;
      case 'remove-empty-lines':
        optionKey = 'removeEmptyLines';
        sampleText = 'Line 1\n\nLine 2\n\n\nLine 3';
        break;
      case 'remove-numbers':
        optionKey = 'removeNumbers';
        sampleText = 'Texly 123 offers 456 tools!';
        break;
      case 'remove-special-characters':
      case 'remove-special-characters-online':
        optionKey = 'removeSpecialChars';
        sampleText = 'Hello! How are you? (I am fine @ home).';
        break;
      case 'remove-html-tags':
        optionKey = 'removeHtmlTags';
        sampleText = '<p>Visit <a href="https://texlyonline.in">Texly</a> for free text tools.</p>';
        break;
      case 'remove-accents':
        optionKey = 'removeAccents';
        sampleText = 'Crème brûlée';
        break;
      case 'remove-emojis':
        optionKey = 'removeEmojis';
        sampleText = 'Hello 🌍! How are you? 😊';
        break;
      case 'remove-punctuation':
        optionKey = 'removePunctuation';
        sampleText = 'Hello, world! (This is a test.)';
        break;
      case 'remove-all-whitespace':
        optionKey = 'removeAllWhitespace';
        sampleText = 'This is a text with spaces.';
        break;
      case 'remove-duplicate-words':
        optionKey = 'removeDuplicateWords';
        sampleText = 'This is is a a test test.';
        break;
      case 'remove-whitespace-trim':
        optionKey = 'trimEachLine';
        sampleText = '   Trim me   ';
        break;
      case 'whitespace-remover':
        optionKey = 'whitespaceRemover';
        sampleText = 'This is a text with spaces.';
        break;
      case 'markdown-to-plain':
        optionKey = 'markdownToPlain';
        sampleText = '# Heading\nThis is **bold** and *italic*. [Link](https://texlyonline.in)';
        break;
    }

    if (optionKey) {
      const newOptions = { ...DEFAULT_OPTIONS };
      Object.keys(newOptions).forEach(k => {
        newOptions[k as keyof CleaningOptions] = false;
      });
      newOptions[optionKey] = true;
      setOptions(newOptions);
      setInput(sampleText);
    }
  }, [activeToolId, searchParams]);

  const toggleOption = (key: keyof CleaningOptions) => {
    setOptions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleClean = useCallback(() => {
    if (!input) {
      setOutput('');
      return;
    }

    let result = input;

    // 1. Trim Each Line
    if (options.trimEachLine) {
      result = result.split('\n').map(line => line.trim()).join('\n');
    }

    // 2. Remove HTML Tags
    if (options.removeHtmlTags) {
      result = result.replace(/<[^>]+>/g, '');
    }

    // 3. Remove Markdown to Plain Text
    if (options.markdownToPlain) {
      result = result
        .replace(/([_*~`#+>\-|!\[\]()])/g, '') // strip markdown symbols
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1'); // strip links keep text
    }

    // 4. Remove Emojis
    if (options.removeEmojis) {
      result = result.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, '');
    }

    // 5. Remove Accents / Diacritics
    if (options.removeAccents) {
      result = result.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }

    // 6. Remove Punctuation
    if (options.removePunctuation) {
      result = result.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'’‘”«»°]/g, '');
    }

    // 7. Remove Numbers
    if (options.removeNumbers) {
      result = result.replace(/[0-9]/g, '');
    }

    // 8. Remove Special Characters
    if (options.removeSpecialChars) {
      result = result.replace(/[^a-zA-Z0-9\s\n\r]/g, '');
    }

    // 9. Remove Duplicate Words per word set
    if (options.removeDuplicateWords) {
      result = result.split('\n').map(line => {
        const words = line.split(/\s+/);
        const seen = new Set<string>();
        return words.filter(w => {
          const lower = w.toLowerCase();
          if (seen.has(lower)) return false;
          seen.add(lower);
          return true;
        }).join(' ');
      }).join('\n');
    }

    // 10. Remove Empty Lines
    if (options.removeEmptyLines) {
      result = result.split('\n').filter(line => line.trim() !== '').join('\n');
    }

    // 11. Remove Duplicate Lines
    if (options.removeDuplicateLines) {
      const lines = result.split('\n');
      const uniqueLines = Array.from(new Set(lines));
      result = uniqueLines.join('\n');
    }

    // 12. Remove Line Breaks
    if (options.removeLineBreaks) {
      result = result.replace(/[\r\n]+/g, ' ');
    }

    // 13. Remove Extra Spaces (Multiple spaces to single space)
    if (options.removeExtraSpaces || options.whitespaceRemover) {
      result = result.replace(/[ \t]+/g, ' ');
    }

    // 14. Remove All Whitespace
    if (options.removeAllWhitespace) {
      result = result.replace(/\s+/g, '');
    }

    setOutput(result);
  }, [input, options]);

  useEffect(() => {
    if (input) {
      handleClean();
    } else {
      setOutput('');
    }
  }, [input, options, handleClean]);

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setInput('');
    setOutput('');
    setOptions(DEFAULT_OPTIONS);
  };

  const loadSample = () => {
    setInput(`<b>Welcome back!</b> This is a <i>sample</i> text loaded at @ 10:45 AM. 😊

This line has duplicate text duplicated word word.
This line has duplicate text duplicated word word.

Let's clean up #extra_spaces      between words.
Hello world! *Markdown bold* and [GitHub Link](https://github.com) is simple.
Normalizing diacritics like é, à, and ö.`);
  };

  const inputStats = useMemo(() => {
    return {
      chars: input.length,
      words: input ? input.trim().split(/\s+/).filter(Boolean).length : 0,
      lines: input ? input.split('\n').length : 0
    };
  }, [input]);

  const outputStats = useMemo(() => {
    return {
      chars: output.length,
      words: output ? output.trim().split(/\s+/).filter(Boolean).length : 0,
      lines: output ? output.split('\n').length : 0
    };
  }, [output]);

  const faqs = [
    { q: "Is my text data safe on Texly?", a: "Yes, 100% safe. All text cleaning operations are executed entirely client-side inside your browser. No text or documents are uploaded to our servers, ensuring your data remains completely private." },
    { q: "What is the best way to remove double duplicate lines?", a: "To remove duplicate lines, simply paste your text in the input box, tick the 'Remove Duplicate Lines' toggle in the Line & Word Operations group, and click 'Clean now'. All matching lines are consolidated instantly." },
    { q: "Can I strip HTML and Markdown formatting simultaneously?", a: "Absolutely. Our Text Cleaning Suite is built to do multi-pass processing. You can check both 'Remove HTML Tags' and 'Markdown to Plain Text' to sanitize your complex copies in a single pass." },
    { q: "How do I clean up extra whitespaces and spaces?", a: "Select either 'Remove Extra Spaces' or 'Whitespace Remover'. This translates all multiple-tab spaces and contiguous whitespace characters into clean single spaces, leaving your styling clean and readable." },
    { q: "Will removing punctuation break sentence breaks?", a: "Removing punctuation replaces commas, exclamation marks, and periods with empty space without touching line breaks or letters, leaving words readable but free of punctuation tags." },
    { q: "Is there an input size limit for text cleaning?", a: "There is no functional size limit. Because execution is run in your current browser instance, the limits depend purely on your RAM and CPU specifications." },
    { q: "What are the benefits of text cleaning for natural language processing (NLP) and machine learning?", a: "In NLP, text cleaning is a fundamental first step because raw web noise details (like emojis, punctuation, HTML codes, and special signs) are typically non-informative. Clean text structures allow for optimal word embedding creation, better classification, and faster model learning times." },
    { q: "How does Texly remove accented characters or diacritics?", a: "We normalize the text using NFD (Normalization Form Canonical Decomposition) which splits the base letter from its accent, and then use a regular expression to clear out the combining diacritical marks. For instance, 'Crème brûlée' safely becomes 'Creme brulee'." }
  ];

  return (
    <main className="min-h-screen bg-slate-50/50 dark:bg-slate-950 py-10 px-4 sm:px-6 lg:px-8">
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
          "name": "Text Cleaning Suite",
          "url": CANONICAL_URL,
          "description": SEO_DESC,
          "applicationCategory": "UtilitiesApplication",
          "operatingSystem": "Any",
          "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
          "featureList": [
            "Remove Extra Spaces", "Remove Line Breaks", "Remove Duplicate Lines", 
            "Remove Empty Lines", "Remove HTML Tags", "Remove Emojis", "Remove Accents", 
            "Remove Numbers", "Remove Special Characters", "Remove Punctuation", "Markdown to Plain"
          ]
        })}</script>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.texlyonline.in" },
            { "@type": "ListItem", "position": 2, "name": "Text Cleaning Suite", "item": CANONICAL_URL }
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
        <nav className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400 mb-6">
          <Link to="/" className="hover:text-amber-500 transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-slate-800 dark:text-slate-200 font-semibold text-xs py-0.5 px-2 bg-slate-100 dark:bg-slate-800 rounded">Text Cleaning</span>
        </nav>

        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-600 dark:text-amber-400">Hub 2</span>
            <span className="text-xs font-semibold text-slate-400">16-in-1 Tool Suite</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">
            Text Cleaning Suite
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm max-w-3xl leading-relaxed">
            Eliminate double whitespaces, clean broken lines, strip HTML scripts, and remove unneeded symbols safely. Instant client-side workspace with zero data logging tags.
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-500/10 text-green-700 dark:text-green-400 text-xs font-semibold rounded-full border border-green-500/20 shadow-sm">
              ✅ 16 Tools Included
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

        {/* Input/Output areas card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Input Panel */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-[320px]">
            <div className="flex justify-between items-center px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Input Raw Text</span>
              <button 
                onClick={loadSample}
                className="text-[10px] font-black uppercase tracking-widest text-amber-500 hover:text-amber-600 transition-colors"
              >
                Load Sample
              </button>
            </div>
            <textarea
              className="flex-1 p-4 bg-transparent resize-none text-xs text-slate-800 dark:text-slate-200 outline-none leading-relaxed overflow-y-auto"
              placeholder="Paste or write your raw messy text here..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            {/* Input Stats */}
            <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-500">
              <span>Chars: {inputStats.chars}</span>
              <span>Words: {inputStats.words}</span>
              <span>Lines: {inputStats.lines}</span>
            </div>
          </div>

          {/* Output Panel */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-[320px]">
            <div className="flex justify-between items-center px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Cleaned Result</span>
              {output && (
                <button 
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-[10px] font-bold text-amber-500 hover:text-amber-600 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              )}
            </div>
            <textarea
              className="flex-1 p-4 bg-transparent resize-none text-xs text-slate-800 dark:text-slate-200 outline-none leading-relaxed overflow-y-auto"
              placeholder="Processed output will load here..."
              value={output}
              readOnly
            />
            {/* Output Stats */}
            <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-500">
              <span>Chars: {outputStats.chars}</span>
              <span>Words: {outputStats.words}</span>
              <span>Lines: {outputStats.lines}</span>
            </div>
          </div>
        </div>

        {/* Control Center */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 mb-12">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-slate-850 pb-3">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Configure Cleaning Operations</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
            {/* Group 1: Spaces & Lines */}
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3 border-b border-slate-100 dark:border-slate-850 pb-1">Whitespace & Lines</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <input type="checkbox" checked={options.removeExtraSpaces} onChange={() => toggleOption('removeExtraSpaces')} className="w-4 h-4 accent-amber-500" />
                  <span>Remove Extra Spaces</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <input type="checkbox" checked={options.removeLineBreaks} onChange={() => toggleOption('removeLineBreaks')} className="w-4 h-4 accent-amber-500" />
                  <span>Remove Line Breaks</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <input type="checkbox" checked={options.removeEmptyLines} onChange={() => toggleOption('removeEmptyLines')} className="w-4 h-4 accent-amber-500" />
                  <span>Remove Empty Lines</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <input type="checkbox" checked={options.removeAllWhitespace} onChange={() => toggleOption('removeAllWhitespace')} className="w-4 h-4 accent-amber-500" />
                  <span>Remove All Whitespace</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <input type="checkbox" checked={options.trimEachLine} onChange={() => toggleOption('trimEachLine')} className="w-4 h-4 accent-amber-500" />
                  <span>Trim Each Line</span>
                </label>
              </div>
            </div>

            {/* Group 2: Elements Removal */}
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3 border-b border-slate-100 dark:border-slate-850 pb-1">Removal Controls</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <input type="checkbox" checked={options.removeNumbers} onChange={() => toggleOption('removeNumbers')} className="w-4 h-4 accent-amber-500" />
                  <span>Remove Numbers</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <input type="checkbox" checked={options.removeSpecialChars} onChange={() => toggleOption('removeSpecialChars')} className="w-4 h-4 accent-amber-500" />
                  <span>Remove Special Chars</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <input type="checkbox" checked={options.removeEmojis} onChange={() => toggleOption('removeEmojis')} className="w-4 h-4 accent-amber-500" />
                  <span>Remove Emojis</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <input type="checkbox" checked={options.removePunctuation} onChange={() => toggleOption('removePunctuation')} className="w-4 h-4 accent-amber-500" />
                  <span>Remove Punctuation</span>
                </label>
              </div>
            </div>

            {/* Group 3: Formatting & Duplicates */}
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3 border-b border-slate-100 dark:border-slate-850 pb-1">Filtering & Formatting</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <input type="checkbox" checked={options.removeDuplicateLines} onChange={() => toggleOption('removeDuplicateLines')} className="w-4 h-4 accent-amber-500" />
                  <span>Remove Duplicate Lines</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <input type="checkbox" checked={options.removeDuplicateWords} onChange={() => toggleOption('removeDuplicateWords')} className="w-4 h-4 accent-amber-500" />
                  <span>Remove Duplicate Words</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <input type="checkbox" checked={options.removeHtmlTags} onChange={() => toggleOption('removeHtmlTags')} className="w-4 h-4 accent-amber-500" />
                  <span>Remove HTML Tags</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <input type="checkbox" checked={options.removeAccents} onChange={() => toggleOption('removeAccents')} className="w-4 h-4 accent-amber-500" />
                  <span>Remove Accents</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer text-[#0284c7] dark:text-[#38bdf8] text-xs font-semibold">
                  <input type="checkbox" checked={options.markdownToPlain} onChange={() => toggleOption('markdownToPlain')} className="w-4 h-4 accent-cyan-500" />
                  <span>Markdown to Plain Text</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button 
              onClick={handleClean}
              className="flex-1 py-3 px-6 bg-amber-500 hover:bg-amber-600 transition-colors text-white font-bold rounded-xl text-xs uppercase tracking-widest cursor-pointer shadow-sm shadow-amber-500/10"
            >
              Clean Text Now
            </button>
            <button 
              onClick={handleReset}
              className="py-3 px-5 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors text-slate-600 dark:text-slate-400 font-bold rounded-xl text-xs uppercase tracking-widest flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" /> Reset
            </button>
          </div>
        </div>

        {/* Security / Quality Check Banner */}
        <div className="mb-12 flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 px-5 py-4 rounded-2xl">
          <ShieldCheck className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0" />
          <div>
            <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider mb-0.5">Privacy Shield Active</h4>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">All sanitization routines are executed client-side. No characters are streamed or logged across networks.</p>
          </div>
        </div>

        {/* SEO Information & Guides */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-10 mb-12">
          <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 text-sm leading-relaxed space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
                Text Cleaning Suite — Complete Guide to Text Sanitization & Preprocessing
              </h2>
              <p>
                In the modern digital landscape, content writers, SEO specialists, developers, and data scientists constantly interact with text blocks copy-pasted from varied platforms — PDF files, rich content editors, CMS tools like WordPress, and databases. Often, these characters bring unwanted artifacts: triple spacings, raw HTML formatting, broken carriage returns, incompatible emojis, and random punctuation tags.
              </p>
              <p>
                Our Text Cleaning workspace is a professional system built to clear out spacing anomalies, format differences, scrap remnants, and text redundancy in milliseconds. Because we operate entirely on client-side JavaScript, your data never crosses local borders, keeping proprietary documents secure and confidential.
              </p>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
                Every Text Cleaning Feature Explained
              </h2>
              <p>
                Having a clean set of paragraphs makes a remarkable difference in rendering consistency and search ranking indexing metrics. Here is an in-depth breakdown of how each function updates your copy:
              </p>
              <div className="space-y-4 mt-4">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-1">
                    1. Remove Extra Spaces & Whitespace Remover
                  </h3>
                  <p>
                    When copy-pasted from Microsoft Word, PDF documents, or tabular outputs, spacing anomalies are frequent. Extra spacebars are instantly replaced with standard single delimiters. By selecting normalized whitespace removal options, you keep organic spacings without breaking layout boundaries across mobile devices.
                  </p>
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-1">
                    2. Strip HTML Code Scripts
                  </h3>
                  <p>
                    Web scraped texts often pull in stubborn HTML nodes like inline tables, paragraphs, div blocks, and scripts. This option parses the input, strips all angle brackets and internal contents, and delivers a pristine plain paragraph.
                  </p>
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-1">
                    3. Remove Duplicate and Blank Lines
                  </h3>
                  <p>
                    Redundancy easily stacks up when compiling keyword lists, email lists, or URL arrays. Our duplicate line checker audits individual rows in real-time, removing recurrent records while also filtering out empty spaces to keep your files light and organized.
                  </p>
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-1">
                    4. Remove Emojis & Special Characters
                  </h3>
                  <p>
                    For systems that feed clean arrays to database tables, processing emoji arrays and non-alphanumeric characters can result in encoding exceptions. Strip these emoticons and symbols to conform with strict database structures.
                  </p>
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-1">
                    5. Remove Accents / Diacritics
                  </h3>
                  <p>
                    Often search indexes prefer plain base strings to align search results. Texly normalizes Unicode characters (like changing 'é' to 'e'), facilitating better match distributions in internal query functions.
                  </p>
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-1">
                    6. Markdown to Plain Text Conversion
                  </h3>
                  <p>
                    If you draft copy in markdown files, you may eventually require raw paragraphs. Our custom regex scanner strips standard markdown symbols (*, _, #, ~, brackets) while retaining link texts to match standard document norms.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
                Common Use Cases for Text Cleaning Services
              </h2>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>
                  <strong>Machine Learning & Data Preprocessing:</strong> Clean text before tokenization to ensure higher accuracy in sentiment analysis, entity extraction, and text categorization.
                </li>
                <li>
                  <strong>SEO Copy Optimization:</strong> Ensure keyword listings and descriptions do not contain trailing double spaces or unapproved characters.
                </li>
                <li>
                  <strong>Content Editing & Publishing:</strong> Clean drafts imported from Google Docs or Word before deploying to websites to avoid custom tag bugs.
                </li>
                <li>
                  <strong>Excel and Database Operations:</strong> De-duplicate lists to keep data integrity intact.
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
                How to Clean Text Locally
              </h2>
              <ol className="list-decimal pl-5 space-y-2 mt-2">
                <li><strong>Step 1 (Input):</strong> Paste your uncleaned copy or drag-and-drop your text content block into the left-hand editor area.</li>
                <li><strong>Step 2 (Configuration):</strong> Explore the options in our controls area. Select what you would like to keep or clear out.</li>
                <li><strong>Step 3 (Copy Outcome):</strong> Press 'Clean Text Now' and copy your processed, pristine text result in one click.</li>
              </ol>
            </div>
          </div>
        </section>

        {/* FAQs Section */}
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

        {/* Related Hubs Directory */}
        <section className="bg-slate-100 dark:bg-slate-900/40 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 p-6 sm:p-8">
          <h2 className="text-base font-black uppercase tracking-widest text-slate-400 mb-4">Related Hub Suites</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Link to="/tools/text-analysis-hub" className="p-3 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl text-xs font-bold hover:border-amber-500/50 transition-all text-center">
              Text Analysis Hub
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
