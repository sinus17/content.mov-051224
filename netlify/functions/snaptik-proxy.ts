import { Handler } from '@netlify/functions';
import axios from 'axios';
import * as cheerio from 'cheerio';

const SNAPTIK_API_URL = 'https://snaptik.app/api/video';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';

async function getVideoUrl(tiktokUrl: string): Promise<string> {
  try {
    // First request to get token
    const response = await axios.get('https://snaptik.app', {
      headers: {
        'User-Agent': USER_AGENT
      }
    });

    const $ = cheerio.load(response.data);
    const token = $('input[name="token"]').val() as string;

    if (!token) {
      throw new Error('Failed to get token');
    }

    // Second request to get video URL
    const formData = new URLSearchParams();
    formData.append('url', tiktokUrl);
    formData.append('token', token);

    const videoResponse = await axios.post(SNAPTIK_API_URL, formData, {
      headers: {
        'User-Agent': USER_AGENT,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': 'https://snaptik.app',
        'Referer': 'https://snaptik.app/'
      }
    });

    if (!videoResponse.data?.video_url) {
      throw new Error('No video URL in response');
    }

    return videoResponse.data.video_url;
  } catch (error) {
    console.error('Error getting video URL:', error);
    throw error;
  }
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { videoUrl } = JSON.parse(event.body || '{}');
    if (!videoUrl) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing video URL' })
      };
    }

    const fileUrl = await getVideoUrl(videoUrl);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ fileUrl })
    };
  } catch (error) {
    console.error('SnapTik proxy error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: error instanceof Error ? error.message : 'Failed to get video URL',
        details: error instanceof Error ? error.stack : undefined
      })
    };
  }
};