import React, { useState, useEffect } from 'react'
import { Course } from "@/services/types/course/course"
import { addToCart } from "@/services/api/cart/api"
import Image from 'next/image'

interface CartItem {
  user_id: number;
  course_id: number;
}

interface CourseCardProps {
  course: Course;
  view?: 'grid' | 'list';
}

interface User {
  id: number;
  display_name?: string;
  email?: string;
  is_student?: boolean;
  is_instructor?: boolean;
  profile_image?: string;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, view = 'grid' }) => {
  const [isAddingToCart, setIsAddingToCart] = useState<boolean>(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [imageError, setImageError] = useState<boolean>(false);

  useEffect(() => {
    const userString = localStorage.getItem("user");
    if (userString) {
      try {
        const user: User = JSON.parse(userString);
        setUserId(user.id);
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error);
      }
    }
  }, []);

  const handleAddToCart = async (): Promise<void> => {
    if (!userId) {
      alert("Please login to add to cart");
      return;
    }

    try {
      setIsAddingToCart(true);
      const cartItem: CartItem = {
        user_id: userId,
        course_id: course.id
      };
      await addToCart(cartItem);
      alert("Course successfully added to cart!");
    } catch (error) {
      console.error("Failed to add course to cart:", error);
      alert("Failed to add course to cart");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleImageError = (): void => {
    setImageError(true);
  };

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${view === 'list' ? 'flex' : ''}`}>
      <div className="relative w-full h-48">
        <Image 
          src={imageError ? "/images/course-placeholder.svg" : (course.image_url || "/images/course-placeholder.svg")}
          alt={course.title || 'Course image'}
          fill
          className="object-cover rounded-lg"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={true}
          onError={handleImageError}
        />
      </div>
      <div className="p-4 flex flex-col justify-between flex-grow">
        <div>
          <h3 className="text-lg font-semibold mb-2">{course.title}</h3>
          <p className="text-gray-600 mb-2">{course.description}</p>
          <p className="text-gray-500">
            By {course.instructor?.display_name || 'Unknown Instructor'}
          </p>
        </div>
        <div className="mt-4 flex justify-between items-center">
          <span className="text-lg font-bold text-[#16197C]">
            ${course.price.toFixed(2)}
          </span>
          <button
            onClick={handleAddToCart}
            disabled={isAddingToCart}
            className="bg-[#16197C] text-white px-4 py-2 rounded hover:bg-[#13165f] disabled:opacity-50"
          >
            {isAddingToCart ? 'Adding...' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
};
