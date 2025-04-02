import React from 'react'
import Image from 'next/image'
import { ArrowUp } from 'lucide-react'
import { FaFacebook, FaLinkedin } from 'react-icons/fa6'
import { FaInstagram } from 'react-icons/fa'
import lineImage from "@/app/Images/line.png";
const 
footer = () => {
    return (
        <footer className="bg-transparent shadow-lg rounded-t-3xl p-10 mt-24" >
      <Image src={lineImage} alt="Line Image"  />;

              
      <div className="max-w-7xl mx-auto mt-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="text-2xl font-bold mb-4">
              <img 
                src="https://media-hosting.imagekit.io/486d96e5c4884013/cloud-ou-logo%202%20(1).png?Expires=1837837741&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=Jlz5FYLwNiKpjMO2acZ6grc1W6aoAYj3A7mJb9JXM8eJ6HrxnFpcftq5c3ZpamDuMHIoS9PpeiYyCHqQJWhwzZ4NR742fjHVsr7cURzd9f0UAZXoqfzKtNKwS7bWrB98kClLOSffqOAQFGpKBMTtVW3qEDvRbO9s4G~nTdn2Uo0GvY7AZT7tt~OEDtBVcVfutn5QYJis~mvEJvoJnjpxapR1OS2HdcsHrTlkYo1QTrqIjZB8T78CvfhlIoorXKvvgGijxC6kQTvRR8cIsQ0UombSB2Iqwi2yTvzRq1tKxJ2GK1zruR~KJVlQ512xbr7QIIthRZVJ3uB~AtaseTVVaQ" 
                alt="logo" 
                width="120" 
                height="100" 
              />
            </div>
            <div className="flex gap-4 mt-4">
              <a href="#" className="text-black-600 hover:text-black-900"><FaLinkedin size={24} /></a>
              <a href="#" className="text-black-600 hover:text-black-900"><FaInstagram size={24} /></a>
              <a href="#" className="text-black-600 hover:text-black-900"><FaFacebook size={24} /></a>
            </div>
          </div>
          
          <div className="text-black-600">
          <h3 className="text-lg font-semibold relative pb-1.5 mb-4 after:block after:w-[150px] after:h-[5px] after:bg-teal-500 after:absolute after:left-0 after:bottom-0 after:rounded-full">
          Quick Links
            </h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-gray-900">Home</a></li>
              <li><a href="#" className="hover:text-gray-900">About us</a></li>
              <li><a href="#" className="hover:text-gray-900">Who we are?</a></li>
              <li><a href="#" className="hover:text-gray-900">Blogs</a></li>
              <li><a href="#" className="hover:text-gray-900">Community</a></li>
              <li><a href="#" className="hover:text-gray-900">FAQ's</a></li>
            </ul>
          </div>
          
          <div className="text-black-600">
            <h3 className="text-lg font-semibold relative pb-2 mb-4 after:block after:w-[150px] after:h-[5px] after:bg-teal-500 after:absolute after:left-0 after:bottom-0 after:rounded-full">
              Resources
            </h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-gray-900">Careers</a></li>
              <li><a href="#" className="hover:text-gray-900">Affiliates</a></li>
              <li><a href="#" className="hover:text-gray-900">Events</a></li>
              <li><a href="#" className="hover:text-gray-900">For Businesses</a></li>
              <li><a href="#" className="hover:text-gray-900">For Charity</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold relative pb-2 mb-4 after:block after:w-[150px] after:h-[5px] after:bg-teal-500 after:absolute after:left-0 after:bottom-0 after:rounded-full">
              Contact Us
            </h3>
            <address className="not-italic">
              <p className="text-black-600 mb-2"><i>63, 2, Next To Plaza Hall, Vyalikaval</i></p>
              <p className="text-black-600 mb-2"><i>+1 378-343-2344</i></p>
            </address>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row items-center justify-between w-full px-6 gap-4 md:gap-0 mt-4 mb-6">
          <div className="flex justify-start md:justify-start w-full md:w-auto">
            <button 
              className="h-10 w-10 bg-teal-500 text-white rounded-full shadow-lg flex items-center justify-center"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <ArrowUp size={20} />
            </button>
          </div>

          <div className="flex-1 flex justify-center w-full md:w-auto">
            <p className="text-sm text-black-500 text-center">© 2025, CloudOU Inc.</p>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-black-500 whitespace-nowrap justify-center md:justify-end w-full md:w-auto">
            <a href="#" className="hover:text-gray-700">Privacy Policy</a>
            <span>|</span>
            <a href="#" className="hover:text-gray-700">Terms & Conditions</a>
            <span>|</span>
            <a href="#" className="hover:text-gray-700">Site Maps</a>
          </div>
        </div>
      </div>
        </footer>
    )
}

export default footer