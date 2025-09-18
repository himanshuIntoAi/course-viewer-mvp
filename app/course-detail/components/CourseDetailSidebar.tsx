"use client";

import React, { useState } from 'react';
import Image from 'next/image';

const CourseDetailSidebar = () => {
  const [isOpenTab, setIsOpenTab] = useState('courseCatalog');
  return (
    <aside className="w-96 bg-slate-50 shadow-sm  px-4 py-6">
      {/* New Course Button */}
      <div className='flex justify-between items-center space-x-2 mb-8 border rounded-lg p-3 w-60 mx-auto bg-white'>
        <input type="text" placeholder="Search..." className=" border-none outline-none placeholder:text-black :placeholder:text-sm text-sm :pl-3 text-gray-50" />
        <Image src="/images/course-detail/searchIcon.svg" alt="Search" width={20} height={20} />
      </div>

      <button className="w-60 bg-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-purple-700 transition-colors mb-8 mx-auto block" style={{
        background: 'linear-gradient(90deg, #6F15FF 0%, #C749FF 100%)'
      }}>
        + New Course
      </button>

      {/* LEARN Section */}
      <div className="mb-8 mx-auto w-60">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
          LEARN
        </h3>
        <nav className="space-y-2">
          <a
            href="#"
            className={`flex items-center space-x-3 px-3 py-2 text-gray-900 rounded-lg ${isOpenTab === 'courseCatalog' ? 'bg-gray-200 text-black font-bold' : ''}`}
            onClick={() => setIsOpenTab('courseCatalog')}
          >
            <Image className="" src="/images/course-detail/courseCataloglogo.svg" alt="Course Catalog" width={20} height={20} />
            <span>Course Catalog</span>
          </a>
          <a
            href="#"
            className={`flex items-center space-x-3 px-3 py-2 text-gray-700 hover:text-gray-900 rounded-lg transition-colors ${isOpenTab === 'findMentor' ? 'bg-gray-200 text-black font-bold' : ''}`}
            onClick={() => setIsOpenTab('findMentor')}
          >
            <Image className="" src="/images/course-detail/findMentorPage.svg" alt="Find Mentor" width={20} height={20} />
            <span>Find Mentor</span>
          </a>
          <a
            href="#"
            className={`flex items-center space-x-3 px-3 py-2 text-gray-700 hover:text-gray-900 rounded-lg transition-colors ${isOpenTab === 'careerTools' ? 'bg-gray-200 text-black font-bold' : ''}`}
            onClick={() => setIsOpenTab('careerTools')}
          >
            <Image className="" src="/images/course-detail/careerToolslogo.svg" alt="Career Tools" width={20} height={20} />
            <span>Career Tools</span>
           
          </a>
        </nav>
      </div>

      {/* DISCOVER Section */}
      <div className='mx-auto w-60'>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
          DISCOVER
        </h3>
        <nav className="space-y-2">
          <a
            href="#"
            className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors ${isOpenTab === 'chatHistory' ? 'bg-gray-200 text-black font-bold' : ''}"
            onClick={() => setIsOpenTab('chatHistory')}
          >
            <Image className="" src="/images/course-detail/chatHistorylogo.svg" alt="Chat History" width={20} height={20} />
            <span>Chat History</span>
          </a>
          <a
            href="#"
            className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors ${isOpenTab === 'marketplace' ? 'bg-gray-200 text-black font-bold' : ''}"
            onClick={() => setIsOpenTab('marketplace')}
          >
            <Image className="" src="/images/course-detail/marketplacelogo.svg" alt="Marketplace" width={20} height={20} />
            <span>Marketplace</span>
          </a>
          <a
            href="#"
            className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors ${isOpenTab === 'library' ? 'bg-gray-200 text-black font-bold' : ''}"
            onClick={() => setIsOpenTab('library')}
          >
            <Image className="" src="/images/course-detail/librarylogo.svg" alt="Library" width={20} height={20} />
            <span>Library</span>
          </a>
          <a
            href="#"
            className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors ${isOpenTab === 'projects' ? 'bg-gray-200 text-black font-bold' : ''}"
            onClick={() => setIsOpenTab('projects')}
          >
            <Image className="" src="/images/course-detail/projectslogo.svg" alt="Projects" width={20} height={20} />
            <span>Projects</span>
          </a>
          <a
            href="#"
            className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <Image src="/images/course-detail/assetsLogo.svg" alt="Assets" width={20} height={20} />
            <span>Assets</span>
          </a>
          <a
            href="#"
            className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors ${isOpenTab === 'careerAI' ? 'bg-gray-200 text-black font-bold' : ''}"
            onClick={() => setIsOpenTab('careerAI')}
          >
            <Image className="" src="/images/course-detail/careerToolslogo.svg" alt="Career AI" width={20} height={20} />
            <span>Career AI</span>
          </a>
        </nav>
      </div>
    </aside>
  );
};

export default CourseDetailSidebar;
