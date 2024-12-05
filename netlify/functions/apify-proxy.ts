import { Handler } from '@netlify/functions';
import axios from 'axios';

const APIFY_API_URL = 'https://api.apify.com/v2';
const APIFY_TOKEN = 'apify_api_IJtIeRDqKdEP0UsHIQVBlPnfH8y78V322E8Y';
const ACTOR_ID = 'nCNiU9QG1e0nMwgWj';

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
        body: JSON.stringify({ error: 'Video URL is required' })
      };
    }

    // Create and start actor run
    const runResponse = await axios.post(
      `${APIFY_API_URL}/acts/${ACTOR_ID}/runs`,
      {
        urls: [videoUrl],
        proxyConfiguration: {
          useApifyProxy: true
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${APIFY_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const runId = runResponse.data.data.id;

    // Poll for completion with timeout
    let status = 'RUNNING';
    let attempts = 0;
    const maxAttempts = 30;
    
    while (status === 'RUNNING' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const statusResponse = await axios.get(
        `${APIFY_API_URL}/acts/${ACTOR_ID}/runs/${runId}`,
        {
          headers: {
            'Authorization': `Bearer ${APIFY_TOKEN}`
          }
        }
      );
      
      status = statusResponse.data.data.status;
      attempts++;
    }

    if (status !== 'SUCCEEDED') {
      throw new Error(`Actor run failed with status: ${status}`);
    }

    // Get dataset items
    const datasetResponse = await axios.get(
      `${APIFY_API_URL}/acts/${ACTOR_ID}/runs/${runId}/dataset/items`,
      {
        headers: {
          'Authorization': `Bearer ${APIFY_TOKEN}`
        }
      }
    );

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(datasetResponse.data)
    };
  } catch (error) {
    console.error('Apify proxy error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: error instanceof Error ? error.message : 'Failed to fetch video data',
        details: error instanceof Error ? error.stack : undefined
      })
    };
  }
};