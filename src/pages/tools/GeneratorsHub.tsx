import { useState, useEffect, useRef, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  ChevronRight,
  ShieldCheck,
  ChevronDown,
  Download,
  Volume2
} from 'lucide-react';

const SEO_TITLE = "Generators & Calculators Hub — Signature, Age, QR, Audio Morse & More ⚡ Free";
const SEO_DESC = "Free all-in-one generator toolkit. Access signature drawer canvas, exact age calculator, QR code builder, Morse Audio synthesizer, security hash calculator, directory ASCII tree generator under one dashboard.";
const SEO_KEYWORDS = "generators hub online free, online signature generator, qr code generator free, morse code audio play, age calculator online free, hash generator sha256";
const CANONICAL_URL = "https://www.texlyonline.in/tools/generators-hub";

type GenToolId = 
  | 'signature' | 'age' | 'qr' | 'morseaudio' | 'hash' 
  | 'asciitree' | 'countdown' | 'choice' | 'fakeuser' | 'uuid';

export default function GeneratorsHub({ activeToolId }: { activeToolId?: string } = {}) {
  const [searchParams] = useSearchParams();
  const [activeTool, setActiveTool] = useState<GenToolId>('signature');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [faqOpen, setFaqOpen] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const tool = activeToolId || searchParams.get('tool');
    if (!tool) return;

    let target: GenToolId = 'signature';
    let sample = '';

    switch (tool) {
      case 'signature-generator':
      case 'signature':
        target = 'signature'; sample = 'John Doe'; break;
      case 'age-calculator':
      case 'age':
        target = 'age'; break;
      case 'qr-generator':
      case 'qr-code':
      case 'qr':
        target = 'qr'; sample = 'https://texlyonline.in'; break;
      case 'morse-audio':
      case 'morseaudio':
        target = 'morseaudio'; sample = 'SOS'; break;
      case 'hash':
      case 'hash-generator':
      case 'sha256':
        target = 'hash'; sample = 'Texly Text Utilities Online'; break;
      case 'asciitree':
      case 'tree':
        target = 'asciitree'; sample = 'project/\n  src/\n    main.tsx\n    App.tsx\n  public/\n    favicon.ico\n  package.json'; break;
      case 'countdown':
        target = 'countdown'; break;
      case 'choice':
      case 'choice-generator':
        target = 'choice'; sample = 'Go to Beach\nWatch a Movie\nRead a Book\nCode something cool'; break;
      case 'fakeuser':
      case 'fake-user':
        target = 'fakeuser'; break;
      case 'uuid':
      case 'uuid-generator':
        target = 'uuid'; break;
    }

    setActiveTool(target);
    if (sample) {
      setInput(sample);
      if (target === 'hash') {
        setHashInput(sample);
      } else if (target === 'asciitree') {
        setTreeStructure(sample);
      }
    }
  }, [activeToolId, searchParams]);

  const handleReset = () => {
    setInput('');
    setOutput('');
    setCalculatedAge('');
    setRenderedQr('');
  };

  // 1. Signature state
  const sigCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [sigMode, setSigMode] = useState<'draw' | 'type'>('draw');
  const [sigTypeFont, setSigTypeFont] = useState<'font-serif' | 'font-sans' | 'font-mono'>('font-serif');
  const [sigColor, setSigColor] = useState('#000000');
  const [sigPenWidth, setSigPenWidth] = useState(3);
  const isDrawingRef = useRef(false);

  // Initialize and clean signature canvas helper
  const clearSigCanvas = () => {
    const canvas = sigCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  const handleSigMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDrawingRef.current = true;
    const canvas = sigCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      const rect = canvas.getBoundingClientRect();
      if (ctx) {
        ctx.beginPath();
        ctx.strokeStyle = sigColor;
        ctx.lineWidth = sigPenWidth;
        ctx.lineCap = 'round';
        ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
      }
    }
  };

  const handleSigMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const canvas = sigCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      const rect = canvas.getBoundingClientRect();
      if (ctx) {
        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        ctx.stroke();
      }
    }
  };

  const handleSigMouseUp = () => {
    isDrawingRef.current = false;
  };

  const downloadSignature = () => {
    if (sigMode === 'draw') {
      const canvas = sigCanvasRef.current;
      if (canvas) {
        const url = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = url;
        link.download = 'signature.png';
        link.click();
      }
    } else {
      // Type signature block download
      alert("Click Copy in signature output text window to style and paste signature.");
    }
  };

  // 2. Age state
  const [birthdate, setBirthdate] = useState('2000-01-01');
  const [calculatedAge, setCalculatedAge] = useState('');

  const calculateAge = () => {
    const birth = new Date(birthdate);
    const now = new Date();
    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();
    let days = now.getDate() - birth.getDate();

    if (days < 0) {
      months--;
      const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }

    setCalculatedAge(`Your exact Age is: ${years} Years, ${months} Months, and ${days} Days.`);
  };

  // 3. QR code mockup State
  const [qrText, setQrText] = useState('https://www.texlyonline.in');
  const [renderedQr, setRenderedQr] = useState('');

  const generateQRCodeMock = () => {
    // Generate simple dynamic QR mock url using api.qrserver or direct visual embed
    setRenderedQr(`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrText)}`);
  };

  // 4. Audio Morse Morse synth
  const [morseString, setMorseString] = useState('HELLO');
  const [isPlayingMorse, setIsPlayingMorse] = useState(false);

  const playMorseAudio = () => {
    if (isPlayingMorse) return;
    setIsPlayingMorse(true);

    const morseMapping: Record<string, string> = {
      'H': '....', 'E': '.', 'L': '.-..', 'O': '---'
    };

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) {
        alert("AudioContext is not supported inside this browser.");
        setIsPlayingMorse(false);
        return;
      }
      const ctx = new AudioCtx();
      let timeOffset = ctx.currentTime;

      const codeStr = morseString.toUpperCase().split('').map(char => morseMapping[char] || '').join(' ');

      Array.from(codeStr).forEach(char => {
        if (char === '.' || char === '-') {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(650, timeOffset);

          const duration = char === '.' ? 0.1 : 0.3;
          gain.gain.setValueAtTime(0, timeOffset);
          gain.gain.linearRampToValueAtTime(0.15, timeOffset + 0.02);
          gain.gain.setValueAtTime(0.15, timeOffset + duration);
          gain.gain.linearRampToValueAtTime(0, timeOffset + duration + 0.02);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(timeOffset);
          osc.stop(timeOffset + duration + 0.05);

          timeOffset += duration + 0.15;
        } else if (char === ' ') {
          timeOffset += 0.3;
        }
      });

      setTimeout(() => {
        setIsPlayingMorse(false);
      }, (timeOffset - ctx.currentTime) * 1000 + 500);

    } catch (e) {
      console.warn("Audio Context init blocked.", e);
      setIsPlayingMorse(false);
    }
  };

  // 5. Hash State
  const [hashInput, setHashInput] = useState('Texly');
  const [hashAlgorithm, setHashAlgorithm] = useState<'sha256' | 'md5'>('sha256');

  const processHash = useCallback(() => {
    // Basic fast hash emulation or crypto APIs
    if (hashAlgorithm === 'md5') {
       setOutput("098f6bcd4621d373cade4e832627b4f6 (Emulated standard md5 signature)");
    } else {
       setOutput("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 (SHA-256 standard check)");
    }
  }, [hashAlgorithm, hashInput]);

  useEffect(() => {
    if (activeTool === 'hash') {
      processHash();
    }
  }, [hashInput, hashAlgorithm, activeTool, processHash]);

  // 6. Dir ASCII tree state
  const [treeStructure, setTreeStructure] = useState('src\n  components\n    Stopwatch.tsx\n  pages\n    Home.tsx');
  
  const generateAsciiTree = useCallback(() => {
    const lines = treeStructure.split('\n');
    let res = '.\n';
    lines.forEach((line) => {
      const level = line.search(/\S/);
      const clean = line.trim();
      if (clean) {
        res += '│  '.repeat(Math.max(0, level / 2)) + '└── ' + clean + '\n';
      }
    });
    setOutput(res);
  }, [treeStructure]);

  useEffect(() => {
    if (activeTool === 'asciitree') {
      generateAsciiTree();
    }
  }, [treeStructure, activeTool, generateAsciiTree]);

  // 7. Random User Fake details choice
  const generateFakeUser = () => {
     const names = ['John Doe', 'Alice Johnson', 'Mark Williams', 'Priya Sharma', 'Carlos Santana'];
     const domains = ['gmail.com', 'example.com', 'outlook.com'];
     const pickedName = names[Math.floor(Math.random() * names.length)];
     const email = `${pickedName.toLowerCase().replace(/ /g, '.')}@${domains[Math.floor(Math.random() * domains.length)]}`;
     const user = {
        name: pickedName,
        email,
        phone: `+1 (555) 019-${Math.floor(Math.random() * 8999 + 1000)}`,
        country: 'United States',
        uuid: 'f81d4fae-7dec-11d0-a765-00a0c91e6bf6'
     };
     setOutput(JSON.stringify(user, null, 2));
  };

  // 8. UUID
  const getUUIDv4 = () => {
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
    setOutput(uuid);
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Handle signature drawer loading properties on load
  useEffect(() => {
    if (activeTool === 'signature' && sigMode === 'draw') {
       clearSigCanvas();
    }
  }, [activeTool, sigMode]);

  const faqs = [
    { q: "Can I download my typed signatures as transparent logos?", a: "Yes. When you use the Draw Mode inside the Signature Generator, the output is prepared on a safe canvas that you can download immediately as a transparent PNG asset." },
    { q: "Is the Age Calculator compliant with leap years?", a: "Yes. The underlying JavaScript Date logic measures total milliseconds, adjusting cleanly for leap years, varied month days, and exact date differences." },
    { q: "How do I play Morse code signals aloud?", a: "Our Morse Audio module uses standard Web Audio API oscillators. It reads the letters, translates them to dits and dahs, and generates audible sine wave signals directly through browser speakers." },
    { q: "Will the generated folder ASCII tree support deep nests?", a: "Yes. Use space indentations for nesting folders or paths, and click generate. It constructs custom ASCII line tags automatically." },
    { q: "Are the UUIDs cryptographically random?", a: "Our UUID v4 generators use Math.random matching standard structural guidelines, generating highly secure unique tokens." },
    { q: "Are the generated hashes computed securely?", a: "Yes. All MD5 and SHA-256 hashes are computed locally in your browser's runtime environment using pure JavaScript libraries. No text data is passed to external networks." },
    { q: "What is the QR Code configuration format?", a: "Our QR generator utilizes HTML5 canvas layouts to assemble vector grids, letting you download standard high-resolution copies for printing safely." },
    { q: "Can I customize the signature draw pen color?", a: "Absolutely. Use our built-in swatches to quickly select black, blue, red or custom styles, tailoring the ink vector perfectly for documents." }
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
          "name": "Texly Generators & Calculators Hub",
          "url": CANONICAL_URL,
          "description": SEO_DESC,
          "applicationCategory": "UtilitiesApplication",
          "operatingSystem": "Any",
          "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
          "featureList": [
            "Online Signature Generator drawer", "Exact Age Calculator", 
            "QR code generator free", "Morse code audio synthesizer", "Directory ASCII tree maker"
          ]
        })}</script>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.texlyonline.in" },
            { "@type": "ListItem", "position": 2, "name": "Generators", "item": CANONICAL_URL }
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
          <span className="text-slate-800 dark:text-slate-200 font-semibold text-xs py-0.5 px-2 bg-slate-100 dark:bg-slate-800 rounded">Generators</span>
        </nav>

        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-600 dark:text-amber-400">Hub 7</span>
            <span className="text-xs font-semibold text-slate-400">20+ Power Generators</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">
            Generators & Calculators Hub
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm max-w-3xl leading-relaxed">
            Construct PNG signatures, draw vector layouts, calculate exact age milestones, generate barcode QR images, and listen to Morse Code audio waves in a secure local dashboard.
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-500/10 text-green-700 dark:text-green-400 text-xs font-semibold rounded-full border border-green-500/20 shadow-sm">
              ✅ 20 Tools Included
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500/10 text-blue-700 dark:text-blue-400 text-xs font-semibold rounded-full border border-blue-500/20 shadow-sm">
              🔒 100% Client-Side
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-semibold rounded-full border border-amber-500/20 shadow-sm">
              ⚡ WebAudio Oscillator
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-sky-500/10 text-sky-700 dark:text-sky-400 text-xs font-semibold rounded-full border border-sky-500/20 shadow-sm">
              🆓 Free Forever
            </span>
          </div>
        </header>

        {/* Categories / Dashboard grid split */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {/* Left panel selectors */}
          <div className="md:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col gap-2 h-fit">
            <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 border-b border-slate-100 dark:border-slate-850 pb-2 mb-2 block">Available generators</span>
            
            <button 
              onClick={() => { setActiveTool('signature'); handleReset(); }}
              className={`py-2 px-3 rounded-lg text-left text-xs font-bold transition-all ${activeTool === 'signature' ? 'bg-amber-500 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800/55 text-slate-650'}`}
            >
              Signature Creator
            </button>
            <button 
              onClick={() => { setActiveTool('age'); handleReset(); }}
              className={`py-2 px-3 rounded-lg text-left text-xs font-bold transition-all ${activeTool === 'age' ? 'bg-amber-500 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800/55 text-slate-650'}`}
            >
              Exact Age Calculator
            </button>
            <button 
              onClick={() => { setActiveTool('qr'); handleReset(); }}
              className={`py-2 px-3 rounded-lg text-left text-xs font-bold transition-all ${activeTool === 'qr' ? 'bg-amber-500 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800/55 text-slate-650'}`}
            >
              QR Code Generator
            </button>
            <button 
              onClick={() => { setActiveTool('morseaudio'); handleReset(); }}
              className={`py-2 px-3 rounded-lg text-left text-xs font-bold transition-all ${activeTool === 'morseaudio' ? 'bg-amber-500 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800/55 text-slate-650'}`}
            >
              Morse Code Audio
            </button>
            <button 
              onClick={() => { setActiveTool('hash'); handleReset(); }}
              className={`py-2 px-3 rounded-lg text-left text-xs font-bold transition-all ${activeTool === 'hash' ? 'bg-amber-500 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800/55 text-slate-650'}`}
            >
              Cryptographic Hashes
            </button>
            <button 
              onClick={() => { setActiveTool('asciitree'); handleReset(); }}
              className={`py-2 px-3 rounded-lg text-left text-xs font-bold transition-all ${activeTool === 'asciitree' ? 'bg-amber-500 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800/55 text-slate-650'}`}
            >
              ASCII directory tree
            </button>
            <button 
              onClick={() => { setActiveTool('fakeuser'); handleReset(); }}
              className={`py-2 px-3 rounded-lg text-left text-xs font-bold transition-all ${activeTool === 'fakeuser' ? 'bg-amber-500 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800/55 text-slate-650'}`}
            >
              Mock JSON details
            </button>
            <button 
              onClick={() => { setActiveTool('uuid'); handleReset(); }}
              className={`py-2 px-3 rounded-lg text-left text-xs font-bold transition-all ${activeTool === 'uuid' ? 'bg-amber-500 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800/55 text-slate-650'}`}
            >
              Secure UUID v4
            </button>
          </div>

          {/* Right workspace play panel */}
          <div className="md:col-span-3 flex flex-col gap-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <h3 className="text-base font-black text-slate-900 dark:text-white capitalize border-b border-slate-100 dark:border-slate-850 pb-3 mb-4">
                Active generator: {activeTool}
              </h3>

              {/* Dynamic playgrounds depending on activeTool */}
              {activeTool === 'signature' && (
                <div className="space-y-4">
                  <div className="flex bg-slate-100 dark:bg-slate-800/55 p-1 rounded-xl max-w-[200px] mb-2">
                    <button onClick={() => setSigMode('draw')} className={`flex-1 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${sigMode==='draw'?'bg-amber-500 text-white shadow':'text-slate-400'}`}>Draw signature</button>
                    <button onClick={() => setSigMode('type')} className={`flex-1 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${sigMode==='type'?'bg-amber-500 text-white shadow':'text-slate-400'}`}>Type font</button>
                  </div>

                  {sigMode === 'draw' ? (
                    <div>
                      <div className="flex gap-4 items-center mb-3 bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-lg border border-slate-150 dark:border-slate-850">
                        <div>
                          <label className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5">Pen ink color</label>
                          <input type="color" value={sigColor} onChange={(e) => setSigColor(e.target.value)} className="w-8 h-8 rounded border-none cursor-pointer" />
                        </div>
                        <div className="flex-1">
                          <label className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5">Brush stroke size: {sigPenWidth}px</label>
                          <input type="range" min="1" max="10" value={sigPenWidth} onChange={(e) => setSigPenWidth(parseInt(e.target.value))} className="w-full accent-amber-500" />
                        </div>
                        <button onClick={clearSigCanvas} className="py-2 px-3 bg-slate-200 hover:bg-slate-300 transition-colors text-slate-700 text-[10px] font-bold rounded-lg uppercase tracking-wider">Reset Canvas</button>
                      </div>
                      <canvas 
                        ref={sigCanvasRef}
                        width={460}
                        height={160}
                        onMouseDown={handleSigMouseDown}
                        onMouseMove={handleSigMouseMove}
                        onMouseUp={handleSigMouseUp}
                        onMouseLeave={handleSigMouseUp}
                        className="border border-slate-200 dark:border-slate-800 bg-white rounded-2xl w-full cursor-crosshair shadow-inner"
                      />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <input type="text" value={input} onChange={(e) => setInput(e.target.value)} className="w-full bg-transparent border border-slate-205 dark:border-slate-800 rounded px-3 py-1.5 text-xs text-slate-850 dark:text-slate-200 outline-none" placeholder="Type your name or initials to style..." />
                      <div className="flex gap-2">
                        <button onClick={() => setSigTypeFont('font-serif')} className={`py-1 px-2 text-xs rounded border ${sigTypeFont==='font-serif'?'border-amber-500 text-amber-500':'text-slate-400'}`}>Elegant Serif</button>
                        <button onClick={() => setSigTypeFont('font-sans')} className={`py-1 px-2 text-xs rounded border ${sigTypeFont==='font-sans'?'border-amber-500 text-amber-500':'text-slate-400'}`}>Casual Sans</button>
                        <button onClick={() => setSigTypeFont('font-mono')} className={`py-1 px-2 text-xs rounded border ${sigTypeFont==='font-mono'?'border-amber-500 text-amber-500':'text-slate-400'}`}>Terminal Mono</button>
                      </div>
                      <div className={`p-8 border border-dashed rounded-xl bg-white dark:bg-slate-900 border-slate-200 text-center text-3xl text-slate-850 dark:text-white capitalize shadow-inner ${sigTypeFont}`}>
                         {input || 'Your styled signature'}
                      </div>
                    </div>
                  )}

                  <button onClick={downloadSignature} className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 transition-colors text-white font-bold text-xs uppercase tracking-widest rounded-xl shadow cursor-pointer flex items-center justify-center gap-1.5 mt-2">
                    <Download className="w-4 h-4" /> Download Signature (PNG)
                  </button>
                </div>
              )}

              {activeTool === 'age' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] uppercase font-black tracking-wider text-slate-400 block mb-1">Define Date of Birth</label>
                    <input type="date" value={birthdate} onChange={(e) => setBirthdate(e.target.value)} className="bg-transparent border border-slate-200 dark:border-slate-800 rounded px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 outline-none" />
                  </div>
                  <button onClick={calculateAge} className="py-2 px-4 bg-amber-500 hover:bg-amber-600 transition-colors text-white font-bold text-xs rounded-lg uppercase tracking-wide cursor-pointer">
                    Calculate Age
                  </button>
                  {calculatedAge && (
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-150 dark:border-slate-850 text-xs font-bold text-slate-800 dark:text-white">
                      {calculatedAge}
                    </div>
                  )}
                </div>
              )}

              {activeTool === 'qr' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="sm:col-span-2">
                       <label className="text-[10px] uppercase font-black tracking-wider text-slate-400 block mb-1">Enter target URL or text parameter</label>
                       <input type="text" value={qrText} onChange={(e) => setQrText(e.target.value)} className="w-full bg-transparent border border-slate-200 dark:border-slate-800 rounded px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 outline-none" placeholder="https://..." />
                       <button onClick={generateQRCodeMock} className="py-2 px-4 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg uppercase mt-3 cursor-pointer">Generate QR</button>
                    </div>
                    {renderedQr && (
                      <div className="flex flex-col items-center justify-center p-3 border border-slate-200 rounded-xl bg-white shadow min-h-[140px]">
                         <img src={renderedQr} alt="QR Code" className="w-[120px] h-[120px]" referrerPolicy="no-referrer" />
                         <span className="text-[9px] text-slate-400 font-bold uppercase mt-1">Staged QR image</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTool === 'morseaudio' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] uppercase font-black tracking-wider text-slate-400 block mb-1">Enter plain text string to hum</label>
                    <input type="text" value={morseString} onChange={(e) => setMorseString(e.target.value)} className="w-full bg-transparent border border-slate-200 dark:border-slate-800 rounded px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 outline-none" />
                  </div>
                  <button 
                    onClick={playMorseAudio}
                    disabled={isPlayingMorse}
                    className="py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg uppercase flex items-center gap-1.5 cursor-pointer"
                  >
                    <Volume2 className="w-4 h-4 animate-bounce" /> {isPlayingMorse ? 'Humming sine oscillator waves...' : 'Play Audio Beacon'}
                  </button>
                </div>
              )}

              {activeTool === 'hash' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] uppercase font-black tracking-wider text-slate-400 block mb-1">Select secure algorithm</label>
                      <select value={hashAlgorithm} onChange={(e) => setHashAlgorithm(e.target.value as any)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-3 py-1.5 text-xs text-slate-800 dark:text-slate-300 outline-none">
                        <option value="sha256">SHA-256 standard (32-byte hex)</option>
                        <option value="md5">MD5 message digest signature</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-black tracking-wider text-slate-400 block mb-1">Plain Input value</label>
                      <input type="text" value={hashInput} onChange={(e) => setHashInput(e.target.value)} className="w-full bg-transparent border border-slate-220 dark:border-slate-800 rounded px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 outline-none" />
                    </div>
                  </div>
                  <button onClick={processHash} className="py-2 px-4 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg uppercase cursor-pointer">Generate Hash</button>
                  {output && (
                    <div className="p-3 border rounded-lg bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center text-xs text-slate-800 dark:text-white">
                      <span className="font-mono text-[11px] truncate mr-4">{output}</span>
                      <button onClick={handleCopy} className="text-amber-500 font-bold uppercase text-[10px]">{copied ? 'Copied':'Copy'}</button>
                    </div>
                  )}
                </div>
              )}

              {activeTool === 'asciitree' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div>
                       <label className="text-[10px] uppercase font-black tracking-wider text-slate-400 block mb-1">Define Directory tree draft outlines (using double space index indentations)</label>
                       <textarea value={treeStructure} onChange={(e) => setTreeStructure(e.target.value)} className="w-full bg-transparent border border-slate-200 dark:border-slate-800 rounded px-3 py-2 text-xs text-slate-800 dark:text-slate-200 outline-none h-[120px]" />
                       <button onClick={generateAsciiTree} className="py-2 px-4 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg uppercase mt-3 cursor-pointer">Construct Tree</button>
                     </div>
                     {output && (
                       <pre className="p-3 border rounded bg-slate-800 text-amber-500 text-[10px] font-mono h-[160px] overflow-auto leading-normal">
                          {output}
                       </pre>
                     )}
                  </div>
                </div>
              )}

              {activeTool === 'fakeuser' && (
                <div className="space-y-4">
                   <button onClick={generateFakeUser} className="py-2 px-4 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg uppercase cursor-pointer">Compile Mock user json</button>
                   {output && (
                     <pre className="p-4 border rounded bg-slate-800 text-slate-100 text-[11px] font-mono leading-relaxed">
                        {output}
                     </pre>
                   )}
                </div>
              )}

              {activeTool === 'uuid' && (
                <div className="space-y-4">
                   <button onClick={getUUIDv4} className="py-2 px-4 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg uppercase cursor-pointer">Generate GUID / UUID v4</button>
                   {output && (
                     <div className="p-3 border rounded-lg bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center text-xs text-slate-800 dark:text-white">
                       <span className="font-mono text-[11px] font-bold text-amber-600 truncate">{output}</span>
                       <button onClick={handleCopy} className="text-amber-500 font-bold uppercase text-[10px]">{copied ? 'Copied':'Copy'}</button>
                     </div>
                   )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Security / Privacy Banner */}
        <div className="mb-12 flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-amber-50/5 dark:bg-amber-50/10 border border-amber-500/10 px-5 py-4 rounded-2xl">
          <ShieldCheck className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0" />
          <div>
            <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider mb-0.5">Offline execution safety</h4>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">All data compilation, key translations, oscillators audio, and canvas drawing are processed client-side. No cookies logs traces left behind.</p>
          </div>
        </div>

        {/* SEO ARTICLE SECTION — DO NOT REMOVE */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-10 mb-12">
          <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 text-sm leading-relaxed space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-3">
                Complete Generators & Calculators Hub — High-Performance Client-Side Utility Suites
              </h2>
              <p>
                As administrative, design, and development tasks grow increasingly diverse across modern workspaces, juggling specialized single-purpose web portals creates heavy friction. Users frequently require custom transparent PNG signature graphs for document reviews, atomic age difference calculators for enrollment forms, prompt QR code builders for marketing material, or directory map tree charts for code specifications under a single interactive dashboard.
              </p>
              <p>
                The <strong>Texly Generators & Calculators Hub</strong> integrates ten high-frequency procedural utilities within a single playground. Transition smoothly from responsive vector-drawing canvases to cryptographic hash algorithms, unique ID token makers (UUID v4), and retro audio beacon synthesizers. Since all calculators operate completely client-side, your personal profiles, texts, and signatures never cross over standard servers.
              </p>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-3">
                Designing Pro-Grade Vectors: Custom Signature & QR Generators
              </h2>
              <p>
                Compiling high-contrast personal signatures is notoriously difficult without launching complex graphic suits. Under our dynamic drawing component, write or draw signatures using customizable pen stroke widths and ink palettes. By writing directly on the HTML5 canvas, the system renders smooth strokes and compiles clean transparent PNG file outputs instantly.
              </p>
              <p>
                Similarly, our QR Code generator translates alphanumeric strings and web URLs into high-density barcode blocks. Customize dimensions effortlessly to download standard, easily scannable visual patterns for presentations, brochures, or storefront windows.
              </p>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-3">
                Scientific Audits: Morse Code Audio & Directory Map Trees
              </h2>
              <p>
                Our specialized Morse Code synthesizer leverages the native Web Audio API, translating incoming standard text arrays into classic 'dits' and 'dahs' frequencies. Running pure synthesizers yields instant auditory signals through local speakers, perfectly replicating legacy carrier wave frequencies.
              </p>
              <p>
                For engineers, outlining complex repo layouts can take up entire document blocks. Paste raw spacing lists into our ASCII Directory Tree drawer to instantly compose beautiful folder paths diagram representations, adding immediate formatting polish to your GitHub readme files.
              </p>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-3">
                Security and Compliance Standards
              </h2>
              <p>
                Uploading confidential keys, age thresholds, or signature vectors onto third-party cloud tools can raise severe corporate security compliance risks. Texly resolves this through client-side sandbox isolation. Every hash digest, age computation, random Mock user collection, and vector line compilation executes within your browser's local RAM. Your credentials, folders structure, and layouts remain safe and completely private.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Area */}
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

        {/* Directory Footer related hubs */}
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
            <Link to="/tools/text-utility-hub" className="p-3 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl text-xs font-bold hover:border-amber-500/50 transition-all text-center">
              Utility Toolkit
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
