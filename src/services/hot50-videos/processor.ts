import { BrowseAiVideo } from '../../types/browse-ai';
import { supabase } from '../../lib/supabase';
import { loggingService } from '../logging';
import { extractTrackInfo } from '../browse-ai/utils';

interface ProcessedTrack {
  id: string;
  title: string;
  position: number;
  videos: Array<{
    videoId: string;
    videoUrl: string;
    description: string;
    author: {
      username: string;
      profileUrl: string;
      profilePicture: string;
    };
    thumbnailUrl: string;
  }>;
}

export class Hot50VideoProcessor {
  async processVideos(rawData: any) {
    try {
      const tracks: ProcessedTrack[] = [];
      
      // Process each robot task
      if (rawData?.result?.robotTasks?.items) {
        for (const task of rawData.result.robotTasks.items) {
          if (task.status === 'successful' && task.capturedLists?.['TikTok Videos']) {
            const trackInfo = extractTrackInfo(task.inputParameters.originUrl);
            if (!trackInfo) continue;

            const videos = task.capturedLists['TikTok Videos'].map((video: any) => ({
              videoId: video.Video_Link.split('/').pop()?.split('?')[0] || '',
              videoUrl: video.Video_Link,
              description: '',
              author: {
                username: video.Username,
                profileUrl: video.Profile_Link,
                profilePicture: video.Profile_Picture
              },
              thumbnailUrl: video.Thumbnail_Image
            }));

            tracks.push({
              id: trackInfo.id,
              title: trackInfo.title,
              position: tracks.length + 1,
              videos
            });
          }
        }
      }

      loggingService.addLog({
        type: 'info',
        message: `Found ${tracks.length} tracks to process`,
        data: tracks.map(t => ({ title: t.title, videoCount: t.videos.length }))
      });

      // Process each track
      for (const track of tracks) {
        await this.saveTrackVideos(track);
      }

      loggingService.addLog({
        type: 'success',
        message: `Successfully processed ${tracks.length} tracks with their videos`
      });
    } catch (error) {
      loggingService.addLog({
        type: 'error',
        message: 'Failed to process videos',
        data: error
      });
      throw error;
    }
  }

  private async saveTrackVideos(track: ProcessedTrack) {
    try {
      loggingService.addLog({
        type: 'info',
        message: `Processing track "${track.title}" (Position: ${track.position})`
      });

      // Save track first
      const { data: savedTrack, error: trackError } = await supabase
        .from('tracks')
        .upsert({
          id: track.id,
          title: track.title,
          artist: 'Unknown', // We'll update this later
          sound_page_url: `https://www.tiktok.com/music/${encodeURIComponent(track.title)}-${track.id}`
        })
        .select()
        .single();

      if (trackError) {
        throw new Error(`Failed to save track: ${trackError.message}`);
      }

      // Update Hot50 position
      const { error: hot50Error } = await supabase
        .from('hot50')
        .upsert({
          track_id: savedTrack.id,
          position: track.position,
          date: new Date().toISOString().split('T')[0]
        });

      if (hot50Error) {
        throw new Error(`Failed to update Hot50 position: ${hot50Error.message}`);
      }

      // Get position-specific table name
      const tableName = `hot50_videos_${track.position}`;

      // Process videos
      for (const video of track.videos) {
        try {
          // Save author first
          const { data: author, error: authorError } = await supabase
            .from('authors')
            .upsert({
              id: video.author.username,
              unique_id: video.author.username,
              nickname: video.author.username
            })
            .select()
            .single();

          if (authorError) {
            throw new Error(`Failed to save author: ${authorError.message}`);
          }

          // Save video
          const { error: videoError } = await supabase
            .from(tableName)
            .upsert({
              track_id: savedTrack.id,
              video_url: video.videoUrl,
              author_id: author.id,
              description: video.description,
              thumbnail_url: video.thumbnailUrl
            });

          if (videoError) {
            throw new Error(`Failed to save video: ${videoError.message}`);
          }
        } catch (error) {
          loggingService.addLog({
            type: 'error',
            message: `Failed to save video for "${track.title}"`,
            data: error
          });
        }
      }

      loggingService.addLog({
        type: 'success',
        message: `Saved ${track.videos.length} videos for track "${track.title}" at position ${track.position}`
      });
    } catch (error) {
      loggingService.addLog({
        type: 'error',
        message: `Failed to save videos for track "${track.title}"`,
        data: error
      });
      throw error;
    }
  }
}

export const hot50VideoProcessor = new Hot50VideoProcessor();