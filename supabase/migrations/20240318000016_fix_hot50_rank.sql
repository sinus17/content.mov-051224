-- Ensure hot50 table has correct rank column
ALTER TABLE hot50 
  DROP COLUMN IF EXISTS position,
  ADD COLUMN IF NOT EXISTS rank integer NOT NULL;

-- Create index on rank and date for better query performance
CREATE INDEX IF NOT EXISTS hot50_rank_date_idx ON hot50(rank, date);

-- Add constraint to ensure rank is between 1 and 50
ALTER TABLE hot50
  ADD CONSTRAINT hot50_rank_check 
  CHECK (rank >= 1 AND rank <= 50);

-- Add unique constraint for rank and date combination
ALTER TABLE hot50
  ADD CONSTRAINT hot50_rank_date_unique 
  UNIQUE (rank, date);