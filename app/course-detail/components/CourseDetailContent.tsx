"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { Course } from '@/services/types/course/course';

interface CourseDetailContentProps {
  courseData: Course | null;
}

const CourseDetailContent: React.FC<CourseDetailContentProps> = ({ courseData }) => {
  const [activeTab, setActiveTab] = useState('content');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['introduction']));

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const expandAllSections = () => {
    setExpandedSections(new Set(['introduction', 'section1', 'section2', 'section3']));
  };

  // Handle loading state
  if (!courseData) {
    return (
      <div className="max-w-4xl">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="h-32 bg-gray-200 rounded mb-8"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      {/* Breadcrumbs */}
      <nav className="text-sm text-gray-500 mb-6 flex items-center">
        <Image src="/images/course-detail/homeIcon.svg" alt="Breadcrumbs" width={16} height={16} className='mr-2' />
        <span className="hover:text-gray-700 cursor-pointer">Home</span>
        <Image className="mx-2" src="/images/course-detail/arrow-rightLogo.svg" alt="Right Arrow" width={16} height={16} />
        <span className="hover:text-gray-700 cursor-pointer">Courses</span>
        <Image className="mx-2" src="/images/course-detail/arrow-rightLogo.svg" alt="Right Arrow" width={16} height={16} />
        <span className="text-gray-900">{courseData.title}</span>
      </nav>

      {/* Course Title and Subtitle */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          {courseData.title}
        </h1>
        <p className="text-lg text-gray-600 leading-relaxed">
          {courseData.description}
        </p>
      </div>

      {/* Instructor and Stats */}
      <div className="flex items-center space-x-6 mb-8">
        <div className="flex items-center space-x-2">
          <span className="text-gray-600">Created by</span>
          <a href="#" className="underline font-medium">
            {courseData.instructor?.name || 'Unknown Instructor'}
          </a>
        </div>
        <div className="flex items-center space-x-1">
          <Image src="/images/course-detail/starRatingLogo.svg" alt="Star Rating" width={20} height={20} />
          <span className="font-medium">{courseData.ratings || 0}</span>
          <span className="text-gray-500">({courseData.total_reviews || 0} ratings)</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="text-gray-500">Course Level: {courseData.Course_level || 'Beginner'}</span>
        </div>
      </div>

      {/* What You'll Learn */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">What you&apos;ll learn</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courseData.what_will_you_learn ? (
            <div className="text-gray-700">{courseData.what_will_you_learn}</div>
          ) : (
            <div className="text-gray-500 italic">Learning objectives will be available soon</div>
          )}
        </div>
      </div>

      {/* Related Topics */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Course Information</h3>
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 border border-gray-200 text-gray-700 rounded-sm text-sm">
            Level: {courseData.Course_level || 'Beginner'}
          </span>
          <span className="px-3 py-1 border border-gray-200 text-gray-700 rounded-sm text-sm">
            Duration: {courseData.duration_unit || 'Days'}
          </span>
          <span className="px-3 py-1 border border-gray-200 text-gray-700 rounded-sm text-sm">
            Recurrence: {courseData.recurrence || 'Weekly'}
          </span>
          {courseData.IT && (
            <span className="px-3 py-1 border border-gray-200 text-gray-700 rounded-sm text-sm">
              IT Course
            </span>
          )}
          {courseData.Coding_Required && (
            <span className="px-3 py-1 border border-gray-200 text-gray-700 rounded-sm text-sm">
              Coding Required
            </span>
          )}
        </div>
      </div>

      {/* Course Includes */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">This course includes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3">
            <Image src="/images/course-detail/video-logo.svg" alt="Video" width={20} height={20} />
            <span className="text-gray-700">{courseData.duration_hours || 'N/A'} hours of content</span>
          </div>
          <div className="flex items-center space-x-3">
            <Image src="/images/course-detail/mobile-logo.svg" alt="Mobile" width={20} height={20} />
            <span className="text-gray-700">Access on mobile and TV</span>
          </div>
          <div className="flex items-center space-x-3">
            <Image src="/images/course-detail/document-download-logo.svg" alt="Download" width={20} height={20} />
            <span className="text-gray-700">Downloadable resources</span>
          </div>
          <div className="flex items-center space-x-3">
            <Image src="/images/course-detail/assignment-logo.svg" alt="Assignments" width={20} height={20} />
            <span className="text-gray-700">Assignments</span>
          </div>
          <div className="flex items-center space-x-3">
            <Image src="/images/course-detail/cup-logo.svg" alt="Certificate" width={20} height={20} />
            <span className="text-gray-700">Certificate of completion</span>
          </div>
        </div>
      </div>

      {/* Course Content Tabs */}
      <div className="bg-white rounded-lg border border-gray-200">
        {/* Tab Headers */}
        <div className="border-b border-gray-200">
          <div className="flex space-x-8 px-6">
            {['Content', 'Details', 'Instructor', 'Reviews'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab.toLowerCase())}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.toLowerCase()
                  ? 'border-b-black text-black font-bold'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'content' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="text-sm text-black ">
                  Course Duration: {courseData.duration_unit || 'Days'} • Recurrence: {courseData.recurrence || 'Weekly'} • Level: {courseData.Course_level || 'Beginner'}
                </div>
                <button
                  onClick={expandAllSections}
                  className="text-black font-bold underline text-sm"
                >
                  Expand all sections
                </button>
              </div>

              {/* Course Sections */}
              <div className="space-y-2">
                {/* Introduction Section */}
                <div className="rounded-lg">
                  <button
                    onClick={() => toggleSection('introduction')}
                    className="w-full px-4 py-3 text-left bg-black text-white rounded-2xl flex"
                  >
                    <Image src="/images/course-detail/arrow-rightLogo.svg" alt="Arrow Right" width={16} height={16} />
                    <div className="flex items-center space-x-3 flex-row justify-between w-full text-white">
                      <span className="font-medium">Introduction</span>
                      <span className="text-sm ">7 Lessons - 21min</span>
                    </div>
                  </button>
                  {expandedSections.has('introduction') && (
                    <div className="px-4 pb-3 border-t border-gray-200">
                      <div className="pt-3 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <div className='flex items-center space-x-2'>
                            <Image src="/images/course-detail/video-logo.svg" alt="" width={16} height={16} />
                            <span className=" text-blue-600 underline">About the course</span>
                          </div>
                          <div>
                            <span className="mr-2 text-blue-600 underline">Preview</span>
                            <span className="text-gray-500">2:15</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div className='flex items-center space-x-2'>
                            <Image src="/images/course-detail/video-logo.svg" alt="" width={16} height={16} />
                            <span className=" text-blue-600 underline">About the course</span>
                          </div>
                          <div>
                            <span className="mr-2 text-blue-600 underline">Preview</span>
                            <span className="text-gray-500">2:15</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div className='flex items-center space-x-2'>
                            <Image src="/images/course-detail/video-logo.svg" alt="" width={16} height={16} />
                            <span className=" text-blue-600 underline">About the course</span>
                          </div>
                          <div>
                            <span className="mr-2 text-blue-600 underline">Preview</span>
                            <span className="text-gray-500">2:15</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <div className='flex items-center space-x-2'>
                            <Image src="/images/course-detail/video-logo.svg" alt="" width={16} height={16} />
                            <span className=" text-blue-600 underline">About the course</span>
                          </div>
                          <div>
                            <span className="mr-2 text-blue-600 underline">Preview</span>
                            <span className="text-gray-500">2:15</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div className='flex items-center space-x-2'>
                            <Image src="/images/course-detail/video-logo.svg" alt="" width={16} height={16} />
                            <span className=" text-blue-600 underline">About the course</span>
                          </div>
                          <div>
                            <span className="mr-2 text-blue-600 underline">Preview</span>
                            <span className="text-gray-500">2:15</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div className='flex items-center space-x-2'>
                            <Image src="/images/course-detail/video-logo.svg" alt="" width={16} height={16} />
                            <span className=" text-blue-600 underline">About the course</span>
                          </div>
                          <div>
                            <span className="mr-2 text-blue-600 underline">Preview</span>
                            <span className="text-gray-500">2:15</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Additional Sections */}
                {['section1', 'section2', 'section3'].map((sectionId) => (
                  <div key={sectionId} className="">
                    <button
                      onClick={() => toggleSection(sectionId)}
                      className="w-full px-4 py-3 text-left flex bg-black text-white rounded-2xl flex-row"
                    >
                      <Image src="/images/course-detail/arrow-rightLogo.svg" alt="Arrow Right" width={16} height={16} />
                      <div className="flex items-center space-x-3 flex-row justify-between text-white w-full">
                        <span className="font-medium">Section {sectionId.replace('section', '')}</span>
                        <span className="text-sm ">12 Lessons - 45min</span>
                      </div>

                    </button>
                    {expandedSections.has(sectionId) && (
                      <div className="px-4 pb-3 border-t ">
                        <div className="pt-3 space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <div className='flex items-center space-x-2'>
                              <Image src="/images/course-detail/video-logo.svg" alt="" width={16} height={16} />
                              <span className=" text-blue-600 underline">About the course</span>
                            </div>
                            <div>
                              <span className="mr-2 text-blue-600 underline">Preview</span>
                              <span className="text-gray-500">2:15</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <div className='flex items-center space-x-2'>
                              <Image src="/images/course-detail/video-logo.svg" alt="" width={16} height={16} />
                              <span className=" text-blue-600 underline">About the course</span>
                            </div>
                            <div>
                              <span className="mr-2 text-blue-600 underline">Preview</span>
                              <span className="text-gray-500">2:15</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'details' && (
            <div className="text-center py-12 text-gray-500">
              <p>Course details will be displayed here</p>
            </div>
          )}

          {activeTab === 'instructor' && (
            <div className="text-center py-12 text-gray-500">
              <p>Instructor information will be displayed here</p>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="text-center py-12 text-gray-500">
              <p>Course reviews will be displayed here</p>
            </div>
          )}
          <p className='text-center text-black font-bold text-lg p-3 border-2 mt-2 rounded-2xl border-blue-500 '>
            Collapse all sections
          </p>
        </div>

      </div>
    </div>
  );
};

export default CourseDetailContent;
