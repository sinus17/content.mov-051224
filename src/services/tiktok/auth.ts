import axios from 'axios';
import { loggingService } from '../logging';

export class TikTokAuth {
  private static instance: TikTokAuth;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  private readonly CLIENT_KEY = 'sbawm3eo5rfnspl2q8';
  private readonly CLIENT_SECRET = 'Q1ZLD3FQbGJKSFpChB3D4r5MB24M4bK8';
  private readonly TOKEN_URL = '/api/tiktok/auth';

  private constructor() {}

  static getInstance(): TikTokAuth {
    if (!TikTokAuth.instance) {
      TikTokAuth.instance = new TikTokAuth();
    }
    return TikTokAuth.instance;
  }

  async getAccessToken(): Promise<string> {
    try {
      // Check if we have a valid token
      if (this.accessToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
        return this.accessToken;
      }

      // Request new token using proxy endpoint
      const response = await axios.post(this.TOKEN_URL, {
        client_key: this.CLIENT_KEY,
        client_secret: this.CLIENT_SECRET,
        grant_type: 'client_credentials'
      });

      if (response.data.data?.access_token) {
        this.accessToken = response.data.data.access_token;
        this.tokenExpiry = new Date(Date.now() + (response.data.data.expires_in * 1000));

        loggingService.addLog({
          type: 'success',
          message: 'Successfully obtained TikTok access token',
          data: { expiresAt: this.tokenExpiry }
        });

        return this.accessToken;
      }

      throw new Error('Invalid response from TikTok auth endpoint');
    } catch (error) {
      loggingService.addLog({
        type: 'error',
        message: 'Failed to obtain TikTok access token',
        data: error
      });
      throw error;
    }
  }

  getTokenExpiry(): Date | null {
    return this.tokenExpiry;
  }

  clearToken(): void {
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  async getAuthHeaders(): Promise<Record<string, string>> {
    const token = await this.getAccessToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }
}

export const tikTokAuth = TikTokAuth.getInstance();