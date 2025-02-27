import axios from "axios";

const API_BASE_URL = "https://cou-ip-bkend-dev.vercel.app";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// API Methods
export const fetchData = async (endpoint, params = {}) => {
  try {
    const url = new URL(endpoint, API_BASE_URL);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

    const response = await apiClient.get(url.toString());
    return response.data;
  } catch (error) {
    console.error("API Error:", error?.response?.data || error.message);
    throw error;
  }
};


export const postData = async (endpoint, data) => {
  try {
    console.log("POST Request to:", endpoint);
    console.log("Payload:", JSON.stringify(data, null, 2));

    const response = await apiClient.post(endpoint, data);
    console.log("Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("API Error:", error?.response?.data || error.message);
    throw error;
  }
};
