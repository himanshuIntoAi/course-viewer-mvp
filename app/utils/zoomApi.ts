export interface ZoomVideo {
  id: string;
  title: string;
  duration: string;
  thumbnailUrl: string;
  playbackUrl: string;
  recordingDate: string;
  password?: string;
}

export interface ZoomPlaylist {
  id: string;
  title: string;
  videos: ZoomVideo[];
}

// Zoom API configuration
const ZOOM_ACCOUNT_ID = process.env.NEXT_PUBLIC_ZOOM_ACCOUNT_ID;
const ZOOM_CLIENT_ID = process.env.NEXT_PUBLIC_ZOOM_CLIENT_ID;
const ZOOM_CLIENT_SECRET = process.env.NEXT_PUBLIC_ZOOM_CLIENT_SECRET;
const ZOOM_API_BASE_URL = process.env.NEXT_PUBLIC_ZOOM_API_BASE_URL || 'https://api.zoom.us/v2';
const ZOOM_USER_ID = process.env.NEXT_PUBLIC_ZOOM_USER_ID || 'me';

// Get OAuth Access Token
async function getZoomAccessToken(): Promise<string> {
  try {
    const response = await fetch('/api/zoom/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(`Failed to get Zoom access token: ${response.status} ${response.statusText}${errorData ? ` - ${JSON.stringify(errorData)}` : ''}`);
    }

    const data = await response.json();
    if (!data.access_token) {
      throw new Error('No access token in Zoom response');
    }

    return data.access_token;
  } catch (error) {
    console.error('Error getting Zoom access token:', error);
    throw new Error(`Failed to authenticate with Zoom: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getZoomRecordings(): Promise<ZoomPlaylist[]> {
  try {
    const response = await fetch('/api/zoom/recordings');
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(`Failed to fetch Zoom recordings: ${response.status} ${response.statusText}${errorData ? ` - ${JSON.stringify(errorData)}` : ''}`);
    }

    const data = await response.json();
    
    // Group recordings by date (as playlists)
    const recordingsByMonth: { [key: string]: ZoomVideo[] } = {};
    
    data.meetings.forEach((meeting: any) => {
      meeting.recording_files.forEach((recording: any) => {
        if (recording.file_type === 'MP4') {  // Only include video recordings
          const date = new Date(meeting.start_time);
          const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
          
          if (!recordingsByMonth[monthKey]) {
            recordingsByMonth[monthKey] = [];
          }

          // Get the share URL and password
          const shareUrl = recording.share_url || recording.download_url;
          const password = recording.password || meeting.password;
          
          // Construct the playback URL with password if available
          let playbackUrl = shareUrl;
          if (password) {
            playbackUrl = `${shareUrl}?pwd=${encodeURIComponent(password)}`;
          }
          
          recordingsByMonth[monthKey].push({
            id: recording.id,
            title: meeting.topic,
            duration: formatDuration(recording.duration),
            thumbnailUrl: '/default-thumbnail.jpg', // Zoom doesn't provide thumbnails
            playbackUrl: playbackUrl,
            recordingDate: meeting.start_time,
            password: password
          });
        }
      });
    });

    // Convert grouped recordings to playlists
    const playlists: ZoomPlaylist[] = Object.entries(recordingsByMonth).map(([key, videos]) => ({
      id: key,
      title: new Date(key + '-01').toLocaleString('default', { month: 'long', year: 'numeric' }),
      videos: videos.sort((a, b) => new Date(b.recordingDate).getTime() - new Date(a.recordingDate).getTime()),
    }));

    return playlists.sort((a, b) => b.id.localeCompare(a.id)); // Sort by date descending

  } catch (error) {
    console.error('Error fetching Zoom recordings:', error);
    throw error;
  }
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}:${mins.toString().padStart(2, '0')}` : `${mins}:00`;
} 