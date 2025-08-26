import React, { useState, useEffect } from "react";
import { FiArrowLeft, FiFileText, FiLock, FiBookOpen, FiHelpCircle, FiZap, FiTarget } from "react-icons/fi";

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
}

function CourseSyllabusSidebar({ isSidebarOpen, setIsSidebarOpen, onLessonSelect, onComponentSelect, courseId = "641" }: CourseSyllabusSidebarProps) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);
        
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
        }
      } catch (err) {
        console.error('Error fetching course data:', err);
        setError('Failed to load course data');
      } finally {
        setLoading(false);
      }
    };

    if (isSidebarOpen) {
      fetchCourseData();
    }
  }, [isSidebarOpen, courseId]);

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

  if (!isSidebarOpen) return null;
  
  return (
    <aside 
      className="w-full h-full bg-[#faf9fb] border-r border-[#ececec] p-0 box-border flex flex-col"
    >
      <div className="flex items-center bg-[#ececec] py-[18px] pr-6 pl-[18px] text-lg font-semibold">
        <FiArrowLeft size={22} className="mr-3 cursor-pointer" onClick={() => setIsSidebarOpen(false)} />
        <span className="text-lg font-semibold">Learn Java</span>
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
            <h2 className="text-[28px] font-bold mb-2">
              {topics.length > 0 ? topics[0].title : 'Course Content'}
            </h2>
            <div className="text-gray-500 text-[15px] mb-4">
              {topics.length > 0 ? `${topics.length} topics available` : 'Loading content...'}
            </div>
            <hr className="border-t border-gray-200 mb-4" />
            <p className="text-[#222] text-[15px] mb-4">
              Welcome to the course! Start learning by selecting a lesson below.
            </p>
            <div className="flex gap-2.5 mb-6">
              <span className="bg-[#f3f0fa] text-[#6a5acd] rounded-lg px-4 py-1.5 text-[14px] font-medium">Computer science</span>
              <span className="bg-[#f3f0fa] text-[#6a5acd] rounded-lg px-4 py-1.5 text-[14px] font-medium">Java</span>
              <span className="bg-[#f3f0fa] text-[#6a5acd] rounded-lg px-4 py-1.5 text-[14px] font-medium">Web development</span>
            </div>
            
            {/* Topics and Lessons */}
            {topics.map((topic) => (
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
                {lessons
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
                <div className="mb-4">
                  <h4 className="text-[15px] font-semibold text-gray-700 mb-3">Interactive Learning</h4>
                  <div className="flex flex-col gap-2">
                    <div
                      className="flex items-center border rounded-lg px-3 py-2 cursor-pointer transition-colors text-sm bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                      onClick={() => onComponentSelect && onComponentSelect({
                        id: `mindmap-${topic.id}`,
                        type: 'mindmap',
                        title: `${topic.title} Mind Map`,
                        topic_id: topic.id
                      })}
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
                
                {/* Show More button for topics with more than 3 lessons */}
                {lessons.filter(lesson => lesson.topic_id === topic.id).length > 3 && (
                  <button 
                    className="w-full bg-transparent border-none text-gray-700 text-[16px] font-medium mb-4 cursor-pointer py-2 rounded-md hover:bg-[#f3f0fa] transition-colors flex items-center justify-center"
                    onClick={() => setShowMore(!showMore)}
                  >
                    {showMore ? 'Show Less' : 'Show More'} 
                    <span className="text-lg ml-1">{showMore ? '▲' : '▼'}</span>
                  </button>
                )}
              </div>
            ))}
          </>
        )}
      </div>
    </aside>
  );
}

export default CourseSyllabusSidebar;
