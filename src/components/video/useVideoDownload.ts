import { useState } from 'react';
import { snapTikService } from '../../services/snaptik';
import { loggingService } from '../../services/logging';

export function useVideoDownload(videoUrl: string) {
  const [isHovering, setIsHovering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isDownloading || !videoUrl) return;

    setIsDownloading(true);
    try {
      const url = await snapTikService.getVideoFileUrl(videoUrl);
      
      // Create temporary link and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = `tiktok-video-${Date.now()}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      loggingService.addLog({
        type: 'success',
        message: 'Video download started',
        data: { videoUrl }
      });
    } catch (error) {
      loggingService.addLog({
        type: 'error',
        message: 'Failed to download video',
        data: { error, videoUrl }
      });
      setError('Failed to download video');
    } finally {
      setIsDownloading(false);
    }
  };

  return {
    isHovering,
    setIsHovering,
    error,
    isDownloading,
    handleDownload
  };
}