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
  setActiveView?: (view: string) => void
  onTopicSelect?: (topic: Topic, counts: { lessons: number; quizzes: number; flashcards: number; mindmaps: number; memorygames?: number }) => void
}

function CourseSyllabusSidebar({ setIsSidebarOpen, onLessonSelect, onComponentSelect, courseId = "641", setActiveView, onTopicSelect }: CourseSyllabusSidebarProps) {
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
  const [selectedItem, setSelectedItem] = useState<{ kind: 'lesson' | 'quiz' | 'flashcards' | 'mindmap' | 'memorygame'; id: string } | null>(null);
  console.log("Current course id  in syllabus sidebar", courseId);
  const loadedFor = React.useRef<string | null>(null);
  useEffect(() => {
    // Prevent duplicate fetches for the same courseId
    if (!courseId || loadedFor.current === courseId) {
      return;
    }
    loadedFor.current = courseId;
    const fetchCourseData = async () => {
      try {
        const [topicsResponse, lessonsResponse, quizzesResponse, flashcardsResponse, mindmapsResponse, memoryGamesResponse] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/course-learning/courses/${courseId}/topics/`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/course-learning/courses/${courseId}/lessons/`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/course-learning/courses/${courseId}/quizzes/`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/course-learning/courses/${courseId}/flashcards/`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/course-learning/courses/${courseId}/mindmaps/`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/course-learning/courses/${courseId}/memory-games/`)
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
        }

      } catch (fetchError) {
        // Fallback to mock data if fetch fails
        console.log('Fetch failed, using mock data:', fetchError);

      } finally {
        setLoading(false);
      }
    };
    fetchCourseData();
  }, [courseId]);

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

    // TEMP HIDE MEMORY GAME FROM SIDEBAR
    // const topicMemoryGames = memoryGames.filter((mg: APIMemoryGame) => mg.topic_id === topic.id);
    // topicMemoryGames.forEach(mg => combined.push({ kind: 'memorygame', data: mg, label: mg.description || 'Memory Game' }));

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
      <aside
        className="w-full h-full bg-white p-0 box-border flex flex-col overflow-hidden"
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
            <Image src="/images/filter-icon.png" alt="Search" width={40} height={20} className="cursor-pointer" />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="px-4 py-3 bg-white border-b border-gray-200">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveFilter("all")}
              className={`flex items-center gap-2 px-3 py-2 rounded-[3px] text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${activeFilter === "all"
                ? "text-white bg-[linear-gradient(90deg,_#5A09FF_0%,_#CB4BFF_100.64%)] shadow"
                : "bg-[#EBE1FF] text-[#5A09FF] hover:bg-[#E3D8FF]"
                }`}
            >
              <Image src="/images/allIcon.svg" alt="Lesson" width={16} height={16} />
              All
            </button>
            <button
              onClick={() => setActiveFilter("lessons")}
              className={`flex items-center gap-2 px-3 py-2 rounded-[3px] text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${activeFilter === "lessons"
                ? "text-white bg-[linear-gradient(90deg,_#5A09FF_0%,_#CB4BFF_100.64%)] shadow"
                : "bg-[#EBE1FF] text-[#5A09FF] hover:bg-[#E3D8FF]"
                }`}
            >
              <Image src="/images/topicIcon1.svg" alt="Lesson" width={16} height={16} />
              Lessons
            </button>
            <button
              onClick={() => setActiveFilter("quiz")}
              className={`flex items-center gap-2 px-3 py-2 rounded-[3px] text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${activeFilter === "quiz"
                ? "text-white bg-[linear-gradient(90deg,_#5A09FF_0%,_#CB4BFF_100.64%)] shadow"
                : "bg-[#EBE1FF] text-[#5A09FF] hover:bg-[#E3D8FF]"
                }`}
            >
              <Image src="/images/topicIcon3.svg" alt="Lesson" width={16} height={16} />

              Quizzes
            </button>
            <button
              onClick={() => setActiveFilter("mindmap")}
              className={`flex items-center gap-2 px-3 py-2 rounded-[3px] text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${activeFilter === "mindmap"
                ? "text-white bg-[linear-gradient(90deg,_#5A09FF_0%,_#CB4BFF_100.64%)] shadow"
                : "bg-[#EBE1FF] text-[#5A09FF] hover:bg-[#E3D8FF]"
                }`}
            >
              <Image src="/images/topicIcon2.svg" alt="Lesson" width={16} height={16} />
              Mind Mapping
            </button>
            <button
              onClick={() => setActiveFilter("flashcards")}
              className={`flex items-center gap-2 px-3 py-2 rounded-[3px] text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${activeFilter === "flashcards"
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
                      onClick={() => {
                        const nextExpanded = isExpanded ? null : topic.id;
                        setExpandedTopic(nextExpanded);
                        if (!isExpanded && onTopicSelect) {
                          const counts = {
                            lessons: lessons.filter(lesson => lesson.topic_id === topic.id).length,
                            quizzes: quizzes.filter((q: APIQuiz) => q.topic_id === topic.id).length,
                            flashcards: flashcards.filter((f: APIFlashcard) => f.topic_id === topic.id).length,
                            mindmaps: mindmaps.filter((m: APIMindmap) => m.topic_id === topic.id).length,
                            memorygames: memoryGames.filter((mg: APIMemoryGame) => mg.topic_id === topic.id).length,
                          };
                          onTopicSelect(topic, counts);
                          setActiveView && setActiveView('topic');
                        }
                      }}
                    >
                      {/* Gradient bar header when expanded, light bar when collapsed */}
                      <div className={`w-full px-4 py-3 flex items-center justify-between z-[1000] rounded-md ${isExpanded ? 'bg-[linear-gradient(90deg,_#5A09FF_0%,_#CB4BFF_100.64%)] text-white' : 'bg-gray-50 hover:bg-gray-100 text-gray-800 rounded-t-lg'} transition-colors`}>
                        <div className="flex items-center space-x-3 flex-row">
                          <span className={`text-sm font-semibold ${isExpanded ? 'text-white' : 'text-gray-700'}`}>{topic.topic_order}.</span>
                          <div className="flex flex-row justify-between w-full" >
                            <h3 className={`text-sm font-semibold ${isExpanded ? 'text-white' : 'text-gray-900'}`}>{topic.title}</h3>

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
                                const isSelected = selectedItem?.kind === 'lesson' && selectedItem?.id === String(l.id);
                                return (
                                  <div
                                    key={`lesson_${l.id}`}
                                    className={`flex items-center rounded-lg justify-between px-6 py-3 cursor-pointer transition-colors bg-white hover:bg-gray-50`}
                                    onClick={() => {
                                      setSelectedItem({ kind: 'lesson', id: String(l.id) });
                                      setActiveView && setActiveView('lesson');
                                      onLessonSelect && onLessonSelect(l.id);
                                    }}
                                  >
                                    <div className="flex items-center space-x-2" onClick={() => setActiveView && setActiveView('lesson')}>
                                      {renderLeftIcon('lesson')}
                                      <span className={`text-sm font-medium w-10 text-right text-gray-600`}>{numberLabel}</span>
                                      <span className={`text-base font-medium ${isSelected ? 'bg-gradient-to-r from-[#5A09FF] to-[#CB4BFF] bg-clip-text text-transparent font-semibold' : 'text-gray-800'}`}>{l.title}</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                      <span className={`text-sm ${isSelected ? 'text-white/90' : 'text-gray-500'}`}>{l.duration || ''}</span>
                                      <span className={`text-lg ${isSelected ? 'text-white' : ''}`}>{l.is_completed ? '✅' : '⭕'}</span>
                                    </div>
                                  </div>
                                );
                              }

                              if (entry.kind === 'quiz') {
                                const q = entry.data as APIQuiz;
                                const isSelected = selectedItem?.kind === 'quiz' && selectedItem?.id === String(q.id);
                                return (
                                  <div
                                    key={`quiz_${q.id}`}
                                    className={`px-6 py-3 cursor-pointer rounded-lg transition-colors bg-white hover:bg-gray-50`}
                                    onClick={() => {
                                      setSelectedItem({ kind: 'quiz', id: String(q.id) });
                                      if (onComponentSelect) onComponentSelect({ id: String(q.id), type: 'quiz', title: 'Quiz', topic_id: q.topic_id });
                                    }}
                                  >
                                    <div className="flex items-center space-x-2">
                                      {renderLeftIcon('quiz')}
                                      <span className={`text-base font-medium ${isSelected ? 'bg-gradient-to-r from-[#5A09FF] to-[#CB4BFF] bg-clip-text text-transparent font-semibold' : 'text-gray-800'}`}>Quiz</span>
                                    </div>
                                  </div>
                                );
                              }

                              if (entry.kind === 'mindmap') {
                                const m = entry.data as APIMindmap;
                                const isSelected = selectedItem?.kind === 'mindmap' && selectedItem?.id === String(m.id);
                                return (
                                  <div
                                    key={`mindmap_${m.id}`}
                                    className={`px-6 py-3 cursor-pointer rounded-lg transition-colors bg-white hover:bg-gray-50`}
                                    onClick={() => {
                                      setSelectedItem({ kind: 'mindmap', id: String(m.id) });
                                      if (onComponentSelect) onComponentSelect({ id: String(m.id), type: 'mindmap', title: 'Mind Map', topic_id: m.topic_id });
                                    }}
                                  >
                                    <div className="flex items-center space-x-2">
                                      {renderLeftIcon('mindmap')}
                                      <span className={`text-base font-medium ${isSelected ? 'bg-gradient-to-r from-[#5A09FF] to-[#CB4BFF] bg-clip-text text-transparent font-semibold' : 'text-gray-800'}`}>Mind Map</span>
                                    </div>
                                  </div>
                                );
                              }

                              // TEMP HIDE MEMORY GAME FROM SIDEBAR
                              // if (entry.kind === 'memorygame') {
                              //   const mg = entry.data as APIMemoryGame;
                              //   const isSelected = selectedItem?.kind === 'memorygame' && selectedItem?.id === String(mg.id);
                              //   return (
                              //     <div
                              //       key={`memorygame_${mg.id}`}
                              //       className={`px-6 py-3 cursor-pointer rounded-lg transition-colors ${isSelected ? 'bg-gradient-to-r from-[#5A09FF] to-[#CB4BFF] text-white' : 'bg-white hover:bg-gray-50'}`}
                              //       onClick={() => {
                              //         setSelectedItem({ kind: 'memorygame', id: String(mg.id) });
                              //         if (onComponentSelect) onComponentSelect({ id: String(mg.id), type: 'memorygame', title: 'Memory Game', topic_id: mg.topic_id });
                              //       }}
                              //     >
                              //       <div className="flex items-center space-x-2">
                              //         {renderLeftIcon('memorygame')}
                              //         <span className={`text-base font-medium ${isSelected ? 'text-white' : 'text-gray-800'}`}>Memory Game</span>
                              //       </div>
                              //     </div>
                              //   );
                              // }

                              // flashcards grouped as single item per topic
                              if (entry.kind === 'flashcards') {
                                const fc = entry.data as APIFlashcard;
                                const isSelected = selectedItem?.kind === 'flashcards' && selectedItem?.id === `flashcards_topic_${fc.topic_id}`;
                                return (
                                  <div
                                    key={`flashcards_topic_${fc.topic_id}`}
                                    className={`px-6 py-3 cursor-pointer rounded-lg transition-colors bg-white hover:bg-gray-50`}
                                    onClick={() => {
                                      setSelectedItem({ kind: 'flashcards', id: `flashcards_topic_${fc.topic_id}` });
                                      if (onComponentSelect) onComponentSelect({ id: `flashcards_topic_${fc.topic_id}`, type: 'flashcards', title: 'Flashcards', topic_id: fc.topic_id });
                                    }}
                                  >
                                    <div className="flex items-center space-x-2">
                                      {renderLeftIcon('flashcards')}
                                      <span className={`text-base font-medium ${isSelected ? 'bg-gradient-to-r from-[#5A09FF] to-[#CB4BFF] bg-clip-text text-transparent font-semibold' : 'text-gray-800'}`}>Flashcards</span>
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
