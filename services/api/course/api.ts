import axios from "axios";

const API_BASE_URL = "https://cou-ip-bkend-dev.vercel.app";



export const fetchCourseData = async (courseId: string) => {
  const response = await axios.get(`${API_BASE_URL}/api/v1/courses/${courseId}`);
  return response.data;
};