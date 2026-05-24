-- Run this in Supabase SQL Editor
-- Automation Panel users table

CREATE TABLE IF NOT EXISTS automation_users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Disable Row Level Security for this internal table (या अपनी policy add करें)
ALTER TABLE automation_users DISABLE ROW LEVEL SECURITY;

-- Optional: एक default admin user insert करें (पहली बार के लिए)
-- INSERT INTO automation_users (username, password) VALUES ('admin', 'admin123')
-- ON CONFLICT DO NOTHING;
