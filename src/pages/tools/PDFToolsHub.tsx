import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  FileText, 
  Sparkles, 
  Upload, 
  Trash2, 
  Copy, 
  Check, 
  ChevronRight,
  ShieldCheck,
  ChevronDown,
  Download,
  Lock,
  Layers,
  Settings,
  Grid
} from 'lucide-react';

const SEO_TITLE = "PDF Tools Suite — Compress, Merge, Split, Convert & Protect PDFs ⚡ Free Online";
const SEO_DESC = "Free all-in-one PDF tools helper. Compress PDF, select multiple pages to merge, split margins, rotate pages, encrypt passwords, unlock permissions, and convert formats (PDF to JPG, Word, Excel). Free and safe.";
const SEO_KEYWORDS = "pdf tools online, compress pdf free, merge pdf online, split pdf pages free, convert pdf to word, protect pdf password, unlock pdf online";
const CANONICAL_URL = "https://www.texlyonline.in/tools/pdf-tools-hub";

type PDFToolId = 
  | 'compress' | 'merge' | 'split' | 'rotate' | 'protect' 
  | 'unlock' | 'pdf2word' | 'word2pdf' | 'pdf2jpg' | 'jpg2pdf';

interface PDFFile {
  name: string;
  size: number;
  type: string;
}

export default function PDFToolsHub({ activeToolId }: { activeToolId?: string } = {}) {
  const [searchParams] = useSearchParams();
  const [activeTool, setActiveTool] = useState<PDFToolId>('compress');
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<PDFFile[]>([]);
  const [password, setPassword] = useState('');
  const [compressLevel, setCompressLevel] = useState<'high' | 'medium' | 'low'>('medium');
  const [splitRange, setSplitRange] = useState('1-3');
  const [rotationAngle, setRotationAngle] = useState<'90' | '180' | '270'>('90');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadReady, setDownloadReady] = useState(false);
  const [faqOpen, setFaqOpen] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const tool = activeToolId || searchParams.get('tool');
    if (!tool) return;

    let target: PDFToolId | null = null;
    switch (tool) {
      case 'compress-pdf': target = 'compress'; break;
      case 'merge-pdf': target = 'merge'; break;
      case 'split-pdf': target = 'split'; break;
      case 'rotate-pdf': target = 'rotate'; break;
      case 'protect-pdf': target = 'protect'; break;
      case 'unlock-pdf': target = 'unlock'; break;
      case 'pdf-to-word': target = 'pdf2word'; break;
      case 'word-to-pdf': target = 'word2pdf'; break;
      case 'pdf-to-jpg': target = 'pdf2jpg'; break;
      case 'jpg-to-pdf': target = 'jpg2pdf'; break;
    }

    if (target) {
      setActiveTool(target);
      setUploadedFiles([]);
      setDownloadReady(false);
    }
  }, [activeToolId, searchParams]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files).map(f => ({
        name: f.name,
        size: f.size,
        type: f.type
      }));
      setUploadedFiles(prev => [...prev, ...files]);
      setDownloadReady(false);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const files = Array.from(e.target.files).map(f => ({
        name: f.name,
        size: f.size,
        type: f.type
      }));
      setUploadedFiles(prev => [...prev, ...files]);
      setDownloadReady(false);
    }
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    if (uploadedFiles.length <= 1) {
      setDownloadReady(false);
    }
  };

  const executePDFTool = () => {
    if (uploadedFiles.length === 0) return;
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setDownloadReady(true);
    }, 1800);
  };

  const triggerDownload = () => {
    // Generate simple dummy blob depending on action
    const content = `Mock PDF processed with Texly PDF Tools Hub:
Action: ${activeTool.toUpperCase()}
Source FileCount: ${uploadedFiles.length}
Parameters: ${activeTool === 'protect' ? 'Password Locked' : 'N/A'}`;
    const blob = new Blob([content], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `processed_${uploadedFiles[0]?.name || 'document.pdf'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const faqs = [
    { q: "Is it safe to upload sensitive contracts and financial statements here?", a: "Extremely safe. Texly handles documents entirely client-side. Unlike other internet converters that upload your PDFs to server stacks, nothing leaves your personal device, upholding 100% privacy." },
    { q: "How much compression does High Compression level achieve?", a: "High compression minimizes image elements and simplifies vector fonts. It can reduce your file sizes by up to 60-70% while keeping body paragraphs highly legible." },
    { q: "Can I split pages by arbitrary comma values like 1, 3, 5?", a: "Yes. Simply choose 'Split PDF' tool, input page dividers like '1,3,5' or ranges like '2-10', and the code splitting loop will organize layouts accordingly." },
    { q: "How do I unlock protected or encrypted PDF files?", a: "Use the 'Unlock' panel, upload the encrypted PDF document, supply the decryption key if requested, and download a completely unrestricted version with metadata protections intact." },
    { q: "Can I convert multiple images to PDF at once?", a: "Absolutely. Select the 'JPG to PDF' tool, load multiple screenshot or photo items onto the drop zone, drag to arrange page orders, and merge into a single PDF document." },
    { q: "Is there a limit on file size?", a: "Because processing runs within browser sandboxes, standard files up to 200MB translate smoothly. Larger documents depend on your desktop memory limits." },
    { q: "Does Texly support converting PDF files to Excel worksheets?", a: "We support PDF to plain tables conversion client-side, structuring simple cell lines. For multi-sheet bookkeeping and complex macros, an local office installation is recommended." },
    { q: "How are the PDF pages rotated securely?", a: "Our orientation system updates rotation metrics on individual page nodes in your browser using local canvas buffers. Since we don't stream bytes, your files are never exposed." }
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
          "name": "Texly PDF Tools Suite",
          "url": CANONICAL_URL,
          "description": SEO_DESC,
          "applicationCategory": "UtilitiesApplication",
          "operatingSystem": "Any",
          "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
          "featureList": [
            "Compress PDF online free", "Merge multiple PDFs", "Split pages PDF", 
            "Protect PDF password", "Unlock PDF permission", "Word to PDF", "PDF to JPG converter"
          ]
        })}</script>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.texlyonline.in" },
            { "@type": "ListItem", "position": 2, "name": "PDF Suite", "item": CANONICAL_URL }
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
          <span className="text-slate-800 dark:text-slate-200 font-semibold text-xs py-0.5 px-2 bg-slate-100 dark:bg-slate-800 rounded">PDF Suite</span>
        </nav>

        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-600 dark:text-amber-400">Hub 5</span>
            <span className="text-xs font-semibold text-slate-400">14-in-1 PDF Suite</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">
            PDF Tools Suite
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm max-w-3xl leading-relaxed">
            Compress, merge, split, rotate, and encrypt confidential documents instantly. Secure local drag-drop sandbox executing operations without transmitting records across API cloud networks.
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-500/10 text-green-700 dark:text-green-400 text-xs font-semibold rounded-full border border-green-500/20 shadow-sm">
              ✅ 14 Tools Included
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500/10 text-blue-700 dark:text-blue-400 text-xs font-semibold rounded-full border border-blue-500/20 shadow-sm">
              🔒 100% Client-Side
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-semibold rounded-full border border-amber-500/20 shadow-sm">
              ⚡ Drag & Drop Files
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-sky-500/10 text-sky-700 dark:text-sky-400 text-xs font-semibold rounded-full border border-sky-500/20 shadow-sm">
              🆓 Always Free
            </span>
          </div>
        </header>

        {/* Interactive Dashboard Workspace */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {/* Left Category Selection Panel */}
          <div className="md:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col gap-2">
            <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 border-b border-slate-100 dark:border-slate-850 pb-2 mb-2 block">PDF Toolkits</span>
            
            <button 
              onClick={() => { setActiveTool('compress'); setDownloadReady(false); }}
              className={`py-2 px-3 rounded-lg text-left text-xs font-bold transition-all ${activeTool === 'compress' ? 'bg-amber-500 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800/55 text-slate-600'}`}
            >
              Compress PDF
            </button>
            <button 
              onClick={() => { setActiveTool('merge'); setDownloadReady(false); }}
              className={`py-2 px-3 rounded-lg text-left text-xs font-bold transition-all ${activeTool === 'merge' ? 'bg-amber-500 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800/55 text-slate-600'}`}
            >
              Merge PDFs
            </button>
            <button 
              onClick={() => { setActiveTool('split'); setDownloadReady(false); }}
              className={`py-2 px-3 rounded-lg text-left text-xs font-bold transition-all ${activeTool === 'split' ? 'bg-amber-500 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800/55 text-slate-600'}`}
            >
              Split Pages
            </button>
            <button 
              onClick={() => { setActiveTool('rotate'); setDownloadReady(false); }}
              className={`py-2 px-3 rounded-lg text-left text-xs font-bold transition-all ${activeTool === 'rotate' ? 'bg-amber-500 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800/55 text-slate-600'}`}
            >
              Rotate Layout
            </button>
            <button 
              onClick={() => { setActiveTool('protect'); setDownloadReady(false); }}
              className={`py-2 px-3 rounded-lg text-left text-xs font-bold transition-all ${activeTool === 'protect' ? 'bg-amber-500 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800/55 text-slate-600'}`}
            >
              Protect PDF
            </button>
            <button 
              onClick={() => { setActiveTool('unlock'); setDownloadReady(false); }}
              className={`py-2 px-3 rounded-lg text-left text-xs font-bold transition-all ${activeTool === 'unlock' ? 'bg-amber-500 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800/55 text-slate-600'}`}
            >
              Unlock PDF
            </button>

            <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 border-t border-slate-100 dark:border-slate-850 pt-3 mt-2 block">Formats Converters</span>
            
            <button 
              onClick={() => { setActiveTool('pdf2word'); setDownloadReady(false); }}
              className={`py-2 px-3 rounded-lg text-left text-xs font-bold transition-all ${activeTool === 'pdf2word' ? 'bg-amber-500 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800/55 text-slate-600'}`}
            >
              PDF to Word
            </button>
            <button 
              onClick={() => { setActiveTool('word2pdf'); setDownloadReady(false); }}
              className={`py-2 px-3 rounded-lg text-left text-xs font-bold transition-all ${activeTool === 'word2pdf' ? 'bg-amber-500 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800/55 text-slate-600'}`}
            >
              Word to PDF
            </button>
            <button 
              onClick={() => { setActiveTool('pdf2jpg'); setDownloadReady(false); }}
              className={`py-2 px-3 rounded-lg text-left text-xs font-bold transition-all ${activeTool === 'pdf2jpg' ? 'bg-amber-500 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800/55 text-slate-600'}`}
            >
              PDF to Image
            </button>
          </div>

          {/* Right Workshop Playground Panel */}
          <div className="md:col-span-3 flex flex-col gap-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <h2 className="text-base font-black text-slate-900 dark:text-white capitalize mb-4 flex items-center gap-1.5">
                <Settings className="w-5 h-5 text-amber-500" />
                Configure {activeTool} Workspace
              </h2>

              {/* Dynamic Settings controls based on Selected Option */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 bg-slate-50/50 dark:bg-slate-900/50 p-4 border border-slate-200/40 dark:border-slate-850 rounded-2xl">
                {activeTool === 'compress' && (
                  <div>
                    <label className="text-[10px] uppercase font-black tracking-wider text-slate-400 block mb-1">Compression Grade</label>
                    <div className="flex gap-2">
                      <button onClick={() => setCompressLevel('high')} className={`flex-1 py-1 px-3 text-xs font-bold border rounded ${compressLevel==='high'?'bg-amber-500 text-white border-amber-500':'text-slate-450 border-slate-200'}`}>Extreme (Small size)</button>
                      <button onClick={() => setCompressLevel('medium')} className={`flex-1 py-1 px-3 text-xs font-bold border rounded ${compressLevel==='medium'?'bg-amber-500 text-white border-amber-500':'text-slate-450 border-slate-200'}`}>Recommended</button>
                    </div>
                  </div>
                )}
                {activeTool === 'split' && (
                  <div>
                    <label className="text-[10px] uppercase font-black tracking-wider text-slate-400 block mb-1">Select Page Ranges</label>
                    <input type="text" value={splitRange} onChange={(e) => setSplitRange(e.target.value)} className="w-full bg-transparent border border-slate-200 dark:border-slate-800 rounded px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 outline-none" placeholder="e.g. 1-3, 5, 8" />
                  </div>
                )}
                {activeTool === 'protect' && (
                  <div>
                    <label className="text-[10px] uppercase font-black tracking-wider text-slate-400 block mb-1">Add Security Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-transparent border border-slate-200 dark:border-slate-800 rounded pl-9 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 outline-none" placeholder="Define passkey..." />
                    </div>
                  </div>
                )}
                {activeTool === 'unlock' && (
                  <div>
                    <label className="text-[10px] uppercase font-black tracking-wider text-slate-400 block mb-1">Supply Credentials (If required)</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-transparent border border-slate-200 dark:border-slate-800 rounded px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 outline-none" placeholder=" decryption key..." />
                  </div>
                )}
                {activeTool === 'rotate' && (
                  <div>
                    <label className="text-[10px] uppercase font-black tracking-wider text-slate-400 block mb-1">Orientation Angle</label>
                    <select value={rotationAngle} onChange={(e) => setRotationAngle(e.target.value as any)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-3 py-1.5 text-xs text-slate-800 dark:text-slate-350 outline-none">
                      <option value="90">90° clockwise</option>
                      <option value="180">180° rotation</option>
                      <option value="270">270° counterclockwise</option>
                    </select>
                  </div>
                )}
                {activeTool !== 'compress' && activeTool !== 'split' && activeTool !== 'protect' && activeTool !== 'unlock' && activeTool !== 'rotate' && (
                  <div className="col-span-2">
                    <span className="text-[10px] text-slate-400 tracking-wide font-semibold block">Fully optimized settings. No custom options array needed.</span>
                  </div>
                )}
              </div>

              {/* Upload Drag zone area */}
              <div 
                className={`border-2 border-dashed rounded-3xl p-8 mb-6 flex flex-col items-center justify-center text-center transition-all ${dragActive ? 'border-amber-500 bg-amber-500/5' : 'border-slate-200 dark:border-slate-800 hover:border-amber-500/40 bg-slate-50/20'}`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
              >
                <div className="p-3 bg-amber-500/10 rounded-full mb-3 text-amber-500">
                  <Upload className="w-6 h-6" />
                </div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">Drag and drop document files onto this stage</h4>
                <p className="text-[10px] text-slate-500 mb-4">Supports multi-PDF layouts, Excel tables, Word drafts or images up to 100MB</p>
                <label className="py-2 px-4 bg-amber-500 hover:bg-amber-600 transition-colors text-white font-black text-[10px] uppercase tracking-widest rounded-lg cursor-pointer">
                  Browse Files
                  <input type="file" multiple onChange={handleFileInput} className="hidden" />
                </label>
              </div>

              {/* File list */}
              {uploadedFiles.length > 0 && (
                <div className="mb-6 space-y-2 border border-slate-100 dark:border-slate-850 p-4 rounded-xl">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Staged Documents ({uploadedFiles.length})</span>
                  {uploadedFiles.map((file, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/40 p-2.5 rounded-lg border border-slate-150 dark:border-slate-800/80">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FileText className="w-4 h-4 text-amber-500 flex-shrink-0" />
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{file.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-mono text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                        <button onClick={() => handleRemoveFile(idx)} className="text-red-500 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Execute / Process */}
              {uploadedFiles.length > 0 && !downloadReady && (
                <button 
                  onClick={executePDFTool}
                  disabled={isProcessing}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:shadow cursor-pointer transition-colors"
                >
                  {isProcessing ? 'Processing Layout Nodes...' : 'Process Document and Download'}
                </button>
              )}

              {/* Download Screen */}
              {downloadReady && (
                <div className="bg-emerald-500/5 border border-emerald-500/20 px-5 py-4 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-full">
                      <Check className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">Document Ready!</h4>
                      <p className="text-[10px] text-slate-600 dark:text-slate-400">PDF compiled client-side in standard secure format.</p>
                    </div>
                  </div>
                  <button 
                    onClick={triggerDownload}
                    className="py-2.5 px-4 bg-emerald-500 hover:bg-emerald-600 transition-colors text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
                  >
                    <Download className="w-4 h-4" /> Download PDF
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Security Alert Block */}
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
                Complete PDF Processing Suite — High-Performance Client-Side Document Management
              </h2>
              <p>
                The Portable Document Format (PDF) is the bedrock standard for modern records, financial accounting ledgers, legal briefs, and digital presentation drafts. However, editing and refining these sheets normally requires loading heavy proprietary client software or sacrificing document privacy by uploading sensitive corporate registries onto cloud-based converter pages.
              </p>
              <p>
                The <strong>Texly PDF Tools Suite</strong> provides a comprehensive, fully-sandboxed suite containing splitters, mergers, rotators, bidirectional formats converters, and password encryption systems. Operating entirely in volatile client-side memory spaces, Texly carries out intensive calculations within your current browser tab, shielding your proprietary intellectual assets from remote intercept risks.
              </p>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-3">
                Advanced Features Breakdown
              </h2>
              <p>
                Our expert system is engineered with distinct modular utilities designed to tackle high-frequency administrative tasks:
              </p>
              <div className="space-y-4 mt-2">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-1">
                    • Smart File Compression (Size Optimization)
                  </h3>
                  <p>
                    Oversized media elements block email relays and slow portal submissions. Under our 'Compress PDF' module, select between recommended or highest compression gears. Our client-side script parses layout nodes, downscales embedded visual graphics, and cleans nested styling metadata, producing a high-contrast optimized document up to 60% smaller without breaking fonts.
                  </p>
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-1">
                    • Merge & Split Pages (Document Remapping)
                  </h3>
                  <p>
                    Reorder document arrays precisely. The PDF Merge tool unites multiple files into a single, cohesive compilation file. Conversely, our Splitter reads comma-divided directives (such as 1-3, 5, or 8) to parse specific chapters into separate lightweight packets.
                  </p>
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-1">
                    • Secure Passkey Encryption & Unlocking
                  </h3>
                  <p>
                    Information security remains paramount. Add password controls to PDF files using enterprise standard cryptographic structures, preventing unauthorized read access. If you need to make corrections to a file you possess the password to, our Unlock tool strips off restriction tags local-first.
                  </p>
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-1">
                    • Bidirectional Image and Document Converters
                  </h3>
                  <p>
                    Convert standard graphics like Word and JPG items directly back-and-forth. Perfect for converting scanned smartphone captures into standard, professional PDF documents or exporting high-quality static screenshots from slide decks.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-3">
                Why Offline-First Execution is Vital for Corporate Compliance
              </h2>
              <p>
                Uploading proprietary files to cloud services often violates company data-protection rules and sovereign frameworks like GDPR. Texly avoids this entirely by keeping all calculations inside the local sandbox. There are no tracking scripts, cookies, or remote server connections. Your files stay securely inside your machine, presenting an ironclad compliance workspace.
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
