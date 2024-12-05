import { create } from 'zustand';
import { Hot50Track } from '../types/tiktok';
import { supabase } from '../lib/supabase';
import { loggingService } from '../services/logging';

interface Hot50Store {
  tracks: Hot50Track[];
  isLoading: boolean;
  error: string | null;
  fetchTracks: () => Promise<void>;
}

export const useHot50Store = create<Hot50Store>((set) => ({
  tracks: [],
  isLoading: false,
  error: null,
  fetchTracks: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('hot50_current')
        .select('*')
        .order('rank');

      if (error) throw error;

      const tracks: Hot50Track[] = data.map(track => ({
        id: track.track_id,
        title: track.title,
        artist: track.artist,
        album_cover_url: track.album_cover_url,
        sound_page_url: track.sound_page_url,
        videos: track.videos || [],
        hot50: [{
          position: track.rank,
          previous_position: track.previous_rank,
          weeks_on_chart: track.weeks_on_chart
        }]
      }));

      set({ tracks, isLoading: false });

      loggingService.addLog({
        type: 'success',
        message: 'Successfully fetched Hot50 tracks',
        data: { trackCount: tracks.length }
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch tracks';
      set({ error: message, isLoading: false });
      
      loggingService.addLog({
        type: 'error',
        message: 'Failed to fetch Hot50 tracks',
        data: error
      });
    }
  }
}));