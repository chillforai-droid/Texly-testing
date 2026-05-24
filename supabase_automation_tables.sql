-- ════════════════════════════════════════════════════════
-- Texly Automation Panel — Supabase Tables Setup
-- Supabase SQL Editor में एक बार यह run करें
-- ════════════════════════════════════════════════════════

-- 1. SEO Pages table
CREATE TABLE IF NOT EXISTS seo_pages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  keyword TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'Text Tools',
  intro TEXT DEFAULT '',
  metaDescription TEXT DEFAULT '',
  relatedTools TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE seo_pages DISABLE ROW LEVEL SECURITY;

-- 2. Automation Users (login/register)
CREATE TABLE IF NOT EXISTS automation_users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE automation_users DISABLE ROW LEVEL SECURITY;

-- 3. Automation Logs
CREATE TABLE IF NOT EXISTS automation_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  step TEXT DEFAULT '',
  message TEXT DEFAULT '',
  status TEXT DEFAULT 'info',
  timestamp TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE automation_logs DISABLE ROW LEVEL SECURITY;

-- 4. Automation Config
CREATE TABLE IF NOT EXISTS automation_config (
  id INTEGER PRIMARY KEY DEFAULT 1,
  githubRepo TEXT DEFAULT '',
  githubToken TEXT DEFAULT '',
  vercelWebhookUrl TEXT DEFAULT '',
  automatedFrequency TEXT DEFAULT '24-hours',
  targetPagesPerDay INTEGER DEFAULT 3,
  useGroq BOOLEAN DEFAULT false,
  groqApiKey TEXT DEFAULT '',
  groqModel TEXT DEFAULT 'llama3-70b-8192',
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE automation_config DISABLE ROW LEVEL SECURITY;
INSERT INTO automation_config (id) VALUES (1) ON CONFLICT DO NOTHING;

-- 5. Links Map (slug → URL)
CREATE TABLE IF NOT EXISTS automation_links_map (
  slug TEXT PRIMARY KEY,
  url TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE automation_links_map DISABLE ROW LEVEL SECURITY;
