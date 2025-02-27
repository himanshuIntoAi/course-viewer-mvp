"use client"
import Navbar from "@/components/navbar/navbar";
import React from 'react'
import Footer from "@/components/footer/footer";
import LoginComponent from "@/components/auth/LoginComponent";
const page = () => {

  return (
    <div className="relative from-[#E4F7F7] to-white">
      <img src="/design-left.svg" alt="" className="absolute top-0 left-0 w-1/6 z-[1]" />
      <img src="/design-right.svg" alt="" className="absolute top-0 right-0 w-1/6 z-[1]" />
      <div className="">
        <LoginComponent />
      </div>
      <img src="/curved-line.png" alt="" className="w-full h-auto mt-40" />
      <Footer />
    </div>
  );
}

export default page;