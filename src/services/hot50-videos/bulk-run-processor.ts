import { loggingService } from '../logging';
import { videoProcessor } from './video-processor';
import { trackProcessor } from './track-processor';
import { extractTrackInfo } from '../browse-ai/utils';

export class BulkRunProcessor {
  private isProcessing = false;
  private shouldStop = false;

  async processData(rawData: any) {
    if (this.isProcessing) {
      throw new Error('Already processing data');
    }

    try {
      this.isProcessing = true;
      this.shouldStop = false;

      const tasks = rawData?.result?.robotTasks?.items || [];
      const successfulTasks = tasks.filter(t => t.status === 'successful');

      loggingService.addLog({
        type: 'info',
        message: 'Starting to process tasks',
        data: {
          totalTasks: tasks.length,
          successfulTasks: successfulTasks.length
        }
      });

      let processedTracks = 0;
      let processedVideos = 0;

      // Process each successful task
      for (const [index, task] of successfulTasks.entries()) {
        // Check if processing should stop
        if (this.shouldStop) {
          loggingService.addLog({
            type: 'info',
            message: 'Processing stopped by user',
            data: {
              processedTracks,
              processedVideos,
              remainingTasks: successfulTasks.length - index
            }
          });
          break;
        }

        try {
          const videos = task.capturedLists?.['TikTok Videos'] || [];
          const soundUrl = task.inputParameters.originUrl;

          // Extract track info
          const trackInfo = await extractTrackInfo(soundUrl);
          if (!trackInfo) {
            loggingService.addLog({
              type: 'error',
              message: 'Failed to extract track info',
              data: { soundUrl }
            });
            continue;
          }

          // Calculate rank (1-based index)
          const rank = index + 1;

          // Save track with rank
          const track = await trackProcessor.saveTrack({
            id: trackInfo.id,
            title: trackInfo.title,
            artist: trackInfo.artist,
            rank,
            soundUrl
          });

          // Log the videos being processed
          loggingService.addLog({
            type: 'info',
            message: `Processing ${videos.length} videos for track "${track.title}"`,
            data: {
              trackId: track.id,
              rank,
              videoCount: videos.length
            }
          });

          // Process each video
          for (const video of videos) {
            // Check if processing should stop
            if (this.shouldStop) break;

            try {
              // Map Browse.ai video data to our format
              const videoData = {
                trackId: track.id,
                rank,
                videoUrl: video['Video Link'],
                thumbnailUrl: video['Thumbnail Image'],
                description: '',
                author: {
                  username: video.Username,
                  profileUrl: video['Profile Link'],
                  profilePicture: video['Profile Picture']
                }
              };

              await videoProcessor.saveVideo(videoData);
              processedVideos++;
            } catch (error) {
              loggingService.addLog({
                type: 'error',
                message: 'Failed to save video',
                data: { 
                  error, 
                  videoUrl: video['Video Link'],
                  trackTitle: track.title,
                  rank
                }
              });
            }
          }

          processedTracks++;
        } catch (error) {
          loggingService.addLog({
            type: 'error',
            message: 'Failed to process task',
            data: { error, taskId: task.id }
          });
        }
      }

      const status = this.shouldStop ? 'stopped' : 'completed';
      loggingService.addLog({
        type: 'success',
        message: `Processing ${status}`,
        data: {
          processedTracks,
          processedVideos,
          wasStoppedByUser: this.shouldStop
        }
      });

      return {
        processedTracks,
        processedVideos,
        wasStoppedByUser: this.shouldStop
      };
    } catch (error) {
      loggingService.addLog({
        type: 'error',
        message: 'Failed to process bulk run data',
        data: error
      });
      throw error;
    } finally {
      this.isProcessing = false;
      this.shouldStop = false;
    }
  }

  stop() {
    if (!this.isProcessing) {
      throw new Error('No processing in progress');
    }

    this.shouldStop = true;
    loggingService.addLog({
      type: 'info',
      message: 'Stopping processing...'
    });
  }

  isRunning() {
    return this.isProcessing;
  }
}

export const bulkRunProcessor = new BulkRunProcessor();