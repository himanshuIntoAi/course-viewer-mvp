import axios from "axios";
import { Course } from '@/services/types/course/course';

export const getCourseData = async (courseId: number): Promise<Course> => {
  try {
    // Log the URL being called for debugging
    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/courses/${courseId}`;
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