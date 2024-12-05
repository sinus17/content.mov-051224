import { Volume2, VolumeX, Download } from 'lucide-react';

interface VideoControlsProps {
  isMuted: boolean;
  onToggleMute: (e: React.MouseEvent) => void;
  onDownload: (e: React.MouseEvent) => void;
  isDownloading?: boolean;
}

export function VideoControls({ isMuted, onToggleMute, onDownload, isDownloading }: VideoControlsProps) {
  return (
    <div className="absolute bottom-4 right-4 flex items-center space-x-2">
      <button
        onClick={onDownload}
        disabled={isDownloading}
        className="p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors disabled:opacity-50"
      >
        <Download className={`w-4 h-4 ${isDownloading ? 'animate-bounce' : ''}`} />
      </button>
      <button
        onClick={onToggleMute}
        className="p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
      >
        {isMuted ? (
          <VolumeX className="w-4 h-4" />
        ) : (
          <Volume2 className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}