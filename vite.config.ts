import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    strictPort: true,
    host: true,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          markdown: ['react-markdown', 'remark-gfm', 'rehype-raw', 'rehype-slug'],
          pdf: ['pdf-lib', 'jspdf', 'pdfjs-dist'],
          documents: ['xlsx', 'docx', 'jszip', 'mammoth'],
          ocr: ['tesseract.js']
        }
      }
    }
  }
});
