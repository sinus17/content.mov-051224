import { Hot50Track, TikTokVideo } from '../types/tiktok';
import { handleFetchError } from '../lib/errors';
import axios from 'axios';

const TIKTOK_API_BASE = 'https://open.tiktokapis.com/v2';

export async function fetchHot50Playlist(): Promise<Hot50Track[]> {
  try {
    const response = await axios.get(`${TIKTOK_API_BASE}/music/hot50/DE`);
    return response.data.tracks.map((track: any) => ({
      id: track.id,
      title: track.title,
      artist: track.artist_name,
      videos: []
    }));
  } catch (error) {
    throw handleFetchError(error, `${TIKTOK_API_BASE}/music/hot50/DE`);
  }
}

export async function fetchTopVideosForTrack(trackId: string): Promise<TikTokVideo[]> {
  try {
    const response = await axios.get(
      `${TIKTOK_API_BASE}/music/${trackId}/videos`,
      { params: { limit: 20, sort: 'shares' } }
    );
    
    return response.data.videos.map((video: any) => ({
      id: video.id,
      description: video.desc,
      createTime: video.create_time,
      stats: {
        viewCount: video.stats.play_count,
        likeCount: video.stats.digg_count,
        shareCount: video.stats.share_count,
        commentCount: video.stats.comment_count
      },
      music: {
        id: trackId,
        title: video.music.title,
        authorName: video.music.author
      },
      author: {
        id: video.author.id,
        uniqueId: video.author.unique_id,
        nickname: video.author.nickname
      }
    }));
  } catch (error) {
    throw handleFetchError(error, `${TIKTOK_API_BASE}/music/${trackId}/videos`);
  }
}