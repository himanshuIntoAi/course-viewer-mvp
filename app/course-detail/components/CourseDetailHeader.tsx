"use client";

import React from 'react';

const CourseDetailHeader = () => {
  return (
    <header className=" bg-slate-50 shadow-sm  px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
       <img src="/images/course-detail/cloudOuLogo.png" alt="CloudOU Logo" className='w-50 h-10' />
        </div>

        {/* Search Bar */}
        {/* <div className="flex-1 max-w-2xl mx-8">
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl">🔍</span>
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div> */}

        {/* Right Side */}
        <div className="flex items-center space-x-6">
          <button className="px-4 py-2 text-gray-700 hover:text-blue-600 transition-colors shadow-sm border border-gray-300 rounded-md text-sm">
            Dashboard
          </button>
          
          <button className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors">
            <img src="/images/course-detail/bellIcon.svg" alt="Notification Bell" className='border-2 border-gray-300 rounded-full p-2' />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User Profile */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-300 rounded-full overflow-hidden">
              <img
                src="/images/user-avatar.png"
                alt="User Avatar"
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
            <img src="/images/course-detail/downArrowIcon.svg" alt="Down Arrow" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default CourseDetailHeader;
