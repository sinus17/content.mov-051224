export const HOT50_TABLE = 'hot50';
export const TRACKS_TABLE = 'tracks';
export const AUTHORS_TABLE = 'authors';

export function getVideoTableName(rank: number) {
  return `hot50_videos_${rank}`;
}