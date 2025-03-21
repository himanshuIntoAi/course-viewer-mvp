'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { HiOutlineBookOpen, HiOutlineAcademicCap } from 'react-icons/hi';

interface User {
  user_id: number;
  display_name: string;
  email: string;
  profile_image: string;
  country?: string;
  age?: number;
  specialty?: string;
  provider?: string;
  courses_created?: number;
  mentees?: number;
}

export default function MentorDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [menuItems] = useState([
    'Dashboard',
    'Courses',
    'Reviews'
  ]);

  // Set isClient to true when component mounts
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Only run on client side
    if (!isClient) return;
    
    // Get user data from localStorage or session
    const getUserData = () => {
      try {
        const userData = localStorage.getItem('user');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          
          // Create user object with data from authentication provider
          setUser({
            user_id: parsedUser.id || parsedUser.user_id || 123456,
            display_name: parsedUser.name || parsedUser.display_name || 'Mentor User',
            email: parsedUser.email || 'mentor@example.com',
            profile_image: parsedUser.image || parsedUser.profile_image || parsedUser.avatar_url || parsedUser.picture || '/images/user-icon.svg',
            country: parsedUser.country || parsedUser.location || 'Not specified',
            age: parsedUser.age || null,
            specialty: parsedUser.specialty || 'Not specified',
            provider: parsedUser.provider || '',
            courses_created: parsedUser.courses_created || 0,
            mentees: parsedUser.mentees || 0
          });
        } else {
          // Fallback to demo data if no user in storage
          setUser({
            user_id: 123456,
            display_name: 'Demo Mentor',
            email: 'mentor@example.com',
            profile_image: '/images/user-icon.svg',
            country: 'Not specified',
            specialty: 'Not specified',
            provider: '',
            courses_created: 0,
            mentees: 0
          });
        }
      } catch (error) {
        console.error('Error getting user data:', error);
        // Fallback to demo data
        setUser({
          user_id: 123456,
          display_name: 'Demo Mentor',
          email: 'mentor@example.com',
          profile_image: '/images/user-icon.svg',
          country: 'Not specified',
          specialty: 'Not specified',
          provider: '',
          courses_created: 0,
          mentees: 0
        });
      }
    };
    
    getUserData();
  }, [isClient]);

  // Use a default user for initial server-side rendering
  const displayUser = user || {
    user_id: 123456,
    display_name: 'Demo Mentor',
    email: 'mentor@example.com',
    profile_image: '/images/user-icon.svg',
    country: 'Not specified',
    specialty: 'Not specified',
    provider: '',
    courses_created: 0,
    mentees: 0
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6">
      <div className="max-w-7xl w-full bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Profile Section */}
        <div className="relative w-full h-96">
          <div style={{ position: 'relative', width: '100%', height: '384px' }}>
            <Image
              src="/images/hero.png"
              alt="Background"
              fill
              sizes="100vw"
              style={{ objectFit: 'cover' }}
              className="rounded-t-2xl"
              priority
            />
          </div>
          <div className="relative top-[-10vh] left-10 w-[25vw] bg-white px-4 py-2 rounded-full shadow-lg flex items-center gap-3">
            <div className="relative" style={{ width: '100px', height: '100px' }}>
              <Image
                src={displayUser.profile_image}
                alt="Mentor Avatar"
                width={100}
                height={100}
                className="rounded-full border-2 border-white shadow-md object-cover"
                priority
              />
              {isClient && displayUser.provider && (
                <div className="absolute bottom-0 right-0 bg-blue-500 text-white text-xs p-1 rounded-full">
                  {displayUser.provider}
                </div>
              )}
            </div>
            <div className=''>
              <h2 className="text-sm font-bold text-gray-900">{displayUser.display_name}</h2>
              <p className="text-xs text-gray-600">Country: {displayUser.country || 'Not specified'}{displayUser.age ? ` • Age: ${displayUser.age}` : ''}</p>
              <p className="text-xs text-gray-500">{displayUser.specialty || 'Specialty not specified'}</p>
            </div>
          </div>
          <div className="absolute top-[40vh] right-10 flex items-center gap-2 bg-teal-500 text-white px-4 py-2 rounded-full shadow-md">
            <div className="relative w-5 h-5 mr-1">
              <Image src="/images/badge-check.png" alt="Verified Badge" width={20} height={20} />
            </div>
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
                <p className="text-3xl font-extrabold text-blue-700">{displayUser.courses_created || 0}</p>
                <p className="text-gray-600 text-lg">Courses Created</p>
              </div>
              <div className="bg-violet-100 p-6 rounded-xl shadow-md text-center border border-violet-300 space-y-4">
                <HiOutlineAcademicCap className="text-blue-700 text-4xl mx-auto mb-2" />
                <p className="text-3xl font-extrabold text-blue-700">{displayUser.mentees || 0}</p>
                <p className="text-gray-600 text-lg">Mentees</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
