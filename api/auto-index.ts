import { createClient } from "@supabase/supabase-js";
import { ALL_TOOLS } from "../src/data/tools";
import dotenv from "dotenv";
import fetch from "node-fetch";

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

// Initialize Supabase for backend use - Support both VITE_ and standard env vars
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";

let supabase: any = null;
try {
  if (supabaseUrl && supabaseAnonKey) {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
} catch (e) {
  console.error("Auto-Index: Failed to initialize Supabase client:", e);
}

export default async function handler(req: any, res: any) {
  const forceAll = req.query.forceAll === 'true';
  console.log(`Auto-Index: Starting URL submission (forceAll: ${forceAll})...`);
  
  try {
    const baseUrl = process.env.BASE_URL || "https://www.texlyonline.in";
    const staticPages = [
      baseUrl,
      `${baseUrl}/tools`,
      `${baseUrl}/blog`,
      `${baseUrl}/about`,
      `${baseUrl}/privacy`,
      `${baseUrl}/terms`,
      `${baseUrl}/contact`,
    ];

    const urlsToSubmit = new Set<string>();

    // 1. Handle Static Pages and Tools (Only if forceAll or once a day)
    // For simplicity, we'll add them if forceAll is true or if it's a scheduled run
    if (forceAll) {
      staticPages.forEach(url => urlsToSubmit.add(url));
      if (Array.isArray(ALL_TOOLS)) {
        ALL_TOOLS.forEach((tool) => {
          if (tool && tool.slug) {
            urlsToSubmit.add(`${baseUrl}/tool/${tool.slug}`);
          }
        });
      }
    }

    // 2. Fetch Blog URLs from Supabase (Smart Logic)
    let articlesToUpdate: string[] = [];
    if (supabase) {
      try {
        let query = supabase
          .from("articles")
          .select("id, slug, updated_at, last_indexed_at")
          .eq("status", "published");

        if (!forceAll) {
          // Only fetch new or updated articles
          // We use a trick: if last_indexed_at is null OR updated_at > last_indexed_at
          query = query.or(`last_indexed_at.is.null,updated_at.gt.last_indexed_at`);
        }

        const { data: articles, error } = await query.order("updated_at", { ascending: false });

        if (!error && articles) {
          articles.forEach((article: any) => {
            if (article.slug) {
              const url = `${baseUrl}/blog/${article.slug}`;
              urlsToSubmit.add(url);
              articlesToUpdate.push(article.id);
            }
          });
        } else if (error) {
          console.error("Auto-Index: Error fetching articles:", error);
        }
      } catch (error) {
        console.error("Auto-Index: Exception fetching articles:", error);
      }
    }

    const finalUrls = Array.from(urlsToSubmit);
    console.log(`Auto-Index: Found ${finalUrls.length} unique URLs to index`);

    if (finalUrls.length === 0) {
      return res.status(200).json({ success: true, message: "No new URLs to index" });
    }

    // 3. IndexNow Submission Logic with Batching and Retries
    const indexNowKey = process.env.INDEXNOW_KEY;
    if (!indexNowKey) {
      console.warn("Auto-Index: INDEXNOW_KEY not set, skipping submission");
      return res.status(200).json({ success: true, message: "INDEXNOW_KEY not set" });
    }

    // Batching: Max 100 URLs per request
    const batchSize = 100;
    const batches = [];
    for (let i = 0; i < finalUrls.length; i += batchSize) {
      batches.push(finalUrls.slice(i, i + batchSize));
    }

    let successCount = 0;
    let failCount = 0;

    for (const batch of batches) {
      const urlObj = new URL(baseUrl);
      const payload = {
        host: urlObj.hostname,
        key: indexNowKey,
        keyLocation: `${baseUrl}/${indexNowKey}.txt`,
        urlList: batch
      };

      const submitWithRetry = async (retryCount = 0): Promise<boolean> => {
        try {
          const response = await fetch("https://www.bing.com/indexnow", {
            method: "POST",
            headers: { "Content-Type": "application/json; charset=utf-8" },
            body: JSON.stringify(payload)
          });

          if (response.ok) return true;
          
          const errorText = await response.text();
          console.error(`Auto-Index: Batch submission failed (Attempt ${retryCount + 1}):`, errorText);
          
          if (retryCount < 1) { // Retry once
            await new Promise(r => setTimeout(r, 2000));
            return submitWithRetry(retryCount + 1);
          }
          return false;
        } catch (err) {
          console.error(`Auto-Index: Network error (Attempt ${retryCount + 1}):`, err);
          if (retryCount < 1) {
            await new Promise(r => setTimeout(r, 2000));
            return submitWithRetry(retryCount + 1);
          }
          return false;
        }
      };

      const isSuccess = await submitWithRetry();
      if (isSuccess) {
        successCount += batch.length;
      } else {
        failCount += batch.length;
      }
    }

    // 4. Update last_indexed_at in Supabase
    if (successCount > 0 && articlesToUpdate.length > 0 && supabase) {
      try {
        const { error: updateError } = await supabase
          .from("articles")
          .update({ last_indexed_at: new Date().toISOString() })
          .in("id", articlesToUpdate);
        
        if (updateError) {
          console.error("Auto-Index: Failed to update last_indexed_at:", updateError);
        } else {
          console.log(`Auto-Index: Updated last_indexed_at for ${articlesToUpdate.length} articles`);
        }
      } catch (err) {
        console.error("Auto-Index: Exception updating last_indexed_at:", err);
      }
    }

    console.log(`Auto-Index: Submission complete. Success: ${successCount}, Failed: ${failCount}`);

    res.status(200).json({ 
      success: true, 
      submitted: successCount,
      failed: failCount,
      total: finalUrls.length
    });
  } catch (err: any) {
    console.error("Auto-Index: Global error:", err);
    res.status(500).json({ error: "Internal Server Error", message: err.message });
  }
}
