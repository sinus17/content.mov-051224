import { Video } from 'lucide-react';
import { cn } from '../lib/utils';

interface VideoBadgeProps {
  count: number;
  className?: string;
}

export function VideoBadge({ count, className }: VideoBadgeProps) {
  return (
    <div className={cn(
      "flex items-center space-x-1 px-2 py-0.5 bg-cream/10 rounded-full",
      className
    )}>
      <Video className="w-3 h-3 text-cream" />
      <span className="text-xs font-medium text-cream">{count}</span>
    </div>
  );
}