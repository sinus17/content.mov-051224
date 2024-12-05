-- Add sound_page_url column to tracks table
alter table public.tracks
add column if not exists sound_page_url text;