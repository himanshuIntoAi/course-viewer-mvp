"use client"
import { StarRating } from "../star-rating/star-rating"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState } from 'react'
import { Course } from "@/services/types/course/course"
import { Bookmark, Star } from 'lucide-react'

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
  const router = useRouter();

  // Handler for navigating to course detail page
  const handleViewCourse = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click event from triggering
    router.push(`/course/${course.id}`);
  };

  // Handler for the entire card click
  const handleCardClick = () => {
    router.push(`/course/${course.id}`);
  };

  // Handler for bookmark click
  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click event from triggering
    // Add your bookmark logic here
  };

  return (
    <div 
      className={`bg-white rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow cursor-pointer ${
        view === 'list' ? 'flex' : 'flex flex-col'
      }`}
      onClick={handleCardClick}
    >
      {/* Course Image Section */}
      <div className={`${view === 'list' ? 'w-[320px] rounded-2xl' : 'w-full'} overflow-hidden`}>
        <img
          src={"https://foundr.com/wp-content/uploads/2021/09/Best-online-course-platforms.png"}
          alt={course.title}
          className="object-cover w-full h-full aspect-video"
          onError={() => setImageError(true)}
        />
      </div>

      {/* Course Content Section */}
      <div className="flex-1 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            {/* Title */}
            <h3 className="text-[#16197C] text-xl font-semibold leading-tight mb-2">
              {course.title || 'Complete Web Designing Course for Beginners'}
            </h3>

            {/* Description */}
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              {course.description || 'Practical online workshops — Learn from home of office in small and intimate classes with direct teacher feedback.'}
            </p>
          </div>
          <div className="flex items-center gap-1.5 mb-3">
            <div className="text-[#5D5FEF]">
              <Star className="w-4 h-4 fill-[#5D5FEF]" />
            </div>
            <span className="text-xs font-medium text-[#5D5FEF]">Featured</span>
          </div>
        </div>

        {/* Price and Rating Section */}
        <div className="flex items-center justify-between">
          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="text-[#02BABA] text-2xl font-bold">
              ${course.price || '49'}
            </span>
            <span className="text-gray-400 text-sm line-through">
              ${course.original_price || '89'}
            </span>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[#16197C] text-xl font-bold">
                {course.rating || '4.7'}
              </span>
              <div className="flex">
                {Array(5).fill(null).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(course.rating || 4)
                        ? 'fill-[#FFB800] text-[#FFB800]'
                        : 'fill-[#FFB800] text-[#FFB800] opacity-50'
                    }`}
                  />
                ))}
              </div>
            </div>
            <span className="text-gray-400 text-sm">
              {course.total_reviews || '89k'} Reviews
            </span>
          </div>
        </div>

        {/* Add to Cart Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 border-2 border-gray-200 rounded-md px-2 py-4">
            <button 
              className="text-gray-400 hover:text-[#16197C] transition-colors"
              onClick={handleBookmarkClick}
            >
              <Bookmark className="w-5 h-5" />
            </button>
          </div>

          <button 
            className="px-4 mt-6 bg-[#02BABA] hover:bg-[#029999] text-white font-medium py-3 rounded-xl transition-colors"
            onClick={handleViewCourse}
          >
            View Course
          </button>
        </div>
      </div>
    </div>
  );
}


