'use client';

import Image from 'next/image';
import { useState } from 'react';
import { HiOutlineBookOpen, HiOutlineAcademicCap } from 'react-icons/hi';

export default function MentorDashboard() {
  const [menuItems] = useState([
    'Dashboard',
    'Courses',
    'Reviews'
  ]);

  return (
    <div className="min-h-screen flex flex-col items-center p-6">
      <div className="max-w-7xl w-full bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Profile Section */}
        <div className="relative w-full h-96">
          <Image
            src="/images/hero.png"
            alt="Background"
            layout="fill"
            objectFit="cover"
            className="rounded-t-2xl"
          />
          <div className="relative top-[30vh] left-10 w-[25vw] bg-white px-4 py-2 rounded-full shadow-lg flex items-center gap-3">
            <div className="w-26 h-24">
              <Image
                src="/images/user-avatar.png"
                alt="Mentor Avatar"
                width={100}
                height={100}
                className="rounded-full border-2 border-white shadow-md"
              />
            </div>
            <div className=''>
              <h2 className="text-sm font-bold text-gray-900">Claudia Pruit</h2>
              <p className="text-xs text-gray-600">Country: Australia • Age: 30</p>
              <p className="text-xs text-gray-500">Publications &amp; Linguistics</p>
            </div>
          </div>
          <div className="absolute top-[40vh] right-10 flex items-center gap-2 bg-teal-500 text-white px-4 py-2 rounded-full shadow-md">
            <Image src="/images/badge-check.png" alt="Verified Badge" width={20} height={20} />
            <span>Mentor</span>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-8 grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="col-span-3 bg-white p-5 rounded-xl shadow-md border border-gray-200">
            <ul className="space-y-4 text-gray-700">
              {menuItems.map((item, index) => (
                <li
                  key={index}
                  className={`p-3 rounded-lg text-sm font-medium cursor-pointer transition flex items-center justify-between border-b ${
                    index === 0 ? 'bg-violet-100 text-violet' : 'hover:bg-violet-100'
                  }`}
                >
                  {item}
                </li>
              ))}
            </ul>

            {/* Additional Sidebar Section */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg shadow-sm">
              <h3 className="text-md font-semibold text-gray-800">Hire 1-on-1 Mentor?</h3>
              <p className="text-sm text-gray-600 mt-1">Let Mentor know how he/she can help you.</p>

              {/* New Input Field for Help Description */}
              <textarea
                className="w-full p-2 mt-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Type your request here..."
                rows={3}
              ></textarea>

              {/* Payment Input Field */}
              <div className="mt-3">
                <label className="text-xs text-gray-600">How much can you pay?</label>
                <input 
                  type="text" 
                  className="w-full p-2 mt-1 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="$"
                />
              </div>

              <button className="mt-4 w-25 bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600">
                Request
              </button>
            </div>
          </div>


          {/* Main Content */}
          <div className="col-span-9">
            <h2 className="text-4xl font-bold text-black mb-10">Dashboard</h2>
            <div className="grid grid-cols-2 gap-10">
              <div className="bg-violet-100 p-6 rounded-xl shadow-md text-center border border-violet-300 space-y-4">
                <HiOutlineBookOpen className="text-blue-700 text-4xl mx-auto mb-2 "/>
                <p className="text-3xl font-extrabold text-blue-700">10</p>
                <p className="text-gray-600 text-lg">Courses Created</p>
              </div>
              <div className="bg-violet-100 p-6 rounded-xl shadow-md text-center border border-violet-300 space-y-4">
                <HiOutlineAcademicCap className="text-blue-700 text-4xl mx-auto mb-2" />
                <p className="text-3xl font-extrabold text-blue-700">3</p>
                <p className="text-gray-600 text-lg">Mentees</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
