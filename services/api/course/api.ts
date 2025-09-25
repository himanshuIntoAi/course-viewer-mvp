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

// Course Categories
export interface CourseCategoryDto {
  id: number;
  name: string;
  is_flagship: boolean;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export const getCourseCategories = async (): Promise<CourseCategoryDto[]> => {
  try {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/coursecategories/`;
    console.log('Fetching course categories from:', url);
    const response = await axios.get<CourseCategoryDto[]>(url);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error: any) {
    console.error('Error fetching course categories:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      url: error.config?.url
    });
    return [];
  }
};

// Course Topic type
export interface CourseTopic {
  id: number;
  course_id: number;
  title: string;
  topic_order: number;
  image_path?: string | null;
  is_expanded?: boolean | null;
  active: boolean;
  created_at: string;
  created_by?: number | null;
  updated_at: string;
  updated_by?: number | null;
}

// Course Lesson type (only fields we need on client)
export interface CourseLesson {
  id: number;
  topic_id: number;
  course_id: number;
  title: string;
  active: boolean;
}

// Course Learning Content (Details tab) - response shape
export interface CourseLearningContentLessonItem {
  id: number;
  course_id: number;
  topic_id: number;
  title: string;
  content?: string | null; // HTML string or plain text
  active: boolean;
  created_at?: string;
  updated_at?: string;
  video_source?: string | null;
  video_path?: string | null;
  video_filename?: string | null;
  image_path?: string | null;
  code?: string | null;
  code_language?: string | null;
  code_output?: string | null;
  is_completed?: boolean;
  created_by?: number | null;
  updated_by?: number | null;
}

export interface CourseLearningContentSummary {
  total_lessons: number;
  total_quizzes: number;
  total_flashcards: number;
  total_mindmaps: number;
  total_memory_games: number;
  total_topics: number;
}

export interface CourseLearningContentBlock {
  lessons?: CourseLearningContentLessonItem[];
  quizzes?: CourseLearningContentQuizItem[];
  flashcards?: CourseLearningContentFlashcardItem[];
  mindmaps?: CourseLearningContentMindmapItem[];
  memory_games?: CourseLearningContentMemoryGameItem[];
  topics?: CourseLearningContentTopicItem[];
}

export interface CourseLearningContentResponse {
  course_id: number;
  course_title?: string;
  learning_content?: CourseLearningContentBlock;
  content_summary?: CourseLearningContentSummary;
}

// Details tab item interfaces to avoid `any`
export interface CourseLearningContentQuizItem {
  id: number;
  title: string;
}

export interface CourseLearningContentFlashcardItem {
  id: number;
  front: string;
  back?: string | null;
}

export interface CourseLearningContentMindmapItem {
  id: number;
  title?: string | null;
}

export interface CourseLearningContentMemoryGameItem {
  id: number;
  description: string;
}

export interface CourseLearningContentTopicItem {
  id: number;
  title: string;
}

export const getCourseData = async (courseId: number): Promise<Course> => {
  try {
    // Log the URL being called for debugging
    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/course-learning/courses/${courseId}/details`;
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

// Fetch high-level learning content/overview for Details tab
export const getCourseLearningContent = async (
  courseId: number
): Promise<CourseLearningContentResponse | null> => {
  try {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/course-learning/courses/${courseId}/learning-content/`;
    console.log('Fetching course learning content from:', url);
    const { data } = await axios.get<CourseLearningContentResponse>(url);
    return data ?? null;
  } catch (error: any) {
    console.error('Error fetching course learning content:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      url: error.config?.url
    });
    return null;
  }
};

export const getAllCourses = async (skip: number = 0, limit: number = 30): Promise<ApiCourse[]> => {
  try {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/courses/?skip=${skip}&limit=${limit}`;
    console.log("Get ALL COURESE API URL", url);
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

// Fetch courses by category id with pagination
export const getCoursesByCategory = async (
  categoryId: number,
  skip: number = 0,
  limit: number = 10
): Promise<ApiCourse[]> => {
  try {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/courses/categories/${categoryId}?skip=${skip}&limit=${limit}`;
    console.log('Fetching courses by category from:', url);
    const response = await axios.get<ApiCourse[]>(url);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error: any) {
    console.error('Error fetching courses by category:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      url: error.config?.url
    });
    return [];
  }
};

// Fetch topics for a course
export const getCourseTopics = async (courseId: number): Promise<CourseTopic[]> => {
  try {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/course-learning/courses/${courseId}/topics/`;
    console.log('Fetching course topics from:', url);

    const { data } = await axios.get<CourseTopic[]>(url);
    return Array.isArray(data) ? data.sort((a, b) => a.topic_order - b.topic_order) : [];
  } catch (error: any) {
    console.error('Error fetching course topics:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      url: error.config?.url
    });
    return [];
  }
};

// Fetch lessons for a course (titles only used in UI)
export const getCourseLessons = async (courseId: number): Promise<CourseLesson[]> => {
  try {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/course-learning/courses/${courseId}/lessons/`;
    console.log('Fetching course lessons from:', url);

    const { data } = await axios.get<any[]>(url);
    // Map to lightweight lesson objects
    return Array.isArray(data)
      ? data.map((l) => ({
          id: l.id,
          topic_id: l.topic_id,
          course_id: l.course_id,
          title: l.title,
          active: Boolean(l.active)
        }))
      : [];
  } catch (error: any) {
    console.error('Error fetching course lessons:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      url: error.config?.url
    });
    return [];
  }
};

// Fetch list of course subcategories (names only)
export interface SubcategoryDto { id: number; name: string }

export const getCourseSubcategories = async (): Promise<SubcategoryDto[]> => {
  try {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/courses/subcategories`;
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
    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/courses/subcategories/${subcategoryId}?skip=${skip}&limit=${limit}`;
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
    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/courses/search?q=${encodeURIComponent(query)}&skip=${skip}&limit=${limit}`;
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