import { useEffect, useState, useRef } from 'react';
import { Clock, AlertTriangle, CheckCircle, Info, Trash2, Copy, Check } from 'lucide-react';
import { LogEntry, loggingService } from '../services/logging';
import { formatDistanceToNow } from 'date-fns';

export function LogViewer() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = loggingService.subscribe(setLogs);
    return unsubscribe;
  }, []);

  const handleCopy = async (data: unknown, index: number) => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  if (logs.length === 0) {
    return null;
  }

  return (
    <div className="bg-surface border border-border rounded-lg p-6 mt-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Clock className="w-5 h-5 text-cream" />
          <h3 className="text-lg font-medium text-text-primary">Response Log</h3>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-text-secondary">
            {logs.length} {logs.length === 1 ? 'entry' : 'entries'}
          </span>
          <button
            onClick={() => loggingService.clear()}
            className="p-2 hover:bg-surface-secondary rounded-lg transition-colors"
            title="Clear logs"
          >
            <Trash2 className="w-4 h-4 text-text-secondary" />
          </button>
        </div>
      </div>

      <div 
        ref={logContainerRef}
        className="space-y-3 max-h-96 overflow-y-auto"
      >
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
                {log.type === 'info' && (
                  <Info className="w-4 h-4 text-cream" />
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

            {log.data && (
              <div className="relative mt-2">
                <pre className="p-2 bg-surface/50 rounded text-text-secondary overflow-x-auto">
                  {JSON.stringify(log.data, null, 2)}
                </pre>
                <button
                  onClick={() => handleCopy(log.data, index)}
                  className="absolute top-2 right-2 p-1.5 bg-surface rounded hover:bg-surface-secondary transition-colors"
                  title="Copy to clipboard"
                >
                  {copiedIndex === index ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4 text-text-secondary" />
                  )}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}