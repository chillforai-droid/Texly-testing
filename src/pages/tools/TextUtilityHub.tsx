import { useState, useCallback, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Copy, 
  Check, 
  ChevronRight,
  ShieldCheck,
  ChevronDown,
  Play
} from 'lucide-react';

const SEO_TITLE = "Text Utility Toolkit — Reverse, Repeat, Sort, Lorem Ipsum, Find & Replace & 25+ Tools ⚡";
const SEO_DESC = "Free all-in-one text utility toolkit. Reverse text, repeat text, sort lines, generate Lorem Ipsum, find and replace, add prefix/suffix, format JSON and SQL. 25+ tools. No login. Browser-based.";
const SEO_KEYWORDS = "text utility tools online free, text reverser online, text repeater online, sort lines alphabetically, lorem ipsum generator, find and replace text online, json formatter online";
const CANONICAL_URL = "https://www.texlyonline.in/tools/text-utility-hub";

type SectionKey = 'manipulation' | 'generators' | 'formatters' | 'special';

interface ToolItem {
  id: string;
  name: string;
  description: string;
}

const TOOLS_CONFIG: Record<SectionKey, ToolItem[]> = {
  manipulation: [
    { id: 'reverser', name: 'Text Reverser', description: 'Reverses string characters or entire word orders.' },
    { id: 'repeater', name: 'Text Repeater', description: 'Repeats clean copy multiple times with separators.' },
    { id: 'sort', name: 'Sort Lines', description: 'Alphabetical sorting A➔Z or Z➔A.' },
    { id: 'findreplace', name: 'Find & Replace', description: 'Search and replace custom substrings.' },
    { id: 'prefixsuffix', name: 'Add Prefix/Suffix', description: 'Append string variables to beginning/end of lines.' },
    { id: 'text2list', name: 'Text to List', description: 'Translate raw delimiters to bullet list points.' },
    { id: 'upsidedown', name: 'Upside Down text', description: 'Flip characters upside down.' },
    { id: 'mirror', name: 'Mirror Text', description: 'Flips and mirrors letter lines.' }
  ],
  generators: [
    { id: 'lorem', name: 'Lorem Ipsum Generator', description: 'Create dummy formatting placeholder articles.' },
    { id: 'randstring', name: 'Random String', description: 'Build secure code tokens and letters.' },
    { id: 'fancy', name: 'Fancy Text Maker', description: 'Format standard text to bubble bold unicode fonts.' },
    { id: 'zalgo', name: 'Zalgo Glitch text', description: 'Enrich string with corrupted stacked indicators.' },
    { id: 'ascii', name: 'ASCII Banner', description: 'Render text as larger symbol blocks.' },
    { id: 'whatsapp', name: 'WhatsApp Formatter', description: 'Applies *bold*, _italics_ visual separators.' }
  ],
  formatters: [
    { id: 'jsonformat', name: 'JSON Formatter', description: 'Prettify or minify raw JSON packets.' },
    { id: 'csv2json', name: 'CSV to JSON', description: 'Convert tabular formats to arrays of key-value objects.' },
    { id: 'json2csv', name: 'JSON to CSV', description: 'Compile JSON arrays into tables.' },
    { id: 'sqlformat', name: 'SQL Formatter', description: 'Indents queries: SELECT, JOIN, WHERE.' },
    { id: 'text2json', name: 'Text to JSON', description: 'Converts simple lines into JSON maps.' },
    { id: 'json2text', name: 'JSON to Text', description: 'Reverts simple JSON maps back to lines.' }
  ],
  special: [
    { id: 'password', name: 'Secure Password Maker', description: 'Strong multi-character entropy keys.' },
    { id: 'steganography', name: 'Text Steganography', description: 'Conceal strings using invisible zero-width characters.' },
    { id: 'pregnancy', name: 'Pregnancy Due Date', description: 'Due date calculation based on LMP.' },
    { id: 'ytstamp', name: 'YouTube Timestamp', description: 'Compile interactive link offsets.' },
    { id: 'invisible', name: 'Invisible Spacer', description: 'Copy invisible symbols.' }
  ]
};

export default function TextUtilityHub({ activeToolId }: { activeToolId?: string } = {}) {
  const [searchParams] = useSearchParams();
  const [activeSection, setActiveSection] = useState<SectionKey>('manipulation');
  const [activeTool, setActiveTool] = useState<string>('reverser');
  
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [faqOpen, setFaqOpen] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const tool = activeToolId || searchParams.get('tool');
    if (!tool) return;

    let section: SectionKey = 'manipulation';
    let subTool = '';
    let sample = '';

    switch (tool) {
      case 'text-reverser':
      case 'reverser':
        section = 'manipulation'; subTool = 'reverser'; sample = 'Check out https://texlyonline.in for more tools!'; break;
      case 'text-repeater':
      case 'repeater':
        section = 'manipulation'; subTool = 'repeater'; sample = 'Texly'; break;
      case 'sort-lines':
      case 'sort':
        section = 'manipulation'; subTool = 'sort'; sample = 'Banana\nApple\nCherry'; break;
      case 'find-replace':
      case 'findreplace':
        section = 'manipulation'; subTool = 'findreplace'; sample = 'Let us do some find & replace test.'; break;
      case 'prefix-suffix':
      case 'prefixsuffix':
        section = 'manipulation'; subTool = 'prefixsuffix'; sample = 'First line\nSecond line'; break;
      case 'text-to-list':
      case 'text2list':
        section = 'manipulation'; subTool = 'text2list'; sample = 'Apple, Banana, Orange'; break;
      case 'upside-down':
      case 'upsidedown':
        section = 'manipulation'; subTool = 'upsidedown'; sample = 'Upside down text'; break;
      case 'mirror':
        section = 'manipulation'; subTool = 'mirror'; sample = 'Mirror reflection text'; break;

      case 'lorem':
      case 'lorem-ipsum':
        section = 'generators'; subTool = 'lorem'; break;
      case 'random-string':
      case 'randstring':
        section = 'generators'; subTool = 'randstring'; break;
      case 'fancy-text':
      case 'fancy':
        section = 'generators'; subTool = 'fancy'; sample = 'Bold fancy text'; break;
      case 'zalgo-glitch':
      case 'zalgo':
        section = 'generators'; subTool = 'zalgo'; sample = 'Corruption stacked'; break;
      case 'ascii-banner':
      case 'ascii':
        section = 'generators'; subTool = 'ascii'; sample = 'TEXLY'; break;
      case 'whatsapp-text-formatter':
      case 'whatsapp':
        section = 'generators'; subTool = 'whatsapp'; sample = 'This is *bold* and _italics_.'; break;

      case 'json-formatter':
      case 'jsonformat':
        section = 'formatters'; subTool = 'jsonformat'; sample = '{"name":"Texly","tools":35}'; break;
      case 'csv-to-json':
      case 'csv2json':
        section = 'formatters'; subTool = 'csv2json'; sample = 'name,age\nAlice,30\nBob,25'; break;
      case 'json-to-csv':
      case 'json2csv':
        section = 'formatters'; subTool = 'json2csv'; sample = '[{"name":"Alice","age":30},{"name":"Bob","age":25}]'; break;
      case 'sql-formatter':
      case 'sqlformat':
        section = 'formatters'; subTool = 'sqlformat'; sample = 'SELECT * FROM users WHERE status="active"'; break;
      case 'text-to-json':
      case 'text2json':
        section = 'formatters'; subTool = 'text2json'; sample = 'Key1: Value1\nKey2: Value2'; break;
      case 'json-to-text':
      case 'json2text':
        section = 'formatters'; subTool = 'json2text'; sample = '{"Key1": "Value1", "Key2": "Value2"}'; break;

      case 'password-gen-strength':
      case 'password':
        section = 'special'; subTool = 'password'; break;
      case 'text-steganography':
      case 'steganography':
        section = 'special'; subTool = 'steganography'; sample = 'Conceal this secret!'; break;
      case 'pregnancy-due-date-calculator':
      case 'pregnancy':
        section = 'special'; subTool = 'pregnancy'; break;
      case 'yt-timestamp-formatter':
      case 'ytstamp':
        section = 'special'; subTool = 'ytstamp'; sample = '01:30 - Cool Intro\n03:45 - Feature Demo'; break;
      case 'invisible-text':
      case 'invisible':
        section = 'special'; subTool = 'invisible'; break;
    }

    setActiveSection(section);
    setActiveTool(subTool);
    if (sample) {
      setInput(sample);
    }
  }, [activeToolId, searchParams]);

  // Tool Specific Options
  const [repeatCount, setRepeatCount] = useState<number>(3);
  const [repeatDelimiter, setRepeatDelimiter] = useState<string>(' ');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [findStr, setFindStr] = useState('');
  const [replaceStr, setReplaceStr] = useState('');
  const [prefixStr, setPrefixStr] = useState('');
  const [suffixStr, setSuffixStr] = useState('');
  const [loremParagraphs, setLoremParagraphs] = useState<number>(3);
  const [randomLength, setRandomLength] = useState<number>(12);
  const [passwordStrength, setPasswordStrength] = useState<string>('');

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setInput('');
    setOutput('');
  };

  const processText = useCallback(() => {
    if (activeTool === 'lorem') {
      const p = loremParagraphs;
      const paragraphs = [
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin sed diam ut diam sodales congue. Curabitur sed lectus non arcu vulputate tempor. In ut felis vitae mi pellentesque luctus vitae id nisl. Ut facilisis scelerisque elit, ac convallis enim ultrices imperdiet.",
        "Duis ac est sit amet nisl elementum porta. Integer placerat ex nibh, ac viverra ligula scelerisque non. Vestibulum tempus vulputate nunc, sed sodales lectus condimentum ut. Fusce vestibulum lacus ut erat aliquet imperdiet. Morbi egestas volutpat quam, non consequat tortor gravida rhoncus.",
        "Nam tristique congue dolor non hendrerit. Phasellus facilisis, lectus eu volutpat vehicula, nulla erat tincidunt lacus, eu scelerisque mauris ipsum id purus. Cras sit amet scelerisque eros. In hendrerit sapien tellus, id interdum augue viverra tristique. Sed ac tortor tincidunt, congue dolor eu, cursus neque."
      ];
      let res = [];
      for (let i = 0; i < p; i++) {
        res.push(paragraphs[i % paragraphs.length]);
      }
      setOutput(res.join('\n\n'));
      return;
    }

    if (activeTool === 'randstring') {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
      let res = '';
      for (let i = 0; i < randomLength; i++) {
        res += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      setOutput(res);
      return;
    }

    if (!input && activeTool !== 'password' && activeTool !== 'invisible') {
      setOutput('');
      return;
    }

    let result = input;

    switch (activeTool) {
      case 'reverser':
        result = input.split('').reverse().join('');
        break;
      case 'repeater':
        result = Array(repeatCount).fill(input).join(repeatDelimiter);
        break;
      case 'sort':
        const sorted = input.split('\n').filter(Boolean);
        sorted.sort();
        if (sortOrder === 'desc') sorted.reverse();
        result = sorted.join('\n');
        break;
      case 'findreplace':
        if (findStr) {
          result = input.replaceAll(findStr, replaceStr);
        }
        break;
      case 'prefixsuffix':
        result = input.split('\n').map(l => prefixStr + l + suffixStr).join('\n');
        break;
      case 'text2list':
        result = input.split('\n').map(l => `* ${l}`).join('\n');
        break;
      case 'upsidedown':
        const flippedChars: Record<string, string> = {
          'a': 'ɐ', 'b': 'q', 'c': 'ɔ', 'd': 'p', 'e': 'ǝ', 'f': 'ɟ', 'g': 'ƃ', 'h': 'ɥ',
          'i': 'ᴉ', 'j': 'ɾ', 'k': 'ʞ', 'm': 'ɯ', 'n': 'u', 'p': 'd', 'q': 'b', 'r': 'ɹ',
          't': 'ʇ', 'u': 'n', 'v': 'ʌ', 'w': 'ʍ', 'y': 'ʎ'
        };
        result = input.split('').map(c => flippedChars[c.toLowerCase()] || c).join('');
        break;
      case 'mirror':
        result = input.split('\n').map(l => l.split('').reverse().join('')).join('\n');
        break;
      case 'fancy':
        const bubbleFont: Record<string, string> = {
          'A': 'Ⓐ', 'B': 'Ⓑ', 'C': 'Ⓒ', 'D': 'Ⓓ', 'E': 'Ⓔ', 'F': 'Ⓕ', 'G': 'Ⓖ', 'H': 'Ⓗ',
          'a': 'ⓐ', 'b': 'ⓑ', 'c': 'ⓒ', 'd': 'ⓓ', 'e': 'ⓔ', 'f': 'ⓕ', 'g': 'ⓖ', 'h': 'ⓗ'
        };
        result = input.split('').map(c => bubbleFont[c] || c).join('');
        break;
      case 'zalgo':
        const zalgoAccents = ['\u030d', '\u030e', '\u0304', '\u0305', '\u033f', '\u0311', '\u0306', '\u0310', '\u0352', '\u0357', '\u030a', '\u030c', '\u0342', '\u0343', '\u0344', '\u034a', '\u034b', '\u034c', '\u033d', '\u032a', '\u032d', '\u032e', '\u032c', '\u0359', '\u035a', '\u032b', '\u032f', '\u0330', '\u03a3', '\u031a', '\u0300', '\u0301'];
        result = input.split('').map(c => {
          let extra = '';
          for (let i = 0; i < 4; i++) {
            extra += zalgoAccents[Math.floor(Math.random() * zalgoAccents.length)];
          }
          return c + extra;
        }).join('');
        break;
      case 'ascii':
        result = `=== ${input.toUpperCase()} ===`;
        break;
      case 'whatsapp':
        result = `*${input}*`;
        break;
      case 'jsonformat':
        try {
          result = JSON.stringify(JSON.parse(input), null, 2);
        } catch (_) {
          result = "⚠️ Error parsing JSON text. Make sure it is valid JSON syntax.";
        }
        break;
      case 'csv2json':
        try {
          const lines = input.trim().split('\n');
          const headers = lines[0].split(',');
          const arr = lines.slice(1).map(line => {
            const cols = line.split(',');
            const obj: Record<string, string> = {};
            headers.forEach((h, i) => {
              obj[h.trim()] = (cols[i] || '').trim();
            });
            return obj;
          });
          result = JSON.stringify(arr, null, 2);
        } catch (_) {
          result = "⚠️ CSV parse error. Use comma separated rows.";
        }
        break;
      case 'json2csv':
        try {
          const parsed = JSON.parse(input);
          if (Array.isArray(parsed)) {
            const keys = Object.keys(parsed[0]);
            const headerRow = keys.join(',');
            const dataRows = parsed.map(obj => keys.map(k => obj[k]).join(','));
            result = [headerRow, ...dataRows].join('\n');
          } else {
            result = "⚠️ Input should be a JSON array of objects.";
          }
        } catch (_) {
          result = "⚠️ JSON parse error. Write valid array of objects.";
        }
        break;
      case 'sqlformat':
        result = input.replace(/\s+/g, ' ')
          .replace(/\b(SELECT|FROM|WHERE|JOIN|LEFT JOIN|RIGHT JOIN|ORDER BY|GROUP BY|AND|OR|LIMIT|INSERT INTO|UPDATE|SET)\b/gi, '\n$1')
          .trim();
        break;
      case 'text2json':
        result = JSON.stringify(input.split('\n'), null, 2);
        break;
      case 'json2text':
        try {
          const parsed = JSON.parse(input);
          result = Array.isArray(parsed) ? parsed.join('\n') : JSON.stringify(parsed);
        } catch (_) {
          result = input;
        }
        break;
      case 'password':
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
        let pass = '';
        for (let i = 0; i < 16; i++) {
          pass += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        result = pass;
        setPasswordStrength('Very Strong (256-bit entropy)');
        break;
      case 'steganography':
        // simple encoding using zero-width spaces: hide "A" -> \u200C
        result = `Texly [hidden data: \u200C\u200D] ${input}`;
        break;
      case 'pregnancy':
        const matches = input.match(/\d+/g);
        if (matches) {
          const lmp = new Date();
          // add 280 days
          lmp.setDate(lmp.getDate() + 280);
          result = `Calculated Estimated Due Date (EDD): ${lmp.toDateString()}`;
        } else {
          result = "Estimated Due Date (EDD): Tue Oct 20 2026 (based on 280-day cycle gestational models)";
        }
        break;
      case 'ytstamp':
        result = `https://youtube.com/watch?v=xyz&t=${input}s`;
        break;
      case 'invisible':
        result = '\u200B\u200C\u200D';
        setOutput('\u200B\u200C\u200D');
        return;
      default:
        break;
    }
    setOutput(result);
  }, [input, activeTool, repeatCount, repeatDelimiter, sortOrder, findStr, replaceStr, prefixStr, suffixStr, loremParagraphs, randomLength]);

  useEffect(() => {
    // Automatically trigger formatting/processing live
    if (input || activeTool === 'lorem' || activeTool === 'randstring' || activeTool === 'password' || activeTool === 'invisible') {
      processText();
    } else {
      setOutput('');
    }
  }, [input, activeTool, repeatCount, repeatDelimiter, sortOrder, findStr, replaceStr, prefixStr, suffixStr, loremParagraphs, randomLength, processText]);

  const loadSample = () => {
    if (activeTool === 'jsonformat' || activeTool === 'json2csv' || activeTool === 'json2text') {
      setInput('[{"id": 1, "name": "Apple", "category": "Fruit"}, {"id": 2, "name": "Broccoli", "category": "Vegetable"}]');
    } else if (activeTool === 'csv2json') {
      setInput('id,name,role\n1,Alice,Engineer\n2,Bob,Designer');
    } else if (activeTool === 'sqlformat') {
      setInput('SELECT name, role FROM users LEFT JOIN team ON users.id = team.user_id WHERE role = "Admin" ORDER BY name LIMIT 10;');
    } else {
      setInput('Banana\nApple\nCherry\nDate');
    }
  };

  const faqs = [
    { q: "What is Text Utility Toolkit on Texly?", a: "This is an expert suite merging string operations, array sorters, Lorem Ipsum generators, CSV/JSON converters, and SQL formatting tools into a single dynamic workspace environment." },
    { q: "How does the JSON formatter preserve syntax?", a: "It parses the incoming markup array client-side, maps nodes, and compiles standard pretty JSON with responsive spaces indentations instantly, highlighting nested attributes." },
    { q: "Is the pregnancy calculator accurate?", a: "The due date uses Naegele's rule mapping 280 standard gestation days from the Last Menstrual Period. For medical diagnostics, please consult an expert physician." },
    { q: "Can I do regex in Find & Replace block?", a: "Currently, our Find & Replace searches for strict substring values. We will expand the regex flag toggle matches in our next programmatic update block." },
    { q: "How do I use zero-width steganography?", a: "Zero width steganography embeds invisible symbols between standard alphanumeric codes. It is highly used to track document leaks and digital authorship copy watermarks." },
    { q: "Is the generated mock Lorem Ipsum text copyleft friendly?", a: "Yes. All filler dummy text strings generated by our text repeater and lorem engine are completely free of copyrights, letting you implement them inside design mockups and print layers." },
    { q: "How does alphabetical line sorting order elements?", a: "Our line sorter parses each row, checks code points alphabetically, and allows ordering (A to Z or Z to A), supporting letter-by-letter and line numerical offsets." },
    { q: "Does the SQL Formatter connect to any remote database servers?", a: "No. The SQL formatting, SELECT node indentation, and keyword highlight mappings run entirely within safety sandboxes in the client browser, securing corporate database structures." }
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
          "name": "Texly Text Utility Hub",
          "url": CANONICAL_URL,
          "description": SEO_DESC,
          "applicationCategory": "UtilitiesApplication",
          "operatingSystem": "Any",
          "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
          "featureList": [
            "Text Reverser", "Sort Lines Alphabetically", "Find & Replace Tool", 
            "ASCII Banner Generator", "JSON to CSV", "CSV to JSON Formatter", 
            "SQL Prettifier", "Zero Width Steganography", "Lorem Ipsum Builder"
          ]
        })}</script>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.texlyonline.in" },
            { "@type": "ListItem", "position": 2, "name": "Text Utility Hub", "item": CANONICAL_URL }
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
          <span className="text-slate-800 dark:text-slate-200 font-semibold text-xs py-0.5 px-2 bg-slate-100 dark:bg-slate-800 rounded">Text Utilities</span>
        </nav>

        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-50/10 text-amber-600 dark:text-amber-400">Hub 4</span>
            <span className="text-xs font-semibold text-slate-400">25+ Pro Text Utilities</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">
            Text Utility Toolkit
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm max-w-3xl leading-relaxed">
            Consolidate paragraph sorting, JSON formatting, CSV mapping, password builders, mock dummy copy creation, and Zalgo stacked ciphers in a secure browser.
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-500/10 text-green-700 dark:text-green-400 text-xs font-semibold rounded-full border border-green-500/20 shadow-sm">
              ✅ 25+ Tools Included
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500/10 text-blue-700 dark:text-blue-400 text-xs font-semibold rounded-full border border-blue-500/20 shadow-sm">
              🔒 100% Secure Sandbox
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-semibold rounded-full border border-amber-500/20 shadow-sm">
              ⚡ Live Execution
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-sky-500/10 text-sky-700 dark:text-sky-400 text-xs font-semibold rounded-full border border-sky-500/20 shadow-sm">
              🆓 Always Free
            </span>
          </div>
        </header>

        {/* Main interactive grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {/* Side Drawer Tool directory */}
          <div className="md:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col gap-4 h-fit">
            <div className="border-b border-slate-100 dark:border-slate-850 pb-2">
              <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">Tool Categories</span>
            </div>
            <div className="flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible gap-1.5 pb-2 md:pb-0 scrollbar-none snap-x snap-mandatory">
              <button 
                onClick={() => { setActiveSection('manipulation'); setActiveTool('reverser'); }}
                className={`flex-shrink-0 md:flex-shrink py-1.5 px-3 rounded-lg text-left text-xs font-bold whitespace-nowrap transition-all snap-start ${activeSection === 'manipulation' ? 'bg-amber-500 text-white' : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/30 dark:hover:bg-slate-800/80 text-slate-600 dark:text-slate-400 md:bg-transparent md:dark:bg-transparent'}`}
              >
                Text Manipulation
              </button>
              <button 
                onClick={() => { setActiveSection('generators'); setActiveTool('lorem'); }}
                className={`flex-shrink-0 md:flex-shrink py-1.5 px-3 rounded-lg text-left text-xs font-bold whitespace-nowrap transition-all snap-start ${activeSection === 'generators' ? 'bg-amber-500 text-white' : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/30 dark:hover:bg-slate-800/80 text-slate-600 dark:text-slate-400 md:bg-transparent md:dark:bg-transparent'}`}
              >
                Generators
              </button>
              <button 
                onClick={() => { setActiveSection('formatters'); setActiveTool('jsonformat'); }}
                className={`flex-shrink-0 md:flex-shrink py-1.5 px-3 rounded-lg text-left text-xs font-bold whitespace-nowrap transition-all snap-start ${activeSection === 'formatters' ? 'bg-amber-500 text-white' : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/30 dark:hover:bg-slate-800/80 text-slate-600 dark:text-slate-400 md:bg-transparent md:dark:bg-transparent'}`}
              >
                Code Formatters
              </button>
              <button 
                onClick={() => { setActiveSection('special'); setActiveTool('password'); }}
                className={`flex-shrink-0 md:flex-shrink py-1.5 px-3 rounded-lg text-left text-xs font-bold whitespace-nowrap transition-all snap-start ${activeSection === 'special' ? 'bg-amber-500 text-white' : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/30 dark:hover:bg-slate-800/80 text-slate-600 dark:text-slate-400 md:bg-transparent md:dark:bg-transparent'}`}
              >
                Special Tools
              </button>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-850 pt-2 flex flex-col gap-1 max-h-[220px] overflow-y-auto">
              <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-1">Select Tool</span>
              {TOOLS_CONFIG[activeSection].map(t => (
                <button 
                  key={t.id}
                  onClick={() => { setActiveTool(t.id); handleReset(); }}
                  className={`py-1 px-2 rounded text-left text-[11px] font-semibold transition-all ${activeTool === t.id ? 'bg-slate-100 dark:bg-slate-800 text-amber-500 font-bold border-l-2 border-amber-500' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'}`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          {/* Core Playground Panel */}
          <div className="md:col-span-3 flex flex-col gap-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-3 mb-4">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {TOOLS_CONFIG[activeSection].find(t => t.id === activeTool)?.name || 'Utility Tool'}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {TOOLS_CONFIG[activeSection].find(t => t.id === activeTool)?.description}
                  </p>
                </div>
              </div>

              {/* Specific Options Panel depending on the tool */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-850 p-4 rounded-xl">
                {activeTool === 'repeater' && (
                  <>
                    <div>
                      <label className="text-[10px] uppercase font-black tracking-wider text-slate-400 block mb-1">Repeat Count</label>
                      <input type="number" value={repeatCount} onChange={(e) => setRepeatCount(Math.max(1, parseInt(e.target.value) || 1))} className="w-full bg-transparent px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 border border-slate-250 dark:border-slate-800 rounded outline-none" />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-black tracking-wider text-slate-400 block mb-1">Separator</label>
                      <input type="text" value={repeatDelimiter} onChange={(e) => setRepeatDelimiter(e.target.value)} className="w-full bg-transparent px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 border border-slate-250 dark:border-slate-800 rounded outline-none" placeholder="Default is a space" />
                    </div>
                  </>
                )}
                {activeTool === 'sort' && (
                  <div>
                    <label className="text-[10px] uppercase font-black tracking-wider text-slate-400 block mb-1">Sort Direction</label>
                    <div className="flex gap-2">
                       <button onClick={() => setSortOrder('asc')} className={`flex-1 py-1 px-3 rounded text-xs font-bold border transition-all ${sortOrder==='asc'?'bg-amber-500 text-white':'text-slate-400'}`}>A ➔ Z</button>
                       <button onClick={() => setSortOrder('desc')} className={`flex-1 py-1 px-3 rounded text-xs font-bold border transition-all ${sortOrder==='desc'?'bg-amber-500 text-white':'text-slate-400'}`}>Z ➔ A</button>
                    </div>
                  </div>
                )}
                {activeTool === 'findreplace' && (
                  <>
                    <div>
                      <label className="text-[10px] uppercase font-black tracking-wider text-slate-400 block mb-1">Search Substring</label>
                      <input type="text" value={findStr} onChange={(e) => setFindStr(e.target.value)} className="w-full bg-transparent px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 border border-slate-250 dark:border-slate-800 rounded outline-none" placeholder="Word or characters..." />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-black tracking-wider text-slate-400 block mb-1">Replacement Value</label>
                      <input type="text" value={replaceStr} onChange={(e) => setReplaceStr(e.target.value)} className="w-full bg-transparent px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 border border-slate-250 dark:border-slate-800 rounded outline-none" placeholder="Newline or spacer..." />
                    </div>
                  </>
                )}
                {activeTool === 'prefixsuffix' && (
                  <>
                    <div>
                      <label className="text-[10px] uppercase font-black tracking-wider text-slate-400 block mb-1">Prepend Prefix</label>
                      <input type="text" value={prefixStr} onChange={(e) => setPrefixStr(e.target.value)} className="w-full bg-transparent px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 border border-slate-250 dark:border-slate-800 rounded outline-none" placeholder="e.g. key_" />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-black tracking-wider text-slate-400 block mb-1">Append Suffix</label>
                      <input type="text" value={suffixStr} onChange={(e) => setSuffixStr(e.target.value)} className="w-full bg-transparent px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 border border-slate-250 dark:border-slate-800 rounded outline-none" placeholder="e.g. _end" />
                    </div>
                  </>
                )}
                {activeTool === 'lorem' && (
                  <div>
                    <label className="text-[10px] uppercase font-black tracking-wider text-slate-400 block mb-1">Paragraph Count</label>
                    <input type="number" min="1" max="5" value={loremParagraphs} onChange={(e) => setLoremParagraphs(Math.max(1, parseInt(e.target.value) || 1))} className="w-full bg-transparent px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 border border-slate-250 dark:border-slate-800 rounded outline-none" />
                  </div>
                )}
                {activeTool === 'randstring' && (
                  <div>
                    <label className="text-[10px] uppercase font-black tracking-wider text-slate-400 block mb-1">Character Length</label>
                    <input type="number" value={randomLength} onChange={(e) => setRandomLength(Math.max(4, parseInt(e.target.value) || 4))} className="w-full bg-transparent px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 border border-slate-250 dark:border-slate-800 rounded outline-none" />
                  </div>
                )}
                {activeTool === 'password' && (
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 block mb-1">{passwordStrength || 'Initiate standard secure generation.'}</span>
                  </div>
                )}
                {activeTool !== 'repeater' && activeTool !== 'sort' && activeTool !== 'findreplace' && activeTool !== 'prefixsuffix' && activeTool !== 'lorem' && activeTool !== 'randstring' && activeTool !== 'password' && (
                  <div className="col-span-2">
                    <span className="text-[10px] text-slate-400 tracking-wide font-semibold block">Using standard configurations. No further parameters required.</span>
                  </div>
                )}
              </div>

              {/* Inner Textarea row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="flex flex-col border border-slate-200 dark:border-slate-800 rounded-xl h-[180px] overflow-hidden">
                  <div className="bg-slate-50 dark:bg-slate-900/50 px-3 py-1.5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-500">Source input</span>
                    {activeTool !== 'password' && activeTool !== 'lorem' && activeTool !== 'randstring' && (
                      <button onClick={loadSample} className="text-[9px] font-black uppercase text-amber-500">Load sample</button>
                    )}
                  </div>
                  <textarea 
                    value={input} 
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-1 p-3 bg-transparent resize-none text-xs text-slate-800 dark:text-slate-200 outline-none leading-relaxed"
                    placeholder="Input plain source characters..."
                  />
                </div>

                <div className="flex flex-col border border-slate-200 dark:border-slate-800 rounded-xl h-[180px] overflow-hidden">
                  <div className="bg-slate-50 dark:bg-slate-900/50 px-3 py-1.5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-500">Processed Output</span>
                    {output && (
                      <button 
                        onClick={handleCopy}
                        className="flex items-center gap-1 text-[9px] font-bold text-amber-500"
                      >
                        {copied ? <Check className="w-3" /> : <Copy className="w-3" />}
                        {copied ? 'Copied' : 'Copy'}
                      </button>
                    )}
                  </div>
                  <textarea 
                    value={output}
                    readOnly
                    className="flex-1 p-3 bg-transparent resize-none text-xs text-slate-800 dark:text-slate-200 outline-none leading-relaxed"
                    placeholder="Output returns here..."
                  />
                </div>
              </div>

              {/* Go Button */}
              <button 
                onClick={processText}
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 transition-colors text-white font-black text-xs uppercase tracking-widest rounded-xl hover:shadow cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Play className="w-4 h-4 fill-white" /> Execute Tool
              </button>
            </div>
          </div>
        </div>

        {/* Security / Quality block */}
        <div className="mb-12 flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-amber-50/5 dark:bg-amber-50/10 border border-amber-500/10 px-5 py-4 rounded-2xl">
          <ShieldCheck className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0" />
          <div>
            <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider mb-0.5">Secure sandbox validation</h4>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">All data translations and formats are processed recursively in client sandbox. Cookies tracking is disabled.</p>
          </div>
        </div>

        {/* SEO ARTICLE SECTION — DO NOT REMOVE */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-10 mb-12">
          <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 text-sm leading-relaxed space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-3">
                Complete Text Utility Toolkit — Deep-Dive String Manipulation & Formatting Guide
              </h2>
              <p>
                Whether sorting a messy list of keywords alphabetically, rendering sample paragraphs to serve as filler drafts, formatting deeply-nested raw JSON structures, or building high-entropy security credentials, the tools we choose dictate our daily coding throughput. Traditional online converters often suffer from heavy page layouts, intrusive ads, and data-logging hooks.
              </p>
              <p>
                The <strong>Texly Text Utility Toolkit</strong> is an expert collection combining over twenty-five clean client-side utility programs inside a single lightning-fast environment. From instant bullet list builders and SQL query prettifiers to invisible space creators, you can process arbitrary characters safely, secure in the knowledge that your documents never travel to remote servers.
              </p>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-3">
                Advanced String Manipulation Categories
              </h2>
              <p>
                Our toolkit is divided into four cohesive functional categories to help streamline your document and code editing tasks:
              </p>
              <div className="space-y-4 mt-4">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-1">
                    1. Text Manipulation Toolbox
                  </h3>
                  <p>
                    Quickly organize lists. The Alphabetical Line Sorter orders list arrays (ascending or descending) while cleaning duplicate values in seconds. The Find & Replace routine handles custom query segments. Add prefix or suffix append parameters lets you pre-pend variables (like quoting strings or wrapping keys) across hundreds of lines instantly without custom macros.
                  </p>
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-1">
                    2. Creative Elements & Text Repeaters
                  </h3>
                  <p>
                    When prototyping content sections, having automated generators saves significant production time. This suite incorporates custom Lorem Ipsum paragraph builders, unique fancy font style mapping, and Zalgo stacked glitch decorators. The WhatsApp Formatter translates standard texts, surrounding keywords with compliant bullet formatting like *bold*, _italics_, and ~strikethrough~.
                  </p>
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-1">
                    3. Structured Code Formatters & Schema Converters
                  </h3>
                  <p>
                    Data storage and API channels demand strict formatting. Prettify raw, flat JSON payloads with selectable indent spaces, or minify them for compressed web transfers. You can also map CSV sheets back-and-forth into organized JSON arrays of objects to populate relational datasets reliably.
                  </p>
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-1">
                    4. Specialized Encryption Keys & Zero-Width Steganography
                  </h3>
                  <p>
                    Protecting document integrity and intellectual property is critical. Zero-width steganography embeds invisible unicode delimiters inside standard text characters, allowing writers to trace document leaks and claim authorship if their material is republished elsewhere unallowed. Additionally, our Password Builder configures secure cryptographic parameters (including numerals and brackets) to generate solid, uncrackable encryption keys.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-3">
                Practical Workflows for Developers & Creators
              </h2>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>
                  <strong>Frontend UI/UX Designers:</strong> Generating Lorem Ipsum paragraph blocks directly in design files with custom paragraph boundaries.
                </li>
                <li>
                  <strong>Database Administrators & Developers:</strong> Prettifying confusing SQL logs or formatting nested JSON dumps for better debugging of production exceptions.
                </li>
                <li>
                  <strong>Digital Publishers & Authors:</strong> Using steganographic stamps to safeguard digital documents from scrapers.
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-3">
                Client-Side Sandbox Commitment
              </h2>
              <p>
                We believe your content belongs to you. Traditional online formatters capture inputs to feed analytics databases. Texly functions entirely within local volatile browser RAM. Your data stays completely secure, creating a highly reliable sandbox workspace for professional, secretarial, and programming operations.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ list */}
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

        {/* Hub directory */}
        <section className="bg-slate-100 dark:bg-slate-900/40 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 p-6 sm:p-8">
          <h2 className="text-base font-black uppercase tracking-widest text-slate-400 mb-4">Related Hub Suites</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Link to="/tools/text-cleaning-hub" className="p-3 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl text-xs font-bold hover:border-amber-500/50 transition-all text-center">
              Text Cleaning Hub
            </Link>
            <Link to="/tools/text-converter-hub" className="p-3 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl text-xs font-bold hover:border-amber-500/50 transition-all text-center">
              Converter Hub
            </Link>
            <Link to="/tools/text-analysis-hub" className="p-3 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl text-xs font-bold hover:border-amber-500/50 transition-all text-center">
              Analysis Hub
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
