'use client'

import { Sidebar } from "../../components/sidebar/sidebar"
import { CourseCard } from "../../components/course-card-all-courses/course-card"
import { CoursesTopSection } from "../../components/all-courses-top-section/courses-top-section"
import Navbar from "../../components/navbar/navbar"
import { useState, useEffect, useCallback } from 'react'
import { getCourses } from "@/services/api/course-and-filters/api"
import { Grid, List } from "lucide-react"
import { getFilteredCourses } from "@/services/api/course-and-filters/api"
import { Course } from "@/services/types/course/course"

interface Filters {
  category_id?: string | null;
  subcategory_id?: string | null;
  course_type_id?: string | null;
  sells_type_id?: string | null;
  language_id?: string | null;
  mentor_id?: string | null;
  is_flagship?: string | null;
  active?: string | null;
  min_price?: string | null;
  max_price?: string | null;
  min_ratings?: string | null;
  max_ratings?: string | null;
}

export default function CoursesPage() {
  const [view, setView] = useState<'grid' | 'list'>('list')
  const [coursesData, setCoursesData] = useState<Course[]>([])
  const [displayedCourses, setDisplayedCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)
  const [filters, setFilters] = useState<Filters>({})

  const fetchAllCourses = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getCourses();
      setCoursesData(response);
      setDisplayedCourses(response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err : new Error('An error occurred while fetching courses');
      setError(errorMessage);
      console.error('Error fetching all courses:', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getAttFiltersFromSidebar = useCallback(async (newFilters: Filters) => {
    console.log("Filters from sidebar", newFilters)
    const hasValues = Object.values(newFilters).some(value => value !== null && value !== '')
    if (hasValues) {
      setFilters(newFilters)
    } else {
      setFilters({})
      await fetchAllCourses()
    }
  }, [fetchAllCourses])

  useEffect(() => {
    fetchAllCourses()
  }, [fetchAllCourses])

  useEffect(() => {
    const fetchFilteredCourses = async () => {
      try {
        setIsLoading(true);
        setError(null);
        if (Object.keys(filters).length > 0) {
          const response = await getFilteredCourses(filters)
          console.log("Filtered courses:", response)
          setCoursesData(response)
          setDisplayedCourses(response)
        } else {
          await fetchAllCourses()
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err : new Error('An error occurred while fetching filtered courses');
        setError(errorMessage);
        console.error('Error fetching filtered courses:', errorMessage)
      } finally {
        setIsLoading(false)
      }
    }

    fetchFilteredCourses()
  }, [filters, fetchAllCourses])

  const handleSearch = useCallback((query: string) => {
    if (!query.trim()) {
      setDisplayedCourses(coursesData)
      return
    }
    
    const filtered = coursesData.filter(course => {
      const titleMatch = course.title?.toLowerCase().includes(query.toLowerCase()) ?? false;
      const instructorMatch = course.instructor?.display_name?.toLowerCase().includes(query.toLowerCase()) ?? false;
      return titleMatch || instructorMatch;
    })
    setDisplayedCourses(filtered)
  }, [coursesData])

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E4F7F7] to-white">
      <Navbar />
      <div className="flex flex-col gap-6">
        <CoursesTopSection onSearch={handleSearch} />

        <div className="container mx-auto px-4">
          <div className="flex gap-8">
            <Sidebar filtersPassingFunction={getAttFiltersFromSidebar} />

            <div className="flex-1">
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
              </div>

              {error && (
                <div className="text-red-500 p-4 mb-4 bg-red-50 rounded-lg">
                  {error.message}
                </div>
              )}

              <div className={`${view === 'grid' ? 'grid grid-cols-2 gap-4' : 'space-y-4'} mb-8`}>
                {isLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : displayedCourses.length === 0 ? (
                  <div className="text-center p-8 text-gray-500">
                    No courses found
                  </div>
                ) : (
                  displayedCourses.map((course, index) => {
                    const uniqueKey = `course-${course?.id ?? index}`;
                    return (
                      <CourseCard 
                        key={uniqueKey}
                        course={course} 
                        view={view} 
                      />
                    )
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

