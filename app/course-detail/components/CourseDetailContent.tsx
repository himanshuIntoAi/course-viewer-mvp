"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Course } from '@/services/types/course/course';
import type {
  CourseTopic,
  CourseLesson,
  CourseLearningContentResponse,
  CourseLearningContentQuizItem,
  CourseLearningContentFlashcardItem,
  CourseLearningContentMemoryGameItem,
  CourseLearningContentTopicItem,
} from '@/services/api/course/api';

interface CourseDetailContentProps {
  courseData: Course | null;
  topics?: CourseTopic[];
  lessons?: CourseLesson[];
  learningContent?: CourseLearningContentResponse | null;
}

const CourseDetailContent: React.FC<CourseDetailContentProps> = ({ courseData, topics = [], lessons = [], learningContent = null }) => {
  const [activeTab, setActiveTab] = useState('content');
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());

  const toggleSection = (sectionId: number) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const expandAllSections = () => {
    setExpandedSections(new Set(topics.map((t) => t.id)));
  };

  // Handle loading state
  if (!courseData) {
    return (
      <div className="w-[50vw]">
        <div className="animate-pulse">
          {/* Breadcrumbs skeleton */}
          <nav className="flex items-center mb-6">
            <div className="w-4 h-4 bg-gray-200 rounded mr-2"></div>
            <div className="h-3 bg-gray-200 rounded w-12"></div>
            <div className="w-4 h-4 bg-gray-200 rounded mx-2"></div>
            <div className="h-3 bg-gray-200 rounded w-16"></div>
            <div className="w-4 h-4 bg-gray-200 rounded mx-2"></div>
            <div className="h-3 bg-gray-200 rounded w-32"></div>
          </nav>

          {/* Course Title and Subtitle skeleton */}
          <div className="mb-8">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-3"></div>
            <div className="h-5 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-5 bg-gray-200 rounded w-5/6"></div>
          </div>

          {/* Instructor and Stats skeleton */}
          <div className="flex items-center space-x-6 mb-8">
            <div className="h-4 bg-gray-200 rounded w-40"></div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
            <div className="h-4 bg-gray-200 rounded w-36"></div>
          </div>

          {/* What You'll Learn skeleton */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-4/5"></div>
              <div className="h-4 bg-gray-200 rounded w-4/5"></div>
            </div>
          </div>

          {/* Course Information skeleton */}
          <div className="mb-8">
            <div className="h-5 bg-gray-200 rounded w-40 mb-3"></div>
            <div className="flex flex-wrap gap-2">
              <div className="h-7 bg-gray-200 rounded w-24"></div>
              <div className="h-7 bg-gray-200 rounded w-32"></div>
              <div className="h-7 bg-gray-200 rounded w-28"></div>
              <div className="h-7 bg-gray-200 rounded w-20"></div>
            </div>
          </div>

          {/* Course Includes skeleton */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <div className="h-5 bg-gray-200 rounded w-40 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(5)].map((_, idx) => (
                <div key={idx} className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-40"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Course Content Tabs skeleton */}
          <div className="bg-white rounded-lg border border-gray-200">
            {/* Tab Headers skeleton */}
            <div className="border-b border-gray-200">
              <div className="flex space-x-8 px-6">
                {[...Array(4)].map((_, idx) => (
                  <div key={idx} className="py-4">
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tab Content skeleton */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="h-4 bg-gray-200 rounded w-96"></div>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
              </div>

              {/* Course Sections skeleton */}
              <div className="space-y-2">
                {[...Array(5)].map((_, idx) => (
                  <div key={idx} className="rounded-lg">
                    <div className="w-full px-4 py-3 bg-gray-200 rounded-2xl">
                      <div className="h-5 bg-gray-300 rounded w-3/4"></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Collapse button skeleton */}
              <div className="mt-2">
                <div className="h-12 bg-gray-200 rounded-2xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Breadcrumbs */}
      <nav className="text-sm text-gray-500 mb-6 flex items-center">
        <Image src="/images/course-detail/homeIcon.svg" alt="Breadcrumbs" width={16} height={16} className='mr-2' />
        <Link href="/" className="hover:text-gray-700 cursor-pointer">
          Home
        </Link>
        <Image className="mx-2" src="/images/course-detail/arrow-rightLogo.svg" alt="Right Arrow" width={16} height={16} />
        <Link href="/all-courses" className="hover:text-gray-700 cursor-pointer">
          Courses
        </Link>
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

              {/* Course Sections (Topics and Lessons) */}
              <div className="space-y-2">
                {topics.length === 0 && (
                  <div className="text-sm text-gray-500">No topics available</div>
                )}
                {topics.map((topic) => {
                  const topicLessons = lessons.filter((l) => l.topic_id === topic.id);
                  return (
                    <div key={topic.id} className="rounded-lg">
                      <button
                        onClick={() => toggleSection(topic.id)}
                        className="w-full px-4 py-3 text-left bg-black text-white rounded-2xl flex"
                      >
                        <Image src="/images/course-detail/arrow-rightLogo.svg" alt="Arrow Right" width={16} height={16} />
                        <div className="flex items-center space-x-3 flex-row justify-between w-full text-white">
                          <span className="font-medium">{topic.title}</span>
                          <span className="text-sm ">{topicLessons.length} Lessons</span>
                        </div>
                      </button>
                      {expandedSections.has(topic.id) && (
                        <div className="px-4 pb-3 border-t border-gray-200">
                          <div className="pt-3 space-y-2">
                            {topicLessons.length === 0 && (
                              <div className="text-sm text-gray-500">No lessons</div>
                            )}
                            {topicLessons.map((lesson) => (
                              <div key={lesson.id} className="flex items-center justify-between text-sm">
                                <div className='flex items-center space-x-2'>
                                  <Image src="/images/course-detail/video-logo.svg" alt="" width={16} height={16} />
                                  <span className=" text-blue-600 underline">{lesson.title}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'details' && (
            <div className="py-6">
              {(() => {
                const data = learningContent;
                if (!data || !data.learning_content) {
                  return <div className="text-center py-12 text-gray-500">No details available</div>;
                }

                const { course_title, learning_content, content_summary } = data;
                const lessons = learning_content?.lessons ?? [];
                const quizzes = learning_content?.quizzes ?? [];
                const flashcards = learning_content?.flashcards ?? [];
                const memoryGames = learning_content?.memory_games ?? [];
                const topicsLC = learning_content?.topics ?? [];

                return (
                  <div className="prose max-w-none">
                    {course_title && (
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">{course_title}</h2>
                    )}

                    {content_summary && (
                      <div className="flex flex-wrap gap-2 mb-6 not-prose">
                        <span className="px-3 py-1 border border-gray-200 text-gray-700 rounded-sm text-sm">Lessons: {content_summary.total_lessons}</span>
                        <span className="px-3 py-1 border border-gray-200 text-gray-700 rounded-sm text-sm">Quizzes: {content_summary.total_quizzes}</span>
                        <span className="px-3 py-1 border border-gray-200 text-gray-700 rounded-sm text-sm">Flashcards: {content_summary.total_flashcards}</span>
                        <span className="px-3 py-1 border border-gray-200 text-gray-700 rounded-sm text-sm">Mindmaps: {content_summary.total_mindmaps}</span>
                        <span className="px-3 py-1 border border-gray-200 text-gray-700 rounded-sm text-sm">Memory Games: {content_summary.total_memory_games}</span>
                        <span className="px-3 py-1 border border-gray-200 text-gray-700 rounded-sm text-sm">Topics: {content_summary.total_topics}</span>
                      </div>
                    )}

                    <div className="space-y-6">
                      {/* Lessons titles only */}
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">Lessons</h4>
                        {lessons.length === 0 ? (
                          <div className="text-sm text-gray-500">No lessons</div>
                        ) : (
                          <ul className="list-disc pl-5 text-gray-800">
                            {lessons.map((lesson, idx) => (
                              <li key={`${lesson.id ?? 'lesson'}-${idx}`}>{lesson.title}</li>
                            ))}
                          </ul>
                        )}
                      </div>

                      {/* Quizzes titles only */}
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">Quizzes</h4>
                        {quizzes.length === 0 ? (
                          <div className="text-sm text-gray-500">No quizzes</div>
                        ) : (
                          <ul className="list-disc pl-5 text-gray-800">
                            {quizzes.map((q: CourseLearningContentQuizItem, idx: number) => (
                              <li key={`${q.id ?? 'quiz'}-${idx}`}>{q.title}</li>
                            ))}
                          </ul>
                        )}
                      </div>

                      {/* Flashcards titles only (use front as title) */}
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">Flashcards</h4>
                        {flashcards.length === 0 ? (
                          <div className="text-sm text-gray-500">No flashcards</div>
                        ) : (
                          <ul className="list-disc pl-5 text-gray-800">
                            {flashcards.map((fc: CourseLearningContentFlashcardItem, idx: number) => (
                              <li key={`${fc.id ?? 'flashcard'}-${idx}`}>{fc.front}</li>
                            ))}
                          </ul>
                        )}
                      </div>

                      {/* Memory games titles only (use description) */}
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">Memory Games</h4>
                        {memoryGames.length === 0 ? (
                          <div className="text-sm text-gray-500">No memory games</div>
                        ) : (
                          <ul className="list-disc pl-5 text-gray-800">
                            {memoryGames.map((mg: CourseLearningContentMemoryGameItem, idx: number) => (
                              <li key={`${mg.id ?? 'memory'}-${idx}`}>{mg.description}</li>
                            ))}
                          </ul>
                        )}
                      </div>

                      {/* Topics titles only */}
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">Topics</h4>
                        {topicsLC.length === 0 ? (
                          <div className="text-sm text-gray-500">No topics</div>
                        ) : (
                          <ul className="list-disc pl-5 text-gray-800">
                            {topicsLC.map((t: CourseLearningContentTopicItem, idx: number) => (
                              <li key={`${t.id ?? 'topic'}-${idx}`}>{t.title}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}
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
