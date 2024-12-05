-- Create tables for the TikTok content analysis system
create table if not exists public.tracks (
    id uuid default gen_random_uuid() primary key,
    title text not null,
    artist text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.authors (
    id text primary key,
    unique_id text not null unique,
    nickname text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.videos (
    id text primary key,
    track_id uuid references public.tracks(id) on delete cascade,
    description text not null,
    author_id text references public.authors(id) on delete cascade,
    view_count bigint default 0,
    like_count bigint default 0,
    share_count bigint default 0,
    comment_count bigint default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.ai_analysis (
    id uuid default gen_random_uuid() primary key,
    video_id text references public.videos(id) on delete cascade,
    content_type text[] not null,
    trends text[] not null,
    engagement_score numeric(3,1) not null,
    engagement_factors text[] not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes for better query performance
create index if not exists videos_track_id_idx on public.videos(track_id);
create index if not exists videos_author_id_idx on public.videos(author_id);
create index if not exists ai_analysis_video_id_idx on public.ai_analysis(video_id);

-- Enable Row Level Security (RLS)
alter table public.tracks enable row level security;
alter table public.authors enable row level security;
alter table public.videos enable row level security;
alter table public.ai_analysis enable row level security;

-- Create policies
create policy "Enable read access for all users" on public.tracks
    for select using (true);

create policy "Enable read access for all users" on public.authors
    for select using (true);

create policy "Enable read access for all users" on public.videos
    for select using (true);

create policy "Enable read access for all users" on public.ai_analysis
    for select using (true);

-- Create functions for updating timestamps
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

-- Create triggers for updating timestamps
create trigger handle_updated_at
    before update on public.tracks
    for each row
    execute function public.handle_updated_at();

create trigger handle_updated_at
    before update on public.authors
    for each row
    execute function public.handle_updated_at();

create trigger handle_updated_at
    before update on public.videos
    for each row
    execute function public.handle_updated_at();

create trigger handle_updated_at
    before update on public.ai_analysis
    for each row
    execute function public.handle_updated_at();