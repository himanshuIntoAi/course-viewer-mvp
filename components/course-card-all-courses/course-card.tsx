"use client"
import { StarRating } from "../star-rating/star-rating"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState } from 'react'
import { Course } from "@/services/api/explore-courses/api"

interface CourseCardProps {
  course: Course
  view: 'grid' | 'list'       
}

// Helper function to format date consistently
function formatDate(dateString: string) {
  const date = new Date(dateString);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function CourseCard({ course, view }: CourseCardProps) {
  const [imageError, setImageError] = useState(false);
  const instructorData = course.instructor || course.mentor;
  const router = useRouter();
  return (
    <div className={`bg-white rounded-lg border p-4 ${
      view === 'list' ? 'flex flex-col md:flex-row' : 'flex flex-col'
    } gap-4`} onClick={() => router.push(`/course/${course.id}`)} >
      <div className="relative w-full md:w-64 h-48 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
        <Image
          src={imageError ? '/course-placeholder.svg' : '/course-placeholder.svg'}
          alt={course.title}
          fill
          className="object-cover rounded-lg"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={true}
        />
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h3 className="font-semibold text-lg font-poppins">{course.title}</h3>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-500">
                {course.is_flagship && (
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    Flagship Course
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <p className="text-sm text-gray-600 mt-2">
          {course.description}
        </p>
        
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <div className="space-y-1">
              {instructorData && (
                <div className="text-sm">
                  <span className="text-gray-700">
                    By <span className="font-medium">{instructorData.display_name.trim()}</span>
                  </span>
                  <div className="mt-1">
                    <StarRating rating={course.ratings ? Math.round(Number(course.ratings)) : 0} />
                  </div>
                </div>
              )}
              <span className="text-gray-500 text-sm">
                • Created: {formatDate(course.created_at)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-lg font-bold text-blue-600">
                {course.price === 0 ? 'Free' : `$${course.price}`}
              </span>
            </div>
            <button className="px-4 py-2 bg-[#16197C] text-white rounded-lg hover:bg-[#13165f] transition-colors font-medium text-sm">
              ADD TO CART
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

