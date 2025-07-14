'use client'

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { useOnboarding } from '@/state/context/login/OnboardingContext';

interface User {
  display_name: string;
  email: string;
  profile_image: string;
  is_student: boolean;
  is_instructor: boolean;
}

const NavbarMentor = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { logout } = useOnboarding();

  useEffect(() => {
    const checkUserState = () => {
      const storedUser = localStorage.getItem("user");
      const isSigningOut = window.location.search.includes('signout=true');
      
      if (isSigningOut) {
        setUser(null);
        return;
      }

      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        } catch (error) {
          console.error("Failed to parse user data:", error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    checkUserState();
    // Listen for storage events to update state across tabs
    window.addEventListener('storage', checkUserState);
    return () => window.removeEventListener('storage', checkUserState);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProfileClick = () => {
    if (isDashboardPage) {
      setShowDropdown(!showDropdown);
    } else {
      const path = user?.is_student ? "/student-dashboard" : "/mentor-dashboard";
      router.push(path);
    }
  };

  const handleLogout = async () => {
    try {
      setShowDropdown(false); // Close dropdown immediately
      await logout();
      setUser(null); // Clear user state immediately
      // Use window.location.replace to force a full page reload and clear all states
      window.location.replace('/?signout=true');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const isDashboardPage = typeof window !== 'undefined' && (
    window.location.pathname.startsWith('/student-dashboard') ||
    window.location.pathname.startsWith('/mentor-dashboard')
  );

  // Prevent showing user profile if signing out
  const isSigningOut = typeof window !== 'undefined' && window.location.search.includes('signout=true');
  if (isSigningOut) {
    return (
      <nav className="flex items-center justify-between px-6 py-4 bg-white shadow-lg rounded-lg w-[90vw] m-auto">
        {/* Logo Section */}
        <div className="flex items-center cursor-pointer z-50" onClick={() => router.push("/")}>
          <Image src="/app-logo.svg" alt="CloudOU Logo" width={150} height={50} />
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex space-x-6 text-gray-700 font-medium">
          <Link href="/" className="relative after:content-[''] after:absolute after:w-full after:h-0.5 after:bg-teal-500 after:bottom-0 after:left-0 after:scale-x-100 after:transition-transform after:duration-300">
            Home
          </Link>
          <Link href="/all-courses">Courses</Link>
          <Link href="#">Earn Now</Link>
          <Link href="/mentor-dashboard">Mentors</Link>
        </div>

        <div className="flex space-x-4">
          <button 
            className="px-10 py-2 text-sm border-2 border-teal-500 text-teal-500 rounded-lg hover:bg-teal-50 transition" 
            onClick={() => router.push("/login")}
          >
            Log in
          </button>
          <button className="px-10 py-2 text-sm border-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition">
            Enroll Now
          </button>
        </div>
      </nav>
    );
  }

  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-white shadow-lg rounded-lg w-[90vw] m-auto">
      {/* Logo Section */}
      <div className="flex items-center cursor-pointer z-50" onClick={() => router.push("/")}>
        <Image src="/app-logo.svg" alt="CloudOU Logo" width={150} height={50} />
      </div>

      {/* Navigation Links */}
      <div className="hidden md:flex space-x-6 text-gray-700 font-medium">
        <Link href="/" className="relative after:content-[''] after:absolute after:w-full after:h-0.5 after:bg-blue-900 after:bottom-0 after:left-0 after:scale-x-100 after:transition-transform after:duration-300">
          Home
        </Link>
        <Link href="/all-courses">Courses</Link>
        <Link href="#">Earn Now</Link>
        <Link href="/mentor-dashboard">Mentors</Link>
      </div>

      {/* Auth Buttons */}
      {user ? (
        <div className="relative" ref={dropdownRef}>
          <div 
            className="flex items-center space-x-4 cursor-pointer hover:opacity-80 transition-opacity" 
            onClick={handleProfileClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleProfileClick()}
          >
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Welcome,</span>
              <span className="font-bold text-blue-900 text-lg">{user.display_name}</span>
              <div className="relative w-8 h-8 rounded-full overflow-hidden">
                <Image
                  src={user.profile_image || "/images/user-icon.svg"}
                  alt="Profile"
                  fill
                  className="object-cover"
                />
              </div>
              {isDashboardPage && (
                <Image 
                  src="/images/down-arrow2.svg" 
                  alt="Menu" 
                  width={8} 
                  height={8} 
                  className={`transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`}
                />
              )}
            </div>
          </div>
          
          {/* Dropdown Menu */}
          {isDashboardPage && showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 transition-colors duration-200"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex space-x-4">
          <button 
            className="px-10 py-2 text-sm border-2 border-blue-900 text-blue-900 rounded-lg  transition" 
            onClick={() => router.push("/login")}
          >
            Log in
          </button>
          <button className="px-10 py-2 text-sm border-2 bg-blue-900 text-white rounded-lg hover:bg-blue-900 transition">
            Enroll Now
          </button>
        </div>
      )}
    </nav>
  );
};

export default NavbarMentor;
