import { ApifyVideoResponse, ApifyVideoDetails } from './types';

export function mapVideoResponse(response: ApifyVideoResponse): ApifyVideoDetails {
  return {
    videoId: response.id || '',
    description: response.text || response.desc || '',
    stats: {
      viewCount: parseInt(String(response.stats?.playCount || '0')),
      likeCount: parseInt(String(response.stats?.diggCount || '0')),
      shareCount: parseInt(String(response.stats?.shareCount || '0')),
      commentCount: parseInt(String(response.stats?.commentCount || '0'))
    },
    author: {
      id: response.authorMeta?.id || response.author?.id || '',
      username: response.authorMeta?.name || response.author?.uniqueId || '',
      nickname: response.authorMeta?.nickName || response.author?.nickname || ''
    }
  };
}