-- Add file_url column to videos table and all hot50_videos tables
DO $$
BEGIN
    -- Add to main videos table
    ALTER TABLE videos 
    ADD COLUMN IF NOT EXISTS file_url text;

    -- Add to all hot50_videos tables
    FOR i IN 1..50 LOOP
        EXECUTE format('
            ALTER TABLE hot50_videos_%s 
            ADD COLUMN IF NOT EXISTS file_url text;
            
            -- Create index for file_url
            CREATE INDEX IF NOT EXISTS hot50_videos_%s_file_url_idx ON hot50_videos_%s(file_url);
        ', i, i, i);
    END LOOP;
END $$;