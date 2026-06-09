import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, 
  Download
} from 'lucide-react';

export default function ImageFormatConverter() {
  const [images, setImages] = useState<{ id: string; name: string; url: string; file: File; convertedUrl?: string; format?: string }[]>([]);
  const [outputFormat, setOutputFormat] = useState('image/png');
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newImages = acceptedFiles.map((file) => ({
      id: Math.random().toString(36).substring(7),
      name: file.name,
      url: URL.createObjectURL(file),
      file: file
    }));
    setImages((prev) => [...prev, ...newImages]);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { 'image/*': [] }
  });

  const handleConvert = () => {
    if (images.length === 0) return;
    setConverting(true);
    setProgress(10);

    const step = 90 / images.length;
    let currentProgress = 10;

    images.forEach((img, i) => {
      setTimeout(() => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const originalImg = new Image();

        originalImg.onload = () => {
          canvas.width = originalImg.width;
          canvas.height = originalImg.height;
          if (ctx) {
            ctx.drawImage(originalImg, 0, 0);
          }
          const convertedUrl = canvas.toDataURL(outputFormat);
          const extMap: Record<string, string> = {
            'image/png': 'png',
            'image/jpeg': 'jpg',
            'image/webp': 'webp'
          };
          const formatStr = extMap[outputFormat] || 'png';

          setImages((prev) => 
            prev.map((item) => 
              item.id === img.id ? { ...item, convertedUrl, format: formatStr } : item
            )
          );

          currentProgress += step;
          setProgress(Math.min(100, Math.round(currentProgress)));

          if (i === images.length - 1) {
            setProgress(100);
            setConverting(false);
          }
        };
        originalImg.src = img.url;
      }, i * 500);
    });
  };

  const handleDownload = (img: typeof images[0]) => {
    if (img.convertedUrl) {
      const parts = img.name.split('.');
      parts.pop();
      const baseName = parts.join('.');
      
      const link = document.createElement('a');
      link.href = img.convertedUrl;
      link.download = `${baseName}.${img.format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const clearAll = () => {
    setImages([]);
    setProgress(0);
    setConverting(false);
  };

  return (
    <div className="bg-[#0e0e16] border border-zinc-900 rounded-3xl p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6 border-b border-zinc-850 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white">Bulk Image Format Converter</h2>
          <p className="text-xs text-zinc-500 mt-0.5">Convert high res assets locally in your browser safely.</p>
        </div>
        {images.length > 0 && (
          <button onClick={clearAll} className="text-xs text-red-400 hover:text-red-300 font-bold">
            Clear Queue
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 p-5 bg-zinc-950/40 border border-zinc-900 rounded-2xl h-fit">
          <label className="text-xs uppercase font-black tracking-wider text-zinc-400 block mb-2">Configure target format</label>
          <select 
            value={outputFormat} 
            onChange={(e) => setOutputFormat(e.target.value)}
            className="w-full bg-[#09090f] border border-zinc-850 text-xs text-white p-3 rounded-xl focus:border-cyan-500/50 mb-6 cursor-pointer"
          >
            <option value="image/png">Portable Network Graphics (.PNG)</option>
            <option value="image/jpeg">JPEG Image format (.JPG)</option>
            <option value="image/webp">WebP Responsive format (.WEBP)</option>
          </select>

          <button
            onClick={handleConvert}
            disabled={images.length === 0 || converting}
            className={`w-full py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
              images.length > 0 && !converting
                ? 'bg-cyan-600 hover:bg-cyan-500 text-white cursor-pointer shadow-lg shadow-cyan-500/20'
                : 'bg-zinc-900 text-zinc-600 border border-zinc-850 cursor-not-allowed'
            }`}
          >
            Convert Bulk Queue
          </button>
        </div>

        <div className="lg:col-span-2">
          {images.length === 0 ? (
            <div {...getRootProps()} className="border-2 border-dashed border-zinc-800 hover:border-cyan-500/50 rounded-2xl aspect-video flex flex-col items-center justify-center p-6 text-center cursor-pointer bg-zinc-950/40 hover:bg-zinc-900/20 transition-all">
              <input {...getInputProps()} />
              <Upload className="w-10 h-10 text-zinc-600 mb-3" />
              <p className="text-sm font-bold text-zinc-300">Drag & Drop images or click to select files</p>
              <p className="text-xs text-zinc-500 mt-1">Conversions occur 100% locally on your computer device</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
              {images.map((img) => (
                <div key={img.id} className="p-4 bg-zinc-950/40 border border-zinc-900 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={img.url} className="w-10 h-10 rounded-lg object-cover border border-zinc-800" alt="Queue preview" />
                    <div>
                      <p className="text-xs font-bold text-zinc-200 line-clamp-1">{img.name}</p>
                      <p className="text-[10px] text-zinc-500">{(img.file.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                  <div>
                    {img.convertedUrl ? (
                      <button onClick={() => handleDownload(img)} className="px-3 py-1.5 bg-emerald-950/40 border border-emerald-800/30 text-emerald-400 text-xs font-bold rounded-lg flex items-center gap-1.5 hover:bg-emerald-800 hover:text-white transition-all">
                        <Download className="w-3.5 h-3.5" /> Download
                      </button>
                    ) : (
                      <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wide">In Queue</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {converting && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-cyan-400">Processing images batch loop...</span>
            <span className="text-xs font-bold text-cyan-400">{progress}%</span>
          </div>
          <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
            <div className="bg-cyan-500 h-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}
    </div>
  );
}
