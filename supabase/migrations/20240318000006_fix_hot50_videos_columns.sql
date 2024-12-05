-- Add missing columns and fix constraints for hot50_videos tables
DO $$
DECLARE
    i INTEGER;
BEGIN
    FOR i IN 1..50 LOOP
        EXECUTE format('
            -- Add thumbnail_url column if it doesn't exist
            DO $$ 
            BEGIN
                ALTER TABLE hot50_videos_%s ADD COLUMN IF NOT EXISTS thumbnail_url text;
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
        ', i, i);
    END LOOP;
END $$;