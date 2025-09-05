"use client";

import React from 'react';

import { CourseData } from '../types/course';

interface CourseDetailRightSidebarProps {
  courseData: CourseData;
}

const CourseDetailRightSidebar: React.FC<CourseDetailRightSidebarProps> = ({ courseData }) => {
  return (
    <div className="space-y-6">
      {/* Video Thumbnail */}
      <div className="relative bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="relative aspect-video bg-gray-100">
          <img
            src={courseData.thumbnailUrl}
            alt="Course Thumbnail"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIyNSIgdmlld0JveD0iMCAwIDQwMCAyMjUiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjI1IiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9IjIwMCIgY3k9IjExMi41IiByPSI0MCIgZmlsbD0iI0Q5REFEQyIvPgo8cGF0aCBkPSJNMTgwIDk1TDIyMCAxMTIuNUwxODAgMTMwVjk1WiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+';
            }}
          />

          {/* Play Button Overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-opacity-90 border-2 border-white-300 flex items-center justify-center shadow-lg hover:bg-opacity-100 transition-all duration-200 cursor-pointer">
              <img src="/images/course-detail/playIcon.png" alt="Play" />
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Info */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Subscribe to our top courses
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Get this course, plus 12,000+ of our top-rated courses, with Personal Plan. Full Time Access / Cancel Anytime.
        </p>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button className="w-full py-3 px-4 border-2 border-purple-600 text-purple-600 font-medium rounded-lg hover:bg-purple-50 transition-colors">
            Start Learning
          </button>
          <div className="text-center text-sm text-gray-500">OR</div>
          <button className="w-full py-3 px-4 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors">
            Enroll Now
          </button>
        </div>
      </div>

      {/* Course Metadata */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Information</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">

              <span className="text-gray-600">Start Date</span>
            </div>
            <span className="font-medium text-gray-900">{courseData.startDate}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">

              <span className="text-gray-600">Enrolled</span>
            </div>
            <span className="font-medium text-gray-900">{courseData.enrolled.toLocaleString()}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-gray-600">Languages</span>
            </div>
            <span className="font-medium text-gray-900">{courseData.languages}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-gray-600">Quizzes</span>
            </div>
            <span className="font-medium text-gray-900">10</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-gray-600">Certificate</span>
            </div>
            <span className="font-medium text-gray-900">Yes</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-gray-600">Certificate</span>
            </div>
            <span className="font-medium text-gray-900">90%</span>
          </div>
          <p className='text-gray-600 text-center' >For Details about course</p>

          <button className='w-full border border-gray-400 p-3 text-black font-medium rounded-lg transition-colors'>Chat Support</button>
        </div>
      </div>
      
    </div>
  );
};

export default CourseDetailRightSidebar;
