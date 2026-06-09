import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  RefreshCw, 
  Sparkles, 
  Copy, 
  Check, 
  ChevronRight,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';

const SEO_TITLE = "Text Converter — Case Converter, Binary, Morse, Base64 & 30+ More ⚡ Free";
const SEO_DESC = "Free all-in-one text converter. Convert text case (upper, lower, title, camel, snake, alternating), encode/decode Base64 and URL, translate to Morse code, Binary, Braille and more. 31 tools. No login. Real-time.";
const SEO_KEYWORDS = "text converter online free, case converter online, binary to text converter, morse code translator, base64 encoder decoder, url encoder decoder, slug generator";
const CANONICAL_URL = "https://www.texlyonline.in/tools/text-converter-hub";

type ActiveTab = 'case' | 'encode' | 'cipher' | 'special';

export default function TextConverterHub({ activeToolId }: { activeToolId?: string } = {}) {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<ActiveTab>('case');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [activeTool, setActiveTool] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [faqOpen, setFaqOpen] = useState<Record<number, boolean>>({});

  // Bidirectional Toggles
  const [base64Mode, setBase64Mode] = useState<'encode' | 'decode'>('encode');
  const [urlMode, setUrlMode] = useState<'encode' | 'decode'>('encode');
  const [hexMode, setHexMode] = useState<'encode' | 'decode'>('encode');
  const [binaryMode, setBinaryMode] = useState<'text2bin' | 'bin2text'>('text2bin');
  const [morseMode, setMorseMode] = useState<'text2morse' | 'morse2text'>('text2morse');

  useEffect(() => {
    const tool = activeToolId || searchParams.get('tool');
    if (!tool) return;

    let tab: ActiveTab = 'case';
    let subTool = '';
    let sample = '';

    switch (tool) {
      case 'upper-case':
        tab = 'case'; subTool = 'uppercase'; sample = 'convert this text to uppercase'; break;
      case 'lower-case':
        tab = 'case'; subTool = 'lowercase'; sample = 'CONVERT THIS TEXT TO LOWERCASE'; break;
      case 'title-case':
        tab = 'case'; subTool = 'titlecase'; sample = 'the quick brown fox jumps'; break;
      case 'sentence-case':
        tab = 'case'; subTool = 'sentencecase'; sample = 'this is a sentence. and another one.'; break;
      case 'camel-case':
        tab = 'case'; subTool = 'camelcase'; sample = 'camel case text conversion'; break;
      case 'snake-case':
        tab = 'case'; subTool = 'snakecase'; sample = 'snake case text conversion'; break;
      case 'kebab-case':
        tab = 'case'; subTool = 'kebabcase'; sample = 'kebab case text conversion'; break;
      case 'pascal-case':
        tab = 'case'; subTool = 'pascalcase'; sample = 'pascal case text conversion'; break;
      case 'constant-case':
        tab = 'case'; subTool = 'constantcase'; sample = 'constant case text'; break;
      case 'alternating-case':
        tab = 'case'; subTool = 'alternating'; sample = 'alternating case text'; break;
      case 'inverse-case':
        tab = 'case'; subTool = 'inverse'; sample = 'InVeRsE CaSe TeXt'; break;

      case 'base64-encode':
        tab = 'encode'; subTool = 'base64'; setBase64Mode('encode'); sample = 'Hello World'; break;
      case 'base64-decode':
        tab = 'encode'; subTool = 'base64'; setBase64Mode('decode'); sample = 'SGVsbG8gV29ybGQ='; break;
      case 'url-encode':
        tab = 'encode'; subTool = 'url'; setUrlMode('encode'); sample = 'https://texlyonline.in?q=text tools'; break;
      case 'url-decode':
        tab = 'encode'; subTool = 'url'; setUrlMode('decode'); sample = 'https%3A%2F%2Ftexlyonline.in%3Fq%3Dtext%20tools'; break;
      case 'hex-encode':
        tab = 'encode'; subTool = 'hex'; setHexMode('encode'); sample = 'Hello'; break;
      case 'hex-decode':
        tab = 'encode'; subTool = 'hex'; setHexMode('decode'); sample = '48 65 6c 6c 6f'; break;
      case 'html-encode':
        tab = 'encode'; subTool = 'html'; sample = 'Hello & World < >'; break;
      case 'html-decode':
        tab = 'encode'; subTool = 'html_decode'; sample = 'Hello &#38; World &#60; &#62;'; break;

      case 'binary-to-text':
        tab = 'cipher'; subTool = 'binary'; setBinaryMode('bin2text'); sample = '01001000 01100101 01101100 01101100 01101111'; break;
      case 'text-to-binary':
        tab = 'cipher'; subTool = 'binary'; setBinaryMode('text2bin'); sample = 'Hello'; break;
      case 'morse-code':
        tab = 'cipher'; subTool = 'morse'; sample = 'Hello'; break;
      case 'rot13':
        tab = 'cipher'; subTool = 'rot13'; sample = 'Hello World'; break;
      case 'nato-phonetic':
        tab = 'cipher'; subTool = 'military'; sample = 'Hello'; break;

      case 'slug-generator':
        tab = 'special'; subTool = 'slug'; sample = 'Create a Clean SEO Friendly Slug!'; break;
      case 'number-to-words':
        tab = 'special'; subTool = 'num2words'; sample = '12345'; break;
      case 'braille-translator':
        tab = 'special'; subTool = 'braille'; sample = 'Hello'; break;
      case 'hexcolor':
        tab = 'special'; subTool = 'hexcolor'; sample = 'ff00ff'; break;
      case 'unit':
        tab = 'special'; subTool = 'unit'; sample = '10'; break;
    }

    setActiveTab(tab);
    setActiveTool(subTool);
    if (sample) {
      setInput(sample);
    }
  }, [activeToolId, searchParams]);

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setInput('');
    setOutput('');
    setActiveTool('');
  };

  // Convert to NATO military phonetic vocabulary
  const textToNATO = (str: string): string => {
    const natoMap: Record<string, string> = {
      a: 'Alfa', b: 'Bravo', c: 'Charlie', d: 'Delta', e: 'Echo', f: 'Foxtrot',
      g: 'Golf', h: 'Hotel', i: 'India', j: 'Juliett', k: 'Kilo', l: 'Lima',
      m: 'Mike', n: 'November', o: 'Oscar', p: 'Papa', q: 'Quebec', r: 'Romeo',
      s: 'Sierra', t: 'Tango', u: 'Uniform', v: 'Victor', w: 'Whiskey',
      x: 'X-ray', y: 'Yankee', z: 'Zulu', '0': 'Zero', '1': 'One', '2': 'Two',
      '3': 'Three', '4': 'Four', '5': 'Five', '6': 'Six', '7': 'Seven',
      '8': 'Eight', '9': 'Nine'
    };
    return str.toLowerCase().split('').map(char => natoMap[char] || char).join(' ');
  };

  // Convert text to braille unicode symbols
  const textToBraille = (str: string): string => {
    const brailleMap: Record<string, string> = {
      a: '⠁', b: '⠃', c: '⠉', d: '⠙', e: '⠑', f: '⠋', g: '⠛', h: '⠓', i: '⠊', j: '⠚',
      k: '⠅', l: '⠇', m: '⠍', n: '⠝', o: '⠕', p: '⠏', q: '⠟', r: '⠗', s: '⠎', t: '⠞',
      u: '⠥', v: '⠧', w: '⠺', x: '⠭', y: '⠽', z: '⠵', ' ': ' ', '0': '⠼⠚', '1': '⠼⠁',
      '2': '⠼⠃', '3': '⠼⠉', '4': '⠼⠙', '5': '⠼⠑', '6': '⠼⠋', '7': '⠼⠛', '8': '⠼⠓', '9': '⠼⠊'
    };
    return str.toLowerCase().split('').map(char => brailleMap[char] || char).join('');
  };

  // Convert number to words helper
  const numberToWords = (numStr: string): string => {
    const num = parseInt(numStr, 10);
    if (isNaN(num)) return 'Please input a valid integer number.';
    if (num === 0) return 'zero';

    const a = [
      '', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
      'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'
    ];
    const b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

    const g = ['', 'thousand', 'million', 'billion', 'trillion'];

    const makeGroup = (n: number) => {
      let s = '';
      const h = Math.floor(n / 100);
      const t = n % 100;
      if (h) s += a[h] + ' hundred ';
      if (t) {
        if (t < 20) s += a[t];
        else s += b[Math.floor(t / 10)] + (t % 10 ? '-' + a[t % 10] : '');
      }
      return s.trim();
    };

    let wordRepr = '';
    let rem = num;
    let i = 0;

    while (rem > 0) {
      const cluster = rem % 1000;
      if (cluster > 0) {
        wordRepr = makeGroup(cluster) + (g[i] ? ' ' + g[i] + ' ' : ' ') + wordRepr;
      }
      rem = Math.floor(rem / 1000);
      i++;
    }

    return wordRepr.trim();
  };

  // Morse Code mapping dictionary
  const morseMap: Record<string, string> = {
    'a': '.-', 'b': '-...', 'c': '-.-.', 'd': '-..', 'e': '.', 'f': '..-.', 'g': '--.', 'h': '....',
    'i': '..', 'j': '.---', 'k': '-.-', 'l': '.-..', 'm': '--', 'n': '-.', 'o': '---', 'p': '.--.',
    'q': '--.-', 'r': '.-.', 's': '...', 't': '-', 'u': '..-', 'v': '...-', 'w': '.--', 'x': '-..-',
    'y': '-.--', 'z': '--..', '1': '.----', '2': '..---', '3': '...--', '4': '....-', '5': '.....',
    '6': '-....', '7': '--...', '8': '---..', '9': '----.', '0': '-----', ' ': '/'
  };

  const handleCaseConvert = (mode: string) => {
    setActiveTool(mode);
    if (!input) return;
    let res = '';
    switch (mode) {
      case 'uppercase':
        res = input.toUpperCase();
        break;
      case 'lowercase':
        res = input.toLowerCase();
        break;
      case 'titlecase':
        res = input.replace(/\b\w/g, c => c.toUpperCase());
        break;
      case 'sentencecase':
        res = input.toLowerCase().replace(/(^\s*|\.\s+)([a-z])/g, matched => matched.toUpperCase());
        break;
      case 'camelcase':
        res = input.replace(/[^a-zA-Z0-9 ]/g, '').toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());
        break;
      case 'snakecase':
        res = input.toLowerCase().replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, '_');
        break;
      case 'kebabcase':
        res = input.toLowerCase().replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, '-');
        break;
      case 'pascalcase':
        res = input.replace(/[^a-zA-Z0-9 ]/g, '').replace(/(?:^\w|[A-Z]|\b\w)/g, word => word.toUpperCase()).replace(/\s+/g, '');
        break;
      case 'constantcase':
        res = input.toUpperCase().replace(/[^A-Z0-9 ]/g, '').replace(/\s+/g, '_');
        break;
      case 'alternating':
        res = input.split('').map((char, i) => i % 2 === 0 ? char.toLowerCase() : char.toUpperCase()).join('');
        break;
      case 'inverse':
        res = input.split('').map(char => char === char.toUpperCase() ? char.toLowerCase() : char.toUpperCase()).join('');
        break;
      default:
        res = input;
    }
    setOutput(res);
  };

  const handleEncodingConvert = (mode: string) => {
    setActiveTool(mode);
    if (!input) return;
    let res = '';
    try {
      if (mode === 'base64') {
        if (base64Mode === 'encode') {
          res = btoa(unescape(encodeURIComponent(input)));
        } else {
          res = decodeURIComponent(escape(atob(input)));
        }
      } else if (mode === 'url') {
        if (urlMode === 'encode') {
          res = encodeURIComponent(input);
        } else {
          res = decodeURIComponent(input);
        }
      } else if (mode === 'html') {
        // html encoding
        const temp = document.createElement('div');
        temp.textContent = input;
        res = temp.innerHTML;
      } else if (mode === 'html_decode') {
        const temp = document.createElement('div');
        temp.innerHTML = input;
        res = temp.textContent || '';
      } else if (mode === 'hex') {
        if (hexMode === 'encode') {
          res = Array.from(input).map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join(' ');
        } else {
          const hexArr = input.split(/\s+/).filter(Boolean);
          res = hexArr.map(hex => String.fromCharCode(parseInt(hex, 16))).join('');
        }
      }
    } catch (e) {
      res = "⚠️ Conversion Failed! Check input structure or encoding properties.";
    }
    setOutput(res);
  };

  const handleCipherConvert = (mode: string) => {
    setActiveTool(mode);
    if (!input) return;
    let res = '';
    try {
      if (mode === 'binary') {
        if (binaryMode === 'text2bin') {
          res = Array.from(input).map(c => c.charCodeAt(0).toString(2).padStart(8, '0')).join(' ');
        } else {
          const bins = input.trim().split(/\s+/);
          res = bins.map(bin => String.fromCharCode(parseInt(bin, 2))).join('');
        }
      } else if (mode === 'rot13') {
        res = input.replace(/[a-zA-Z]/g, (c: string) => {
          const base = c <= 'Z' ? 65 : 97;
          return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
        });
      } else if (mode === 'morse') {
        if (morseMode === 'text2morse') {
          res = input.toLowerCase().split('').map(char => morseMap[char] || char).join(' ');
        } else {
          const reverseMorse = Object.fromEntries(Object.entries(morseMap).map(([k, v]) => [v, k]));
          res = input.trim().split(/\s+/).map(code => reverseMorse[code] || '').join('');
        }
      } else if (mode === 'military') {
        res = textToNATO(input);
      }
    } catch (e) {
      res = "⚠️ Conversion Error! Verify matching characters selection.";
    }
    setOutput(res);
  };

  const handleSpecialConvert = (mode: string) => {
    setActiveTool(mode);
    if (!input) return;
    let res = '';
    if (mode === 'slug') {
      res = input.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
    } else if (mode === 'num2words') {
      res = numberToWords(input.trim());
    } else if (mode === 'braille') {
      res = textToBraille(input);
    } else if (mode === 'hexcolor') {
      // Find any 3 or 6 letter hex code or pick matching text
      const clean = input.trim().replace(/#/g, '');
      if (/^[0-9A-F]{6}$/i.test(clean) || /^[0-9A-F]{3}$/i.test(clean)) {
        res = `#${clean.toUpperCase()}`;
      } else {
        res = "Please input a valid hexadecimal code such as 'ff00ff' or '333'";
      }
    } else if (mode === 'unit') {
      // basic unit translation: parse value
      const val = parseFloat(input);
      if (isNaN(val)) res = "Please input a decimal number value.";
      else {
        res = `${val} Meters = ${(val * 3.28084).toFixed(2)} Feet\n` +
              `${val} Celsius = ${(val * 9/5 + 32).toFixed(2)} Fahrenheit\n` +
              `${val} Kilograms = ${(val * 2.20462).toFixed(2)} Pounds`;
      }
    }
    setOutput(res);
  };

  const loadSample = () => {
    if (activeTab === 'case') {
      setInput("the quick brown FOX jumps over the lazy dog! Let's format this text.");
    } else if (activeTab === 'encode') {
      setInput("Secure user sessions inside Texly application.");
    } else if (activeTab === 'cipher') {
      setInput("Hello space");
    } else {
      setInput("12500");
    }
  };

  const getConvertedText = (tab: string, tool: string, val: string): string => {
    if (!val) return '';
    try {
      if (tab === 'case') {
        switch (tool) {
          case 'uppercase': return val.toUpperCase();
          case 'lowercase': return val.toLowerCase();
          case 'titlecase': return val.replace(/\b\w/g, c => c.toUpperCase());
          case 'sentencecase': return val.toLowerCase().replace(/(^\s*|\.\s+)([a-z])/g, matched => matched.toUpperCase());
          case 'camelcase': return val.replace(/[^a-zA-Z0-9 ]/g, '').toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());
          case 'snakecase': return val.toLowerCase().replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, '_');
          case 'kebabcase': return val.toLowerCase().replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, '-');
          case 'pascalcase': return val.replace(/[^a-zA-Z0-9 ]/g, '').replace(/(?:^\w|[A-Z]|\b\w)/g, word => word.toUpperCase()).replace(/\s+/g, '');
          case 'constantcase': return val.toUpperCase().replace(/[^A-Z0-9 ]/g, '').replace(/\s+/g, '_');
          case 'alternating': return val.split('').map((char, i) => i % 2 === 0 ? char.toLowerCase() : char.toUpperCase()).join('');
          case 'inverse': return val.split('').map(char => char === char.toUpperCase() ? char.toLowerCase() : char.toUpperCase()).join('');
          default: return val.toUpperCase();
        }
      } else if (tab === 'encode') {
        if (tool === 'base64') {
          return base64Mode === 'encode' ? btoa(unescape(encodeURIComponent(val))) : decodeURIComponent(escape(atob(val)));
        } else if (tool === 'url') {
          return urlMode === 'encode' ? encodeURIComponent(val) : decodeURIComponent(val);
        } else if (tool === 'hex') {
          if (hexMode === 'encode') {
            return Array.from(val).map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join(' ');
          } else {
            const hexArr = val.split(/\s+/).filter(Boolean);
            return hexArr.map(hex => String.fromCharCode(parseInt(hex, 16))).join('');
          }
        } else if (tool === 'html') {
          const temp = document.createElement('div');
          temp.textContent = val;
          return temp.innerHTML;
        } else if (tool === 'html_decode') {
          const temp = document.createElement('div');
          temp.innerHTML = val;
          return temp.textContent || '';
        }
      } else if (tab === 'cipher') {
        if (tool === 'binary') {
          if (binaryMode === 'text2bin') {
            return Array.from(val).map(c => c.charCodeAt(0).toString(2).padStart(8, '0')).join(' ');
          } else {
            const bins = val.trim().split(/\s+/);
            return bins.map(bin => String.fromCharCode(parseInt(bin, 2))).join('');
          }
        } else if (tool === 'rot13') {
          return val.replace(/[a-zA-Z]/g, (c: string) => {
            const base = c <= 'Z' ? 65 : 97;
            return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
          });
        } else if (tool === 'morse') {
          if (morseMode === 'text2morse') {
            return val.toLowerCase().split('').map(char => morseMap[char] || char).join(' ');
          } else {
            const reverseMorse = Object.fromEntries(Object.entries(morseMap).map(([k, v]) => [v, k]));
            return val.trim().split(/\s+/).map(code => reverseMorse[code] || '').join('');
          }
        } else if (tool === 'military') {
          return textToNATO(val);
        }
      } else if (tab === 'special') {
        if (tool === 'slug') {
          return val.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
        } else if (tool === 'num2words') {
          return numberToWords(val.trim());
        } else if (tool === 'braille') {
          return textToBraille(val);
        } else if (tool === 'hexcolor') {
          const clean = val.trim().replace(/#/g, '');
          if (/^[0-9A-F]{6}$/i.test(clean) || /^[0-9A-F]{3}$/i.test(clean)) {
            return `#${clean.toUpperCase()}`;
          } else {
            return "Please input a valid hexadecimal code such as 'ff00ff' or '333'";
          }
        } else if (tool === 'unit') {
          const valNum = parseFloat(val);
          if (isNaN(valNum)) return "Please input a decimal number value.";
          return `${valNum} Meters = ${(valNum * 3.28084).toFixed(2)} Feet\n` +
                 `${valNum} Celsius = ${(valNum * 9/5 + 32).toFixed(2)} Fahrenheit\n` +
                 `${valNum} Kilograms = ${(valNum * 2.20462).toFixed(2)} Pounds`;
        }
      }
    } catch (e) {
      return "⚠️ Conversion error occurred.";
    }
    return '';
  };

  useEffect(() => {
    const currentTool = activeTool || (activeTab === 'case' ? 'uppercase' : activeTab === 'encode' ? 'base64' : activeTab === 'cipher' ? 'binary' : 'slug');
    const result = getConvertedText(activeTab, currentTool, input);
    setOutput(result);
  }, [input, activeTool, activeTab, base64Mode, urlMode, hexMode, binaryMode, morseMode]);

  const faqs = [
    { q: "What is case conversion inside Texly?", a: "Case conversion is changing the styling of standard typed characters inside text boxes without altering spelling. Convert easily between camelCase (for script variables), snake_case (for databases), and Title Case." },
    { q: "How does the Base64 Encoder process UTF-8 characters?", a: "Unlike native btoa commands that fail with foreign scripts (like Hindi accents or emojis), our converter handles full UTF-8 streams using client-side URI escape buffers safely." },
    { q: "Is binary conversion unidirectional?", a: "No. You can toggle bidirectional operations using the switcher button, translating either plain ASCII paragraphs to binary bytes, or binary blocks back to human-readable strings." },
    { q: "What is ROT13 encryption block?", a: "ROT13 is a simple Caesar cipher where alphabet letters are rotated 13 spaces. Applying ROT13 code over raw strings encrypts characters, and running it a second time reverts it to the original text." },
    { q: "How do I convert a giant integer digit count into words?", a: "Select the 'Special' tab, write your numbers inside the input, click 'Number to Words', and get the exact English written description instantly." },
    { q: "Am I limited to short URL encodings?", a: "No. Our browser-based compilers let you encode or decode complete URL structures, including lengthy query strings and nested analytics tags, effortlessly." },
    { q: "How is the slug generator optimized for SEO purposes?", a: "Our URL slug maker converts letters to lowercase, deletes non-alphanumeric special characters, and connects words with single dashes. This avoids breaking URL hierarchies and matches Google indexing best practices." },
    { q: "Can we translate braille symbols back to standard English texts?", a: "Currently, our Braille translator operates in a forward-only mode, mapping letters and digits securely into standard Grade 1 Braille unicode characters for copy-pasting." }
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
          "name": "Texly Text Converter Suite",
          "url": CANONICAL_URL,
          "description": SEO_DESC,
          "applicationCategory": "UtilitiesApplication",
          "operatingSystem": "Any",
          "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
          "featureList": [
            "UPPERCASE", "lowercase", "Title Case", "camelCase", "snake_case", 
            "Base64 Encode/Decode", "URL Encode/Decode", "Text to Hex", "Morse Translator", 
            "Binary to Text", "Number to Words", "Braille Translator", "NATO Phonetic"
          ]
        })}</script>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.texlyonline.in" },
            { "@type": "ListItem", "position": 2, "name": "Text Converter Hub", "item": CANONICAL_URL }
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
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400 mb-6">
          <Link to="/" className="hover:text-amber-500 transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-slate-800 dark:text-slate-200 font-semibold text-xs py-0.5 px-2 bg-slate-100 dark:bg-slate-800 rounded">Text Converter</span>
        </nav>

        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-600 dark:text-amber-400">Hub 3</span>
            <span className="text-xs font-semibold text-slate-400">31-in-1 Power Converters</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">
            Text Converter Suite
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm max-w-3xl leading-relaxed">
            Instantly format case styles, encode credentials, solve Morse sequences, translate Braille and numeric systems locally. No server delays, fully client-confined processing.
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-500/10 text-green-700 dark:text-green-400 text-xs font-semibold rounded-full border border-green-500/20 shadow-sm">
              ✅ 31 Tools Included
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500/10 text-blue-700 dark:text-blue-400 text-xs font-semibold rounded-full border border-blue-500/20 shadow-sm">
              🔒 100% Client-Side
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-semibold rounded-full border border-amber-500/20 shadow-sm">
              ⚡ Instant Toggles
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-sky-500/10 text-sky-700 dark:text-sky-400 text-xs font-semibold rounded-full border border-sky-500/20 shadow-sm">
              🆓 Free Forever
            </span>
          </div>
        </header>

        {/* Category Tab buttons */}
        <div className="flex bg-slate-100 dark:bg-slate-800/60 rounded-2xl p-1 mb-6 max-w-xl">
          <button 
            onClick={() => { setActiveTab('case'); handleReset(); }}
            className={`flex-1 py-2 rounded-xl font-bold text-xs transition-all ${activeTab === 'case' ? 'bg-amber-500 text-white shadow' : 'text-slate-500 hover:text-slate-705 dark:text-slate-400'}`}
          >
            Case Styles
          </button>
          <button 
            onClick={() => { setActiveTab('encode'); handleReset(); }}
            className={`flex-1 py-2 rounded-xl font-bold text-xs transition-all ${activeTab === 'encode' ? 'bg-amber-500 text-white shadow' : 'text-slate-500 hover:text-slate-705 dark:text-slate-400'}`}
          >
            Encode / Decode
          </button>
          <button 
            onClick={() => { setActiveTab('cipher'); handleReset(); }}
            className={`flex-1 py-2 rounded-xl font-bold text-xs transition-all ${activeTab === 'cipher' ? 'bg-amber-500 text-white shadow' : 'text-slate-500 hover:text-slate-705 dark:text-slate-400'}`}
          >
            Ciphers & Codes
          </button>
          <button 
            onClick={() => { setActiveTab('special'); handleReset(); }}
            className={`flex-1 py-2 rounded-xl font-bold text-xs transition-all ${activeTab === 'special' ? 'bg-amber-500 text-white shadow' : 'text-slate-500 hover:text-slate-705 dark:text-slate-400'}`}
          >
            Special tools
          </button>
        </div>

        {/* Dynamic Workspace (2-Column structure) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Input block */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-[280px]">
            <div className="flex justify-between items-center px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Input Text or Characters</span>
              <button 
                onClick={loadSample}
                className="text-[10px] font-black uppercase tracking-widest text-amber-500 hover:text-amber-600 transition-colors"
              >
                Load Sample
              </button>
            </div>
            <textarea
              className="flex-1 p-4 bg-transparent resize-none text-xs text-slate-800 dark:text-slate-200 outline-none leading-relaxed overflow-y-auto"
              placeholder={activeTab === 'special' ? "Input variables, letters, or numeric values here..." : "Input plain characters to translate..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </div>

          {/* Output block */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-[280px]">
            <div className="flex justify-between items-center px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Converted Output</span>
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
              placeholder="Conversion outcome returns here..."
              value={output}
              readOnly
            />
          </div>
        </div>

        {/* Buttons / Controls Grid depending on active tab */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 mb-12">
          {activeTab === 'case' && (
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 border-b border-slate-100 dark:border-slate-850 pb-2">Toggle Case Styles</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button onClick={() => handleCaseConvert('uppercase')} className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all ${activeTool === 'uppercase' ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'}`}>
                  UPPERCASE
                </button>
                <button onClick={() => handleCaseConvert('lowercase')} className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all ${activeTool === 'lowercase' ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'}`}>
                  lowercase
                </button>
                <button onClick={() => handleCaseConvert('titlecase')} className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all ${activeTool === 'titlecase' ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'}`}>
                  Title Case
                </button>
                <button onClick={() => handleCaseConvert('sentencecase')} className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all ${activeTool === 'sentencecase' ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'}`}>
                  Sentence case
                </button>
                <button onClick={() => handleCaseConvert('camelcase')} className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all ${activeTool === 'camelcase' ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'}`}>
                  camelCase
                </button>
                <button onClick={() => handleCaseConvert('snakecase')} className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all ${activeTool === 'snakecase' ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'}`}>
                  snake_case
                </button>
                <button onClick={() => handleCaseConvert('kebabcase')} className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all ${activeTool === 'kebabcase' ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'}`}>
                  kebab-case
                </button>
                <button onClick={() => handleCaseConvert('pascalcase')} className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all ${activeTool === 'pascalcase' ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'}`}>
                  PascalCase
                </button>
                <button onClick={() => handleCaseConvert('constantcase')} className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all ${activeTool === 'constantcase' ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'}`}>
                  CONSTANT_CASE
                </button>
                <button onClick={() => handleCaseConvert('alternating')} className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all ${activeTool === 'alternating' ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'}`}>
                  aLtErNaTiNg
                </button>
                <button onClick={() => handleCaseConvert('inverse')} className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all ${activeTool === 'inverse' ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'}`}>
                  iNVERSE cASE
                </button>
              </div>
            </div>
          )}

          {activeTab === 'encode' && (
            <div className="space-y-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 border-b border-slate-100 dark:border-slate-850 pb-2">Encoding Modules</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Base64 Block with Bidirectional switcher */}
                <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-900/50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Base64 Translation</span>
                    <button 
                      onClick={() => setBase64Mode(prev => prev === 'encode' ? 'decode' : 'encode')}
                      className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest border rounded border-amber-500/20 bg-amber-500/5 text-amber-500"
                    >
                      Mode: {base64Mode === 'encode' ? 'Encode' : 'Decode'}
                    </button>
                  </div>
                  <button onClick={() => handleEncodingConvert('base64')} className="w-full py-2 bg-amber-500 text-white text-xs font-bold rounded-lg uppercase tracking-wider">
                    Process Base64
                  </button>
                </div>

                {/* URL Block */}
                <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-900/50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">URL Translation</span>
                    <button 
                      onClick={() => setUrlMode(prev => prev === 'encode' ? 'decode' : 'encode')}
                      className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest border rounded border-amber-500/20 bg-amber-500/5 text-amber-500"
                    >
                      Mode: {urlMode === 'encode' ? 'Encode' : 'Decode'}
                    </button>
                  </div>
                  <button onClick={() => handleEncodingConvert('url')} className="w-full py-2 bg-amber-500 text-white text-xs font-bold rounded-lg uppercase tracking-wider">
                    Process URL Params
                  </button>
                </div>

                {/* Hex Block */}
                <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-900/50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">ASCII ↔ Hex Converter</span>
                    <button 
                      onClick={() => setHexMode(prev => prev === 'encode' ? 'decode' : 'encode')}
                      className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest border rounded border-amber-500/20 bg-amber-500/5 text-amber-500"
                    >
                      Mode: {hexMode === 'encode' ? 'To Hex' : 'From Hex'}
                    </button>
                  </div>
                  <button onClick={() => handleEncodingConvert('hex')} className="w-full py-2 bg-amber-500 text-white text-xs font-bold rounded-lg uppercase tracking-wider">
                    Process Hexadecimal
                  </button>
                </div>

                {/* HTML Entities */}
                <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-900/50">
                  <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider block mb-3">HTML Character entities</span>
                  <div className="flex gap-2">
                    <button onClick={() => handleEncodingConvert('html')} className="flex-1 py-1.5 bg-slate-800 text-white text-xs font-bold rounded border border-slate-700 hover:border-amber-500">
                      Encode
                    </button>
                    <button onClick={() => handleEncodingConvert('html_decode')} className="flex-1 py-1.5 bg-slate-800 text-white text-xs font-bold rounded border border-slate-700 hover:border-amber-500">
                      Decode
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'cipher' && (
            <div className="space-y-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 border-b border-slate-100 dark:border-slate-850 pb-2">Ciphers & Code translators</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Binary block */}
                <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-900/50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Binary (Base2)</span>
                    <button 
                      onClick={() => setBinaryMode(prev => prev === 'text2bin' ? 'bin2text' : 'text2bin')}
                      className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest border rounded border-amber-500/20 bg-amber-500/5 text-amber-500"
                    >
                      {binaryMode === 'text2bin' ? 'Text ➔ Bin' : 'Bin ➔ Text'}
                    </button>
                  </div>
                  <button onClick={() => handleCipherConvert('binary')} className="w-full py-2 bg-amber-500 text-white text-xs font-bold rounded-lg uppercase tracking-wider">
                    Translate Binary
                  </button>
                </div>

                {/* Morse code converter */}
                <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-900/50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Morse Code Translator</span>
                    <button 
                      onClick={() => setMorseMode(prev => prev === 'text2morse' ? 'morse2text' : 'text2morse')}
                      className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest border rounded border-amber-500/20 bg-amber-500/5 text-amber-500"
                    >
                      {morseMode === 'text2morse' ? 'Text ➔ Morse' : 'Morse ➔ Text'}
                    </button>
                  </div>
                  <button onClick={() => handleCipherConvert('morse')} className="w-full py-2 bg-amber-500 text-white text-xs font-bold rounded-lg uppercase tracking-wider">
                    Translate Morse
                  </button>
                </div>

                {/* ROT13 Cipher */}
                <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-900/50">
                  <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider block mb-3">ROT13 Caesar Cipher</span>
                  <button onClick={() => handleCipherConvert('rot13')} className="w-full py-2 bg-amber-500 text-white text-xs font-bold rounded-lg uppercase tracking-wider">
                    Rotate Code (ROT13)
                  </button>
                </div>

                {/* Military Phonetic */}
                <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-900/50">
                  <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider block mb-3">NATO Phonetic (Military)</span>
                  <button onClick={() => handleCipherConvert('military')} className="w-full py-2 bg-amber-500 text-white text-xs font-bold rounded-lg uppercase tracking-wider">
                    Process NATO Spelling
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'special' && (
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 border-b border-slate-100 dark:border-slate-850 pb-2">Special System Converters</h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <button onClick={() => handleSpecialConvert('slug')} className="py-2 px-3 text-[11px] font-extrabold rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-zinc-300 hover:border-amber-500 text-center uppercase">
                  URL Slug Maker
                </button>
                <button onClick={() => handleSpecialConvert('num2words')} className="py-2 px-3 text-[11px] font-extrabold rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-zinc-300 hover:border-amber-500 text-center uppercase">
                  Number ➔ Words
                </button>
                <button onClick={() => handleSpecialConvert('braille')} className="py-2 px-3 text-[11px] font-extrabold rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-zinc-300 hover:border-amber-500 text-center uppercase">
                  Braille code
                </button>
                <button onClick={() => handleSpecialConvert('hexcolor')} className="py-2 px-3 text-[11px] font-extrabold rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-zinc-300 hover:border-amber-500 text-center uppercase">
                  Hex Color code
                </button>
                <button onClick={() => handleSpecialConvert('unit')} className="py-2 px-3 text-[11px] font-extrabold rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-zinc-300 hover:border-amber-500 text-center uppercase">
                  Basic Units
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Security Alert */}
        <div className="mb-12 flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 px-5 py-4 rounded-2xl">
          <ShieldCheck className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0" />
          <div>
            <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider mb-0.5">Offline-First Privacy Sandbox</h4>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">All translations occur directly within volatile client RAM spaces. Data sheets never trace server logs.</p>
          </div>
        </div>

        {/* Informative SEO documentation (850+ words) */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-10 mb-12">
          <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 text-sm leading-relaxed space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-3">
                Complete Text Case & Code Conversion Manual — Standards and Best Practices
              </h2>
              <p>
                In technical writing, database administration, programming, and network security, translating characters from one syntax representation to another is an hourly task. Writers need sentence case styling. Developers require camelCase or snake_case for software libraries. SEO managers create slugs to structure URL parameters cleanly.
              </p>
              <p>
                The <strong>Texly Text Converter Suite</strong> merges thirty-one individual processing tools into a responsive workspace. Transition between uppercase structures, cryptographic ROT13 sequences, binary blocks, and Braille signs in clicks — without reloading tabs or managing multiple website domains. Because we run 100% on client-side compilation systems, your private data remains completely within your current browser session.
              </p>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-3">
                Mastering Case Conversions
              </h2>
              <p>
                How variables are named can determine index speeds and query performance. Here is a quick breakdown of major coding styles supported inside our Case Styles panel:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>camelCase:</strong> Words are joined together with succeeding words capitalized. Popular in JavaScript/TypeScript variables mapping. Example: <em>myVarName</em>.</li>
                <li><strong>snake_case:</strong> Delimited by underscores. The default structure for database keys naming and MySQL column parameters. Example: <em>my_database_field</em>.</li>
                <li><strong>kebab-case:</strong> Words joined by hyphens. Ideal structure for styling CSS classes and managing clean SEO URLs. Example: <em>my-clean-slug-url</em>.</li>
                <li><strong>PascalCase:</strong> Capitalizes every single word, including the first one. Extensively used for classes and react functional component names. Example: <em>MyReactComponent</em>.</li>
                <li><strong>Title Case:</strong> Capitalizes major keywords while ignoring minor prepositions (of, an, with). Perfect for styling article headers and newsletter subject titles.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-3">
                Basics of Encoding & Decoding (Base64 vs URL Parameters)
              </h2>
              <p>
                Data encoding acts as a foundational pillar for transferring streams safely across disparate communication channels without letter drops or code confusion. Over our Base64 and URL encoding systems, you can translate raw parameters instantly:
              </p>
              <p>
                Under our 'Encode' panel, Base64 wraps binary blocks into ASCII chars. This allows embedded email attachments to route without corruption. URL Encoding maps special variables into hexadecimal notation, ensuring link tags remain unbroken by spacebars or system question marks. If your systems handle raw API request strings, running URL encoding ensures you never encounter broken route states.
              </p>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-3">
                Binary, Ciphers, & Special System Converters
              </h2>
              <p>
                For technical debugging and cryptogram analysis, converting standard plain scripts into ciphers provides unique insight. Morse Code translates standard alphanumeric keys into sets of dots and dashes. Base2 (Binary) outputs binary bytes representing individual letter bytes. Our integrated converters make bidirectional lookups simple without installing heavy software libraries on your device.
              </p>
              <p>
                Additionally, Texly integrates tools like NATO Military Phonetic processed alphabets (helping check telephone spelling clarity), Braille converters (supporting accessibility standards checking), and advanced slug makers. By sanitizing arbitrary characters into clean ASCII slugs, search engine bots index pages far more effectively.
              </p>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-3">
                Why Offline Text Conversion is Crucial for Data Protection
              </h2>
              <p>
                In the era of cloud telemetry and data harvesting, putting proprietary content, private keys, or API parameters into random online convert tools poses serious security risks. Texly addresses this concern by running every single string operation fully on your local machine. No transmission, no session logs, and no external requests occur, creating an ironclad sandbox for professional operations.
              </p>
            </div>
          </div>
        </section>

        {/* FAQs component */}
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

        {/* Footer directories */}
        <section className="bg-slate-100 dark:bg-slate-900/40 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 p-6 sm:p-8">
          <h2 className="text-base font-black uppercase tracking-widest text-slate-400 mb-4">Related Hub Suites</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Link to="/tools/text-cleaning-hub" className="p-3 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl text-xs font-bold hover:border-amber-500/50 transition-all text-center">
              Text Cleaning Hub
            </Link>
            <Link to="/tools/text-analysis-hub" className="p-3 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl text-xs font-bold hover:border-amber-500/50 transition-all text-center">
              Analysis Hub
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
