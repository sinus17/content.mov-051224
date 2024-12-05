import { useRef, useEffect } from 'react';
import Plyr from 'plyr-react';
import 'plyr-react/plyr.css';
import { cn } from '../lib/utils';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  className?: string;
}

export function VideoPlayer({ src, poster, className }: VideoPlayerProps) {
  const playerRef = useRef<Plyr>(null);

  useEffect(() => {
    if (playerRef.current) {
      const player = playerRef.current;
      player.source = {
        type: 'video',
        sources: [{ src, type: 'video/mp4' }],
        poster
      };
    }
  }, [src, poster]);

  return (
    <div className={cn("relative aspect-[9/16] bg-black rounded-lg overflow-hidden", className)}>
      <Plyr
        ref={playerRef}
        source={{
          type: 'video',
          sources: [{ src, type: 'video/mp4' }],
          poster
        }}
        options={{
          controls: ['play', 'progress', 'current-time', 'mute', 'volume'],
          ratio: '9:16',
          clickToPlay: true,
          autopause: true,
          hideControls: true,
          keyboard: { focused: true, global: false }
        }}
      />
    </div>
  );
}