import { AlertTriangle } from 'lucide-react';

interface VideoErrorProps {
  message: string;
}

export function VideoError({ message }: VideoErrorProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
      <div className="text-center px-4">
        <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
        <p className="text-sm text-white">{message}</p>
      </div>
    </div>
  );
}