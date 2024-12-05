-- First drop the function that creates tables with incorrect schema
DROP FUNCTION IF EXISTS create_hot50_videos_table(int);

-- Create new function with correct schema
CREATE OR REPLACE FUNCTION create_hot50_videos_table(table_number int)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  table_name text;
BEGIN
  table_name := 'hot50_videos_' || table_number::text;
  
  EXECUTE format('
    CREATE TABLE IF NOT EXISTS public.%I (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      track_id uuid REFERENCES public.tracks(id) ON DELETE CASCADE,
      video_url text,
      video_thumbnail_url text,
      author_id text REFERENCES public.authors(id) ON DELETE CASCADE,
      description text,
      author_url text,
      author_profilepicture_url text,
      created_at timestamp with time zone DEFAULT timezone(''utc''::text, now()) NOT NULL
    )', table_name);
    
  -- Create indexes
  EXECUTE format('
    CREATE INDEX IF NOT EXISTS %I ON public.%I(track_id)',
    table_name || '_track_id_idx',
    table_name
  );
  
  -- Enable RLS
  EXECUTE format('
    ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY',
    table_name
  );
  
  -- Create RLS policies
  EXECUTE format('
    CREATE POLICY IF NOT EXISTS "Enable read access for all users" ON public.%I
      FOR SELECT USING (true)',
    table_name
  );
end;
$$;

-- Drop and recreate all hot50_videos tables
DO $$
BEGIN
  -- Drop existing tables
  FOR i IN 1..50 LOOP
    EXECUTE format('DROP TABLE IF EXISTS public.hot50_videos_%s CASCADE', i);
  END LOOP;

  -- Create tables with new schema
  FOR i IN 1..50 LOOP
    PERFORM create_hot50_videos_table(i);
  END LOOP;
END $$;