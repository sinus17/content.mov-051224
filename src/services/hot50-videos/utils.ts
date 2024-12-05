import { supabase } from '../../lib/supabase';
import { HOT50_TABLE } from './constants';

export async function getCurrentRank(trackId: string): Promise<number | null> {
  const today = new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from(HOT50_TABLE)
    .select('rank')
    .eq('track_id', trackId)
    .eq('date', today)
    .single();

  if (error || !data) return null;
  return data.rank;
}

export async function getTracksByDate(date: string = new Date().toISOString().split('T')[0]) {
  const { data, error } = await supabase
    .from(HOT50_TABLE)
    .select(`
      rank,
      track:tracks (
        id,
        title,
        artist,
        sound_page_url
      )
    `)
    .eq('date', date)
    .order('rank', { ascending: true });

  if (error) throw error;
  return data || [];
}