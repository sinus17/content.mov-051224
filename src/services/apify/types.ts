export interface ApifyConfig {
  actorId: string;
  taskName: string;
  maxRetries: number;
  retryDelay: number;
}

export interface ApifyVideoStats {
  viewCount: number;
  likeCount: number;
  shareCount: number;
  commentCount: number;
}

export interface ApifyAuthor {
  id: string;
  username: string;
  nickname: string;
}

export interface ApifyVideoDetails {
  videoId: string;
  description: string;
  stats: ApifyVideoStats;
  author: ApifyAuthor;
}

export interface ApifyTaskResult {
  items: ApifyVideoDetails[];
  error?: string;
}

export interface ApifyVideoResponse {
  id?: string;
  text?: string;
  desc?: string;
  stats?: {
    playCount?: string | number;
    diggCount?: string | number;
    shareCount?: string | number;
    commentCount?: string | number;
  };
  authorMeta?: {
    id?: string;
    name?: string;
    nickName?: string;
  };
  author?: {
    id?: string;
    uniqueId?: string;
    nickname?: string;
  };
}