import { serve } from 'https://deno.fresh.run/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface BrowseAiWebhookPayload {
  robotId: string;
  runId: string;
  status: 'completed' | 'failed';
  data?: {
    tracks: Array<{
      title: string;
      artist: string;
      position: number;
      videos: Array<{
        id: string;
        url: string;
        description: string;
        author: {
          id: string;
          uniqueId: string;
          nickname: string;
        };
        stats: {
          views: number;
          likes: number;
          shares: number;
          comments: number;
        };
      }>;
    }>;
  };
}

serve(async (req) => {
  try {
    const payload: BrowseAiWebhookPayload = await req.json();

    // Verify this is from our Hot50 robot
    if (payload.robotId !== '688de37b-24fe-4960-8775-b15f8139bf0a') {
      return new Response('Invalid robot ID', { status: 400 });
    }

    if (payload.status === 'failed' || !payload.data?.tracks) {
      return new Response('No data available', { status: 400 });
    }

    const date = new Date().toISOString().split('T')[0];

    // Process each track
    for (const track of payload.data.tracks) {
      // Save track
      const { data: savedTrack, error: trackError } = await supabase
        .from('tracks')
        .upsert({
          title: track.title,
          artist: track.artist
        })
        .select()
        .single();

      if (trackError) throw trackError;

      // Update Hot50 position
      await supabase
        .from('hot50')
        .upsert({
          track_id: savedTrack.id,
          position: track.position,
          date
        });

      // Process videos
      for (const video of track.videos) {
        // Save author
        const { data: author, error: authorError } = await supabase
          .from('authors')
          .upsert({
            id: video.author.id,
            unique_id: video.author.uniqueId,
            nickname: video.author.nickname
          })
          .select()
          .single();

        if (authorError) throw authorError;

        // Save video
        await supabase
          .from('videos')
          .upsert({
            id: video.id,
            track_id: savedTrack.id,
            description: video.description,
            author_id: author.id,
            view_count: video.stats.views,
            like_count: video.stats.likes,
            share_count: video.stats.shares,
            comment_count: video.stats.comments
          });
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});