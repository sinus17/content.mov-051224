export interface Database {
  public: {
    Tables: {
      tracks: {
        Row: {
          id: string;
          title: string;
          artist: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          artist: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          artist?: string;
          updated_at?: string;
        };
      };
      videos: {
        Row: {
          id: string;
          track_id: string;
          description: string;
          author_id: string;
          view_count: number;
          like_count: number;
          share_count: number;
          comment_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          track_id: string;
          description: string;
          author_id: string;
          view_count?: number;
          like_count?: number;
          share_count?: number;
          comment_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          track_id?: string;
          description?: string;
          author_id?: string;
          view_count?: number;
          like_count?: number;
          share_count?: number;
          comment_count?: number;
          updated_at?: string;
        };
      };
      authors: {
        Row: {
          id: string;
          unique_id: string;
          nickname: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          unique_id: string;
          nickname: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          unique_id?: string;
          nickname?: string;
          updated_at?: string;
        };
      };
      ai_analysis: {
        Row: {
          id: string;
          video_id: string;
          content_type: string[];
          trends: string[];
          engagement_score: number;
          engagement_factors: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          video_id: string;
          content_type: string[];
          trends: string[];
          engagement_score: number;
          engagement_factors: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          content_type?: string[];
          trends?: string[];
          engagement_score?: number;
          engagement_factors?: string[];
          updated_at?: string;
        };
      };
    };
  };
}