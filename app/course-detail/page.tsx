"use client";

import React from 'react';
import CourseDetailHeader from './components/CourseDetailHeader';
import CourseDetailSidebar from './components/CourseDetailSidebar';
import CourseDetailContent from './components/CourseDetailContent';
import CourseDetailRightSidebar from './components/CourseDetailRightSidebar';
import RelatedCourse from './components/RelatedCourse';
import { CourseData } from './types/course';

const CourseDetailPage = () => {
  // Mock data - in real app this would come from API/props
  const courseData = {
    id: '1',
    title: 'Ultimate DevOps Project Implementation',
    subtitle: 'End to End DevOps Implementation on an E-Commerce project with Resume preparation and Interview Q&A',
    instructor: 'Abhishek Veeramalla',
    rating: 4.6,
    totalRatings: 2851,
    totalLearners: 19055,
    thumbnailUrl: '/images/hero-image-courses.png',
    startDate: '12/06/2025',
    enrolled: 100,
    languages: 'English',
    sections: 13,
    lectures: 76,
    totalLength: '11h 46m',
    videoHours: 12,
    hasAssignments: true,
    downloadableResources: 3,
    hasMobileAccess: true,
    hasCertificate: true,
    learningObjectives: [
      'Hands-on experience on a real time DevOps project with multiple microservices',
      'Understanding of adding this end to end DevOps project to their Resumes',
      'Understanding of how to manage a real time project with best practices',
      'Hands-on on popular DevOps tools and AWS'
    ],
    relatedTopics: ['IT & Consulting', 'IT & Consulting', 'IT & Consulting'],
    breadcrumbs: ['Home', 'Catalog', 'IT & Software', 'DevOps']
  };

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