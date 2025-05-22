"use client";

import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { FiSearch, FiCheckCircle, FiChevronLeft, FiClock } from 'react-icons/fi';
import { YouTubePlaylist, YouTubeVideo } from '../utils/youtubeApi';
import { ZoomPlaylist, ZoomVideo } from '../utils/zoomApi';
import { getAllVideoProgress } from '../utils/videoProgress';
import { Playlist, Video } from './page';

interface Props {
  playlists: Playlist[];
  currentPlaylist: number;
  currentVideoIndex: number;
  onVideoSelect: (video: Video, playlistIndex: number, videoIndex: number) => void;
}

export interface SidebarRef {
  updateProgress: (videoId: string, progress: number, completed: boolean) => void;
}

const CircularProgress: React.FC<{ progress: number; isCompleted: boolean }> = ({ progress, isCompleted }) => {
  const radius = 12;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative w-8 h-8 flex items-center justify-center">
      <svg className="transform -rotate-90 w-8 h-8">
        {/* Background circle */}
        <circle
          cx="16"
          cy="16"
          r={radius}
          stroke="#E2E8F0"
          strokeWidth="3"
          fill="none"
        />
        {/* Progress circle */}
        {!isCompleted && progress > 0 && (
          <circle
            cx="16"
            cy="16"
            r={radius}
            stroke="#02BABA"
            strokeWidth="3"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        )}
        {/* Completed checkmark circle */}
        {isCompleted && (
          <circle
            cx="16"
            cy="16"
            r={radius}
            stroke="#02BABA"
            strokeWidth="3"
            fill="#02BABA"
          />
        )}
      </svg>
      {/* Checkmark for completed videos */}
      {isCompleted && (
        <FiCheckCircle className="absolute w-4 h-4 text-white" />
      )}
      {/* Progress percentage for in-progress videos */}
      {!isCompleted && progress > 0 && (
        <span className="absolute text-xs font-medium text-[#02BABA]">
          {Math.round(progress)}%
        </span>
      )}
    </div>
  );
};

const CourseLearningSidebar = forwardRef<SidebarRef, Props>(({ 
  playlists,
  currentPlaylist,
  currentVideoIndex,
  onVideoSelect
}, ref) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [videoProgress, setVideoProgress] = useState<{ [key: string]: { progress: number; completed: boolean } }>({});

  // Load video progress from local storage
  useEffect(() => {
    const progress = getAllVideoProgress();
    const formattedProgress = Object.entries(progress).reduce((acc, [videoId, data]) => {
      acc[videoId] = { progress: data.progress, completed: data.completed };
      return acc;
    }, {} as { [key: string]: { progress: number; completed: boolean } });
    setVideoProgress(formattedProgress);
  }, []);

  // Expose updateProgress method via ref
  useImperativeHandle(ref, () => ({
    updateProgress: (videoId: string, progress: number, completed: boolean) => {
      setVideoProgress(prev => ({
        ...prev,
        [videoId]: { progress, completed }
      }));
    }
  }));

  const filteredPlaylists = playlists.map(playlist => ({
    ...playlist,
    videos: playlist.videos.filter(video =>
      video.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(playlist => playlist.videos.length > 0);

  const isZoomVideo = (video: Video): video is ZoomVideo => {
    return 'playbackUrl' in video;
  };

  return (
    <aside className="w-full md:w-90 bg-white border-r border-gray-200 flex flex-col h-full p-6">
      <button className="flex items-center text-gray-500 mb-6 hover:text-primary-600">
        <FiChevronLeft className="mr-2" />
        <span className="text-sm font-medium">Back</span>
      </button>
      <h2 className="text-2xl font-bold text-[#16197C] mb-2 leading-tight">Complete Web<br />Designing Course</h2>
      <span className="text-sm text-black mb-4">Course Content</span>
      <div className='flex items-center w-full justify-between'>
        <div className="relative mb-4 w-full mr-2">
          <input
            type="text"
            placeholder="Search Videos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-2 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-200 text-sm"
          />
          <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-black" />
        </div>
        <img src='/images/list-filter.svg' className='text-black mt-[-14px] w-5 h-5' alt="Filter" />
      </div>
      <div className="flex gap-2 mb-4">
        <button className="bg-[#02BABA] text-white px-2 py-1 rounded-full text-xs font-medium">Quizzes</button>
        <button className="bg-[#02BABA] text-white px-2 py-1 rounded-full text-xs font-medium">Mind Mapping</button>
        <button className="bg-[#02BABA] text-white px-2 py-1 rounded-full text-xs font-medium">Flash Cards</button>
      </div>
      <div className="overflow-y-auto flex-1 pr-2">
        {filteredPlaylists.map((playlist, playlistIndex) => (
          <div key={playlist.id} className="mb-4">
            <div className="flex items-center mb-1 text-sm">
              <span className={`font-semibold text-[13px] mr-1 ${
                playlistIndex === currentPlaylist ? 'text-[#02BABA]' : 'text-black'
              }`}>
                {playlist.title}
              </span>
              <span className='text-[10px] text-[#02BABA] bg-[#F6F6F6] px-1 py-1 rounded-md'>
                {playlist.videos.filter(video => videoProgress[video.id]?.completed).length}/{playlist.videos.length}
              </span>
            </div>
            
            <ul className="ml-2 mt-1">
              {playlist.videos.map((video, videoIndex) => {
                const progress = videoProgress[video.id] || { progress: 0, completed: false };
                const isZoom = isZoomVideo(video);
                
                return (
                  <li
                    key={video.id}
                    className={`flex items-center justify-between px-2 py-1.5 rounded-lg mb-1 ${
                      playlistIndex === currentPlaylist && videoIndex === currentVideoIndex
                        ? 'bg-[#02BABA] text-white'
                        : 'hover:bg-[#02BABA24] text-gray-700'
                    } cursor-pointer transition-colors duration-200`}
                    onClick={() => onVideoSelect(video, playlistIndex, videoIndex)}
                  >
                    <div className="flex items-center flex-1 min-w-0 mr-2">
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="text-sm truncate pr-2">{video.title}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center">
                            <FiClock className={`w-3 h-3 ${
                              playlistIndex === currentPlaylist && videoIndex === currentVideoIndex
                                ? 'text-white'
                                : 'text-gray-400'
                            }`} />
                            <span className={`text-xs ml-1 ${
                              playlistIndex === currentPlaylist && videoIndex === currentVideoIndex
                                ? 'text-white'
                                : 'text-gray-400'
                            }`}>
                              {video.duration}
                            </span>
                          </div>
                          {isZoom && (
                            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded">Zoom</span>
                          )}
                        </div>
                      </div>
                      <CircularProgress 
                        progress={progress.progress} 
                        isCompleted={progress.completed}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
            <hr className='border-gray-200' />
          </div>
        ))}
      </div>
      <div className="mt-4">
        <button className="flex items-center gap-2 bg-primary-50 text-primary-700 px-4 py-2 rounded-lg shadow-sm hover:bg-primary-100 w-full">
          <span className="text-lg">🤖</span>
          <span className="text-sm font-medium">Hey, Ask me anything!</span>
        </button>
      </div>
    </aside>
  );
});

CourseLearningSidebar.displayName = 'CourseLearningSidebar';

export default CourseLearningSidebar; 