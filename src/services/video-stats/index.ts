import { supabase } from '../../lib/supabase';
import { loggingService } from '../logging';
import { apifyService } from '../apify';

class VideoStatsUpdater {
  private readonly BATCH_SIZE = 10;
  private readonly DELAY_BETWEEN_BATCHES = 1000;
  private isUpdating = false;
  private shouldStop = false;

  async updateAllVideoStats() {
    if (this.isUpdating) {
      throw new Error('Video stats update already in progress');
    }

    try {
      this.isUpdating = true;
      this.shouldStop = false;

      // Get all videos from database
      const { data: videos, error } = await supabase
        .from('videos')
        .select('id, video_url')
        .order('created_at', { ascending: false });

      if (error) throw error;

      loggingService.addLog({
        type: 'info',
        message: `Found ${videos?.length || 0} videos to update`,
        data: { totalVideos: videos?.length || 0 }
      });

      // Process videos in batches
      for (let i = 0; i < (videos?.length || 0); i += this.BATCH_SIZE) {
        // Check if we should stop
        if (this.shouldStop) {
          loggingService.addLog({
            type: 'info',
            message: `Update stopped after processing ${i} videos`
          });
          break;
        }

        const batch = videos?.slice(i, i + this.BATCH_SIZE) || [];
        
        // Process batch concurrently
        const promises = batch.map(async (video) => {
          try {
            // Get video details from Apify
            const apifyData = await apifyService.getVideosForSoundUrl(video.video_url, 1);
            
            if (apifyData && apifyData[0]) {
              const videoData = apifyData[0];

              // Map Apify response to our database schema
              const updateData = {
                description: videoData.desc || videoData.description || '',
                view_count: videoData.stats?.playCount || videoData.playCount || 0,
                like_count: videoData.stats?.diggCount || videoData.diggCount || 0,
                share_count: videoData.stats?.shareCount || videoData.shareCount || 0,
                comment_count: videoData.stats?.commentCount || videoData.commentCount || 0,
                file_url: videoData.downloadUrl || videoData.videoUrl || null,
                updated_at: new Date().toISOString()
              };

              // Update video stats in database
              const { error: updateError } = await supabase
                .from('videos')
                .update(updateData)
                .eq('id', video.id);

              if (updateError) throw updateError;

              loggingService.addLog({
                type: 'success',
                message: `Updated stats for video ${video.id}`,
                data: {
                  videoId: video.id,
                  stats: updateData
                }
              });
            }
          } catch (error) {
            loggingService.addLog({
              type: 'error',
              message: `Failed to update stats for video ${video.id}`,
              data: { error, videoId: video.id, videoUrl: video.video_url }
            });
          }
        });

        await Promise.all(promises);

        if (i + this.BATCH_SIZE < (videos?.length || 0)) {
          await new Promise(resolve => setTimeout(resolve, this.DELAY_BETWEEN_BATCHES));
        }

        loggingService.addLog({
          type: 'info',
          message: `Processed ${Math.min(i + this.BATCH_SIZE, videos?.length || 0)} of ${videos?.length || 0} videos`
        });
      }

      loggingService.addLog({
        type: 'success',
        message: this.shouldStop ? 'Video stats update stopped' : 'Successfully updated all video stats'
      });
    } catch (error) {
      loggingService.addLog({
        type: 'error',
        message: 'Failed to update video stats',
        data: error
      });
      throw error;
    } finally {
      this.isUpdating = false;
      this.shouldStop = false;
    }
  }

  stop() {
    if (!this.isUpdating) {
      throw new Error('No update in progress');
    }
    this.shouldStop = true;
    loggingService.addLog({
      type: 'info',
      message: 'Stopping video stats update...'
    });
  }

  isRunning() {
    return this.isUpdating;
  }
}

export const videoStatsUpdater = new VideoStatsUpdater();