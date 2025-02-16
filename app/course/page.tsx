"use client"
import Navbar from "@/components/navbar/navbar";
import CourseDetails from "@/components/course-details/course-details";
import React, { useEffect, useState } from 'react'
import Footer from "@/components/footer/footer";
import { fetchData } from "@/services/api";

const page = () => {
  const [course, setCourse] = useState({});

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const courseData = await fetchData("courses/1");
        setCourse(courseData);
      } catch (error) {
        console.error("Failed to fetch course data:", error);
      }
    };

    fetchCourseData();
  }, []);

  return (
    <div className="relative from-[#E4F7F7] to-white">
      <img src="/design-left.svg" alt="" className="absolute top-0 left-0 w-1/6 z-[1]" />
      <img src="/design-right.svg" alt="" className="absolute top-0 right-0 w-1/6 z-[1]" />
      <Navbar />
      <div className="pt-[60px]">
        <CourseDetails course={course} />
      </div>
      <img src="/curved-line.png" alt="" className="w-full h-auto mt-40" />
      <Footer />
    </div>
  );
}

export default page;