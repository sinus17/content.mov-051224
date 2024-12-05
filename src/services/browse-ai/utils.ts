import { supabase } from '../../lib/supabase';
import { BrowseAiVideo } from '../../types/browse-ai';
import { TikTokVideo } from '../../types/tiktok';
import { loggingService } from '../logging';

export async function findTrackByUrl(soundUrl: string) {
  try {
    const { data, error } = await supabase
      .from('tracks')
      .select('id, title, artist, sound_page_url')
      .eq('sound_page_url', soundUrl)
      .single();

    if (!error && data) {
      loggingService.addLog({
        type: 'info',
        message: `Found track by URL match: ${data.title}`,
        data
      });
      return data;
    }
    return null;
  } catch (error) {
    loggingService.addLog({
      type: 'error',
      message: 'Error finding track by URL',
      data: { error, soundUrl }
    });
    return null;
  }
}

export async function findTrackByTitle(title: string) {
  try {
    const { data, error } = await supabase
      .from('tracks')
      .select('id, title, artist, sound_page_url')
      .ilike('title', `%${title}%`)
      .single();

    if (!error && data) {
      loggingService.addLog({
        type: 'info',
        message: `Found track by title match: ${data.title}`,
        data
      });
      return data;
    }
    return null;
  } catch (error) {
    loggingService.addLog({
      type: 'error',
      message: 'Error finding track by title',
      data: { error, title }
    });
    return null;
  }
}

export async function extractTrackInfo(soundUrl: string) {
  try {
    // First try to find by exact URL match
    const trackByUrl = await findTrackByUrl(soundUrl);
    if (trackByUrl) return trackByUrl;

    // Extract title and artist from URL
    const match = soundUrl.match(/music\/([^-]+)-(\d+)/);
    if (!match) {
      loggingService.addLog({
        type: 'error',
        message: 'Could not extract track info from URL',
        data: { soundUrl }
      });
      return null;
    }

    const title = decodeURIComponent(match[1].replace(/%20/g, ' '));
    
    // Try to find by title match
    const trackByTitle = await findTrackByTitle(title);
    if (trackByTitle) return trackByTitle;

    // Extract artist from URL or use default
    const artistMatch = soundUrl.match(/by\/([^?]+)/);
    const artist = artistMatch ? decodeURIComponent(artistMatch[1]) : 'Unknown Artist';

    // If no matches found, return extracted info
    const extractedInfo = {
      id: match[2],
      title,
      artist,
      sound_page_url: soundUrl
    };

    loggingService.addLog({
      type: 'info',
      message: 'Using extracted track info',
      data: extractedInfo
    });

    return extractedInfo;
  } catch (error) {
    loggingService.addLog({
      type: 'error',
      message: 'Error extracting track info',
      data: { error, soundUrl }
    });
    return null;
  }
}