import { AxiosError } from 'axios';

export class ScrapingError extends Error {
  constructor(
    message: string,
    public readonly phase: 'playlist' | 'videos' | 'database',
    public readonly details?: {
      track?: { title: string; artist: string };
      url?: string;
    }
  ) {
    super(message);
    this.name = 'ScrapingError';
  }
}

export class NetworkError extends Error {
  constructor(
    message: string,
    public readonly originalError?: Error,
    public readonly endpoint?: string
  ) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly endpoint: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function handleFetchError(error: unknown, endpoint?: string): Error {
  if (error instanceof ScrapingError || error instanceof NetworkError || error instanceof ApiError) {
    return error;
  }

  if (error instanceof AxiosError) {
    if (!error.response) {
      return new NetworkError(
        'Unable to reach the server. Please check your internet connection.',
        error,
        endpoint
      );
    }

    return new ApiError(
      error.response.data?.message || 'An error occurred while fetching data',
      error.response.status,
      endpoint || error.config?.url || 'unknown'
    );
  }

  return new Error('An unexpected error occurred');
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ScrapingError) {
    return `Scraping Error (${error.phase}): ${error.message}`;
  }

  if (error instanceof NetworkError) {
    return `Network Error: ${error.message}${error.endpoint ? ` (${error.endpoint})` : ''}`;
  }

  if (error instanceof ApiError) {
    return `API Error (${error.statusCode}): ${error.message} (${error.endpoint})`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred';
}