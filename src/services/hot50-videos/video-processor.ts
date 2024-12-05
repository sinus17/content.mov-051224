import { supabase } from '../../lib/supabase';
import { loggingService } from '../logging';
import { VideoData } from './types';
import { getVideoTableName } from './constants';

export class VideoProcessor {
  async saveVideo(data: VideoData) {
    try {
      const tableName = getVideoTableName(data.rank);

      loggingService.addLog({
        type: 'debug',
        message: `Processing video data for ${tableName}`,
        data: {
          trackId: data.trackId,
          videoUrl: data.videoUrl,
          thumbnailUrl: data.thumbnailUrl,
          authorUsername: data.author.username
        }
      });

      // Save author first
      const { data: author, error: authorError } = await supabase
        .from('authors')
        .upsert({
          id: data.author.username,
          unique_id: data.author.username,
          nickname: data.author.username
        })
        .select()
        .single();

      if (authorError) {
        throw new Error(`Failed to save author: ${authorError.message}`);
      }

      // Extract video ID from URL
      const videoId = data.videoUrl.split('/').pop()?.split('?')[0] || '';

      // Save to main videos table first
      const { error: mainVideoError } = await supabase
        .from('videos')
        .upsert({
          id: videoId,
          track_id: data.trackId,
          description: data.description || '',
          author_id: author.id,
          video_url: data.videoUrl,
          thumbnail_url: data.thumbnailUrl,
          author_url: data.author.profileUrl,
          author_profilepicture_url: data.author.profilePicture,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (mainVideoError) {
        loggingService.addLog({
          type: 'error',
          message: 'Failed to save to main videos table',
          data: { error: mainVideoError }
        });
        throw mainVideoError;
      }

      // Then save to rank-specific table
      const { error: videoError } = await supabase
        .from(tableName)
        .upsert({
          track_id: data.trackId,
          video_url: data.videoUrl,
          thumbnail_url: data.thumbnailUrl,
          description: data.description || '',
          author_id: author.id,
          author_url: data.author.profileUrl,
          author_profilepicture_url: data.author.profilePicture,
          created_at: new Date().toISOString()
        });

      if (videoError) {
        loggingService.addLog({
          type: 'error',
          message: `Failed to save video to ${tableName}`,
          data: { error: videoError, videoData: data }
        });
        throw videoError;
      }

      loggingService.addLog({
        type: 'success',
        message: 'Successfully saved video to both tables',
        data: {
          trackId: data.trackId,
          rank: data.rank,
          videoUrl: data.videoUrl,
          videoId
        }
      });

      return true;
    } catch (error) {
      loggingService.addLog({
        type: 'error',
        message: 'Failed to save video',
        data: {
          error,
          trackId: data.trackId,
          rank: data.rank,
          videoData: data
        }
      });
      throw error;
    }
  }
}

export const videoProcessor = new VideoProcessor();