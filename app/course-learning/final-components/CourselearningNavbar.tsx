import Image from "next/image";

interface CourseLearningNavbarProps {
  setIsSidebarOpen: (isSidebarOpen: boolean) => void,
  courseId?: string
}

function CourseLearningNavbar({ 
  setIsSidebarOpen
}: CourseLearningNavbarProps) {

  
  return (
    <nav className="w-full flex items-center justify-between px-8 py-4 bg-white sticky top-0 z-10">
      <div className="flex items-center gap-8">
        <Image src="/images/cloud-ou-logo-2.svg" alt="CloudOU Logo" width={120} height={40} />
        <ul className="flex items-center gap-6 text-base font-medium">
          <li className="hover:text-blue-600 cursor-pointer transition-colors duration-200">My Home</li>
          <li 
            onClick={() => {
              console.log('Syllabus button clicked, opening sidebar');
              setIsSidebarOpen(true);
            }}
            className="hover:text-blue-600 cursor-pointer transition-colors duration-200"
          >
            Syllabus
          </li>
        </ul>
      </div>
      <div className="flex items-center gap-6">
        {/* Course ID Input for Testing */}
        
        
        <ul className="flex items-center gap-6 text-base font-medium">
          <li>Get Unstuck</li>
          <li>Tools</li>
        </ul>
       
        <button className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-400 text-white font-semibold rounded-md px-6 py-2 shadow hover:opacity-90 transition-opacity">
          <span role="img" aria-label="ai">🧑‍💻</span> Ask the AI Learning Assistant
        </button>
        <div className="w-9 h-9 rounded-full bg-gray-200" />
      </div>
    </nav>
  );
}

export default CourseLearningNavbar;