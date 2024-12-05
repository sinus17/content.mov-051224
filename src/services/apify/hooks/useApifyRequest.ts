import { useState } from 'react';
import { ApifyError } from '../error';
import { loggingService } from '../../logging';
import { useNotificationStore } from '../../../store/notifications';

interface UseApifyRequestOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: ApifyError) => void;
}

export function useApifyRequest(options: UseApifyRequestOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const addNotification = useNotificationStore(state => state.addNotification);

  const execute = async <T>(
    requestFn: () => Promise<T>
  ): Promise<T | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await requestFn();
      
      if (result) {
        options.onSuccess?.(result);
        addNotification({
          type: 'info',
          message: 'Successfully processed video data'
        });
      }
      
      return result;
    } catch (err) {
      const error = err instanceof ApifyError ? err : new ApifyError(
        'An unexpected error occurred',
        'UNKNOWN_ERROR',
        err
      );

      setError(error.message);
      options.onError?.(error);

      addNotification({
        type: 'error',
        message: error.message,
        data: error
      });

      loggingService.addLog({
        type: 'error',
        message: error.message,
        data: error
      });

      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    execute
  };
}