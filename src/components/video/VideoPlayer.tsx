import { useRef, useEffect } from 'react';

interface VideoPlayerProps {
  src: string;
  poster: string;
  muted: boolean;
  onError: () => void;
}

export function VideoPlayer({ src, poster, muted, onError }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const playVideo = async () => {
      try {
        video.load();
        await video.play();
      } catch (err) {
        console.error('Video playback error:', err);
        onError();
      }
    };

    playVideo();

    return () => {
      video.pause();
      video.removeAttribute('src');
      video.load();
    };
  }, [src, onError]);

  return (
    <video
      ref={videoRef}
      muted={muted}
      playsInline
      loop
      preload="metadata"
      className="w-full h-full object-cover"
      poster={poster}
      onError={onError}
    >
      <source src={src} type="video/mp4" />
      <source src={src} type="video/webm" />
      Your browser does not support the video tag.
    </video>
  );
}