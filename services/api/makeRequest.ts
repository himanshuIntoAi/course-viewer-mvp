import axios, { AxiosInstance, AxiosResponse } from 'axios';

// Create an Axios instance with default config
export const makeRequest: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
makeRequest.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
makeRequest.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    // Handle global error responses (401, 403, etc.)
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login or clear token
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        // Consider redirecting to login
      }
    }
    return Promise.reject(error);
  }
); 