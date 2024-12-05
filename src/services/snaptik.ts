import axios from 'axios';
import { loggingService } from './logging';
import { useNotificationStore } from '../store/notifications';

class SnapTikService {
  private static instance: SnapTikService;
  private readonly API_ENDPOINT = '/api/snaptik';
  private cache: Map<string, string> = new Map();

  private constructor() {}

  static getInstance(): SnapTikService {
    if (!SnapTikService.instance) {
      SnapTikService.instance = new SnapTikService();
    }
    return SnapTikService.instance;
  }

  async getVideoFileUrl(videoUrl: string): Promise<string> {
    try {
      // Check cache first
      const cachedUrl = this.cache.get(videoUrl);
      if (cachedUrl) {
        return cachedUrl;
      }

      const response = await axios.post(this.API_ENDPOINT, {
        videoUrl
      });

      if (!response.data?.fileUrl) {
        throw new Error('No video URL found in response');
      }

      // Cache the URL
      this.cache.set(videoUrl, response.data.fileUrl);

      return response.data.fileUrl;
    } catch (error) {
      // Add error to notification store
      useNotificationStore.getState().addNotification({
        type: 'error',
        message: 'Failed to get video download URL',
        data: { error, videoUrl }
      });
      
      throw error;
    }
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const snapTikService = SnapTikService.getInstance();