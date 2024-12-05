export interface VideoData {
  trackId: string;
  rank: number;
  videoUrl: string;
  thumbnailUrl: string;
  description: string;
  author: {
    username: string;
    profileUrl: string;
    profilePicture: string;
  };
}

export interface TrackData {
  id: string;
  title: string;
  artist?: string;
  rank: number;
  soundUrl: string;
}

export interface ProcessedTrack {
  id: string;
  title: string;
  rank: number;
  videos: Array<{
    videoId: string;
    videoUrl: string;
    description: string;
    author: {
      username: string;
      profileUrl: string;
      profilePicture: string;
    };
    thumbnailUrl: string;
  }>;
}