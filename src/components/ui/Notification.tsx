import { useEffect, useState } from 'react';
import { X, Copy, Check, AlertTriangle, Info } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useNotificationStore } from '../../store/notifications';

interface NotificationProps {
  id: string;
  type: 'info' | 'error';
  message: string;
  data?: unknown;
}

export function Notification({ id, type, message, data }: NotificationProps) {
  const { removeNotification } = useNotificationStore();
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      removeNotification(id);
    }, 5000);

    return () => clearTimeout(timer);
  }, [id, removeNotification]);

  const handleCopy = async () => {
    if (!data) return;
    
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 max-w-sm w-full bg-surface border border-border rounded-lg shadow-lg p-4",
        "transform transition-all duration-300 ease-in-out",
        "animate-in slide-in-from-right"
      )}
    >
      <div className="flex items-start gap-3">
        {type === 'error' ? (
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
        ) : (
          <Info className="w-5 h-5 text-cream flex-shrink-0" />
        )}
        
        <div className="flex-1 min-w-0">
          <p className={cn(
            "text-sm font-medium",
            type === 'error' ? "text-red-500" : "text-text-primary"
          )}>
            {message}
          </p>
          
          {data && (
            <pre className="mt-2 text-xs text-text-secondary bg-surface-secondary rounded p-2 overflow-x-auto">
              {JSON.stringify(data, null, 2)}
            </pre>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {data && (
            <button
              onClick={handleCopy}
              className="p-1 hover:bg-surface-secondary rounded transition-colors"
              title="Copy error details"
            >
              {isCopied ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4 text-text-secondary" />
              )}
            </button>
          )}
          
          <button
            onClick={() => removeNotification(id)}
            className="p-1 hover:bg-surface-secondary rounded transition-colors"
          >
            <X className="w-4 h-4 text-text-secondary" />
          </button>
        </div>
      </div>
    </div>
  );
}