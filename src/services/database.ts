import { supabase } from '../lib/supabase';
import type { Hot50Track } from '../types/tiktok';

export async function getHot50Tracks(): Promise<Hot50Track[]> {
  const { data, error } = await supabase
    .from('tracks')
    .select(`
      id,
      title,
      artist,
      sound_page_url,
      album_cover_url,
      videos (
        id,
        description,
        view_count,
        like_count,
        share_count,
        comment_count,
        author:authors (
          id,
          unique_id,
          nickname
        )
      )
    `)
    .order('track_position', { ascending: true })
    .limit(50);

  if (error) throw error;
  return data || [];
}