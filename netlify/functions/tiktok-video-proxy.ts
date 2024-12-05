import { Handler } from '@netlify/functions';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

async function extractTikTokVideo(tiktokUrl: string): Promise<{
  videoUrl: string;
  contentType: string;
}> {
  try {
    const response = await axios.get(tiktokUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Referer': 'https://www.tiktok.com/'
      }
    });

    const $ = cheerio.load(response.data);
    
    // First try to find the video URL in the JSON-LD data
    const jsonLd = $('script[type="application/ld+json"]').html();
    if (jsonLd) {
      try {
        const data = JSON.parse(jsonLd);
        if (data.contentUrl) {
          return {
            videoUrl: data.contentUrl,
            contentType: 'video/mp4'
          };
        }
      } catch (e) {
        console.error('Failed to parse JSON-LD:', e);
      }
    }

    // Try different meta tags that might contain the video URL
    const videoUrl = 
      $('meta[property="og:video:secure_url"]').attr('content') ||
      $('meta[property="og:video"]').attr('content') ||
      $('video source').attr('src') ||
      $('video').attr('src');

    if (!videoUrl) {
      throw new Error('Video URL not found');
    }

    // Get content type from video URL or default to mp4
    const contentType = videoUrl.includes('.mp4') ? 'video/mp4' : 'video/webm';

    return { videoUrl, contentType };
  } catch (error) {
    console.error('Error extracting video URL:', error);
    throw new Error('Failed to extract video URL from TikTok page');
  }
}

async function updateVideoFileUrl(videoUrl: string, fileUrl: string) {
  try {
    // Update main videos table
    await supabase
      .from('videos')
      .update({ file_url: fileUrl })
      .eq('video_url', videoUrl);

    // Update all hot50_videos tables
    for (let i = 1; i <= 50; i++) {
      await supabase
        .from(`hot50_videos_${i}`)
        .update({ file_url: fileUrl })
        .eq('video_url', videoUrl);
    }
  } catch (error) {
    console.error('Error updating file_url:', error);
  }
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const tiktokUrl = event.queryStringParameters?.url;
    if (!tiktokUrl) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing TikTok URL' })
      };
    }

    // Extract video information
    const { videoUrl, contentType } = await extractTikTokVideo(tiktokUrl);

    // Update file_url in database
    await updateVideoFileUrl(tiktokUrl, videoUrl);

    // Fetch video content with proper headers
    const videoResponse = await axios.get(videoUrl, {
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'video/webm,video/mp4,video/*;q=0.9',
        'Range': 'bytes=0-',
        'Referer': 'https://www.tiktok.com/'
      },
      maxRedirects: 5,
      timeout: 10000,
      validateStatus: (status) => status >= 200 && status < 300
    });

    // Verify we got valid video data
    if (!videoResponse.data || videoResponse.data.length === 0) {
      throw new Error('Received empty video data');
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': videoResponse.headers['content-length'],
        'Accept-Ranges': 'bytes',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600',
        'X-Content-Type-Options': 'nosniff'
      },
      body: Buffer.from(videoResponse.data).toString('base64'),
      isBase64Encoded: true
    };
  } catch (error) {
    console.error('Video proxy error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to fetch video',
        details: error instanceof Error ? error.stack : undefined
      })
    };
  }
};