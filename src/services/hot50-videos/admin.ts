import { supabase } from '../../lib/supabase';
import { loggingService } from '../logging';

export class Hot50VideosAdmin {
  async deleteAllVideos() {
    try {
      loggingService.addLog({
        type: 'info',
        message: 'Starting to delete videos from all hot50_videos tables'
      });

      // Delete from all 50 tables
      for (let i = 1; i <= 50; i++) {
        const tableName = `hot50_videos_${i}`;
        
        // First count videos in table
        const { count } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });

        // Delete all videos from table
        const { error } = await supabase
          .from(tableName)
          .delete()
          .gte('id', '00000000-0000-0000-0000-000000000000');

        if (error) {
          loggingService.addLog({
            type: 'error',
            message: `Failed to delete videos from ${tableName}`,
            data: error
          });
          throw error;
        }

        loggingService.addLog({
          type: 'success',
          message: `Cleared ${count || 0} videos from ${tableName}`
        });
      }

      loggingService.addLog({
        type: 'success',
        message: 'Successfully deleted all videos from hot50_videos tables'
      });

      return true;
    } catch (error) {
      loggingService.addLog({
        type: 'error',
        message: 'Failed to delete videos',
        data: error
      });
      throw error;
    }
  }
}

export const hot50VideosAdmin = new Hot50VideosAdmin();