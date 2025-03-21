import { Search, Filter } from 'lucide-react';
import { useState } from 'react';
// import heroImage from '../public/explore_course_images/redesigned-hero-image-removebg-preview.png';

interface CoursesTopSectionProps {
  onSearch: (query: string) => void
}

export function CoursesTopSection({
  onSearch
}: CoursesTopSectionProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    onSearch(value)
  }

  return (
    <div className="w-[90vw] mx-auto px-6 py-4 space-y-4">
      <div className="flex items-center gap-8">
        {/* <Image src={heroImage} alt="Hero Image" width={300} height={200} /> */}
        <div className="space-y-2 flex-1 text-center">
          <h1 className="text-3xl font-bold text-[#16197C] font-poppins">All courses</h1>
          <p className="text-lg text-gray-600 font-inter">Courses that help designers become true unicorns</p>
        </div>
      </div>
      
      {/* Category Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 w-full">
        {[
          "Trending Courses 2025",
          "Most Demanding Job Roles",
          "Highly Paid Job Roles",
          "Leadership Courses",
          "Interview Q&A",
        ].map((tag) => (
          <button
            key={tag}
            className="w-full px-4 py-2.5 bg-[#16197C] text-white rounded-md text-sm font-medium hover:bg-teal-700 transition-colors"
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Search and Filter */}
      <div className="flex items-center justify-between relative">
        {/* Centered Search Bar */}
        <div className="absolute left-1/2 transform -translate-x-1/2 w-[500px]">
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="Search all Courses"
              value={searchQuery}
              onChange={handleSearch}
              className="w-full py-2 px-4 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
            <button
              className="absolute right-0 p-3 rounded-full text-white"
              style={{ backgroundColor: "#16197C" }}
            >
              <Search size={20} />
            </button>
          </div>
        </div>

        {/* Filter Button */}
        <button className="p-2 border rounded-md hover:bg-gray-50 bg-white ml-auto">
          <Filter className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
} 