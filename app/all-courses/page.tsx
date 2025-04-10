'use client'

import { Sidebar } from "../../components/sidebar/sidebar"
import { CourseCard } from "../../components/course-card-all-courses/course-card"
import { CoursesTopSection } from "../../components/all-courses-top-section/courses-top-section"
import Navbar from "../../components/navbar/navbar"
import { useState, useEffect, useCallback } from 'react'
import { getCourses } from "@/services/api/course-and-filters/api"
import { Grid, List, ChevronLeft, ChevronRight } from "lucide-react"
import { getFilteredCourses } from "@/services/api/course-and-filters/api"
import { Course } from "@/services/types/course/course"

interface FilterState {
  it_non_it?: string;
  coding_non_coding?: string;
  category_id?: number;
  level?: string;
  price_type?: string;
  completion_time?: string;
  min_price?: number;
  max_price?: number;
}

// --- Pagination Helper Function ---
// This function determines which page numbers to display
const getPaginationItems = (currentPage: number, totalPages: number, maxVisiblePages = 5) => {
  const items: (number | string)[] = [];
  const halfVisible = Math.floor(maxVisiblePages / 2);

  // Always show the first page
  if (totalPages > 0) {
    items.push(1);
  }

  // Add ellipsis before the middle section if needed
  let startPage = Math.max(2, currentPage - halfVisible);
  if (startPage > 2) {
    items.push('...');
  }

  // Calculate the end page for the middle section
  let endPage = Math.min(totalPages - 1, currentPage + halfVisible);

  // Adjust startPage if endPage is near the end
  if (endPage === totalPages - 1) {
     startPage = Math.max(2, totalPages - maxVisiblePages + 2);
  }
   // Adjust endPage if startPage is near the beginning
   if (startPage === 2) {
     endPage = Math.min(totalPages - 1, maxVisiblePages - 1);
   }


  // Add middle page numbers
  for (let i = startPage; i <= endPage; i++) {
    items.push(i);
  }

  // Add ellipsis after the middle section if needed
  if (endPage < totalPages - 1) {
    items.push('...');
  }

  // Always show the last page if totalPages > 1
  if (totalPages > 1) {
    items.push(totalPages);
  }

  return items;
};
// ---------------------------------

export default function CoursesPage() {
  const [view, setView] = useState<'grid' | 'list'>('list')
  const [coursesData, setCoursesData] = useState<Course[]>([])
  const [displayedCourses, setDisplayedCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)
  const [filters, setFilters] = useState<FilterState>({})

  // --- Pagination State ---
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6); // Show 6 courses per page (adjust as needed)
  // ------------------------

  const fetchAllCourses = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getCourses();
      setCoursesData(response);
      setDisplayedCourses(response);
      setCurrentPage(1); // Reset to page 1 when fetching all
    } catch (err) {
      const errorMessage = err instanceof Error ? err : new Error('An error occurred while fetching courses');
      setError(errorMessage);
      console.error('Error fetching all courses:', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getAttFiltersFromSidebar = useCallback((newFilters: FilterState) => {
    console.log("Filters from sidebar:", newFilters);
    // Use setState with callback to ensure safe updates
    setFilters(prev => {
      const cleanFilters = Object.fromEntries(
        Object.entries(newFilters).filter(([_, value]) => value != null)
      );
      return cleanFilters;
    });
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
        let response;

        if (Object.keys(filters).length > 0) {
          console.log("Sending filters to API:", filters);
          response = await getFilteredCourses(filters);
        } else {
          response = await getCourses();
        }

        if (response) {
          setCoursesData(response);
          setDisplayedCourses(response);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching courses';
        setError(new Error(errorMessage));
        console.error('Error fetching courses:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFilteredOrAllCourses();
  }, [filters]);

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

  // --- Pagination Calculations ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCourses = displayedCourses.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(displayedCourses.length / itemsPerPage);
  const paginationItems = getPaginationItems(currentPage, totalPages); // Generate items to display
  // -----------------------------

  // --- Pagination Handlers ---
  const handlePageChange = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      window.scrollTo({ top: 0, behavior: 'smooth' }); // Optional: scroll to top on page change
    }
  };
  // ---------------------------

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
                  <div className="flex items-center justify-center p-8 col-span-2"> {/* Ensure loading spans columns */}
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#02BABA]"></div>
                  </div>
                ) : currentCourses.length === 0 ? ( // Check currentCourses for empty state
                  <div className="text-center p-8 text-gray-500 col-span-2"> {/* Ensure empty state spans columns */}
                    No courses found matching your criteria.
                  </div>
                ) : (
                  currentCourses.map((course, index) => (
                    <CourseCard
                      key={`course-${course?.id ?? index}`}
                      course={course}
                      view={view}
                    />
                  ))
                )}
              </div>

              {/* --- New Pagination Controls --- */}
              {!isLoading && totalPages > 1 && (
                <div className="flex justify-center items-center mt-8 space-x-4"> {/* Increased spacing */}
                  {paginationItems.map((item, index) =>
                    item === '...' ? (
                      <span key={`ellipsis-${index}`} className="text-gray-500 px-2">
                        ...
                      </span>
                    ) : (
                      <button
                        key={item}
                        onClick={() => handlePageChange(item as number)}
                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                          currentPage === item
                            ? 'bg-[#50C4D8] text-white' // Active page style from image
                            : 'text-gray-700 hover:bg-gray-100' // Inactive page style
                        }`}
                      >
                        {item}
                      </button>
                    )
                  )}
                </div>
              )}
              {/* --------------------------- */}

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

