-- Function to ensure hot50 data consistency
CREATE OR REPLACE FUNCTION fix_hot50_data()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    today date := current_date;
BEGIN
    -- Insert missing entries for today
    INSERT INTO hot50 (track_id, rank, date)
    SELECT 
        t.id as track_id,
        COALESCE(
            (SELECT h.rank 
             FROM hot50 h 
             WHERE h.track_id = t.id 
             AND h.date = today - interval '1 day'
             ORDER BY h.date DESC 
             LIMIT 1),
            (SELECT COUNT(*) + 1 
             FROM hot50 
             WHERE date = today)
        ) as rank,
        today as date
    FROM tracks t
    WHERE NOT EXISTS (
        SELECT 1 
        FROM hot50 h 
        WHERE h.track_id = t.id 
        AND h.date = today
    )
    AND EXISTS (
        SELECT 1 
        FROM videos v 
        WHERE v.track_id = t.id
    )
    ORDER BY t.created_at DESC
    LIMIT 50;

    -- Ensure ranks are consecutive
    WITH ranked AS (
        SELECT id, ROW_NUMBER() OVER (ORDER BY rank) as new_rank
        FROM hot50
        WHERE date = today
    )
    UPDATE hot50 h
    SET rank = r.new_rank
    FROM ranked r
    WHERE h.id = r.id
    AND h.date = today;
END;
$$;

-- Run the fix
SELECT fix_hot50_data();