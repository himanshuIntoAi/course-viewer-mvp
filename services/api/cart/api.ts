import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// API Methods
export const fetchData = async (endpoint: string, params: Record<string, string> = {}) => {
  try {
    const url = new URL(endpoint, API_BASE_URL);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

    const response = await apiClient.get(url.toString());
    return response.data;
  } catch (error: any) {
    console.error("API Error:", error?.response?.data || error.message);
    throw error;
  }
};


export const postData = async (endpoint: string, data: any) => {
  try {
    console.log("POST Request to:", endpoint);
    console.log("Payload:", JSON.stringify(data, null, 2));

    const response = await apiClient.post(endpoint, data);
    console.log("Response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("API Error:", error?.response?.data || error.message);
    throw error;
  }
};

export const getCartItems = async (user_id: string) => {
    const response = await axios.get(`${API_BASE_URL}/usercourse?user_id=${user_id}`);
    return response.data;   
};