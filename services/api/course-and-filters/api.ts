import axios from 'axios';
import { Course } from "@/services/types/course/course";

export const getAllFilters = async () => {
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/filters`);
    return response.data;
  } catch (error) {
    console.error('Error fetching filters:', error);
    throw error;
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
