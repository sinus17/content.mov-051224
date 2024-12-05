import { useNotificationStore } from '../store/notifications';

export interface LogEntry {
  timestamp: Date;
  type: 'info' | 'success' | 'error';
  message: string;
  data?: unknown;
}

class LoggingService {
  private logs: LogEntry[] = [];
  private subscribers: ((logs: LogEntry[]) => void)[] = [];

  addLog(entry: Omit<LogEntry, 'timestamp'>) {
    const logEntry = {
      ...entry,
      timestamp: new Date()
    };

    // Add new logs at the beginning of the array
    this.logs.unshift(logEntry);
    this.notifySubscribers();

    // Show notification for errors
    if (entry.type === 'error') {
      useNotificationStore.getState().addNotification({
        type: 'error',
        message: entry.message,
        data: entry.data
      });
    }
  }

  getLogs() {
    return [...this.logs];
  }

  subscribe(callback: (logs: LogEntry[]) => void) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  private notifySubscribers() {
    this.subscribers.forEach(callback => callback(this.getLogs()));
  }

  clear() {
    this.logs = [];
    this.notifySubscribers();
  }
}

export const loggingService = new LoggingService();