"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FiPlay, FiPause, FiMaximize, FiVolume2, FiVolumeX } from 'react-icons/fi';
import { BsSpeedometer2 } from 'react-icons/bs';
import { MdHighQuality } from 'react-icons/md';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import Hls from 'hls.js';
import './VideoPlayer.css';

interface CourseVideoPlayerProps {
  videoFileName?: string; // e.g., "L1" - kept for backward compatibility
  videoPath?: string; // e.g., "lesson3" - new prop for video path
  thumbnailUrl: string;
  onProgressUpdate?: (progress: number, completed: boolean) => void;
}

interface VideoApiResponse {
  name: string;
  url: string;
  content_type: string;
  size: number;
}

interface QualityLevel {
  height: number;
  bitrate: number;
  index: number;
  name: string;
}

const PLAYBACK_SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
const BUFFER_DURATION = 30;

const CourseVideoPlayer: React.FC<CourseVideoPlayerProps> = ({
  videoFileName,
  videoPath,
  thumbnailUrl,
  onProgressUpdate
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [showSpeedOptions, setShowSpeedOptions] = useState(false);
  const [showQualityOptions, setShowQualityOptions] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [hlsInstance, setHlsInstance] = useState<Hls | null>(null);
  const [qualityLevels, setQualityLevels] = useState<QualityLevel[]>([]);
  const [currentQuality, setCurrentQuality] = useState<number>(-1);
  const [isQualitySwitching, setIsQualitySwitching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playbackUrl, setPlaybackUrl] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const volumeControlRef = useRef<HTMLDivElement>(null);
  const speedControlRef = useRef<HTMLDivElement>(null);
  const qualityControlRef = useRef<HTMLDivElement>(null);
  const hideControlsTimeout = useRef<NodeJS.Timeout | null>(null);
  const previousVolume = useRef<number>(1);
  const hideQualityTimeout = useRef<NodeJS.Timeout | null>(null);
  const hideSpeedTimeout = useRef<NodeJS.Timeout | null>(null);
  const lastPlaybackTime = useRef<number>(0);
  const qualitySwitchStartTime = useRef<number>(0);

  // Fetch video URL from API
  const fetchVideoUrl = useCallback(async () => {
    if (!videoPath) {
      console.log('No video path provided');
      setError('No video path provided');
      setIsLoading(false);
      return;
    }

    try {
      // const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://ip-hm-course-view-api-mvp.vercel.app';
      const baseUrl = 'https://ip-hm-course-view-api-mvp.vercel.app';
      const apiUrl = `${baseUrl}/api/v1/course-learning/hls/${videoPath}/master.m3u8`;
      
      console.log('Fetching video URL from: API', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        mode: 'cors',
      });
      
      console.log('API response status:', response.status);
      console.log('API response headers:', response.headers);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', errorText);
        throw new Error(`Failed to fetch video URL: ${response.status} - ${errorText}`);
      }
      
      const data: VideoApiResponse = await response.json();
      console.log('Video API response:', data);
      
      if (!data.url) {
        throw new Error('No video URL returned from API');
      }
      
      setPlaybackUrl(data.url);
      setError(null);
    } catch (err) {
      console.error('Error fetching video URL:', err);
      setError(`Failed to load video: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setIsLoading(false);
    }


  }, [videoPath]);

  // Fetch video URL when videoPath changes
  useEffect(() => {
    console.log('Video path changed:', videoPath);
    console.log('Video filename:', videoFileName);
    
    if (videoPath) {
      setIsLoading(true);
      setError(null);
      fetchVideoUrl();
    } else if (videoFileName) {
      // Fallback to videoFileName if videoPath is not available
      console.log('Using videoFileName as fallback:', videoFileName);
      setIsLoading(true);
      setError(null);
      // Extract the path part from video_filename (e.g., "lesson3/master.m3u8" -> "lesson3")
      const pathPart = videoFileName.split('/')[0];
      console.log('Extracted path part:', pathPart);
      
      // Create a temporary videoPath for the API call
      const tempVideoPath = pathPart;
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://ip-hm-course-view-api-mvp.vercel.app';
      const apiUrl = `${baseUrl}/api/v1/course-learning/hls/${tempVideoPath}/master.m3u8`;
      console.log("VIDEO FILE API URL", apiUrl);
      console.log('Fallback API URL:', apiUrl);
      
      fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        mode: 'cors',
      })
      .then(response => {
        console.log('Fallback API response status:', response.status);
        if (!response.ok) {
          throw new Error(`Fallback API failed: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Fallback API response:', data);
        if (data.url) {
          setPlaybackUrl(data.url);
          setError(null);
        } else {
          throw new Error('No video URL in fallback response');
        }
      })
      .catch(err => {
        console.error('Fallback API error:', err);
        setError(`Failed to load video: ${err.message}`);
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
      setError('No video path provided');
    }
  }, [videoPath, videoFileName, fetchVideoUrl]);

  // Initialize HLS when playback URL is available
  useEffect(() => {
    if (!playbackUrl || !videoRef.current) return;

    setIsLoading(true);
    setError(null);
    
    // Clean up existing HLS instance
    if (hlsInstance) {
      hlsInstance.destroy();
      setHlsInstance(null);
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        debug: false,
        enableWorker: true,
        startLevel: -1,
        autoStartLoad: true,
        maxBufferSize: 0,
        maxBufferLength: BUFFER_DURATION,
        maxMaxBufferLength: BUFFER_DURATION * 2,
        backBufferLength: 90,
        preferManagedMediaSource: true,
        progressive: true,
        abrEwmaDefaultEstimate: 500000,
        abrBandWidthFactor: 0.95,
        abrBandWidthUpFactor: 0.7,
        abrMaxWithRealBitrate: true,
        startFragPrefetch: true,
        testBandwidth: true
      });
      
      hls.attachMedia(videoRef.current);
      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        console.log('HLS media attached, loading source:', playbackUrl);
        hls.loadSource(playbackUrl);
      });
      hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        console.log('HLS manifest parsed, levels:', data.levels);
        setIsLoading(false);
        const levels = data.levels.map((level: { height: number; bitrate: number }, index: number) => ({
          height: level.height,
          bitrate: level.bitrate,
          index: index,
          name: `${level.height}p`
        }));
        setQualityLevels(levels);
        setCurrentQuality(hls.currentLevel);
      });
      hls.on(Hls.Events.LEVEL_LOADING, () => {
        if (videoRef.current) {
          lastPlaybackTime.current = videoRef.current.currentTime;
        }
      });
      hls.on(Hls.Events.LEVEL_SWITCHING, () => {
        setIsQualitySwitching(true);
        qualitySwitchStartTime.current = Date.now();
      });
      hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
        setCurrentQuality(data.level);
        if (videoRef.current) {
          videoRef.current.currentTime = lastPlaybackTime.current;
          if (!videoRef.current.paused) {
            videoRef.current.play().catch(console.error);
          }
        }
        setIsQualitySwitching(false);
      });
      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('HLS error:', data);
        setIsLoading(false);
        setError('HLS.js error: ' + data.details);
      });
      
      // Set the HLS instance immediately
      setHlsInstance(hls);
    } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      videoRef.current.src = playbackUrl;
      videoRef.current.addEventListener('loadedmetadata', () => {
        setIsLoading(false);
        setDuration(videoRef.current?.duration || 0);
      });
      videoRef.current.addEventListener('error', () => {
        setIsLoading(false);
        setError('Native HLS error');
      });
    } else {
      setIsLoading(false);
      setError('HLS is not supported in this browser.');
    }

    // Cleanup function
    return () => {
      if (hlsInstance) {
        hlsInstance.destroy();
        setHlsInstance(null);
      }
    };
  }, [playbackUrl]);

  // Handle play/pause
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {
          setError('Failed to play video.');
        });
      }
    }
  };

  // Handle volume change
  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      videoRef.current.muted = newVolume === 0;
      setIsMuted(newVolume === 0);
      if (newVolume > 0) {
        previousVolume.current = newVolume;
      }
    }
  };

  // Handle mute/unmute
  const toggleMute = () => {
    if (videoRef.current) {
      if (isMuted) {
        const newVolume = previousVolume.current || 1;
        videoRef.current.muted = false;
        videoRef.current.volume = newVolume;
        setVolume(newVolume);
        setIsMuted(false);
      } else {
        previousVolume.current = volume;
        videoRef.current.muted = true;
        setVolume(0);
        setIsMuted(true);
      }
    }
  };

  // Handle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  // Show/hide controls with debounce
  const handleMouseMove = () => {
    setShowControls(true);
    if (hideControlsTimeout.current) {
      clearTimeout(hideControlsTimeout.current);
    }
    if (isPlaying) {
      hideControlsTimeout.current = setTimeout(() => {
        setShowControls(false);
      }, 2000);
    }
  };

  // Format time for display
  const formatTime = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Handle speed change
  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    setShowSpeedOptions(false);
  };

  // Handle quality change
  const handleQualityChange = (levelIndex: number) => {
    if (hlsInstance && videoRef.current) {
      lastPlaybackTime.current = videoRef.current.currentTime;
      hlsInstance.currentLevel = levelIndex;
      hlsInstance.startLoad();
      setShowQualityOptions(false);
    }
  };

  const handleQualityMouseEnter = () => {
    if (hideQualityTimeout.current) {
      clearTimeout(hideQualityTimeout.current);
    }
    setShowQualityOptions(true);
  };

  const handleQualityMouseLeave = () => {
    hideQualityTimeout.current = setTimeout(() => {
      setShowQualityOptions(false);
    }, 500);
  };

  const handleSpeedMouseEnter = () => {
    if (hideSpeedTimeout.current) {
      clearTimeout(hideSpeedTimeout.current);
    }
    setShowSpeedOptions(true);
  };

  const handleSpeedMouseLeave = () => {
    hideSpeedTimeout.current = setTimeout(() => {
      setShowSpeedOptions(false);
    }, 500);
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full bg-black"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        if (isPlaying) {
          setShowControls(false);
        }
      }}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <AiOutlineLoading3Quarters className="w-12 h-12 text-[#02BABA] animate-spin" />
          <p className="text-white text-lg mt-4">Loading video...</p>
        </div>
      )}
      {error && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <div className="text-red-400 text-center">
            <p className="text-lg mb-2">Video Error</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}
      <video
        ref={videoRef}
        poster={thumbnailUrl}
        className="w-full h-full"
        onClick={togglePlay}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={() => {
          if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
            const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
            onProgressUpdate?.(progress, progress >= 100);
          }
        }}
        onLoadedMetadata={() => {
          if (videoRef.current) {
            setDuration(videoRef.current.duration);
          }
        }}
        playsInline
      />
      {!isPlaying && !isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={togglePlay}
            className="w-20 h-20 bg-white bg-opacity-80 rounded-full flex items-center justify-center shadow-lg border-2 border-white hover:bg-opacity-90 transition-all duration-200 group"
          >
            <FiPlay className="w-10 h-10 text-primary-600 group-hover:scale-110 transition-transform duration-200 ml-2" />
          </button>
        </div>
      )}
      {showControls && !isLoading && !error && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent">
          <div className="relative h-1 bg-gray-600 cursor-pointer hover:h-1.5 transition-all"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pos = (e.clientX - rect.left) / rect.width;
              if (videoRef.current) {
                videoRef.current.currentTime = pos * videoRef.current.duration;
              }
            }}
          >
            <div 
              className="absolute h-full bg-[#02BABA] transition-all duration-300"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
          </div>
          <div className="px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={togglePlay}
                className="text-white hover:text-primary-400 transition-colors p-1"
              >
                {isPlaying ? <FiPause className="w-5 h-5" /> : <FiPlay className="w-5 h-5" />}
              </button>
              <div 
                ref={volumeControlRef}
                className="relative flex items-center group"
                onMouseEnter={() => setShowVolumeSlider(true)}
                onMouseLeave={() => setShowVolumeSlider(false)}
              >
                <button
                  onClick={toggleMute}
                  className="text-white hover:text-primary-400 transition-colors p-1"
                >
                  {isMuted || volume === 0 ? <FiVolumeX className="w-5 h-5" /> : <FiVolume2 className="w-5 h-5" />}
                </button>
                <div className={`absolute left-8 bottom-1 bg-black/90 rounded-lg px-3 py-2 flex items-center gap-2 transition-opacity duration-200 ${
                  showVolumeSlider ? 'opacity-100 visible' : 'opacity-0 invisible'
                }`}>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                    className="w-20"
                  />
                  <span className="text-white text-sm min-w-[2.5rem]">
                    {Math.round((isMuted ? 0 : volume) * 100)}%
                  </span>
                </div>
              </div>
              <div className="text-white text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>
            <div className="flex items-center gap-4">
              {qualityLevels.length > 0 && (
                <div 
                  ref={qualityControlRef}
                  className="relative group"
                  onMouseEnter={handleQualityMouseEnter}
                  onMouseLeave={handleQualityMouseLeave}
                >
                  <button className="text-white hover:text-primary-400 transition-colors flex items-center gap-1 p-1">
                    <MdHighQuality className="w-5 h-5" />
                    <span className="text-sm">
                      {currentQuality === -1 ? 'Auto' : qualityLevels[currentQuality]?.name || 'Auto'}
                    </span>
                  </button>
                  {showQualityOptions && (
                    <div 
                      className="absolute bottom-full right-0 mb-2 bg-black/90 rounded-lg py-2 min-w-[100px]"
                      style={{ transform: 'translateY(-8px)' }}
                    >
                      <div className="absolute bottom-0 left-0 right-0 h-3 bg-transparent" style={{ transform: 'translateY(100%)' }} />
                      <button
                        onClick={() => handleQualityChange(-1)}
                        className={`w-full px-4 py-1.5 text-left text-sm hover:bg-white/10 ${
                          currentQuality === -1 ? 'text-primary-400' : 'text-white'
                        }`}
                      >
                        Auto
                      </button>
                      {qualityLevels.map((level) => (
                        <button
                          key={level.index}
                          onClick={() => handleQualityChange(level.index)}
                          className={`w-full px-4 py-1.5 text-left text-sm hover:bg-white/10 ${
                            level.index === currentQuality ? 'text-primary-400' : 'text-white'
                          }`}
                        >
                          {level.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <div 
                ref={speedControlRef}
                className="relative group"
                onMouseEnter={handleSpeedMouseEnter}
                onMouseLeave={handleSpeedMouseLeave}
              >
                <button className="text-white hover:text-primary-400 transition-colors flex items-center gap-1 p-1">
                  <BsSpeedometer2 className="w-5 h-5" />
                  <span className="text-sm">{playbackSpeed}x</span>
                </button>
                {showSpeedOptions && (
                  <div 
                    className="absolute bottom-full right-0 mb-2 bg-black/90 rounded-lg py-2 min-w-[100px]"
                    style={{ transform: 'translateY(-8px)' }}
                  >
                    <div className="absolute bottom-0 left-0 right-0 h-3 bg-transparent" style={{ transform: 'translateY(100%)' }} />
                    {PLAYBACK_SPEEDS.map((speed) => (
                      <button
                        key={speed}
                        onClick={() => handleSpeedChange(speed)}
                        className={`w-full px-4 py-1.5 text-left text-sm hover:bg-white/10 ${
                          speed === playbackSpeed ? 'text-primary-400' : 'text-white'
                        }`}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={toggleFullscreen}
                className="text-white hover:text-primary-400 transition-colors p-1"
              >
                <FiMaximize className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
      {isQualitySwitching && (
        <div className="absolute top-4 right-4 bg-black/80 text-white px-3 py-1.5 rounded-full text-sm">
          Switching quality...
        </div>
      )}
    </div>
  );
};

export default CourseVideoPlayer;