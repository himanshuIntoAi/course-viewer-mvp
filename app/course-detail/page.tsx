"use client";

import React from 'react';
import CourseDetailHeader from './components/CourseDetailHeader';
import CourseDetailSidebar from './components/CourseDetailSidebar';
import CourseDetailContent from './components/CourseDetailContent';
import CourseDetailRightSidebar from './components/CourseDetailRightSidebar';
import RelatedCourse from './components/RelatedCourse';
import { useEffect , useState } from 'react';
import { getCourseData } from '@/services/api/course/api';
import { Course } from '@/services/types/course/course';
  
const CourseDetailPage = () => {
  const [courseData, setCourseData] = useState<Course | null>(null);
  // Mock data - in real app this would come from API/props
 
  useEffect(() => {
    const fetchCourseData = async () => {
      const data = await getCourseData(Number(1339));
      console.log(data);
      setCourseData(data);
    };
    fetchCourseData();
  }, []);

  return (
    <div className="min-h-screen">
      <CourseDetailHeader />

      <div className="flex">
        {/* Left Sidebar */}
        <CourseDetailSidebar />

        <div>
          <div className='flex flex-row' >
            <div className="max-w-5xl mr-10 px-6 py-8">
              <CourseDetailContent courseData={courseData} />
            </div>

            {/* Right Sidebar */}
            <div className="w-[22%] border border-gray-200 rounded-lg p-6 mt-12">
              <CourseDetailRightSidebar courseData={courseData} />
            </div>
          </div>

          {/* Related Courses Section */}
          <RelatedCourse />
        </div>

        {/* Main Content */}

      </div>
    </div>
  );
};

export default CourseDetailPage;