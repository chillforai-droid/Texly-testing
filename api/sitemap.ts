export default async function handler(req: any, res: any) {
  try {
    const baseUrl = process.env.BASE_URL || "https://www.texlyonline.in";
    const today = new Date().toISOString().split('T')[0];
    
    // Hardcoded tool slugs for stability (as requested)
    const toolSlugs = [
      "face-swap", "bg-remover", "enhancer", "compressor", 
      "image-upscale", "image-generator", "snapchat-tag-generator", "remove-extra-spaces-online", 
      "remove-line-breaks-tool", "remove-duplicate-lines-tool", "remove-empty-lines-online", 
      "remove-numbers-from-text", "military-alphabet-converter", "remove-special-characters-online", 
      "remove-html-tags-online", "upper-case-converter", "lower-case-converter", "title-case-converter", 
      "slug-generator-online-free", "binary-to-text-converter", "text-to-binary-converter", 
      "word-counter-online-free", "character-counter-tool", "clean-text-online-free", 
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
      "json-to-text-converter", "text-case-converter-online", "character-frequency-counter", 
      "word-length-statistics", "markdown-to-plain-text", "image-to-text-extractor", 
      "pregnancy-due-date-calculator", "text-steganography-hidden-message", 
      "password-generator-strength-meter", "jwt-decoder-online", "sql-formatter-online", 
      "json-to-csv-converter-online", "invisible-text-generator", "youtube-timestamp-generator", 
      "fancy-text-generator-online", "braille-translator-online", "text-diff-checker-online", 
      "pdf-editor-online", "image-to-pdf-converter", "pdf-to-image-converter", "generate-pdf-online", 
      "compress-pdf-online", "reduce-pdf-size-online", "remove-pdf-password-online", 
      "pdf-to-excel-converter", "excel-to-pdf-converter", "word-to-pdf-converter", 
      "pdf-to-word-converter", "merge-pdf-online", "split-pdf-online", "rotate-pdf-online", "whatsapp-text-formatter", "number-to-words-converter", 
      
      "ai-script-generator"
    ];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // Static Pages
    const staticPages = [
      { path: "/", priority: "1.0", changefreq: "daily" },
      { path: "/blog", priority: "0.8", changefreq: "daily" },
      { path: "/about-us", priority: "0.5", changefreq: "monthly" },
      { path: "/privacy-policy", priority: "0.3", changefreq: "monthly" },
      { path: "/terms-and-conditions", priority: "0.3", changefreq: "monthly" },
      { path: "/contact-us", priority: "0.5", changefreq: "monthly" }
    ];

    staticPages.forEach(p => {
      xml += `\n  <url>\n    <loc>${baseUrl}${p.path}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${p.changefreq}</changefreq>\n    <priority>${p.priority}</priority>\n  </url>`;
    });

    // Tools (Static List)
    toolSlugs.forEach(slug => {
      xml += `\n  <url>\n    <loc>${baseUrl}/tool/${slug}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>`;
    });

    // Dynamic Blog Posts (Supabase)
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";

    if (supabaseUrl && supabaseAnonKey) {
      try {
        const { createClient } = await import("@supabase/supabase-js");
        const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
      } catch (dbErr) {
        console.error("[SITEMAP] Supabase Fetch Error:", dbErr);
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
