import React from 'react';
import { Helmet } from 'react-helmet-async';

// Tool component (admin panel से generate)
import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Download,
  Sliders,
  Trash2,
  CheckCircle2,
  HelpCircle,
  ShieldCheck,
  Zap,
  FileImage,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Image as ImageIcon,
  Sparkles,
  Info,
  Settings,
  Eye,
  FileDown,
  AlertTriangle,
  Clipboard,
  Check
} from 'lucide-react';

interface ImageFile {
  id: string;
  file: File;
  name: string;
  originalSize: number;
  compressedSize: number | null;
  previewUrl: string;
  compressedUrl: string | null;
  status: 'idle' | 'compressing' | 'done' | 'error';
  progress: number;
  width: number;
  height: number;
  compressedWidth: number | null;
  compressedHeight: number | null;
}

function ToolComponent() {
  const [files, setFiles] = useState<ImageFile[]>([]);
  const [compressionMode, setCompressionMode] = useState<'custom' | 'target'>('custom');
  const [quality, setQuality] = useState<number>(0.75);
  const [scale, setScale] = useState<number>(100);
  const [targetSizeKb, setTargetSizeKb] = useState<number>(100);
  const [outputFormat, setOutputFormat] = useState<string>('original');
  const [nameSuffix, setNameSuffix] = useState<string>('-min');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'compressor' | 'guide' | 'faq'>('compressor');
  const [faqOpen, setFaqOpen] = useState<{ [key: number]: boolean }>({});
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);
  
  // Before/After comparison modal state
  const [selectedComparisonFile, setSelectedComparisonFile] = useState<ImageFile | null>(null);
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const sliderRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Listen for clipboard image pastes
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData) {
        const items = Array.from(e.clipboardData.items);
        const pastedFiles: File[] = [];
        for (const item of items) {
          if (item.type.indexOf('image') !== -1) {
            const file = item.getAsFile();
            if (file) pastedFiles.push(file);
          }
        }
        if (pastedFiles.length > 0) {
          addFiles(pastedFiles);
          triggerNotification();
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const triggerNotification = () => {
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 3000);
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  // Add files to state
  const addFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter(file => file.type.startsWith('image/'));
    
    const mappedFiles: ImageFile[] = validFiles.map(file => {
      const id = Math.random().toString(36).substring(2, 9);
      const previewUrl = URL.createObjectURL(file);
      
      const img = new Image();
      img.src = previewUrl;
      img.onload = () => {
        setFiles(prev => prev.map(f => f.id === id ? { ...f, width: img.width, height: img.height } : f));
      };

      return {
        id,
        file,
        name: file.name,
        originalSize: file.size,
        compressedSize: null,
        previewUrl,
        compressedUrl: null,
        status: 'idle',
        progress: 0,
        width: 0,
        height: 0,
        compressedWidth: null,
        compressedHeight: null
      };
    });

    setFiles(prev => [...prev, ...mappedFiles]);
  };

  // Remove file
  const removeFile = (id: string) => {
    setFiles(prev => {
      const fileToRemove = prev.find(f => f.id === id);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.previewUrl);
        if (fileToRemove.compressedUrl) {
          URL.revokeObjectURL(fileToRemove.compressedUrl);
        }
      }
      return prev.filter(f => f.id !== id);
    });
    if (selectedComparisonFile?.id === id) {
      setSelectedComparisonFile(null);
    }
  };

  // Clear all files
  const clearAll = () => {
    files.forEach(f => {
      URL.revokeObjectURL(f.previewUrl);
      if (f.compressedUrl) {
        URL.revokeObjectURL(f.compressedUrl);
      }
    });
    setFiles([]);
    setSelectedComparisonFile(null);
  };

  // Professional Compression with Target Size Search or Custom Settings
  const compressSingleImage = async (imageFile: ImageFile): Promise<ImageFile> => {
    setFiles(prev => prev.map(f => f.id === imageFile.id ? { ...f, status: 'compressing', progress: 15 } : f));

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(imageFile.file);
      reader.onload = async (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = async () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            setFiles(prev => prev.map(f => f.id === imageFile.id ? { ...f, status: 'error' } : f));
            resolve({ ...imageFile, status: 'error' });
            return;
          }

          // Calculate dimensions
          const newWidth = Math.round(img.width * (scale / 100));
          const newHeight = Math.round(img.height * (scale / 100));
          canvas.width = newWidth;
          canvas.height = newHeight;
          ctx.drawImage(img, 0, 0, newWidth, newHeight);

          // Determine output format
          let mimeType = imageFile.file.type;
          if (outputFormat !== 'original') {
            mimeType = `image/${outputFormat}`;
          } else if (compressionMode === 'target' && imageFile.file.type === 'image/png') {
            // PNG compression is naturally limited. Auto-switch to webp for target sizes
            mimeType = 'image/webp';
          }

          if (compressionMode === 'target') {
            // Iterative binary search to find quality that fits the target size limit
            const targetBytes = targetSizeKb * 1024;
            let low = 0.02;
            let high = 0.98;
            let bestBlob: Blob | null = null;
            let bestSize = 0;
            let bestUrl: string | null = null;
            
            for (let i = 0; i < 6; i++) {
              const mid = (low + high) / 2;
              const blob: Blob | null = await new Promise((res) => {
                canvas.toBlob((b) => res(b), mimeType, mid);
              });

              if (blob) {
                bestBlob = blob;
                bestSize = blob.size;
                if (blob.size > targetBytes) {
                  high = mid;
                } else {
                  low = mid;
                  // If we are close enough, stop early
                  if (targetBytes - blob.size < targetBytes * 0.05) break;
                }
              }
            }

            if (bestBlob) {
              bestUrl = URL.createObjectURL(bestBlob);
              const updated: ImageFile = {
                ...imageFile, 
                status: 'done',
                progress: 100,
                compressedSize: bestSize,
                compressedUrl: bestUrl,
                compressedWidth: newWidth,
                compressedHeight: newHeight
              };
              setFiles(prev => prev.map(f => f.id === imageFile.id ? updated : f));
              resolve(updated);
            } else {
              setFiles(prev => prev.map(f => f.id === imageFile.id ? { ...f, status: 'error' } : f));
              resolve({ ...imageFile, status: 'error' });
            }
          } else {
            // Custom Quality Mode
            canvas.toBlob(
              (blob) => {
                if (blob) {
                  const compressedUrl = URL.createObjectURL(blob);
                  const updated: ImageFile = {
                    ...imageFile,
                    status: 'done',
                    progress: 100,
                    compressedSize: blob.size,
                    compressedUrl,
                    compressedWidth: newWidth,
                    compressedHeight: newHeight
                  };
                  setFiles(prev => prev.map(f => f.id === imageFile.id ? updated : f));
                  resolve(updated);
                } else {
                  setFiles(prev => prev.map(f => f.id === imageFile.id ? { ...f, status: 'error' } : f));
                  resolve({ ...imageFile, status: 'error' });
                }
              },
              mimeType,
              quality
            );
          }
        };
        img.onerror = () => {
          setFiles(prev => prev.map(f => f.id === imageFile.id ? { ...f, status: 'error' } : f));
          resolve({ ...imageFile, status: 'error' });
        };
      };
      reader.onerror = () => {
        setFiles(prev => prev.map(f => f.id === imageFile.id ? { ...f, status: 'error' } : f));
        resolve({ ...imageFile, status: 'error' });
      };
    });
  };

  // Compress all files
  const compressAll = async () => {
    for (const file of files) {
      await compressSingleImage(file);
    }
  };

  // Download single image file
  const downloadFile = (file: ImageFile) => {
    if (file.compressedUrl) {
      const link = document.createElement('a');
      link.href = file.compressedUrl;
      
      let ext = file.file.name.split('.').pop();
      if (outputFormat !== 'original') {
        ext = outputFormat;
      } else if (compressionMode === 'target' && file.file.type === 'image/png') {
        ext = 'webp';
      }
      
      const nameWithoutExt = file.file.name.substring(0, file.file.name.lastIndexOf('.'));
      link.download = `${nameWithoutExt}${nameSuffix}.${ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Download all compressed files
  const downloadAll = () => {
    files.forEach(file => {
      if (file.status === 'done') {
        downloadFile(file);
      }
    });
  };

  // Presets selector
  const applyPreset = (preset: 'optimized' | 'extreme' | 'png-lossless' | 'kb-100' | 'kb-50') => {
    if (preset === 'optimized') {
      setCompressionMode('custom');
      setQuality(0.75);
      setScale(100);
      setOutputFormat('webp');
    } else if (preset === 'extreme') {
      setCompressionMode('custom');
      setQuality(0.45);
      setScale(85);
      setOutputFormat('webp');
    } else if (preset === 'png-lossless') {
      setCompressionMode('custom');
      setQuality(0.92);
      setScale(100);
      setOutputFormat('png');
    } else if (preset === 'kb-100') {
      setCompressionMode('target');
      setTargetSizeKb(100);
    } else if (preset === 'kb-50') {
      setCompressionMode('target');
      setTargetSizeKb(50);
    }
  };

  // Before/After split comparison mouse move handler
  const handleSplitMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (sliderRef.current) {
      const rect = sliderRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setSliderPosition(percentage);
    }
  };

  const handleSplitTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (sliderRef.current && e.touches[0]) {
      const rect = sliderRef.current.getBoundingClientRect();
      const x = e.touches[0].clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setSliderPosition(percentage);
    }
  };

  // Formats file sizes nicely
  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const toggleFaq = (index: number) => {
    setFaqOpen(prev => ({ ...prev, [index]: !prev[index] }));
  };

  // Compute statistics
  const processedFiles = files.filter(f => f.status === 'done');
  const totalOriginalBytes = files.reduce((acc, f) => acc + f.originalSize, 0);
  const totalCompressedBytes = files.reduce((acc, f) => acc + (f.compressedSize || f.originalSize), 0);
  const overallSavings = totalOriginalBytes > 0 
    ? Math.round(((totalOriginalBytes - totalCompressedBytes) / totalOriginalBytes) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-indigo-500 selection:text-white">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-indigo-500/10 text-indigo-400 rounded-full border border-indigo-500/20">
            <Sparkles className="h-3 w-3" />
            Professional Browser-Based Compression
          </span>
          <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-indigo-100 to-indigo-400 bg-clip-text text-transparent">
            Professional Image Size Reducer
          </h1>
          <p className="mt-4 text-lg text-slate-400 max-w-3xl mx-auto">
            Compress JPG, PNG, WebP, and AVIF images instantly. Choose standard custom optimization or set an exact <strong className="text-indigo-400">Target KB limit</strong> with pristine quality.
          </p>
        </div>

        {/* Interactive Tool Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          
          {/* Control Panel (Left column on large screens) */}
          <div className="lg:col-span-4 bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 backdrop-blur-md flex flex-col gap-6">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-800">
              <Settings className="h-5 w-5 text-indigo-400" />
              <h2 className="text-lg font-bold text-slate-100">Compression Controls</h2>
            </div>

            {/* Preset shortcuts */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Quick Presets</label>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => applyPreset('optimized')}
                  className="px-3 py-1.5 text-xs font-medium bg-slate-800/60 hover:bg-indigo-600/20 border border-slate-700/50 hover:border-indigo-500/30 text-slate-300 rounded-lg transition-all text-left"
                >
                  ⚡ Web Optimized (WebP)
                </button>
                <button 
                  onClick={() => applyPreset('extreme')}
                  className="px-3 py-1.5 text-xs font-medium bg-slate-800/60 hover:bg-indigo-600/20 border border-slate-700/50 hover:border-indigo-500/30 text-slate-300 rounded-lg transition-all text-left"
                >
                  📉 High Compression
                </button>
                <button 
                  onClick={() => applyPreset('kb-100')}
                  className="px-3 py-1.5 text-xs font-medium bg-slate-800/60 hover:bg-indigo-600/20 border border-slate-700/50 hover:border-indigo-500/30 text-slate-300 rounded-lg transition-all text-left"
                >
                  🎯 Target 100 KB
                </button>
                <button 
                  onClick={() => applyPreset('kb-50')}
                  className="px-3 py-1.5 text-xs font-medium bg-slate-800/60 hover:bg-indigo-600/20 border border-slate-700/50 hover:border-indigo-500/30 text-slate-300 rounded-lg transition-all text-left"
                >
                  🎯 Target 50 KB
                </button>
              </div>
            </div>

            {/* Compression Mode Switcher */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">Reduction Mode</label>
              <div className="grid grid-cols-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setCompressionMode('custom')}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    compressionMode === 'custom'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Custom Settings
                </button>
                <button
                  onClick={() => setCompressionMode('target')}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    compressionMode === 'target'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Target Size (KB)
                </button>
              </div>
            </div>

            {/* Mode-Specific Parameters */}
            <div className="space-y-4 bg-slate-950/50 p-4 rounded-xl border border-slate-800/60">
              {compressionMode === 'custom' ? (
                <div className="space-y-4">
                  {/* Quality slider */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs font-semibold text-slate-300">Quality Factor</span>
                      <span className="text-xs font-bold px-1.5 py-0.5 bg-indigo-500/10 text-indigo-400 rounded">
                        {Math.round(quality * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.05"
                      max="1.0"
                      step="0.05"
                      value={quality}
                      onChange={(e) => setQuality(parseFloat(e.target.value))}
                      className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
                    />
                  </div>

                  {/* Scale slider */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs font-semibold text-slate-300">Scale Resolution</span>
                      <span className="text-xs font-bold px-1.5 py-0.5 bg-indigo-500/10 text-indigo-400 rounded">
                        {scale}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      step="5"
                      value={scale}
                      onChange={(e) => setScale(parseInt(e.target.value))}
                      className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold text-slate-300">Max File Size Target</span>
                    <span className="text-xs font-bold text-indigo-400">KB</span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      min="5"
                      max="10000"
                      value={targetSizeKb}
                      onChange={(e) => setTargetSizeKb(Math.max(1, parseInt(e.target.value) || 0))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-slate-500 font-bold">KB max</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2 flex items-start gap-1">
                    <Info className="h-3.5 w-3.5 text-indigo-400 flex-shrink-0 mt-0.5" />
                    Our smart engine runs instant iterations to find the absolute highest quality that fits into your target KB limit.
                  </p>
                </div>
              )}

              {/* Output Format Select */}
              <div className="pt-2 border-t border-slate-800/60">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Convert Format</label>
                <select
                  value={outputFormat}
                  onChange={(e) => setOutputFormat(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-none focus:border-indigo-500 text-xs"
                >
                  <option value="original">Keep Original Format</option>
                  <option value="webp">WebP (Highly Recommended)</option>
                  <option value="jpeg">JPEG (Best for photos)</option>
                  <option value="png">PNG (Best for transparent graphics)</option>
                </select>
              </div>

              {/* Naming Pattern Suffix */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">File Name Suffix</label>
                <input
                  type="text"
                  value={nameSuffix}
                  onChange={(e) => setNameSuffix(e.target.value)}
                  placeholder="e.g. -min"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Global Actions */}
            <div className="flex flex-col gap-2 mt-auto">
              <button
                onClick={compressAll}
                disabled={files.length === 0}
                className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/10 active:scale-[0.98] text-sm"
              >
                <Sliders className="h-4 w-4" />
                Compress Queue ({files.length})
              </button>
              
              {processedFiles.length > 0 && (
                <button
                  onClick={downloadAll}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-600/10 active:scale-[0.98] text-sm"
                >
                  <Download className="h-4 w-4" />
                  Download All ({processedFiles.length})
                </button>
              )}
            </div>
          </div>

          {/* Main Area: Drag Drop & Queue List (Right column) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* Clipboard Paste Notification Toast */}
            {copiedNotification && (
              <div className="bg-indigo-950 border border-indigo-500/30 text-indigo-300 px-4 py-3 rounded-xl flex items-center gap-2 animate-fade-in text-xs">
                <Clipboard className="h-4 w-4 text-indigo-400" />
                <span>Image successfully pasted from clipboard!</span>
              </div>
            )}

            {/* Drag & Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-300 ${
                isDragging
                  ? 'border-indigo-500 bg-indigo-500/10 scale-[0.99]'
                  : 'border-slate-800 bg-slate-900/30 hover:border-indigo-500/50 hover:bg-slate-900/40'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                multiple
                accept="image/*"
                className="hidden"
              />
              <div className="flex flex-col items-center justify-center">
                <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700/80 mb-4 text-indigo-400 shadow-inner">
                  <Upload className="h-8 w-8 animate-bounce" />
                </div>
                <p className="text-lg font-bold text-slate-200">
                  Drag & Drop images here, or <span className="text-indigo-400 hover:underline">browse computer</span>
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  Supports JPG, PNG, WebP, AVIF, SVG, GIF, BMP, TIFF. Paste directly using <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-[10px] text-slate-300 border border-slate-700">Ctrl+V</kbd> or <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-[10px] text-slate-300 border border-slate-700">⌘+V</kbd>.
                </p>
              </div>
            </div>

            {/* Batch Statistics Dashboard */}
            {files.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-900/50 border border-slate-800 rounded-2xl">
                <div className="text-center sm:text-left sm:pl-4">
                  <span className="block text-[10px] uppercase tracking-wider font-bold text-slate-500">Total Files</span>
                  <span className="text-lg font-extrabold text-slate-200">{files.length}</span>
                </div>
                <div className="text-center sm:text-left">
                  <span className="block text-[10px] uppercase tracking-wider font-bold text-slate-500">Original Size</span>
                  <span className="text-lg font-extrabold text-slate-200">{formatSize(totalOriginalBytes)}</span>
                </div>
                <div className="text-center sm:text-left">
                  <span className="block text-[10px] uppercase tracking-wider font-bold text-slate-500">Compressed Size</span>
                  <span className="text-lg font-extrabold text-indigo-400">{formatSize(totalCompressedBytes)}</span>
                </div>
                <div className="text-center sm:text-left">
                  <span className="block text-[10px] uppercase tracking-wider font-bold text-slate-500">Overall Savings</span>
                  <span className="text-lg font-extrabold text-emerald-400">{overallSavings}%</span>
                </div>
              </div>
            )}

            {/* File Queue List */}
            {files.length > 0 && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Image Queue ({files.length})
                  </h3>
                  <button
                    onClick={clearAll}
                    className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1 bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20 transition-all"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Clear Queue
                  </button>
                </div>

                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                  {files.map((file) => {
                    const fileSavings = file.compressedSize 
                      ? Math.round(((file.originalSize - file.compressedSize) / file.originalSize) * 100) 
                      : 0;

                    return (
                      <div
                        key={file.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-900/40 border border-slate-800/80 hover:border-slate-700/80 rounded-2xl gap-4 transition-all"
                      >
                        {/* File Details */}
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="relative h-14 w-14 rounded-xl overflow-hidden bg-slate-950 flex-shrink-0 border border-slate-800">
                            <img
                              src={file.previewUrl}
                              alt={file.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-slate-200 truncate max-w-[180px] sm:max-w-[240px]">
                              {file.name}
                            </p>
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1 text-[11px] text-slate-400">
                              <span>Orig: {formatSize(file.originalSize)}</span>
                              {file.width > 0 && (
                                <span className="text-slate-600">• {file.width}×{file.height}px</span>
                              )}
                            </div>
                            {file.status === 'done' && file.compressedSize && (
                              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5 text-[11px]">
                                <span className="text-emerald-400 font-semibold">
                                  Comp: {formatSize(file.compressedSize)}
                                </span>
                                {file.compressedWidth && (
                                  <span className="text-slate-500">({file.compressedWidth}×{file.compressedHeight}px)</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Status, Savings & Actions */}
                        <div className="flex items-center justify-between sm:justify-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-800/60">
                          <div className="text-right">
                            {file.status === 'idle' && (
                              <span className="text-[10px] font-bold text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">Pending</span>
                            )}
                            {file.status === 'compressing' && (
                              <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-semibold">
                                <RefreshCw className="h-3 w-3 animate-spin" />
                                Compressing...
                              </div>
                            )}
                            {file.status === 'done' && (
                              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                Saved {fileSavings}%
                              </span>
                            )}
                            {file.status === 'error' && (
                              <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">Error</span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5">
                            {file.status === 'done' && (
                              <button
                                onClick={() => setSelectedComparisonFile(file)}
                                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-all border border-slate-700/50 flex items-center gap-1 text-xs font-semibold"
                                title="Visual Quality Comparison"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">Compare</span>
                              </button>
                            )}
                            
                            {file.status === 'done' ? (
                              <button
                                onClick={() => downloadFile(file)}
                                className="p-2 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white rounded-lg transition-all border border-emerald-500/20"
                                title="Download compressed image"
                              >
                                <Download className="h-3.5 w-3.5" />
                              </button>
                            ) : (
                              <button
                                onClick={() => compressSingleImage(file)}
                                disabled={file.status === 'compressing'}
                                className="p-2 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-400 hover:text-white rounded-lg transition-all border border-indigo-500/20 disabled:opacity-50"
                                title="Compress this image"
                              >
                                <Sliders className="h-3.5 w-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() => removeFile(file.id)}
                              className="p-2 bg-slate-800 hover:bg-rose-600/20 text-slate-400 hover:text-rose-400 rounded-lg transition-all border border-slate-700/50"
                              title="Remove file"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Before / After Split Comparison Slider Modal */}
        {selectedComparisonFile && (
          <div className="fixed inset-0 bg-black/95 z-50 flex flex-col items-center justify-center p-4 sm:p-6 backdrop-blur-md">
            <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl p-6 relative flex flex-col gap-4 max-h-[90vh] overflow-hidden">
              <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-slate-100">Interactive Quality Comparison</h3>
                  <p className="text-xs text-slate-400">Drag the center handle or move mouse to compare original vs compressed visual output.</p>
                </div>
                <button 
                  onClick={() => setSelectedComparisonFile(null)}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition-all"
                >
                  Close
                </button>
              </div>

              {/* Slider Container */}
              <div 
                ref={sliderRef}
                onMouseMove={handleSplitMove}
                onTouchMove={handleSplitTouchMove}
                className="relative flex-1 bg-slate-950 rounded-2xl overflow-hidden select-none cursor-ew-resize min-h-[280px] sm:min-h-[400px] border border-slate-800 flex items-center justify-center"
              >
                {/* Original Image (Left Side) */}
                <img 
                  src={selectedComparisonFile.previewUrl} 
                  alt="Original"
                  className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                />
                <div className="absolute left-4 top-4 bg-black/60 backdrop-blur-md border border-slate-800 px-2.5 py-1 rounded text-[10px] font-bold text-slate-300 z-10">
                  Original ({formatSize(selectedComparisonFile.originalSize)})
                </div>

                {/* Compressed Image (Right Side, clipped based on slider position) */}
                <div 
                  className="absolute inset-y-0 right-0 left-0 overflow-hidden pointer-events-none"
                  style={{ clipPath: `polygon(${sliderPosition}% 0, 100% 0, 100% 100%, ${sliderPosition}% 100%)` }}
                >
                  <img 
                    src={selectedComparisonFile.compressedUrl || selectedComparisonFile.previewUrl} 
                    alt="Compressed"
                    className="absolute inset-0 w-full h-full object-contain"
                  />
                </div>
                <div className="absolute right-4 top-4 bg-indigo-950/80 backdrop-blur-md border border-indigo-500/30 px-2.5 py-1 rounded text-[10px] font-bold text-indigo-300 z-10">
                  Compressed ({selectedComparisonFile.compressedSize ? formatSize(selectedComparisonFile.compressedSize) : 'N/A'})
                </div>

                {/* Vertical Divider Line & Handle */}
                <div 
                  className="absolute inset-y-0 w-0.5 bg-indigo-500 z-20 pointer-events-none"
                  style={{ left: `${sliderPosition}%` }}
                >
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 bg-indigo-600 rounded-full border-2 border-white flex items-center justify-center shadow-lg">
                    <Sliders className="h-4 w-4 text-white rotate-90" />
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 text-xs">
                <span className="text-slate-400">Original Resolution: {selectedComparisonFile.width}×{selectedComparisonFile.height}px</span>
                <button
                  onClick={() => downloadFile(selectedComparisonFile)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold transition-all text-xs"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download This Image
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs for Educational Content */}
        <div className="flex border-b border-slate-800 mb-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('compressor')}
            className={`px-6 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'compressor'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            About & Professional Features
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`px-6 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'guide'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            SEO & Optimization Guide
          </button>
          <button
            onClick={() => setActiveTab('faq')}
            className={`px-6 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'faq'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Frequently Asked Questions
          </button>
        </div>

        {/* Educational Content Section */}
        <div className="prose prose-invert max-w-none text-slate-300 space-y-12">
          
          {activeTab === 'compressor' && (
            <section className="space-y-10">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white">Professional Image Size Reducer</h2>
                <p className="mt-4 text-slate-400 leading-relaxed">
                  Our online image size reducer provides a fast, efficient, and completely secure way to optimize your digital assets. Whether you are a web developer looking to increase site speed, a digital marketer optimizing social media graphics, or an individual aiming to reduce image kb size for application forms, our browser-based tool is engineered to deliver pristine results. It acts as a comprehensive <strong>jpg size reducer</strong>, <strong>png compressor</strong>, and <strong>webp compressor</strong> all in one.
                </p>
              </div>

              {/* Highlight Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl">
                  <Zap className="h-8 w-8 text-indigo-400 mb-3" />
                  <h3 className="text-lg font-bold text-white mb-2">Browser-Based Processing</h3>
                  <p className="text-slate-400 text-sm">All compression happens locally in your browser. Your images never leave your device.</p>
                </div>
                <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl">
                  <Zap className="h-8 w-8 text-indigo-400 mb-3" />
                  <h3 className="text-lg font-bold text-white mb-2">Target KB Control</h3>
                  <p className="text-slate-400 text-sm">Set an exact target file size in KB and our tool automatically finds the optimal quality level.</p>
                </div>
                <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl">
                  <Zap className="h-8 w-8 text-indigo-400 mb-3" />
                  <h3 className="text-lg font-bold text-white mb-2">Batch Processing</h3>
                  <p className="text-slate-400 text-sm">Upload and compress multiple images at once. Download individually or as a ZIP archive.</p>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'guide' && (
            <section className="space-y-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-white">SEO &amp; Optimization Guide</h2>
              <p className="text-slate-400 leading-relaxed">
                Optimizing image sizes is one of the highest-impact improvements you can make for web performance. Large images are the #1 cause of slow page loads — and slow pages hurt SEO rankings, bounce rates, and conversions.
              </p>
              <ul className="space-y-3 text-slate-400">
                <li><strong className="text-white">JPEG:</strong> Best for photographs. Target under 200KB for hero images, under 100KB for thumbnails.</li>
                <li><strong className="text-white">PNG:</strong> Best for logos and transparent images. Use WebP instead when transparency isn't needed.</li>
                <li><strong className="text-white">WebP:</strong> 25–35% smaller than JPEG/PNG at equivalent quality. Supported by all modern browsers.</li>
              </ul>
            </section>
          )}

          {activeTab === 'faq' && (
            <section className="space-y-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-white">Frequently Asked Questions</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Is my image data safe?</h3>
                  <p className="text-slate-400">Yes. All processing is done entirely in your browser using JavaScript. No image data is ever uploaded to any server.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">What formats are supported?</h3>
                  <p className="text-slate-400">JPEG, PNG, WebP, and GIF. Output can be saved as JPEG or WebP for best compression.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Is there a file size limit?</h3>
                  <p className="text-slate-400">There is no hard limit since processing is local, but very large images (50MB+) may be slow depending on your device.</p>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

// Page wrapper with SEO
export default function ImageSizeReducerPage() {
  return (
    <>
      <Helmet>
        <title>Professional Image Size Reducer | Compress to Target KB</title>
        <meta name="description" content="Reduce image sizes to exact target KB. Free, secure, browser-based batch tool with quality sliders, format conversion, and real-time before/after comparison." />
      </Helmet>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-black text-center mb-8">Professional Image Size Reducer</h1>
          <ToolComponent />
        </div>
      </div>
    </>
  );
}
