import { makeRequest } from '../makeRequest';

export interface Topic {
  id: number;
  title: string;
  topic_order: number;
  course_id: number;
  image_path?: string;
  is_expanded: boolean;
  active: boolean;
  created_at: string;
  created_by: number;
  updated_at: string;
  updated_by?: number;
}

export interface Lesson {
  id: number;
  title: string;
  content: string;
  topic_id: number;
  course_id: number;
  video_source?: string;
  video_path?: string;
  video_filename?: string;
  image_path?: string;
  is_completed: boolean;
  active: boolean;
  created_at: string;
  created_by: number;
  updated_at: string;
  updated_by?: number;
}

export interface CourseLearningResponse {
  topics: Topic[];
  lessons: Lesson[];
}

export const courseLearningApi = {
  // Get all topics for a course
  getTopics: async (courseId: string | number): Promise<Topic[]> => {
    try {
      const response = await makeRequest.get(`/course-learning/courses/${courseId}/topics/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching topics:', error);
      throw error;
    }
  },

  // Get all lessons for a course
  getLessons: async (courseId: string | number): Promise<Lesson[]> => {
    try {
      const response = await makeRequest.get(`/course-learning/courses/${courseId}/lessons/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching lessons:', error);
      throw error;
    }
  },

  // Get a specific lesson by ID
  getLesson: async (courseId: string | number, lessonId: string | number): Promise<Lesson> => {
    try {
      const response = await makeRequest.get(`/course-learning/courses/${courseId}/lessons/${lessonId}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching lesson:', error);
      throw error;
    }
  },

  // Get a specific topic by ID
  getTopic: async (courseId: string | number, topicId: string | number): Promise<Topic> => {
    try {
      const response = await makeRequest.get(`/course-learning/courses/${courseId}/topics/${topicId}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching topic:', error);
      throw error;
    }
  }
}; 