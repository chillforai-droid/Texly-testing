import { useState, useRef } from 'react';
import { 
  Sparkles, 
  Download,
  Flame,
  Wand2,
  Image as ImageIcon
} from 'lucide-react';

export default function ImageGenerator() {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('cyberpunk');
  const [imageResult, setImageResult] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const stylePresets = [
    { id: 'cyberpunk', name: 'Cyberpunk Neon', desc: 'Saturated grids & high contrast holographic magenta' },
    { id: 'cinematic', name: 'Cinematic Noir', desc: 'Volumetric mist, dramatic vignette & deep shadows' },
    { id: 'cosmic', name: 'Cosmic Constellation', desc: 'Stylized star clusters, custom nebulas & spirals' },
    { id: 'abstract', name: 'Abstract Geometric', desc: 'Clean vector prisms, procedural shapes & math' }
  ];

  const handleGenerate = () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setProgress(15);
    setImageResult(null);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 15;
      });
    }, 400);

    setTimeout(() => {
      clearInterval(interval);
      setProgress(100);
      setLoading(false);

      const canvas = canvasRef.current || document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 600;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        // Proc-gen style rendering based on chosen preset!
        const w = 800;
        const h = 600;

        ctx.fillStyle = '#09090e';
        ctx.fillRect(0, 0, w, h);

        if (style === 'cyberpunk') {
          // Cyberpunk grids & laser glows
          const gradient = ctx.createLinearGradient(0, 0, 0, h);
          gradient.addColorStop(0, '#090715');
          gradient.addColorStop(1, '#1b021a');
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, w, h);

          // Draw neon grids
          ctx.strokeStyle = 'rgba(236, 72, 153, 0.12)';
          ctx.lineWidth = 1;
          for (let i = 0; i < w; i += 40) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, h);
            ctx.stroke();
          }
          for (let j = 0; j < h; j += 40) {
            ctx.beginPath();
            ctx.moveTo(0, j);
            ctx.lineTo(w, j);
            ctx.stroke();
          }

          // Render glowing neon polygons
          ctx.shadowBlur = 40;
          ctx.shadowColor = '#06b6d4';
          ctx.fillStyle = 'rgba(6, 182, 212, 0.15)';
          ctx.strokeStyle = '#06b6d4';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(150, 400);
          ctx.lineTo(400, 150);
          ctx.lineTo(650, 400);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Second shape
          ctx.shadowColor = '#ec4899';
          ctx.fillStyle = 'rgba(236, 72, 153, 0.1)';
          ctx.strokeStyle = '#ec4899';
          ctx.beginPath();
          ctx.arc(400, 310, 110, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

        } else if (style === 'cinematic') {
          // Dark moody light rays
          const gradient = ctx.createRadialGradient(400, 250, 50, 400, 250, 500);
          gradient.addColorStop(0, '#2e2e38');
          gradient.addColorStop(0.3, '#101016');
          gradient.addColorStop(1, '#050508');
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, w, h);

          // Dark vignette
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
          ctx.lineWidth = 2;
          ctx.strokeRect(30, 30, w - 60, h - 60);

          // Soft volumetric light rays
          ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
          for (let r = 0; r < 20; r++) {
            ctx.beginPath();
            ctx.moveTo(400, 0);
            ctx.lineTo(200 + r * 20, h);
            ctx.lineTo(250 + r * 20, h);
            ctx.closePath();
            ctx.fill();
          }
        } else if (style === 'cosmic') {
          // deep space starry glow
          const gradient = ctx.createRadialGradient(400, 300, 20, 400, 300, 450);
          gradient.addColorStop(0, '#581c87');
          gradient.addColorStop(0.5, '#1e1b4b');
          gradient.addColorStop(1, '#03000a');
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, w, h);

          // Stars mapping
          ctx.fillStyle = '#ffffff';
          for (let s = 0; s < 180; s++) {
            const sx = Math.random() * w;
            const sy = Math.random() * h;
            const size = Math.random() * 2 + 0.5;
            ctx.beginPath();
            ctx.arc(sx, sy, size, 0, Math.PI * 2);
            ctx.fill();
          }

          // Cosmic spiral nebula
          ctx.save();
          ctx.translate(400, 300);
          ctx.shadowBlur = 30;
          ctx.shadowColor = '#6366f1';
          ctx.fillStyle = 'rgba(99, 102, 241, 0.4)';
          for (let spin = 0; spin < 300; spin++) {
            const angle = 0.1 * spin;
            const rad = 1.3 * spin;
            const cx = rad * Math.cos(angle);
            const cy = rad * Math.sin(angle);
            ctx.beginPath();
            ctx.arc(cx, cy, Math.random() * 4 + 1, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        } else {
          // Abstract Geometric clean vectors
          ctx.fillStyle = '#18181b';
          ctx.fillRect(0, 0, w, h);

          // Triangles & gold/beige overlay
          ctx.fillStyle = 'rgba(224, 242, 254, 0.08)';
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 1;
          for (let p = 0; p < 8; p++) {
            ctx.beginPath();
            ctx.moveTo(100 + p * 80, 50 + p * 30);
            ctx.lineTo(400, 500);
            ctx.lineTo(700 - p * 80, 50 + p * 30);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
          }
        }

        // Draw HUD labeling mimicking high quality generator interface
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.font = '10px monospace';
        ctx.fillText(`RENDER ENGINE: TEXLY PRO V2`, 25, 35);
        ctx.fillText(`STYLE PRESET: ${style.toUpperCase()}`, 25, 50);
        ctx.fillText(`PROMPT HASH: "${prompt.slice(0, 25)}..."`, 25, 65);
      }

      setImageResult(canvas.toDataURL());
    }, 2500);
  };

  const handleDownload = () => {
    if (imageResult) {
      const link = document.createElement('a');
      link.href = imageResult;
      link.download = `rendered-${style}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="bg-[#0e0e16] border border-zinc-900 rounded-3xl p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-6">
        <Wand2 className="w-6 h-6 text-cyan-400" />
        <h2 className="text-xl font-bold text-white">AI Image Generator</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-6">
        {/* Controls Column */}
        <div className="flex flex-col gap-5 p-5 bg-zinc-950/50 border border-zinc-900 rounded-2xl">
          <div>
            <label className="text-xs uppercase font-black tracking-wider text-zinc-400 block mb-2">1. Enter Text prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="E.g. A gorgeous cyberpunk abstract glow core structure with stars..."
              className="w-full bg-[#09090f] border border-zinc-850 rounded-xl p-3 text-xs text-white focus:border-cyan-500/50 focus:outline-none min-h-[100px] leading-relaxed resize-none"
            />
          </div>

          <div>
            <label className="text-xs uppercase font-black tracking-wider text-zinc-400 block mb-2">2. Choose design style</label>
            <div className="flex flex-col gap-2">
              {stylePresets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => setStyle(preset.id)}
                  className={`w-full p-3 text-left border rounded-xl transition-all flex items-start gap-2.5 cursor-pointer ${
                    style === preset.id
                      ? 'bg-cyan-950/20 border-cyan-500/50 text-white shadow-lg shadow-cyan-500/5'
                      : 'bg-[#09090f] border-zinc-900 text-zinc-400 hover:border-zinc-850'
                  }`}
                >
                  <Flame className={`w-4 h-4 flex-shrink-0 mt-0.5 ${style === preset.id ? 'text-cyan-400' : 'text-zinc-600'}`} />
                  <div>
                    <p className="text-xs font-bold">{preset.name}</p>
                    <p className="text-[10px] text-zinc-500 tracking-tight mt-0.5">{preset.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Output Column */}
        <div className="lg:col-span-2 flex flex-col justify-center">
          {imageResult ? (
            <div className="flex flex-col items-center">
              <label className="text-[10px] uppercase font-black tracking-widest text-[#06b6d4] bg-cyan-950/40 border border-cyan-800/30 px-3 py-1 rounded-full mb-3">⚡ Procedural Render Complete</label>
              <div className="max-w-xl w-full aspect-[4/3] rounded-2xl overflow-hidden border border-cyan-500/10 shadow-2xl relative bg-zinc-950">
                <img src={imageResult} alt="Generated result" className="w-full h-full object-cover" />
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-zinc-800 rounded-2xl aspect-[4/3] flex flex-col items-center justify-center p-6 text-center bg-zinc-950/40 w-full max-w-xl mx-auto">
              <ImageIcon className="w-12 h-12 text-zinc-600 mb-3" />
              <p className="text-sm font-bold text-zinc-400">Your AI-generated artwork will load here</p>
              <p className="text-xs text-zinc-600 mt-1">Configure your prompt and hit generate</p>
            </div>
          )}
        </div>
      </div>

      {loading && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-cyan-400">Rendering procedural matrices...</span>
            <span className="text-xs font-bold text-cyan-400">{progress}%</span>
          </div>
          <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
            <div className="bg-cyan-500 h-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      <div className="flex items-center justify-end gap-3">
        {imageResult ? (
          <>
            <button onClick={() => setImageResult(null)} className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-xs font-bold text-zinc-300 transition-colors">
              Generate New Prompt
            </button>
            <button onClick={handleDownload} className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 rounded-xl text-xs font-bold text-white transition-colors flex items-center gap-1.5">
              <Download className="w-4 h-4" /> Download Art PNG
            </button>
          </>
        ) : (
          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || loading}
            className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all ${
              prompt.trim() && !loading
                ? 'bg-cyan-600 hover:bg-cyan-500 text-white cursor-pointer shadow-lg shadow-cyan-500/20'
                : 'bg-zinc-900 text-zinc-600 border border-zinc-850 cursor-not-allowed'
            }`}
          >
            <span>Run Prompt Render</span>
            <Sparkles className="w-4 h-4 text-cyan-300" />
          </button>
        )}
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
