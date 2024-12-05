import { useEffect } from 'react';
import { TrendCard } from '../components/TrendCard';
import { ContentInsights } from '../components/ContentInsights';
import { Sparkles, ChevronRight } from 'lucide-react';
import { useTrendingStore } from '../store/trending';

export function HomePage() {
  const { trendingVideos, isLoading, error, fetchTrendingContent } = useTrendingStore();

  useEffect(() => {
    fetchTrendingContent();
  }, [fetchTrendingContent]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <p className="text-text-primary">Loading trending content...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-cream" />
          <h2 className="text-xl font-semibold text-text-primary">Trending Content</h2>
        </div>
        <button className="flex items-center text-cream hover:text-cream-dark">
          <span className="text-sm">View all</span>
          <ChevronRight className="w-4 h-4 ml-1" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {trendingVideos.map((video) => (
          <TrendCard
            key={video.id}
            thumbnail={`https://api.tiktok.com/thumbnails/${video.id}`}
            videoUrl={`https://api.tiktok.com/videos/${video.id}`}
            title={video.description}
            views={video.stats.viewCount.toLocaleString()}
            likes={video.stats.likeCount.toLocaleString()}
            shares={video.stats.shareCount.toLocaleString()}
            comments={video.stats.commentCount.toLocaleString()}
          />
        ))}
      </div>

      <ContentInsights videos={trendingVideos} />
    </div>
  );
}