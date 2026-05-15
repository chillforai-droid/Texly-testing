import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Robust check for valid Supabase configuration
const isValidConfig = (url: string, key: string) => {
  if (!url || !key) return false;
  if (url.includes('your_supabase_url') || key.includes('your_supabase_anon_key')) return false;
  if (url === 'undefined' || key === 'undefined') return false;
  
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
  } catch {
    return false;
  }
};

export const supabase = isValidConfig(supabaseUrl, supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      },
      global: {
        fetch: (url, options) => {
          return fetch(url, options).catch(err => {
            if (err.message === 'Failed to fetch') {
              return new Response(JSON.stringify({
                error: { message: 'Failed to fetch', isNetworkError: true }
              }), {
                status: 503,
                headers: { 'Content-Type': 'application/json' }
              });
            }
            throw err;
          });
        }
      }
    })
  : null;
