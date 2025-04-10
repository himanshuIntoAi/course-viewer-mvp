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

  // Use Map to ensure unique IDs
  const categoriesMap = new Map();
  const subcategoriesMap = new Map();
  const courseTypesMap = new Map();
  const sellsTypesMap = new Map();
  const languagesMap = new Map();

  courses.forEach(course => {
    if (course.category_id && course.category_name) {
      categoriesMap.set(course.category_id, {
        id: course.category_id,
        name: course.category_name
      });
    }
    if (course.subcategory_id && course.subcategory_name) {
      subcategoriesMap.set(course.subcategory_id, {
        id: course.subcategory_id,
        name: course.subcategory_name
      });
    }
    if (course.course_type_id && course.course_type_name) {
      courseTypesMap.set(course.course_type_id, {
        id: course.course_type_id,
        name: course.course_type_name
      });
    }
    if (course.sells_type_id && course.sells_type_name) {
      sellsTypesMap.set(course.sells_type_id, {
        id: course.sells_type_id,
        name: course.sells_type_name
      });
    }
    if (course.language_id && course.language_name) {
      languagesMap.set(course.language_id, {
        id: course.language_id,
        name: course.language_name
      });
    }
  });

  // Calculate price range
  const prices = courses.map(course => Number(course.price));
  const min_price = Math.min(...prices.filter(price => !isNaN(price))) || 0;
  const max_price = Math.max(...prices.filter(price => !isNaN(price))) || 1000;

  // Calculate ratings range
  const ratings = courses.map(course => Number(course.ratings));
  const min_rating = Math.min(...ratings.filter(rating => !isNaN(rating))) || 0;
  const max_rating = Math.max(...ratings.filter(rating => !isNaN(rating))) || 5;

  return {
    categories: Array.from(categoriesMap.values()),
    subcategories: Array.from(subcategoriesMap.values()),
    course_types: Array.from(courseTypesMap.values()),
    sells_types: Array.from(sellsTypesMap.values()),
    languages: Array.from(languagesMap.values()),
    price_range: { min: min_price, max: max_price },
    ratings_range: { min: min_rating, max: max_rating }
  };
};

export const getAllFilters = async () => {
  // Return default filter options without making API calls
  return {
    categories: [],
    subcategories: [],
    course_types: [],
    sells_types: [],
    languages: [],
    price_range: { min: 0, max: 1000 },
    ratings_range: { min: 0, max: 5 }
  };
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

export const getFilteredCourses = async (filters: FilterState) => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/courses/filter`,
      filters,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error in getFilteredCourses:', error);
    throw error;
  }
};
