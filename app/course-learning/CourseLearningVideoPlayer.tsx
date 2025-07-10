"use client";

import React, { useState, useRef, useEffect } from 'react';
import { FiPlay, FiPause, FiMaximize, FiVolume2, FiVolumeX, FiX } from 'react-icons/fi';
import { BsSpeedometer2 } from 'react-icons/bs';
import { MdHighQuality } from 'react-icons/md';
import { HiOutlineTranslate } from 'react-icons/hi';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { SiJupyter } from 'react-icons/si';
import { getVideoProgress, updateVideoProgress } from '../utils/videoProgress';
import Hls from 'hls.js';
import './VideoPlayer.css';
import { VideoSource } from './page';

interface VideoPlayerProps {
  videoId: string;
  title: string;
  thumbnailUrl: string;
  playbackUrl?: string;
  source: VideoSource;
  onProgressUpdate?: (progress: number, completed: boolean) => void;
  videoType?: 'hls' | 'mp4';
}

interface QualityLevel {
  height: number;
  bitrate: number;
  index: number;
  name: string;
}

interface TranscriptionStatus {
  status: 'idle' | 'loading' | 'generating' | 'completed' | 'error';
  data?: {
    start: number;
    end: number;
    text: string;
  }[];
  error?: string;
  videoName?: string;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

const PLAYBACK_SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
const BUFFER_DURATION = 30; // Buffer 30 seconds ahead

const CourseLearningVideoPlayer: React.FC<VideoPlayerProps> = ({ 
  videoId, 
  title,
  thumbnailUrl,
  playbackUrl,
  source,
  onProgressUpdate,
  videoType = 'hls'
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
  const [player, setPlayer] = useState<any>(null);
  const [hlsInstance, setHlsInstance] = useState<Hls | null>(null);
  const [qualityLevels, setQualityLevels] = useState<QualityLevel[]>([]);
  const [currentQuality, setCurrentQuality] = useState<number>(-1);
  const [isQualitySwitching, setIsQualitySwitching] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const volumeControlRef = useRef<HTMLDivElement>(null);
  const speedControlRef = useRef<HTMLDivElement>(null);
  const qualityControlRef = useRef<HTMLDivElement>(null);
  const hideControlsTimeout = useRef<NodeJS.Timeout | null>(null);
  const progressCheckInterval = useRef<NodeJS.Timeout | null>(null);
  const previousVolume = useRef<number>(1);
  const hideQualityTimeout = useRef<NodeJS.Timeout | null>(null);
  const hideSpeedTimeout = useRef<NodeJS.Timeout | null>(null);
  const currentSegmentRef = useRef<number>(0);
  const lastPlaybackTime = useRef<number>(0);
  const qualitySwitchStartTime = useRef<number>(0);
  const [showTranscribe, setShowTranscribe] = useState(false);
  const [transcription, setTranscription] = useState<TranscriptionStatus>({
    status: 'idle',
    data: []
  });

  // Add new state for quality and language
  const [transcriptionQuality, setTranscriptionQuality] = useState('240p');
  const [transcriptionLanguage, setTranscriptionLanguage] = useState('en');

  // Add new state for Jupyter Notebook
  const [showJupyter, setShowJupyter] = useState(false);

  // Initialize video player based on source and type
  useEffect(() => {
    if (source === 'backend' && playbackUrl && videoRef.current) {
      // Cleanup previous HLS instance if it exists
      if (hlsInstance) {
        hlsInstance.destroy();
        setHlsInstance(null);
      }

      // Handle MP4 video
      if (videoType === 'mp4') {
        console.log('Setting up MP4 video:', playbackUrl);
        videoRef.current.src = playbackUrl;
        return;
      }

      // Handle HLS video
      if (videoType === 'hls' && Hls.isSupported()) {
        console.log('Setting up HLS video:', playbackUrl);
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
          console.log('HLS: Media attached');
          hls.loadSource(playbackUrl);
        });

        hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
          console.log('HLS: Manifest parsed', data);
          const levels = data.levels.map((level, index) => ({
            height: level.height,
            bitrate: level.bitrate,
            index: index,
            name: `${level.height}p`
          }));
          setQualityLevels(levels);
          setCurrentQuality(hls.currentLevel);

          // Start loading all quality levels
          levels.forEach((level) => {
            hls.loadLevel = level.index;
          });

          const savedProgress = getVideoProgress(videoId);
          if (savedProgress.lastPosition > 0 && videoRef.current) {
            videoRef.current.currentTime = savedProgress.lastPosition;
          }
        });

        hls.on(Hls.Events.LEVEL_LOADING, (event, data) => {
          console.log('HLS: Level loading', data);
          if (videoRef.current) {
            lastPlaybackTime.current = videoRef.current.currentTime;
          }
        });

        hls.on(Hls.Events.LEVEL_SWITCHING, (event, data) => {
          console.log('HLS: Level switching', data);
          setIsQualitySwitching(true);
          qualitySwitchStartTime.current = Date.now();
        });

        hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
          console.log('HLS: Level switched', data);
          setCurrentQuality(data.level);
          
          // Calculate switch time
          const switchTime = Date.now() - qualitySwitchStartTime.current;
          console.log(`Quality switch took ${switchTime}ms`);

          if (videoRef.current) {
            // Ensure we maintain the playback position
            videoRef.current.currentTime = lastPlaybackTime.current;
            
            // If the video was playing, ensure it continues
            if (!videoRef.current.paused) {
              videoRef.current.play().catch(console.error);
            }
          }
          
          setIsQualitySwitching(false);
        });

        hls.on(Hls.Events.FRAG_BUFFERED, (event, data) => {
          if (isQualitySwitching && videoRef.current) {
            const currentTime = videoRef.current.currentTime;
            const buffered = videoRef.current.buffered;
            
            for (let i = 0; i < buffered.length; i++) {
              if (currentTime >= buffered.start(i) && currentTime <= buffered.end(i)) {
                // If we have enough buffer, ensure playback continues
                if (buffered.end(i) - currentTime >= 2) {
                  if (!videoRef.current.paused) {
                    videoRef.current.play().catch(console.error);
                  }
                  break;
                }
              }
            }
          }
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          console.error('HLS Error:', data);
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.error('HLS: Fatal network error encountered, trying to recover');
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.error('HLS: Fatal media error encountered, trying to recover');
                hls.recoverMediaError();
                break;
              default:
                console.error('HLS: Fatal error, cannot recover');
                hls.destroy();
                break;
            }
          }
        });

        setHlsInstance(hls);
      } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
        // For Safari which has built-in HLS support
        videoRef.current.src = playbackUrl;
      }
    }

    return () => {
      if (hlsInstance) {
        hlsInstance.destroy();
        setHlsInstance(null);
      }
    };
  }, [source, playbackUrl, videoId, videoType]);

  // Load YouTube IFrame API when source is youtube
  useEffect(() => {
    if (source === 'youtube') {
      if (!window.YT) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

        window.onYouTubeIframeAPIReady = () => {
          initializeYouTubePlayer();
        };
      } else {
        initializeYouTubePlayer();
      }
    }

    return () => {
      if (progressCheckInterval.current) {
        clearInterval(progressCheckInterval.current);
      }
      if (player && source === 'youtube') {
        player.destroy();
      }
    };
  }, [videoId, source]);

  const initializeYouTubePlayer = () => {
    if (!playerRef.current) return;

    const savedProgress = getVideoProgress(videoId);

    const newPlayer = new window.YT.Player(playerRef.current, {
      videoId: videoId,
      height: '100%',
      width: '100%',
      playerVars: {
        controls: 1,
        showinfo: 1,
        rel: 0,
        modestbranding: 1,
        playsinline: 1,
        start: Math.floor(savedProgress.lastPosition),
        origin: window.location.origin
      },
      events: {
        onReady: (event: any) => {
          setPlayer(event.target);
          event.target.setVolume(volume * 100);
          setDuration(event.target.getDuration());
          
          progressCheckInterval.current = setInterval(() => {
            const currentTime = event.target.getCurrentTime();
            const duration = event.target.getDuration();
            setCurrentTime(currentTime);
            
            const progress = updateVideoProgress(videoId, currentTime, duration);
            onProgressUpdate?.(progress.progress, progress.completed);
          }, 1000);
        },
        onStateChange: (event: any) => {
          setIsPlaying(event.data === window.YT.PlayerState.PLAYING);
          
          if (event.data === window.YT.PlayerState.PLAYING) {
            setDuration(event.target.getDuration());
          }
        },
      },
    });
  };

  // Handle play/pause
  const togglePlay = () => {
    if (source === 'youtube' && player) {
      if (isPlaying) {
        player.pauseVideo();
      } else {
        player.playVideo();
      }
    } else if (source === 'backend' && videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(error => {
          console.error('Error playing video:', error);
        });
      }
    }
  };

  // Handle volume change
  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (source === 'youtube' && player) {
      player.setVolume(newVolume * 100);
      if (newVolume === 0) {
        setIsMuted(true);
        player.mute();
      } else {
        setIsMuted(false);
        player.unMute();
        previousVolume.current = newVolume;
      }
    } else if (source === 'backend' && videoRef.current) {
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
    if (source === 'youtube' && player) {
      if (isMuted) {
        const newVolume = previousVolume.current || 1;
        player.unMute();
        player.setVolume(newVolume * 100);
        setVolume(newVolume);
        setIsMuted(false);
      } else {
        previousVolume.current = volume;
        player.mute();
        setVolume(0);
        setIsMuted(true);
      }
    } else if (source === 'backend' && videoRef.current) {
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
    if (source === 'youtube' && player) {
      player.setPlaybackRate(speed);
    } else if (source === 'backend' && videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    setShowSpeedOptions(false);
  };

  // Handle quality change
  const handleQualityChange = (levelIndex: number) => {
    if (hlsInstance && videoRef.current) {
      console.log('Switching to quality level:', levelIndex);
      
      // Store the current playback position
      lastPlaybackTime.current = videoRef.current.currentTime;
      
      // Switch quality level
      hlsInstance.currentLevel = levelIndex;
      
      // Start loading fragments immediately
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

  const generateTranscription = async () => {
    try {
      setTranscription({ status: 'loading' });
      
      const response = await fetch(
        `http://127.0.0.1:8000/api/v1/courselearning/transcribe/${title}?quality=${transcriptionQuality}&language=${transcriptionLanguage}`, 
        {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({})
        }
      );

      console.log('Transcription API response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Transcription API error:', errorData);
        
        let errorMessage = 'Failed to generate transcription. ';
        if (response.status === 404) {
          errorMessage += 'Video not found.';
        } else if (response.status === 429) {
          errorMessage += 'Too many requests. Please try again later.';
        } else if (response.status >= 500) {
          errorMessage += 'Server error. Please try again later.';
        } else {
          errorMessage += errorData?.detail || 'Please try again later.';
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Transcription initiated successfully:', data);
      
      // Update transcription status based on API response
      if (data.status === 'success' && data.segments) {
        setTranscription({
          status: 'completed',
          data: data.segments,
          videoName: data.video_name
        });
      } else {
        setTranscription({
          status: 'generating',
          data: [
            { start: 0, end: 0, text: "✨ AI transcription process has started..." },
            { start: 0, end: 0, text: "⏳ This might take a few minutes as we process the entire video." },
            { start: 0, end: 0, text: "🎬 You can continue watching while we prepare the transcription." },
            { start: 0, end: 0, text: "📝 We'll notify you when it's ready!" }
          ]
        });
      }
    } catch (error) {
      console.error('Transcription error:', error);
      setTranscription({
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to generate transcription. Please try again later.'
      });
    }
  };

  const handleTranscribeClick = () => {
    setShowTranscribe(!showTranscribe);
    if (transcription.status === 'idle') {
      generateTranscription();
    }
  };

  const formatTimestamp = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const renderTranscriptionContent = () => {
    switch (transcription.status) {
      case 'loading':
        return (
          <div className="flex flex-col items-center justify-center h-full space-y-4">
            <AiOutlineLoading3Quarters className="w-8 h-8 text-[#02BABA] animate-spin" />
            <p className="text-sm text-center">Initiating transcription process...</p>
          </div>
        );

      case 'generating':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-6">
              <AiOutlineLoading3Quarters className="w-5 h-5 text-[#02BABA] animate-spin" />
              <span className="text-[#02BABA] font-medium">AI is generating transcription</span>
            </div>
            {transcription.data?.map((segment, index) => (
              <p key={index} className="text-sm text-gray-300">{segment.text}</p>
            ))}
          </div>
        );

      case 'completed':
        return (
          <div className="space-y-4">
            {transcription.videoName && (
              <div className="text-[#02BABA] font-medium mb-4">
                {transcription.videoName}
              </div>
            )}
            {transcription.data?.map((segment, index) => (
              <p key={index} className="text-sm group hover:bg-gray-800/50 p-2 rounded cursor-pointer"
                 onClick={() => {
                   if (videoRef.current) {
                     videoRef.current.currentTime = segment.start;
                     videoRef.current.play().catch(console.error);
                   }
                 }}>
                <span className="text-[#02BABA] font-mono text-xs">
                  [{formatTimestamp(segment.start)}]
                </span>
                <span className="ml-2">{segment.text}</span>
              </p>
            ))}
          </div>
        );

      case 'error':
        return (
          <div className="flex flex-col items-center justify-center h-full space-y-4 p-6">
            <div className="text-red-400 bg-red-400/10 p-4 rounded-lg">
              <p className="text-sm text-center">{transcription.error}</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={generateTranscription}
                className="px-4 py-2 bg-[#02BABA] text-white rounded-md text-sm hover:bg-opacity-90 flex items-center gap-2"
              >
                <span>Try Again</span>
              </button>
              <button
                onClick={() => setShowTranscribe(false)}
                className="px-4 py-2 text-gray-400 text-sm hover:text-white transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        );

      default:
        return (
          <div className="flex flex-col space-y-6 p-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-gray-300">Quality</label>
                <select
                  value={transcriptionQuality}
                  onChange={(e) => setTranscriptionQuality(e.target.value)}
                  className="w-full bg-gray-800 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#02BABA]"
                >
                  <option value="240p">240p</option>
                  <option value="360p">360p</option>
                  <option value="480p">480p</option>
                  <option value="720p">720p</option>
                  <option value="1080p">1080p</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-300">Language</label>
                <select
                  value={transcriptionLanguage}
                  onChange={(e) => setTranscriptionLanguage(e.target.value)}
                  className="w-full bg-gray-800 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#02BABA]"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="it">Italian</option>
                  <option value="pt">Portuguese</option>
                  <option value="nl">Dutch</option>
                  <option value="pl">Polish</option>
                  <option value="ru">Russian</option>
                  <option value="ja">Japanese</option>
                  <option value="ko">Korean</option>
                  <option value="zh">Chinese</option>
                </select>
              </div>
            </div>
            <button
              onClick={generateTranscription}
              className="w-full px-4 py-2 bg-[#02BABA] text-white rounded-md text-sm hover:bg-opacity-90 flex items-center justify-center gap-2"
            >
              <span>Generate Transcription</span>
            </button>
          </div>
        );
    }
  };

  const handleJupyterClick = () => {
    setShowJupyter(!showJupyter);
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
      {source === 'youtube' ? (
        // YouTube Player
        <div className="absolute inset-0 w-full h-full flex items-center justify-center">
          <div ref={playerRef} className="w-full h-full" style={{ aspectRatio: '16/9' }} />
        </div>
      ) : (
        // Custom Video Player for Backend Videos
        <>
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
                // Try to play the video if it's an MP4
                if (videoType === 'mp4') {
                  videoRef.current.play().catch(console.error);
                }
              }
            }}
            playsInline
          />

          {/* Large Play/Pause Button in Center (only shows when paused) */}
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                onClick={togglePlay}
                className="w-20 h-20 bg-white bg-opacity-80 rounded-full flex items-center justify-center shadow-lg border-2 border-white hover:bg-opacity-90 transition-all duration-200 group"
              >
                <FiPlay className="w-10 h-10 text-primary-600 group-hover:scale-110 transition-transform duration-200 ml-2" />
              </button>
            </div>
          )}

          {/* Controls Overlay */}
          {showControls && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent">
              {/* Progress Bar */}
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

              {/* Controls Bar */}
              <div className="px-4 py-2 flex items-center justify-between">
                {/* Left Controls Group */}
                <div className="flex items-center gap-4">
                  {/* Play/Pause */}
                  <button
                    onClick={togglePlay}
                    className="text-white hover:text-primary-400 transition-colors p-1"
                  >
                    {isPlaying ? <FiPause className="w-5 h-5" /> : <FiPlay className="w-5 h-5" />}
                  </button>

                  {/* Volume Control */}
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

                  {/* Time Display */}
                  <div className="text-white text-sm">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </div>
                </div>

                {/* Right Controls Group */}
                <div className="flex items-center gap-4">
                  {/* Quality Control */}
                  {videoType === 'hls' && qualityLevels.length > 0 && (
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

                  {/* Playback Speed */}
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

                  {/* Jupyter Notebook Button */}
                  <button
                    onClick={handleJupyterClick}
                    className={`jupyter-button ${showJupyter ? 'active' : ''}`}
                    title="Open Jupyter Notebook"
                  >
                    <SiJupyter className="w-5 h-5" />
                    <span className="text-sm">Jupyter</span>
                  </button>

                  {/* Transcribe Button */}
                  <button
                    onClick={handleTranscribeClick}
                    className={`transcribe-button ${showTranscribe ? 'active' : ''}`}
                  >
                    {transcription.status === 'loading' || transcription.status === 'generating' ? (
                      <AiOutlineLoading3Quarters className="w-5 h-5 animate-spin" />
                    ) : (
                      <HiOutlineTranslate className="w-5 h-5" />
                    )}
                    <span className="text-sm">Transcribe</span>
                  </button>

                  {/* Fullscreen */}
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

          {/* Add loading indicator during quality switch */}
          {isQualitySwitching && (
            <div className="absolute top-4 right-4 bg-black/80 text-white px-3 py-1.5 rounded-full text-sm">
              Switching quality...
            </div>
          )}
        </>
      )}

      {/* Transcribe Window */}
      <div className={`transcribe-window ${showTranscribe ? 'open' : ''}`}>
        <div className="transcribe-header">
          <h3 className="text-white text-lg font-medium">Transcription</h3>
          <button 
            className="transcribe-close"
            onClick={() => setShowTranscribe(false)}
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>
        <div className="transcribe-content">
          {renderTranscriptionContent()}
        </div>
      </div>

      {/* Jupyter Notebook Window */}
      <div className={`jupyter-window ${showJupyter ? 'open' : ''}`}>
        <div className="jupyter-header">
          <h3 className="text-white text-lg font-medium">Jupyter Notebook</h3>
          <button 
            className="jupyter-close"
            onClick={() => setShowJupyter(false)}
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>
        <div className="jupyter-content">
          <iframe
            src="http://48.217.184.72:8888/notebooks/intro.ipynb"
            className="w-full h-full border-none"
            title="Jupyter Notebook"
          />
        </div>
      </div>
    </div>
  );
};

export default CourseLearningVideoPlayer; 