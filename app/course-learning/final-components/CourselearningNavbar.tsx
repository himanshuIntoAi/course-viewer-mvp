import Image from "next/image";
import { useState } from "react";

interface CourseLearningNavbarProps {
  setIsSidebarOpen: (isSidebarOpen: boolean) => void,
  onTestAPI?: () => void,
  courseId?: string,
  onCourseIdChange?: (courseId: string) => void
}

function CourseLearningNavbar({ 
  setIsSidebarOpen, 
  onTestAPI, 
  courseId = "641",
  onCourseIdChange 
}: CourseLearningNavbarProps) {
  const [inputCourseId, setInputCourseId] = useState(courseId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onCourseIdChange) {
      onCourseIdChange(inputCourseId);
    }
  };

  return (
    <nav className="w-full flex items-center justify-between px-8 py-4 bg-white sticky top-0 z-10">
      <div className="flex items-center gap-8">
        <Image src="/images/cloud-ou-logo-2.svg" alt="CloudOU Logo" width={120} height={40} />
        <ul className="flex items-center gap-6 text-base font-medium">
          <li>My Home</li>
          <li onClick={() => setIsSidebarOpen(true)}>Syllabus</li>
        </ul>
      </div>
      <div className="flex items-center gap-6">
        {/* Course ID Input for Testing */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={inputCourseId}
            onChange={(e) => setInputCourseId(e.target.value)}
            placeholder="Course ID"
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            className="px-3 py-2 bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Load Course
          </button>
        </form>
        
        <ul className="flex items-center gap-6 text-base font-medium">
          <li>Get Unstuck</li>
          <li>Tools</li>
        </ul>
        {onTestAPI && (
          <button 
            onClick={onTestAPI}
            className="flex items-center gap-2 bg-red-500 text-white font-semibold rounded-md px-4 py-2 shadow hover:opacity-90 transition-opacity"
          >
            Test API
          </button>
        )}
        <button className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-400 text-white font-semibold rounded-md px-6 py-2 shadow hover:opacity-90 transition-opacity">
          <span role="img" aria-label="ai">🧑‍💻</span> Ask the AI Learning Assistant
        </button>
        <div className="w-9 h-9 rounded-full bg-gray-200" />
      </div>
    </nav>
  );
}

export default CourseLearningNavbar;