import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function createServer() {
  const app = express();
  const PORT = 3000;

  // Import our backend API Express handlers dynamically
  const { default: apiHandler } = await import('./api/index.js');

  // Mount backend endpoints
  app.use(apiHandler);

  if (process.env.NODE_ENV === 'production') {
    // Static file serving of the compiled output
    app.use(express.static(path.join(__dirname, 'dist')));

    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    // Integrate Vite server in middlewareMode for Dev
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom'
    });

    app.use(vite.middlewares);

    app.get('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server started on http://0.0.0.0:${PORT} (NODE_ENV: ${process.env.NODE_ENV || 'development'})`);
  });
}

createServer().catch((err) => {
  console.error('Fatal crash during server bootstrap:', err);
});
