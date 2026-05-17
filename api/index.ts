console.log("API: Script starting...");
import express from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import helmet from "helmet";
import compression from "compression";
import autoIndexHandler from "./auto-index";
import aiRouter from "./ai";
import sitemapHandler from "./sitemap";

console.log("API: Initializing...");

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";

let supabase: any = null;

async function getSupabase() {
  if (supabase) return supabase;
  if (supabaseUrl && supabaseAnonKey) {
    try {
      const { createClient } = await import("@supabase/supabase-js");
      supabase = createClient(supabaseUrl, supabaseAnonKey);
      return supabase;
    } catch (e) {
      console.error("API: Failed to initialize Supabase client:", e);
    }
  }
  return null;
}

const app = express();

// Security Headers (Helmet)
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

// Gzip Compression
app.use(compression());

app.use(express.json());

// Helper for email validation
const isValidEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Health check route
app.get("/api/health", async (req, res) => {
  try {
    const client = await getSupabase();
    res.json({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV,
      supabase: !!client
    });
  } catch (error: any) {
    console.error("Health check failed:", error);
    res.status(500).json({ error: "Health check failed", message: error.message });
  }
});

// API Route for Contact Form
app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message || !isValidEmail(email)) {
      return res.status(400).json({ error: "Missing or invalid required fields" });
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log("Contact form from", email, "received (Email credentials not set)");
      return res.json({ success: true, message: "Form received (Email credentials not set)" });
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      // Fix for Railway: IPv4 and timeouts
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
      family: 4
    } as any);

    const mailOptions = {
      from: `"Texly Contact" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      replyTo: email,
      subject: `Contact Form: ${subject || "General Inquiry"}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 600px; margin: auto;">
          <h2 style="color: #2563eb;">New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject || "N/A"}</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p><strong>Message:</strong></p>
          <p style="white-space: pre-wrap;">${message}</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: "Message sent successfully" });
  } catch (error: any) {
    console.error("Error in /api/contact:", error);
    res.status(500).json({ error: "Failed to send message", details: error.message });
  }
});

// Auto-Index Route (IndexNow)
app.get("/api/auto-index", autoIndexHandler);

// Sitemap Route (for local dev and redundancy)
app.get("/sitemap.xml", sitemapHandler);

// AI Tools Routes
app.use("/api/ai", aiRouter);


// Catch-all for undefined API routes
app.all("/api/*", (req, res) => {
  res.status(404).json({ error: "API route not found" });
});

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Global Error Handler:", err);
  res.status(500).json({ 
    error: "Internal Server Error", 
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Vercel Serverless Function handler
export default function handler(req: any, res: any) {
  return app(req, res);
}
