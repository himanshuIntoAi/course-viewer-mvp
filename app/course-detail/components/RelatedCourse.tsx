"use client";

import React from 'react';

interface RelatedCourseData {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  duration: string;
  rating: number;
  reviewCount: number;
  description: string[];
  thumbnailUrl: string;
}

const RelatedCourse = () => {
  // Mock data for related courses
  const relatedCourses: RelatedCourseData[] = [
    {
      id: '1',
      title: 'Neurodesign: Crafting Interfaces that Influence Behavior',
      category: 'Design',
      difficulty: 'Intermediate',
      duration: '3Hrs',
      rating: 4.6,
      reviewCount: 1650,
      description: ['Neuroaesthetics', 'Cognitive Load Optimization', 'Emotional Triggers', 'Visual Hierarchy', 'UX Psychology'],
      thumbnailUrl: '/images/hero-image-courses.png'
    },
    {
      id: '2',
      title: 'AI-Powered Creativity: Tools for Designers',
      category: 'Marketing',
      difficulty: 'Beginner',
      duration: '3.5Hrs',
      rating: 4.8,
      reviewCount: 2490,
      description: ['Generative Design', 'AI Co-Creation', 'Automation in Design', 'Text-to-Image Tools', 'Prompt Engineering'],
      thumbnailUrl: '/images/hero-image-courses.png'
    },
    {
      id: '3',
      title: 'Design Systems 2.0: Automation and Scalability',
      category: 'Design',
      difficulty: 'Intermediate',
      duration: '4Hrs',
      rating: 4.7,
      reviewCount: 1940,
      description: ['Token-Based Design', 'Component Libraries', 'Figma Automation', 'System Governance', 'Team Scaling'],
      thumbnailUrl: '/images/hero-image-courses.png'
    }
  ];

  return (
    <div className="w-full px-6 py-8 ">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 border-t border-gray-200 pt-6 ">
        <h2 className="text-2xl font-bold text-gray-900">Related Courses</h2>
        <button className="text-purple-600 font-medium hover:text-purple-700 transition-colors">
          View all
        </button>
      </div>

      {/* Three Course Cards */}
      <div className="grid grid-cols-3 gap-6">
        {relatedCourses.map((course) => (
          <div key={course.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
            {/* Course Image */}
            <div className="relative h-48 bg-gray-200">
              <img 
                src={course.thumbnailUrl} 
                alt={course.title}
                className="w-full h-full object-cover"
              />
              {/* Category Tag */}
              <div className="absolute top-3 left-3">
                <span className="bg-white px-3 py-1 rounded-full text-sm font-medium text-gray-700 shadow-sm border border-gray-200" >
                  {course.category}
                </span>
              </div>
            </div>

            {/* Course Content */}
            <div className="p-4">
              {/* Course Metadata */}
              <div className="flex items-center space-x-4 mb-3 text-sm text-gray-600">
                <div className="flex items-center space-x-1 border border-gray-200 rounded-lg p-2">
                  
                  <span>{course.difficulty}</span>
                </div>
                <div className="flex items-center space-x-1">

                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center space-x-1">
                    <img src="/images/course-detail/starRatingLogo.svg" alt="" />
                  <span>{course.rating}</span>
                  <span className="text-gray-400">({course.reviewCount})</span>
                </div>
              </div>

              {/* Course Title */}
              <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2">
                {course.title}
              </h3>

              {/* Course Description/Keywords */}
              <div className="flex flex-wrap gap-1">
                {course.description.slice(0, 3).map((keyword, index) => (
                  <span 
                    key={index}
                    className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded"
                  >
                    {keyword}
                  </span>
                ))}
                {course.description.length > 3 && (
                  <span className="text-xs text-gray-400">
                    +{course.description.length - 3} more
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RelatedCourse;
