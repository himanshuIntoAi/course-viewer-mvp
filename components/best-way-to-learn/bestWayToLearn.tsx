"use client";
import React, { useState } from "react";
import Image from 'next/image';

export default function BestWayToLearn() {
    // Track which image is in front (0 or 1)
    const [frontImage, setFrontImage] = useState(0);

    // Tabs data: title, description, accent color, etc.
    const TABS = [
        {
            title: "Create Your Own Course Pathway with Our AI",
            description:
                "Use our AI and create customised learning pathway suitable to you to learn and practice",
            color: "bg-teal-400",
            icon: "🔧",
        },
        {
            title: "Hire the Expert Mentors",
            description: "Get connected with top mentors for direct guidance.",
            color: "bg-purple-400",
            icon: "⭐",
        },
        {
            title: "Side-by-Side Code Editor",
            description: "Practice coding directly while watching tutorials.",
            color: "bg-purple-400",
            icon: "📝",
        },
        {
            title: "Side-by-Side Code Editor",
            description: "Practice coding directly while watching tutorials.",
            color: "bg-purple-400",
            icon: "📝",
        },
        {
            title: "Side-by-Side Code Editor",
            description: "Practice coding directly while watching tutorials.",
            color: "bg-purple-400",
            icon: "📝",
        },
    ];

    // Which tab is "expanded"
    const [activeTabIndex, setActiveTabIndex] = useState(0);

    // Handler to switch which image is in front
    const handleImageClick = () => {
        setFrontImage((prev) => (prev === 0 ? 1 : 0));
    };

    return (
        <div className=" py-8 px-4 md:px-16 relative w-full overflow-hidden">
            {/* Top heading area */}
            <div className="flex flex-col md:flex-row items-center mb-6">
                <div className="hidden md:block w-72 h-52">
                    <Image 
                        src="/images/learning-path.svg"
                        alt="Learning path illustration"
                        width={400}
                        height={300}
                        className="w-full h-auto"
                    />
                </div>
                <div className="flex flex-col items-center justify-center ml-10">
                    {/* Optional top icon & text */}
                    <div className="flex items-center text-yellow-600 text-xl gap-2 mb-2">
                        <span>⚙</span>
                        <span>We understand you and so we built</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
                        The Best Way to Learn
                    </h2>
                </div>

                {/* Hero illustration (top-right) */}

            </div>

            {/* Main content section: left images + right tabs */}
            <div className="flex flex-col md:flex-row gap-8 mt-4">
                {/* LEFT SIDE: Two overlapping "images" (could be divs or actual img tags) */}
                <div className="relative w-full md:w-1/2 h-80 md:h-[400px]">
                    {/* "Back" shape (index 0 or 1) */}
                    <div
                        onClick={handleImageClick}
                        className={`absolute top-0 left-0 w-full h-full 
              rounded-xl bg-pink-200 cursor-pointer 
              transition-all duration-500
              ${frontImage === 1 ? "z-10 shadow-xl" : "z-0 shadow-2xl translate-x-4 translate-y-4"}
            `}
                    >
                        {/* You can also use an <img> here if needed */}
                    </div>

                    {/* "Front" shape (index 0 or 1) */}
                    <div
                        onClick={handleImageClick}
                        className={`absolute top-0 left-0 w-full h-full 
              rounded-xl bg-pink-300 cursor-pointer
              transition-all duration-500
              ${frontImage === 0 ? "z-10 shadow-xl" : "z-0 shadow-2xl translate-x-4 translate-y-4"}
            `}
                    >
                        {/* If you prefer an <img>, replace the background with <img src="..." /> */}
                    </div>
                </div>

                {/* RIGHT SIDE: Big Title + tabs */}
                <div className="w-full md:w-1/2 flex flex-col">
                    <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                        Everything You Need At One Place
                    </h3>

                    {/* Tabs container */}
                    <div className="flex flex-col gap-4">
                        {TABS.map((tab, i) => {
                            const isActive = i === activeTabIndex;
                            return (
                                <div
                                    key={i}
                                    onClick={() => setActiveTabIndex(i)}
                                    className={`transition-all duration-300 cursor-pointer
                    rounded-xl overflow-hidden shadow 
                    ${isActive ? "h-auto p-4" : "h-12 p-2"} 
                    ${tab.color} text-white relative
                  `}
                                >
                                    {/* Icon + Title row */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 font-semibold">
                                            <span>{tab.icon}</span>
                                            <span>{tab.title}</span>
                                        </div>
                                        {/* We only show an expand/collapse arrow if needed */}
                                        <span className="text-xl transform">
                                            {isActive ? "–" : "+"}
                                        </span>
                                    </div>

                                    {/* If active, show description */}
                                    {isActive && (
                                        <p className="mt-2 text-sm text-white">
                                            {tab.description}
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
