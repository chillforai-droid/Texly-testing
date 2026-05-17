import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, 
  Download, 
  RefreshCw, 
  CheckCircle2,
  Sparkles,
  ImageIcon,
  X,
  Type,
  Layout,
  Settings2
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import AIToolSEOContent from '../../components/AIToolSEOContent';
import SocialShare from '../../components/SocialShare';
import RatingSystem from '../../components/RatingSystem';

const TAG_TYPES = [
  "Restored from Snapchat",
  "Restored from Camera Roll",
  "Custom Text"
];

const POSITIONS = [
  { id: 'top-left', label: 'Top Left' },
  { id: 'top-right', label: 'Top Right' },
  { id: 'bottom-left', label: 'Bottom Left' },
  { id: 'bottom-right', label: 'Bottom Right' },
  { id: 'center', label: 'Center' }
];

const SnapchatTagGenerator = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [tagText, setTagText] = useState(TAG_TYPES[0]);
  const [customText, setCustomText] = useState('');
  const [position, setPosition] = useState('top-left');
  const [opacity, setOpacity] = useState(0.6);
  const [scale, setScale] = useState(1.0);
  const [loading, setLoading] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const activeText = tagText === "Custom Text" ? customText : tagText;

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          imageRef.current = img;
          setOriginalImage(e.target?.result as string);
          generateTaggedImage(img);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }, [tagText, customText, position, opacity, scale]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false
  });

  const generateTaggedImage = (img: HTMLImageElement = imageRef.current!) => {
    if (!img || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions to match image
    canvas.width = img.width;
    canvas.height = img.height;

    // Draw original image
    ctx.drawImage(img, 0, 0);

    // Draw Snapchat Tag
    const text = activeText || "Restored from Snapchat";
    
    // Dynamic font size based on image width
    const fontSize = Math.max(16, Math.floor(img.width * 0.035 * scale));
    ctx.font = `500 ${fontSize}px "Inter", "Helvetica Neue", Helvetica, Arial, sans-serif`;
    
    const textMetrics = ctx.measureText(text);
    const textWidth = textMetrics.width;
    const textHeight = fontSize;
    
    const paddingH = fontSize * 0.8;
    const paddingV = fontSize * 0.4;
    
    const rectWidth = textWidth + (paddingH * 2);
    const rectHeight = textHeight + (paddingV * 2);
    const borderRadius = fontSize * 0.3;

    // Calculate Position
    let x = 0;
    let y = 0;
    const margin = img.width * 0.05;

    switch (position) {
      case 'top-left':
        x = margin;
        y = margin;
        break;
      case 'top-right':
        x = img.width - rectWidth - margin;
        y = margin;
        break;
      case 'bottom-left':
        x = margin;
        y = img.height - rectHeight - margin;
        break;
      case 'bottom-right':
        x = img.width - rectWidth - margin;
        y = img.height - rectHeight - margin;
        break;
      case 'center':
        x = (img.width - rectWidth) / 2;
        y = (img.height - rectHeight) / 2;
        break;
    }

    // Draw Background Rect
    ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
    drawRoundedRect(ctx, x, y, rectWidth, rectHeight, borderRadius);
    ctx.fill();

    // Draw Text
    ctx.fillStyle = 'white';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.fillText(text, x + rectWidth / 2, y + rectHeight / 2 + (fontSize * 0.05));

    setResultImage(canvas.toDataURL('image/jpeg', 0.95));
  };

  const drawRoundedRect = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  };

  useEffect(() => {
    if (imageRef.current) {
      generateTaggedImage();
    }
  }, [tagText, customText, position, opacity, scale]);

  const handleDownload = () => {
    if (!resultImage) return;
    const link = document.createElement('a');
    link.href = resultImage;
    link.download = `snapchat-restored-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-12 transition-colors duration-300">
      <Helmet>
        <title>Restored from Snapchat Tag Generator - Add Authentic Snapchat Tags | Texly</title>
        <meta name="description" content="Add 'Restored from Snapchat' or 'Restored from Camera Roll' tags to your images instantly. 100% free, authentic font and style." />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-400/10 text-yellow-600 dark:text-yellow-400 text-sm font-bold mb-6 border border-yellow-400/20"
          >
            <Sparkles className="w-4 h-4" />
            <span>AUTHENTIC SNAPCHAT STYLE</span>
          </motion.div>
          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">
            Snapchat <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">Tag Generator</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-medium">
            Add that classic "Restored from Snapchat" tag to your photos. Perfect for aesthetics and recreated vibes.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
              <div className="space-y-6">
                {/* Image Upload Area */}
                {!originalImage && (
                  <div 
                    {...getRootProps()}
                    className={`aspect-video rounded-3xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center p-6 text-center ${
                      isDragActive ? 'border-yellow-400 bg-yellow-400/5' : 'border-slate-200 dark:border-slate-800 hover:border-yellow-400/50 bg-slate-50 dark:bg-slate-800/50'
                    }`}
                  >
                    <input {...getInputProps()} />
                    <Upload className="w-10 h-10 text-slate-400 mb-4" />
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Click or drag image</p>
                    <p className="text-xs text-slate-400">Supports JPG, PNG, WEBP</p>
                  </div>
                )}

                {originalImage && (
                  <div className="space-y-6">
                    {/* Tag Text Selection */}
                    <div className="space-y-3">
                      <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                        <Type className="w-4 h-4 text-yellow-500" />
                        Tag Content
                      </label>
                      <select
                        value={tagText}
                        onChange={(e) => setTagText(e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-yellow-400 outline-none transition-all text-slate-900 dark:text-white"
                      >
                        {TAG_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      
                      {tagText === "Custom Text" && (
                        <input
                          type="text"
                          value={customText}
                          onChange={(e) => setCustomText(e.target.value)}
                          placeholder="Enter your tag..."
                          className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-yellow-400 outline-none transition-all text-slate-900 dark:text-white"
                        />
                      )}
                    </div>

                    {/* Position Selection */}
                    <div className="space-y-3">
                      <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                        <Layout className="w-4 h-4 text-orange-500" />
                        Tag Position
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {POSITIONS.map(pos => (
                          <button
                            key={pos.id}
                            onClick={() => setPosition(pos.id)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                              position === pos.id 
                                ? 'bg-yellow-400 border-yellow-400 text-slate-900' 
                                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-yellow-400/50'
                            }`}
                          >
                            {pos.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Advanced Settings */}
                    <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                         <Settings2 className="w-4 h-4 text-slate-400" />
                         Adjustments
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold text-slate-500 uppercase">
                          <span>Background Opacity</span>
                          <span>{Math.round(opacity * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0.1"
                          max="1.0"
                          step="0.05"
                          value={opacity}
                          onChange={(e) => setOpacity(Number(e.target.value))}
                          className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-yellow-400"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold text-slate-500 uppercase">
                          <span>Tag Scale</span>
                          <span>{scale.toFixed(1)}x</span>
                        </div>
                        <input
                          type="range"
                          min="0.5"
                          max="2.0"
                          step="0.1"
                          value={scale}
                          onChange={(e) => setScale(Number(e.target.value))}
                          className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-yellow-400"
                        />
                      </div>
                    </div>

                    {/* Reset Button */}
                    <button
                      onClick={() => { setOriginalImage(null); setResultImage(null); imageRef.current = null; }}
                      className="w-full py-4 rounded-2xl font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Upload New Image
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Result Area */}
          <div className="lg:col-span-8">
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none min-h-[500px] flex flex-col relative overflow-hidden">
              <AnimatePresence mode="wait">
                {resultImage ? (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex-grow flex flex-col pt-8"
                  >
                    <div className="px-8 pb-8 flex-grow flex items-center justify-center bg-slate-50 dark:bg-slate-950/50">
                      <div className="relative group">
                        <img
                          src={resultImage}
                          alt="Snapchat Tagged Result"
                          className="max-w-full max-h-[60vh] rounded-2xl shadow-2xl border border-white/5"
                        />
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={handleDownload}
                            className="p-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-xl shadow-xl text-yellow-600 hover:scale-110 transition-transform"
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
                            <h4 className="font-black text-slate-900 dark:text-white">Tag Added!</h4>
                            <p className="text-sm text-slate-500">Your authentic Snapchat style image is ready.</p>
                          </div>
                        </div>
                        <button
                          onClick={handleDownload}
                          className="w-full sm:w-auto px-8 py-4 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-black rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-yellow-400/20"
                        >
                          <Download className="w-5 h-5" />
                          DOWNLOAD
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div {...getRootProps()} className="flex-grow flex cursor-pointer">
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex-grow flex flex-col items-center justify-center p-12 text-center"
                    >
                      <input {...getInputProps()} />
                      <div className="w-24 h-24 rounded-[2.5rem] bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 dark:text-slate-700 mb-8 border-2 border-dashed border-slate-200 dark:border-slate-700">
                        <ImageIcon className="w-12 h-12" />
                      </div>
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4">Start by Uploading Image</h3>
                      <p className="text-slate-600 dark:text-slate-400 max-w-md">Drop your image here to add the "Restored from Snapchat" tag instantly.</p>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* Rating & Share */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-6 px-8">
              <RatingSystem toolId="snapchat-tag-generator" theme={{ border: 'slate-200' }} />
              <SocialShare 
                url={window.location.href}
                title="Add authentic Restored from Snapchat tags to your photos with Texly! ⚡"
              />
            </div>
          </div>
        </div>

        {/* Hidden Canvas for Processing */}
        <canvas ref={canvasRef} className="hidden" />

        {/* SEO Content Section */}
        <AIToolSEOContent toolId="snapchat-tag-generator" />
      </div>
    </div>
  );
};

export default SnapchatTagGenerator;
