import { supabase } from '../lib/supabase';
import { BrowseAiTrackData, ImportStats } from '../types/browse-ai';
import { extractTrackInfo } from '../lib/import-utils';
import { saveHot50Videos } from './hot50-videos';
import { sleep } from '../lib/utils';

export interface ImportProgress {
  onLog: (entry: {
    type: 'info' | 'success' | 'error';
    message: string;
    details?: {
      track?: { title: string; position: number };
      videos?: number;
    };
  }) => void;
}

export async function importBrowseAiData(
  data: BrowseAiTrackData[],
  progress?: ImportProgress
): Promise<ImportStats> {
  const stats: ImportStats = {
    tracks: 0,
    videos: 0,
    authors: 0
  };

  progress?.onLog({
    type: 'info',
    message: `Starting import of ${data.length} tracks...`
  });

  const date = new Date().toISOString().split('T')[0];

  for (const [index, batch] of data.entries()) {
    if (!batch.TikTok_Videos?.length) {
      progress?.onLog({
        type: 'error',
        message: `No videos found for track at position ${index + 1}`
      });
      continue;
    }

    const trackInfo = extractTrackInfo(batch.Origin_URL);
    if (!trackInfo) {
      progress?.onLog({
        type: 'error',
        message: `Failed to extract track info from URL: ${batch.Origin_URL}`
      });
      continue;
    }

    try {
      progress?.onLog({
        type: 'info',
        message: `Processing track ${index + 1}/${data.length}`,
        details: {
          track: {
            title: trackInfo.title,
            position: index + 1
          }
        }
      });

      // Save track
      const { data: savedTrack, error: trackError } = await supabase
        .from('tracks')
        .upsert({
          title: trackInfo.title,
          artist: 'Unknown',
          sound_page_url: batch.Origin_URL,
          album_cover_url: batch.TikTok_Videos[0]?.Thumbnail_Image || null
        })
        .select()
        .single();

      if (trackError) throw trackError;
      stats.tracks++;

      // Save videos to position-specific table
      await saveHot50Videos(savedTrack.id, index + 1, batch.TikTok_Videos);
      stats.videos += batch.TikTok_Videos.length;

      progress?.onLog({
        type: 'success',
        message: `Processed ${batch.TikTok_Videos.length} videos`,
        details: {
          track: {
            title: trackInfo.title,
            position: index + 1
          },
          videos: batch.TikTok_Videos.length
        }
      });

      // Process authors
      for (const video of batch.TikTok_Videos) {
        try {
          const { error: authorError } = await supabase
            .from('authors')
            .upsert({
              id: video.Username,
              unique_id: video.Username,
              nickname: video.Username
            });

          if (!authorError) stats.authors++;
        } catch (error) {
          progress?.onLog({
            type: 'error',
            message: `Failed to save author ${video.Username}`,
            details: {
              track: {
                title: trackInfo.title,
                position: index + 1
              }
            }
          });
        }
      }

      // Update Hot50 position
      await updateHot50Position(savedTrack.id, index + 1, date);

      // Add small delay between batches
      await sleep(100);
    } catch (error) {
      progress?.onLog({
        type: 'error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        details: {
          track: {
            title: trackInfo.title,
            position: index + 1
          }
        }
      });
    }
  }

  progress?.onLog({
    type: 'success',
    message: `Import completed: ${stats.tracks} tracks, ${stats.videos} videos, ${stats.authors} authors`
  });

  return stats;
}

async function updateHot50Position(trackId: string, position: number, date: string) {
  const { error } = await supabase
    .from('hot50')
    .upsert({
      track_id: trackId,
      position,
      date
    });

  if (error) {
    console.error(`Error updating Hot50 position for track ${trackId}:`, error);
  }
}