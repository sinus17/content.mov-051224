-- Drop and recreate hot50_current materialized view with correct columns
DROP MATERIALIZED VIEW IF EXISTS hot50_current;

CREATE MATERIALIZED VIEW hot50_current AS
SELECT 
    h.rank,
    h.previous_rank as previous_rank,
    h.weeks_on_chart,
    t.id as track_id,
    t.title,
    t.artist,
    t.sound_page_url,
    t.album_cover_url,
    h.date,
    (
        SELECT json_agg(json_build_object(
            'id', v.id,
            'video_url', v.video_url,
            'thumbnail_url', v.thumbnail_url,
            'description', v.description,
            'view_count', v.view_count,
            'like_count', v.like_count,
            'share_count', v.share_count,
            'comment_count', v.comment_count,
            'author', json_build_object(
                'id', a.id,
                'unique_id', a.unique_id,
                'nickname', a.nickname
            )
        ))
        FROM videos v
        LEFT JOIN authors a ON a.id = v.author_id
        WHERE v.track_id = t.id
    ) as videos
FROM hot50 h
JOIN tracks t ON t.id = h.track_id
WHERE h.date = current_date
ORDER BY h.rank;

-- Create unique index on rank
CREATE UNIQUE INDEX hot50_current_rank_idx ON hot50_current(rank);

-- Create function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_hot50_current()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY hot50_current;
    RETURN NULL;
END;
$$;

-- Create trigger to refresh view when hot50 table changes
DROP TRIGGER IF EXISTS refresh_hot50_current_trigger ON hot50;
CREATE TRIGGER refresh_hot50_current_trigger
AFTER INSERT OR UPDATE OR DELETE ON hot50
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_hot50_current();

-- Create trigger to refresh view when videos table changes
DROP TRIGGER IF EXISTS refresh_hot50_current_videos_trigger ON videos;
CREATE TRIGGER refresh_hot50_current_videos_trigger
AFTER INSERT OR UPDATE OR DELETE ON videos
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_hot50_current();

-- Refresh the view immediately
REFRESH MATERIALIZED VIEW CONCURRENTLY hot50_current;