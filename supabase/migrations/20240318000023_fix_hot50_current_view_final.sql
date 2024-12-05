-- Drop and recreate hot50_current materialized view with optimized structure
DROP MATERIALIZED VIEW IF EXISTS hot50_current CASCADE;

CREATE MATERIALIZED VIEW hot50_current AS
WITH ranked_tracks AS (
  SELECT 
    h.rank,
    h.previous_rank,
    h.weeks_on_chart,
    t.id as track_id,
    t.title,
    t.artist,
    t.sound_page_url,
    t.album_cover_url,
    h.date
  FROM hot50 h
  JOIN tracks t ON t.id = h.track_id
  WHERE h.date = current_date
  ORDER BY h.rank
)
SELECT 
  rt.*,
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
    FROM (
      SELECT DISTINCT ON (v.id) v.*
      FROM videos v
      WHERE v.track_id = rt.track_id
      ORDER BY v.id, v.created_at DESC
    ) v
    LEFT JOIN authors a ON a.id = v.author_id
  ) as videos
FROM ranked_tracks rt;

-- Create indexes for better performance
CREATE UNIQUE INDEX hot50_current_rank_idx ON hot50_current(rank);
CREATE INDEX hot50_current_track_id_idx ON hot50_current(track_id);

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

-- Create triggers to refresh view
DROP TRIGGER IF EXISTS refresh_hot50_current_trigger ON hot50;
CREATE TRIGGER refresh_hot50_current_trigger
AFTER INSERT OR UPDATE OR DELETE ON hot50
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_hot50_current();

DROP TRIGGER IF EXISTS refresh_hot50_current_videos_trigger ON videos;
CREATE TRIGGER refresh_hot50_current_videos_trigger
AFTER INSERT OR UPDATE OR DELETE ON videos
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_hot50_current();

-- Refresh the view immediately
REFRESH MATERIALIZED VIEW CONCURRENTLY hot50_current;