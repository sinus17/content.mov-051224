import { Handler } from '@netlify/functions';
import axios from 'axios';

const TIKTOK_AUTH_URL = 'https://open-api.tiktok.com/oauth/access_token/';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { client_key, client_secret, grant_type } = JSON.parse(event.body || '{}');

    const response = await axios.post(TIKTOK_AUTH_URL, {
      client_key,
      client_secret,
      grant_type
    });

    return {
      statusCode: 200,
      body: JSON.stringify(response.data)
    };
  } catch (error) {
    console.error('TikTok auth error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to authenticate with TikTok' })
    };
  }
};