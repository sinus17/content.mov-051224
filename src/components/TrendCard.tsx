import { Share2, MessageCircle, Heart } from 'lucide-react';
import { cn } from '../lib/utils';
import { VideoPlayer } from './VideoPlayer';

interface TrendCardProps {
  thumbnail: string;
  videoUrl: string;
  title: string;
  views: string;
  likes: string;
  shares: string;
  comments: string;
  className?: string;
}

export function TrendCard({
  thumbnail,
  videoUrl,
  title,
  views,
  likes,
  shares,
  comments,
  className
}: TrendCardProps) {
  return (
    <div className={cn(
      "bg-surface border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow",
      className
    )}>
      <div className="relative">
        <VideoPlayer
          src={videoUrl}
          poster={thumbnail}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50 pointer-events-none" />
      </div>
      <div className="p-4">
        <h3 className="text-text-primary font-medium line-clamp-2 mb-3">{title}</h3>
        <div className="flex items-center justify-between text-text-secondary text-sm">
          <div className="flex items-center space-x-1">
            <span>{views} views</span>
          </div>
          <div className="flex items-center space-x-1">
            <Heart className="w-4 h-4" />
            <span>{likes}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Share2 className="w-4 h-4" />
            <span>{shares}</span>
          </div>
          <div className="flex items-center space-x-1">
            <MessageCircle className="w-4 h-4" />
            <span>{comments}</span>
          </div>
        </div>
      </div>
    </div>
  );
}