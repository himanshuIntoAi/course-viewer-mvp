import React from 'react'
import MentorDashboard from '@/components/mentor-dashboard/mentor-dashboard'
import Footer from '@/components/footer/footer'
import StudentDashboard from '@/components/student-dashboard/student-dashboard'
import NavbarWithSearch from '@/components/navbar-with-search/navbar-with-search'
const page = () => {
  return (
    <div className="relative bg-gradient-to-b from-[#E4F7F7] to-[#FFFFFF]">
      <img src="/design-left.svg" alt="" className="absolute top-0 left-0 w-1/6 z-[1]" />
      <img src="/design-right.svg" alt="" className="absolute top-0 right-0 w-1/6 z-[1]" />
      <NavbarWithSearch />

      <p className=' pt-[60px] w-[90vw] mx-auto text-sm text-gray-600'></p>
      <div className="pt-2">
        <StudentDashboard />
      </div>
      
      <Footer />
    </div>
  )
}

export default page