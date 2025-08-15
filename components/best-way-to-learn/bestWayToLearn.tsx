"use client";
import React, { useState } from "react";
// Commenting out all problematic image imports
// import BusinessPlan from "@/app/Images/Business Plan.png";
import { BrainCircuit, PencilRulerIcon } from "lucide-react";
// import image1 from "@/app/Images/image1.png";
// import image2 from "@/app/Images/image2.png";

export default function BestWayToLearn() {
    const [activeTabIndex, setActiveTabIndex] = useState(-1);

    const handleToggleButton = (e: React.MouseEvent<HTMLButtonElement>, index: number) => {
        e.stopPropagation();
        setActiveTabIndex(index === activeTabIndex ? -1 : index);
    };

    const TABS = [
        {
            title: "Create Your Own Course Pathway with Our AI",
            icon: <PencilRulerIcon size={20} className="bg-white p-1 rounded text-teal-500" />,
            description: "Use our AI and create a customized learning pathway suitable for you to learn and practice.",
        },
        {
            title: "Hire the Expert Mentors",
            description: "Get connected with top mentors for direct guidance.",
        },
        {
            title: "Side-by-Side Code Editor",
            description: "Practice coding directly while watching tutorials.",
        },
        {
            title: "Hands-on Projects",
            description: "Apply your knowledge with real-world coding projects.",
        },
        {
            title: "Live Coding Sessions",
            description: "Join interactive coding sessions with industry professionals.",
        },
    ];

    return (
        <div className="py-8 px-4 md:px-16 relative w-full overflow-hidden">
            {/* Heading Section */}
            <div className="flex flex-col md:flex-row items-center mb-8">
                <div className="hidden md:block w-72 h-52">
                    {/* Commenting out the problematic Image component */}
                    {/*<Image 
                        src={BusinessPlan}
                        alt="Learning path illustration"
                        width={500}
                        height={500}
                        className="w-full h-auto"
                    />*/}
                </div>
                <div className="flex flex-col items-center justify-center text-center pl-[80px] mt-5">
                    <BrainCircuit className="text-yellow-600 text-6xl mb-2" />
                    <div className="flex items-center text-black-600 text-xl gap-2 mb-2">
                        <span>We understand you and so we built</span>
                    </div>
                    <h1 className="text-5xl md:text-5xl text-gray-800 font-bold">
                        The Best Way to Learn
                    </h1>
                </div>
            </div>

            {/* Main Content Section */}
            <div className="flex flex-col md:flex-row gap-8 mt-[150px] ">
                {/* Left Side: Images */}
                <div className="relative flex justify-center items-center  w-[600px] h-[600px]">
                    {/* Commenting out problematic Image components */}
                    {/*<Image
                        onClick={handleImageClick}
                        src={image1}
                        alt="Robot and human hand"
                        width={600}
                        height={600}
                        className={`absolute rounded-lg object-cover w-full h-full cursor-pointer
                        transition-all duration-500
                        ${frontImage === 1 ? "z-10 " : "z-0  translate-x-4 translate-y-4"}`}
                    />
                    <Image
                        onClick={handleImageClick}
                        src={image2}
                        alt="Ocean scene"
                        width={600}
                        height={600}
                        className={` rounded-lg object-cover w-full h-full cursor-pointer
                        transition-all duration-500
                        ${frontImage === 0 ? "z-10" : "z-0 translate-x-4 translate-y-4"}`}
                        style={{ transform: "rotate(8deg)" }}
                    />*/}
                </div>

                {/* Right Side: Tabs */}
                <div className="w-full md:w-1/2 flex flex-col ml-[100px]">
                    <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                        Everything You Need At One Place
                    </h3>

                    {/* Tabs */}
                    <div className="flex flex-col gap-4">
                        {TABS.map((tab, i) => {
                            const isActive = i === activeTabIndex;
                            return (
                                <div
                                    key={i}
                                    onClick={() => setActiveTabIndex(isActive ? -1 : i)}
                                    className={`transition-all duration-300 cursor-pointer
                                        rounded-xl overflow-hidden shadow 
                                        ${isActive ? "h-auto p-4" : "h-12 p-2"} 
                                        text-white relative`}
                                    style={{ backgroundColor: isActive ? "rgba(1, 183, 186, 1)" : "rgba(137, 140, 224, 1)" }}
                                >
                                    {/* Tab Content */}
                                    <div className="flex flex-col">
                                        {/* Icon at the top when expanded */}
                                        {isActive && tab.icon && (
                                            <div className="flex justify-start mb-2">{tab.icon}</div>
                                        )}
                                        
                                        {/* Title & Toggle Button */}
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold">{tab.title}</span>
                                            <button 
                                                className="text-xl transform focus:outline-none"
                                                onClick={(e) => handleToggleButton(e, i)}
                                                aria-label={isActive ? "Collapse" : "Expand"}
                                            >
                                                {isActive ? "–" : "+"}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Description */}
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