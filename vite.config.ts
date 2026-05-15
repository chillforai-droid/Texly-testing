import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
      'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    optimizeDeps: {
      noDiscovery: false,
      include: ['pako', '@pdf-lib/standard-fonts', 'pdf-lib', 'tesseract.js'],
      exclude: [
        'pdfjs-dist',
        'nodemailer',
        'node-cron',
        'express',
        'dotenv',
        'tsx'
      ],
    },
    build: {
      // NO manualChunks - circular dependency fix
      minify: 'esbuild',
      cssMinify: true,
      sourcemap: false,
      chunkSizeWarningLimit: 3000,
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
