import axios, { AxiosInstance } from 'axios';
import { BrowseAiConfig, BrowseAiError, BrowseAiBulkRun, BrowseAiVideo } from '../../types/browse-ai';
import { loggingService } from '../logging';

const BROWSE_AI_API_URL = 'https://api.browse.ai/v2';
const TASKS_PER_PAGE = 10;

export class BrowseAiClient {
  private client: AxiosInstance;
  private config: BrowseAiConfig;

  constructor(config: BrowseAiConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: BROWSE_AI_API_URL,
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
  }

  private async fetchPage(bulkRunId: string, page: number) {
    try {
      const response = await this.client.get(
        `/robots/${this.config.robotId}/bulk-runs/${bulkRunId}`,
        { params: { page } }
      );

      if (!response.data?.result?.robotTasks?.items) {
        throw new Error('Invalid response format from Browse.ai API');
      }

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || error.message;
        throw new Error(`Browse.ai API Error: ${message}`);
      }
      throw error;
    }
  }

  async getRawBulkRunData(bulkRunId: string): Promise<any> {
    try {
      // Fetch first page to get total count
      const firstPage = await this.fetchPage(bulkRunId, 1);
      const totalTasks = firstPage.result.robotTasks.totalCount;
      const totalPages = Math.ceil(totalTasks / TASKS_PER_PAGE);

      loggingService.addLog({
        type: 'info',
        message: `Found ${totalTasks} tasks across ${totalPages} pages`,
        data: { bulkRunId, totalTasks, totalPages }
      });

      // Fetch remaining pages in parallel
      const pagePromises = [];
      for (let page = 2; page <= totalPages; page++) {
        pagePromises.push(this.fetchPage(bulkRunId, page));
      }

      const remainingPages = await Promise.all(pagePromises);
      
      // Combine all tasks
      const allTasks = [
        ...firstPage.result.robotTasks.items,
        ...remainingPages.flatMap(page => page.result.robotTasks.items)
      ];

      // Update first page response with combined tasks
      const combinedResponse = {
        ...firstPage,
        result: {
          ...firstPage.result,
          robotTasks: {
            ...firstPage.result.robotTasks,
            items: allTasks
          }
        }
      };

      loggingService.addLog({
        type: 'success',
        message: 'Successfully fetched all bulk run data',
        data: {
          tasksCount: allTasks.length,
          successfulTasks: allTasks.filter(t => t.status === 'successful').length
        }
      });

      return combinedResponse;
    } catch (error) {
      loggingService.addLog({
        type: 'error',
        message: 'Failed to fetch bulk run data',
        data: error
      });
      throw error;
    }
  }

  async getBulkRunTasks(bulkRunId: string): Promise<any[]> {
    const data = await this.getRawBulkRunData(bulkRunId);
    const tasks = data?.result?.robotTasks?.items || [];

    loggingService.addLog({
      type: 'info',
      message: `Found ${tasks.length} tasks in bulk run`,
      data: {
        successful: tasks.filter(t => t.status === 'successful').length,
        failed: tasks.filter(t => t.status === 'failed').length
      }
    });

    return tasks;
  }

  async getTaskVideos(task: any): Promise<BrowseAiVideo[]> {
    if (task.status !== 'successful' || !task.capturedLists?.['TikTok Videos']) {
      return [];
    }

    const videos = task.capturedLists['TikTok Videos'].map((video: any) => ({
      videoId: video.Video_Link.split('/').pop()?.split('?')[0] || '',
      videoUrl: video.Video_Link,
      description: '',
      author: {
        id: video.Username,
        username: video.Username,
        nickname: video.Username
      },
      stats: {
        views: 0,
        likes: 0,
        shares: 0,
        comments: 0
      },
      soundInfo: {
        title: '',
        artist: '',
        url: task.inputParameters.originUrl
      }
    }));

    loggingService.addLog({
      type: 'info',
      message: `Found ${videos.length} videos in task`,
      data: { taskId: task.id, soundUrl: task.inputParameters.originUrl }
    });

    return videos;
  }
}