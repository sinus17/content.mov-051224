import { loggingService } from '../logging';
import { apifyApi } from './api';
import { mapVideoResponse } from './mapper';
import { ApifyTaskResult } from './types';
import { ERROR_MESSAGES } from './constants';

export class ApifyService {
  private static instance: ApifyService;

  private constructor() {}

  static getInstance(): ApifyService {
    if (!ApifyService.instance) {
      ApifyService.instance = new ApifyService();
    }
    return ApifyService.instance;
  }

  async getVideoDetails(videoUrl: string): Promise<ApifyTaskResult> {
    try {
      loggingService.addLog({
        type: 'info',
        message: 'Starting video fetch',
        data: { videoUrl }
      });

      const response = await apifyApi.fetchVideoDetails(videoUrl);

      if (!Array.isArray(response)) {
        throw new Error(ERROR_MESSAGES.INVALID_RESPONSE);
      }

      const items = response.map(mapVideoResponse);

      if (items.length === 0) {
        throw new Error(ERROR_MESSAGES.NO_DATA);
      }

      loggingService.addLog({
        type: 'success',
        message: 'Successfully fetched video details',
        data: { items }
      });

      return { items };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : ERROR_MESSAGES.FETCH_FAILED;
      
      loggingService.addLog({
        type: 'error',
        message: errorMessage,
        data: { error, videoUrl }
      });

      return { 
        items: [], 
        error: errorMessage
      };
    }
  }
}

export const apifyService = ApifyService.getInstance();