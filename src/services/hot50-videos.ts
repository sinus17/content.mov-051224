import { supabase } from '../lib/supabase';
import { Hot50Video, VideoAnalysis } from '../types/hot50-videos';
import { BrowseAiVideo } from '../types/browse-ai';

export async function saveHot50Videos(
  trackId: string,
  position: number,
  videos: BrowseAiVideo[]
): Promise<void> {
  try {
    const tableName = `hot50_videos_${position}`;

    // Process each video
    for (const video of videos) {
      const videoData: Omit<Hot50Video, 'id' | 'created_at'> = {
        track_id: trackId,
        video_url: video.Video_Link,
        video_analysis: null,
        text_hook: null,
        adaptation_tip: null
      };

      const { error } = await supabase
        .from(tableName)
        .upsert(videoData);

      if (error) {
        console.error(`Error saving video to ${tableName}:`, error);
      }
    }
  } catch (error) {
    console.error('Error saving Hot50 videos:', error);
    throw error;
  }
}

export async function getHot50Videos(position: number): Promise<Hot50Video[]> {
  try {
    const tableName = `hot50_videos_${position}`;
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error(`Error fetching videos from position ${position}:`, error);
    throw error;
  }
}

export async function updateVideoAnalysis(
  position: number,
  videoId: string,
  analysis: VideoAnalysis
): Promise<void> {
  try {
    const tableName = `hot50_videos_${position}`;
    const { error } = await supabase
      .from(tableName)
      .update({
        video_analysis: JSON.stringify(analysis)
      })
      .eq('id', videoId);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating video analysis:', error);
    throw error;
  }
}

export async function updateVideoHooks(
  position: number,
  videoId: string,
  textHook: string,
  adaptationTip: string
): Promise<void> {
  try {
    const tableName = `hot50_videos_${position}`;
    const { error } = await supabase
      .from(tableName)
      .update({
        text_hook: textHook,
        adaptation_tip: adaptationTip
      })
      .eq('id', videoId);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating video hooks:', error);
    throw error;
  }
}