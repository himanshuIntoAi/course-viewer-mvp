import React, { useState } from "react";

const sampleData = [
  {
    title: "Introduction to Web Design",
    isExpanded: true,
    lessons: [
      { title: "What is webflow", duration: "5.22" },
      { title: "Exercise: Meet Your Classmates & Instructor", duration: "7.00" },
      { title: "Webflow Teaser", duration: "12.00" },
      { title: "Exercise: Meet Your Classmates & Instructor", duration: "14.00" },
      { title: "Webflow Teaser", duration: "23.00" },
    ],
  },
  {
    title: "Introduction to Html",
    isExpanded: false,
    lessons: [],
  },
  {
    title: "Introduction to Html",
    isExpanded: false,
    lessons: [],
  },
  {
    title: "Introduction to Html",
    isExpanded: false,
    lessons: [],
  },
  {
    title: "Introduction to Html",
    isExpanded: false,
    lessons: [],
  },
];

export default function CourseTabs() {
  // Tab state: 0 => Content, 1 => Details, 2 => Instructor, 3 => Reviews
  const [activeTab, setActiveTab] = useState(0);
  // Accordion state
  const [modules, setModules] = useState(sampleData);

  const handleToggle = (index: number) => {
    setModules((prev) =>
      prev.map((mod, i) =>
        i === index ? { ...mod, isExpanded: !mod.isExpanded } : mod
      )
    );
  };

  return (
    <div className="max-w-3xl">
      {/* Tabs */}
      <div className="flex border-b mb-6">
        {["Content", "Details", "Instructor", "Reviews"].map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            className={`px-4 py-2 text-sm font-semibold border border-gray-300 w-[25%]
              ${activeTab === i ? "text-indigo-600 border-blue-900 rounded-[3px] rounded-tr-[5px]   border-l-4 border bg-[#F5F5FF]" : "text-gray-500"}
            `}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}
      {activeTab === 0 && (
        <div className="bg-white rounded-lg shadow-sm">
          {modules.map((mod, index) => (
            <div key={index} className="mb-2">
              <div
                className="flex justify-between items-center bg-gray-100 p-3 rounded-[10px] cursor-pointer"
                onClick={() => handleToggle(index)}
              >
                <h3 className="font-medium">{mod.title}</h3>
                <span className="text-xl">
                  {mod.isExpanded ? "▴" : "▾"}
                </span>
              </div>
              {mod.isExpanded && mod.lessons.length > 0 && (
                <div className="bg-white border-l-4 border-teal-200 p-4">
                  {mod.lessons.map((lesson, i) => (
                    <div
                      key={i}
                      className="flex justify-between text-sm mb-2"
                    >
                      <p>{lesson.title}</p>
                      <p className="text-teal-500">{lesson.duration}</p>
                    </div>
                  ))}
                </div>
              )}
              {/* If expanded but no lessons */}
              {mod.isExpanded && mod.lessons.length === 0 && (
                <div className="bg-white border-l-4 border-teal-200 p-4 text-sm text-gray-500">
                  No lessons available.
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 1 && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <p className="text-gray-600">Details tab content goes here...</p>
        </div>
      )}
      {activeTab === 2 && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <p className="text-gray-600">Instructor tab content goes here...</p>
        </div>
      )}
      {activeTab === 3 && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <p className="text-gray-600">Reviews tab content goes here...</p>
        </div>
      )}
    </div>
  );
}
