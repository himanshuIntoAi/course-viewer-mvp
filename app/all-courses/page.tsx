"use client";

import React, { useState } from 'react';
import CourseDetailHeader from './components/CourseDetailHeader';
import CourseContainer from './components/CourseContainer';
import CourseDetailSidebar from './components/CourseDetailSidebar';

const CourseDetailPage = () => {
    const [searchQuery, setSearchQuery] = useState<string>("");

    const handleSearchChange = (query: string) => {
        setSearchQuery(query);
    };

    return (
        <div className="min-h-screen">
            <CourseDetailHeader 
                searchQuery={searchQuery}
                onSearchChange={handleSearchChange}
            />

            <div className="flex">
                {/* Left Sidebar */}
                <CourseDetailSidebar />
                <div className="flex-1 w-full mr-10 px-6 py-8">
                    <CourseContainer 
                        searchQuery={searchQuery}
                        onSearchChange={handleSearchChange}
                    />
                </div>
            </div>
        </div>
    );
};

export default CourseDetailPage;