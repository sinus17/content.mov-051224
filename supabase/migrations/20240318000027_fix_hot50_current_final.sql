-- Drop existing view and functions
DROP MATERIALIZED VIEW IF EXISTS hot50_current CASCADE;
DROP FUNCTION IF EXISTS refresh_hot50_current() CASCADE;

-- Create materialized view with proper rank-based querying and video aggregation
CREATE MATERIALIZED VIEW hot50_current AS
WITH current_tracks AS (
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
),
track_videos AS (
  SELECT 
    ct.track_id,
    json_agg(
      json_build_object(
        'id', v.id,
        'video_url', v.video_url,
        'thumbnail_url', v.thumbnail_url,
        'description', v.description,
        'view_count', COALESCE(v.view_count, 0),
        'like_count', COALESCE(v.like_count, 0),
        'share_count', COALESCE(v.share_count, 0),
        'comment_count', COALESCE(v.comment_count, 0),
        'author', json_build_object(
          'id', a.id,
          'unique_id', a.unique_id,
          'nickname', a.nickname
        )
      )
      ORDER BY v.created_at DESC
    ) as videos
  FROM current_tracks ct
  LEFT JOIN videos v ON v.track_id = ct.track_id
  LEFT JOIN authors a ON a.id = v.author_id
  GROUP BY ct.track_id
)
SELECT 
  ct.*,
  COALESCE(tv.videos, '[]'::json) as videos
FROM current_tracks ct
LEFT JOIN track_videos tv ON tv.track_id = ct.track_id
ORDER BY ct.rank;

-- Create indexes for better performance
CREATE UNIQUE INDEX hot50_current_rank_idx ON hot50_current(rank);
CREATE INDEX hot50_current_track_id_idx ON hot50_current(track_id);

-- Create refresh function with proper concurrency handling
CREATE OR REPLACE FUNCTION refresh_hot50_current()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_stat_activity 
    WHERE query LIKE 'REFRESH MATERIALIZED VIEW%hot50_current%'
    AND pid != pg_backend_pid()
  ) THEN
    RETURN NULL;
  END IF;

  REFRESH MATERIALIZED VIEW CONCURRENTLY hot50_current;
  RETURN NULL;
END;
$$;

-- Create triggers to refresh view
CREATE TRIGGER refresh_hot50_current_trigger
AFTER INSERT OR UPDATE OR DELETE ON hot50
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_hot50_current();

CREATE TRIGGER refresh_hot50_current_videos_trigger
AFTER INSERT OR UPDATE OR DELETE ON videos
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_hot50_current();

-- Refresh the view immediately
REFRESH MATERIALIZED VIEW CONCURRENTLY hot50_current;