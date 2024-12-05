import { useState } from 'react';
import { Search, Loader, AlertTriangle } from 'lucide-react';
import { apifyService } from '../services/apify';
import { loggingService } from '../services/logging';

export function ApifyVideoDetails() {
  const [soundUrl, setSoundUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videos, setVideos] = useState<any[]>([]);

  const handleFetch = async () => {
    if (!soundUrl.trim()) {
      setError('Please enter a sound URL');
      return;
    }

    setIsLoading(true);
    setError(null);
    setVideos([]);

    try {
      const fetchedVideos = await apifyService.getVideosForSoundUrl(soundUrl);
      setVideos(fetchedVideos);
      
      loggingService.addLog({
        type: 'success',
        message: `Successfully fetched ${fetchedVideos.length} videos`,
        data: { soundUrl }
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch videos';
      setError(errorMessage);
      
      loggingService.addLog({
        type: 'error',
        message: 'Failed to fetch videos',
        data: { error, soundUrl }
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-surface border border-border rounded-lg p-6">
      <h3 className="text-lg font-medium text-text-primary mb-4">Video Details</h3>
      
      <div className="space-y-4">
        <div className="relative">
          <input
            type="text"
            value={soundUrl}
            onChange={(e) => setSoundUrl(e.target.value)}
            placeholder="Enter TikTok sound URL"
            className="w-full px-4 py-2 bg-surface-secondary rounded-lg text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-1 focus:ring-cream"
            disabled={isLoading}
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
        </div>

        <button
          onClick={handleFetch}
          disabled={isLoading || !soundUrl.trim()}
          className="w-full px-4 py-2 bg-cream text-stone-dark rounded-lg hover:bg-cream-dark transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              <span>Fetching Videos...</span>
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              <span>Get Video Details</span>
            </>
          )}
        </button>

        {error && (
          <div className="flex items-center space-x-2 text-red-500 text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        {videos.length > 0 && (
          <div className="mt-6">
            <h4 className="text-md font-medium text-text-primary mb-3">Found {videos.length} Videos</h4>
            <div className="space-y-4">
              {videos.map((video, index) => (
                <div key={index} className="bg-surface-secondary rounded-lg p-4">
                  <p className="text-text-primary mb-2">{video.text}</p>
                  <div className="text-sm text-text-secondary space-y-1">
                    <p>Author: @{video.authorMeta.name}</p>
                    <p>Views: {video.playCount.toLocaleString()}</p>
                    <p>Likes: {video.diggCount.toLocaleString()}</p>
                    <a 
                      href={video.webVideoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cream hover:text-cream-dark"
                    >
                      Watch on TikTok
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}