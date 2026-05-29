import tailwindcss from '@tailwindcss/vite';
import viteCompression from 'vite-plugin-compression';
import react from '@vitejs/plugin-react';
import legacy from '@vitejs/plugin-legacy';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Pages.json Sync Plugin ───────────────────────────────────────────────────
// data/pages.json (backend/API का source) → src/data/pages.json (frontend bundle)
// Dev mode:   file watch करता है, change होने पर auto-sync + HMR trigger
// Build mode: build से पहले एक बार sync करता है
function pagesSyncPlugin() {
  const srcFile = path.resolve(__dirname, 'data/pages.json');
  const destFile = path.resolve(__dirname, 'src/data/pages.json');

  function sync() {
    try {
      if (!fs.existsSync(srcFile)) {
        console.warn('[pages-sync] ⚠️ data/pages.json not found, skipping sync');
        return;
      }
      fs.copyFileSync(srcFile, destFile);
      console.log('[pages-sync] ✅ data/pages.json → src/data/pages.json synced');
    } catch (e) {
      console.error('[pages-sync] ❌ Sync failed:', e);
    }
  }

  return {
    name: 'pages-json-sync',
    // Build शुरू होने से पहले sync करो
    buildStart() { sync(); },
    // Dev server start होने पर sync + watch लगाओ
    configureServer(server: any) {
      sync();
      const watcher = fs.watch(srcFile, () => {
        sync();
        // Vite को बताओ कि src/data/pages.json बदल गई → HMR trigger
        const destMod = server.moduleGraph.getModulesByFile(destFile);
        if (destMod) {
          destMod.forEach((m: any) => server.moduleGraph.invalidateModule(m));
        }
        server.ws.send({ type: 'full-reload' });
        console.log('[pages-sync] 🔄 HMR triggered after sync');
      });
      server.httpServer?.on('close', () => watcher.close());
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      pagesSyncPlugin(),
      react(),
      tailwindcss(),
      viteCompression({ algorithm: 'gzip', ext: '.gz' }),
      viteCompression({ algorithm: 'brotliCompress', ext: '.br' }),
      legacy({
        targets: [
          'chrome >= 80',
          'safari >= 14',
          'not dead',
        ],
        modernPolyfills: false,
        additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
        renderLegacyChunks: false,
      }),
    ],

    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
      'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
      'process.env.NODE_ENV': JSON.stringify(mode),
    },

    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },

    optimizeDeps: {
      noDiscovery: false,
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        'react-helmet-async',
        'pako',
        '@pdf-lib/standard-fonts',
        'pdf-lib',
      ],
      exclude: [
        'pdfjs-dist',
        'tesseract.js',
        'nodemailer',
        'node-cron',
        'express',
        'dotenv',
        'tsx',
      ],
    },

    build: {
      target: ['es2017', 'chrome80', 'safari14'],

      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (
              id.includes('node_modules/react/') ||
              id.includes('node_modules/react-dom/') ||
              id.includes('node_modules/scheduler/')
            ) return 'vendor-react';
            if (id.includes('node_modules/react-router')) return 'vendor-router';
            if (id.includes('node_modules/framer-motion') || id.includes('node_modules/motion')) return 'vendor-motion';
            if (id.includes('node_modules/@supabase')) return 'vendor-supabase';
            if (
              id.includes('node_modules/pdfjs-dist') ||
              id.includes('node_modules/pdf-lib') ||
              id.includes('node_modules/@pdf-lib') ||
              id.includes('node_modules/pako')
            ) return 'vendor-pdf';
            if (
              id.includes('node_modules/tesseract') ||
              id.includes('node_modules/@gradio') ||
              id.includes('node_modules/browser-image-compression')
            ) return 'vendor-ai';
            if (id.includes('src/pages/tools/')) return 'page-ai-tools';
            if (id.includes('src/components/PDFToolWorkspace')) return 'page-pdf-workspace';
            if (id.includes('src/components/TexlyAI')) return 'page-texly-ai';
            if (id.includes('src/pages/BlogDetail') || id.includes('src/pages/BlogList')) return 'page-blog';
            if (
              id.includes('node_modules/qrcode') ||
              id.includes('node_modules/qr-code') ||
              id.includes('node_modules/jszip') ||
              id.includes('node_modules/docx') ||
              id.includes('node_modules/jspdf') ||
              id.includes('node_modules/mammoth') ||
              id.includes('node_modules/xlsx')
            ) return 'vendor-misc';
            if (id.includes('node_modules/lucide-react')) return 'vendor-icons';
            if (id.includes('node_modules/')) return 'vendor-common';
          },
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
        },
      },

      minify: 'terser',
      cssMinify: true,
      sourcemap: false,
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
          passes: 2,
          pure_funcs: ['console.log', 'console.info', 'console.debug'],
        },
        mangle: { safari10: true },
        format: { comments: false },
      },

      chunkSizeWarningLimit: 2500,
      modulePreload: { polyfill: true, resolveDependencies: (url, deps) => deps },
      reportCompressedSize: false,
      assetsInlineLimit: 8192,
    },

    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
