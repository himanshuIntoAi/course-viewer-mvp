'use client';

import Image from 'next/image';
import { useState } from 'react';
import { HiOutlineBookOpen, HiOutlineAcademicCap } from 'react-icons/hi';

export default function StudentDashboard() {
  const [menuItems] = useState([
    'Dashboard',
    'My Profile',
    'Enrolled Courses',
    'Wishlist',
    'Reviews',
    'Order History',
    'Log out',
  ]);

  return (
    <div className="min-h-screen flex flex-col items-center p-4">
      <div className="max-w-6xl w-full bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Profile Section */}
        <div className="relative w-full h-96">
          <Image
            src="/images/hero.png"
            alt="Background"
            layout="fill"
            objectFit="cover"
            className="rounded-t-2xl"
          />
          <div className="absolute top-[30vh] left-10 bg-white px-4 py-2 rounded-full shadow-lg flex items-center gap-3">
            <div className="w-26 h-24">
              <Image
                src="/images/user-avatar.png"
                alt="User Avatar"
                width={100}
                height={100}
                className="rounded-full border-2 border-white shadow-md"
              />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">John Doe</h2>
              <p className="text-xs text-gray-600">Country: Australia</p>
              <div className="flex items-center gap-2 text-gray-500 text-xs">
                <span>🏆 12 Courses</span>
                <span>📍 5 Locations</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-8 grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="col-span-3 bg-white p-5 rounded-xl shadow-md border border-violet-200">
            <ul className="text-gray-700 space-y-4">
            {menuItems.map((item, index) => (
                <li
                  key={index} // Ensure each item has a unique key
                  className={`p-4 rounded-lg text-sm font-medium cursor-pointer transition border-b border-gray-300 ${
                    index === 0 ? 'bg-violet-100 text-violet-700 font-semibold' : 'hover:bg-violet-100'
                  }`}
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Main Content */}
          <div className="col-span-9">
            <h2 className="text-4xl font-bold text-black mb-10">Dashboard</h2>
            <div className="grid grid-cols-2 gap-10">
              <div className="bg-violet-100 p-6 rounded-xl shadow-md text-center border border-violet-300 space-y-4">
                <HiOutlineBookOpen className="text-blue-700 text-4xl mx-auto mb-2 "/>
                <p className="text-3xl font-extrabold text-blue-400">10</p>
                <p className="text-gray-600 text-lg">Enrolled Courses</p>
              </div>
              <div className="bg-violet-100 p-6 rounded-xl shadow-md text-center border border-violet-300 space-y-4">
                <HiOutlineAcademicCap className="text-blue-700 text-4xl mx-auto mb-2" />
                <p className="text-3xl font-extrabold text-blue-400">3</p>
                <p className="text-gray-600 text-lg">Certificates Earned</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
