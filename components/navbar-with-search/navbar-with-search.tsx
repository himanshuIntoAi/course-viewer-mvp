'use client'
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const NavbarWithSearch = () => {
    const router = useRouter();
    return (
        <nav className="flex items-center justify-between px-6 py-4 bg-white shadow-lg rounded-lg w-[90vw] m-auto z-[2]">
            {/* Logo Section */}
            <div className="flex items-center cursor-pointer" onClick={() => router.push("/home")}>
                <Image src="/app-logo.svg" alt="CloudOU Logo" width={150} height={50} />
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex space-x-6 text-gray-700 font-medium w-[50%]">
                <input type="text" placeholder="Search for courses , mentors , topics..." className="border-2 bg-gray-100  text-gray-500 rounded-lg hover:bg-teal-50 transition p-2 w-[70%]" />
                <button className="px-10 py-2 text-sm bg-[#16197C] text-white rounded-lg  flex items-center gap-2"> <img src="/search.svg" alt="" className='w-5 h-5' /> Search</button>
            </div>

            {/* Auth Buttons */}
            <div className="flex space-x-4">
                <p className='flex items-center gap-2' ><span> Welcome , </span> <span className='font-bold text-blue-900 text-2xl' >John Doe</span>  <img src="/images/user-icon.svg" alt="" className='w-8 h-8' /> <img src="/images/down-arrow2.svg" alt="" className='w-2 h-2' />  </p>
            </div>
        </nav>
    );
};

export default NavbarWithSearch;
