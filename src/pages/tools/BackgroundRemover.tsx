import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  Image as ImageIcon, 
  Download, 
  RefreshCw, 
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Info,
  Trash2
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Client } from "@gradio/client";
import { addWatermarkToImage } from '../../utils/watermark';
import AIToolSEOContent from '../../components/AIToolSEOContent';
import BeforeAfterSlider from '../../components/BeforeAfterSlider';
import SocialShare from '../../components/SocialShare';
import RatingSystem from '../../components/RatingSystem';

const BackgroundRemover = () => {
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        setResultImage(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveBackground = async () => {
    if (!imageFile) return;

    setLoading(true);
    setError(null);
    setResultImage(null);
    setProgress(10);

    try {
      setProgress(20);
      
      const client = await Client.connect("Mahendra0160/RemoveBg");
      console.log("Connected to Gradio Client (RemoveBg)");
      
      const result = await client.predict("/remove_background", {
        image: imageFile
      });

      console.log("Gradio Result (RemoveBg):", result);

      setProgress(90);

      if (result.data && result.data[0]) {
        const output = result.data[0];
        const finalImageUrl = typeof output === 'string' ? output : (output as any).url;
        
        if (finalImageUrl) {
          setResultImage(finalImageUrl);
          setProgress(100);
        } else {
          throw new Error("Could not extract image URL from API response");
        }
      } else {
        throw new Error("Invalid response structure from Background Remover API");
      }
    } catch (err: any) {
      console.error("Detailed Error (RemoveBg):", err);
      setError(err.message || "An unexpected error occurred during processing");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (resultImage) {
      try {
        // Add watermark before download
        const watermarkedBlob = await addWatermarkToImage(resultImage);
        const url = window.URL.createObjectURL(watermarkedBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'texly-bg-removed.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (err) {
        console.error("Download failed:", err);
        // Fallback to direct link if fetch/watermark fails
        const link = document.createElement('a');
        link.href = resultImage;
        link.download = 'texly-bg-removed.png';
        link.target = '_blank';
        link.click();
      }
    }
  };

  const reset = () => {
    setImage(null);
    setImageFile(null);
    setResultImage(null);
    setError(null);
    setProgress(0);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white pt-32 pb-20 transition-colors duration-300">
      <Helmet>
        <title>Free AI Background Remover Online - Transparent PNG | Texly</title>
        <meta name="description" content="Remove backgrounds from any image instantly with high precision. Create transparent PNGs for free using our advanced AI segmentation tool." />
        <meta name="keywords" content="remove background, bg remover, transparent background, ai background removal, free bg remover, texly ai" />
        <link rel="canonical" href="https://texly.online/tools/bg-remover" />
        <meta property="og:title" content="Free AI Background Remover Online - Transparent PNG | Texly" />
        <meta property="og:description" content="Remove backgrounds from any image instantly with high precision. 100% free and secure." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://texly.online/tools/bg-remover" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "AI Background Remover",
            "description": "Remove backgrounds from any image instantly with high precision segmentation.",
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
            <h1 className="text-4xl md:text-6xl font-black mb-6 bg-gradient-to-r from-blue-600 to-blue-400 dark:from-blue-400 dark:to-cyan-500 bg-clip-text text-transparent">
              AI Background Remover
            </h1>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-lg">
              Remove backgrounds from any image instantly. 100% free, high precision, and processed on our secure servers.
            </p>
          </motion.div>
        </div>

        {/* Main Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Upload Section */}
          <div className="space-y-8">
            <div className="space-y-4">
              <label className="block text-sm font-black uppercase tracking-widest text-slate-500">
                Upload Image
              </label>
              <div 
                onClick={() => inputRef.current?.click()}
                className={`aspect-video rounded-3xl border-2 border-dashed transition-all cursor-pointer overflow-hidden relative group ${
                  image ? 'border-blue-500/50' : 'border-slate-200 dark:border-slate-800 hover:border-blue-500/30 bg-white dark:bg-slate-900/50'
                }`}
              >
                {image ? (
                  <>
                    <img src={image} alt="Original" className="w-full h-full object-contain bg-slate-100 dark:bg-slate-900" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <RefreshCw className="w-8 h-8 text-white" />
                    </div>
                  </>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center mb-4">
                      <Upload className="w-6 h-6 text-slate-400 dark:text-slate-500" />
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 font-bold">Click to upload image</p>
                    <p className="text-xs text-slate-400 dark:text-slate-600 mt-2">Supports JPG, PNG (Max 5MB)</p>
                  </div>
                )}
                <input 
                  type="file" 
                  ref={inputRef}
                  onChange={handleImageUpload}
                  className="hidden" 
                  accept="image/*"
                />
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={handleRemoveBackground}
              disabled={!image || loading}
              className={`w-full py-6 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all ${
                !image || loading
                  ? 'bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-600/20 active:scale-[0.98]'
              }`}
            >
              {loading ? (
                <>
                  <RefreshCw className="w-6 h-6 animate-spin" />
                  Removing Background...
                </>
              ) : (
                <>
                  <Trash2 className="w-6 h-6" />
                  Remove Background
                </>
              )}
            </button>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3"
                >
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p className="text-sm font-bold">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Info Card */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 backdrop-blur-sm shadow-sm">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                  <Info className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h4 className="font-bold mb-1 text-slate-900 dark:text-white">How it works</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Our AI uses deep learning to identify the main subject and separate it from the background. The result is a high-quality transparent PNG.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Result Section */}
          <div className="relative">
            <div className="sticky top-32">
              <div className="aspect-video rounded-[2.5rem] bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 overflow-hidden relative flex items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/checkerboard.png')] shadow-xl">
                <AnimatePresence mode="wait">
                  {resultImage ? (
                    <motion.div
                      key="result"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="w-full h-full relative group"
                    >
                      <BeforeAfterSlider 
                        beforeImage={image || ''} 
                        afterImage={resultImage} 
                        className="w-full h-full"
                      />
                    </motion.div>
                  ) : loading ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center gap-6"
                    >
                      <div className="relative">
                        <div className="w-24 h-24 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                        <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-blue-500" />
                      </div>
                      <div className="text-center">
                        <p className="text-xl font-black mb-2">AI is segmenting...</p>
                        <p className="text-slate-500 text-sm">Identifying subject and removing background</p>
                      </div>
                      <div className="w-48 h-2 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-blue-500"
                          animate={{ width: `${progress}%` }}
                        />
                      </div>
                    </motion.div>
                  ) : (
                    <div className="text-center p-12">
                      <div className="w-20 h-20 rounded-[2rem] bg-slate-100 dark:bg-slate-900 flex items-center justify-center mx-auto mb-6 border border-slate-200 dark:border-slate-800">
                        <ImageIcon className="w-10 h-10 text-slate-400 dark:text-slate-700" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-400 dark:text-slate-500 mb-2">Result Preview</h3>
                      <p className="text-slate-500 dark:text-slate-600 text-sm">Upload an image and click "Remove Background" to see the result.</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>

              {/* Success Badge & Actions */}
              {resultImage && (
                <div className="mt-6 flex flex-col gap-4">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="px-6 py-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-xl"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    BACKGROUND REMOVED SUCCESSFULLY
                  </motion.div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={handleDownload}
                      className="py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black flex items-center justify-center gap-2 transition-all shadow-xl shadow-blue-600/20"
                    >
                      <Download className="w-5 h-5" />
                      Download PNG
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
                      url="https://texly.online/tools/bg-remover" 
                      title="I just removed an image background instantly using Texly's Free AI BG Remover! ⚡" 
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SEO Content Section */}
        <AIToolSEOContent toolId="bg-remover" />
      </div>
    </div>
  );
};

export default BackgroundRemover;
