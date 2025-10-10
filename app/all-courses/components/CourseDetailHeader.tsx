"use client";

import React, { useState } from 'react';
import Image from 'next/image';

interface CourseDetailHeaderProps {
  onSearchChange?: (query: string) => void;
  searchQuery?: string;
}

const CourseDetailHeader = ({ onSearchChange, searchQuery = "" }: CourseDetailHeaderProps) => {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  return (
    <header className=" bg-slate-50 shadow-sm  px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <Image src="/images/course-detail/cloudOuLogo.png" alt="CloudOU Logo" width={200} height={40} className='w-50 h-10' />
        </div>

        {/* Search Bar */}
       
          <div className="flex border min-w-[35vw] justify-between min-w-2xl bg-white items-center p-1 border-gray-300 rounded-lg ">
            <div className='flex min-w-2xl' >
              <Image src={"/images/course-catalog/search-icon.svg"} className='bg-white rounded-lg' width={40} height={10} alt='' />
              <input
                type="text"
                placeholder="Search..."
                value={localSearchQuery}
                onChange={(e) => {
                  setLocalSearchQuery(e.target.value);
                  onSearchChange?.(e.target.value);
                }}
                className="w-[30vw] pl-2 rounded-lg pr-4 py-2 focus:outline-none "
              />
            </div>
            <p className='text-gray-500' >Ctrl + K</p>
          </div>
       
        {/* Right Side */}
        <div className="flex items-center space-x-6">
          <button className="px-4 py-2 text-gray-700 hover:text-blue-600 transition-colors shadow-sm border border-gray-300 rounded-md text-sm">
            Dashboard
          </button>

          <button className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors">
            <Image src="/images/course-catalog/bell-icon.svg" alt="Notification Bell" width={40} height={24} className='border-2 border-gray-300 rounded-full p-1' />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <button className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors">
            <Image src="/images/course-catalog/sun-icon.svg" alt="Notification Bell" width={44} height={24} className='border-2 border-gray-300 rounded-full p-1' />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <button className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors">
            <Image src="/images/course-catalog/cart-icon.svg" alt="Notification Bell" width={44} height={24} className='border-2 border-gray-300 rounded-full p-2' />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User Profile */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-300 rounded-full overflow-hidden">
              <Image
                src="/images/user-avatar.png"
                alt="User Avatar"
                width={40}
                height={40}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNEM0Q3RDEiLz4KPHBhdGggZD0iTTIwIDEwQzIyLjA3NjEgMTAgMjQgMTEuOTIzOSAyNCAxNEMyNCAxNi4wNzYxIDIyLjA3NjEgMTggMjAgMThDMTcuOTIzOSAxOCAxNiAxNi4wNzYxIDE2IDE0QzE2IDExLjkyMzkgMTcuOTIzOSAxMCAyMCAxMFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTI4IDMwQzI4IDI2LjY4NiAyNC40MTQgMjQgMjAgMjRDMTUuNTg2IDI0IDEyIDI2LjY4NiAxMiAzMEgyOFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';
                }}
              />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">Emaillia Caitin</p>
              <p className="text-xs text-gray-500">heycaitin@gmail.com</p>
            </div>
            <Image src="/images/course-detail/downArrowIcon.svg" alt="Down Arrow" width={16} height={16} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default CourseDetailHeader;
