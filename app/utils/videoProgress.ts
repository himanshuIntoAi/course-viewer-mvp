interface VideoProgress {
  videoId: string;
  progress: number; // 0 to 100
  completed: boolean;
  lastPosition: number; // in seconds
}

const STORAGE_KEY = 'video_progress';

// Get all video progress
export function getAllVideoProgress(): { [key: string]: VideoProgress } {
  if (typeof window === 'undefined') return {};
  
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : {};
}

// Get progress for a specific video
export function getVideoProgress(videoId: string): VideoProgress {
  const allProgress = getAllVideoProgress();
  return allProgress[videoId] || {
    videoId,
    progress: 0,
    completed: false,
    lastPosition: 0
  };
}

// Update progress for a video
export function updateVideoProgress(
  videoId: string,
  currentTime: number,
  duration: number
): VideoProgress {
  const progress = Math.round((currentTime / duration) * 100);
  const completed = progress >= 90; // Consider video completed if watched 90% or more
  
  const videoProgress: VideoProgress = {
    videoId,
    progress,
    completed,
    lastPosition: currentTime
  };

  const allProgress = getAllVideoProgress();
  allProgress[videoId] = videoProgress;
  
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allProgress));
  }

  return videoProgress;
}

// Reset progress for all videos
export function resetAllProgress(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
}

// Reset progress for a specific video
export function resetVideoProgress(videoId: string): void {
  const allProgress = getAllVideoProgress();
  delete allProgress[videoId];
  
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allProgress));
  }
} 