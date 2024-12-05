import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Clock, FileJson } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ParseLogEntry {
  type: 'info' | 'success' | 'error';
  message: string;
  timestamp: Date;
  details?: {
    track?: {
      title: string;
      position: number;
    };
    videos?: number;
  };
}

interface JsonParsingLogProps {
  isActive: boolean;
  onComplete?: () => void;
}

export function JsonParsingLog({ isActive, onComplete }: JsonParsingLogProps) {
  const [logs, setLogs] = useState<ParseLogEntry[]>([]);
  const [startTime, setStartTime] = useState<Date | null>(null);

  useEffect(() => {
    if (isActive && !startTime) {
      setStartTime(new Date());
      setLogs([{ 
        type: 'info', 
        message: 'Starting JSON parsing process...', 
        timestamp: new Date() 
      }]);
    }
  }, [isActive, startTime]);

  const addLog = (entry: Omit<ParseLogEntry, 'timestamp'>) => {
    setLogs(prev => [...prev, { ...entry, timestamp: new Date() }]);
  };

  const getElapsedTime = () => {
    if (!startTime) return '0s';
    const elapsed = Date.now() - startTime.getTime();
    return formatDistanceToNow(startTime, { includeSeconds: true });
  };

  if (!isActive && logs.length === 0) return null;

  return (
    <div className="bg-surface border border-border rounded-lg p-6 mt-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <FileJson className="w-5 h-5 text-cream" />
          <h3 className="text-lg font-medium text-text-primary">JSON Import Log</h3>
        </div>
        <div className="flex items-center space-x-2 text-sm text-text-secondary">
          <Clock className="w-4 h-4" />
          <span>Elapsed: {getElapsedTime()}</span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Progress Overview */}
        {isActive && (
          <div className="bg-surface-secondary rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-cream border-t-transparent" />
              <span className="text-text-primary">Processing JSON data...</span>
            </div>
            <div className="text-sm text-text-secondary">
              Processed {logs.filter(log => log.details?.track).length} tracks
            </div>
          </div>
        )}

        {/* Log Entries */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {logs.map((log, index) => (
            <div 
              key={index}
              className="bg-surface-secondary rounded-lg p-3 text-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {log.type === 'success' && (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                  {log.type === 'error' && (
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  )}
                  <span className={
                    log.type === 'success' ? 'text-green-500' :
                    log.type === 'error' ? 'text-red-500' :
                    'text-text-primary'
                  }>
                    {log.message}
                  </span>
                </div>
                <span className="text-text-secondary text-xs">
                  {formatDistanceToNow(log.timestamp, { addSuffix: true })}
                </span>
              </div>

              {log.details && (
                <div className="text-text-secondary mt-1">
                  {log.details.track && (
                    <p>Track: {log.details.track.title} (Position: {log.details.track.position})</p>
                  )}
                  {log.details.videos !== undefined && (
                    <p>Videos processed: {log.details.videos}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}