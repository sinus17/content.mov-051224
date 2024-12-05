import axios from 'axios';
import { loggingService } from './logging';

class VideoProxyService {
  private static instance: VideoProxyService;
  private cache: Map<string, string> = new Map();
  private pendingRequests: Map<string, Promise<string>> = new Map();

  private constructor() {}

  static getInstance(): VideoProxyService {
    if (!VideoProxyService.instance) {
      VideoProxyService.instance = new VideoProxyService();
    }
    return VideoProxyService.instance;
  }

  async getProxyUrl(videoUrl: string): Promise<string> {
    try {
      // Check cache first
      const cachedUrl = this.cache.get(videoUrl);
      if (cachedUrl) {
        return cachedUrl;
      }

      // Check if there's already a pending request for this URL
      const pendingRequest = this.pendingRequests.get(videoUrl);
      if (pendingRequest) {
        return pendingRequest;
      }

      // Create new request
      const proxyUrl = `/api/tiktok/video-proxy?url=${encodeURIComponent(videoUrl)}`;
      
      // Create promise and store it
      const requestPromise = (async () => {
        try {
          // Test if the proxy endpoint is accessible
          const response = await axios.head(proxyUrl, {
            timeout: 5000,
            validateStatus: (status) => status === 200
          });
          
          // Cache the URL if successful
          this.cache.set(videoUrl, proxyUrl);
          return proxyUrl;
        } finally {
          // Clean up pending request
          this.pendingRequests.delete(videoUrl);
        }
      })();

      // Store the pending request
      this.pendingRequests.set(videoUrl, requestPromise);
      
      return requestPromise;
    } catch (error) {
      loggingService.addLog({
        type: 'error',
        message: 'Failed to get proxy URL for video',
        data: { error, videoUrl }
      });
      throw error;
    }
  }

  clearCache(): void {
    this.cache.clear();
    this.pendingRequests.clear();
  }
}

export const videoProxyService = VideoProxyService.getInstance();