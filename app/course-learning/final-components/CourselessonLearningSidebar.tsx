import { FiChevronDown, FiCheckSquare, FiSquare } from "react-icons/fi";
import Image from "next/image";
import { useState, useEffect } from "react";

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
  code?: string;
  code_language?: string;
  code_output?: string;
  course_code?: string;
  course_code_language?: string;
}

interface CourseLessonLearningSidebarProps {
  selectedLessonId?: number;
  currentLesson?: Lesson | null;
  loading?: boolean;
  courseId?: string;
}

function CourseLessonLearningSidebar({ selectedLessonId, currentLesson: propCurrentLesson, loading: propLoading, courseId = "641" }: CourseLessonLearningSidebarProps) {
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);

  // Use prop data if available, otherwise use local state
  const displayLesson = propCurrentLesson || currentLesson;
  const displayLoading = propLoading !== undefined ? propLoading : loading;

  useEffect(() => {
    const fetchLessonData = async () => {
      if (!selectedLessonId) {
        // If no lesson is selected, try to get the first lesson
        try {
          setLoading(true);
          const lessonsResponse = await fetch(`https://ip-hm-course-view-api-mvp.vercel.app/api/v1/course-learning/courses/${courseId}/lessons/`);
          if (lessonsResponse.ok) {
            const lessons = await lessonsResponse.json();
            if (lessons.length > 0) {
              const lessonResponse = await fetch(`https://ip-hm-course-view-api-mvp.vercel.app/api/v1/course-learning/lessons/${lessons[0].id}`);
              if (lessonResponse.ok) {
                const lesson = await lessonResponse.json();
                setCurrentLesson(lesson);
              }
            }
          } else {
            // Fallback to mock data
            setCurrentLesson({
              id: 1,
              title: 'What is Python?',
              content: 'Python is a high-level, interpreted, and general-purpose programming language that is widely used for web development, data analysis, artificial intelligence, and more. This lesson covers the history of Python, its uses, and why it\'s a great choice for beginners.',
              topic_id: 1,
              course_id: 641,
              is_completed: false,
              active: true,
              created_at: '2025-01-01T00:00:00Z',
              created_by: 1,
              updated_at: '2025-01-01T00:00:00Z'
            });
          }
        } catch (err) {
          console.error('Error fetching first lesson:', err);
          // Fallback to mock data
          setCurrentLesson({
            id: 1,
            title: 'What is Python?',
            content: 'Python is a high-level, interpreted, and general-purpose programming language that is widely used for web development, data analysis, artificial intelligence, and more. This lesson covers the history of Python, its uses, and why it\'s a great choice for beginners.',
            topic_id: 1,
            course_id: 641,
            is_completed: false,
            active: true,
            created_at: '2025-01-01T00:00:00Z',
            created_by: 1,
            updated_at: '2025-01-01T00:00:00Z'
          });
        } finally {
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        // Use the specific lesson API endpoint
        const lessonResponse = await fetch(`https://ip-hm-course-view-api-mvp.vercel.app/api/v1/course-learning/lessons/${selectedLessonId}`);
        if (lessonResponse.ok) {
          const lesson = await lessonResponse.json();
          setCurrentLesson(lesson);
          setError(null);
        } else {
          // Fallback to mock data
          setCurrentLesson({
            id: selectedLessonId,
            title: `Lesson ${selectedLessonId}`,
            content: 'This is a sample lesson content. The API is not available right now, but you can see how the UI will look with real data.',
            topic_id: 1,
            course_id: 641,
            is_completed: false,
            active: true,
            created_at: '2025-01-01T00:00:00Z',
            created_by: 1,
            updated_at: '2025-01-01T00:00:00Z'
          });
        }
      } catch (err) {
        console.error('Error fetching lesson:', err);
        // Fallback to mock data
        setCurrentLesson({
          id: selectedLessonId,
          title: `Lesson ${selectedLessonId}`,
          content: 'This is a sample lesson content. The API is not available right now, but you can see how the UI will look with real data.',
          topic_id: 1,
          course_id: 641,
          is_completed: false,
          active: true,
          created_at: '2025-01-01T00:00:00Z',
          created_by: 1,
          updated_at: '2025-01-01T00:00:00Z'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchLessonData();
  }, [selectedLessonId, courseId]);

  if (loading) {
    return (
      <aside className="w-full max-w-[400px] min-h-screen bg-[#faf9fb] border-r border-[#ececec] flex flex-col">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
          <span className="ml-2 text-gray-600">Loading lesson...</span>
        </div>
      </aside>
    );
  }

  if (error) {
    return (
      <aside className="w-full max-w-[400px] min-h-screen bg-[#faf9fb] border-r border-[#ececec] flex flex-col">
        <div className="text-red-600 text-center py-8">
          {error}
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-full max-w-[400px] min-h-screen bg-[#faf9fb] border-r border-[#ececec] flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between bg-[#ececec] px-6 py-4 border-b border-[#e0e0e0]">
        <div className="flex items-center gap-2">
          <Image src="/images/learner-icon.svg" alt="Cloud OU Logo" width={20} height={40} />
          <span className="font-medium text-gray-800">Learn</span>
        </div>
        <button className="p-2 rounded hover:bg-gray-200">
          <Image src="/images/resize-icon.svg" alt="Cloud OU Logo" width={20} height={40} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col px-6 py-6 gap-6 overflow-y-auto">
        {displayLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
            <span className="ml-2 text-gray-600">Loading lesson...</span>
          </div>
        ) : displayLesson ? (
          <>
            {/* Lesson Label */}
            <div className="text-xs text-gray-500 tracking-widest font-semibold mb-1">
              {displayLesson.title.toUpperCase()}
            </div>
            
            {/* Title & Duration */}
            <div className="mb-2">
              <h2 className="text-xl font-bold mb-1">{displayLesson.title}</h2>
              <div className="text-sm text-gray-500 mb-2">
                Lesson {displayLesson.id}
              </div>
            </div>
            
            {/* Intro Text */}
            {displayLesson.content && (
              <div className="text-[15px] text-gray-800 leading-relaxed space-y-3 mb-2">
                {displayLesson.content.split('\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            )}

            {/* Code Available Indicator */}
            {(displayLesson.code || displayLesson.course_code) && (
              <div className="bg-[#e8f5e8] border border-[#4caf50] rounded-lg mb-2">
                <div className="flex items-center px-4 py-3">
                  <div className="mr-2 text-[#4caf50] text-lg">💻</div>
                  <div>
                    <div className="text-[15px] text-[#2e7d32] font-medium">
                      Code Example Available
                    </div>
                    <div className="text-[13px] text-[#4caf50]">
                      Language: {displayLesson.code_language || displayLesson.course_code_language || 'javascript'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Instructions Section */}
            <div className="bg-[#f5f5f5] border border-[#e0e0e0] rounded-lg mb-2">
              <div className="flex items-center px-4 py-3 border-b border-[#e0e0e0]">
                <FiCheckSquare className="mr-2 text-gray-700" />
                <span className="font-medium text-gray-800">Instructions</span>
              </div>
              <div className="px-4 py-3 flex items-start gap-3">
                <input 
                  type="checkbox" 
                  checked={true} 
                  readOnly 
                  className="accent-violet-600 w-5 h-5 mt-1" 
                />
                <div>
                  <div className="text-[15px] text-gray-900 font-medium mb-1">
                    1. Read through the lesson content carefully
                  </div>
                </div>
              </div>
            </div>

            {/* Hint Section */}
            <div className="bg-[#fff7cc] border border-[#ffe066] rounded-lg mb-2">
              <button 
                className="w-full flex items-center justify-between px-4 py-3 font-medium text-gray-800"
                onClick={() => setShowHint(!showHint)}
              >
                Stuck? Get a hint
                <FiChevronDown className={`ml-2 text-gray-600 transition-transform ${showHint ? 'rotate-180' : ''}`} />
              </button>
              {showHint && (
                <div className="px-4 py-3 border-t border-[#ffe066] text-[15px] text-gray-700">
                  Take your time to understand the concepts. If you need help, don&apos;t hesitate to ask questions!
                </div>
              )}
            </div>

            {/* Concept Review */}
            <div className="bg-[#f5f5f5] border border-[#e0e0e0] rounded-lg mb-2">
              <div className="flex items-center px-4 py-3 border-b border-[#e0e0e0]">
                <FiSquare className="mr-2 text-gray-700" />
                <span className="font-medium text-gray-800">Concept Review</span>
              </div>
              <div className="px-4 py-3 text-[15px] text-gray-700">
                Want to quickly review some of the concepts you&apos;ve been learning? <br />
                Take a look at this material&apos;s <a href="#" className="text-violet-600 underline font-medium">cheatsheet!</a>
              </div>
            </div>

            {/* Community Support */}
            <div className="bg-[#f5f5f5] border border-[#e0e0e0] rounded-lg">
              <div className="flex items-center px-4 py-3 border-b border-[#e0e0e0]">
                <FiSquare className="mr-2 text-gray-700" />
                <span className="font-medium text-gray-800">Community Support</span>
              </div>
              <div className="px-4 py-3 text-[15px] text-gray-700">
                Still have questions? Get help from the <a href="#" className="text-violet-600 underline font-medium">Cloud OU community</a>.
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-gray-600">
            No lesson selected. Please select a lesson from the syllabus.
          </div>
        )}
      </div>
    </aside>
  );
}

export default CourseLessonLearningSidebar;