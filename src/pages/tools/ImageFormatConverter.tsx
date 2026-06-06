import React, { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Upload,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  X,
  ArrowRight,
  FileImage,
  Zap,
  Shield,
  Globe,
  ChevronDown,
  Info,
  Layers
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { addWatermarkToImage } from '../../utils/watermark';
import AIToolSEOContent from '../../components/AIToolSEOContent';
import SocialShare from '../../components/SocialShare';
import RatingSystem from '../../components/RatingSystem';
import { useToolSuccess, useToolFailure } from '../../components/TexlyAI';

// ─── Types ───────────────────────────────────────────────────────────────────

type OutputFormat = 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif' | 'image/bmp' | 'image/avif' | 'image/tiff';

interface FormatOption {
  label: string;
  mime: OutputFormat;
  ext: string;
  description: string;
  supportsTransparency: boolean;
  supportsQuality: boolean;
  badge?: string;
}

interface ConvertedFile {
  originalName: string;
  originalSize: number;
  originalUrl: string;
  convertedUrl: string;
  convertedBlob: Blob;
  convertedSize: number;
  outputFormat: FormatOption;
}

// ─── Format Definitions ───────────────────────────────────────────────────────

const FORMAT_OPTIONS: FormatOption[] = [
  {
    label: 'JPEG / JPG',
    mime: 'image/jpeg',
    ext: 'jpg',
    description: 'Best for photos. Smallest file size.',
    supportsTransparency: false,
    supportsQuality: true,
    badge: 'Popular',
  },
  {
    label: 'PNG',
    mime: 'image/png',
    ext: 'png',
    description: 'Lossless quality. Supports transparency.',
    supportsTransparency: true,
    supportsQuality: false,
    badge: 'Lossless',
  },
  {
    label: 'WebP',
    mime: 'image/webp',
    ext: 'webp',
    description: 'Modern format. 30% smaller than JPEG.',
    supportsTransparency: true,
    supportsQuality: true,
    badge: 'SEO Best',
  },
  {
    label: 'BMP',
    mime: 'image/bmp',
    ext: 'bmp',
    description: 'Uncompressed bitmap. Windows compatible.',
    supportsTransparency: false,
    supportsQuality: false,
  },
  {
    label: 'GIF',
    mime: 'image/gif',
    ext: 'gif',
    description: 'Animated & static. Supports transparency.',
    supportsTransparency: true,
    supportsQuality: false,
  },
  {
    label: 'AVIF',
    mime: 'image/avif',
    ext: 'avif',
    description: 'Next-gen format. Best compression.',
    supportsTransparency: true,
    supportsQuality: true,
    badge: 'Next-Gen',
  },
];

// ─── Helper ───────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getInputFormatLabel(file: File): string {
  const mime = file.type;
  const map: Record<string, string> = {
    'image/jpeg': 'JPG',
    'image/jpg': 'JPG',
    'image/png': 'PNG',
    'image/webp': 'WebP',
    'image/gif': 'GIF',
    'image/bmp': 'BMP',
    'image/avif': 'AVIF',
    'image/tiff': 'TIFF',
    'image/svg+xml': 'SVG',
  };
  return map[mime] || mime.split('/')[1]?.toUpperCase() || 'Unknown';
}

async function convertImage(
  file: File,
  targetFormat: FormatOption,
  quality: number
): Promise<{ blob: Blob; dataUrl: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(objectUrl);
        return reject(new Error('Canvas context unavailable'));
      }

      // White background for formats that don't support transparency
      if (!targetFormat.supportsTransparency) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(objectUrl);

      const q = targetFormat.supportsQuality ? quality : undefined;

      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error('Conversion failed'));
          const reader = new FileReader();
          reader.onload = (e) =>
            resolve({ blob, dataUrl: e.target?.result as string });
          reader.readAsDataURL(blob);
        },
        targetFormat.mime,
        q
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Could not load image'));
    };
    img.src = objectUrl;
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

const ImageFormatConverter: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [outputFormat, setOutputFormat] = useState<FormatOption>(FORMAT_OPTIONS[1]); // PNG default
  const [quality, setQuality] = useState(0.92);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ConvertedFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [formatDropdownOpen, setFormatDropdownOpen] = useState(false);

  const { celebrate } = useToolSuccess('image-format-converter');
  const { reportFailure } = useToolFailure('image-format-converter');

  // ── Dropzone ──
  const onDrop = useCallback((accepted: File[]) => {
    setError(null);
    setResults([]);
    const newFiles = accepted.slice(0, 10); // max 10
    setFiles(newFiles);

    const readers = newFiles.map(
      (f) =>
        new Promise<string>((res) => {
          const r = new FileReader();
          r.onload = (e) => res(e.target?.result as string);
          r.readAsDataURL(f);
        })
    );
    Promise.all(readers).then(setPreviews);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.avif', '.tiff', '.svg'],
    },
    multiple: true,
    maxSize: 50 * 1024 * 1024, // 50MB
  });

  const removeFile = (idx: number) => {
    setFiles((f) => f.filter((_, i) => i !== idx));
    setPreviews((p) => p.filter((_, i) => i !== idx));
    setResults((r) => r.filter((_, i) => i !== idx));
  };

  // ── Convert ──
  const handleConvert = async () => {
    if (!files.length) return;
    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const converted: ConvertedFile[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const { blob, dataUrl } = await convertImage(file, outputFormat, quality);

        converted.push({
          originalName: file.name,
          originalSize: file.size,
          originalUrl: previews[i],
          convertedUrl: dataUrl,
          convertedBlob: blob,
          convertedSize: blob.size,
          outputFormat,
        });
      }

      setResults(converted);
      celebrate();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Conversion failed. Please try again.');
      reportFailure();
    } finally {
      setLoading(false);
    }
  };

  // ── Download ──
  const downloadFile = async (result: ConvertedFile) => {
    try {
      const watermarkedBlob = await addWatermarkToImage(result.convertedUrl);
      const url = URL.createObjectURL(watermarkedBlob);
      const baseName = result.originalName.replace(/\.[^.]+$/, '');
      const link = document.createElement('a');
      link.href = url;
      link.download = `${baseName}-converted.${result.outputFormat.ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      // Fallback
      const url = URL.createObjectURL(result.convertedBlob);
      const baseName = result.originalName.replace(/\.[^.]+$/, '');
      const link = document.createElement('a');
      link.href = url;
      link.download = `${baseName}-converted.${result.outputFormat.ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const downloadAll = async () => {
    for (const r of results) {
      await downloadFile(r);
    }
  };

  const reset = () => {
    setFiles([]);
    setPreviews([]);
    setResults([]);
    setError(null);
  };

  // ── SEO Content for AIToolSEOContent ──
  const seoTool = {
    id: 'image-format-converter',
    name: 'Free Image Format Converter – Convert JPG to PNG, WebP, AVIF & More ⚡',
    description:
      'Convert images between JPG, PNG, WebP, GIF, BMP, AVIF formats online for free. Batch convert up to 10 images at once. No upload to server — 100% browser-based and private.',
    keywords: [
      'image format converter online free',
      'jpg to png converter',
      'png to webp converter',
      'convert image format online',
      'jpg to webp converter free',
      'batch image converter online',
      'avif converter free',
      'image type changer online',
    ],
    primaryKeyword: 'image format converter online free',
    secondaryKeywords: ['jpg to png converter', 'png to webp converter', 'convert image format online'],
    category: 'ai' as const,
    slug: 'image-format-converter',
    icon: 'FileImage',
    shortDescription:
      'Convert images between JPG, PNG, WebP, GIF, BMP, AVIF formats instantly. Batch support. 100% free & private.',
    process: (s: string) => s,
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
      {/* ── SEO HEAD ── */}
      <Helmet>
        <title>Image Format Converter – Free JPG to PNG, WebP, AVIF Online | Texly</title>
        <meta
          name="description"
          content="Convert images between JPG, PNG, WebP, GIF, BMP, and AVIF formats instantly online. Batch convert up to 10 images. 100% free, browser-based, no server upload."
        />
        <meta
          name="keywords"
          content="image format converter online free, jpg to png converter, png to webp, convert image format, jpg to webp free, avif converter, batch image converter, image type changer, image converter tool"
        />
        <link rel="canonical" href="https://texly.online/tools/image-format-converter" />
        <meta property="og:title" content="Image Format Converter – Free JPG to PNG, WebP, AVIF Online | Texly" />
        <meta
          property="og:description"
          content="Convert images between JPG, PNG, WebP, GIF, BMP, and AVIF instantly. Batch support, quality control, 100% browser-based."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://texly.online/tools/image-format-converter" />
        <meta property="og:image" content="https://texly.online/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Image Format Converter – Free Online | Texly" />
        <meta
          name="twitter:description"
          content="Convert JPG, PNG, WebP, GIF, BMP, AVIF online. Batch convert 10 images. 100% free & private."
        />
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'Image Format Converter',
            url: 'https://texly.online/tools/image-format-converter',
            description:
              'Free online image format converter. Convert JPG, PNG, WebP, GIF, BMP, AVIF formats instantly in your browser. Batch processing up to 10 images.',
            applicationCategory: 'MultimediaApplication',
            operatingSystem: 'Any',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
            featureList: [
              'JPG to PNG converter',
              'PNG to WebP converter',
              'JPG to WebP converter',
              'AVIF converter',
              'Batch image conversion',
              'Quality control slider',
              'Browser-based, no server upload',
            ],
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: 'How to convert JPG to PNG online for free?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Upload your JPG image on Texly\'s Image Format Converter, select PNG as the output format, and click Convert. Your PNG file will be ready to download instantly — 100% free, no signup.',
                },
              },
              {
                '@type': 'Question',
                name: 'Is this image format converter safe to use?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Yes. All image processing happens directly in your browser using the HTML5 Canvas API. Your images are never uploaded to any server, making it completely private and secure.',
                },
              },
              {
                '@type': 'Question',
                name: 'What image formats can I convert to?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'You can convert images to JPG, PNG, WebP, GIF, BMP, and AVIF formats. Input supports all common formats including TIFF and SVG.',
                },
              },
              {
                '@type': 'Question',
                name: 'Can I convert multiple images at once?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Yes! Texly\'s batch image converter supports up to 10 images at once. Upload multiple files and download them all in your chosen format.',
                },
              },
            ],
          })}
        </script>
      </Helmet>

      <div className="max-w-5xl mx-auto px-4 py-10 md:py-16 space-y-10">

        {/* ── HERO ── */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-widest">
            <FileImage className="w-4 h-4" />
            Image Tools
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight bg-gradient-to-b from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
            Image Format Converter
          </h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
            Convert images between <strong>JPG, PNG, WebP, GIF, BMP, AVIF</strong> formats instantly.
            Batch convert up to 10 images. 100% browser-based — your images never leave your device.
          </p>

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            {[
              { icon: <Shield className="w-3.5 h-3.5" />, text: '100% Private' },
              { icon: <Zap className="w-3.5 h-3.5" />, text: 'Instant Convert' },
              { icon: <Layers className="w-3.5 h-3.5" />, text: 'Batch 10 Images' },
              { icon: <Globe className="w-3.5 h-3.5" />, text: 'No Sign-up' },
            ].map((b) => (
              <span
                key={b.text}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400"
              >
                {b.icon}
                {b.text}
              </span>
            ))}
          </div>
        </div>

        {/* ── MAIN CARD ── */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 md:p-8 space-y-6">

          {/* ── DROPZONE ── */}
          {files.length === 0 && (
            <div
              {...getRootProps()}
              className={`relative border-2 border-dashed rounded-2xl p-10 md:p-16 text-center cursor-pointer transition-all duration-300
                ${isDragActive
                  ? 'border-blue-500 bg-blue-500/5'
                  : 'border-slate-300 dark:border-slate-700 hover:border-blue-400 hover:bg-blue-500/3'
                }`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-blue-500" />
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-800 dark:text-white">
                    {isDragActive ? 'Drop images here…' : 'Drop images or click to upload'}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    JPG, PNG, WebP, GIF, BMP, AVIF, TIFF, SVG • Up to 10 files • Max 50MB each
                  </p>
                </div>
                <button
                  type="button"
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-colors"
                >
                  Choose Images
                </button>
              </div>
            </div>
          )}

          {/* ── PREVIEW GRID ── */}
          {files.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-slate-800 dark:text-white text-sm">
                  {files.length} image{files.length > 1 ? 's' : ''} selected
                </h2>
                <button
                  onClick={reset}
                  className="text-xs text-slate-500 hover:text-red-500 flex items-center gap-1 transition-colors"
                >
                  <RefreshCw className="w-3 h-3" /> Reset
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {files.map((f, i) => (
                  <div
                    key={i}
                    className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 aspect-square bg-slate-100 dark:bg-slate-800"
                  >
                    <img
                      src={previews[i]}
                      alt={f.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={() => removeFile(i)}
                        className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
                      <p className="text-white text-[10px] font-bold truncate">{getInputFormatLabel(f)}</p>
                      <p className="text-slate-300 text-[9px] truncate">{formatBytes(f.size)}</p>
                    </div>
                  </div>
                ))}

                {/* Add more */}
                {files.length < 10 && (
                  <div
                    {...getRootProps()}
                    className="rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 aspect-square flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 transition-colors"
                  >
                    <input {...getInputProps()} />
                    <Upload className="w-5 h-5 text-slate-400" />
                    <span className="text-[10px] text-slate-400 mt-1">Add more</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── SETTINGS ── */}
          {files.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">

              {/* Output Format Picker */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  Convert To
                </label>
                <div className="relative">
                  <button
                    onClick={() => setFormatDropdownOpen(!formatDropdownOpen)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-left font-semibold text-sm"
                  >
                    <span className="flex items-center gap-2">
                      <FileImage className="w-4 h-4 text-blue-500" />
                      {outputFormat.label}
                      {outputFormat.badge && (
                        <span className="px-1.5 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] rounded-md font-bold">
                          {outputFormat.badge}
                        </span>
                      )}
                    </span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${formatDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {formatDropdownOpen && (
                    <div className="absolute top-full mt-2 left-0 right-0 z-20 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden">
                      {FORMAT_OPTIONS.map((fmt) => (
                        <button
                          key={fmt.mime}
                          onClick={() => {
                            setOutputFormat(fmt);
                            setFormatDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-4 py-3 text-sm text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors
                            ${outputFormat.mime === fmt.mime ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}
                        >
                          <span>
                            <span className="font-bold">{fmt.label}</span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">{fmt.description}</span>
                          </span>
                          {fmt.badge && (
                            <span className="px-1.5 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] rounded-md font-bold shrink-0 ml-2">
                              {fmt.badge}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  {outputFormat.description}
                  {!outputFormat.supportsTransparency && (
                    <span className="text-amber-500"> Transparency → white background.</span>
                  )}
                </p>
              </div>

              {/* Quality Slider */}
              {outputFormat.supportsQuality && (
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex justify-between">
                    <span>Quality</span>
                    <span className="text-blue-600 dark:text-blue-400">{Math.round(quality * 100)}%</span>
                  </label>
                  <input
                    type="range"
                    min={0.1}
                    max={1}
                    step={0.01}
                    value={quality}
                    onChange={(e) => setQuality(parseFloat(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Smaller file</span>
                    <span>Best quality</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── ERROR ── */}
          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {/* ── CONVERT BUTTON ── */}
          {files.length > 0 && results.length === 0 && (
            <button
              onClick={handleConvert}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 disabled:opacity-60 text-white font-black text-base rounded-2xl transition-all flex items-center justify-center gap-3 shadow-lg shadow-blue-500/25"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Converting {files.length} image{files.length > 1 ? 's' : ''}…
                </>
              ) : (
                <>
                  <ArrowRight className="w-5 h-5" />
                  Convert to {outputFormat.label}
                </>
              )}
            </button>
          )}

          {/* ── RESULTS ── */}
          {results.length > 0 && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-black">
                    {results.length} image{results.length > 1 ? 's' : ''} converted!
                  </span>
                </div>
                <div className="flex gap-2">
                  {results.length > 1 && (
                    <button
                      onClick={downloadAll}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download All
                    </button>
                  )}
                  <button
                    onClick={reset}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-sm font-bold transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Convert More
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {results.map((r, i) => {
                  const saving = r.originalSize - r.convertedSize;
                  const savingPct = Math.round((saving / r.originalSize) * 100);
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700"
                    >
                      {/* Thumbnail */}
                      <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0 bg-white">
                        <img src={r.convertedUrl} alt="" className="w-full h-full object-cover" />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-slate-800 dark:text-white truncate">
                          {r.originalName.replace(/\.[^.]+$/, '')}.{r.outputFormat.ext}
                        </p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-xs text-slate-500">{formatBytes(r.originalSize)}</span>
                          <ArrowRight className="w-3 h-3 text-slate-400" />
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                            {formatBytes(r.convertedSize)}
                          </span>
                          {savingPct !== 0 && (
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                                savingPct > 0
                                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                                  : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                              }`}
                            >
                              {savingPct > 0 ? `↓${savingPct}%` : `↑${Math.abs(savingPct)}%`}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Download */}
                      <button
                        onClick={() => downloadFile(r)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shrink-0"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── FORMAT GUIDE TABLE ── */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 md:p-8">
          <h2 className="text-xl font-black text-slate-800 dark:text-white mb-4">
            Image Format Comparison Guide
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-3 pr-4 font-bold text-slate-600 dark:text-slate-400">Format</th>
                  <th className="text-left py-3 pr-4 font-bold text-slate-600 dark:text-slate-400">Best For</th>
                  <th className="text-left py-3 pr-4 font-bold text-slate-600 dark:text-slate-400">Transparency</th>
                  <th className="text-left py-3 font-bold text-slate-600 dark:text-slate-400">File Size</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {[
                  { fmt: 'JPG / JPEG', best: 'Photos, social media', trans: '✗', size: 'Smallest' },
                  { fmt: 'PNG', best: 'Logos, screenshots, lossless', trans: '✓', size: 'Large' },
                  { fmt: 'WebP', best: 'Web images, SEO', trans: '✓', size: 'Small' },
                  { fmt: 'AVIF', best: 'Next-gen web, best compression', trans: '✓', size: 'Smallest' },
                  { fmt: 'GIF', best: 'Animations, simple graphics', trans: '✓', size: 'Medium' },
                  { fmt: 'BMP', best: 'Windows, uncompressed editing', trans: '✗', size: 'Very Large' },
                ].map((row) => (
                  <tr key={row.fmt} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 pr-4 font-bold text-slate-800 dark:text-white">{row.fmt}</td>
                    <td className="py-3 pr-4 text-slate-600 dark:text-slate-400">{row.best}</td>
                    <td className={`py-3 pr-4 font-bold ${row.trans === '✓' ? 'text-emerald-500' : 'text-slate-400'}`}>
                      {row.trans}
                    </td>
                    <td className="py-3 text-slate-600 dark:text-slate-400">{row.size}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── FAQ ── */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 md:p-8">
          <h2 className="text-xl font-black text-slate-800 dark:text-white mb-6">
            Frequently Asked Questions
          </h2>
          <div className="space-y-5">
            {[
              {
                q: 'How to convert JPG to PNG online for free?',
                a: 'Upload your JPG image, select PNG as the output format, click "Convert to PNG", and download your file. The conversion is instant and 100% free. No signup required.',
              },
              {
                q: 'Is my image data safe? Are images uploaded to a server?',
                a: 'Your images are 100% private. All conversion happens directly in your browser using the HTML5 Canvas API. Nothing is ever uploaded to our servers.',
              },
              {
                q: 'Which format should I use for my website images?',
                a: 'WebP is the best choice for website images — it\'s ~30% smaller than JPEG while maintaining quality, and is supported by all modern browsers. For maximum compatibility, use JPG for photos and PNG for graphics with transparency.',
              },
              {
                q: 'Can I convert multiple images at once?',
                a: 'Yes! You can batch convert up to 10 images at once. Upload all your images, select the output format, and download them all with a single click.',
              },
              {
                q: 'What is AVIF format and should I use it?',
                a: 'AVIF is a next-generation image format with the best compression ratio — up to 50% smaller than JPEG with equal quality. It\'s ideal for websites but has slightly lower browser support than WebP. Use it for modern web projects.',
              },
            ].map((faq, i) => (
              <div key={i} className="border-b border-slate-100 dark:border-slate-800 pb-5 last:border-0 last:pb-0">
                <h3 className="font-bold text-slate-800 dark:text-white mb-2">{faq.q}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── SEO CONTENT & SOCIAL ── */}
        <AIToolSEOContent tool={seoTool} />
        <SocialShare
          url="https://texly.online/tools/image-format-converter"
          title="Free Image Format Converter – Convert JPG to PNG, WebP, AVIF Online"
        />
        <RatingSystem toolId="image-format-converter" />
      </div>
    </div>
  );
};

export default ImageFormatConverter;
