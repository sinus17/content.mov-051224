import { describe, it, expect } from 'vitest';
import { videoProcessor } from '../video-processor';
import { trackProcessor } from '../track-processor';

const sampleTask = {
  id: "a79ca9ee-a5f2-4061-ae09-14daadb56f5d",
  status: "successful",
  inputParameters: {
    originUrl: "https://www.tiktok.com/music/Ma%20Baby-7430864219010566145?mc_id=6678961649233169157&mc_name=DE-Hot-50",
    tiktok_videos_limit: 15
  },
  capturedLists: {
    "TikTok Videos": [{
      Position: "1",
      Username: "jazeek99",
      "Video Link": "https://www.tiktok.com/@jazeek99/video/7438979070957817121",
      "Thumbnail Image": "https://p16-sign-useast2a.tiktokcdn.com/obj/tos-useast2a-p-0037-euttp/oQfn1lRYENDPi8HEhkF1hQXBDyfTQQBrIhDPQA",
      "Profile Link": "https://www.tiktok.com/@jazeek99?lang=en",
      "Profile Picture": "https://p16-pu-sign-no.tiktokcdn-eu.com/obj/tos-no1a-avt-0068c001-no/004a84c1cf6a722b592396dd67f0c458"
    }]
  }
};

describe('Hot50 Video Processor', () => {
  it('should process track data correctly', async () => {
    const trackData = {
      id: '7430864219010566145',
      title: 'Ma Baby',
      rank: 1,
      soundUrl: sampleTask.inputParameters.originUrl
    };

    const track = await trackProcessor.saveTrack(trackData);
    expect(track).toBeDefined();
    expect(track.id).toBe(trackData.id);
    expect(track.title).toBe(trackData.title);
  });

  it('should process video data correctly', async () => {
    const video = sampleTask.capturedLists['TikTok Videos'][0];
    const videoData = {
      trackId: '7430864219010566145',
      rank: 1,
      videoUrl: video['Video Link'],
      thumbnailUrl: video['Thumbnail Image'],
      description: '',
      author: {
        username: video.Username,
        profileUrl: video['Profile Link'],
        profilePicture: video['Profile Picture']
      }
    };

    const result = await videoProcessor.saveVideo(videoData);
    expect(result).toBe(true);
  });
});