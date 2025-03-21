'use client';

import React from 'react'
import Footer from '@/components/footer/footer'
import dynamic from 'next/dynamic'
import StudentDashboard from '@/components/student-dashboard/student-dashboard'
import Image from 'next/image'

// Create a simple loading spinner component
const LoadingSpinner = () => {
  return (
    <div className="flex justify-center items-center h-16">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
    </div>
  );
};

// Dynamically import the navbar component with SSR disabled
const DynamicNavbar = dynamic(() => import('@/components/navbar-with-search/navbar-with-search'), {
  ssr: false,
  loading: () => <LoadingSpinner />
});

const page = () => {
  return (
    <div className="relative bg-gradient-to-b from-[#E4F7F7] to-[#FFFFFF]">
      <Image src="/design-left.svg" alt="Design Left" width={150} height={300} className="absolute top-0 left-0 w-1/6 z-[1]" />
      <Image src="/design-right.svg" alt="Design Right" width={150} height={300} className="absolute top-0 right-0 w-1/6 z-[1]" />
      
      <DynamicNavbar />

      <p className=' pt-[60px] w-[90vw] mx-auto text-sm text-gray-600'></p>
      <div className="pt-2">
        <StudentDashboard />
      </div>
      
      <Footer />
    </div>
  )
}

export default page