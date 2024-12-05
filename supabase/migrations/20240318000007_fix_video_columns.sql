-- Update schema for all hot50_videos tables to ensure correct columns
DO $$
DECLARE
    i INTEGER;
BEGIN
    FOR i IN 1..50 LOOP
        EXECUTE format('
            -- Rename video_thumbnail_url to thumbnail_url if it exists
            DO $$ 
            BEGIN
                ALTER TABLE hot50_videos_%s 
                    RENAME COLUMN video_thumbnail_url TO thumbnail_url;
            EXCEPTION
                WHEN undefined_column THEN NULL;
            END $$;

            -- Add missing columns if they don't exist
            DO $$
            BEGIN
                ALTER TABLE hot50_videos_%s 
                    ADD COLUMN IF NOT EXISTS thumbnail_url text,
                    ADD COLUMN IF NOT EXISTS author_url text,
                    ADD COLUMN IF NOT EXISTS author_profilepicture_url text;
            EXCEPTION
                WHEN duplicate_column THEN NULL;
            END $$;

            -- Ensure all columns are nullable
            ALTER TABLE hot50_videos_%s 
                ALTER COLUMN video_url DROP NOT NULL,
                ALTER COLUMN thumbnail_url DROP NOT NULL,
                ALTER COLUMN description DROP NOT NULL,
                ALTER COLUMN author_url DROP NOT NULL,
                ALTER COLUMN author_profilepicture_url DROP NOT NULL;
        ', i, i, i);
    END LOOP;
END $$;