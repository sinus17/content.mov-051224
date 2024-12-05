import { useState } from 'react';
import { RefreshCw, Loader, StopCircle } from 'lucide-react';
import { videoStatsUpdater } from '../services/video-stats';
import { loggingService } from '../services/logging';

export function VideoStatsUpdater() {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      await videoStatsUpdater.updateAllVideoStats();
      loggingService.addLog({
        type: 'success',
        message: 'Video stats update completed'
      });
    } catch (error) {
      loggingService.addLog({
        type: 'error',
        message: 'Failed to update video stats',
        data: error
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStop = () => {
    try {
      videoStatsUpdater.stop();
      loggingService.addLog({
        type: 'info',
        message: 'Stopping video stats update...'
      });
    } catch (error) {
      loggingService.addLog({
        type: 'error',
        message: 'Failed to stop video stats update',
        data: error
      });
    }
  };

  return (
    <div className="bg-surface border border-border rounded-lg p-6">
      <h3 className="text-lg font-medium text-text-primary mb-4">Update Video Stats</h3>
      <p className="text-text-secondary mb-4">
        This will fetch and update view count, like count, share count, comment count, and description
        for all videos in the database using the TikTok API.
      </p>
      <div className="flex space-x-3">
        {isUpdating ? (
          <>
            <button
              onClick={handleStop}
              className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center space-x-2"
            >
              <StopCircle className="w-4 h-4" />
              <span>Stop Update</span>
            </button>
            <div className="flex-1 px-4 py-2 bg-surface-secondary text-text-secondary rounded-lg flex items-center justify-center space-x-2">
              <Loader className="w-4 h-4 animate-spin" />
              <span>Updating Stats...</span>
            </div>
          </>
        ) : (
          <button
            onClick={handleUpdate}
            className="w-full px-4 py-2 bg-cream text-stone-dark rounded-lg hover:bg-cream-dark transition-colors flex items-center justify-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Update Video Stats</span>
          </button>
        )}
      </div>
    </div>
  );
}