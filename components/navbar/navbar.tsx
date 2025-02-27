import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const Navbar = () => {

  const router = useRouter();
  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-white shadow-lg rounded-lg w-[90vw] m-auto">
      {/* Logo Section */}
      <div className="flex items-center cursor-pointer z-50" onClick={() => router.push("/home")}>
        <Image src="/app-logo.svg" alt="CloudOU Logo" width={150} height={50} onClick={() => router.push("/home")}/>
      </div>
      
      {/* Navigation Links */}
      <div className="hidden md:flex space-x-6 text-gray-700 font-medium">
        <Link href="/home" className="relative after:content-[''] after:absolute after:w-full after:h-0.5 after:bg-teal-500 after:bottom-0 after:left-0 after:scale-x-100 after:transition-transform after:duration-300">
          Home
        </Link>
        <Link href="/course">Courses</Link>
        <Link href="#">Earn Now</Link>
        <Link href="/mentor-dashboard">Mentors</Link>
      </div>
      
      {/* Auth Buttons */}
      <div className="flex space-x-4">
        <button className="px-10 py-2 text-sm border-2 border-teal-500 text-teal-500 rounded-lg hover:bg-teal-50 transition" onClick={() => router.push("/login")}>Log in</button>
        <button className="px-10 py-2 text-sm border-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition">Enroll Now</button>
      </div>
    </nav>
  );
};

export default Navbar;
