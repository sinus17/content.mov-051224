import axios from 'axios';
import { ApifyVideoResponse } from './types';
import { handleApiError } from './error';
import { API_ENDPOINTS } from './constants';

export class ApifyApi {
  private static instance: ApifyApi;

  private constructor() {}

  static getInstance(): ApifyApi {
    if (!ApifyApi.instance) {
      ApifyApi.instance = new ApifyApi();
    }
    return ApifyApi.instance;
  }

  async fetchVideoDetails(videoUrl: string): Promise<ApifyVideoResponse[]> {
    try {
      const response = await axios.post<ApifyVideoResponse[]>(API_ENDPOINTS.BASE, { 
        videoUrl,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.data) {
        throw new Error('No data received from Apify API');
      }

      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

export const apifyApi = ApifyApi.getInstance();