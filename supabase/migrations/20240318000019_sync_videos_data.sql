-- Function to sync videos between hot50_videos and main videos table
CREATE OR REPLACE FUNCTION sync_videos_data()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    i INTEGER;
BEGIN
    -- For each hot50_videos table
    FOR i IN 1..50 LOOP
        -- Insert missing videos into main videos table
        EXECUTE format('
            INSERT INTO videos (
                id,
                track_id,
                description,
                author_id,
                video_url,
                thumbnail_url,
                author_url,
                author_profilepicture_url,
                created_at,
                updated_at
            )
            SELECT 
                COALESCE(SPLIT_PART(video_url, ''video/'', 2), gen_random_uuid()::text) as id,
                track_id,
                description,
                author_id,
                video_url,
                thumbnail_url,
                author_url,
                author_profilepicture_url,
                created_at,
                NOW()
            FROM hot50_videos_%s h
            WHERE NOT EXISTS (
                SELECT 1 
                FROM videos v 
                WHERE v.video_url = h.video_url
            )
            ON CONFLICT (id) DO UPDATE
            SET updated_at = NOW()',
            i
        );
    END LOOP;
END;
$$;

-- Run the sync function
SELECT sync_videos_data();