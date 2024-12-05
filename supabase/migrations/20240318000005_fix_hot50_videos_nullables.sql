-- Update schema for all hot50_videos tables to make certain fields nullable
DO $$
DECLARE
    i INTEGER;
BEGIN
    FOR i IN 1..50 LOOP
        EXECUTE format('
            ALTER TABLE hot50_videos_%s 
            ALTER COLUMN video_url DROP NOT NULL,
            ALTER COLUMN video_thumbnail_url DROP NOT NULL,
            ALTER COLUMN description DROP NOT NULL,
            ALTER COLUMN author_url DROP NOT NULL,
            ALTER COLUMN author_profilepicture_url DROP NOT NULL
        ', i);
    END LOOP;
END $$;