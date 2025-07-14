import React from "react";
import { FiArrowLeft, FiFileText, FiLock } from "react-icons/fi";

interface CourseSyllabusSidebarProps {
  isSidebarOpen: boolean,
  setIsSidebarOpen: (isSidebarOpen: boolean) => void
}

function CourseSyllabusSidebar({ isSidebarOpen, setIsSidebarOpen }: CourseSyllabusSidebarProps) {
  return (
    <aside className="w-[370px] absolute top-0 left-0 min-h-screen bg-[#faf9fb] border-r border-[#ececec] p-0 box-border max-[600px]:w-full max-[600px]:min-w-0 max-[600px]:border-r-0">
      <div className="flex items-center bg-[#ececec] py-[18px] pr-6 pl-[18px] text-lg font-semibold">
        <FiArrowLeft size={22} className="mr-3 cursor-pointer" onClick={() => setIsSidebarOpen(false)} />
        <span className="text-lg font-semibold">Learn Java</span>
      </div>
      <div className="px-7 pt-8">
        <h2 className="text-[28px] font-bold mb-2">Hello World</h2>
        <div className="text-gray-500 text-[15px] mb-4">53 min left</div>
        <hr className="border-t border-gray-200 mb-4" />
        <p className="text-[#222] text-[15px] mb-4">
          Welcome to the world of Java programming! Java is a popular object-oriented programming language that is used in many different industries.<br /><br />
          Earn XP in these skills areas:
        </p>
        <div className="flex gap-2.5 mb-6">
          <span className="bg-[#f3f0fa] text-[#6a5acd] rounded-lg px-4 py-1.5 text-[14px] font-medium">Computer science</span>
          <span className="bg-[#f3f0fa] text-[#6a5acd] rounded-lg px-4 py-1.5 text-[14px] font-medium">Java</span>
          <span className="bg-[#f3f0fa] text-[#6a5acd] rounded-lg px-4 py-1.5 text-[14px] font-medium">Web development</span>
        </div>
        <div className="flex items-center bg-[#f3f0fa] border border-[#e0d7fa] rounded-xl mb-4 px-4 py-4">
          <div className="mr-4 text-[#6a5acd]"><FiFileText size={22} /></div>
          <div className="flex flex-col">
            <div className="text-[17px] font-semibold mb-0.5">Hello World</div>
            <div className="text-[14px] text-gray-500">Lesson · 40 min</div>
          </div>
        </div>
        <button className="w-full bg-transparent border-none text-gray-700 text-[16px] font-medium mb-4 cursor-pointer py-2 rounded-md hover:bg-[#f3f0fa] transition-colors flex items-center justify-center">
          Show More <span className="text-lg ml-1">▼</span>
        </button>
        <div className="flex items-center bg-white border border-[#ececec] rounded-xl mb-4 px-4 py-4 opacity-70">
          <div className="mr-4 text-[#6a5acd]"><FiLock size={22} /></div>
          <div className="flex flex-col">
            <div className="text-[17px] font-semibold mb-0.5">Java Program Structure</div>
            <div className="text-[14px] text-gray-500">Article · 1 min</div>
          </div>
        </div>
        <div className="flex items-center bg-white border border-[#ececec] rounded-xl mb-4 px-4 py-4 opacity-70">
          <div className="mr-4 text-[#6a5acd]"><FiLock size={22} /></div>
          <div className="flex flex-col">
            <div className="text-[17px] font-semibold mb-0.5">Hello World</div>
            <div className="text-[14px] text-gray-500">Quiz · 2 min</div>
          </div>
        </div>
        <div className="flex items-center bg-white border border-[#ececec] rounded-xl mb-4 px-4 py-4 opacity-70">
          <div className="mr-4 text-[#6a5acd]"><FiLock size={22} /></div>
          <div className="flex flex-col">
            <div className="text-[17px] font-semibold mb-0.5">Planting a Tree</div>
            <div className="text-[14px] text-gray-500">Project · 8 min</div>
          </div>
        </div>
        <div className="flex items-center bg-white border border-[#ececec] rounded-xl mb-4 px-4 py-4 opacity-70">
          <div className="mr-4 text-[#6a5acd]"><FiLock size={22} /></div>
          <div className="flex flex-col">
            <div className="text-[17px] font-semibold mb-0.5">What Is an IDE?</div>
            <div className="text-[14px] text-gray-500">Article · 1 min</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default CourseSyllabusSidebar; 