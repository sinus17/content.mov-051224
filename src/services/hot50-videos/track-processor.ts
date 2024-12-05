import { supabase } from '../../lib/supabase';
import { loggingService } from '../logging';
import { TrackData } from './types';
import { HOT50_TABLE, TRACKS_TABLE } from './constants';

export class TrackProcessor {
  async saveTrack(data: TrackData) {
    try {
      // Extract artist from URL if not provided
      let artist = data.artist;
      if (!artist) {
        const artistMatch = data.soundUrl.match(/music\/([^-]+)-/);
        artist = artistMatch ? decodeURIComponent(artistMatch[1]) : 'Unknown Artist';
      }

      // First save/update track
      const { data: savedTrack, error: trackError } = await supabase
        .from(TRACKS_TABLE)
        .upsert({
          id: data.id,
          title: data.title,
          artist,
          sound_page_url: data.soundUrl
        })
        .select()
        .single();

      if (trackError) throw trackError;

      // Check if entry already exists for today
      const today = new Date().toISOString().split('T')[0];
      const { data: existingEntry } = await supabase
        .from(HOT50_TABLE)
        .select('id')
        .eq('track_id', savedTrack.id)
        .eq('date', today)
        .single();

      if (existingEntry) {
        // Update existing entry
        const { error: updateError } = await supabase
          .from(HOT50_TABLE)
          .update({ rank: data.rank })
          .eq('id', existingEntry.id);

        if (updateError) throw updateError;
      } else {
        // Create new entry
        const { error: insertError } = await supabase
          .from(HOT50_TABLE)
          .insert({
            track_id: savedTrack.id,
            rank: data.rank,
            date: today
          });

        if (insertError) throw insertError;
      }

      loggingService.addLog({
        type: 'success',
        message: `Saved track "${data.title}" by ${artist} at rank ${data.rank}`,
        data: { trackId: savedTrack.id, rank: data.rank }
      });

      return savedTrack;
    } catch (error) {
      loggingService.addLog({
        type: 'error',
        message: `Failed to save track "${data.title}"`,
        data: error
      });
      throw error;
    }
  }
}

export const trackProcessor = new TrackProcessor();