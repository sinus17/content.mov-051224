-- Create hot50 table to track daily chart positions
create table if not exists public.hot50 (
    id uuid default gen_random_uuid() primary key,
    track_id uuid references public.tracks(id) on delete cascade,
    position int not null,
    date date not null default current_date,
    previous_position int,
    weeks_on_chart int default 1,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    constraint unique_track_date unique (track_id, date)
);

-- Create index for better query performance
create index if not exists hot50_date_idx on public.hot50(date);
create index if not exists hot50_track_position_idx on public.hot50(track_id, position);

-- Enable RLS
alter table public.hot50 enable row level security;

-- Create policies
create policy "Enable read access for all users" on public.hot50
    for select using (true);

-- Create trigger for updated_at
create trigger handle_updated_at
    before update on public.hot50
    for each row
    execute function public.handle_updated_at();

-- Function to update previous positions and weeks on chart
create or replace function public.update_hot50_stats()
returns trigger as $$
declare
    prev_position int;
    prev_weeks int;
begin
    -- Get previous position and weeks from yesterday's entry
    select position, weeks_on_chart
    into prev_position, prev_weeks
    from public.hot50
    where track_id = new.track_id
    and date = (new.date - interval '1 day')::date;

    -- Update stats
    new.previous_position := prev_position;
    new.weeks_on_chart := coalesce(prev_weeks + 1, 1);

    return new;
end;
$$ language plpgsql;

-- Create trigger for updating stats
create trigger update_hot50_stats
    before insert on public.hot50
    for each row
    execute function public.update_hot50_stats();