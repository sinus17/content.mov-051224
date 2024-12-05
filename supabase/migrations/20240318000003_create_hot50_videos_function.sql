-- Function to create hot50_videos_N tables dynamically
create or replace function create_hot50_videos_table(table_number int)
returns void
language plpgsql
as $$
declare
  table_name text;
begin
  table_name := 'hot50_videos_' || table_number::text;
  
  execute format('
    create table if not exists public.%I (
      id uuid default gen_random_uuid() primary key,
      track_id uuid references public.tracks(id) on delete cascade,
      video_url text not null,
      video_analysis text,
      text_hook text,
      adaptation_tip text,
      created_at timestamp with time zone default timezone(''utc''::text, now()) not null
    )', table_name);
    
  -- Create indexes
  execute format('
    create index if not exists %I on public.%I(track_id)',
    table_name || '_track_id_idx',
    table_name
  );
  
  -- Enable RLS
  execute format('
    alter table public.%I enable row level security',
    table_name
  );
  
  -- Create RLS policies
  execute format('
    create policy if not exists "Enable read access for all users" on public.%I
      for select using (true)',
    table_name
  );
end;
$$;

-- Create tables for positions 1-50
do $$
begin
  for i in 1..50 loop
    perform create_hot50_videos_table(i);
  end loop;
end $$;