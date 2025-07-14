
"use client"
import CourseLearningNavbar from "./final-components/CourselearningNavbar"
import CourseSyllabusSidebar from "./final-components/CourseSyllabusSidebar"
import CourseLessonLearningSidebar from "./final-components/CourselessonLearningSidebar"
import CourseEditor from "./final-components/CourseEditor"
import CourseVideoPlayer from "./final-components/CourseVideoPlayer"
import { useState } from "react"
function CourseLearningPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false)
  return (
    <div className="flex flex-col h-screen" >
      <CourseLearningNavbar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
      <div className="flex flex-row h-screen">
        {
          isSidebarOpen && <CourseSyllabusSidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
        }
        <CourseLessonLearningSidebar />
        <CourseEditor />
        <CourseVideoPlayer />
      </div>
    </div>
  )
}


export default CourseLearningPage