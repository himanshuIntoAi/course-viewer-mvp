"use client"
import Navbar from "@/components/navbar/navbar";
import CourseDetails from "@/components/course-details/course-details";
import React, { useEffect, useState } from 'react'
import Footer from "@/components/footer/footer";
import { useParams } from "next/navigation";
import axios from "axios";
import { fetchCourseData } from "@/services/api/course/api";
const page = () => {
  const [course, setCourse] = useState({});
  const params = useParams();
  const courseId = String(params.id); 


  const fetchCourseData = async () => {   
    const courseData = await axios.get(`https://cou-ip-bkend-dev.vercel.app/api/v1/courses/${courseId}`);
    setCourse(courseData.data);
  }

  useEffect( () => {
    fetchCourseData();
  }, [courseId]);
  console.log(course);

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