import { BlogPost } from "../data/blog";

// Multiple public LibreTranslate instances to ensure reliability
const MIRRORS = [
  "https://libretranslate.de/translate",
  "https://translate.argosopentech.com/translate",
  "https://translate.terraprint.co/translate",
  "https://libretranslate.pussthecat.org/translate"
];

const fetchWithFallback = async (payload: any): Promise<string | null> => {
  for (const mirror of MIRRORS) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

      const res = await fetch(mirror, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        return data.translatedText || null;
      }
    } catch (error) {
      console.warn(`Mirror ${mirror} failed, trying next...`);
      continue;
    }
  }
  return null;
};

export const translateText = async (text: string, targetLanguage: string): Promise<string> => {
  if (!text || targetLanguage === 'en') return text;

  const langMap: Record<string, string> = {
    'hi': 'hi',
    'hn': 'hi' 
  };

  const target = langMap[targetLanguage] || 'hi';

  const translated = await fetchWithFallback({
    q: text,
    source: "en",
    target: target,
    format: "text",
    api_key: ""
  });

  return translated || text;
};

export const translateBlog = async (blog: BlogPost, targetLanguage: string): Promise<BlogPost> => {
  if (targetLanguage === 'en' || blog.language === targetLanguage) return blog;

  try {
    // Translate title and excerpt
    const [translatedTitle, translatedExcerpt] = await Promise.all([
      translateText(blog.title, targetLanguage),
      translateText(blog.excerpt, targetLanguage)
    ]);

    // Translate content
    const translatedContent = await fetchWithFallback({
      q: blog.content,
      source: "en",
      target: targetLanguage === 'hn' ? 'hi' : targetLanguage,
      format: blog.contentType === 'html' ? 'html' : 'text',
      api_key: ""
    });

    return {
      ...blog,
      title: translatedTitle,
      excerpt: translatedExcerpt,
      content: translatedContent || blog.content,
      language: targetLanguage
    };
  } catch (error) {
    console.error("Blog translation failed:", error);
    return blog;
  }
};

export const translateBlogs = async (blogs: BlogPost[], targetLanguage: string): Promise<BlogPost[]> => {
  if (targetLanguage === 'en') return blogs;

  // Translate only titles and excerpts for the list to save time/resources
  return Promise.all(blogs.map(async (blog) => {
    if (blog.language === targetLanguage) return blog;
    
    try {
      const [title, excerpt] = await Promise.all([
        translateText(blog.title, targetLanguage),
        translateText(blog.excerpt, targetLanguage)
      ]);

      return {
        ...blog,
        title,
        excerpt,
        language: targetLanguage
      };
    } catch (error) {
      return blog;
    }
  }));
};
