'use client'

import { Sidebar } from "../../components/sidebar/sidebar"
import { CourseCard } from "../../components/course-card-all-courses/course-card"
import { CoursesTopSection } from "../../components/all-courses-top-section/courses-top-section"
import Navbar from "../../components/navbar/navbar"
import { useState, useEffect, useCallback } from 'react'
import { getCourses } from "@/services/api/course-and-filters/api"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { getFilteredCourses } from "@/services/api/course-and-filters/api"
import { Course } from "@/services/types/course/course"

interface FilterState {
  it_non_it: boolean | null;
  coding_non_coding: boolean | null;
  category_id: number | null;
  level: string | null;
  price_type: string | null;
  completion_time: string | null;
  min_price: number | null;
  max_price: number | null;
}


export default function CoursesPage() {
  const [view, setView] = useState<'grid' | 'list'>('list')
  const [coursesData, setCoursesData] = useState<Course[]>([])
  const [displayedCourses, setDisplayedCourses] = useState<Course[]>([])
  
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)
  const [filters, setFilters] = useState<FilterState>({
    it_non_it: null,
    coding_non_coding: null,
    category_id: null,
    level: null,
    price_type: null,
    completion_time: null,
    min_price: null,
    max_price: null
  });

  // --- Pagination State ---
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Changed to 10 items per page
  const [totalCourses, setTotalCourses] = useState(0);


  const fetchAllCourses = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const skip = (currentPage - 1) * itemsPerPage;
      const response = await getCourses(skip, itemsPerPage);
      if (response) {
        setCoursesData(response); 
        setDisplayedCourses(response);
      } else {
        setCoursesData([]); 
        setDisplayedCourses([]);
      }
      // For now, we'll assume there are 100 total courses. In a real app, this should come from the API
      setTotalCourses(100);
    } catch (err) {
      const errorMessage = err instanceof Error ? err : new Error('An error occurred while fetching courses');
      setError(errorMessage);
      console.error('Error fetching all courses:', errorMessage);
      setCoursesData([]); 
      setDisplayedCourses([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage]);

  const getAttFiltersFromSidebar = useCallback((newFilters: FilterState) => {
    console.log("Filters from sidebar:", newFilters);
    // Clean up filters before setting them
    const cleanedFilters = {
      it_non_it: newFilters.it_non_it || null,
      coding_non_coding: newFilters.coding_non_coding || null,
      category_id: newFilters.category_id || null,
      level: newFilters.level || null,
      price_type: newFilters.price_type || null,
      completion_time: newFilters.completion_time || null,
      min_price: typeof newFilters.min_price === 'number' ? newFilters.min_price : null,
      max_price: typeof newFilters.max_price === 'number' ? newFilters.max_price : null
    };
    
    setFilters(cleanedFilters);
    setCurrentPage(1);
  }, []);

  useEffect(() => {
    fetchAllCourses()
  }, [fetchAllCourses]) // Keep this for initial load

  useEffect(() => {
    const fetchFilteredOrAllCourses = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const skip = (currentPage - 1) * itemsPerPage;
        let response;

        // Only fetch filtered courses if there are actual filters with non-null values
        const hasActiveFilters = Object.values(filters).some(value => value !== null);
        
        if (hasActiveFilters) {
          console.log("Sending filters to API:", filters);
          // Remove null values before sending to API
          const apiFilters = Object.fromEntries(
            Object.entries(filters).filter(([, value]) => value !== null)
          );
          response = await getFilteredCourses(apiFilters, skip, itemsPerPage);
        } else {
          // Skip fetching if no filters are applied - let the initial load handle it
          return;
        }

        if (response) {
          // Handle both array and object responses
          if (Array.isArray(response)) {
            setCoursesData(response);
            setDisplayedCourses(response);
            setTotalCourses(response.length);
          } else {
            const courses = response.courses || [];
            setCoursesData(courses);
            setDisplayedCourses(courses);
            setTotalCourses(response.total || courses.length);
          }
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching courses';
        setError(new Error(errorMessage));
        console.error('Error fetching courses:', err);
      } finally {
        setIsLoading(false);
      }
    };

    // Only run if there are actual filters with values
    if (Object.values(filters).some(value => value !== null)) {
      fetchFilteredOrAllCourses();
    }
  }, [filters, currentPage, itemsPerPage]);

  const handleSearch = useCallback((query: string) => {
    setCurrentPage(1); // Reset page on search
    if (!query.trim()) {
      setDisplayedCourses(coursesData) // Show all from base data if query is empty
      return
    }

    const filtered = coursesData.filter(course => {
      const titleMatch = course.title?.toLowerCase().includes(query.toLowerCase()) ?? false;
      // Add other search criteria if needed (e.g., description, instructor)
      const instructorMatch = course.instructor?.display_name?.toLowerCase().includes(query.toLowerCase()) ?? false;
      return titleMatch || instructorMatch;
    })
    setDisplayedCourses(filtered)
  }, [coursesData]) // Depend on base coursesData


  return (
    <div className="min-h-screen relative bg-gradient-to-b from-[#E4F7F7] to-white pb-16"> {/* Added padding bottom */}
      {/* Stars container - positioned behind navbar */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img
          src="/images/header-left-stars.png"
          className="absolute top-0 left-0 w-[40px] h-[40px] opacity-60"
          alt="Decorative left stars"
        />
        <img
          src="/images/header-right-stars.png"
          className="absolute top-0 right-0 w-[40px] h-[40px] opacity-60"
          alt="Decorative right stars"
        />
      </div>

      {/* Navbar - positioned above stars */}
      <div className="relative z-10">
        <Navbar />
      </div>

      <div className="flex flex-col">
        <CoursesTopSection onSearch={handleSearch} />

        <div className="container mx-auto px-4 mt-8">

          <div className="flex gap-8">
            <div className="w-[280px] flex-shrink-0"> {/* Added flex-shrink-0 */}
              <h2 className="text-xl font-bold mb-4">Find Right Course</h2>
              <Sidebar filtersPassingFunction={getAttFiltersFromSidebar} />
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between w-full gap-4">
                {/* Left icon */}
                <img 
                  src="/images/panel-right-open.svg" 
                  className="w-6 h-6"
                  alt="Panel toggle"
                />
                
                {/* Search bar - adjusted width */}
                <div className="flex items-center gap-2 flex-1 max-w-[600px] border-2 border-gray-[#BDBDBD] rounded-full px-3 py-1">
                  <input 
                    type="text" 
                    placeholder="Search all course" 
                    className="w-full border-none bg-transparent outline-none placeholder:text-gray-[#4F4F4F]"  
                    onChange={(e) => handleSearch(e.target.value)} // Connect search input
                  />
                  <img 
                    src="/images/search-icon.svg" 
                    className="w-8 h-8 scale-130"
                    alt="Search"
                  />
                </div>
                
                {/* Sort dropdown */}
                <select className="min-w-[120px] px-4 py-2 rounded-full bg-gray-100 text-gray-600 outline-none">
                  <option>Sort</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Rating</option>
                </select>
              </div>
              <div className="flex gap-4 my-5">
                <button className="px-4 py-2 rounded-[10px] w-[25%] bg-[#16197C] text-white outline-none">Trending Courses</button>
                <button className="px-4 py-2 rounded-[10px] w-[25%] bg-[#16197C] text-white outline-none">New Courses</button>
                <button className="px-4 py-2 rounded-[10px] w-[25%] bg-[#16197C] text-white outline-none">Best Seller</button>
                <button className="px-4 py-2 rounded-[10px] w-[25%] bg-[#16197C] text-white outline-none">Free Courses</button>
              </div>
              <div className="flex mb-5 border-2 border-gray-300 rounded-full w-fit py-1 px-2">
                <button className={`flex items-center mr-5 px-3 py-1 rounded-full ${view === 'grid' ? 'bg-gray-200' : ''}`} onClick={() => setView('grid')} > <img src="/images/grid-icon.svg" alt="Grid" className="w-4 h-4 mr-2" /> Grid </button>
                <button className={`flex items-center border-l border-gray-300 pl-5 px-3 py-1 rounded-full ${view === 'list' ? 'bg-gray-200' : ''}`} onClick={() => setView('list')} > <img src="/images/list-icon.svg" alt="List" className="w-4 h-4 mr-2" /> List </button>
              </div>

              {error && (
                <div className="text-red-500 p-4 mb-4 bg-red-50 rounded-lg">
                  {error.message}
                </div>
              )}

              <div className={`${view === 'grid'
                ? 'grid grid-cols-2 gap-6'
                : 'flex flex-col gap-4'
                }`}>
                {isLoading ? (
                  <div className="flex items-center justify-center p-8 col-span-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#02BABA]"></div>
                  </div>
                ) : (!displayedCourses || displayedCourses.length === 0) ? (
                  <div className="text-center p-8 text-gray-500 col-span-2">
                    No courses found matching your criteria.
                  </div>
                ) : (
                  displayedCourses.map((course, index) => (
                    <CourseCard
                      key={`course-${course?.id ?? index}`}
                      course={course}
                      view={view}
                    />
                  ))
                )}
              </div>

              <div className="flex justify-center items-center gap-2 mt-8">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-300 disabled:opacity-50"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                {Array.from({ length: Math.ceil(totalCourses / itemsPerPage) }).map((_, index) => {
                  const pageNumber = index + 1;
                  // Show only 5 pages at a time
                  if (
                    pageNumber === 1 ||
                    pageNumber === Math.ceil(totalCourses / itemsPerPage) ||
                    (pageNumber >= currentPage - 2 && pageNumber <= currentPage + 2)
                  ) {
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => setCurrentPage(pageNumber)}
                        className={`w-10 h-10 rounded-full ${
                          currentPage === pageNumber
                            ? 'bg-[#16197C] text-white'
                            : 'border border-gray-300'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  }
                  // Add ellipsis
                  if (
                    pageNumber === currentPage - 3 ||
                    pageNumber === currentPage + 3
                  ) {
                    return <span key={pageNumber}>...</span>;
                  }
                  return null;
                })}

                <button 
                  onClick={() => setCurrentPage(prev => Math.min(Math.ceil(totalCourses / itemsPerPage), prev + 1))}
                  disabled={currentPage === Math.ceil(totalCourses / itemsPerPage)}
                  className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-300 disabled:opacity-50"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

