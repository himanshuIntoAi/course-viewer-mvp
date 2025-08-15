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
    
    data.meetings.forEach((meeting: { start_time: string; topic: string; password?: string; recording_files: Array<{ id: string; file_type: string; duration: number; share_url?: string; download_url: string; password?: string }> }) => {
      meeting.recording_files.forEach((recording: { id: string; file_type: string; duration: number; share_url?: string; download_url: string; password?: string }) => {
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