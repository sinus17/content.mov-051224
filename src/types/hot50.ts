import { Track } from './tiktok';

export interface Hot50Entry {
  id: string;
  position: number;
  previous_position: number | null;
  weeks_on_chart: number;
  date: string;
  track: Track;
}

export interface ChartMovement {
  type: 'new' | 'up' | 'down' | 'same';
  difference?: number;
}