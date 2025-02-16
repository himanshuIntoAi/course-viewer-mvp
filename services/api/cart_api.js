
import axios from "axios";
const API_BASE_URL = "https://backendcou-r4846xwah-projectcou.vercel.app/";



export const getCartItems = async (user_id) => {
    const response = await axios.get(`${API_BASE_URL}/usercourse?user_id=${user_id}`);
    return response.data;   
};