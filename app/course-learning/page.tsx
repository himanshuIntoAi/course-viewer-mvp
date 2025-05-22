"use client";

import React, { useState, useCallback, useRef } from 'react';
import CourseLearningSidebar, { SidebarRef } from './CourseLearningSidebar';
import CourseLearningVideoPlayer from './CourseLearningVideoPlayer';
import { getChannelPlaylists, type YouTubePlaylist, type YouTubeVideo } from '../utils/youtubeApi';
import { checkYouTubeConfig } from '../utils/checkEnv';

// Your YouTube channel ID
const CHANNEL_ID = process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID;

export type VideoSource = 'youtube' | 'backend';
export type Video = YouTubeVideo | BackendVideo;
export type Playlist = YouTubePlaylist | BackendPlaylist;

interface BackendVideo {
  id: string;
  title: string;
  thumbnailUrl: string;
  videoUrl: string;
  type: 'hls' | 'mp4';
}

interface BackendPlaylist {
  id: string;
  title: string;
  videos: BackendVideo[];
}

interface ApiResponse {
  videos: {
    name: string;
    url: string;
    content_type: string;
    size: number;
  }[];
}

const formatVideoTitle = (filename: string): string => {
  // Remove file extensions and path
  let title = filename.split('/').pop() || '';
  title = title
    .replace(/\.mp4$/, '')
    .replace(/master\.m3u8$/, '')
    .replace(/L(\d+)/, 'Lesson $1') // Convert L1 to Lesson 1
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
  
  // If it's just a number, prefix with "Lesson"
  if (/^\d+$/.test(title)) {
    title = `Lesson ${title}`;
  }
  
  return title.trim() || 'Untitled';
};

const CourseLearningPage: React.FC = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [currentPlaylist, setCurrentPlaylist] = useState<number>(0);
  const [currentVideoIndex, setCurrentVideoIndex] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoSource, setVideoSource] = useState<VideoSource>('youtube');

  const sidebarRef = useRef<SidebarRef>(null);

  const fetchBackendData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/courselearning/', {
        headers: {
          'accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch data from backend');
      }

      const data: ApiResponse = await response.json();
      
      if (!data.videos || data.videos.length === 0) {
        throw new Error('No videos found in the backend');
      }

      // Transform the data into our playlist format
      const backendPlaylist: BackendPlaylist = {
        id: 'backend-playlist',
        title: 'Course Videos',
        videos: data.videos
          .filter(video => {
            // Filter for both master.m3u8 files and mp4 files
            return video.name.endsWith('master.m3u8') || video.name.endsWith('.mp4');
          })
          .map((video) => {
            const isHLS = video.name.endsWith('master.m3u8');
            
            // Get the folder name (usually contains lesson information)
            const pathParts = video.name.split('/');
            const folderName = pathParts.length > 1 ? pathParts[pathParts.length - 2] : '';
            
            // Use folder name if available, otherwise use file name
            const nameToFormat = folderName || pathParts[pathParts.length - 1];
            const title = formatVideoTitle(nameToFormat);

            return {
              id: video.name,
              title: title,
              thumbnailUrl: '', // No thumbnail provided in API
              videoUrl: video.url,
              type: isHLS ? 'hls' : 'mp4'
            };
          })
          // Sort videos by lesson number if possible
          .sort((a, b) => {
            const getNumber = (title: string) => {
              const match = title.match(/Lesson (\d+)/);
              return match ? parseInt(match[1]) : 0;
            };
            return getNumber(a.title) - getNumber(b.title);
          })
      };

      setPlaylists([backendPlaylist]);
      setVideoSource('backend');
      
      // Set initial video
      if (backendPlaylist.videos.length > 0) {
        setCurrentVideo(backendPlaylist.videos[0]);
        setCurrentPlaylist(0);
        setCurrentVideoIndex(0);
      }
    } catch (err) {
      console.error('Error in fetchBackendData:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch backend data');
    } finally {
      setLoading(false);
    }
  };

  const fetchYouTubeData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!checkYouTubeConfig()) {
        throw new Error('YouTube configuration is missing. Please check your environment variables.');
      }

      if (!CHANNEL_ID) {
        throw new Error('YouTube channel ID not configured');
      }
      
      const fetchedPlaylists = await getChannelPlaylists(CHANNEL_ID);
      
      if (!fetchedPlaylists || fetchedPlaylists.length === 0) {
        throw new Error('No playlists found in the channel');
      }

      setPlaylists(fetchedPlaylists);
      
      // Set initial video
      if (fetchedPlaylists.length > 0 && fetchedPlaylists[0].videos.length > 0) {
        setCurrentVideo(fetchedPlaylists[0].videos[0]);
        setCurrentPlaylist(0);
        setCurrentVideoIndex(0);
      }
    } catch (err) {
      console.error('Error in fetchYouTubeData:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch YouTube data');
    } finally {
      setLoading(false);
    }
  };

  const handleVideoSelect = useCallback((video: Video, playlistIndex: number, videoIndex: number) => {
    setCurrentVideo(video);
    setCurrentPlaylist(playlistIndex);
    setCurrentVideoIndex(videoIndex);
  }, []);

  const handleNavigation = (direction: 'next' | 'previous') => {
    if (!playlists.length) return;

    let newPlaylistIndex = currentPlaylist;
    let newVideoIndex = currentVideoIndex;

    if (direction === 'next') {
      if (currentVideoIndex < playlists[currentPlaylist].videos.length - 1) {
        newVideoIndex = currentVideoIndex + 1;
      } else if (currentPlaylist < playlists.length - 1) {
        newPlaylistIndex = currentPlaylist + 1;
        newVideoIndex = 0;
      }
    } else {
      if (currentVideoIndex > 0) {
        newVideoIndex = currentVideoIndex - 1;
      } else if (currentPlaylist > 0) {
        newPlaylistIndex = currentPlaylist - 1;
        newVideoIndex = playlists[newPlaylistIndex].videos.length - 1;
      }
    }

    if (newPlaylistIndex !== currentPlaylist || newVideoIndex !== currentVideoIndex) {
      const newVideo = playlists[newPlaylistIndex].videos[newVideoIndex];
      setCurrentVideo(newVideo);
      setCurrentPlaylist(newPlaylistIndex);
      setCurrentVideoIndex(newVideoIndex);
    }
  };

  const isBackendVideo = (video: Video): video is BackendVideo => {
    return 'videoUrl' in video;
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="hidden md:block w-80 h-full">
        <CourseLearningSidebar 
          ref={sidebarRef}
          playlists={playlists}
          currentPlaylist={currentPlaylist}
          currentVideoIndex={currentVideoIndex}
          onVideoSelect={handleVideoSelect}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <div className="h-24 flex items-center justify-between px-8 border-b bg-white flex-shrink-0">
          <div className="flex items-center gap-4">
            <img src="/images/cloudOu logo.png" alt="CloudOu Logo" />
            <div className="flex gap-4">
              <button
                onClick={fetchYouTubeData}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  videoSource === 'youtube'
                    ? 'bg-[#02BABA] text-white'
                    : 'border-2 border-[#02BABA] text-[#02BABA] hover:bg-[#02BABA] hover:text-white'
                }`}
              >
                Fetch from YouTube
              </button>
              <button
                onClick={fetchBackendData}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  videoSource === 'backend'
                    ? 'bg-[#02BABA] text-white'
                    : 'border-2 border-[#02BABA] text-[#02BABA] hover:bg-[#02BABA] hover:text-white'
                }`}
              >
                Fetch from Backend
              </button>
            </div>
          </div>
          <div className="flex items-center gap-8">
            <span className="text-gray-500 font-medium cursor-pointer">Memory Feed</span>
            <span className="text-gray-500 font-medium cursor-pointer">Community</span>
            <span className="text-gray-500 font-medium cursor-pointer">Courses</span>
            <div className="w-10 h-8 rounded-full flex items-center justify-center text-primary-700 cursor-pointer">
              <span className="text-lg mr-1"><img src="/images/user-icon.svg" alt="User Icon" /></span>
              <span className="text-lg"><img src="/images/down-arrow2.svg" alt="Down Arrow" /></span>
            </div>
          </div>
        </div>

        {/* Video Player Area */}
        <div className="flex-1 flex flex-col bg-white min-h-0">
          <div className="flex-1 flex flex-col min-h-0">
            {error ? (
              <div className="flex-1 flex items-center justify-center text-red-500 p-8 text-center">
                {error}
              </div>
            ) : currentVideo ? (
              <>
                <div className="flex-1 w-full h-full relative">
                  <CourseLearningVideoPlayer
                    videoId={currentVideo.id}
                    thumbnailUrl={currentVideo.thumbnailUrl}
                    playbackUrl={isBackendVideo(currentVideo) ? currentVideo.videoUrl : undefined}
                    source={videoSource}
                    videoType={isBackendVideo(currentVideo) ? currentVideo.type : undefined}
                    onProgressUpdate={(progress, completed) => {
                      sidebarRef.current?.updateProgress(currentVideo.id, progress, completed);
                    }}
                  />
                </div>
                {/* Video navigation */}
                <div className="flex justify-between items-center w-full px-8 py-4 border-t bg-white flex-shrink-0">
                  <button 
                    onClick={() => handleNavigation('previous')}
                    className="px-6 py-2 rounded-lg border-2 border-[#02BABA] text-[#02BABA] font-medium bg-white hover:bg-primary-50 transition-colors duration-200"
                    disabled={currentPlaylist === 0 && currentVideoIndex === 0}
                  >
                    Previous
                  </button>
                  <div>
                    <span className="text-gray-400 text-sm mr-2">
                      Currently Playing: {currentVideo.title}
                    </span>
                    <button 
                      onClick={() => handleNavigation('next')}
                      className="px-6 py-2 rounded-lg bg-[#02BABA] text-white font-medium hover:bg-opacity-90 transition-colors duration-200"
                      disabled={currentPlaylist === playlists.length - 1 && currentVideoIndex === playlists[currentPlaylist]?.videos.length - 1}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                Click one of the fetch buttons above to get started
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Chatbot Button */}
      <button className="fixed bottom-6 left-6 z-50 flex items-center gap-2 bg-primary-50 text-primary-700 px-4 py-2 rounded-lg shadow-lg hover:bg-primary-100">
        <span className="text-lg">🤖</span>
        <span className="text-sm font-medium hidden sm:block">Hey, Ask me anything!</span>
      </button>
    </div>
  );
};

export default CourseLearningPage;
