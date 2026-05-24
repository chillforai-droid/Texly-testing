import { supabase } from '../lib/supabase';
import { BlogPost, BLOG_POSTS } from '../data/blog';

const STORAGE_KEY = 'texly_blogs';

// Helper to generate slug from title
export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s\u0900-\u097F-]+/g, '') // Allow Hindi characters, word chars, spaces, and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

// Helper to generate excerpt from content
export const getExcerpt = (content: string): string => {
  const plainText = content.replace(/<[^>]*>/g, '');
  return plainText.slice(0, 160) + (plainText.length > 160 ? '...' : '');
};

// Map Supabase snake_case to BlogPost camelCase
const mapFromSupabase = (data: any): BlogPost => ({
  id: data.id,
  title: data.title || 'Untitled',
  slug: data.slug || '',
  excerpt: data.excerpt || '',
  content: data.content || '',
  // Use created_at for the date display
  date: new Date(data.created_at).toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  }),
  author: data.author || 'Texly',
  image: data.cover_image || 'https://picsum.photos/seed/blog/800/600',
  category: data.category || 'General',
  readTime: data.read_time || '5 min read',
  tags: data.tags || [],
  userId: data.user_id, // Track ownership
  contentType: data.content_type || 'markdown',
  language: data.language || 'en',
  metaTitle: data.meta_title || '',
  metaKeywords: data.meta_keywords || '',
  metaDescription: data.meta_description || ''
});

export const getBlogs = async (userId?: string): Promise<BlogPost[]> => {
  if (!supabase) {
    console.warn('Supabase not initialized, falling back to localStorage');
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : BLOG_POSTS;
  }

  try {
    let query = supabase
      .from('articles')
      .select('*')
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      if (error.message === 'Failed to fetch') {
        console.warn('Supabase network error: Failed to fetch. Falling back to local data.');
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : BLOG_POSTS;
      }
      console.error('Supabase Fetch Error:', error.message);
      throw error;
    }

    return (data || []).map(mapFromSupabase);
  } catch (err: any) {
    if (err.message === 'Failed to fetch') {
      console.warn('Supabase network error (Catch): Failed to fetch. Falling back to local data.');
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : BLOG_POSTS;
    }
    console.error('Unexpected error in getBlogs:', err);
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : BLOG_POSTS;
  }
};

export const getBlogBySlug = async (slug: string): Promise<BlogPost | null> => {
  if (!supabase) {
    const blogs = await getBlogs();
    return blogs.find(b => b.slug === slug) || null;
  }

  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (error) {
      if (error.message === 'Failed to fetch') {
        console.warn('Supabase network error (Slug): Failed to fetch. Falling back to local data.');
        const blogs = await getBlogs();
        return blogs.find(b => b.slug === slug) || null;
      }
      console.error('Supabase Fetch Error (Slug):', error.message);
      throw error;
    }

    return data ? mapFromSupabase(data) : null;
  } catch (err) {
    console.error('Unexpected error in getBlogBySlug:', err);
    throw err;
  }
};

