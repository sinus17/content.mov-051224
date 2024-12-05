import { Handler } from '@netlify/functions';
import axios from 'axios';

const TIKTOK_API_URL = 'https://open-api.tiktok.com/v2/video/query/';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const videoId = event.path.split('/').pop();
    const authorization = event.headers.authorization;

    if (!videoId || !authorization) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing video ID or authorization' })
      };
    }

    const response = await axios.get(TIKTOK_API_URL, {
      headers: {
        'Authorization': authorization,
        'Content-Type': 'application/json'
      },
      params: {
        fields: ['stats', 'desc'],
        video_id: videoId
      }
    });

    return {
      statusCode: 200,
      body: JSON.stringify(response.data)
    };
  } catch (error) {
    console.error('TikTok API error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch video data from TikTok' })
    };
  }
};