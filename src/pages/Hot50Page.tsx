import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Music2, RefreshCw, ExternalLink, ChevronRight } from 'lucide-react';
import { useHot50Store } from '../store/hot50';
import { formatNumber } from '../lib/utils';
import { VideoBadge } from '../components/VideoBadge';

export function Hot50Page() {
  const { tracks, isLoading, error, fetchTracks } = useHot50Store();

  useEffect(() => {
    fetchTracks();
  }, [fetchTracks]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <Music2 className="w-6 h-6 text-cream" />
          <h1 className="text-2xl font-semibold text-text-primary">TikTok Hot50 DE</h1>
        </div>
        <button
          onClick={fetchTracks}
          className="flex items-center space-x-2 px-4 py-2 bg-surface rounded-lg hover:bg-surface/80 transition-colors text-text-primary"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {isLoading && (
        <div className="text-text-primary">Loading Hot50 tracks...</div>
      )}

      {error && (
        <div className="text-red-500 mb-4">Error: {error}</div>
      )}

      <div className="space-y-4">
        {tracks.map((track, index) => (
          <Link
            key={track.id}
            to={`/track/${index + 1}`}
            className="block bg-surface border border-border rounded-lg p-4 hover:shadow-lg transition-all"
          >
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden">
                {track.album_cover_url ? (
                  <img
                    src={track.album_cover_url}
                    alt={`${track.title} cover`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-surface-secondary flex items-center justify-center">
                    <Music2 className="w-6 h-6 text-text-secondary" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3">
                  <h3 className="text-lg font-medium text-text-primary truncate">
                    {track.title}
                  </h3>
                  {track.videos && (
                    <VideoBadge count={track.videos.length} />
                  )}
                </div>
                <p className="text-text-secondary truncate">{track.artist}</p>
              </div>

              <div className="flex items-center space-x-6">
                {track.videos && track.videos[0] && (
                  <div className="text-text-secondary text-sm space-x-4">
                    <span>{formatNumber(track.videos[0].view_count)} views</span>
                    <span>{formatNumber(track.videos[0].like_count)} likes</span>
                  </div>
                )}

                <ChevronRight className="w-5 h-5 text-text-secondary" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}