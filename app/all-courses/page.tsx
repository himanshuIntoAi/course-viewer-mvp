'use client'

import { Sidebar } from "../../components/sidebar/sidebar"
import { CourseCard } from "../../components/course-card-all-courses/course-card"
import { CoursesTopSection } from "../../components/all-courses-top-section/courses-top-section"
import Navbar from "../../components/navbar/navbar"
import { useState, useEffect } from 'react'
import { getCategories, getCourses } from '../../services/api/explore-courses/api'
import { Category, Course, PaginatedResponse } from '../../services/api/explore-courses/api'
import { Grid, List } from "lucide-react"


export default function CoursesPage() {
  const [view, setView] = useState<'grid' | 'list'>('list')
  const [categories, setCategories] = useState<Category[]>([])
  const [allInstructors, setAllInstructors] = useState<{id: number; display_name: string; count: number}[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState({
    categories: [] as string[],
    ratings: [] as number[],
    instructors: [] as number[],
    priceType: 'all' as 'all' | 'free' | 'paid',
    levels: [] as string[]
  })
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
  const [coursesData, setCoursesData] = useState<PaginatedResponse<Course>>({
    items: [],
    total: 0,
    page: 1,
    size: 10,
    pages: 0
  })

  // Listen for view changes from navbar
  useEffect(() => {
    const handleViewChange = (event: CustomEvent<'grid' | 'list'>) => {
      setView(event.detail)
    }

    const handleSearchResults = (event: CustomEvent<{
      filteredCourses: Course[],
      coursesData: PaginatedResponse<Course>
    }>) => {
      setFilteredCourses(event.detail.filteredCourses)
      setCoursesData(prevData => ({
        ...event.detail.coursesData,
        size: prevData.size // Maintain the current page size
      }))
    }

    const handlePageSizeChange = (event: CustomEvent<number>) => {
      const newSize = event.detail
      const start = 0 // Reset to first page
      const end = newSize
      
      // Recalculate pagination with new size
      setCoursesData(prevData => {
        const newPages = Math.max(1, Math.ceil(prevData.total / newSize))
        return {
          ...prevData,
          items: filteredCourses.slice(start, end),
          page: 1,
          size: newSize,
          pages: newPages
        }
      })
    }

    const handlePageChange = (event: CustomEvent<number>) => {
      const newPage = event.detail
      const start = (newPage - 1) * coursesData.size
      const end = start + coursesData.size
      
      setCoursesData(prevData => ({
        ...prevData,
        items: filteredCourses.slice(start, end),
        page: newPage
      }))
    }

    window.addEventListener('viewChange', handleViewChange as EventListener)
    window.addEventListener('searchResults', handleSearchResults as EventListener)
    window.addEventListener('pageSizeChange', handlePageSizeChange as EventListener)
    window.addEventListener('pageChange', handlePageChange as EventListener)
    
    return () => {
      window.removeEventListener('viewChange', handleViewChange as EventListener)
      window.removeEventListener('searchResults', handleSearchResults as EventListener)
      window.removeEventListener('pageSizeChange', handlePageSizeChange as EventListener)
      window.removeEventListener('pageChange', handlePageChange as EventListener)
    }
  }, [coursesData.size, filteredCourses])

  // Fetch categories and calculate counts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesData, coursesResponse] = await Promise.all([
          getCategories(),
          getCourses()
        ])

        console.log('API Response - Courses:', coursesResponse.items)

        setFilteredCourses(coursesResponse.items || [])

        // Calculate category counts
        const categoryCountMap = new Map<number, number>()
        categoriesData.forEach(category => {
          categoryCountMap.set(category.id, 0)
        })
        
        coursesResponse.items.forEach((course: Course) => {
          if (course.category_id && categoryCountMap.has(course.category_id)) {
            categoryCountMap.set(
              course.category_id,
              (categoryCountMap.get(course.category_id) || 0) + 1
            )
          }
        })
        
        // Update categories with counts
        setCategories(categoriesData.map(category => ({
          ...category,
          count: categoryCountMap.get(category.id) || 0
        })))

        // Calculate instructor counts
        const instructorMap = new Map()
        coursesResponse.items.forEach((course: Course) => {
          console.log('Processing course:', course)
          const instructor = course.instructor || course.mentor
          console.log('Instructor found:', instructor)
          if (instructor && instructor.id && instructor.display_name) {
            if (!instructorMap.has(instructor.id)) {
              instructorMap.set(instructor.id, {
                id: instructor.id,
                display_name: instructor.display_name.trim(),
                count: 1
              })
            } else {
              const current = instructorMap.get(instructor.id)
              instructorMap.set(instructor.id, {
                ...current,
                count: current.count + 1
              })
            }
          }
        })

        const instructorsList = Array.from(instructorMap.values())
        console.log('Final instructors list:', instructorsList)
        setAllInstructors(instructorsList)

        // Initialize coursesData with the first page
        const pageSize = 10
        setCoursesData({
          items: coursesResponse.items.slice(0, pageSize),
          total: coursesResponse.items.length,
          page: 1,
          size: pageSize,
          pages: Math.max(1, Math.ceil(coursesResponse.items.length / pageSize))
        })

        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching data:', error)
        setCategories([])
        setFilteredCourses([])
        setAllInstructors([])
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  // Apply additional filters
  useEffect(() => {
    if (!filteredCourses.length) return

    const filtered = filteredCourses.filter(course => {
      const matchesCategories = !filters.categories?.length ||
        filters.categories.includes((course.category_id || 0).toString())

      const matchesInstructors = !filters.instructors?.length || 
        ((course.instructor || course.mentor) && filters.instructors.includes((course.instructor || course.mentor)!.id))

      const matchesRating = !filters.ratings?.length ||
        filters.ratings.includes(Math.round(course.ratings || 0))

      const matchesPrice = !filters.priceType || filters.priceType === 'all' ||
        (filters.priceType === 'free' && (course.price || 0) === 0) ||
        (filters.priceType === 'paid' && (course.price || 0) > 0)

      return matchesCategories && matchesInstructors && matchesRating && matchesPrice
    })

    // Reset to page 1 when filters change
    const newPage = 1;
    const start = (newPage - 1) * coursesData.size
    const end = start + coursesData.size

    // Update coursesData with filtered results and reset pagination
    setCoursesData({
      items: filtered.slice(start, end),
      total: filtered.length,
      page: newPage,
      size: coursesData.size,
      pages: Math.max(1, Math.ceil(filtered.length / coursesData.size))
    })

    // Notify navbar of page change
    const event = new CustomEvent('pageChange', { detail: newPage })
    window.dispatchEvent(event)
  }, [filteredCourses, filters])

  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters)
  }

  const handleSearch = (query: string) => {
    // Filter courses based on search query
    const filtered = filteredCourses.filter(course => {
      const matchesSearch = !query.trim() ||
        course.title?.toLowerCase().includes(query.toLowerCase()) ||
        (course.instructor?.display_name || course.mentor?.display_name)?.toLowerCase().includes(query.toLowerCase())
      return matchesSearch
    })

    // Update filtered courses and recalculate pagination
    const start = 0
    const end = coursesData.size

    setFilteredCourses(filtered)
    setCoursesData(prevData => ({
      items: filtered.slice(start, end),
      total: filtered.length,
      page: 1,
      size: prevData.size,
      pages: Math.max(1, Math.ceil(filtered.length / prevData.size))
    }))
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
              categories={categories} 
              instructors={allInstructors}
              onFiltersChange={handleFiltersChange}
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
                <span className="text-sm font-size-16px text-gray-600 font-inter">
                  Showing {((coursesData.page - 1) * coursesData.size) + 1}-
                  {Math.min(coursesData.page * coursesData.size, coursesData.total)} of {coursesData.total} results
                </span>
              </div>

              <div className={`${
                view === 'grid' 
                  ? 'grid grid-cols-2 gap-4' 
                  : 'space-y-4'
              } mb-8`}>
                {isLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : coursesData.items.length === 0 ? (
                  <div className="text-center p-8 text-gray-500">
                    No courses found
                  </div>
                ) : (
                  coursesData.items.map((course) => (
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
                      className={`p-2 border rounded-md ${
                        coursesData.page === 1 
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
                        className={`px-3 py-1.5 ${
                          coursesData.page === page
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
                      className={`p-2 border rounded-md ${
                        coursesData.page === coursesData.pages 
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

