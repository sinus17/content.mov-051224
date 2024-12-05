import { Download, Loader } from 'lucide-react';
import { cn } from '../lib/utils';
import { VideoError } from './video/VideoError';
import { useVideoDownload } from './video/useVideoDownload';

interface HoverVideoPlayerProps {
  src: string;
  poster: string;
  className?: string;
}

export function HoverVideoPlayer({ src, poster, className }: HoverVideoPlayerProps) {
  const {
    isHovering,
    setIsHovering,
    error,
    isDownloading,
    handleDownload
  } = useVideoDownload(src);

  return (
    <div 
      className={cn("relative aspect-[9/16] bg-black rounded-lg overflow-hidden group", className)}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <img
        src={poster}
        alt="Video thumbnail"
        className="w-full h-full object-cover"
      />
      
      {error && <VideoError message={error} />}
      
      {isHovering && !error && (
        <div className="absolute bottom-4 right-4">
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors disabled:opacity-50"
          >
            {isDownloading ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
          </button>
        </div>
      )}
    </div>
  );
}