
-- Ensure rank is not null
ALTER TABLE hot50 
  ALTER COLUMN rank SET NOT NULL;

-- Update existing indexes
DROP INDEX IF EXISTS hot50_track_position_idx;
CREATE INDEX hot50_track_rank_idx ON hot50(track_id, rank);