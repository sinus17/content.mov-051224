-- Function to ensure hot50 entries exist for today
CREATE OR REPLACE FUNCTION ensure_hot50_entries()
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
        ROW_NUMBER() OVER (ORDER BY t.created_at DESC) as rank,
        today as date
    FROM tracks t
    WHERE NOT EXISTS (
        SELECT 1 
        FROM hot50 h 
        WHERE h.track_id = t.id 
        AND h.date = today
    )
    AND t.id IN (
        SELECT DISTINCT track_id 
        FROM videos 
        ORDER BY created_at DESC
        LIMIT 50
    );
END;
$$;

-- Create a trigger to maintain data consistency
CREATE OR REPLACE FUNCTION maintain_hot50_consistency()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    -- Ensure rank values are consecutive
    WITH ranked AS (
        SELECT id, ROW_NUMBER() OVER (ORDER BY rank) as new_rank
        FROM hot50
        WHERE date = NEW.date
    )
    UPDATE hot50 h
    SET rank = r.new_rank
    FROM ranked r
    WHERE h.id = r.id
    AND h.date = NEW.date;

    RETURN NEW;
END;
$$;

CREATE TRIGGER hot50_consistency_trigger
AFTER INSERT OR UPDATE ON hot50
FOR EACH ROW
EXECUTE FUNCTION maintain_hot50_consistency();

-- Run the function to ensure entries exist
SELECT ensure_hot50_entries();