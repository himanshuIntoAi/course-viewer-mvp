import React, { useState, useEffect } from 'react';
import { getCartItems } from '@/services/api/cart/api';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const CourseCart = ({showCart , setShowCart}) => {
  const router = useRouter();
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [user_id , setUserId] = useState<string | null>(null);

  useEffect(() => {
    const userString = localStorage.getItem("user");
    if (userString) {
      try {
        const user = JSON.parse(userString);
        setUserId(user.id);
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error);
      }
    }
  }, []);

  const fetchCartItems = async () => {
    if (user_id) {
      try {
        const data = await getCartItems(user_id);
        setCartItems(data);
        const total = data.reduce((acc: number, item: any) => acc + item.course_price, 0);
        setTotalPrice(total);
      } catch (error) {
        console.error("Error fetching cart items:", error);
      }
    }
  };

  useEffect(() => {
    fetchCartItems();
  }, [showCart]);

  return (
    showCart && ( 
    <div className="bg-white w-full h-[70vh] max-w-sm p-5 rounded-md shadow-md absolute top-[0px] right-[0px] z-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-semibold">Your Courses Cart</h2>
        <button className="text-gray-400 hover:text-gray-600" onClick={() => setShowCart(false)}>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor">
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M6 18L18 6M6 6l12 12" 
            />
          </svg>
        </button>
      </div>

      {/* Course Item */}
      {cartItems.map((item , index) => (
        <div className="flex items-start mb-5" key={index}>
          <img src={item.course_image} alt="Course Thumbnail" className="w-20 h-14 object-cover rounded mr-4" />
          <div>
            <h3 className="text-base font-medium mb-1">{item.course_title}</h3>
            <div className="flex items-center space-x-2">
              <span className="text-green-500 font-bold">${item.course_price}</span>
            </div>
          </div>
        </div>
      ))}

      {/* Savings & Offer */}
      <div className="mb-5">
        <p className="text-sm font-semibold text-green-600">Saved: $40/-</p>
        <div className="flex items-center text-sm mt-1">
          <span>Offer Ends in :</span>
          <span className="ml-2 bg-blue-100 text-blue-600 px-2 py-1 rounded">
            1:01:23 Hrs
          </span>
        </div>
      </div>

      {/* Subtotal */}
      <div className="flex items-center justify-between border-t pt-3 mb-5">
        <span className="text-gray-500">Sub Total:</span>
        <span className="font-semibold">${totalPrice}/-</span>
      </div>

      {/* Buttons */}
      <div className="flex space-x-3">
        <button className="w-1/2 border border-teal-600 text-teal-600 font-medium py-2 rounded hover:bg-teal-50" onClick={() => router.push(`/cart/${user_id}`)}>
          View Cart
        </button>
        <button className="w-1/2 bg-teal-600 text-white font-medium py-2 rounded hover:bg-teal-700">
          Checkout
        </button>
      </div>
    </div>
    )
  );
};

export default CourseCart;
