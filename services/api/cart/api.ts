import { CartItem } from "@/services/types/course/course";
import { makeRequest } from '@/services/api/makeRequest';
import { AxiosResponse, AxiosError } from 'axios';

export const getCartItems = (user_id?: string): Promise<CartItem[]> => {
  const endpoint = user_id ? `/usercourse?user_id=${user_id}` : '/cart-items';
  
  return makeRequest.get<CartItem[]>(endpoint)
    .then((response: AxiosResponse<CartItem[]>) => response.data)
    .catch((error: AxiosError) => {
      console.error('Error fetching cart items:', error);
      return [];
    });
};

export const addToCart = (data: { user_id: number, course_id: number }): Promise<CartItem> => {
  return makeRequest.post<CartItem>(
    `/usercourse/cart?user_id=${data.user_id}&course_id=${data.course_id}`,
    '', // Empty body as per the curl command
    {
      headers: {
        'accept': 'application/json'
      }
    }
  )
    .then((response: AxiosResponse<CartItem>) => response.data)
    .catch((error: AxiosError) => {
      console.error("Error adding to cart:", error);
      throw error;
    });
};

export const removeFromCart = (courseId: string): Promise<void> => {
  return makeRequest.delete(`/cart-items/${courseId}`)
    .then(() => {
      console.log('Course removed from cart successfully');
    })
    .catch((error: AxiosError) => {
      console.error('Error removing course from cart:', error);
      throw error;
    });
};