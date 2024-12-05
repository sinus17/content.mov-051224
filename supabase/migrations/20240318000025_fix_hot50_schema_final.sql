-- Drop existing views and functions
DROP MATERIALIZED VIEW IF EXISTS hot50_current CASCADE;
DROP FUNCTION IF EXISTS update_hot50_stats() CASCADE;
DROP FUNCTION IF EXISTS refresh_hot50_current() CASCADE;

-- Ensure hot50 table has correct schema
ALTER TABLE hot50
  DROP COLUMN IF EXISTS position CASCADE,
  ADD COLUMN IF NOT EXISTS rank integer NOT NULL,
  ADD COLUMN IF NOT EXISTS previous_rank integer,
  ADD COLUMN IF NOT EXISTS weeks_on_chart integer DEFAULT 1;

-- Add constraints
ALTER TABLE hot50
  ADD CONSTRAINT hot50_rank_check CHECK (rank >= 1 AND rank <= 50),
  ADD CONSTRAINT hot50_rank_date_unique UNIQUE (rank, date);

-- Create materialized view for current rankings
CREATE MATERIALIZED VIEW hot50_current AS
WITH current_rankings AS (
  SELECT 
    h.rank,
    h.previous_rank,
    h.weeks_on_chart,
    h.track_id,
    h.date
  FROM hot50 h
  WHERE h.date = current_date
)
SELECT 
  cr.rank,
  cr.previous_rank,
  cr.weeks_on_chart,
  t.id as track_id,
  t.title,
  t.artist,
  t.sound_page_url,
  t.album_cover_url,
  cr.date,
  COALESCE(
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
    ),
    '[]'::json
  ) as videos
FROM current_rankings cr
JOIN tracks t ON t.id = cr.track_id
ORDER BY cr.rank;

-- Create indexes
CREATE UNIQUE INDEX hot50_current_rank_idx ON hot50_current(rank);
CREATE INDEX hot50_current_track_id_idx ON hot50_current(track_id);

-- Create function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_hot50_current()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW hot50_current;
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

-- Refresh the view
REFRESH MATERIALIZED VIEW hot50_current;