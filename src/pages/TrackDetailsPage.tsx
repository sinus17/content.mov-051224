import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Music2, ExternalLink } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { formatNumber } from '../lib/utils';
import { HoverVideoPlayer } from '../components/HoverVideoPlayer';
import { loggingService } from '../services/logging';

interface Track {
  id: string;
  title: string;
  artist: string;
  sound_page_url: string | null;
  album_cover_url: string | null;
  rank: number;
  previous_rank: number | null;
  weeks_on_chart: number;
}

interface TrackVideo {
  id: string;
  video_url: string;
  thumbnail_url: string;
  description: string;
  view_count: number;
  like_count: number;
  share_count: number;
  comment_count: number;
  author: {
    id: string;
    unique_id: string;
    nickname: string;
  };
}

export function TrackDetailsPage() {
  const { position } = useParams();
  const [track, setTrack] = useState<Track | null>(null);
  const [videos, setVideos] = useState<TrackVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTrackDetails() {
      if (!position) return;

      try {
        const rank = parseInt(position);
        
        // Get track details from hot50_current view
        const { data: currentTrack, error: trackError } = await supabase
          .from('hot50_current')
          .select('*')
          .eq('rank', rank)
          .single();

        if (trackError) throw trackError;
        if (!currentTrack) {
          throw new Error(`No track found at position ${rank}`);
        }

        setTrack({
          id: currentTrack.track_id,
          title: currentTrack.title,
          artist: currentTrack.artist,
          sound_page_url: currentTrack.sound_page_url,
          album_cover_url: currentTrack.album_cover_url,
          rank: currentTrack.rank,
          previous_rank: currentTrack.previous_rank,
          weeks_on_chart: currentTrack.weeks_on_chart
        });

        // Set videos from the JSON array
        if (currentTrack.videos && Array.isArray(currentTrack.videos)) {
          setVideos(currentTrack.videos);
        }

        loggingService.addLog({
          type: 'success',
          message: `Loaded track details for position ${rank}`,
          data: { 
            title: currentTrack.title,
            videoCount: currentTrack.videos?.length || 0
          }
        });
      } catch (error) {
        console.error('Error fetching track data:', error);
        setError(error instanceof Error ? error.message : 'Failed to load track data');
        
        loggingService.addLog({
          type: 'error',
          message: 'Error fetching track data',
          data: error
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchTrackDetails();
  }, [position]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-text-primary">Loading track details...</div>
        </div>
      </div>
    );
  }

  if (error || !track) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-red-500">Error: {error || 'Track not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link 
        to="/"
        className="inline-flex items-center space-x-2 text-text-secondary hover:text-text-primary mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Hot50</span>
      </Link>

      <div className="bg-surface border border-border rounded-lg p-6 mb-8">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0 w-16 h-16 bg-surface-secondary rounded-lg overflow-hidden">
            {track.album_cover_url ? (
              <img
                src={track.album_cover_url}
                alt={`${track.title} cover`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Music2 className="w-8 h-8 text-cream" />
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-semibold text-text-primary truncate">
                {track.title}
              </h1>
              {track.sound_page_url && (
                <a
                  href={track.sound_page_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 px-2 py-1 bg-cream/10 rounded-lg hover:bg-cream/20 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 text-cream" />
                  <span className="text-sm text-cream">TikTok</span>
                </a>
              )}
            </div>
            <p className="text-text-secondary mt-1">{track.artist}</p>
          </div>

          <div className="flex items-center space-x-2">
            <div className="text-lg font-medium text-cream">
              #{track.rank}
            </div>
            {track.previous_rank && (
              <div className="text-sm text-text-secondary">
                (was #{track.previous_rank})
              </div>
            )}
          </div>
        </div>
      </div>

      {videos.length === 0 ? (
        <div className="flex items-center justify-center h-64 bg-surface border border-border rounded-lg">
          <p className="text-text-secondary">No videos found for this track</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <div 
              key={video.id}
              className="bg-surface border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
            >
              <HoverVideoPlayer
                src={video.video_url}
                poster={video.thumbnail_url}
                className="aspect-[9/16]"
              />
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-text-primary font-medium">@{video.author.unique_id}</span>
                  <a
                    href={video.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cream hover:text-cream-dark transition-colors"
                  >
                    Watch on TikTok
                  </a>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm text-text-secondary">
                  <div>Views: {formatNumber(video.view_count)}</div>
                  <div>Likes: {formatNumber(video.like_count)}</div>
                  <div>Shares: {formatNumber(video.share_count)}</div>
                  <div>Comments: {formatNumber(video.comment_count)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}