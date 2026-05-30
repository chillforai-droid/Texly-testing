export default async function handler(req: any, res: any) {
  try {
    const baseUrl = process.env.BASE_URL || "https://www.texlyonline.in";
    const today = new Date().toISOString().split('T')[0];
    
    const toolSlugs = [
      /* AI tools are listed in specialToolSlugs (/tools/ path) above — do not duplicate here */
      "remove-extra-spaces-online", 
      "remove-line-breaks-tool", "remove-duplicate-lines-tool", "remove-empty-lines-online", 
      "remove-numbers-from-text", "military-alphabet-converter", "remove-special-characters-online", 
      "remove-html-tags-online", "upper-case-converter", "lower-case-converter", "title-case-converter", 
      "slug-generator-online-free", "binary-to-text-converter", "text-to-binary-converter", 
      "word-counter-online-free", "letter-counter-online-free", "clean-text-online-free", 
      "reading-time-calculator-online", "text-reverser-online", "text-repeater-tool", 
      "lorem-ipsum-generator-online", "find-and-replace-text-online", "sort-lines-alphabetically", 
      "camel-case-converter", "snake-case-converter", "kebab-case-converter", "pascal-case-converter", 
      "constant-case-converter", "alternating-case-converter", "inverse-case-converter", 
      "sentence-case-converter", "remove-accents-from-text", "remove-emojis-online", 
      "remove-punctuation-tool", "base64-encode-online", "base64-decode-online", "url-encode-online", 
      "url-decode-online", "rot13-cipher-online", "morse-code-translator", "upside-down-text-generator", 
      "mirror-text-generator", "qr-code-generator-online", "unit-converter-online", 
      "color-palette-generator-online", "base64-to-image-converter", "age-calculator-online", 
      "line-counter-online", "sentence-counter-online", "paragraph-counter-online", 
      "text-to-list-converter", "add-prefix-suffix-to-lines", "random-string-generator-online", 
      "remove-all-whitespace-online", "text-density-analyzer", "case-distribution-analyzer", 
      "json-formatter-online", "csv-to-json-converter", "extract-emails-from-text", 
      "extract-urls-from-text", "text-to-hex-converter", "hex-to-text-converter", 
      "html-entity-encoder", "html-entity-decoder", "remove-duplicate-words-online", 
      "zalgo-text-generator", "nato-phonetic-alphabet-translator", "ascii-banner-generator", 
      "trim-text-online", "whitespace-remover-online", "text-to-json-converter-online", 
      "json-to-text-converter", "character-frequency-counter", 
      "word-length-statistics", "markdown-to-plain-text", "image-to-text-extractor", 
      "pregnancy-due-date-calculator", "text-steganography-hidden-message", 
      "password-generator-strength-meter", "jwt-decoder-online", "sql-formatter-online", 
      "json-to-csv-converter-online", "invisible-text-generator", "youtube-timestamp-generator", 
      "fancy-text-generator-online", "braille-translator-online", "text-diff-checker-online", 
      "pdf-editor-online", "image-to-pdf-converter", "pdf-to-image-converter", "generate-pdf-online", 
      "compress-pdf-online", "reduce-pdf-size-online", "remove-pdf-password-online", 
      "pdf-to-excel-converter", "excel-to-pdf-converter", "word-to-pdf-converter", 
      "pdf-to-word-converter", "merge-pdf-online", "split-pdf-online", "rotate-pdf-online", 
      "whatsapp-text-formatter", "number-to-words-converter"
    ];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // Static Pages
    const staticPages = [
      { path: "/", priority: "1.0", changefreq: "daily" },
      { path: "/ai-automation", priority: "0.7", changefreq: "monthly" },
      { path: "/blog", priority: "0.8", changefreq: "daily" },
      { path: "/remove-special-characters-online", priority: "0.95", changefreq: "weekly" },
      { path: "/best-free-text-tools-online", priority: "0.85", changefreq: "monthly" },
      { path: "/about-us", priority: "0.5", changefreq: "monthly" },
      { path: "/privacy-policy", priority: "0.3", changefreq: "monthly" },
      { path: "/terms-and-conditions", priority: "0.3", changefreq: "monthly" },
      { path: "/contact-us", priority: "0.5", changefreq: "monthly" }
    ];

    staticPages.forEach(p => {
      xml += `\n  <url>\n    <loc>${baseUrl}${p.path}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${p.changefreq}</changefreq>\n    <priority>${p.priority}</priority>\n  </url>`;
    });

    // ── Special AI/Generator Tools — /tools/ path ─────────────────────────────
    const specialToolSlugs = [
      "invisible-text-suite",
      "ai-text-suite",
      "face-swap",
      "bg-remover",
      "enhancer",
      "compressor",
      "image-upscale",
      "image-generator",
      "snapchat-tag-generator",
      // ── Dev Utility Tools ──
      "robots-txt-tester",
      "json-path-finder",
      "regex-explainer",
      "cron-expression-generator",
      "redirect-chain-checker",
    ];
    specialToolSlugs.forEach(slug => {
      xml += `\n  <url>\n    <loc>${baseUrl}/tools/${slug}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.9</priority>\n  </url>`;
    });

    // Tools
    const toolsLastmod = "2026-05-27";
    toolSlugs.forEach(slug => {
      xml += `\n  <url>\n    <loc>${baseUrl}/tool/${slug}</loc>\n    <lastmod>${toolsLastmod}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>`;
    });

    // ── AI SEO Automation: GitHub से pages.json fetch करो ─────────────────
    try {
      let githubRepo = process.env.SEO_GITHUB_REPO || "chillforai-droid/Texly";
      // Full GitHub URL हो तो owner/repo format में convert करो
      if (githubRepo.includes("github.com/")) {
        githubRepo = githubRepo.split("github.com/")[1].replace(/\.git$/, "").replace(/\/$/, "");
      }
      const githubToken = process.env.SEO_GITHUB_TOKEN || "";
      const rawUrl = `https://raw.githubusercontent.com/${githubRepo}/main/data/pages.json`;

      const headers: Record<string, string> = {
        "Accept": "application/vnd.github.v3.raw",
        "User-Agent": "texly-sitemap-bot"
      };
      if (githubToken) {
        headers["Authorization"] = `token ${githubToken}`;
      }

      const pagesRes = await fetch(rawUrl, { headers });

      if (pagesRes.ok) {
        const seoPages: Array<{
          slug: string;
          updatedAt?: string;
          createdAt?: string;
        }> = await pagesRes.json();

        seoPages.forEach((page) => {
          const lastmod = page.updatedAt
            ? new Date(page.updatedAt).toISOString().split("T")[0]
            : today;
          xml += `\n  <url>\n    <loc>${baseUrl}/seo/${page.slug}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.75</priority>\n  </url>`;
        });

        console.log(`[SITEMAP] AI SEO pages loaded: ${seoPages.length}`);
      } else {
        console.warn(`[SITEMAP] pages.json fetch failed: ${pagesRes.status} — skipping AI pages`);
      }
    } catch (seoErr) {
      console.error("[SITEMAP] AI SEO pages fetch error:", seoErr);
      // graceful degradation — sitemap without AI pages
    }

    // ── Dynamic Content from Supabase (Blogs + AI Tools) ───────────────────────
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";

    if (supabaseUrl && supabaseAnonKey) {
      try {
        const { createClient } = await import("@supabase/supabase-js");
        const supabase = createClient(supabaseUrl, supabaseAnonKey);

        // Blog posts
        const { data: articles } = await supabase
          .from("articles")
          .select("slug, updated_at, created_at")
          .limit(1000);

        if (articles) {
          articles.forEach((article: any) => {
            const lastModDate = new Date(article.updated_at || article.created_at || Date.now())
              .toISOString()
              .split("T")[0];
            xml += `\n  <url>\n    <loc>${baseUrl}/blog/${article.slug}</loc>\n    <lastmod>${lastModDate}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>`;
          });
        }

        // Dynamic AI Tools
        const { data: aiTools } = await supabase
          .from("ai_tools")
          .select("slug, category, updated_at, created_at")
          .eq("is_active", true)
          .limit(500);

        if (aiTools) {
          aiTools.forEach((tool: any) => {
            if (toolSlugs.includes(tool.slug) || specialToolSlugs.includes(tool.slug)) return;
            const lastmod = tool.updated_at
              ? new Date(tool.updated_at).toISOString().split("T")[0]
              : today;
            const toolPath = (tool.category === "ai" || tool.category === "generator")
              ? `/tools/${tool.slug}`
              : `/tool/${tool.slug}`;
            xml += `\n  <url>\n    <loc>${baseUrl}${toolPath}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`;
          });
          console.log(`[SITEMAP] Dynamic AI tools: ${aiTools.length}`);
        }
      } catch (dbErr) {
        console.error("[SITEMAP] Supabase error:", dbErr);
      }
    }

    xml += "\n</urlset>";

    res.setHeader("Content-Type", "text/xml; charset=utf-8");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=59");
    res.status(200).send(xml);
  } catch (err) {
    console.error("[SITEMAP] Handler crash:", err);
    res.status(500).send("Error generating sitemap");
  }
}
