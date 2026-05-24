/**
 * api/seo-page.ts
 * AI SEO Automation Panel द्वारा push किए गए pages को serve करता है।
 *
 * Priority:
 *   1. Local data/pages.json (fastest, always available)
 *   2. GitHub fallback (अगर local file न हो)
 *
 * GET /api/seo-page?slug=remove-whitespace-online
 */

import fs from "fs";
import path from "path";

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { slug } = req.query;

  if (!slug || typeof slug !== "string") {
    return res.status(400).json({ error: "slug parameter required" });
  }

  try {
    let pages: any[] | null = null;

    // ── Step 1: Local file पहले try करो (fast & reliable) ──────────────────
    const localPaths = [
      path.join(process.cwd(), "data", "pages.json"),
      path.join(__dirname, "..", "data", "pages.json"),
    ];

    for (const localPath of localPaths) {
      try {
        if (fs.existsSync(localPath)) {
          const raw = fs.readFileSync(localPath, "utf-8");
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            pages = parsed;
            console.log(`[SEO-PAGE] Local file loaded: ${localPath} (${pages.length} pages)`);
            break;
          }
        }
      } catch (localErr) {
        console.warn(`[SEO-PAGE] Local file read failed (${localPath}):`, localErr);
      }
    }

    // ── Step 2: GitHub fallback अगर local file न मिले ──────────────────────
    if (!pages) {
      const githubRepo = process.env.SEO_GITHUB_REPO || "chillforai/Texly";
      const githubToken = process.env.SEO_GITHUB_TOKEN || "";
      const branch = process.env.SEO_GITHUB_BRANCH || "main";
      const filePath = process.env.SEO_PAGES_FILE || "data/pages.json";
      const rawUrl = `https://raw.githubusercontent.com/${githubRepo}/${branch}/${filePath}`;

      console.log(`[SEO-PAGE] Local not found, fetching GitHub: ${rawUrl}`);

      const headers: Record<string, string> = {
        "Accept": "application/vnd.github.v3.raw",
        "User-Agent": "texly-seo-page-api",
        "Cache-Control": "no-cache",
      };
      if (githubToken) {
        headers["Authorization"] = `token ${githubToken}`;
      }

      const pagesRes = await fetch(rawUrl, {
        headers,
        signal: AbortSignal.timeout(8000),
      });

      if (!pagesRes.ok) {
        console.error(`[SEO-PAGE] GitHub fetch failed: ${pagesRes.status}`);
        return res.status(503).json({
          error: "SEO pages temporarily unavailable",
          repo: githubRepo,
          status: pagesRes.status,
        });
      }

      try {
        pages = await pagesRes.json();
      } catch (parseErr) {
        console.error("[SEO-PAGE] GitHub JSON parse error:", parseErr);
        return res.status(500).json({ error: "Invalid pages.json format" });
      }
    }

    if (!Array.isArray(pages)) {
      return res.status(500).json({ error: "Invalid pages.json structure" });
    }

    const page = pages.find((p: any) => p.slug === slug);

    if (!page) {
      console.warn(`[SEO-PAGE] Slug not found: ${slug} (total: ${pages.length})`);
      return res.status(404).json({
        error: "Page not found",
        slug,
        availablePages: pages.length,
      });
    }

    res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=60");
    res.setHeader("Content-Type", "application/json");
    return res.status(200).json({ success: true, page });

  } catch (err: any) {
    console.error("[SEO-PAGE] Unexpected error:", err.message);
    return res.status(500).json({ error: "Internal server error", detail: err.message });
  }
}
