import axios from 'axios';
import { Course } from "@/services/types/course/course";

// Extract filter options from courses data
const extractFiltersFromCourses = (courses: Course[]) => {
  if (!courses || !Array.isArray(courses)) {
    return {
      categories: [],
      subcategories: [],
      course_types: [],
      sells_types: [],
      languages: [],
      price_range: { min: 0, max: 1000 },
      ratings_range: { min: 0, max: 5 }
    };
  }

  // Extract unique values for each filter type
  const categories = [...new Set(courses.map(course => ({
    id: course.category_id,
    name: course.category_name
  })))];

  const subcategories = [...new Set(courses.map(course => ({
    id: course.subcategory_id,
    name: course.subcategory_name
  })))];

  const course_types = [...new Set(courses.map(course => ({
    id: course.course_type_id,
    name: course.course_type_name
  })))];

  const sells_types = [...new Set(courses.map(course => ({
    id: course.sells_type_id,
    name: course.sells_type_name
  })))];

  const languages = [...new Set(courses.map(course => ({
    id: course.language_id,
    name: course.language_name
  })))];

  // Calculate price range
  const prices = courses.map(course => Number(course.price));
  const min_price = Math.min(...prices.filter(price => !isNaN(price))) || 0;
  const max_price = Math.max(...prices.filter(price => !isNaN(price))) || 1000;

  // Calculate ratings range
  const ratings = courses.map(course => Number(course.ratings));
  const min_rating = Math.min(...ratings.filter(rating => !isNaN(rating))) || 0;
  const max_rating = Math.max(...ratings.filter(rating => !isNaN(rating))) || 5;

  return {
    categories,
    subcategories,
    course_types,
    sells_types,
    languages,
    price_range: { min: min_price, max: max_price },
    ratings_range: { min: min_rating, max: max_rating }
  };
};

export const getAllFilters = async () => {
  try {
    // Log the API URL for debugging
    console.log("API URL:", process.env.NEXT_PUBLIC_API_URL);
    
    // Try first with the standard filters endpoint (with trailing slash)
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/filters/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching filters:', error);
    
    // If filters endpoint fails, try getting filters from courses
    try {
      console.log("Trying to extract filters from courses data");
      const coursesResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/courses/`);
      return extractFiltersFromCourses(coursesResponse.data);
    } catch (fallbackError) {
      console.error('Error fetching courses for filter extraction:', fallbackError);
      
      // Return default filter options to prevent UI from breaking
      return {
        categories: [],
        subcategories: [],
        course_types: [],
        sells_types: [],
        languages: [],
        price_range: { min: 0, max: 1000 },
        ratings_range: { min: 0, max: 5 }
      };
    }
  }
};

export const getCourses = async (): Promise<Course[]> => {
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/courses`);
    return response.data;
  } catch (error) {
    console.error('Error fetching courses:', error);
    throw error;
  }
};

export const getFilteredCourses = async (filters: any): Promise<Course[]> => {
  try {
    // Convert filters object to URL parameters
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/course?${params.toString()}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching filtered courses:', error);
    throw error;
  }
};
