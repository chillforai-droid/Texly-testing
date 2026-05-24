/**
 * src/utils/pdfLoader.ts
 *
 * Loads pdfjs-dist (2.2 MB) lazily, only when a user actually opens a PDF
 * tool. This prevents the giant chunk from blocking initial page load.
 *
 * Also configures the worker path correctly for both Vite dev server and
 * production Vercel deployment.
 *
 * Usage:
 *   import { getPdfLib } from '../utils/pdfLoader';
 *   const pdfjsLib = await getPdfLib();
 *   const doc = await pdfjsLib.getDocument(url).promise;
 */

let pdfjsCached: any = null;

export async function getPdfLib() {
  if (pdfjsCached) return pdfjsCached;

  try {
    const pdfjs = await import('pdfjs-dist');

    // Configure worker – use CDN copy to avoid bundling the 500KB worker
    // into the main chunk. The CDN version matches the pdfjs-dist version.
    const pdfjsVersion = (pdfjs as any).version || '5.0.0';

    if (typeof window !== 'undefined') {
      // Prefer a local worker if Vite has copied it, else fall back to CDN
      const localWorker = '/pdf.worker.min.js';
      const cdnWorker = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsVersion}/pdf.worker.min.js`;

      // Test if local worker exists
      let workerSrc = cdnWorker;
      try {
        const response = await fetch(localWorker, { method: 'HEAD' });
        if (response.ok) workerSrc = localWorker;
      } catch (_) { /* use CDN */ }

      pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
    }

    pdfjsCached = pdfjs;
    return pdfjs;
  } catch (err) {
    console.error('[Texly] Failed to load PDF.js:', err);
    throw new Error(
      'PDF tools could not be loaded. Please refresh or try a different browser.'
    );
  }
}

/**
 * Pre-warm the PDF.js import after a delay.
 * Call this on the homepage so the PDF chunk is cached by the time
 * a user navigates to a PDF tool.
 */
export function prewarmPdfLib(delayMs = 10_000): void {
  if (typeof window === 'undefined') return;
  setTimeout(() => {
    // Fire-and-forget – just trigger the dynamic import so the browser
    // fetches and caches the chunk in the background.
    getPdfLib().catch(() => {/* noop – prewarm only */});
  }, delayMs);
}
