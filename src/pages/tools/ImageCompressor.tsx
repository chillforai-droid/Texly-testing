import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import imageCompression from 'browser-image-compression';
import { 
  Upload, 
  Download, 
  RefreshCw, 
  AlertCircle,
  CheckCircle2,
  Zap,
  Info,
  ImageIcon,
  X,
  Sliders
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { addWatermarkToImage } from '../../utils/watermark';
import AIToolSEOContent from '../../components/AIToolSEOContent';
import SocialShare from '../../components/SocialShare';
import RatingSystem from '../../components/RatingSystem';

const ImageCompressor = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [compressedImage, setCompressedImage] = useState<string | null>(null);
  const [compressedFile, setCompressedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quality, setQuality] = useState(0.8);
  const [maxWidth, setMaxWidth] = useState(1920);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setOriginalFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setOriginalImage(e.target?.result as string);
      reader.readAsDataURL(file);
      setError(null);
      setCompressedImage(null);
      setCompressedFile(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false
  });

  const handleCompress = async () => {
    if (!originalFile) return;

    setLoading(true);
    setError(null);

    try {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: maxWidth,
        useWebWorker: true,
        initialQuality: quality,
      };

      const compressedBlob = await imageCompression(originalFile, options);
      setCompressedFile(compressedBlob);
      
      const reader = new FileReader();
      reader.onload = (e) => setCompressedImage(e.target?.result as string);
      reader.readAsDataURL(compressedBlob);
    } catch (err: any) {
      console.error("Compression failed:", err);
      setError("Failed to compress image. Please try different settings.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (compressedImage && compressedFile) {
      try {
        // Add watermark before download
        const watermarkedBlob = await addWatermarkToImage(compressedImage);
        const url = window.URL.createObjectURL(watermarkedBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `compressed-${originalFile?.name || 'image.jpg'}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (err) {
        console.error("Watermark/Download failed:", err);
        // Fallback to direct link
        const link = document.createElement('a');
        link.href = compressedImage;
        link.download = `compressed-${originalFile?.name || 'image.jpg'}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  };

  const reset = () => {
    setOriginalImage(null);
    setOriginalFile(null);
    setCompressedImage(null);
    setCompressedFile(null);
    setError(null);
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const compressionRatio = originalFile && compressedFile 
    ? ((1 - compressedFile.size / originalFile.size) * 100).toFixed(1)
    : null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white pt-32 pb-20 transition-colors duration-300">
      <Helmet>
        <title>Smart Image Compressor - Reduce Image Size Online | Texly</title>
        <meta name="description" content="Fast client-side image compressor. Reduce file size instantly without losing quality. 100% private processing in your browser." />
        <meta name="keywords" content="image compressor, reduce image size, compress photo online, optimize images, private image compression, texly ai" />
        <link rel="canonical" href="https://texly.online/tools/compressor" />
        <meta property="og:title" content="Smart Image Compressor - Reduce Image Size Online | Texly" />
        <meta property="og:description" content="Reduce image file size instantly while maintaining professional quality. 100% private." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://texly.online/tools/compressor" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Smart Image Compressor",
            "description": "Fast client-side image compressor for reducing file size without losing quality.",
            "applicationCategory": "MultimediaApplication",
            "operatingSystem": "All",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            }
          })}
        </script>
      </Helmet>

      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 text-sm font-bold mb-6">
              <Zap className="w-4 h-4" />
              Instant Client-Side Compression
            </div>
            <h1 className="text-4xl md:text-7xl font-black mb-6 tracking-tight text-slate-900 dark:text-white">
              Smart <span className="text-orange-600 dark:text-orange-500">Compressor</span>
            </h1>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
              Reduce image file size instantly while maintaining professional quality. All processing happens in your browser for maximum privacy.
            </p>
          </motion.div>
        </div>

        {/* Main Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Upload & Settings Section */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-sm font-black uppercase tracking-widest text-slate-500">
                  Upload Image
                </label>
                {originalImage && (
                  <button onClick={reset} className="text-slate-500 hover:text-white transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div 
                {...getRootProps()}
                className={`aspect-video rounded-[2rem] border-2 border-dashed transition-all cursor-pointer overflow-hidden relative group ${
                  originalImage ? 'border-orange-500/50' : isDragActive ? 'border-orange-500 bg-orange-500/5' : 'border-slate-200 dark:border-slate-800 hover:border-orange-500/50 bg-white dark:bg-slate-900/50'
                }`}
              >
                <input {...getInputProps()} />
                {originalImage ? (
                  <img src={originalImage} alt="Original" className="w-full h-full object-contain" />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Upload className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 font-bold mb-1">Drop image here</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">or click to browse</p>
                  </div>
                )}
              </div>
              {originalFile && (
                <div className="flex items-center gap-2 text-xs text-slate-500 font-bold">
                  <ImageIcon className="w-3 h-3" />
                  Original Size: {formatSize(originalFile.size)}
                </div>
              )}
            </div>

            {/* Settings */}
            <div className="p-8 rounded-[2rem] bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 backdrop-blur-sm space-y-6 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <Sliders className="w-5 h-5 text-orange-500" />
                <h3 className="font-black uppercase tracking-widest text-sm text-slate-600 dark:text-slate-300">Compression Settings</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-500 dark:text-slate-400 font-bold">Quality</span>
                    <span className="text-orange-600 dark:text-orange-500 font-black">{Math.round(quality * 100)}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0.1" 
                    max="1.0" 
                    step="0.1" 
                    value={quality}
                    onChange={(e) => setQuality(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-500 dark:text-slate-400 font-bold">Max Width</span>
                    <span className="text-orange-600 dark:text-orange-500 font-black">{maxWidth}px</span>
                  </div>
                  <select 
                    value={maxWidth}
                    onChange={(e) => setMaxWidth(parseInt(e.target.value))}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold outline-none focus:border-orange-500 transition-colors text-slate-900 dark:text-white"
                  >
                    <option value="800">800px (Web Optimized)</option>
                    <option value="1280">1280px (HD)</option>
                    <option value="1920">1920px (Full HD)</option>
                    <option value="3840">3840px (4K)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={handleCompress}
              disabled={!originalFile || loading}
              className={`w-full py-6 rounded-3xl font-black text-xl flex items-center justify-center gap-3 transition-all ${
                !originalFile || loading
                  ? 'bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                  : 'bg-orange-600 hover:bg-orange-500 text-white shadow-2xl shadow-orange-600/30 active:scale-[0.98]'
              }`}
            >
              {loading ? (
                <>
                  <RefreshCw className="w-6 h-6 animate-spin" />
                  Compressing...
                </>
              ) : (
                <>
                  <Zap className="w-6 h-6" />
                  Compress Image
                </>
              )}
            </button>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="p-5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-start gap-4"
                >
                  <AlertCircle className="w-6 h-6 shrink-0" />
                  <div>
                    <p className="font-black mb-1">Error</p>
                    <p className="text-sm opacity-80 leading-relaxed">{error}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Result Section */}
          <div className="relative">
            <div className="sticky top-32">
              <div className="aspect-video rounded-[3rem] bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 overflow-hidden relative flex items-center justify-center backdrop-blur-sm shadow-xl">
                <AnimatePresence mode="wait">
                  {compressedImage ? (
                    <motion.div
                      key="result"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="w-full h-full relative group"
                    >
                      <img src={compressedImage} alt="Result" className="w-full h-full object-contain" />
                    </motion.div>
                  ) : loading ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center gap-8"
                    >
                      <div className="w-24 h-24 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
                      <div className="text-center">
                        <p className="text-2xl font-black mb-2">Optimizing...</p>
                        <p className="text-slate-500">Reducing file size locally</p>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="text-center p-12">
                      <div className="w-24 h-24 rounded-[2.5rem] bg-slate-100 dark:bg-slate-900 flex items-center justify-center mx-auto mb-8 border border-slate-200 dark:border-slate-800">
                        <ImageIcon className="w-10 h-10 text-slate-400 dark:text-slate-700" />
                      </div>
                      <h3 className="text-2xl font-black text-slate-400 dark:text-slate-500 mb-3">Compressed Preview</h3>
                      <p className="text-slate-500 dark:text-slate-600 max-w-[240px] mx-auto">Upload an image and click compress to see the optimized result.</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>

              {/* Success Badge & Actions */}
              {compressedImage && compressedFile && (
                <div className="mt-6 flex flex-col gap-4">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="px-6 py-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl flex flex-col gap-2 shadow-xl"
                  >
                    <div className="flex items-center justify-center gap-2 font-black text-sm">
                      <CheckCircle2 className="w-5 h-5" />
                      COMPRESSION SUCCESSFUL
                    </div>
                    <div className="flex justify-center gap-4 text-xs font-bold opacity-80">
                      <span>New Size: {formatSize(compressedFile.size)}</span>
                      <span className="text-emerald-500">Saved: {compressionRatio}%</span>
                    </div>
                  </motion.div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={handleDownload}
                      className="py-4 bg-orange-600 hover:bg-orange-500 text-white rounded-2xl font-black flex items-center justify-center gap-2 transition-all shadow-xl shadow-orange-600/20"
                    >
                      <Download className="w-5 h-5" />
                      Download
                    </button>
                    <button 
                      onClick={reset}
                      className="py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-black flex items-center justify-center gap-2 transition-all"
                    >
                      <RefreshCw className="w-5 h-5" />
                      Start Over
                    </button>
                  </div>

                  <div className="p-6 bg-blue-50 dark:bg-blue-900/10 rounded-3xl border border-blue-100 dark:border-blue-900/20">
                    <SocialShare 
                      url="https://texly.online/tools/compressor" 
                      title="I just compressed my images without losing quality using Texly's Free AI Image Compressor! ⚡" 
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Privacy Note */}
        <div className="mt-20 p-8 rounded-[3rem] bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 text-center max-w-3xl mx-auto shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-6">
            <Info className="w-6 h-6 text-blue-500" />
          </div>
          <h4 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">100% Private & Secure</h4>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            Unlike other tools, our Smart Compressor processes your images directly in your browser using JavaScript. Your photos never leave your device and are never uploaded to any server.
          </p>
        </div>

        {/* SEO Content Section */}
        <AIToolSEOContent toolId="compressor" />
      </div>
    </div>
  );
};

export default ImageCompressor;
