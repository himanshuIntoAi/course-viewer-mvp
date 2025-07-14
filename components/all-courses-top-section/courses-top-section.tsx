"use client"
import React from 'react';
import { Search, Filter, SparklesIcon } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';
// import heroImage from '../public/explore_course_images/redesigned-hero-image-removebg-preview.png';

interface CoursesTopSectionProps {
  onSearch: (query: string) => void
}

export const CoursesTopSection: React.FC<CoursesTopSectionProps> = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    onSearch(value)
  }

  return (
    <div className=" relative overflow-hidden">
      <div className="container mx-auto px-4 py-12">
        <div className="flex">
          {/* Left side - Image with curved background */}
          <div className="w-1/3 relative">
            <div className="relative">
              {/* Curved background shape */}
              <div className="absolute w-[400px] h-[400px]">
                <div className="relative w-full h-full" style={{display: 'flex', alignItems: 'center' , position: 'relative'}}>
                  {/* Outer curve - navy blue */}
                  <img src="/images/Ellipse 2.png" alt="hero-image-courses"  style={{position: 'absolute', top: '32px', left: '68px', zIndex: 101, transform: 'rotate(8deg)'}} />
                  <img src="/images/Ellipse 1.png" alt="hero-image-courses"  style={{position: 'absolute', top: '-5px', left: '0', transform: 'rotate(-6deg)', scale: '0.7'}} />
                  <img src="/images/Ellipse 3.png" alt="hero-image-courses"  style={{position: 'absolute', zIndex: 100, top: '32px', left: '54px' }} />
                </div>
              </div>

              {/* Person image */}
              <img

                src="/images/hero-image-courses.png"
                style={{ width: '100%', height: '100%' }}
                alt="Course instructor"
                className="relative z-[] w-[300px] h-auto"
              />
            </div>
          </div>

          {/* Right side - Text and AI assistance */}
          <div className="w-2/3 pl-8 pt-12">
            <h1 className="text-[#16197C] text-5xl font-bold mb-4">
              All Courses
            </h1>
            <p className="text-gray-700 text-xl mb-8">
              Courses that help designers become true unicorns
            </p>

            {/* AI Assistance Section */}
            <div className="mt-8 bg-white rounded-lg p-4">
              <h3 className="text-gray-800 text-xl font-medium mb-4">
                Ask our AI assistance
              </h3>
              <div className="flex gap-4">
                {/* AI suggestion chips */}
                {['I want to learn phyton', 'I want to learn phyton', 'I want to learn phyton'].map((text, index) => (
                  <button
                    key={index}
                    className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <SparklesIcon className="w-5 h-5 text-yellow-400" />
                    <span className="text-gray-700">{text}</span>
                  </button>
                ))}
              </div>
            </div>



            
          </div>
        </div>
      </div>

      {/* Decorative stars */}
      <div className="absolute top-4 right-4 text-gray-300">★</div>
      <div className="absolute top-1/2 right-8 text-gray-300">★</div>
      <div className="absolute bottom-8 left-1/4 text-gray-300">★</div>
    </div>
  )
} 