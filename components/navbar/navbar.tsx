'use client'

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
const Navbar = () => {

  const router = useRouter();

  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    let user = localStorage.getItem("user");
    if (user) {
      setUser(JSON.parse(user));
    }

  }, [])

  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-white shadow-lg rounded-lg w-[90vw] m-auto">
      {/* Logo Section */}
      <div className="flex items-center cursor-pointer z-50" onClick={() => router.push("/")}>
        <Image src="/app-logo.svg" alt="CloudOU Logo" width={150} height={50} onClick={() => router.push("/")} />
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

      {/* Auth Buttons */}
      {
        user ? <div className="flex space-x-4" onClick={() => router.push("/student-dashboard")} >
          <p className='flex items-center gap-2' ><span> Welcome , </span> <span className='font-bold text-blue-900 text-2xl' > {user.display_name
          }</span>  <img src="/images/user-icon.svg" alt="" className='w-8 h-8' /> <img src="/images/down-arrow2.svg" alt="" className='w-2 h-2' />  </p>
        </div> : <div className="flex space-x-4">
          <button className="px-10 py-2 text-sm border-2 border-teal-500 text-teal-500 rounded-lg hover:bg-teal-50 transition" onClick={() => router.push("/login")}>Log in</button>
          <button className="px-10 py-2 text-sm border-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition">Enroll Now</button>
        </div>
      }

    </nav>
  );
};

export default Navbar;
