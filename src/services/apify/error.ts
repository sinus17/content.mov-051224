import { AxiosError } from 'axios';

export class ApifyError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly originalError?: unknown
  ) {
    super(message);
    this.name = 'ApifyError';
  }
}

export function handleApiError(error: unknown): ApifyError {
  if (error instanceof AxiosError) {
    const message = error.response?.data?.error || error.message;
    return new ApifyError(message, 'API_ERROR', error);
  }
  
  if (error instanceof Error) {
    return new ApifyError(error.message, 'UNKNOWN_ERROR', error);
  }
  
  return new ApifyError('An unknown error occurred', 'UNKNOWN_ERROR', error);
}