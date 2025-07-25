'use client';

import React, { Suspense } from 'react'
import Footer from '@/components/footer/footer'
import CourseDashboardTabs from '@/components/course-dashboard-tabs/course-dashboard-tabs'
import CourseProgress from '@/components/course-progress-box/course-progress-box'
import CertificateComp from '@/components/certificate-comp/certificate-comp'
import Image from 'next/image';
// Client component wrapper
const ClientNavbar = () => {
  const NavbarWithSearch = React.lazy(() => import('@/components/navbar-with-search/navbar-with-search'));
  return (
    <Suspense fallback={<div className="h-16 bg-white shadow-md"></div>}>
      <NavbarWithSearch />
    </Suspense>
  );
};

const page = () => {
  return (
    <div className="relative bg-gradient-to-b from-[#E4F7F7] to-[#FFFFFF]">
      <Image 
        src="/design-left.svg" 
        alt="Design Left" 
        width={150} 
        height={300} 
        className="absolute top-0 left-0 w-1/6 z-[1]" 
      />
      <Image 
        src="/design-right.svg" 
        alt="Design Right" 
        width={150} 
        height={300} 
        className="absolute top-0 right-0 w-1/6 z-[1]" 
      />
      
      <ClientNavbar />

      <p className=' pt-[60px] w-[90vw] mx-auto text-sm text-gray-600'>Home {`>`} Course Analysis {`>`} Complete Web Development Course </p>
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