"use client";
import React, { useState } from "react";
import Image from "next/image";
import "../TrendingCourses/style.css"; // Import your CSS file for the loader
// Example data for the five tabs
const TABS = [
  { name: "AI&ML" },
  { name: "Data Engineering" },
  { name: "Cyber Security" },
  { name: "DevOps" },
  { name: "Backend Development" },
];

// Example course data for demonstration
// You could store separate data per tab or fetch dynamically.
const ALL_COURSES = [
  {
    title: "Introduction to AI&ML",
    image: "/ai-ml.jpeg", // replace with your own image path
    badge: "H",
    description:
      "This is the future of technology where every aspect of the human life is associated with AI to perform any activities.",
  },
  {
    title: "Introduction to AI&ML",
    image: "/ai-ml.jpeg",
    badge: "H",
    description:
      "This is the future of technology where every aspect of the human life is associated with AI to perform any activities.",
  },
  {
    title: "Introduction to AI&ML",
    image: "/ai-ml.jpeg",
    badge: "H",
    description:
      "This is the future of technology where every aspect of the human life is associated with AI to perform any activities.",
  },
  {
    title: "Introduction to AI&ML",
    image: "/ai-ml.jpeg",
    badge: "H",
    description:
      "This is the future of technology where every aspect of the human life is associated with AI to perform any activities.",
  },
];

const TrendingCourses = () => {
  // Track active tab (0 => "AI&ML", 1 => "Data Engineering", etc.)
  const [activeTab, setActiveTab] = useState(0);

  // Mock carousel index (which "page" of cards we're on)
  const [currentSlide, setCurrentSlide] = useState(0);

  // For a real app, you might filter courses by tab.
  // This example always shows the same courses array for every tab, 
  // but you could do something like:
  // const displayedCourses = ALL_COURSES.filter( c => c.category === TABS[activeTab].name )
  // or store separate course arrays for each tab.
  const displayedCourses = ALL_COURSES;

  // Suppose you want 3 courses visible, so
  // if you have 6 total courses, you'll have 2 pages in the "slider"
  const itemsPerSlide = 3;

  // Slice out the courses for the current slide only
  const startIndex = currentSlide * itemsPerSlide;
  const endIndex = startIndex + itemsPerSlide;
  const coursesToRender = displayedCourses.slice(startIndex, endIndex);

  return (
    <div className="relative w-full py-12 px-4 md:px-16">
      {/* Top header / hero area */}
      <div className="flex items-center justify-between mb-8 relative">
        <div className="w-full flex flex-col gap-4 items-center justify-center">
          <div className="flex items-center justify-center gap-2 text-indigo-500 mb-2">
            {/* Star icon or emoji */}
            <span className="text-xl text-center">⭐</span>
            <span className="text-sm text-center">Latest courses brewed by industrial experts</span>
          </div>
          <h1 className="text-4xl md:text-5xl text-center font-bold text-gray-800 leading-tight">
            We Provide The Trend
          </h1>
        </div>
        {/* Optional fun graphic on the right */}
        <div className="relative w-60 h-60 hidden md:block">
          <Image
            src="/Astronout-logo.svg"
            alt="Astronaut"
            fill
            className="object-contain scale-150"
            priority
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-6 border-b border-indigo-700 mb-6">
        {TABS.map((tab, index) => (
          <button
            key={index}
            onClick={() => {
              setActiveTab(index);
              setCurrentSlide(0); // reset slider when switching tabs
            }}
            className={`px-4 py-2 w-1/4 mb-1 text-sm font-semibold 
              ${
                activeTab === index
                  ? "bg-indigo-800 text-white rounded-md"
                  : "text-indigo-800"
              }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* Course Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {coursesToRender.map((course, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl shadow-md overflow-hidden relative"
          >
            <div className="relative h-48">
              <Image
                src="https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y291cnNlc3xlbnwwfHwwfHx8MA%3D%3D"
                alt={course.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              {/* Circular badge in top-right */}
              <div className="absolute top-3 right-3 bg-orange-500 text-white text-sm w-8 h-8 rounded-full flex items-center justify-center font-bold">
                {course.badge}
              </div>
            </div>
            <div className="p-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                {course.title}
              </h2>
              <p className="text-gray-600 text-sm mb-4">
                {course.description}
              </p>
              <button className="bg-teal-500 text-white px-4 py-2 rounded-md font-semibold hover:bg-teal-600">
                Learn Now!
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Slider Dots / Pagination */}
      <div className="flex items-center justify-center space-x-2">
      <div className="loader"></div>
      </div>
    </div>
  );
};

export default TrendingCourses;
