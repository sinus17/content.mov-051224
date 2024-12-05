-- Drop and recreate RLS policies for all hot50_videos tables
DO $$
DECLARE
    i INTEGER;
BEGIN
    FOR i IN 1..50 LOOP
        EXECUTE format('
            -- Drop existing policies
            DROP POLICY IF EXISTS "Enable read access for all users" ON hot50_videos_%s;
            DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON hot50_videos_%s;
            
            -- Create new policies
            CREATE POLICY "Enable read access for all users" 
            ON hot50_videos_%s FOR SELECT 
            USING (true);

            CREATE POLICY "Enable insert access for authenticated users" 
            ON hot50_videos_%s FOR INSERT 
            WITH CHECK (true);

            CREATE POLICY "Enable update access for authenticated users" 
            ON hot50_videos_%s FOR UPDATE
            USING (true)
            WITH CHECK (true);
        ', i, i, i, i, i);
    END LOOP;
END $$;