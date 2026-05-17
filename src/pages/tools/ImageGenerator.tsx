import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, 
  RefreshCw, 
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Info,
  ImageIcon,
  X,
  Palette,
  Settings2,
  Maximize2,
  Type,
  Layout,
  Zap,
  Dice5,
  Wand2
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Client } from "@gradio/client";
import AIToolSEOContent from '../../components/AIToolSEOContent';
import SocialShare from '../../components/SocialShare';
import RatingSystem from '../../components/RatingSystem';

const PLATFORMS = [
  "🎨 Square (1:1)",
  "📱 Instagram Portrait (4:5)",
  "📸 Story/Reels (9:16)",
  "💻 Widescreen (16:9)",
  "🖼️ Landscape (3:2)",
  "📐 Portrait (2:3)"
];

const QUALITIES = [
  "🚀 Fast (Good)",
  "✨ High Quality (Better)",
  "💎 Ultra HD (Best)"
];

const ImageGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('cartoon, anime, illustration, painting, drawing, blurry, low quality, ugly, bad anatomy');
  const [platform, setPlatform] = useState(PLATFORMS[0]);
  const [quality, setQuality] = useState(QUALITIES[0]);
  const [width, setWidth] = useState(512);
  const [height, setHeight] = useState(512);
  const [steps, setSteps] = useState(4);
  const [guidance, setGuidance] = useState(1.0);
  const [seed, setSeed] = useState(-1);
  const [enhancePrompt, setEnhancePrompt] = useState(true);
  
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [resultMarkdown, setResultMarkdown] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handlePlatformChange = async (choice: string) => {
    setPlatform(choice);
    try {
      const client = await Client.connect("Mahendra0160/FreeImageGenerate");
      const result = await client.predict("/on_platform_change", { choice });
      if (result.data) {
        setWidth(result.data[0] as number);
        setHeight(result.data[1] as number);
      }
    } catch (err) {
      console.error("Error updating platform dimensions:", err);
    }
  };

  const handleQualityChange = async (choice: string) => {
    setQuality(choice);
    try {
      const client = await Client.connect("Mahendra0160/FreeImageGenerate");
      const result = await client.predict("/on_quality_change", { choice });
      if (result.data) {
        setSteps(result.data[0] as number);
        setGuidance(result.data[1] as number);
      }
    } catch (err) {
      console.error("Error updating quality settings:", err);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setLoading(true);
    setError(null);
    setResultImage(null);
    setResultMarkdown(null);
    setProgress(10);

    try {
      setProgress(20);
      const client = await Client.connect("Mahendra0160/FreeImageGenerate");
      console.log("Connected to Gradio Client (Image Generator)");
      
      setProgress(40);
      const result = await client.predict("/generate_image", {
        prompt,
        negative_prompt: negativePrompt,
        platform_choice: platform,
        quality_choice: quality,
        custom_width: width,
        custom_height: height,
        custom_steps: steps,
        custom_guidance: guidance,
        seed: seed,
        enhance_prompt: enhancePrompt,
      });

      console.log("Gradio Result (Image Generator):", result);

      setProgress(90);

      if (result.data && result.data[0]) {
        const output = result.data[0];
        const finalImageUrl = typeof output === 'string' ? output : (output as any).url;
        
        if (finalImageUrl) {
          setResultImage(finalImageUrl);
          setResultMarkdown(result.data[1] as string);
          setProgress(100);
        } else {
          throw new Error("Could not extract image URL from API response");
        }
      } else {
        throw new Error("Invalid response structure from Image Generator API");
      }
    } catch (err: any) {
      console.error("Detailed Error (Image Generator):", err);
      setError(err.message || "An unexpected error occurred during generation");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!resultImage) return;
    const link = document.createElement('a');
    link.href = resultImage;
    link.download = `texly-ai-generated-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-12 transition-colors duration-300">
      <Helmet>
        <title>Free AI Image Generator - Create Stunning Art from Text | Texly</title>
        <meta name="description" content="Generate high-quality images from text descriptions instantly using Texly's Free AI Image Generator. 100% free, no sign-up required." />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-bold mb-6 border border-blue-100 dark:border-blue-800"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI POWERED GENERATION</span>
          </motion.div>
          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">
            Free AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Image Generator</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-medium">
            Turn your imagination into reality. Enter a prompt and watch our AI create stunning artwork for you in seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
              <div className="space-y-6">
                {/* Prompt Input */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                    <Type className="w-4 h-4 text-blue-500" />
                    What do you want to create?
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., A futuristic city with neon lights, digital art style..."
                    className="w-full h-32 px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none text-slate-900 dark:text-white placeholder:text-slate-400"
                  />
                </div>

                {/* Platform Selection */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                    <Layout className="w-4 h-4 text-purple-500" />
                    Aspect Ratio
                  </label>
                  <select
                    value={platform}
                    onChange={(e) => handlePlatformChange(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-900 dark:text-white"
                  >
                    {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>

                {/* Quality Selection */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                    <Zap className="w-4 h-4 text-amber-500" />
                    Quality Preset
                  </label>
                  <select
                    value={quality}
                    onChange={(e) => handleQualityChange(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-900 dark:text-white"
                  >
                    {QUALITIES.map(q => <option key={q} value={q}>{q}</option>)}
                  </select>
                </div>

                {/* Advanced Toggle */}
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center justify-between w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Settings2 className="w-4 h-4" />
                    Advanced Settings
                  </div>
                  <motion.div
                    animate={{ rotate: showAdvanced ? 180 : 0 }}
                  >
                    <X className={`w-4 h-4 transform ${showAdvanced ? '' : 'rotate-45'}`} />
                  </motion.div>
                </button>

                {/* Advanced Settings */}
                <AnimatePresence>
                  {showAdvanced && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden space-y-6 pt-2"
                    >
                      {/* Negative Prompt */}
                      <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          Negative Prompt (What to avoid)
                        </label>
                        <textarea
                          value={negativePrompt}
                          onChange={(e) => setNegativePrompt(e.target.value)}
                          className="w-full h-24 px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none text-sm text-slate-900 dark:text-white"
                        />
                      </div>

                      {/* Dimensions */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase">Width</label>
                          <input
                            type="number"
                            value={width}
                            onChange={(e) => setWidth(Number(e.target.value))}
                            className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase">Height</label>
                          <input
                            type="number"
                            value={height}
                            onChange={(e) => setHeight(Number(e.target.value))}
                            className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                          />
                        </div>
                      </div>

                      {/* Steps & Guidance */}
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs font-bold text-slate-500 uppercase">
                            <span>Steps</span>
                            <span>{steps}</span>
                          </div>
                          <input
                            type="range"
                            min="1"
                            max="50"
                            value={steps}
                            onChange={(e) => setSteps(Number(e.target.value))}
                            className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs font-bold text-slate-500 uppercase">
                            <span>Guidance Scale</span>
                            <span>{guidance.toFixed(1)}</span>
                          </div>
                          <input
                            type="range"
                            min="0.1"
                            max="20"
                            step="0.1"
                            value={guidance}
                            onChange={(e) => setGuidance(Number(e.target.value))}
                            className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
                          />
                        </div>
                      </div>

                      {/* Seed */}
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase">
                          <Dice5 className="w-3 h-3" />
                          Seed (-1 for random)
                        </label>
                        <input
                          type="number"
                          value={seed}
                          onChange={(e) => setSeed(Number(e.target.value))}
                          className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                        />
                      </div>

                      {/* Enhance Toggle */}
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={enhancePrompt}
                            onChange={(e) => setEnhancePrompt(e.target.checked)}
                            className="sr-only"
                          />
                          <div className={`w-10 h-6 rounded-full transition-colors ${enhancePrompt ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`} />
                          <div className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform ${enhancePrompt ? 'translate-x-4' : ''}`} />
                        </div>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-blue-600 transition-colors">
                          Auto-Enhance Prompt
                        </span>
                      </label>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Generate Button */}
                <button
                  onClick={handleGenerate}
                  disabled={loading || !prompt.trim()}
                  className={`w-full py-4 rounded-2xl font-black text-white flex items-center justify-center gap-3 transition-all ${
                    loading || !prompt.trim()
                      ? 'bg-slate-200 dark:bg-slate-800 cursor-not-allowed text-slate-400'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg hover:shadow-blue-600/25 active:scale-[0.98]'
                  }`}
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>GENERATING...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-5 h-5" />
                      <span>GENERATE IMAGE</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Result Area */}
          <div className="lg:col-span-8">
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none min-h-[600px] flex flex-col relative overflow-hidden">
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-grow flex flex-col items-center justify-center p-12 text-center"
                  >
                    <div className="relative w-24 h-24 mb-8">
                      <div className="absolute inset-0 border-4 border-blue-600/10 rounded-full"></div>
                      <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <Palette className="absolute inset-0 m-auto w-8 h-8 text-blue-600 animate-pulse" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4">Creating Your Masterpiece</h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md">Our AI is processing your prompt and generating a high-quality image. This usually takes 5-10 seconds.</p>
                    <div className="w-full max-w-xs bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-blue-600 to-purple-600"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                      />
                    </div>
                  </motion.div>
                ) : resultImage ? (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex-grow flex flex-col"
                  >
                    <div className="p-8 flex-grow flex items-center justify-center bg-slate-50 dark:bg-slate-950/50">
                      <div className="relative group">
                        <img
                          src={resultImage}
                          alt="AI Generated"
                          className="max-w-full max-h-[70vh] rounded-2xl shadow-2xl border border-white/10"
                        />
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={handleDownload}
                            className="p-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-xl shadow-xl text-blue-600 hover:scale-110 transition-transform"
                            title="Download Image"
                          >
                            <Download className="w-6 h-6" />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-8 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                            <CheckCircle2 className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="font-black text-slate-900 dark:text-white">Generation Complete!</h4>
                            <p className="text-sm text-slate-500">Your image is ready for download.</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                          <button
                            onClick={handleDownload}
                            className="flex-grow sm:flex-grow-0 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20"
                          >
                            <Download className="w-5 h-5" />
                            DOWNLOAD
                          </button>
                          <button
                            onClick={() => {
                              setResultImage(null);
                              setResultMarkdown(null);
                            }}
                            className="p-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-2xl transition-all"
                            title="Generate Another"
                          >
                            <RefreshCw className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                      
                      {resultMarkdown && (
                        <div className="mt-8 p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                          <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                            <Info className="w-4 h-4 text-blue-500" />
                            Generation Info
                          </div>
                          <div className="text-sm text-slate-600 dark:text-slate-400 prose prose-slate dark:prose-invert max-w-none">
                            {resultMarkdown}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ) : error ? (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex-grow flex flex-col items-center justify-center p-12 text-center"
                  >
                    <div className="w-20 h-20 rounded-3xl bg-red-500/10 flex items-center justify-center text-red-500 mb-6">
                      <AlertCircle className="w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4">Generation Failed</h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md">{error}</p>
                    <button
                      onClick={() => setError(null)}
                      className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:scale-105 transition-transform"
                    >
                      Try Again
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex-grow flex flex-col items-center justify-center p-12 text-center"
                  >
                    <div className="w-24 h-24 rounded-[2.5rem] bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 dark:text-slate-700 mb-8 border-2 border-dashed border-slate-200 dark:border-slate-700">
                      <ImageIcon className="w-12 h-12" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4">Ready to Create?</h3>
                    <p className="text-slate-600 dark:text-slate-400 max-w-md">Enter a prompt in the sidebar and click generate to see the magic happen.</p>
                    
                    <div className="mt-12 grid grid-cols-2 gap-4 w-full max-w-lg">
                      {[
                        "A majestic lion wearing a crown, oil painting style",
                        "Cyberpunk street market at night, highly detailed",
                        "Cute baby dragon sitting on a gold pile, 3D render",
                        "Serene mountain lake at sunrise, realistic photo"
                      ].map((suggestion, i) => (
                        <button
                          key={i}
                          onClick={() => setPrompt(suggestion)}
                          className="p-4 text-left text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 hover:text-blue-600 transition-all"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Rating & Share */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-6 px-8">
              <RatingSystem toolId="image-generator" theme={{ border: 'slate-200' }} />
              <SocialShare 
                url={window.location.href}
                title="Check out this amazing Free AI Image Generator on Texly!"
              />
            </div>
          </div>
        </div>

        {/* SEO Content Section */}
        <AIToolSEOContent toolId="image-generator" />
      </div>
    </div>
  );
};

export default ImageGenerator;
