export const API_ENDPOINTS = {
  BASE: '/api/apify',
  VIDEO_DETAILS: '/api/apify/video'
} as const;

export const ERROR_MESSAGES = {
  INVALID_RESPONSE: 'Invalid response from Apify API',
  FETCH_FAILED: 'Failed to fetch video details',
  NO_DATA: 'No video data returned'
} as const;

export const DEFAULT_RETRY_OPTIONS = {
  maxRetries: 3,
  retryDelay: 1000
} as const;