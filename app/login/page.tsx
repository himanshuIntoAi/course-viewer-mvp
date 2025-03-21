"use client"
import React from 'react'
import Footer from "@/components/footer/footer";
import LoginComponent from "@/components/auth/LoginComponent";
import Image from 'next/image';

const page = () => {

  return (
    <div className="relative from-[#E4F7F7] to-white">
      <Image src="/design-left.svg" alt="Design Left" width={150} height={300} className="absolute top-0 left-0 w-1/6 z-[1]" />
      <Image src="/design-right.svg" alt="Design Right" width={150} height={300} className="absolute top-0 right-0 w-1/6 z-[1]" />
      <div className="">
        <LoginComponent />
      </div>
      <Image src="/curved-line.png" alt="Curved Line" width={1200} height={50} className="w-full h-auto mt-40" />
      <Footer />
    </div>
  );
}

export default page;