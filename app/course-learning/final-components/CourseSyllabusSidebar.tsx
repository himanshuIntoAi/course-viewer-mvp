import React, { useState, useEffect } from "react";
import { FiArrowLeft, FiSearch, FiX, FiEye, FiStar, FiClock, FiChevronDown } from "react-icons/fi";
import Image from "next/image";
interface Topic {
  id: number;
  title: string;
  topic_order: number;
  course_id: number;
  image_path?: string;
  is_expanded: boolean;
  active: boolean;
  created_at: string;
  created_by: number;
  updated_at: string;
  updated_by?: number;
  credits?: number;
  progress?: number;
  total_items?: number;
  completed_items?: number;
}

interface Lesson {
  id: number;
  title: string;
  content: string;
  topic_id: number;
  course_id: number;
  video_source?: string;
  video_path?: string;
  video_filename?: string;
  image_path?: string;
  is_completed: boolean;
  active: boolean;
  created_at: string;
  created_by: number;
  updated_at: string;
  updated_by?: number;
  duration?: string;
  type?: 'lesson' | 'quiz' | 'mindmap' | 'flashcard';
}

// New interface for interactive components
interface InteractiveComponent {
  id: string;
  type: 'mindmap' | 'flashcards' | 'memorygame' | 'quiz';
  title: string;
  topic_id: number;
  data?: Record<string, unknown>;
}


interface APIQuiz {
  id: number;
  title: string;
  description: string;
  topic_id: number;
  course_id: number;
  time_limit_minutes: number;
  max_questions: number;
  passing_grade_percent: number;
  is_completed: boolean;
  active: boolean;
  created_at: string;
  created_by: number;
  updated_at: string;
  updated_by?: number | null;
}

interface APIFlashcard {
  id: number;
  front: string;
  back: string;
  topic_id: number;
  card_order: number;
}

interface APIMindmap {
  id: number;
  course_id: number;
  topic_id: number;
  mindmap_mermaid: string;
  mindmap_json: Record<string, unknown>;
  is_completed: boolean;
  active: boolean;
  created_at: string;
  created_by: number;
  updated_at: string;
  updated_by: number | null;
}

interface APIMemoryGame {
  id: number;
  description: string;
  topic_id: number;
}


interface CourseSyllabusSidebarProps {
  isSidebarOpen: boolean,
  setIsSidebarOpen: (isSidebarOpen: boolean) => void,
  onLessonSelect?: (lessonId: number) => void,
  onComponentSelect?: (component: InteractiveComponent) => void,
  courseId?: string
  isLearningSidebarFullScreen?: boolean
}

function CourseSyllabusSidebar({ isSidebarOpen, setIsSidebarOpen, onLessonSelect, onComponentSelect, courseId = "641", isLearningSidebarFullScreen }: CourseSyllabusSidebarProps) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [quizzes, setQuizzes] = useState<APIQuiz[]>([]);
  const [flashcards, setFlashcards] = useState<APIFlashcard[]>([]);
  const [mindmaps, setMindmaps] = useState<APIMindmap[]>([]);
  const [memoryGames, setMemoryGames] = useState<APIMemoryGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [expandedTopic, setExpandedTopic] = useState<number | null>(null);
  const [lessonDurations, setLessonDurations] = useState<Record<number, string>>({});
  const [cachedCourseData, setCachedCourseData] = useState<{
    courseId: string;
    topics: Topic[];
    lessons: Lesson[];
    quizzes: APIQuiz[];
    flashcards: APIFlashcard[];
    mindmaps: APIMindmap[];
    memoryGames: APIMemoryGame[];
  } | null>(null);

  useEffect(() => {
    // First, try sessionStorage cache to persist across remounts
    if (typeof window !== 'undefined') {
      const cacheKey = `courseData_${courseId}`;
      const cached = window.sessionStorage.getItem(cacheKey);
      if (isSidebarOpen && cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.courseId === courseId) {
            console.log('Using sessionStorage course data for course:', courseId);
            setTopics(parsed.topics || []);
            setLessons(parsed.lessons || []);
            setQuizzes(parsed.quizzes || []);
            setFlashcards(parsed.flashcards || []);
            setMindmaps(parsed.mindmaps || []);
            setMemoryGames(parsed.memoryGames || []);
            setLoading(false);
            setError(null);
            return;
          }
        } catch {
          // ignore parse errors
        }
      }
    }

    // Then, check in-memory cache for same mount
    if (cachedCourseData && cachedCourseData.courseId === courseId) {
      console.log('Using cached course data for course:', courseId);
      setTopics(cachedCourseData.topics);
      setLessons(cachedCourseData.lessons);
      setQuizzes(cachedCourseData.quizzes || []);
      setFlashcards(cachedCourseData.flashcards || []);
      setMindmaps(cachedCourseData.mindmaps || []);
      setMemoryGames(cachedCourseData.memoryGames || []);
      setLoading(false);
      setError(null);
      return;
    }

    const fetchCourseData = async () => {
      try {
        setLoading(true);
        console.log('Fetching fresh course data for course:', courseId);

        // Simple fetch calls
        try {
          const [topicsResponse, lessonsResponse, quizzesResponse, flashcardsResponse, mindmapsResponse, memoryGamesResponse] = await Promise.all([
            fetch(`https://course-viewer-mvp-backend.vercel.app/api/v1/course-learning/courses/${courseId}/topics/`),
            fetch(`https://course-viewer-mvp-backend.vercel.app/api/v1/course-learning/courses/${courseId}/lessons/`),
            fetch(`https://course-viewer-mvp-backend.vercel.app/api/v1/course-learning/courses/${courseId}/quizzes/`),
            fetch(`https://course-viewer-mvp-backend.vercel.app/api/v1/course-learning/courses/${courseId}/flashcards/`),
            fetch(`https://course-viewer-mvp-backend.vercel.app/api/v1/course-learning/courses/${courseId}/mindmaps/`),
            fetch(`https://course-viewer-mvp-backend.vercel.app/api/v1/course-learning/courses/${courseId}/memory-games/`)
          ]);

          if (topicsResponse.ok && lessonsResponse.ok) {
            const [topicsData, lessonsData] = await Promise.all([
              topicsResponse.json(),
              lessonsResponse.json()
            ]);

            const quizzesData = quizzesResponse.ok ? await quizzesResponse.json() : [];
            const flashcardsData = flashcardsResponse.ok ? await flashcardsResponse.json() : [];
            const mindmapsData = mindmapsResponse.ok ? await mindmapsResponse.json() : [];
            const memoryGamesData = memoryGamesResponse.ok ? await memoryGamesResponse.json() : [];

            console.log('Fetched topics:', topicsData);
            console.log('Fetched lessons:', lessonsData);
            console.log('Fetched quizzes:', quizzesData);
            console.log('Fetched flashcards:', flashcardsData);
            console.log('Fetched mindmaps:', mindmapsData);
            console.log('Fetched memory games:', memoryGamesData);

            setTopics(topicsData);
            setLessons(lessonsData);
            setQuizzes(Array.isArray(quizzesData) ? quizzesData : []);
            setFlashcards(Array.isArray(flashcardsData) ? flashcardsData : []);
            setMindmaps(Array.isArray(mindmapsData) ? mindmapsData : []);
            setMemoryGames(Array.isArray(memoryGamesData) ? memoryGamesData : []);
            setError(null);

            // Cache the data for this course ID
            setCachedCourseData({
              courseId: courseId,
              topics: topicsData,
              lessons: lessonsData,
              quizzes: Array.isArray(quizzesData) ? quizzesData : [],
              flashcards: Array.isArray(flashcardsData) ? flashcardsData : [],
              mindmaps: Array.isArray(mindmapsData) ? mindmapsData : [],
              memoryGames: Array.isArray(memoryGamesData) ? memoryGamesData : []
            });

            // Persist in sessionStorage for reuse across remounts
            if (typeof window !== 'undefined') {
              const cacheKey = `courseData_${courseId}`;
              window.sessionStorage.setItem(cacheKey, JSON.stringify({
                courseId,
                topics: topicsData,
                lessons: lessonsData,
                quizzes: Array.isArray(quizzesData) ? quizzesData : [],
                flashcards: Array.isArray(flashcardsData) ? flashcardsData : [],
                mindmaps: Array.isArray(mindmapsData) ? mindmapsData : [],
                memoryGames: Array.isArray(memoryGamesData) ? memoryGamesData : []
              }));
            }
          } else {
            console.log('Fetch failed');
            setError(null);

            // Cache the mock data for this course ID
          }
        } catch (fetchError) {
          // Fallback to mock data if fetch fails
          console.log('Fetch failed, using mock data:', fetchError);
          setTopics([
            {
              id: 1,
              title: 'Introduction to Python',
              topic_order: 1,
              course_id: 641,
              is_expanded: false,
              active: true,
              created_at: '2025-01-01T00:00:00Z',
              created_by: 1,
              updated_at: '2025-01-01T00:00:00Z'
            }
          ]);
          setLessons([
            {
              id: 1,
              title: 'What is Python?',
              content: 'Python is a high-level programming language...',
              topic_id: 1,
              course_id: 641,
              is_completed: false,
              active: true,
              created_at: '2025-01-01T00:00:00Z',
              created_by: 1,
              updated_at: '2025-01-01T00:00:00Z'
            }
          ]);
          setQuizzes([]);
          setFlashcards([]);
          setMindmaps([]);
          setMemoryGames([]);
          setError(null);

          // Cache the fallback mock data for this course ID
          setCachedCourseData({
            courseId: courseId,
            topics: [
              {
                id: 1,
                title: 'Introduction to Python',
                topic_order: 1,
                course_id: 641,
                is_expanded: false,
                active: true,
                created_at: '2025-01-01T00:00:00Z',
                created_by: 1,
                updated_at: '2025-01-01T00:00:00Z'
              }
            ],
            lessons: [
              {
                id: 1,
                title: 'What is Python?',
                content: 'Python is a high-level programming language...',
                topic_id: 1,
                course_id: 641,
                is_completed: false,
                active: true,
                created_at: '2025-01-01T00:00:00Z',
                created_by: 1,
                updated_at: '2025-01-01T00:00:00Z'
              }
            ],
            quizzes: [],
            flashcards: [],
            mindmaps: [],
            memoryGames: []
          });
          if (typeof window !== 'undefined') {
            const cacheKey = `courseData_${courseId}`;
            window.sessionStorage.setItem(cacheKey, JSON.stringify({
              courseId,
              topics: [
                {
                  id: 1,
                  title: 'Introduction to Python',
                  topic_order: 1,
                  course_id: 641,
                  is_expanded: false,
                  active: true,
                  created_at: '2025-01-01T00:00:00Z',
                  created_by: 1,
                  updated_at: '2025-01-01T00:00:00Z'
                }
              ],
              lessons: [
                {
                  id: 1,
                  title: 'What is Python?',
                  content: 'Python is a high-level programming language...',
                  topic_id: 1,
                  course_id: 641,
                  is_completed: false,
                  active: true,
                  created_at: '2025-01-01T00:00:00Z',
                  created_by: 1,
                  updated_at: '2025-01-01T00:00:00Z'
                }
              ],
              quizzes: [],
              flashcards: [],
              mindmaps: [],
              memoryGames: []
            }));
          }
        }
      } catch (err) {
        console.error('Error fetching course data:', err);
        setError('Failed to load course data');
      } finally {
        setLoading(false);
      }
    };

    // Only fetch data if sidebar is open and we don't have cached data
    if (isSidebarOpen && (!cachedCourseData || cachedCourseData.courseId !== courseId)) {
      fetchCourseData();
    }
  }, [courseId, isSidebarOpen, cachedCourseData]);

  // Resolve and cache lesson video durations (YouTube supported + use lesson.duration when present)
  useEffect(() => {
    const buildCacheKey = (cid: string) => `lessonDurations_${cid}`;
    const cached = typeof window !== 'undefined' ? window.sessionStorage.getItem(buildCacheKey(courseId)) : null;
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as Record<number, string>;
        setLessonDurations(parsed || {});
      } catch {}
    }

    const unresolvedLessons = lessons.filter(l => !lessonDurations[l.id]);
    if (unresolvedLessons.length === 0) return;

    const nextDurations: Record<number, string> = {};

    // 1) Use duration already present on lesson
    unresolvedLessons.forEach(l => {
      if (l.duration && String(l.duration).trim().length > 0) {
        nextDurations[l.id] = String(l.duration);
      }
    });

    // 2) Collect YouTube IDs and fetch durations in batch
    const YT_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
    const extractYouTubeId = (value?: string) => {
      if (!value) return null;
      // Handle raw id or full URL
      const idMatch = value.match(/[?&]v=([a-zA-Z0-9_-]{11})/) || value.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/) || value.match(/^([a-zA-Z0-9_-]{11})$/);
      return idMatch ? idMatch[1] : null;
    };

    const youtubeLessons = unresolvedLessons.filter(l =>
      (l.video_source || '').toLowerCase().includes('youtube') && (extractYouTubeId(l.video_path) || extractYouTubeId(l.video_filename))
    );

    const ids = Array.from(new Set(youtubeLessons.map(l => extractYouTubeId(l.video_path) || extractYouTubeId(l.video_filename)).filter(Boolean))) as string[];

    const fetchYouTubeDurations = async () => {
      if (!YT_API_KEY || ids.length === 0) return {} as Record<string, string>;
      try {
        const url = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${ids.join(',')}&key=${YT_API_KEY}`;
        const res = await fetch(url);
        if (!res.ok) return {} as Record<string, string>;
        const data = await res.json();
        const map: Record<string, string> = {};
        const format = (iso: string) => {
          const m = iso.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
          const h = (m?.[1] || '').replace('H','');
          const mi = (m?.[2] || '').replace('M','');
          const s = (m?.[3] || '').replace('S','');
          const parts: string[] = [];
          if (h) { parts.push(h); parts.push(mi.padStart(2,'0') || '00'); }
          else { parts.push(mi || '0'); }
          parts.push(s.padStart(2,'0') || '00');
          return parts.join(':');
        };
        (data.items || []).forEach((item: { id: string; contentDetails?: { duration?: string } }) => {
          const id = item.id;
          const iso = item.contentDetails?.duration || 'PT0M0S';
          map[id] = format(iso);
        });
        return map;
      } catch {
        return {} as Record<string, string>;
      }
    };

    (async () => {
      const ytMap = await fetchYouTubeDurations();
      youtubeLessons.forEach(l => {
        const vid = extractYouTubeId(l.video_path) || extractYouTubeId(l.video_filename);
        if (vid && ytMap[vid]) {
          nextDurations[l.id] = ytMap[vid];
        }
      });

      if (Object.keys(nextDurations).length > 0) {
        const merged = { ...lessonDurations, ...nextDurations };
        setLessonDurations(merged);
        if (typeof window !== 'undefined') {
          window.sessionStorage.setItem(buildCacheKey(courseId), JSON.stringify(merged));
        }
      }
    })();
  }, [lessons, courseId, lessonDurations]);


  // Clear search function
  const clearSearch = () => {
    setSearchQuery("");
  };

  // Build combined items for a topic and apply active filter + search
  const getFilteredCombinedForTopic = (topic: Topic) => {
    const combined: Array<{ kind: 'lesson' | 'quiz' | 'flashcards' | 'mindmap' | 'memorygame'; data: Lesson | APIQuiz | APIFlashcard | APIMindmap | APIMemoryGame; label: string }> = [];

    const topicLessons = lessons.filter(lesson => lesson.topic_id === topic.id);
    topicLessons.forEach(l => combined.push({ kind: 'lesson', data: l, label: l.title || '' }));

    const topicQuizzes = quizzes.filter((q: APIQuiz) => q.topic_id === topic.id);
    topicQuizzes.forEach(q => combined.push({ kind: 'quiz', data: q, label: q.title || 'Quiz' }));

    const topicMindmaps = mindmaps.filter((m: APIMindmap) => m.topic_id === topic.id);
    topicMindmaps.forEach(m => combined.push({ kind: 'mindmap', data: m, label: 'Mind Map' }));

    const topicMemoryGames = memoryGames.filter((mg: APIMemoryGame) => mg.topic_id === topic.id);
    topicMemoryGames.forEach(mg => combined.push({ kind: 'memorygame', data: mg, label: mg.description || 'Memory Game' }));

    const topicFlashcards = flashcards.filter((f: APIFlashcard) => f.topic_id === topic.id);
    if (topicFlashcards.length > 0) {
      combined.push({ kind: 'flashcards', data: topicFlashcards[0], label: 'Flashcards' });
    }

    // Normalize filter values (tabs use plural 'lessons')
    const filterMap: Record<string, 'lesson' | 'quiz' | 'mindmap' | 'flashcards' | 'memorygame'> = {
      lessons: 'lesson',
      quiz: 'quiz',
      mindmap: 'mindmap',
      flashcards: 'flashcards'
    } as const;

    const allowedKinds = activeFilter === 'all'
      ? new Set(['lesson', 'quiz', 'mindmap', 'memorygame', 'flashcards'])
      : new Set([(filterMap[activeFilter] ?? activeFilter) as 'lesson' | 'quiz' | 'mindmap' | 'memorygame' | 'flashcards']);

    const filterBySearch = (label: string) => {
      if (!searchQuery) return true;
      return label.toLowerCase().includes(searchQuery.toLowerCase());
    };

    return combined.filter(item => allowedKinds.has(item.kind) && filterBySearch(item.label));
  };

  if (!isSidebarOpen) {
    console.log('CourseSyllabusSidebar: Sidebar is closed, not rendering');
    return null;
  }

  console.log('CourseSyllabusSidebar: Sidebar is open, rendering with props:', {
    isSidebarOpen,
    onComponentSelect: !!onComponentSelect,
    onLessonSelect: !!onLessonSelect,
    courseId,
    topicsCount: topics.length,
    lessonsCount: lessons.length
  });

  // Get progress color based on completion status

  // Left-side icon for expanded list items (same icons used in topic header)
  const renderLeftIcon = (kind: 'lesson' | 'quiz' | 'flashcards' | 'mindmap' | 'memorygame') => {
    switch (kind) {
      case 'lesson':
        return <Image src="/images/topicIcon1.svg" alt="Lesson" width={16} height={16} />;
      case 'quiz':
        return <Image src="/images/topicIcon3.svg" alt="Quiz" width={16} height={16} />;
      case 'flashcards':
        return <Image src="/images/topicIcon4.svg" alt="Flashcards" width={16} height={16} />;
      case 'mindmap':
        return <Image src="/images/topicIcon2.svg" alt="Mindmap" width={16} height={16} />;
      case 'memorygame':
        return <Image src="/file.svg" alt="Memory Game" width={16} height={16} />; // default icon
      default:
        return null;
    }
  };

  return (
    <>
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar { 
          display: none;
        }
      `}</style>
      <aside
        className={`w-full h-full bg-white p-0 box-border flex ${isLearningSidebarFullScreen && 'z-[70]'} flex-col`}
      >
        {/* Header with purple gradient */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <FiArrowLeft size={20} className="text-white mr-3 cursor-pointer" onClick={() => setIsSidebarOpen(false)} />
            <span className="text-white text-lg font-semibold">Syllabus</span>
          </div>
          <FiX size={20} className="text-white cursor-pointer" onClick={() => setIsSidebarOpen(false)} />
        </div>

        {/* Course Overview Section */}
        <div className="px-4 py-4 bg-white">
          <h1 className="text-2xl font-bold text-gray-900 mb-2"></h1>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>By </span>
              <span>Total Enrolled: 2500</span>
              <span className="flex items-center">
                <FiEye size={16} className="mr-1" />
                Learning Live: 50
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Total Time Spend: 1hr 12 mins</span>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-semibold">
                  54%
                </div>
                <FiChevronDown size={16} className="ml-1 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="border border-gray-200 rounded-lg" >
            <div className="flex space-x-4 mb-4  border-b border-gray-200 justify-between">
              <div className="bg-white px-4 py-3 flex items-center">
                <FiStar size={20} className="text-yellow-500 mr-2" />
                <span className="text-sm font-medium">Total Credits: 12</span>
              </div>
              <div className="bg-white border-l border-gray-200 px-4 py-3 flex items-center ml-auto">
                <FiClock size={20} className="text-blue-500 mr-2" />
                <span className="text-sm font-medium">Course Duration: 6 Weeks</span>
              </div>
            </div>

            {/* Content Summary */}
            <div className="text-sm text-gray-600 mb-4 pl-4">
              Total Lessons: 18 | 20 Quizzes | 5 Flashcards | 10 Mind Maps
            </div>
          </div>

        </div>

        {/* Search Bar */}
        <div className="px-4 py-3 bg-white border-b border-gray-200">
          <div className="relative flex items-center justify-between ">
            <div className="border border-gray-300 rounded-lg w-full flex items-center justify-between pr-2" >
              <input
                type="text"
                placeholder="Search courses, lesson, topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-2 pr-10 py-2  focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              />
              <FiSearch size={18} className="" />
            </div>
            {searchQuery && (
              <FiX
                size={18}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer hover:text-gray-600"
                onClick={clearSearch}
              />
            )}
            <Image src="/images/filter-icon.png" alt="Search" width={40} height={20} className="" />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="px-4 py-3 bg-white border-b border-gray-200">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveFilter("all")}
              className={`flex items-center gap-2 px-3 py-2 rounded-[3px] text-sm font-medium whitespace-nowrap transition-colors ${activeFilter === "all"
                  ? "text-white bg-[linear-gradient(90deg,_#5A09FF_0%,_#CB4BFF_100.64%)] shadow"
                  : "bg-[#EBE1FF] text-[#5A09FF] hover:bg-[#E3D8FF]"
                }`}
            >
              <Image src="/images/allIcon.svg" alt="Lesson" width={16} height={16} />
              All
            </button>
            <button
              onClick={() => setActiveFilter("lessons")}
              className={`flex items-center gap-2 px-3 py-2 rounded-[3px] text-sm font-medium whitespace-nowrap transition-colors ${activeFilter === "lessons"
                  ? "text-white bg-[linear-gradient(90deg,_#5A09FF_0%,_#CB4BFF_100.64%)] shadow"
                  : "bg-[#EBE1FF] text-[#5A09FF] hover:bg-[#E3D8FF]"
                }`}
            >
              <Image src="/images/topicIcon1.svg" alt="Lesson" width={16} height={16} />
              Lessons
            </button>
            <button
              onClick={() => setActiveFilter("quiz")}
              className={`flex items-center gap-2 px-3 py-2 rounded-[3px] text-sm font-medium whitespace-nowrap transition-colors ${activeFilter === "quiz"
                  ? "text-white bg-[linear-gradient(90deg,_#5A09FF_0%,_#CB4BFF_100.64%)] shadow"
                  : "bg-[#EBE1FF] text-[#5A09FF] hover:bg-[#E3D8FF]"
                }`}
            >
              <Image src="/images/topicIcon3.svg" alt="Lesson" width={16} height={16} />
             
              Quizzes
            </button>
            <button
              onClick={() => setActiveFilter("mindmap")}
              className={`flex items-center gap-2 px-3 py-2 rounded-[3px] text-sm font-medium whitespace-nowrap transition-colors ${activeFilter === "mindmap"
                  ? "text-white bg-[linear-gradient(90deg,_#5A09FF_0%,_#CB4BFF_100.64%)] shadow"
                  : "bg-[#EBE1FF] text-[#5A09FF] hover:bg-[#E3D8FF]"
                }`}
            >
              <Image src="/images/topicIcon2.svg" alt="Lesson" width={16} height={16} />
              Mind Mapping
            </button>
            <button
              onClick={() => setActiveFilter("flashcards")}
              className={`flex items-center gap-2 px-3 py-2 rounded-[3px] text-sm font-medium whitespace-nowrap transition-colors ${activeFilter === "flashcards"
                  ? "text-white bg-[linear-gradient(90deg,_#5A09FF_0%,_#CB4BFF_100.64%)] shadow"
                  : "bg-[#EBE1FF] text-[#5A09FF] hover:bg-[#E3D8FF]"
                }`}
            >
              <Image src="/images/topicIcon4.svg" alt="Lesson" width={16} height={16} />
               
              Flash Cards
            </button>
          </div>
        </div>

        {/* Course Content List */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <span className="ml-2 text-gray-600">Loading course content...</span>
            </div>
          ) : error ? (
            <div className="text-red-600 text-center py-8">
              {error}
            </div>
          ) : (
            <div className="space-y-4">
              {topics.map((topic) => {
                const completed = topic.completed_items || 0;
                const total = topic.total_items || 0;
                const isExpanded = expandedTopic === topic.id;
                  const filteredCombined = getFilteredCombinedForTopic(topic);
                  if (filteredCombined.length === 0) {
                    return null; // hide topics with no matching items
                  }
                return (
                  <div key={topic.id} className={`${isExpanded ? '' : 'border border-gray-200 rounded-lg'} bg-white`}>
                    {/* Module Header */}
                    <div
                      className={`flex items-center justify-between p-0 cursor-pointer ${isExpanded ? 'w-[95%] mx-auto rounded-lg' : ''}`}
                      onClick={() => setExpandedTopic(isExpanded ? null : topic.id)}
                    >
                      {/* Gradient bar header when expanded, light bar when collapsed */}
                      <div className={`w-full px-4 py-3 flex items-center justify-between z-[1000] ${isExpanded ? 'bg-[linear-gradient(90deg,_#5A09FF_0%,_#CB4BFF_100.64%)] text-white' : 'bg-gray-50 text-gray-800 rounded-t-lg'}`}>
                        <div className="flex items-center space-x-3 flex-row">
                          <span className={`text-base font-semibold ${isExpanded ? 'text-white' : 'text-gray-700'}`}>{topic.topic_order}.</span>
                          <div className="flex flex-row justify-between w-full" >
                            <h3 className={`font-semibold ${isExpanded ? 'text-white' : 'text-gray-900'}`}>{topic.title}</h3>

                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className={`flex items-center space-x-4 text-xs mt-1 ${isExpanded ? 'text-white/90' : 'text-gray-500'}`}>
                            <Image src="/images/topicIcon1.svg" alt="Lesson" width={16} height={16} />
                            <span>{lessons.filter(lesson => lesson.topic_id === topic.id).length}</span>
                            <Image src="/images/topicIcon3.svg" alt="Quiz" width={16} height={16} />
                            <span>{quizzes.filter((q: APIQuiz) => q.topic_id === topic.id).length}</span>
                            <Image src="/images/topicIcon4.svg" alt="Flashcards" width={16} height={16} />
                            <span>{flashcards.filter((f: APIFlashcard) => f.topic_id === topic.id).length}</span>
                            <Image src="/images/topicIcon2.svg" alt="Mindmap" width={16} height={16} />
                            <span>{mindmaps.filter((m: APIMindmap) => m.topic_id === topic.id).length}</span>                          
                          </div>
                          <span className={`text-xs ${isExpanded ? 'text-white' : 'text-gray-600'}`}>{topic.credits} Credits</span>
                          <div className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${completed === 0 ? (isExpanded ? 'bg-white/20 text-white border-white/30' : 'bg-gray-100 text-gray-700 border-gray-200') :
                              completed === total ? (isExpanded ? 'bg-emerald-400/20 text-white border-white/30' : 'bg-green-100 text-green-700 border-green-200') :
                                (isExpanded ? 'bg-orange-400/30 text-white border-white/30' : 'bg-orange-100 text-orange-700 border-orange-200')
                            }`}>
                            {completed}/{total}
                          </div>
                          <FiChevronDown
                            size={16}
                            className={`${isExpanded ? 'text-white' : 'text-gray-400'} transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="border border-[#5A09FF] pt-[30px]  relative  top-[-30px] rounded-lg bg-white w-[100%] mx-auto">
                        <div className=" ">
                          {(() => {
                            return filteredCombined.map((entry, index) => {
                              const numberLabel = `${topic.topic_order}.${index + 1}`;
                              if (entry.kind === 'lesson') {
                                const l = entry.data as Lesson;
                                return (
                                  <div
                                    key={`lesson_${l.id}`}
                                    className={`flex items-center rounded-lg justify-between px-6 py-3 bg-white`}
                                    onClick={() => onLessonSelect && onLessonSelect(l.id)}
                                  >
                                    <div className="flex items-center space-x-2">
                                      {renderLeftIcon('lesson')}
                                      <span className="text-sm font-medium text-gray-600 w-10 text-right">{numberLabel}</span>
                                      <span className={`text-base text-gray-800 font-medium`}>{l.title}</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                      <span className={`text-sm text-gray-500`}>{lessonDurations[l.id] || l.duration || ''}</span>
                                      <span className="text-lg">{l.is_completed ? '✅' : '⭕'}</span>
                                    </div>
                                  </div>
                                );
                              }

                              if (entry.kind === 'quiz') {
                                const q = entry.data as APIQuiz;
                                return (
                                  <div
                                    key={`quiz_${q.id}`}
                                    className="flex items-center rounded-lg justify-between px-6 py-3 bg-white"
                                    onClick={() => onComponentSelect && onComponentSelect({ id: String(q.id), type: 'quiz', title: q.title || 'Quiz', topic_id: q.topic_id })}
                                  >
                                    <div className="flex items-center space-x-2">
                                      {renderLeftIcon('quiz')}
                                      <span className="text-sm font-medium text-gray-600 w-10 text-right">{numberLabel}</span>
                                      <span className="text-base text-gray-800 font-medium">{q.title || 'Quiz'}</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                      {/* <span className="text-lg">{getTypeIcon('quiz')}</span> */}
                                    </div>
                                  </div>
                                );
                              }

                              if (entry.kind === 'mindmap') {
                                const m = entry.data as APIMindmap;
                                return (
                                  <div
                                    key={`mindmap_${m.id}`}
                                    className="flex items-center rounded-lg justify-between px-6 py-3 bg-white"
                                    onClick={() => onComponentSelect && onComponentSelect({ id: String(m.id), type: 'mindmap', title: 'Mind Map', topic_id: m.topic_id })}
                                  >
                                    <div className="flex items-center space-x-2">
                                      {renderLeftIcon('mindmap')}
                                      <span className="text-sm font-medium text-gray-600 w-10 text-right">{numberLabel}</span>
                                      <span className="text-base text-gray-800 font-medium">Mind Map</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                      {/* <span className="text-lg">{getTypeIcon('mindmap')}</span> */}
                                    </div>
                                  </div>
                                );
                              }

                              if (entry.kind === 'memorygame') {
                                const mg = entry.data as APIMemoryGame;
                                return (
                                  <div
                                    key={`memorygame_${mg.id}`}
                                    className="flex items-center rounded-lg justify-between px-6 py-3 bg-white"
                                    onClick={() => onComponentSelect && onComponentSelect({ id: String(mg.id), type: 'memorygame', title: mg.description || 'Memory Game', topic_id: mg.topic_id })}
                                  >
                                    <div className="flex items-center space-x-2">
                                      {renderLeftIcon('memorygame')}
                                      <span className="text-sm font-medium text-gray-600 w-10 text-right">{numberLabel}</span>
                                      <span className="text-base text-gray-800 font-medium">{mg.description || 'Memory Game'}</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                      {/* <span className="text-lg">{getTypeIcon('memorygame')}</span> */}
                                    </div>
                                  </div>
                                );
                              }

                              // flashcards grouped as single item per topic
                              if (entry.kind === 'flashcards') {
                                const fc = entry.data as APIFlashcard;
                                return (
                                  <div
                                    key={`flashcards_topic_${fc.topic_id}`}
                                    className="flex items-center rounded-lg justify-between px-6 py-3 bg-white"
                                    onClick={() => onComponentSelect && onComponentSelect({ id: `flashcards_topic_${fc.topic_id}`, type: 'flashcards', title: 'Flashcards', topic_id: fc.topic_id })}
                                  >
                                    <div className="flex items-center space-x-2">
                                      {renderLeftIcon('flashcards')}
                                      <span className="text-sm font-medium text-gray-600 w-10 text-right">{numberLabel}</span>
                                      <span className="text-base text-gray-800 font-medium">Flashcards ({flashcards.filter(f => f.topic_id === fc.topic_id).length})</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                      {/* <span className="text-lg">{getTypeIcon('flashcard')}</span> */}
                                    </div>
                                  </div>
                                );
                              }

                              return null;
                            });
                          })()}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

export default CourseSyllabusSidebar;
