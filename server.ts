import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import express from "express";
import cron from "node-cron";
import dotenv from "dotenv";
import compression from "compression";
import helmet from "helmet";
import apiApp from "./api/index";

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";
const BASE_URL = process.env.BASE_URL || "https://www.texlyonline.in";

async function startServer() {
  const app = express();

  // Security Headers (Helmet)
  app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP for now to avoid issues with external scripts
    crossOriginEmbedderPolicy: false,
  }));

  // Gzip Compression
  app.use(compression());

  // Force WWW redirect and HTTPS (for production)
  app.use((req, res, next) => {
    const host = req.get('host') || '';
    const isWww = host.startsWith('www.');
    
    // In production, we want to force www.texlyonline.in
    if (NODE_ENV === 'production' && !isWww && !host.includes('localhost') && !host.includes('127.0.0.1')) {
      return res.redirect(301, `https://www.texlyonline.in${req.originalUrl}`);
    }
    next();
  });

  // Redirect /tools to /tool
  app.use((req, res, next) => {
    if (req.path.startsWith('/tools/')) {
      const newPath = req.path.replace('/tools/', '/tool/');
      return res.redirect(301, newPath);
    }
    next();
  });

  // Robots.txt Route
  app.get("/robots.txt", (req, res) => {
    try {
      const baseUrl = process.env.BASE_URL || "https://www.texlyonline.in";
      res.header("Content-Type", "text/plain; charset=utf-8");
      res.send(`User-agent: *\nAllow: /\n\nSitemap: ${baseUrl}/sitemap.xml`);
    } catch (error) {
      console.error("[ROBOTS] Error serving robots.txt:", error);
      res.status(500).send("Error generating robots.txt");
    }
  });

  // Sitemap.xml Route is handled by public/sitemap.xml or API

  // Mount API routes
  app.use(apiApp);

  // Vite middleware for development
  if (NODE_ENV !== "production") {
    console.log("Server: Initializing Vite middleware (Development Mode)");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Server: Serving static files (Production Mode)");
    const distPath = path.join(process.cwd(), "dist");
    
    // Serve static files from dist with caching
    app.use(express.static(distPath, {
      maxAge: '1y',
      immutable: true,
      index: false
    }));
    
    // Serve static files from public folder
    app.use(express.static(path.join(process.cwd(), "public"), {
      maxAge: '1d'
    }));

    // Catch-all for SPA
    app.get("*", (req, res, next) => {
      // Skip API
      if (req.path.startsWith("/api/")) return next();
      
      const indexPath = path.join(distPath, "index.html");
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send("Frontend build not found. Please run 'npm run build'.");
      }
    });
  }

  // Cron Jobs
  if (NODE_ENV === "production" || process.env.ENABLE_CRON === "true") {
    // Cron logic can go here
  }

  // Global Error Handler for Express
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("Express Global Error:", err);
    res.status(500).send("Internal Server Error");
  });

  app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT} in ${NODE_ENV} mode`);
    console.log(`Base URL: ${BASE_URL}`);
  });
}

// Process Error Handlers
process.on("uncaughtException", (err) => {
  console.error("CRITICAL: Uncaught Exception:", err);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("CRITICAL: Unhandled Rejection at:", promise, "reason:", reason);
});

startServer().catch(err => {
  console.error("FAILED TO START SERVER:", err);
  process.exit(1);
});
