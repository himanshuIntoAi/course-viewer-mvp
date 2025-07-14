// Using axios for HTTP requests instead of direct database access
import axios from 'axios';

// Setup base URL from environment variable
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

// Create a function to make database requests through the API
const makeDbRequest = async (endpoint: string, method: string = 'GET', data?: unknown) => {
  try {
    const response = await axios({
      method,
      url: `${API_URL}${endpoint}`,
      data,
      headers: {
        'Content-Type': 'application/json',
      }
    });
    return response.data;
  } catch (error) {
    console.error('Database request error:', error);
    throw error;
  }
};

export { makeDbRequest }; 