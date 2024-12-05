-- Drop existing functions and triggers that may cause stack depth issues
DROP FUNCTION IF EXISTS update_hot50_stats() CASCADE;
DROP FUNCTION IF EXISTS maintain_hot50_consistency() CASCADE;
DROP FUNCTION IF EXISTS ensure_hot50_consistency() CASCADE;
DROP FUNCTION IF EXISTS fix_hot50_data() CASCADE;

-- Create optimized function for updating hot50 data
CREATE OR REPLACE FUNCTION update_hot50_entries()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    today date := current_date;
    yesterday date := current_date - interval '1 day';
BEGIN
    -- Single query to get previous rankings
    WITH previous_ranks AS (
        SELECT 
            track_id,
            rank as prev_rank,
            weeks_on_chart as prev_weeks
        FROM hot50
        WHERE date = yesterday
    ),
    track_ranks AS (
        SELECT 
            t.id as track_id,
            ROW_NUMBER() OVER (
                ORDER BY COALESCE(pr.prev_rank, 999999),
                         t.created_at DESC
            ) as new_rank
        FROM tracks t
        LEFT JOIN previous_ranks pr ON pr.track_id = t.id
        WHERE EXISTS (
            SELECT 1 FROM videos v WHERE v.track_id = t.id
        )
        LIMIT 50
    )
    INSERT INTO hot50 (
        track_id,
        rank,
        date,
        previous_rank,
        weeks_on_chart
    )
    SELECT 
        tr.track_id,
        tr.new_rank,
        today,
        pr.prev_rank,
        COALESCE(pr.prev_weeks + 1, 1)
    FROM track_ranks tr
    LEFT JOIN previous_ranks pr ON pr.track_id = tr.track_id
    ON CONFLICT (rank, date) DO UPDATE
    SET 
        track_id = EXCLUDED.track_id,
        previous_rank = EXCLUDED.previous_rank,
        weeks_on_chart = EXCLUDED.weeks_on_chart;
END;
$$;

-- Create index to improve join performance
CREATE INDEX IF NOT EXISTS videos_track_created_idx ON videos(track_id, created_at);

-- Create materialized view for current rankings
CREATE MATERIALIZED VIEW IF NOT EXISTS hot50_current AS
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
ORDER BY h.rank;

-- Create index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS hot50_current_rank_idx ON hot50_current(rank);

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

-- Create trigger to refresh view
CREATE TRIGGER refresh_hot50_current_trigger
AFTER INSERT OR UPDATE OR DELETE ON hot50
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_hot50_current();