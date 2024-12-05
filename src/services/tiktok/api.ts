import axios from 'axios';
import { tikTokAuth } from './auth';
import { loggingService } from '../logging';
import { VideoStats } from '../video-stats/types';

export class TikTokApi {
  private static instance: TikTokApi;
  private readonly API_BASE = '/api/tiktok';

  private constructor() {}

  static getInstance(): TikTokApi {
    if (!TikTokApi.instance) {
      TikTokApi.instance = new TikTokApi();
    }
    return TikTokApi.instance;
  }

  async getVideoStats(videoId: string): Promise<VideoStats> {
    try {
      const headers = await tikTokAuth.getAuthHeaders();
      const response = await axios.get(`${this.API_BASE}/video/${videoId}`, {
        headers
      });

      if (!response.data?.data) {
        throw new Error('Invalid response from TikTok API');
      }

      const { stats, desc } = response.data.data;
      return {
        viewCount: stats.play_count || 0,
        likeCount: stats.digg_count || 0,
        shareCount: stats.share_count || 0,
        commentCount: stats.comment_count || 0,
        description: desc || ''
      };
    } catch (error) {
      loggingService.addLog({
        type: 'error',
        message: `Failed to fetch video stats for ${videoId}`,
        data: error
      });
      throw error;
    }
  }
}

export const tikTokApi = TikTokApi.getInstance();