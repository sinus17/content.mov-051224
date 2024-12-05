import { GoogleGenerativeAI } from '@google/generative-ai';
import { TikTokVideo, TrendingVideo } from '../types/tiktok';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_AI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

export async function analyzeVideoContent(video: TikTokVideo): Promise<TrendingVideo> {
  try {
    const prompt = `Analyze this TikTok video content:
    Description: ${video.description}
    Stats: ${JSON.stringify(video.stats)}
    
    Please provide:
    1. Content type categories
    2. Identified trends
    3. Engagement analysis with score and factors`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const analysis = JSON.parse(response.text());

    return {
      ...video,
      aiAnalysis: {
        contentType: analysis.contentTypes,
        trends: analysis.trends,
        engagement: {
          score: analysis.engagementScore,
          factors: analysis.engagementFactors
        }
      }
    };
  } catch (error) {
    console.error('Error analyzing video content:', error);
    throw error;
  }
}