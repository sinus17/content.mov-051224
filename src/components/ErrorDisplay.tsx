import { AlertTriangle, RefreshCw, WifiOff } from 'lucide-react';
import { NetworkError, ApiError } from '../lib/errors';

interface ErrorDisplayProps {
  error: Error;
  onRetry?: () => void;
}

export function ErrorDisplay({ error, onRetry }: ErrorDisplayProps) {
  const isNetworkError = error instanceof NetworkError;
  const isApiError = error instanceof ApiError;

  return (
    <div className="bg-surface/50 border border-border rounded-lg p-6 max-w-2xl mx-auto my-8">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          {isNetworkError ? (
            <WifiOff className="w-6 h-6 text-red-500" />
          ) : (
            <AlertTriangle className="w-6 h-6 text-yellow-500" />
          )}
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-medium text-text-primary mb-2">
            {isNetworkError ? 'Connection Error' : 
             isApiError ? 'API Error' : 
             'Error'}
          </h3>
          
          <p className="text-text-secondary mb-4">{error.message}</p>
          
          {isApiError && (
            <p className="text-sm text-text-secondary mb-4">
              Status Code: {isApiError.statusCode}
              <br />
              Endpoint: {isApiError.endpoint}
            </p>
          )}
          
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center space-x-2 px-4 py-2 bg-cream text-stone-dark rounded-lg hover:bg-cream-dark transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Try Again</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}