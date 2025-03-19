import axios from "axios";
import { CartItem } from "@/services/types/course/course";


export const getCartItems = async (user_id: string): Promise<CartItem[]> => {
    try {
      const response = await axios.get<CartItem[]>(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/usercourse?user_id=${user_id}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching cart items:", error);
      throw error;
    }
};

export const addToCart = async(data: { user_id: number, course_id: number }): Promise<CartItem> => {
  try {
    const response = await axios.post<CartItem>(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/usercourse/cart?user_id=${data.user_id}&course_id=${data.course_id}`,
      '', // Empty body as per the curl command
      {
        headers: {
          'accept': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    // console.error("Error adding to cart:", error);
    throw error;
  }
}