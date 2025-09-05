"use client";

import React, { useState } from 'react';
import { CourseData } from '../types/course';

interface CourseDetailContentProps {
  courseData: CourseData;
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

  return (
    <div className="max-w-4xl">
      {/* Breadcrumbs */}
      <nav className="text-sm text-gray-500 mb-6 flex items-center">
        <img src="/images/course-detail/homeIcon.svg" alt="Breadcrumbs" className='mr-2' />
        {courseData.breadcrumbs.map((crumb, index) => (
          <span key={index} className="flex items-center">
            {index > 0 && <img className="mx-2" src="/images/course-detail/arrow-rightLogo.svg" alt="Right Arrow" />}
            <span className={index === courseData.breadcrumbs.length - 1 ? 'text-gray-900' : 'hover:text-gray-700 cursor-pointer'}>
              {crumb}
            </span>
          </span>
        ))}
      </nav>

      {/* Course Title and Subtitle */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          {courseData.title}
        </h1>
        <p className="text-lg text-gray-600 leading-relaxed">
          {courseData.subtitle}
        </p>
      </div>

      {/* Instructor and Stats */}
      <div className="flex items-center space-x-6 mb-8">
        <div className="flex items-center space-x-2">
          <span className="text-gray-600">Created by</span>
          <a href="#" className="underline font-medium">
            {courseData.instructor}
          </a>
        </div>
        <div className="flex items-center space-x-1">
          <img src="/images/course-detail/starRatingLogo.svg" alt="Star Rating" />
          <span className="font-medium">{courseData.rating}</span>
          <span className="text-gray-500">({courseData.totalRatings.toLocaleString()} ratings)</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="text-gray-500">{courseData.totalLearners.toLocaleString()} Learners</span>
        </div>
      </div>

      {/* What You'll Learn */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">What you'll learn</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courseData.learningObjectives.map((objective, index) => (
            <div key={index} className="flex items-start space-x-3">
              <li className="text-gray-700">{objective}</li>
            </div>
          ))}
        </div>
      </div>

      {/* Related Topics */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Explore related topics</h3>
        <div className="flex flex-wrap gap-2">
          {courseData.relatedTopics.map((topic, index) => (
            <span
              key={index}
              className="px-3 py-1 border border-gray-200 text-gray-700 rounded-sm text-sm"
            >
              {topic}
            </span>
          ))}
        </div>
      </div>

      {/* Course Includes */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">This course includes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3">
            <img src="/images/course-detail/video-logo.svg" alt="Video" />
            <span className="text-gray-700">{courseData.videoHours} hours on-demand video</span>
          </div>
          <div className="flex items-center space-x-3">
            <img src="/images/course-detail/mobile-logo.svg" alt="Mobile" />
            <span className="text-gray-700">Access on mobile and TV</span>

          </div>
          <div className="flex items-center space-x-3">
            <img src="/images/course-detail/document-download-logo.svg" alt="Download" />
            <span className="text-gray-700">{courseData.downloadableResources} downloadable resources</span>
          </div>
          <div className="flex items-center space-x-3">
            <img src="/images/course-detail/assignment-logo.svg" alt="Assignments" />
            <span className="text-gray-700">Assignments</span>
          </div>
          <div className="flex items-center space-x-3">
            <img src="/images/course-detail/cup-logo.svg" alt="Certificate" />
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
                  {courseData.sections} sections • {courseData.lectures} lectures • {courseData.totalLength} total length
                </div>
                <button
                  onClick={expandAllSections}
                  className="text-black font-bold underline text-sm font-medium"
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
                    <img src="/images/course-detail/arrow-rightLogo.svg" alt="Arrow Right" />
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
                            <img src="/images/course-detail/video-logo.svg" alt="" />
                            <span className=" text-blue-600 underline">About the course</span>
                          </div>
                          <div>
                            <span className="mr-2 text-blue-600 underline">Preview</span>
                            <span className="text-gray-500">2:15</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div className='flex items-center space-x-2'>
                            <img src="/images/course-detail/video-logo.svg" alt="" />
                            <span className=" text-blue-600 underline">About the course</span>
                          </div>
                          <div>
                            <span className="mr-2 text-blue-600 underline">Preview</span>
                            <span className="text-gray-500">2:15</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div className='flex items-center space-x-2'>
                            <img src="/images/course-detail/video-logo.svg" alt="" />
                            <span className=" text-blue-600 underline">About the course</span>
                          </div>
                          <div>
                            <span className="mr-2 text-blue-600 underline">Preview</span>
                            <span className="text-gray-500">2:15</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <div className='flex items-center space-x-2'>
                            <img src="/images/course-detail/video-logo.svg" alt="" />
                            <span className=" text-blue-600 underline">About the course</span>
                          </div>
                          <div>
                            <span className="mr-2 text-blue-600 underline">Preview</span>
                            <span className="text-gray-500">2:15</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div className='flex items-center space-x-2'>
                            <img src="/images/course-detail/video-logo.svg" alt="" />
                            <span className=" text-blue-600 underline">About the course</span>
                          </div>
                          <div>
                            <span className="mr-2 text-blue-600 underline">Preview</span>
                            <span className="text-gray-500">2:15</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div className='flex items-center space-x-2'>
                            <img src="/images/course-detail/video-logo.svg" alt="" />
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
                      <img src="/images/course-detail/arrow-rightLogo.svg" alt="Arrow Right" />
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
                              <img src="/images/course-detail/video-logo.svg" alt="" />
                              <span className=" text-blue-600 underline">About the course</span>
                            </div>
                            <div>
                              <span className="mr-2 text-blue-600 underline">Preview</span>
                              <span className="text-gray-500">2:15</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <div className='flex items-center space-x-2'>
                              <img src="/images/course-detail/video-logo.svg" alt="" />
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
          <p className='text-center text-black font-bold text-lg p-3 border border-2 mt-2 rounded-2xl border-blue-500 '>
            Collapse all sections
          </p>
        </div>

      </div>
    </div>
  );
};

export default CourseDetailContent;
