import React from "react";

export default function AboutInstructor() {
  return (
    <div className="max-w-3xl bg-white rounded-lg shadow-md p-6 mt-10">
      <h2 className="text-2xl font-bold text-indigo-900 mb-6">About Instructor</h2>
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
        
        {/* Instructor Image */}
        <img
          src="https://via.placeholder.com/200x200.png" // Replace with actual instructor image
          alt="Instructor"
          className="w-40 h-40 object-cover rounded-full"
        />

        {/* Instructor Info */}
        <div className="flex-1">
          {/* Name / Title */}
          <h3 className="text-xl md:text-2xl font-semibold text-gray-800">
            John Doe <span className="font-normal">|</span> Senior Web Designer &amp; UI/UX Expert
          </h3>
          
          {/* Experience / Expertise */}
          <p className="text-gray-600 mt-2">
            10+ years experience | Taught 5,000+ students worldwide.
            <br />
            Expert in: HTML, CSS, JavaScript, UI/UX, React, WordPress
          </p>

          {/* Achievements */}
          <div className="mt-4">
            <h4 className="flex items-center font-semibold text-gray-700 mb-1">
              <span role="img" aria-label="trophy" className="mr-2">🏆</span>
              Achievements:
            </h4>
            <ul className="text-gray-600 ml-6 list-disc space-y-1">
              <li>Certified Google UX Designer</li>
              <li>500+ Websites Designed</li>
            </ul>
          </div>

          {/* Courses */}
          <div className="mt-4">
            <h4 className="flex items-center font-semibold text-gray-700 mb-1">
              <span role="img" aria-label="books" className="mr-2">📚</span>
              Courses:
            </h4>
            <ul className="text-gray-600 ml-6 list-disc space-y-1">
              <li>Complete Web Design Bootcamp</li>
              <li>Advanced UI/UX Design with Figma</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
