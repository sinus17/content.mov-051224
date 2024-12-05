-- Drop and recreate hot50 table with correct schema
DROP TABLE IF EXISTS hot50 CASCADE;

CREATE TABLE hot50 (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    track_id uuid REFERENCES tracks(id) ON DELETE CASCADE,
    rank integer NOT NULL,
    date date NOT NULL DEFAULT current_date,
    previous_rank integer,
    weeks_on_chart integer DEFAULT 1,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT hot50_rank_check CHECK (rank >= 1 AND rank <= 50),
    CONSTRAINT hot50_rank_date_unique UNIQUE (rank, date)
);

-- Create indexes
CREATE INDEX hot50_track_id_idx ON hot50(track_id);
CREATE INDEX hot50_rank_date_idx ON hot50(rank, date);

-- Enable RLS
ALTER TABLE hot50 ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for all users" 
    ON hot50 FOR SELECT 
    USING (true);

-- Function to update previous rank and weeks on chart
CREATE OR REPLACE FUNCTION update_hot50_stats()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
    prev_rank integer;
    prev_weeks integer;
BEGIN
    -- Get previous rank and weeks from yesterday's entry
    SELECT rank, weeks_on_chart
    INTO prev_rank, prev_weeks
    FROM hot50
    WHERE track_id = NEW.track_id
    AND date = (NEW.date - interval '1 day')::date;

    -- Update stats
    NEW.previous_rank := prev_rank;
    NEW.weeks_on_chart := COALESCE(prev_weeks + 1, 1);

    RETURN NEW;
END;
$$;

-- Create trigger for stats
CREATE TRIGGER update_hot50_stats
    BEFORE INSERT ON hot50
    FOR EACH ROW
    EXECUTE FUNCTION update_hot50_stats();

-- Function to ensure data consistency
CREATE OR REPLACE FUNCTION ensure_hot50_consistency()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    today date := current_date;
BEGIN
    -- Insert entries for tracks that don't have a rank today
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

-- Run initial consistency check
SELECT ensure_hot50_consistency();