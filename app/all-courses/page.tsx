'use client'

import { Sidebar } from "../../components/sidebar/sidebar"
import { CourseCard } from "../../components/course-card-all-courses/course-card"
import { CoursesTopSection } from "../../components/all-courses-top-section/courses-top-section"
import Navbar from "../../components/navbar/navbar"
import { useState, useEffect } from 'react'
import { getCourses } from "@/services/api/course-and-filters/api"
import { Grid, List } from "lucide-react"
import { getFilteredCourses } from "@/services/api/course-and-filters/api"
import { Course } from "@/services/types/course/course"


export default function CoursesPage() {
  const [view, setView] = useState<'grid' | 'list'>('list')
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])

  const [coursesData, setCoursesData] = useState<Course[]>([])
 
 
  const [isLoading, setIsLoading] = useState(true);

  const [filters, setFilters] = useState<object>({});

  async function getAttFiltersFromSidebar(filters: object) {
    console.log("Filters from sidebar", filters);
    // Only set filters if there are actual values
    const hasValues = Object.values(filters).some(value => value !== null && value !== '');
    if (hasValues) {
      setFilters(filters);
    } else {
      setFilters({});
      await fetchAllCourses();
    }
  }

  const fetchAllCourses = async () => {
    try {
      setIsLoading(true);
      const response = await getCourses();
      console.log("Response from getCourses", response);
      setCoursesData(response);
    } catch (error) {
      console.error('Error fetching all courses:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  
  useEffect(() => {
  


    fetchAllCourses();
  }, []);

  useEffect(() => {
    const fetchFilteredCourses = async () => {
      try {
        setIsLoading(true);
        if (Object.keys(filters).length > 0) {
          const response = await getFilteredCourses(filters);
          setCoursesData(response);
        } else {
          await fetchAllCourses();
        }
      } catch (error) {
        console.error('Error fetching filtered courses:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFilteredCourses();
  }, [filters]);


  const handleSearch = (query: string) => {
    // Filter courses based on search query
    const filtered = filteredCourses.filter(course => {
      const matchesSearch = !query.trim() ||
        course.title?.toLowerCase().includes(query.toLowerCase()) ||
        (course.instructor?.display_name || course.mentor?.display_name)?.toLowerCase().includes(query.toLowerCase())
      return matchesSearch
    })


  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E4F7F7] to-white">
      <Navbar />
      <div className="flex flex-col gap-6">
        <CoursesTopSection
          onSearch={handleSearch}
        />

        <div className="container mx-auto px-4">
          <div className="flex gap-8">
            <Sidebar
              filtersPassingFunction={getAttFiltersFromSidebar}
            />

            <div className="flex-1">
              {/* Grid/List View Controls */}
              <div className="flex items-center justify-between mb-4">
                <div className="inline-flex rounded-xl shadow-sm" role="group">
                  <button
                    onClick={() => setView('grid')}
                    className={`inline-flex items-center px-4 py-2 text-sm font-medium font-inter border border-gray-200
                        ${view === 'grid'
                        ? 'bg-[#16197C] text-white border-[#16197C] hover:bg-[#13165f]'
                        : 'bg-white text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                      } rounded-l-full`}
                  >
                    <Grid className="h-4 w-4 mr-2" />
                    Grid
                  </button>
                  <button
                    onClick={() => setView('list')}
                    className={`inline-flex items-center px-4 py-2 text-sm font-medium border border-l-0 border-gray-200
                        ${view === 'list'
                        ? 'bg-[#16197C] text-white border-[#16197C] hover:bg-[#13165f]'
                        : 'bg-white text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                      } rounded-r-full`}
                  >
                    <List className="h-4 w-4 mr-2" />
                    List
                  </button>
                </div>
                {/* <span className="text-sm font-size-16px text-gray-600 font-inter">
                  Showing {((coursesData.page - 1) * coursesData.size) + 1}-
                  {Math.min(coursesData.page * coursesData.size, coursesData.total)} of {coursesData.total} results
                </span> */}
              </div>

              <div className={`${view === 'grid'
                  ? 'grid grid-cols-2 gap-4'
                  : 'space-y-4'
                } mb-8`}>
                {isLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : coursesData.length === 0 ? (
                  <div className="text-center p-8 text-gray-500">
                    No courses found
                  </div>
                ) : (
                  coursesData.map((course) => (
                    <CourseCard key={course.id} course={course} view={view} />
                  ))
                )}
              </div>

              {/* Pagination Controls */}
              {coursesData.pages > 1 && (
                <div className="flex items-center justify-between mt-6 bg-white p-4 rounded-lg shadow">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Show:</span>
                    <select
                      value={coursesData.size}
                      onChange={(e) => {
                        const event = new CustomEvent('pageSizeChange', {
                          detail: Number(e.target.value)
                        })
                        window.dispatchEvent(event)
                      }}
                      className="border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#16197C]"
                    >
                      {[5, 10, 15, 20].map(size => (
                        <option key={size} value={size}>
                          {size} per page
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => {
                        if (coursesData.page > 1) {
                          const event = new CustomEvent('pageChange', {
                            detail: coursesData.page - 1
                          })
                          window.dispatchEvent(event)
                        }
                      }}
                      disabled={coursesData.page === 1}
                      className={`p-2 border rounded-md ${coursesData.page === 1
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'hover:bg-gray-50 text-[#16197C]'
                        }`}
                    >
                      ←
                    </button>
                    {Array.from({ length: coursesData.pages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => {
                          const event = new CustomEvent('pageChange', {
                            detail: page
                          })
                          window.dispatchEvent(event)
                        }}
                        className={`px-3 py-1.5 ${coursesData.page === page
                            ? 'bg-[#16197C] text-white'
                            : 'border hover:bg-gray-50 text-[#16197C]'
                          } rounded-md`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => {
                        if (coursesData.page < coursesData.pages) {
                          const event = new CustomEvent('pageChange', {
                            detail: coursesData.page + 1
                          })
                          window.dispatchEvent(event)
                        }
                      }}
                      disabled={coursesData.page === coursesData.pages}
                      className={`p-2 border rounded-md ${coursesData.page === coursesData.pages
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'hover:bg-gray-50 text-[#16197C]'
                        }`}
                    >
                      →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

