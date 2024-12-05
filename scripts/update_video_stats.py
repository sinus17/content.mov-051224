import os
import json
import asyncio
from TikTokApi import TikTokApi
from supabase import create_client, Client

# Initialize Supabase client
supabase_url = os.getenv('VITE_SUPABASE_URL')
supabase_key = os.getenv('VITE_SUPABASE_ANON_KEY')
supabase: Client = create_client(supabase_url, supabase_key)

async def get_video_stats(video_url: str) -> dict:
    """Fetch video stats from TikTok API"""
    try:
        # Extract video ID from URL
        video_id = video_url.split('/')[-1].split('?')[0]
        
        async with TikTokApi() as api:
            video = await api.video(id=video_id)
            stats = await video.info()
            
            return {
                'view_count': stats['stats']['playCount'],
                'like_count': stats['stats']['diggCount'],
                'share_count': stats['stats']['shareCount'],
                'comment_count': stats['stats']['commentCount'],
                'description': stats['desc']
            }
    except Exception as e:
        print(f"Error fetching stats for video {video_url}: {str(e)}")
        return None

async def update_video_stats():
    """Update stats for all videos in database"""
    try:
        # Get all videos from database
        response = supabase.table('videos').select('id, video_url').execute()
        videos = response.data

        print(f"Found {len(videos)} videos to update")

        # Process videos in batches
        batch_size = 10
        for i in range(0, len(videos), batch_size):
            batch = videos[i:i + batch_size]
            
            # Process batch concurrently
            tasks = []
            for video in batch:
                if video['video_url']:
                    tasks.append(get_video_stats(video['video_url']))
            
            # Wait for all tasks in batch to complete
            results = await asyncio.gather(*tasks)
            
            # Update database with results
            for video, stats in zip(batch, results):
                if stats:
                    try:
                        supabase.table('videos').update(stats).eq('id', video['id']).execute()
                        print(f"Updated stats for video {video['id']}")
                    except Exception as e:
                        print(f"Error updating database for video {video['id']}: {str(e)}")
            
            # Add delay between batches
            if i + batch_size < len(videos):
                await asyncio.sleep(1)

        print("Successfully updated all video stats")
    except Exception as e:
        print(f"Error updating video stats: {str(e)}")

if __name__ == "__main__":
    asyncio.run(update_video_stats())