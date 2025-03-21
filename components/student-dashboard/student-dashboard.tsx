'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { HiOutlineBookOpen, HiOutlineAcademicCap } from 'react-icons/hi';
import { useSearchParams } from 'next/navigation';

interface User {
  user_id: number;
  display_name: string;
  email: string;
  profile_image: string;
  is_student: boolean;
  is_instructor: boolean;
  country?: string;
  courses_enrolled?: number;
  locations?: string[];
}

export default function StudentDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const searchParams = useSearchParams();
  const [menuItems] = useState([
    'Dashboard',
    'My Profile',
    'Enrolled Courses',
    'Wishlist',
    'Reviews',
    'Order History',
    'Log out',
  ]);

  useEffect(() => {
    // First check URL parameters
    const token = searchParams.get('token');
    const userParam = searchParams.get('user');

    if (token && userParam) {
      try {
        // Store token and user data
        localStorage.setItem('access_token', token);
        const userData = JSON.parse(userParam);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        
        // Clean up URL parameters after storing them
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      } catch (error) {
        console.error("Failed to process URL parameters", error);
      }
    } else {
      // If no URL parameters, try localStorage
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        } catch (error) {
          console.error("Failed to parse user from localStorage", error);
        }
      }
    }
  }, [searchParams]);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center p-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="col-span-3">
            <div className="bg-white p-6 rounded-xl shadow-md">
              {/* Profile Section */}
              <div className="text-center mb-6">
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <Image
                    src={user.profile_image || "/images/default-avatar.png"}
                    alt="Profile"
                    layout="fill"
                    className="rounded-full"
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">{user.display_name}</h3>
                <p className="text-gray-500">{user.email}</p>
                <p className="text-gray-500">{user.country || 'Location not set'}</p>
              </div>

              {/* Quick Stats */}
              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Courses Enrolled</span>
                  <span className="font-semibold">{user.courses_enrolled || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Locations</span>
                  <span className="font-semibold">{user.locations?.length || 0}</span>
                </div>
              </div>

              {/* Menu */}
              <ul className="space-y-2">
                {menuItems.map((item, index) => (
                  <li
                    key={item}
                    className={`p-4 rounded-lg text-sm font-medium cursor-pointer transition border-b border-gray-300 ${
                      index === 0 ? 'bg-violet-100 text-violet-700 font-semibold' : 'hover:bg-violet-100'
                    }`}
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-span-9">
            <h2 className="text-4xl font-bold text-black mb-10">Dashboard</h2>
            <div className="grid grid-cols-2 gap-10">
              <div className="bg-violet-100 p-6 rounded-xl shadow-md text-center border border-violet-300 space-y-4">
                <HiOutlineBookOpen className="text-blue-700 text-4xl mx-auto mb-2" />
                <p className="text-3xl font-extrabold text-blue-400">{user.courses_enrolled || 0}</p>
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