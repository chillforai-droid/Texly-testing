import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, 
  RefreshCw, 
  Download,
  AlertCircle,
  Sparkles
} from 'lucide-react';

export default function ImageSizeReducer() {
  const [image, setImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [reducedImage, setReducedImage] = useState<string | null>(null);
  const [widthPercent, setWidthPercent] = useState(50);
  const [quality, setQuality] = useState(0.75);
  const [loading, setLoading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target?.result as string);
        setReducedImage(null);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false
  });

  const handleReduce = () => {
    if (!image || !file) return;
    setLoading(true);

    setTimeout(() => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const factor = widthPercent / 100;
        
        canvas.width = img.width * factor;
        canvas.height = img.height * factor;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        }

        setReducedImage(canvas.toDataURL('image/jpeg', quality));
        setLoading(false);
      };
      img.src = image;
    }, 1200);
  };

  const handleDownload = () => {
    if (reducedImage) {
      const link = document.createElement('a');
      link.href = reducedImage;
      link.download = `resized-${file?.name || 'image.jpg'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const reset = () => {
    setImage(null);
    setFile(null);
    setReducedImage(null);
  };

  return (
    <div className="bg-[#0e0e16] border border-zinc-900 rounded-3xl p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-6">
        <Sparkles className="w-6 h-6 text-cyan-400" />
        <h2 className="text-xl font-bold text-white">Image Size Reducer Pro</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-6">
        {/* Controls */}
        <div className="flex flex-col gap-5 p-5 bg-zinc-950/50 border border-zinc-900 rounded-2xl h-fit">
          <div>
            <label className="text-xs uppercase font-black tracking-wider text-zinc-400 block mb-1.5">Scale Down Width/Height</label>
            <div className="flex items-center justify-between text-xs font-bold text-zinc-400 mb-1">
              <span>Reduce to</span>
              <span className="text-cyan-400">{widthPercent}%</span>
            </div>
            <input 
              type="range" 
              min="10" 
              max="90" 
              value={widthPercent} 
              onChange={(e) => { setWidthPercent(parseInt(e.target.value)); setReducedImage(null); }}
              className="w-full accent-cyan-500 h-1 bg-zinc-900 rounded-full" 
            />
          </div>

          <div>
            <label className="text-xs uppercase font-black tracking-wider text-zinc-400 block mb-1.5">Compression Quality</label>
            <div className="flex items-center justify-between text-xs font-bold text-zinc-400 mb-1">
              <span>Balanced Output</span>
              <span className="text-cyan-400">{Math.round(quality * 100)}%</span>
            </div>
            <input 
              type="range" 
              min="0.1" 
              max="0.9" 
              step="0.05"
              value={quality} 
              onChange={(e) => { setQuality(parseFloat(e.target.value)); setReducedImage(null); }}
              className="w-full accent-cyan-500 h-1 bg-zinc-900 rounded-full" 
            />
          </div>

          <button
            onClick={handleReduce}
            disabled={!image || loading}
            className={`w-full py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
              image && !loading
                ? 'bg-cyan-600 hover:bg-cyan-500 text-white cursor-pointer shadow-lg shadow-cyan-500/20'
                : 'bg-zinc-900 text-zinc-600 border border-zinc-850 cursor-not-allowed'
            }`}
          >
            Reduce Image Size
          </button>
        </div>

        {/* View Finder */}
        <div className="lg:col-span-2 flex flex-col justify-center">
          {reducedImage ? (
            <div className="flex flex-col items-center">
              <label className="text-[10px] uppercase font-black tracking-widest text-[#06b6d4] bg-cyan-950/40 border border-cyan-800/30 px-3 py-1 rounded-full mb-3">⚡ Compression Pass Complete</label>
              <div className="max-w-xl w-full aspect-video rounded-2xl overflow-hidden border border-cyan-500/10 shadow-2xl relative bg-zinc-950">
                <img src={reducedImage} alt="Reduced" className="w-full h-full object-cover" />
              </div>
            </div>
          ) : image ? (
            <div className="relative max-w-xl mx-auto aspect-video rounded-2xl overflow-hidden border border-zinc-800 w-full">
              <img src={image} alt="Original to resize" className="w-full h-full object-cover" />
              <button onClick={() => setImage(null)} className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-zinc-400 hover:text-white transition-colors">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div {...getRootProps()} className="border-2 border-dashed border-zinc-800 hover:border-cyan-500/50 rounded-2xl aspect-video flex flex-col items-center justify-center p-6 text-center cursor-pointer bg-zinc-950/40 hover:bg-zinc-900/20 transition-all w-full">
              <input {...getInputProps()} />
              <Upload className="w-10 h-10 text-zinc-600 mb-3" />
              <p className="text-sm font-bold text-zinc-300">Drag & Drop image to resize</p>
              <p className="text-xs text-zinc-500 mt-1">Shrink dimensions and compress data locally</p>
            </div>
          )}
        </div>
      </div>

      {loading && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-cyan-400">Rescaling pixel density...</span>
          </div>
          <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
            <div className="bg-cyan-500 h-full animate-pulse" style={{ width: '100%' }} />
          </div>
        </div>
      )}

      <div className="flex items-center justify-end gap-3 font-semibold text-xs">
        {reducedImage ? (
          <>
            <button onClick={reset} className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-xs font-bold text-zinc-300 transition-colors">
              Reset Reducer
            </button>
            <button onClick={handleDownload} className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 rounded-xl text-xs font-bold text-white transition-colors flex items-center gap-1.5">
              <Download className="w-4 h-4" /> Download Resized Image
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}
