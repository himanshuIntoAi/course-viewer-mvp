"use client"
import Navbar from "@/components/navbar/navbar";
import CourseDetails from "@/components/course-details/course-details";
import React, { useEffect, useState, useCallback } from 'react';
import Footer from "@/components/footer/footer";
import { useParams } from "next/navigation";
import { Course } from "@/services/types/course/course";
import { getCourseData } from "@/services/api/course/api";

const Page = () => {
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const params = useParams();
  const courseId = String(params.id);


  
  const fetchCourseData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const courseData = await getCourseData(Number(courseId));
      setCourse(courseData);
    } catch (err) {
      console.error('Error fetching course:', err);
      setError('Failed to load course details');
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchCourseData();
  }, [fetchCourseData]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Course not found</div>
      </div>
    );
  }

  return (
    <div className="relative from-[#E4F7F7] to-white">
      <img 
        src="/design-left.svg" 
        alt="" 
        className="absolute top-0 left-0 w-1/6 z-[1]" 
      />
      <img 
        src="/design-right.svg" 
        alt="" 
        className="absolute top-0 right-0 w-1/6 z-[1]" 
      />
      <Navbar />
      <div className="pt-[60px]">
        <CourseDetails course={course} />
      </div>
      <img 
        src="/curved-line.png" 
        alt="" 
        className="w-full h-auto mt-40" 
      />
      <Footer />
    </div>
  );
};

export default Page;