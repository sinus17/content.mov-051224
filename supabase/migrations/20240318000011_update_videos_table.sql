-- Add missing columns to videos table
ALTER TABLE videos
  ADD COLUMN IF NOT EXISTS video_url text,
  ADD COLUMN IF NOT EXISTS thumbnail_url text,
  ADD COLUMN IF NOT EXISTS author_url text,
  ADD COLUMN IF NOT EXISTS author_profilepicture_url text;

-- Make columns nullable
ALTER TABLE videos
  ALTER COLUMN video_url DROP NOT NULL,
  ALTER COLUMN thumbnail_url DROP NOT NULL,
  ALTER COLUMN author_url DROP NOT NULL,
  ALTER COLUMN author_profilepicture_url DROP NOT NULL;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS videos_video_url_idx ON videos(video_url);
CREATE INDEX IF NOT EXISTS videos_author_url_idx ON videos(author_url);

-- Update RLS policies
DROP POLICY IF EXISTS "Enable read access for all users" ON videos;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON videos;

CREATE POLICY "Enable read access for all users" 
ON videos FOR SELECT 
USING (true);

CREATE POLICY "Enable insert access for authenticated users" 
ON videos FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users" 
ON videos FOR UPDATE
USING (true)
WITH CHECK (true);