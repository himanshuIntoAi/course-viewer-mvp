"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import CourseTabs from "../course-details-tabs/course-details-tabs";
import AboutInstructor from "../about-instructor/AboutInstructor";
import ReviewSection from "../review-section/review-section";
import MoreCoursesPage from "../more-courses/more-courses";
import CourseCard from "../course-card/course-card";
import CourseCart from "../course-cart/course-cart";
import axios from "axios";
import { Course } from '@/services/types/course/course';

interface CourseDetailsProps {
  course: Course;
}

const CourseDetails: React.FC<CourseDetailsProps> = ({ course }) => {
  const [openSections, setOpenSections] = useState({});
  const [showCart, setShowCart] = useState(false);
  // For toggling "Show More"/"Show Less" in the small section at the bottom
  const [isExpanded, setIsExpanded] = useState(true);

  // For switching between the four tabs
  const [activeTab, setActiveTab] = useState(0);
  const toggleSection = (section: string) => {
    setOpenSections((prev: { [key: string]: boolean }) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Our example tab labels
  const tabs = ["Course Content", "Details", "About Instructor", "Reviews"];


  // Example sections (to display under "Course Content" tab)
  const sections = [
    {
      title: "Introduction to Web Design",
      lessons: [
        { title: "What is Webflow", duration: "5.22" },
        { title: "Exercise: Meet Your Classmates & Instructor", duration: "7.00" },
        { title: "Webflow Teaser", duration: "12.00" },
      ],
    },
    {
      title: "Introduction to HTML",
      lessons: [],
    },
    {
      title: "Advanced Topics",
      lessons: [],
    },
  ];


  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-between mx-auto p-16">
        <CourseCart showCart={showCart} setShowCart={setShowCart} />
        {/* LEFT SECTION */}
        <div className="w-[60%]">
          <div>
            <h2 className="text-4xl font-bold text-indigo-900 mb-4">
              { course ? course?.title : "Complete Web Design Course"}
            </h2>
            <p className="text-gray-700 mb-4 text-xl">
              {course ? course?.description : "Become a full stack web developer with just one course HTMl CSS and JavaScript "}
            </p>

            <div className="grid grid-cols-3 gap-4 text-center bg-blue-50 text-gray-700 border-teal-400 border-2 rounded-md w-[80%]">
              <div className="flex p-4 rounded-lg">
                <img
                  src="/growth_svgrepo.com.svg"
                  alt="Skill Level"
                  className="w-10 h-10 mr-2"
                />
                <div className="flex flex-col items-start">
                  <p className="font-semibold">Skill Level</p>
                  <p>Beginners</p>
                </div>
              </div>
              <div className="flex p-4 rounded-lg">
                <img
                  src="/time_svgrepo.com.svg"
                  alt="Time"
                  className="w-10 h-10 mr-2"
                />
                <div className="flex flex-col items-start">
                  <p className="font-semibold">Time</p>
                  <p>7 hours</p>
                </div>
              </div>
              <div className="flex p-4 rounded-lg">
                <img
                  src="/list-up_svgrepo.com.svg"
                  alt="Prerequisites"
                  className="w-10 h-10 mr-2"
                />
                <div className="flex flex-col items-start">
                  <p className="font-semibold">Prerequisites</p>
                  <p>None</p>
                </div>
              </div>
            </div>
            {/* About this Course */}
            <div className="mt-10 rounded-lg mb-6">
              <h3 className="text-xl text-indigo-900 mb-2 font-bold">
                About this Course
              </h3>
              <p className="text-gray-700 text-sm w-[90%]">
                Web design is essential to bringing a website to life and creating
                the experience that you want for your end users. Our web design
                courses will help you polish your HTML and CSS skills while learning
                about color design, navigation design, and more.
              </p>
            </div>
          </div>
          <CourseTabs />


          {/* ================================ WHAT WILL YOU LEARN ================================ */}
          <section className="max-w-4xl text-gray-800 mt-10">
            {/* What you will Learn */}

            {/* Details */}
            <div className="shadow-[0_0_5px_rgba(0,0,0,0.2)] p-4 rounded-lg" >
              <h2 className="text-2xl font-bold  text-indigo-900 mb-4">Details</h2>
              <section>
                <h2 className="text-xl font-bold text-black mb-4">What you will Learn</h2>
                <ul className="space-y-1 ml-14">
                  <li>
                    <span className="font-semibold text-indigo-900">HTML :</span>
                    &nbsp;The standard markup language for creating web pages
                  </li>
                  <li>
                    <span className="font-semibold text-indigo-900">CSS :</span>
                    &nbsp;Used to style web pages
                  </li>
                  <li>
                    <span className="font-semibold text-indigo-900">JavaScript :</span>
                    &nbsp;Used to make web pages interactive
                  </li>
                  <li>
                    <span className="font-semibold text-indigo-900">Browser plugins :</span>
                    &nbsp;Can help with web development
                  </li>
                  <li>
                    <span className="font-semibold text-indigo-900">Bootstrap :</span>
                    &nbsp;Can help create responsive web pages
                  </li>
                  <li>
                    <span className="font-semibold text-indigo-900">CMS templates :</span>
                    &nbsp;Can help with web development
                  </li>
                  <li>
                    <span className="font-semibold text-indigo-900">Static website generators :</span>
                    &nbsp;Can help with web development
                  </li>
                </ul>
              </section>


              {/* Course Requirements */}
              <h3 className="text-xl font-semibold text-black mb-2 mt-5">Course Requirements</h3>
              <p className="mb-3">
                Before enrolling in a web designing course, you may need:
              </p>
              <div className="mb-8 ml-14">

                <ul className="list-disc list-outside ml-5 space-y-2">
                  <li>
                    <span className="font-semibold">Basic Computer Knowledge :-</span> Familiarity with using a computer and the internet.
                  </li>
                  <li>
                    <span className="font-semibold">Understanding of Design Principles (optional) :-</span> Some courses may expect a basic sense of aesthetics.
                  </li>
                  <li>
                    <span className="font-semibold">No Coding Experience Required :-</span> Most beginner courses start from scratch.
                  </li>
                  <li>
                    <span className="font-semibold">A Computer/Laptop :-</span> To practice designing and coding.
                  </li>
                  <li>
                    <span className="font-semibold">Internet Connection :-</span> For accessing course materials and tools.
                  </li>
                  <li>
                    <span className="font-semibold">Web Browser &amp; Text Editor :-</span> Chrome, VS Code, or any preferred tools.
                  </li>
                </ul>
              </div>

              {/* Course Description */}
              <h3 className="text-xl font-semibold text-black mb-2 mt-5">Course Description</h3>
              <p>
                This course teaches the fundamentals of web design, helping you create modern,
                responsive, and visually appealing websites.
              </p>


              {/* Who is this Course For? */}
              <h3 className="text-xl font-semibold text-black mb-2 mt-5">Who is This Course For?</h3>

              <div className="mb-8 ml-14">
                <ul className="list-disc list-outside ml-5 space-y-2">
                  <li>Beginners wanting to learn web design from scratch.</li>
                  <li>Business owners looking to create their own websites.</li>
                  <li>Freelancers or professionals upgrading their skills.</li>
                  <li>Anyone interested in front-end web development.</li>
                </ul>
              </div>

            </div>
          </section>
          <AboutInstructor />
          <ReviewSection />

        </div>
        {/* RIGHT SECTION (SIDEBARS) */}
        <CourseCard course={course} setShowCart={setShowCart} />
        
      </div>
      <img src="/certificate.png" alt="Course Details" className="w-[90%] mx-auto h-auto" />
      <MoreCoursesPage />
    </div>
  );
};

export default CourseDetails;
