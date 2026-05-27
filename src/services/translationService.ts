import { BlogPost } from "../data/blog";

// ─── Google Translate (unofficial, free, no key needed) ──────────────────────
// Uses the same endpoint that Google Translate web app uses.
// Chunking is required: GT rejects requests over ~4500 chars.
const GT_URL = "https://translate.googleapis.com/translate_a/single";

const CHUNK_SIZE = 4000; // characters per request (safe limit for GT)

/** Split long text into sentences/paragraphs so each chunk ≤ CHUNK_SIZE */
function splitIntoChunks(text: string, maxLen = CHUNK_SIZE): string[] {
  if (text.length <= maxLen) return [text];
  const chunks: string[] = [];
  let current = "";
  // Split on paragraph breaks first, then sentences
  const paragraphs = text.split(/(\n{1,})/);
  for (const para of paragraphs) {
    if ((current + para).length > maxLen && current.length > 0) {
      chunks.push(current);
      current = "";
    }
    if (para.length > maxLen) {
      // Single paragraph too long — split by sentences
      const sentences = para.split(/(?<=[.!?।])\s+/);
      for (const sent of sentences) {
        if ((current + sent).length > maxLen && current.length > 0) {
          chunks.push(current);
          current = "";
        }
        current += sent + " ";
      }
    } else {
      current += para;
    }
  }
  if (current.trim()) chunks.push(current);
  return chunks;
}

/** Translate plain text using Google Translate (free, unofficial) */
const googleTranslateText = async (
  text: string,
  target: string,
  retries = 2
): Promise<string | null> => {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const params = new URLSearchParams({
        client: "gtx",
        sl: "en",
        tl: target,
        dt: "t",
        q: text,
      });
      const res = await fetch(`${GT_URL}?${params}`, {
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) continue;
      const data = await res.json();
      // Response shape: [[["translated","original",...],...],...]
      if (Array.isArray(data) && Array.isArray(data[0])) {
        return (data[0] as any[][])
          .map((item: any[]) => item[0] || "")
          .join("");
      }
    } catch {
      if (attempt < retries) await new Promise((r) => setTimeout(r, 600));
    }
  }
  return null;
};

/** Translate HTML content: extract text nodes, translate, re-insert */
const translateHtmlContent = async (
  html: string,
  target: string
): Promise<string> => {
  // Strategy: use a DOMParser-like approach in browser
  // We'll use a temporary div via a regex approach that preserves tags
  // Extract all text between tags, translate, reinsert
  
  // Split HTML into "tag" and "text" segments
  const segments: { type: "tag" | "text"; value: string }[] = [];
  let remaining = html;
  const tagRegex = /(<[^>]+>|<!--[\s\S]*?-->)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tagRegex.exec(html)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        type: "text",
        value: html.slice(lastIndex, match.index),
      });
    }
    segments.push({ type: "tag", value: match[0] });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < html.length) {
    segments.push({ type: "text", value: html.slice(lastIndex) });
  }

  // Collect text segments that are non-empty
  const textSegs = segments
    .map((s, i) => ({ ...s, idx: i }))
    .filter(
      (s) => s.type === "text" && s.value.trim().length > 0
    );

  if (textSegs.length === 0) return html;

  // Batch text segments into chunks ≤ CHUNK_SIZE using a delimiter
  const DELIM = " §§§ ";
  const batches: { indices: number[]; text: string }[] = [];
  let batch: { indices: number[]; text: string } = { indices: [], text: "" };

  for (const seg of textSegs) {
    const addition = (batch.text ? DELIM : "") + seg.value;
    if ((batch.text + addition).length > CHUNK_SIZE && batch.text.length > 0) {
      batches.push(batch);
      batch = { indices: [], text: "" };
    }
    batch.indices.push(seg.idx);
    batch.text += (batch.text ? DELIM : "") + seg.value;
  }
  if (batch.text) batches.push(batch);

  // Translate each batch
  for (const b of batches) {
    const translated = await googleTranslateText(b.text, target);
    if (!translated) continue;
    const parts = translated.split(DELIM);
    b.indices.forEach((segIdx, i) => {
      if (parts[i] !== undefined) {
        segments[segIdx].value = parts[i];
      }
    });
  }

  return segments.map((s) => s.value).join("");
};

/** Translate long plain text in chunks */
const translateLongText = async (
  text: string,
  target: string
): Promise<string> => {
  const chunks = splitIntoChunks(text);
  const results: string[] = [];
  for (const chunk of chunks) {
    const t = await googleTranslateText(chunk, target);
    results.push(t || chunk);
  }
  return results.join("");
};

// ─── Language mapping ─────────────────────────────────────────────────────────
const LANG_MAP: Record<string, string> = {
  hi: "hi",
  hn: "hi", // Hinglish → Hindi
};

// ─── Public API ───────────────────────────────────────────────────────────────

export const translateText = async (
  text: string,
  targetLanguage: string
): Promise<string> => {
  if (!text || targetLanguage === "en") return text;
  const target = LANG_MAP[targetLanguage] || targetLanguage;
  const chunks = splitIntoChunks(text);
  if (chunks.length === 1) {
    return (await googleTranslateText(text, target)) || text;
  }
  return translateLongText(text, target);
};

export const translateBlog = async (
  blog: BlogPost,
  targetLanguage: string
): Promise<BlogPost> => {
  if (targetLanguage === "en" || blog.language === targetLanguage) return blog;

  const target = LANG_MAP[targetLanguage] || targetLanguage;

  try {
    const [translatedTitle, translatedExcerpt] = await Promise.all([
      translateText(blog.title, targetLanguage),
      translateText(blog.excerpt, targetLanguage),
    ]);

    let translatedContent: string;
    if (blog.contentType === "html") {
      translatedContent = await translateHtmlContent(blog.content, target);
    } else {
      translatedContent = await translateLongText(blog.content, target);
    }

    return {
      ...blog,
      title: translatedTitle,
      excerpt: translatedExcerpt,
      content: translatedContent || blog.content,
      language: targetLanguage,
    };
  } catch (error) {
    console.error("Blog translation failed:", error);
    return blog;
  }
};

export const translateBlogs = async (
  blogs: BlogPost[],
  targetLanguage: string
): Promise<BlogPost[]> => {
  if (targetLanguage === "en") return blogs;

  return Promise.all(
    blogs.map(async (blog) => {
      if (blog.language === targetLanguage) return blog;
      try {
        const [title, excerpt] = await Promise.all([
          translateText(blog.title, targetLanguage),
          translateText(blog.excerpt, targetLanguage),
        ]);
        return { ...blog, title, excerpt, language: targetLanguage };
      } catch {
        return blog;
      }
    })
  );
};
