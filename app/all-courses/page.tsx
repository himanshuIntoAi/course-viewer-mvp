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
  const [coursesData, setCoursesData] = useState<Course[]>([])
  const [displayedCourses, setDisplayedCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState<object>({})

  async function getAttFiltersFromSidebar(filters: object) {
    console.log("Filters from sidebar", filters)
    const hasValues = Object.values(filters).some(value => value !== null && value !== '')
    if (hasValues) {
      setFilters(filters)
    } else {
      setFilters({})
      await fetchAllCourses()
    }
  }

  const fetchAllCourses = async () => {
    try {
      setIsLoading(true)
      const response = await getCourses()
      console.log("Response from getCourses", response)
      setCoursesData(response)
      setDisplayedCourses(response)
    } catch (error) {
      console.error('Error fetching all courses:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAllCourses()
  }, [])

  useEffect(() => {
    const fetchFilteredCourses = async () => {
      try {
        setIsLoading(true)
        if (Object.keys(filters).length > 0) {
          const response = await getFilteredCourses(filters)
          setCoursesData(response)
          setDisplayedCourses(response)
        } else {
          await fetchAllCourses()
        }
      } catch (error) {
        console.error('Error fetching filtered courses:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchFilteredCourses()
  }, [filters])

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setDisplayedCourses(coursesData)
      return
    }
    
    const filtered = coursesData.filter(course => {
      return course.title?.toLowerCase().includes(query.toLowerCase()) ||
        course.instructor?.display_name?.toLowerCase().includes(query.toLowerCase())
    })
    setDisplayedCourses(filtered)
  }

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
                  displayedCourses.map((course) => (
                    <CourseCard key={course.id} course={course} view={view} />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

