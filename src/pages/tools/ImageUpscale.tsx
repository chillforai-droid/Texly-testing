import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, 
  Download, 
  RefreshCw, 
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Info,
  ImageIcon,
  X,
  Maximize
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Client } from "@gradio/client";
import { addWatermarkToImage } from '../../utils/watermark';
import AIToolSEOContent from '../../components/AIToolSEOContent';
import BeforeAfterSlider from '../../components/BeforeAfterSlider';
import SocialShare from '../../components/SocialShare';
import RatingSystem from '../../components/RatingSystem';

const ImageUpscale = () => {
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [info, setInfo] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setImage(e.target?.result as string);
      reader.readAsDataURL(file);
      setError(null);
      setResultImage(null);
      setInfo(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false
  });

  const handleUpscale = async () => {
    if (!imageFile) return;

    setLoading(true);
    setError(null);
    setResultImage(null);
    setInfo(null);
    setProgress(10);

    try {
      setProgress(20);
      
      const client = await Client.connect("Mahendra0160/Image-Upscaler");
      console.log("Connected to Gradio Client (Upscaler)");
      
      const result = await client.predict("/upscale_image", {
        input_image: imageFile
      });

      console.log("Gradio Result (Upscaler):", result);

      setProgress(90);

      // The API returns [upscaled_image, information]
      if (result.data && result.data[0]) {
        const output = result.data[0];
        const finalImageUrl = typeof output === 'string' ? output : (output as any).url;
        
        if (finalImageUrl) {
          setResultImage(finalImageUrl);
          setInfo(result.data[1] as string);
          setProgress(100);
        } else {
          throw new Error("Could not extract image URL from API response");
        }
      } else {
        throw new Error("Invalid response structure from Image Upscaler API");
      }
    } catch (err: any) {
      console.error("Detailed Error (Upscaler):", err);
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
        link.download = 'texly-upscaled.jpg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (err) {
        console.error("Download failed:", err);
        // Fallback to direct link if fetch/watermark fails
        const link = document.createElement('a');
        link.href = resultImage;
        link.download = 'texly-upscaled.jpg';
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
    setInfo(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white pt-32 pb-20 transition-colors duration-300">
      <Helmet>
        <title>AI Image Upscaler Online - Increase Resolution for Free | Texly</title>
        <meta name="description" content="Professional AI Image Upscaler. Increase image resolution, sharpen details, and enhance quality instantly. Upscale your photos to 4K for free." />
        <meta name="keywords" content="image upscaler, ai photo upscale, increase resolution, enhance image quality, 4k image converter, texly ai" />
        <link rel="canonical" href="https://texly.online/tools/image-upscale" />
        <meta property="og:title" content="AI Image Upscaler Online - Increase Resolution for Free | Texly" />
        <meta property="og:description" content="Transform low-resolution photos into high-definition masterpieces instantly using AI." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://texly.online/tools/image-upscale" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "AI Image Upscaler",
            "description": "Professional AI Image Upscaler for increasing image resolution and sharpening details.",
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
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-sm font-bold mb-6">
              <Maximize className="w-4 h-4" />
              AI-Powered Resolution Boost
            </div>
            <h1 className="text-4xl md:text-7xl font-black mb-6 tracking-tight text-slate-900 dark:text-white">
              AI Image <span className="text-blue-600 dark:text-blue-500">Upscaler</span>
            </h1>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
              Increase image resolution and enhance quality instantly. Our AI intelligently reconstructs details for crystal clear results.
            </p>
          </motion.div>
        </div>

        {/* Main Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Upload Section */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-sm font-black uppercase tracking-widest text-slate-500">
                  Upload Image
                </label>
                {image && (
                  <button onClick={reset} className="text-slate-500 hover:text-white transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div 
                {...getRootProps()}
                className={`aspect-square rounded-[2rem] border-2 border-dashed transition-all cursor-pointer overflow-hidden relative group ${
                  image ? 'border-blue-500/50' : isDragActive ? 'border-blue-500 bg-blue-500/5' : 'border-slate-200 dark:border-slate-800 hover:border-blue-500/50 bg-white dark:bg-slate-900/50'
                }`}
              >
                <input {...getInputProps()} />
                {image ? (
                  <img src={image} alt="Source" className="w-full h-full object-contain" />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Upload className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 font-bold mb-1">Drop image here</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">or click to browse (Max 10MB)</p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={handleUpscale}
              disabled={!imageFile || loading}
              className={`w-full py-6 rounded-3xl font-black text-xl flex items-center justify-center gap-3 transition-all ${
                !imageFile || loading
                  ? 'bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-2xl shadow-blue-600/30 active:scale-[0.98]'
              }`}
            >
              {loading ? (
                <>
                  <RefreshCw className="w-6 h-6 animate-spin" />
                  Upscaling Image...
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6" />
                  Upscale Image
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
                    <p className="font-black mb-1">Processing Error</p>
                    <p className="text-sm opacity-80 leading-relaxed">{error}</p>
                  </div>
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
                  <h4 className="font-bold mb-1 text-slate-900 dark:text-white">AI Upscaling Technology</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Our advanced AI model increases resolution while preserving natural textures and details. Perfect for printing or high-resolution displays.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Result Section */}
          <div className="relative">
            <div className="sticky top-32">
              <div className="aspect-square rounded-[3rem] bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 overflow-hidden relative flex items-center justify-center backdrop-blur-sm shadow-xl">
                <AnimatePresence mode="wait">
                  {resultImage ? (
                    <motion.div
                      key="result"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
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
                      className="flex flex-col items-center gap-8"
                    >
                      <div className="relative">
                        <div className="w-32 h-32 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Sparkles className="w-10 h-10 text-blue-500 animate-pulse" />
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-black mb-2">Upscaling Image</p>
                        <p className="text-slate-500">Enhancing resolution via Neural Networks</p>
                      </div>
                      <div className="w-64 h-2 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                          animate={{ width: `${progress}%` }}
                        />
                      </div>
                    </motion.div>
                  ) : (
                    <div className="text-center p-12">
                      <div className="w-24 h-24 rounded-[2.5rem] bg-slate-100 dark:bg-slate-900 flex items-center justify-center mx-auto mb-8 border border-slate-200 dark:border-slate-800">
                        <ImageIcon className="w-10 h-10 text-slate-400 dark:text-slate-700" />
                      </div>
                      <h3 className="text-2xl font-black text-slate-400 dark:text-slate-500 mb-3">Upscaled Preview</h3>
                      <p className="text-slate-500 dark:text-slate-600 max-w-[240px] mx-auto">Upload an image and click upscale to see the high-resolution result.</p>
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
                    IMAGE UPSCALED SUCCESSFULLY
                  </motion.div>
                  
                  {info && (
                    <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded-2xl text-xs text-slate-500 font-mono">
                      {info}
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={handleDownload}
                      className="py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black flex items-center justify-center gap-2 transition-all shadow-xl shadow-blue-600/20"
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
                      url="https://texly.online/tools/image-upscale" 
                      title="I just upscaled my photo resolution instantly using Texly's Free AI Image Upscaler! ⚡" 
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SEO Content Section */}
        <AIToolSEOContent toolId="image-upscale" />
      </div>
    </div>
  );
};

export default ImageUpscale;
