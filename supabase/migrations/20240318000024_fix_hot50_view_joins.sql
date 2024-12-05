-- Drop and recreate hot50_current view with proper joins
DROP MATERIALIZED VIEW IF EXISTS hot50_current CASCADE;

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

-- Recreate indexes
CREATE UNIQUE INDEX hot50_current_rank_idx ON hot50_current(rank);
CREATE INDEX hot50_current_track_id_idx ON hot50_current(track_id);

-- Refresh the view
REFRESH MATERIALIZED VIEW CONCURRENTLY hot50_current;