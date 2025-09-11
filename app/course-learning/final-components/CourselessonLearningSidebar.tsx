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
  hasVideo?: boolean;
  hasCode?: boolean;
  isLearningSidebarFullScreen?: boolean;
  setIsLearningSidebarFullScreen?: (isLearningSidebarFullScreen: boolean) => void;
}

function CourseLessonLearningSidebar({ selectedLessonId, currentLesson: propCurrentLesson, loading: propLoading, courseId = "641", hasVideo, hasCode, isLearningSidebarFullScreen, setIsLearningSidebarFullScreen }: CourseLessonLearningSidebarProps) {
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);


  // Use prop data if available, otherwise use local state
  const displayLesson = propCurrentLesson || currentLesson;
  const displayLoading = propLoading !== undefined ? propLoading : loading;

  // Toggle sidebar width
  const toggleSidebarWidth = () => {
    if (setIsLearningSidebarFullScreen) {
      setIsLearningSidebarFullScreen(!isLearningSidebarFullScreen);
    }
  };

  // Handle ESC key to exit full screen
  // useEffect(() => {
  //   const handleKeyDown = (event: KeyboardEvent) => {
  //     if (event.key === 'Escape' && isLearningSidebarFullScreen) {
  //       setIsLearningSidebarFullScreen(false);
       
  //     }
  //   };

  //   if (isLearningSidebarFullScreen) {
  //     document.addEventListener('keydown', handleKeyDown);
  //     return () => document.removeEventListener('keydown', handleKeyDown);
  //   }
  // }, []);

  useEffect(() => {
    if (!hasVideo || !hasCode) {
      setIsLearningSidebarFullScreen(true);
     
    }
  }, [hasVideo, hasCode]);


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
            // Fallback to mock data with HTML content
            setCurrentLesson({
              id: 1,
              title: 'What is Python?',
              content: '<h2>Introduction to Python</h2><p>Python is a <strong>high-level, interpreted</strong>, and general-purpose programming language that is widely used for:</p><ul><li>Web development</li><li>Data analysis</li><li>Artificial intelligence</li><li>Machine learning</li></ul><p>This lesson covers the <em>history of Python</em>, its uses, and why it\'s a great choice for beginners.</p><h3>Key Features</h3><p>Some of the key features that make Python popular include:</p><ol><li>Simple and readable syntax</li><li>Large standard library</li><li>Cross-platform compatibility</li><li>Strong community support</li></ol>',
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
          // Fallback to mock data with HTML content
          setCurrentLesson({
            id: 1,
            title: 'What is Python?',
            content: '<h2>Introduction to Python</h2><p>Python is a <strong>high-level, interpreted</strong>, and general-purpose programming language that is widely used for:</p><ul><li>Web development</li><li>Data analysis</li><li>Artificial intelligence</li><li>Machine learning</li></ul><p>This lesson covers the <em>history of Python</em>, its uses, and why it\'s a great choice for beginners.</p><h3>Key Features</h3><p>Some of the key features that make Python popular include:</p><ol><li>Simple and readable syntax</li><li>Large standard library</li><li>Cross-platform compatibility</li><li>Strong community support</li></ol>',
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
          // Fallback to mock data with HTML content
          setCurrentLesson({
            id: selectedLessonId,
            title: `Lesson ${selectedLessonId}`,
            content: '<h3>Sample Lesson Content</h3><p>This is a <strong>sample lesson content</strong> with HTML formatting. The API is not available right now, but you can see how the UI will look with real data.</p><ul><li>Feature 1: Dynamic HTML rendering</li><li>Feature 2: Responsive design</li><li>Feature 3: Interactive elements</li></ul><h4>Additional Information</h4><p>This demonstrates how the sidebar can handle <em>various HTML elements</em> including:</p><ol><li>Headings (h1-h6)</li><li>Paragraphs and text formatting</li><li>Lists (ordered and unordered)</li><li>Links and other elements</li></ol>',
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
        // Fallback to mock data with HTML content
        setCurrentLesson({
          id: selectedLessonId,
          title: `Lesson ${selectedLessonId}`,
          content: '<h3>Sample Lesson Content</h3><p>This is a <strong>sample lesson content</strong> with HTML formatting. The API is not available right now, but you can see how the UI will look with real data.</p><ul><li>Feature 1: Dynamic HTML rendering</li><li>Feature 2: Responsive design</li><li>Feature 3: Interactive elements</li></ul><h4>Additional Information</h4><p>This demonstrates how the sidebar can handle <em>various HTML elements</em> including:</p><ol><li>Headings (h1-h6)</li><li>Paragraphs and text formatting</li><li>Lists (ordered and unordered)</li><li>Links and other elements</li></ol>',
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
      <aside className={`w-full ${isLearningSidebarFullScreen ? 'fixed inset-0 z-40 max-w-none' : 'max-w-[400px]'} h-screen  border-r border-[#ececec] flex flex-col transition-all duration-300 ease-in-out`}>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
          <span className="ml-2 text-gray-600">Loading lesson...</span>
        </div>
      </aside>
    );
  }

  if (error) {
    return (
      <aside className={`w-full ${isLearningSidebarFullScreen ? 'fixed inset-0 z-50 max-w-none' : 'max-w-[400px]'} h-screen  border-r border-[#ececec] flex flex-col transition-all duration-300 ease-in-out`}>
        <div className="text-red-600 text-center py-8">
          {error}
        </div>
      </aside>
    );
  }

  return (
    <>
      <style jsx>{`
        .lesson-content h1 {
          font-size: 1.5rem;
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 1rem;
          margin-top: 0.5rem;
        }
        .lesson-content h2 {
          font-size: 1.25rem;
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 0.75rem;
          margin-top: 0.5rem;
        }
        .lesson-content h3 {
          font-size: 1.125rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.5rem;
          margin-top: 0.5rem;
        }
        .lesson-content h4 {
          font-size: 1rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.5rem;
          margin-top: 0.5rem;
        }
        .lesson-content h5 {
          font-size: 0.875rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.25rem;
          margin-top: 0.5rem;
        }
        .lesson-content h6 {
          font-size: 0.75rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.25rem;
          margin-top: 0.5rem;
        }
        .lesson-content p {
          margin-bottom: 0.75rem;
          line-height: 1.6;
        }
        .lesson-content ul {
          list-style-type: disc;
          margin-left: 1.5rem;
          margin-bottom: 0.75rem;
        }
        .lesson-content ol {
          list-style-type: decimal;
          margin-left: 1.5rem;
          margin-bottom: 0.75rem;
        }
        .lesson-content li {
          margin-bottom: 0.25rem;
        }
        .lesson-content strong {
          font-weight: 600;
          color: #1f2937;
        }
        .lesson-content em {
          font-style: italic;
          color: #374151;
        }
        .lesson-content code {
          background-color: #f3f4f6;
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
          font-family: 'Courier New', monospace;
          font-size: 0.875rem;
        }
        .lesson-content pre {
          background-color: #f3f4f6;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin-bottom: 0.75rem;
        }
        .lesson-content blockquote {
          border-left: 4px solid #d1d5db;
          padding-left: 1rem;
          margin: 1rem 0;
          font-style: italic;
          color: #6b7280;
        }
        .lesson-content a {
          color: #7c3aed;
          text-decoration: underline;
        }
        .lesson-content a:hover {
          color: #5b21b6;
        }
        .lesson-content img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 0.5rem 0;
        }
        .lesson-content table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 0.75rem;
        }
        .lesson-content th,
        .lesson-content td {
          border: 1px solid #d1d5db;
          padding: 0.5rem;
          text-align: left;
        }
        .lesson-content th {
          background-color: #f9fafb;
          font-weight: 600;
        }
        
        /* Custom scrollbar styling */
        .sidebar-content::-webkit-scrollbar {
          width: 6px;
        }
        .sidebar-content::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }
        .sidebar-content::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }
        .sidebar-content::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
        
        /* Full screen mode styling */
        .fullscreen-overlay {
          backdrop-filter: blur(0px);
        }
        
        .fullscreen-overlay::before {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.1);
          z-index: -1;
        }
      `}</style>
      <aside className={`w-full ${isLearningSidebarFullScreen ? 'fixed w-full' : ''} h-screen  border-r border-[#ececec] flex flex-col transition-all duration-300 ease-in-out`}>
        {/* Top Bar */}
        <div className={`flex items-center justify-between bg-[#ececec] ${isLearningSidebarFullScreen ? 'px-12' : 'px-6'} py-4 border-b border-[#e0e0e0]`}>
          <div className="flex items-center gap-2">
            <Image src="/images/learner-icon.svg" alt="Cloud OU Logo" width={20} height={40} />
            <span className="font-medium text-gray-800">Learn</span>
            {isLearningSidebarFullScreen && (
              <span className="text-sm text-gray-600 ml-2">- Full Screen Mode</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isLearningSidebarFullScreen && (
              <button
                className="p-2 rounded hover:bg-gray-200 transition-colors duration-200"
                onClick={toggleSidebarWidth}
                title="Exit full screen"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
                </svg>
              </button>
            )}
            <button
              className="p-2 rounded hover:bg-gray-200 transition-colors duration-200"
              onClick={toggleSidebarWidth}
              title={isLearningSidebarFullScreen ? "Exit full screen" : "Enter full screen"}
            >
              <Image src="/images/resize-icon.svg" alt="Resize sidebar" width={20} height={40} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className={`sidebar-content flex-1 flex flex-col ${isLearningSidebarFullScreen ? 'px-12 z-40 bg-white' : 'px-6'} py-6 gap-6 overflow-y-auto max-h-[calc(100vh-80px)]`}>
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

              {/* Dynamic Content Rendering */}
              {displayLesson.content && (
                <div
                  className="lesson-content text-[15px] text-gray-800 leading-relaxed space-y-3 mb-2"
                  dangerouslySetInnerHTML={{ __html: displayLesson.content }}
                />
              )}

            </>
          ) : (
            <div className="text-center py-8 text-gray-600">
              No lesson selected. Please select a lesson from the syllabus.
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

export default CourseLessonLearningSidebar;