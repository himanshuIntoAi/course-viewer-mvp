import React, { useState, useEffect } from 'react';
import { getCartItems } from '@/services/api/cart/api';
import { useRouter } from 'next/navigation';
import { CartItem } from '@/services/types/course/course';
import Image from 'next/image';
export default function CourseCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        setIsLoading(true);
        const items = await getCartItems();
        setCartItems(items);
      } catch (error) {
        console.error('Error fetching cart items:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCartItems();
  }, []);

  const totalPrice = cartItems.reduce((total, item) => total + (item.course_price || 0), 0);

  const handleProceedToCheckout = () => {
    router.push('/checkout');
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 w-full lg:w-96">
      <h2 className="text-2xl font-bold mb-6">Your Cart</h2>

      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <p>Loading cart items...</p>
        </div>
      ) : cartItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40">
          <p className="text-gray-500 mb-4">Your cart is empty</p>
          <button 
            onClick={() => router.push('/courses')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Explore Courses
          </button>
        </div>
      ) : (
        <>
          {/* Course Item */}
          {cartItems.map((item , index) => (
            <div className="flex items-start mb-5" key={index}>
              <Image src={item.image_url || '/course-card-img.svg'} alt="Course Thumbnail" className="w-20 h-14 object-cover rounded mr-4" />
              <div>
                <h3 className="text-base font-medium mb-1">{item.course_title}</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-green-500 font-bold">${item.course_price}</span>
                </div>
              </div>
            </div>
          ))}

          {/* Cart Summary */}
          <div className="border-t border-gray-200 pt-4 mt-4">
            <div className="flex justify-between mb-2">
              <span>Subtotal</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
          </div>

          {/* Checkout Button */}
          <button
            onClick={handleProceedToCheckout}
            className="w-full bg-blue-600 text-white py-3 rounded-lg mt-6 hover:bg-blue-700 transition duration-200"
          >
            Proceed to Checkout
          </button>
        </>
      )}
    </div>
  );
}
