import React from 'react'
import Navbar from '@/components/navbar/navbar'
import Footer from '@/components/footer/footer'
import CourseDashboardTabs from '@/components/course-dashboard-tabs/course-dashboard-tabs'
import CourseProgress from '@/components/course-progress-box/course-progress-box'
import NavbarWithSearch from '@/components/navbar-with-search/navbar-with-search'
import CertificateComp from '@/components/certificate-comp/certificate-comp'
const page = () => {
  return (
    <div className="relative bg-gradient-to-b from-[#E4F7F7] to-[#FFFFFF]">
      <img src="/design-left.svg" alt="" className="absolute top-0 left-0 w-1/6 z-[1]" />
      <img src="/design-right.svg" alt="" className="absolute top-0 right-0 w-1/6 z-[1]" />
      <NavbarWithSearch />

      <p className=' pt-[60px] w-[90vw] mx-auto text-sm text-gray-600'>Home > Course Analysis > Complete Web Development Course </p>
      <div className="pt-2">
        <CourseProgress />
      </div>
      <div className="pt-[60px]">
        <CourseDashboardTabs />
      </div>

      <CertificateComp />

      <Footer />
    </div>
  )
}

export default page