import { useState } from 'react';
import { Search, Loader, AlertTriangle } from 'lucide-react';
import { apifyService } from '../services/apify';
import { useApifyRequest } from '../services/apify/hooks/useApifyRequest';
import { supabase } from '../lib/supabase';
import { loggingService } from '../services/logging';

export function ApifyTestSection() {
  const [videoUrl, setVideoUrl] = useState('');
  const { isLoading, error, execute } = useApifyRequest({
    onSuccess: () => setVideoUrl('')
  });

  const handleTest = async () => {
    if (!videoUrl.trim()) {
      return;
    }

    await execute(async () => {
      // Check if video exists in database
      const { data: videoExists } = await supabase
        .from('videos')
        .select('id')
        .eq('video_url', videoUrl)
        .single();

      if (!videoExists) {
        throw new Error('Video URL not found in database');
      }

      // Get video details from Apify
      const { items, error: apifyError } = await apifyService.getVideoDetails(videoUrl);
      
      if (apifyError) {
        throw new Error(apifyError);
      }

      if (!items.length) {
        throw new Error('No video details returned from Apify');
      }

      const videoData = items[0];
      
      loggingService.addLog({
        type: 'success',
        message: 'Successfully fetched video data',
        data: videoData
      });

      // Update video in database
      const { error: updateError } = await supabase
        .from('videos')
        .update({
          description: videoData.description,
          view_count: videoData.stats.viewCount,
          like_count: videoData.stats.likeCount,
          share_count: videoData.stats.shareCount,
          comment_count: videoData.stats.commentCount,
          updated_at: new Date().toISOString()
        })
        .eq('video_url', videoUrl);

      if (updateError) throw updateError;

      return videoData;
    });
  };

  return (
    <div className="bg-surface border border-border rounded-lg p-6">
      <h3 className="text-lg font-medium text-text-primary mb-4">Test Apify API</h3>
      
      <div className="space-y-4">
        <div className="relative">
          <input
            type="text"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="Enter video URL from videos table"
            className="w-full px-4 py-2 bg-surface-secondary rounded-lg text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-1 focus:ring-cream"
            disabled={isLoading}
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
        </div>

        <button
          onClick={handleTest}
          disabled={isLoading || !videoUrl.trim()}
          className="w-full px-4 py-2 bg-cream text-stone-dark rounded-lg hover:bg-cream-dark transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              <span>Test Video URL</span>
            </>
          )}
        </button>

        {error && (
          <div className="flex items-center space-x-2 text-red-500 text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}