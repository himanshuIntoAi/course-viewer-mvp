import React from "react";
import Image from 'next/image';

interface Instructor {
  profile_image?: string;
  display_name?: string;
  title?: string;
  experience?: string;
  expertise?: string;
  achievements?: string[];
  courses?: string[];
}

interface AboutInstructorProps {
  instructor?: Instructor;
}

export default function AboutInstructor({ instructor = {
  display_name: "John Doe",
  title: "Senior Web Designer & UI/UX Expert",
  experience: "10+ years experience | Taught 5,000+ students worldwide.",
  expertise: "Expert in: HTML, CSS, JavaScript, UI/UX, React, WordPress",
  achievements: ["Certified Google UX Designer", "500+ Websites Designed"],
  courses: ["Complete Web Design Bootcamp", "Advanced UI/UX Design with Figma"]
} }: AboutInstructorProps) {
  return (
    <div className="max-w-3xl bg-white rounded-lg shadow-md p-6 mt-10">
      <h2 className="text-2xl font-bold text-indigo-900 mb-6">About Instructor</h2>
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
        
        {/* Instructor Image */}
        <Image 
          src={instructor.profile_image || "/images/user-icon.svg"}
          alt={instructor.display_name || "Instructor"}
          width={100}
          height={100}
          className="rounded-full object-cover"
        />

        {/* Instructor Info */}
        <div className="flex-1">
          {/* Name / Title */}
          <h3 className="text-xl md:text-2xl font-semibold text-gray-800">
            {instructor.display_name} <span className="font-normal">|</span> {instructor.title}
          </h3>
          
          {/* Experience / Expertise */}
          <p className="text-gray-600 mt-2">
            {instructor.experience}
            <br />
            {instructor.expertise}
          </p>

          {/* Achievements */}
          <div className="mt-4">
            <h4 className="flex items-center font-semibold text-gray-700 mb-1">
              <span role="img" aria-label="trophy" className="mr-2">🏆</span>
              Achievements:
            </h4>
            <ul className="text-gray-600 ml-6 list-disc space-y-1">
              {instructor.achievements?.map((achievement, index) => (
                <li key={index}>{achievement}</li>
              ))}
            </ul>
          </div>

          {/* Courses */}
          <div className="mt-4">
            <h4 className="flex items-center font-semibold text-gray-700 mb-1">
              <span role="img" aria-label="books" className="mr-2">📚</span>
              Courses:
            </h4>
            <ul className="text-gray-600 ml-6 list-disc space-y-1">
              {instructor.courses?.map((course, index) => (
                <li key={index}>{course}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
