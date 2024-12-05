import { useState } from 'react';
import { Search, AlertTriangle, Loader, Download, StopCircle } from 'lucide-react';
import { browseAiClient } from '../services/browse-ai';
import { bulkRunProcessor } from '../services/hot50-videos/bulk-run-processor';
import { loggingService } from '../services/logging';
import { LogViewer } from './LogViewer';

export function BulkRunInput() {
  const [bulkRunId, setBulkRunId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rawData, setRawData] = useState<any>(null);

  const handleFetchData = async () => {
    if (!bulkRunId.trim()) {
      setError('Please enter a Bulk Run ID');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setRawData(null);

    try {
      const data = await browseAiClient.getRawBulkRunData(bulkRunId);
      setRawData(data);
      
      loggingService.addLog({
        type: 'success',
        message: 'Successfully fetched bulk run data',
        data: {
          tasksCount: data?.result?.robotTasks?.items?.length || 0
        }
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data';
      setError(errorMessage);
      loggingService.addLog({
        type: 'error',
        message: errorMessage,
        data: err
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProcessData = async () => {
    if (!rawData) {
      setError('Please fetch data first');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const result = await bulkRunProcessor.processData(rawData);
      loggingService.addLog({
        type: 'success',
        message: result.wasStoppedByUser 
          ? `Processing stopped: ${result.processedTracks} tracks, ${result.processedVideos} videos`
          : `Successfully processed ${result.processedTracks} tracks with ${result.processedVideos} videos`
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process data';
      setError(errorMessage);
      loggingService.addLog({
        type: 'error',
        message: errorMessage,
        data: err
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStop = () => {
    try {
      bulkRunProcessor.stop();
      loggingService.addLog({
        type: 'info',
        message: 'Stopping processing...'
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to stop processing';
      setError(errorMessage);
      loggingService.addLog({
        type: 'error',
        message: errorMessage,
        data: err
      });
    }
  };

  return (
    <>
      <div className="bg-surface border border-border rounded-lg p-6">
        <h3 className="text-lg font-medium text-text-primary mb-4">Process Browse AI Data</h3>
        
        <div className="space-y-4">
          <div className="relative">
            <input
              type="text"
              value={bulkRunId}
              onChange={(e) => setBulkRunId(e.target.value)}
              placeholder="Enter Browse.ai Bulk Run ID"
              className="w-full px-4 py-2 bg-surface-secondary rounded-lg text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-1 focus:ring-cream"
              disabled={isProcessing}
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleFetchData}
              disabled={isProcessing || !bulkRunId.trim()}
              className="flex-1 px-4 py-2 bg-surface-secondary text-text-primary rounded-lg hover:bg-surface/80 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {isProcessing ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Fetching...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Fetch Data</span>
                </>
              )}
            </button>

            {isProcessing && bulkRunProcessor.isRunning() ? (
              <button
                onClick={handleStop}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center space-x-2"
              >
                <StopCircle className="w-4 h-4" />
                <span>Stop Processing</span>
              </button>
            ) : (
              <button
                onClick={handleProcessData}
                disabled={isProcessing || !rawData}
                className="flex-1 px-4 py-2 bg-cream text-stone-dark rounded-lg hover:bg-cream-dark transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {isProcessing ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Process Data</span>
                  </>
                )}
              </button>
            )}
          </div>

          {error && (
            <div className="flex items-center space-x-2 text-red-500 text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>
      <LogViewer />
    </>
  );
}