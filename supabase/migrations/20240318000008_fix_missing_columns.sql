-- Update schema for all hot50_videos tables to ensure all required columns exist
DO $$
DECLARE
    i INTEGER;
BEGIN
    FOR i IN 1..50 LOOP
        EXECUTE format('
            -- Add missing columns if they don't exist
            DO $$
            BEGIN
                ALTER TABLE hot50_videos_%s 
                    ADD COLUMN IF NOT EXISTS video_url text,
                    ADD COLUMN IF NOT EXISTS author_url text,
                    ADD COLUMN IF NOT EXISTS author_thumbnail_url text,
                    ADD COLUMN IF NOT EXISTS author_profilepicture_url text,
                    ADD COLUMN IF NOT EXISTS thumbnail_url text;
            EXCEPTION
                WHEN duplicate_column THEN NULL;
            END $$;

            -- Ensure all columns are nullable
            ALTER TABLE hot50_videos_%s 
                ALTER COLUMN video_url DROP NOT NULL,
                ALTER COLUMN author_url DROP NOT NULL,
                ALTER COLUMN author_thumbnail_url DROP NOT NULL,
                ALTER COLUMN author_profilepicture_url DROP NOT NULL,
                ALTER COLUMN thumbnail_url DROP NOT NULL;

            -- Create indexes for performance
            CREATE INDEX IF NOT EXISTS %I ON hot50_videos_%s (video_url);
            CREATE INDEX IF NOT EXISTS %I ON hot50_videos_%s (author_url);
        ', 
        i, i,
        format('hot50_videos_%s_video_url_idx', i), i,
        format('hot50_videos_%s_author_url_idx', i), i
        );
    END LOOP;
END $$;