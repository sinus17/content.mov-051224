import { BarChart3, TrendingUp, Users } from 'lucide-react';
import { TrendingVideo } from '../types/tiktok';

interface ContentInsightsProps {
  videos: TrendingVideo[];
}

export function ContentInsights({ videos }: ContentInsightsProps) {
  const calculateAverageEngagement = () => {
    if (!videos.length) return 0;
    return videos.reduce((acc, video) => acc + video.aiAnalysis.engagement.score, 0) / videos.length;
  };

  const getTopTrends = () => {
    const trends = videos.flatMap(video => video.aiAnalysis.trends);
    const trendCounts = trends.reduce((acc, trend) => {
      acc[trend] = (acc[trend] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(trendCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([trend]) => trend);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
      <div className="bg-surface p-6 rounded-lg">
        <div className="flex items-center space-x-2 mb-4">
          <BarChart3 className="w-5 h-5 text-cream" />
          <h3 className="text-lg font-medium text-cream-light">Average Engagement</h3>
        </div>
        <p className="text-3xl font-bold text-text-primary">{calculateAverageEngagement().toFixed(1)}</p>
        <p className="text-text-secondary mt-2">Based on AI analysis</p>
      </div>

      <div className="bg-surface p-6 rounded-lg">
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp className="w-5 h-5 text-cream" />
          <h3 className="text-lg font-medium text-cream-light">Top Trends</h3>
        </div>
        <ul className="space-y-2">
          {getTopTrends().map((trend, index) => (
            <li key={index} className="text-text-primary">{trend}</li>
          ))}
        </ul>
      </div>

      <div className="bg-surface p-6 rounded-lg">
        <div className="flex items-center space-x-2 mb-4">
          <Users className="w-5 h-5 text-cream" />
          <h3 className="text-lg font-medium text-cream-light">Content Types</h3>
        </div>
        <ul className="space-y-2">
          {Array.from(new Set(videos.flatMap(v => v.aiAnalysis.contentType)))
            .slice(0, 5)
            .map((type, index) => (
              <li key={index} className="text-text-primary">{type}</li>
            ))}
        </ul>
      </div>
    </div>
  );
}