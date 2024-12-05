export function extractTrackInfo(originUrl: string) {
  const trackMatch = originUrl.match(/music\/([^-]+)-(\d+)/);
  if (!trackMatch) return null;

  return {
    title: decodeURIComponent(trackMatch[1].replace(/%20/g, ' ')),
    id: trackMatch[2]
  };
}

export function extractVideoId(videoUrl: string) {
  const videoIdMatch = videoUrl.match(/video\/(\d+)/);
  return videoIdMatch ? videoIdMatch[1] : null;
}

export function parseDate(dateString: string) {
  return new Date(dateString).toISOString().split('T')[0];
}