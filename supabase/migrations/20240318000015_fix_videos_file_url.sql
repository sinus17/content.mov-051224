-- Drop and recreate videos table with file_url column
DROP TABLE IF EXISTS videos CASCADE;

CREATE TABLE videos (
    id text PRIMARY KEY,
    track_id uuid REFERENCES tracks(id) ON DELETE CASCADE,
    description text,
    author_id text REFERENCES authors(id) ON DELETE CASCADE,
    view_count bigint DEFAULT 0,
    like_count bigint DEFAULT 0,
    share_count bigint DEFAULT 0,
    comment_count bigint DEFAULT 0,
    video_url text,
    thumbnail_url text,
    author_url text,
    author_profilepicture_url text,
    file_url text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX videos_track_id_idx ON videos(track_id);
CREATE INDEX videos_author_id_idx ON videos(author_id);
CREATE INDEX videos_video_url_idx ON videos(video_url);
CREATE INDEX videos_file_url_idx ON videos(file_url);

-- Enable RLS
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- Create policies
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

-- Create trigger for updated_at
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON videos
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();