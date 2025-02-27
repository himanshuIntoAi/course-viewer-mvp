
import axios from "axios";
const API_BASE_URL = "https://cou-ip-bkend-dev.vercel.app";



export const getCartItems = async (user_id: string) => {
    const response = await axios.get(`${API_BASE_URL}/usercourse?user_id=${user_id}`);
    return response.data;   
};