import axios from 'axios';

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  duration: string;
}

export interface YouTubePlaylist {
  id: string;
  title: string;
  videos: YouTubeVideo[];
}

interface VideoDetails {
  duration: string;
  thumbnailUrl: string;
}

const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;

// Convert YouTube duration format (PT1H2M10S) to readable format (1:02:10)
function formatDuration(duration: string): string {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  
  const hours = (match?.[1] || '').replace('H', '');
  const minutes = (match?.[2] || '').replace('M', '');
  const seconds = (match?.[3] || '').replace('S', '');

  const parts = [];
  
  if (hours) {
    parts.push(hours);
    parts.push(minutes.padStart(2, '0') || '00');
  } else if (minutes) {
    parts.push(minutes);
  } else {
    parts.push('0');
  }
  
  parts.push(seconds.padStart(2, '0') || '00');
  
  return parts.join(':');
}

export async function getChannelPlaylists(channelId: string): Promise<YouTubePlaylist[]> {
  try {
    // Get playlists from channel
    const playlistResponse = await axios.get(
      `https://www.googleapis.com/youtube/v3/playlists?part=snippet&channelId=${channelId}&maxResults=50&key=${YOUTUBE_API_KEY}`
    );

    const playlists = await Promise.all(
      playlistResponse.data.items.map(async (playlist: { id: string; snippet: { title: string } }) => {
        // Get videos for each playlist
        const playlistItemsResponse = await axios.get(
          `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${playlist.id}&maxResults=50&key=${YOUTUBE_API_KEY}`
        );

        // Get video details including duration
        const videoIds = playlistItemsResponse.data.items.map((item: { snippet: { resourceId: { videoId: string } } }) => item.snippet.resourceId.videoId).join(',');
        const videoDetailsResponse = await axios.get(
          `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet&id=${videoIds}&key=${YOUTUBE_API_KEY}`
        );

        // Create a map of video details
        const videoDetailsMap = new Map<string, VideoDetails>(
          videoDetailsResponse.data.items.map((item: { id: string; contentDetails: { duration: string }; snippet: { thumbnails: { high?: { url: string }; default?: { url: string } } } }) => [
            item.id,
            {
              duration: formatDuration(item.contentDetails.duration),
              thumbnailUrl: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url
            }
          ])
        );

        // Map playlist items to our video format
        const videos: YouTubeVideo[] = playlistItemsResponse.data.items.map((item: { snippet: { resourceId: { videoId: string }; title: string; description: string; thumbnails: { high?: { url: string }; default?: { url: string } } } }) => {
          const videoId = item.snippet.resourceId.videoId;
          const defaultDetails: VideoDetails = { duration: '0:00', thumbnailUrl: '' };
          const videoDetails = videoDetailsMap.get(videoId) || defaultDetails;
          
          return {
            id: videoId,
            title: item.snippet.title,
            description: item.snippet.description,
            thumbnailUrl: videoDetails.thumbnailUrl || item.snippet.thumbnails.high?.url || '',
            duration: videoDetails.duration
          };
        });

        return {
          id: playlist.id,
          title: playlist.snippet.title,
          videos,
        };
      })
    );

    return playlists;
  } catch (error) {
    console.error('Error fetching YouTube data:', error);
    throw error;
  }
}

export function getYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}`;
} 