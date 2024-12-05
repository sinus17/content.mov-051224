import axios from 'axios';
import { loggingService } from './logging';

class ApifyService {
  private static instance: ApifyService;
  private readonly API_ENDPOINT = '/api/apify';

  private constructor() {}

  static getInstance(): ApifyService {
    if (!ApifyService.instance) {
      ApifyService.instance = new ApifyService();
    }
    return ApifyService.instance;
  }

  async getVideoDetails(videoUrl: string) {
    try {
      loggingService.addLog({
        type: 'info',
        message: 'Starting video fetch',
        data: { videoUrl }
      });

      const response = await axios.post(this.API_ENDPOINT, {
        videoUrl
      });

      if (!response.data || response.data.length === 0) {
        throw new Error('No data returned from Apify');
      }

      const videoData = response.data[0];

      loggingService.addLog({
        type: 'success',
        message: 'Successfully fetched video data',
        data: videoData
      });

      return {
        description: videoData.text || videoData.desc || '',
        view_count: videoData.stats?.playCount || videoData.playCount || 0,
        like_count: videoData.stats?.diggCount || videoData.diggCount || 0,
        share_count: videoData.stats?.shareCount || videoData.shareCount || 0,
        comment_count: videoData.stats?.commentCount || videoData.commentCount || 0,
        file_url: videoData.videoUrl || videoData.downloadUrl || null,
        updated_at: new Date().toISOString()
      };
    } catch (error) {
      loggingService.addLog({
        type: 'error',
        message: 'Failed to fetch video data',
        data: { error, videoUrl }
      });
      throw error;
    }
  }
}

export const apifyService = ApifyService.getInstance();