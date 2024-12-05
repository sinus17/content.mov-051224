export interface BrowseAiConfig {
  apiKey: string;
  teamId: string;
  robotId: string;
}

export interface BrowseAiVideo {
  videoId: string;
  videoUrl: string;
  description: string;
  author: {
    id: string;
    username: string;
    nickname: string;
  };
  stats: {
    views: number;
    likes: number;
    shares: number;
    comments: number;
  };
  soundInfo: {
    title: string;
    artist: string;
    url: string;
  };
}

export interface BrowseAiRobotRun {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt: string;
  completedAt?: string;
  error?: string;
  data?: {
    videos: BrowseAiVideo[];
  };
}

export interface BrowseAiBulkRun {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: {
    total: number;
    completed: number;
    failed: number;
  };
  createdAt: string;
  updatedAt: string;
  runs: Array<{
    id: string;
    status: string;
    data?: any;
  }>;
}

export interface BrowseAiError {
  code: string;
  message: string;
  details?: unknown;
}