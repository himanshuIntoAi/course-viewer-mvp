import React, { useState, useEffect } from "react";
import { FiArrowLeft, FiFileText, FiLock, FiBookOpen, FiHelpCircle, FiZap, FiTarget, FiSearch, FiX } from "react-icons/fi";

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
}

// New interface for interactive components
interface InteractiveComponent {
  id: string;
  type: 'mindmap' | 'flashcards' | 'memorygame' | 'quiz';
  title: string;
  topic_id: number;
  data?: Record<string, unknown>;
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMore, setShowMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [cachedCourseData, setCachedCourseData] = useState<{
    courseId: string;
    topics: Topic[];
    lessons: Lesson[];
  } | null>(null);

  useEffect(() => {
    // Check if we have cached data for this course ID
    if (cachedCourseData && cachedCourseData.courseId === courseId) {
      console.log('Using cached course data for course:', courseId);
      setTopics(cachedCourseData.topics);
      setLessons(cachedCourseData.lessons);
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
                  const topicsResponse = await fetch(`https://ip-hm-course-view-api-mvp.vercel.app/api/v1/course-learning/courses/${courseId}/topics/`);
        const lessonsResponse = await fetch(`https://ip-hm-course-view-api-mvp.vercel.app/api/v1/course-learning/courses/${courseId}/lessons/`);
          
          if (topicsResponse.ok && lessonsResponse.ok) {
            const topicsData = await topicsResponse.json();
            const lessonsData = await lessonsResponse.json();
            
            console.log('Fetched topics:', topicsData);
            console.log('Fetched lessons:', lessonsData);
            
            setTopics(topicsData);
            setLessons(lessonsData);
            setError(null);
            
            // Cache the data for this course ID
            setCachedCourseData({
              courseId: courseId,
              topics: topicsData,
              lessons: lessonsData
            });
          } else {
            // Fallback to mock data if API is not available
            console.log('API not available, using mock data');
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
              },
              {
                id: 2,
                title: 'Basic Python Concepts',
                topic_order: 2,
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
              },
              {
                id: 2,
                title: 'Installing Python',
                content: 'Learn how to install Python on your system...',
                topic_id: 1,
                course_id: 641,
                is_completed: false,
                active: true,
                created_at: '2025-01-01T00:00:00Z',
                created_by: 1,
                updated_at: '2025-01-01T00:00:00Z'
              },
              {
                id: 3,
                title: 'Variables and Data Types',
                content: 'Understanding variables and different data types...',
                topic_id: 2,
                course_id: 641,
                is_completed: false,
                active: true,
                created_at: '2025-01-01T00:00:00Z',
                created_by: 1,
                updated_at: '2025-01-01T00:00:00Z'
              }
            ]);
            setError(null);
            
            // Cache the mock data for this course ID
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
                },
                {
                  id: 2,
                  title: 'Basic Python Concepts',
                  topic_order: 2,
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
                },
                {
                  id: 2,
                  title: 'Installing Python',
                  content: 'Learn how to install Python on your system...',
                  topic_id: 1,
                  course_id: 641,
                  is_completed: false,
                  active: true,
                  created_at: '2025-01-01T00:00:00Z',
                  created_by: 1,
                  updated_at: '2025-01-01T00:00:00Z'
                },
                {
                  id: 3,
                  title: 'Variables and Data Types',
                  content: 'Understanding variables and different data types...',
                  topic_id: 2,
                  course_id: 641,
                  is_completed: false,
                  active: true,
                  created_at: '2025-01-01T00:00:00Z',
                  created_by: 1,
                  updated_at: '2025-01-01T00:00:00Z'
                }
              ]
            });
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
            ]
          });
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

  // Get icon for component type
  const getComponentIcon = (type: string) => {
    switch (type) {
      case 'mindmap':
        return <FiZap size={18} />;
      case 'flashcards':
        return <FiBookOpen size={18} />;
      case 'memorygame':
        return <FiTarget size={18} />;
      case 'quiz':
        return <FiHelpCircle size={18} />;
      default:
        return <FiFileText size={18} />;
    }
  };

  // Filter lessons based on search query (searches both title and content)
  const filteredLessons = lessons.filter(lesson => 
    lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lesson.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get topics that have matching lessons or match the search query
  const filteredTopics = topics.filter(topic => {
    if (!searchQuery) return true;
    
    // Include topic if its title matches
    if (topic.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return true;
    }
    
    // Include topic if it has matching lessons
    const topicLessons = lessons.filter(lesson => lesson.topic_id === topic.id);
    return topicLessons.some(lesson => 
      lesson.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Clear search function
  const clearSearch = () => {
    setSearchQuery("");
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
  
  return (
    <>
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;  /* Internet Explorer 10+ */
          scrollbar-width: none;  /* Firefox */
        }
        .scrollbar-hide::-webkit-scrollbar { 
          display: none;  /* Safari and Chrome */
        }
      `}</style>
      <aside 
        className={`w-full h-full bg-[#faf9fb] border-r border-[#ececec] p-0 box-border flex ${isLearningSidebarFullScreen && 'z-[70]'} flex-col`}
      >
      <div className="flex items-center bg-[#ececec] py-[18px] pr-6 pl-[18px] text-lg font-semibold">
        <FiArrowLeft size={22} className="mr-3 cursor-pointer" onClick={() => setIsSidebarOpen(false)} />
        <span className="text-lg font-semibold">
          {topics.length > 0 ? topics[0].title : 'Course Learning'}
        </span>
      </div>
      
      {/* Search Bar */}
      <div className="px-4 py-3 bg-white border-b border-[#ececec]">
        <div className="relative">
          <FiSearch size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search lessons by name or content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm"
          />
          {searchQuery && (
            <FiX 
              size={18} 
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer hover:text-gray-600" 
              onClick={clearSearch}
            />
          )}
        </div>
      </div>
      
      {/* Filter Cards */}
      <div className="px-4 py-3 bg-white border-b border-[#ececec]">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setActiveFilter("all")}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeFilter === "all"
                ? "bg-violet-100 text-violet-700 border border-violet-200"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <FiFileText size={16} />
            All
          </button>
          <button
            onClick={() => setActiveFilter("lessons")}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeFilter === "lessons"
                ? "bg-violet-100 text-violet-700 border border-violet-200"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <FiFileText size={16} />
            Lessons
          </button>
          <button
            onClick={() => setActiveFilter("flashcards")}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeFilter === "flashcards"
                ? "bg-green-100 text-green-700 border border-green-200"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <FiBookOpen size={16} />
            Flashcards
          </button>
          <button
            onClick={() => setActiveFilter("mindmap")}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeFilter === "mindmap"
                ? "bg-blue-100 text-blue-700 border border-blue-200"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <FiZap size={16} />
            Mind Map
          </button>
          <button
            onClick={() => setActiveFilter("memorygame")}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeFilter === "memorygame"
                ? "bg-purple-100 text-purple-700 border border-purple-200"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <FiTarget size={16} />
            Memory Game
          </button>
          <button
            onClick={() => setActiveFilter("quiz")}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeFilter === "quiz"
                ? "bg-orange-100 text-orange-700 border border-orange-200"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <FiHelpCircle size={16} />
            Quiz
          </button>
        </div>
      </div>
      
      <div className="px-7 pt-8 flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
            <span className="ml-2 text-gray-600">Loading course content...</span>
          </div>
        ) : error ? (
          <div className="text-red-600 text-center py-8">
            {error}
          </div>
        ) : (
          <>
            {searchQuery ? (
              <>
                <h2 className="text-[28px] font-bold mb-2">
                  Search Results
                </h2>
                <div className="text-gray-500 text-[15px] mb-4">
                  {filteredLessons.length > 0 
                    ? `Found ${filteredLessons.length} lesson${filteredLessons.length !== 1 ? 's' : ''} matching "${searchQuery}"`
                    : `No lessons found matching "${searchQuery}"`
                  }
                </div>
                <hr className="border-t border-gray-200 mb-4" />
              </>
            ) : (
              <>
                <h2 className="text-[28px] font-bold mb-2">
                  {activeFilter === "all" 
                    ? (topics.length > 0 ? topics[0].title : 'Course Content')
                    : activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)
                  }
                </h2>
                <div className="text-gray-500 text-[15px] mb-4">
                  {activeFilter === "all" 
                    ? (topics.length > 0 ? `${topics.length} topics available` : 'Loading content...')
                    : `Showing ${activeFilter} content`
                  }
                </div>
                <hr className="border-t border-gray-200 mb-4" />
                {activeFilter === "all" && (
                  <p className="text-[#222] text-[15px] mb-4">
                    Welcome to the course! Start learning by selecting a lesson below.
                  </p>
                )}
              </>
            )}
            
            
            {/* Content based on filter */}
            {(() => {
              console.log('Rendering content for filter:', activeFilter);
              
              // If searching, show only matching lessons grouped by topic
              if (searchQuery) {
                if (filteredLessons.length === 0) {
                  return (
                    <div className="text-center py-8">
                      <div className="text-gray-400 mb-2">
                        <FiSearch size={48} className="mx-auto" />
                      </div>
                      <p className="text-gray-500">No lessons found matching your search.</p>
                      <p className="text-gray-400 text-sm mt-1">Try a different search term.</p>
                    </div>
                  );
                }
                
                // Group filtered lessons by topic
                const lessonsByTopic = filteredLessons.reduce((acc, lesson) => {
                  const topic = topics.find(t => t.id === lesson.topic_id);
                  if (topic) {
                    if (!acc[topic.id]) {
                      acc[topic.id] = { topic, lessons: [] };
                    }
                    acc[topic.id].lessons.push(lesson);
                  }
                  return acc;
                }, {} as Record<number, { topic: Topic; lessons: Lesson[] }>);
                
                return Object.values(lessonsByTopic).map(({ topic, lessons: topicLessons }) => (
                  <div key={topic.id}>
                    {/* Topic Header */}
                    <div className="flex items-center bg-[#f3f0fa] border border-[#e0d7fa] rounded-xl mb-4 px-4 py-4">
                      <div className="mr-4 text-[#6a5acd]"><FiFileText size={22} /></div>
                      <div className="flex flex-col">
                        <div className="text-[17px] font-semibold mb-0.5">{topic.title}</div>
                        <div className="text-[14px] text-gray-500">
                          Topic · {topic.topic_order} · {topicLessons.length} matching lesson{topicLessons.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                    
                    {/* Matching Lessons for this topic */}
                    {topicLessons.map((lesson) => (
                      <div 
                        key={lesson.id}
                        className={`flex items-center border rounded-xl mb-4 px-4 py-4 cursor-pointer transition-colors ${
                          lesson.is_completed 
                            ? 'bg-[#f3f0fa] border-[#e0d7fa] hover:bg-[#e8e4f7]' 
                            : 'bg-white border-[#ececec] opacity-70 hover:opacity-90'
                        }`}
                        onClick={() => onLessonSelect && onLessonSelect(lesson.id)}
                      >
                        <div className={`mr-4 ${lesson.is_completed ? 'text-[#6a5acd]' : 'text-gray-400'}`}>
                          {lesson.is_completed ? <FiFileText size={22} /> : <FiLock size={22} />}
                        </div>
                        <div className="flex flex-col">
                          <div className="text-[17px] font-semibold mb-0.5">{lesson.title}</div>
                          <div className="text-[14px] text-gray-500">
                            Lesson · {lesson.id}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ));
              }
              
              // Filter-based content display
              if (activeFilter === "lessons") {
                // Show only lessons
                return (
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-gray-700">All Lessons</h3>
                    {filteredLessons.map((lesson) => {
                      const topic = topics.find(t => t.id === lesson.topic_id);
                      return (
                        <div 
                          key={lesson.id}
                          className={`flex items-center border rounded-xl mb-4 px-4 py-4 cursor-pointer transition-colors ${
                            lesson.is_completed 
                              ? 'bg-[#f3f0fa] border-[#e0d7fa] hover:bg-[#e8e4f7]' 
                              : 'bg-white border-[#ececec] opacity-70 hover:opacity-90'
                          }`}
                          onClick={() => onLessonSelect && onLessonSelect(lesson.id)}
                        >
                          <div className={`mr-4 ${lesson.is_completed ? 'text-[#6a5acd]' : 'text-gray-400'}`}>
                            {lesson.is_completed ? <FiFileText size={22} /> : <FiLock size={22} />}
                          </div>
                          <div className="flex flex-col flex-1">
                            <div className="text-[17px] font-semibold mb-0.5">{lesson.title}</div>
                            <div className="text-[14px] text-gray-500">
                              {topic?.title} · Lesson {lesson.id}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              }
              
              if (activeFilter === "flashcards" || activeFilter === "mindmap" || activeFilter === "memorygame" || activeFilter === "quiz") {
                // Show only interactive components
                return (
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-gray-700">
                      {activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)} Components
                    </h3>
                    {filteredTopics.map((topic) => (
                      <div key={topic.id} className="mb-6">
                        <div className="flex items-center bg-[#f3f0fa] border border-[#e0d7fa] rounded-xl mb-4 px-4 py-4">
                          <div className="mr-4 text-[#6a5acd]"><FiFileText size={22} /></div>
                          <div className="flex flex-col">
                            <div className="text-[17px] font-semibold mb-0.5">{topic.title}</div>
                            <div className="text-[14px] text-gray-500">
                              Topic · {topic.topic_order}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          <div
                            className={`flex items-center border rounded-lg px-3 py-2 cursor-pointer transition-colors text-sm ${
                              activeFilter === 'mindmap' 
                                ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
                                : activeFilter === 'flashcards'
                                ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
                                : activeFilter === 'memorygame'
                                ? 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100'
                                : 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100'
                            }`}
                            onClick={() => onComponentSelect && onComponentSelect({
                              id: `${activeFilter}-${topic.id}`,
                              type: activeFilter as 'mindmap' | 'flashcards' | 'memorygame' | 'quiz',
                              title: `${topic.title} ${activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)}`,
                              topic_id: topic.id
                            })}
                          >
                            <div className="mr-2">
                              {getComponentIcon(activeFilter)}
                            </div>
                            <span className="font-medium truncate">{topic.title} {activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              }
              
              // Default view - show all topics and lessons
              return filteredTopics.map((topic) => (
              <div key={topic.id}>
                {/* Topic Header */}
                <div className="flex items-center bg-[#f3f0fa] border border-[#e0d7fa] rounded-xl mb-4 px-4 py-4">
                  <div className="mr-4 text-[#6a5acd]"><FiFileText size={22} /></div>
                  <div className="flex flex-col">
                    <div className="text-[17px] font-semibold mb-0.5">{topic.title}</div>
                    <div className="text-[14px] text-gray-500">
                      Topic · {topic.topic_order}
                    </div>
                  </div>
                </div>
                
                {/* Lessons for this topic */}
                {filteredLessons
                  .filter(lesson => lesson.topic_id === topic.id)
                  .slice(0, showMore ? undefined : 3)
                  .map((lesson) => (
                    <div 
                      key={lesson.id}
                      className={`flex items-center border rounded-xl mb-4 px-4 py-4 cursor-pointer transition-colors ${
                        lesson.is_completed 
                          ? 'bg-[#f3f0fa] border-[#e0d7fa] hover:bg-[#e8e4f7]' 
                          : 'bg-white border-[#ececec] opacity-70 hover:opacity-90'
                      }`}
                      onClick={() => onLessonSelect && onLessonSelect(lesson.id)}
                    >
                      <div className={`mr-4 ${lesson.is_completed ? 'text-[#6a5acd]' : 'text-gray-400'}`}>
                        {lesson.is_completed ? <FiFileText size={22} /> : <FiLock size={22} />}
                      </div>
                      <div className="flex flex-col">
                        <div className="text-[17px] font-semibold mb-0.5">{lesson.title}</div>
                        <div className="text-[14px] text-gray-500">
                          Lesson · {lesson.id}
                        </div>
                      </div>
                    </div>
                  ))}
                
                {/* Interactive Components for this topic */}
                {activeFilter === "all" && (
                <div className="mb-4">
                  <h4 className="text-[15px] font-semibold text-gray-700 mb-3">Interactive Learning</h4>
                  {(() => {
                    console.log('Rendering interactive components for topic:', topic.id, topic.title);
                    return null;
                  })()}
                  <div className="flex flex-col gap-2">
                    <div
                      className="flex items-center border rounded-lg px-3 py-2 cursor-pointer transition-colors text-sm bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                      onClick={() => {
                        console.log('Mindmap button clicked for topic:', topic.id, topic.title);
                        console.log('onComponentSelect function:', onComponentSelect);
                        if (onComponentSelect) {
                          onComponentSelect({
                            id: `mindmap-${topic.id}`,
                            type: 'mindmap',
                            title: `${topic.title} Mind Map`,
                            topic_id: topic.id
                          });
                        } else {
                          console.error('onComponentSelect is not defined!');
                        }
                      }}
                    >
                      <div className="mr-2">
                        {getComponentIcon('mindmap')}
                      </div>
                      <span className="font-medium truncate">{topic.title} Mind Map</span>
                    </div>
                    <div
                      className="flex items-center border rounded-lg px-3 py-2 cursor-pointer transition-colors text-sm bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                      onClick={() => onComponentSelect && onComponentSelect({
                        id: `flashcards-${topic.id}`,
                        type: 'flashcards',
                        title: `${topic.title} Flashcards`,
                        topic_id: topic.id
                      })}
                    >
                      <div className="mr-2">
                        {getComponentIcon('flashcards')}
                      </div>
                      <span className="font-medium truncate">{topic.title} Flashcards</span>
                    </div>
                    <div
                      className="flex items-center border rounded-lg px-3 py-2 cursor-pointer transition-colors text-sm bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
                      onClick={() => onComponentSelect && onComponentSelect({
                        id: `memorygame-${topic.id}`,
                        type: 'memorygame',
                        title: `${topic.title} Memory Game`,
                        topic_id: topic.id
                      })}
                    >
                      <div className="mr-2">
                        {getComponentIcon('memorygame')}
                      </div>
                      <span className="font-medium truncate">{topic.title} Memory Game</span>
                    </div>
                    <div
                      className="flex items-center border rounded-lg px-3 py-2 cursor-pointer transition-colors text-sm bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100"
                      onClick={() => onComponentSelect && onComponentSelect({
                        id: `quiz-${topic.id}`,
                        type: 'quiz',
                        title: `${topic.title} Quiz`,
                        topic_id: topic.id
                      })}
                    >
                      <div className="mr-2">
                        {getComponentIcon('quiz')}
                      </div>
                      <span className="font-medium truncate">{topic.title} Quiz</span>
                    </div>
                  </div>
                </div>
                )}
                
                {/* Show More button for topics with more than 3 lessons */}
                {filteredLessons.filter(lesson => lesson.topic_id === topic.id).length > 3 && (
                  <button 
                    className="w-full bg-transparent border-none text-gray-700 text-[16px] font-medium mb-4 cursor-pointer py-2 rounded-md hover:bg-[#f3f0fa] transition-colors flex items-center justify-center"
                    onClick={() => setShowMore(!showMore)}
                  >
                    {showMore ? 'Show Less' : 'Show More'} 
                    <span className="text-lg ml-1">{showMore ? '▲' : '▼'}</span>
                  </button>
                )}
              </div>
            ));
            })()}
          </>
        )}
      </div>
    </aside>
    </>
  );
}

export default CourseSyllabusSidebar;
