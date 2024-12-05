export interface Hot50Video {
  id: string;
  track_id: string;
  video_url: string;
  video_analysis: string | null;
  text_hook: string | null;
  adaptation_tip: string | null;
  created_at: string;
}

export interface VideoAnalysis {
  contentType: string[];
  trends: string[];
  engagementScore: number;
  engagementFactors: string[];
}