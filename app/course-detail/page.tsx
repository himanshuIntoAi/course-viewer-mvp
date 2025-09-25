"use client";

import React, { Suspense } from 'react';
import CourseDetailHeader from './components/CourseDetailHeader';
import CourseDetailSidebar from './components/CourseDetailSidebar';
import CourseDetailContent from './components/CourseDetailContent';
import CourseDetailRightSidebar from './components/CourseDetailRightSidebar';
import RelatedCourse from './components/RelatedCourse';
import { useEffect , useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getCourseData, getCourseTopics, getCourseLessons, getCourseLearningContent } from '@/services/api/course/api';
import type { CourseTopic, CourseLesson, CourseLearningContentResponse } from '@/services/api/course/api';
import { Course } from '@/services/types/course/course';
  
const CourseDetailPageInner = () => {
  const [courseData, setCourseData] = useState<Course | null>(null);
  const [topics, setTopics] = useState<CourseTopic[]>([]);
  const [lessons, setLessons] = useState<CourseLesson[]>([]);
  const [learningContent, setLearningContent] = useState<CourseLearningContentResponse | null>(null);
  const searchParams = useSearchParams();
  // Mock data - in real app this would come from API/props
 
  useEffect(() => {
    const fetchAll = async () => {
      const idParam = searchParams.get('courseId');
      const selectedId = idParam ? Number(idParam) : 1339;
      const [course, fetchedTopics, fetchedLessons, fetchedLearning] = await Promise.all([
        getCourseData(selectedId),
        getCourseTopics(selectedId),
        getCourseLessons(selectedId),
        getCourseLearningContent(selectedId)
      ]);
      setCourseData(course);
      setTopics(fetchedTopics);
      setLessons(fetchedLessons);
      setLearningContent(fetchedLearning);
    };
    fetchAll();
  }, [searchParams]);

  return (
    <div className="min-h-screen">
      <CourseDetailHeader />

      <div className="flex">
        {/* Left Sidebar */}
        <CourseDetailSidebar />

        <div>
          <div className='flex flex-row' >
            <div className="max-w-5xl mr-10 px-6 py-8">
              <CourseDetailContent courseData={courseData} topics={topics} lessons={lessons} learningContent={learningContent} />
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

export default function CourseDetailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}> 
      <CourseDetailPageInner />
    </Suspense>
  );
}