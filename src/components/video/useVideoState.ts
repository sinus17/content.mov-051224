import { useState, useRef } from 'react';
import { snapTikService } from '../../services/snaptik';
import { loggingService } from '../../services/logging';

export function useVideoState(videoUrl: string) {
  const [isHovering, setIsHovering] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const retryCount = useRef(0);
  const maxRetries = 3;

  const loadVideo = async () => {
    if (!isHovering || fileUrl || error) return;

    setIsLoading(true);
    try {
      const url = await snapTikService.getVideoFileUrl(videoUrl);
      setFileUrl(url);
      setError(null);
      retryCount.current = 0;
    } catch (err) {
      console.error('Failed to get video URL:', err);
      setError('Failed to load video');
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleError = () => {
    if (retryCount.current < maxRetries) {
      retryCount.current++;
      console.log(`Retrying video load (${retryCount.current}/${maxRetries})...`);
      setTimeout(loadVideo, 1000);
    } else {
      setError('Failed to play video');
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMuted(!isMuted);
  };

  return {
    isHovering,
    setIsHovering,
    isMuted,
    error,
    isLoading,
    isDownloading,
    fileUrl,
    handleError,
    toggleMute,
    handleDownload,
    loadVideo
  };
}