-- Final fix for video columns in hot50_videos tables
DO $$
DECLARE
    i INTEGER;
BEGIN
    FOR i IN 1..50 LOOP
        EXECUTE format('
            -- Drop and recreate table with correct schema
            DROP TABLE IF EXISTS hot50_videos_%s;
            
            CREATE TABLE hot50_videos_%s (
                id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
                track_id uuid REFERENCES tracks(id) ON DELETE CASCADE,
                video_url text,
                thumbnail_url text,
                description text,
                author_id text REFERENCES authors(id) ON DELETE CASCADE,
                author_url text,
                author_profilepicture_url text,
                created_at timestamp with time zone DEFAULT timezone(''utc''::text, now()) NOT NULL
            );

            -- Create indexes
            CREATE INDEX hot50_videos_%s_track_id_idx ON hot50_videos_%s(track_id);
            CREATE INDEX hot50_videos_%s_video_url_idx ON hot50_videos_%s(video_url);
            CREATE INDEX hot50_videos_%s_author_id_idx ON hot50_videos_%s(author_id);

            -- Enable RLS
            ALTER TABLE hot50_videos_%s ENABLE ROW LEVEL SECURITY;

            -- Create policies
            CREATE POLICY "Enable read access for all users" 
                ON hot50_videos_%s FOR SELECT 
                USING (true);

            CREATE POLICY "Enable insert access for authenticated users" 
                ON hot50_videos_%s FOR INSERT 
                WITH CHECK (true);

            CREATE POLICY "Enable update access for authenticated users" 
                ON hot50_videos_%s FOR UPDATE
                USING (true)
                WITH CHECK (true);
        ', 
        i, i, 
        i, i,
        i, i,
        i, i,
        i, i, i, i
        );
    END LOOP;
END $$;