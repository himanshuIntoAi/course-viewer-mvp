import axios from "axios";
import { Course } from '@/services/types/course/course';

// API Course type based on the provided response structure
export interface ApiCourse {
  id: number;
  title: string;
  description?: string | null;
  category_id?: number | null;
  subcategory_id?: number | null;
  course_type_id?: number | null;
  sells_type_id?: number | null;
  mentor_id?: number | null;
  language_id?: number | null;
  is_flagship: boolean;
  active: boolean;
  price?: number | null;
  ratings?: number | null;
  IT?: boolean | null;
  Coding_Required?: boolean | null;
  Avg_Completion_Time?: number | null;
  Course_level?: string | null;
  created_at: string;
  updated_at: string;
  instructor?: {
    id: number;
    name: string;
    profession?: string | null;
    expertise?: string | null;
    bio?: string | null;
  } | null;
}

export interface CoursesResponse {
  courses: ApiCourse[];
  total: number;
  skip: number;
  limit: number;
}

export const getCourseData = async (courseId: number): Promise<Course> => {
  try {
    // Log the URL being called for debugging
    const url = `http://127.0.0.1:8000/api/v1/course-learning/courses/${courseId}/details`;
    console.log('Fetching course from:', url);

    const response = await axios.get<Course>(url);
    
    // Log successful response
    console.log('Course data received:', response.data);
    
    return response.data;
  } catch (error: any) {
    // Detailed error logging
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      url: error.config?.url
    });
    
    if (error.response?.status === 404) {
      throw new Error('Course not found');
    }
    
    if (error.response?.status === 401) {
      throw new Error('Unauthorized access');
    }
    
    if (!error.response) {
      throw new Error('Network error - please check your connection');
    }
    
    throw new Error(`Failed to fetch course: ${error.message}`);
  }
};

export const getAllCourses = async (skip: number = 0, limit: number = 30): Promise<ApiCourse[]> => {
  try {
    const url = `http://127.0.0.1:8000/api/v1/courses/?skip=${skip}&limit=${limit}`;
    console.log('Fetching all courses from:', url);

    const response = await axios.get<ApiCourse[]>(url);
    
    console.log('Courses data received:', response.data);
    
    return response.data;
  } catch (error: any) {
    console.error('Error fetching courses:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      url: error.config?.url
    });
    
    if (error.response?.status === 404) {
      throw new Error('Courses not found');
    }
    
    if (error.response?.status === 401) {
      throw new Error('Unauthorized access');
    }
    
    if (!error.response) {
      throw new Error('Network error - please check your connection');
    }
    
    throw new Error(`Failed to fetch courses: ${error.message}`);
  }
};

// Fetch list of course subcategories (names only)
export interface SubcategoryDto { id: number; name: string }

export const getCourseSubcategories = async (): Promise<SubcategoryDto[]> => {
  try {
    const url = `http://127.0.0.1:8000/api/v1/courses/subcategories`;
    console.log('Fetching course subcategories from:', url);

    const response = await axios.get<SubcategoryDto[]>(url);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error: any) {
    console.error('Error fetching subcategories:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      url: error.config?.url
    });
    return [];
  }
};

// Fetch courses by subcategory id with pagination
export const getCoursesBySubcategory = async (
  subcategoryId: number,
  skip: number = 0,
  limit: number = 10
): Promise<ApiCourse[]> => {
  try {
    const url = `http://127.0.0.1:8000/api/v1/courses/subcategories/${subcategoryId}?skip=${skip}&limit=${limit}`;
    console.log('Fetching courses by subcategory from:', url);

    const response = await axios.get<ApiCourse[]>(url);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error: any) {
    console.error('Error fetching courses by subcategory:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      url: error.config?.url
    });
    return [];
  }
};

// Search courses by query with pagination
export const searchCourses = async (
  query: string,
  skip: number = 0,
  limit: number = 10
): Promise<ApiCourse[]> => {
  try {
    const url = `http://127.0.0.1:8000/api/v1/courses/search?q=${encodeURIComponent(query)}&skip=${skip}&limit=${limit}`;
    console.log('Searching courses from:', url);

    const response = await axios.get<ApiCourse[]>(url);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error: any) {
    console.error('Error searching courses:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      url: error.config?.url
    });
    return [];
  }
};