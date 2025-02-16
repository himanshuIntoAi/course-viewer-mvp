"use client";
import React, { useEffect, useState } from "react";
import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";
import { fetchData } from "@/services/api";
import { getCartItems } from "@/services/api/cart_api";


export default function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const data = await getCartItems(201);
        console.log(data);
        setCartItems(data);
        const total = data.reduce((acc: number, item: any) => acc + item.course_price, 0);
        setTotalPrice(total);
      } catch (error) {
        console.error("Error fetching cart items:", error);
      }
    };

    fetchCartItems();
  }, []);

  return (
    <main className="bg-[#F8FDFB] min-h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4">

        {/* Page Heading */}
        <h1 className="text-3xl font-bold text-indigo-800 mb-1 mt-10">Cart</h1>
        <p className="text-gray-600 mb-8">
          View your courses which are ready to purchase.
        </p>

        {/* Cart Table */}
        <div className="w-full overflow-hidden rounded-lg border border-gray-200 mb-8">
          {/* Table header */}
          <div className="bg-teal-500 text-white grid grid-cols-[50px,auto,120px,120px,50px] items-center p-3 text-sm font-semibold">
            <span>S.No</span>
            <span>Product</span>
            <span className="text-center">Price</span>
            <span className="text-center">Discount</span>
            <span></span>
          </div>

          {/* Cart Items */}
          {cartItems.map((item, index) => (
            <div key={item.id} className="grid grid-cols-[50px,auto,120px,120px,50px] items-center p-4 text-sm border-t">
              <span>{index + 1}.</span>
              <div className="flex items-center gap-3">
                <img
                  src="/course-card-img.svg"
                  alt={item.course_title}
                  className="w-20 h-14 object-cover rounded"
                />
                <p className="font-medium text-gray-800">{item.course_title}</p>
              </div>
              <p className="text-center text-gray-700">${item.course_price}</p>
              <p className="text-center text-green-600 font-semibold">53%</p>
              <button className="text-red-400 hover:text-red-600 text-xl flex justify-end">
                &times;
              </button>
            </div>
          ))}
        </div>

        {/* Cart Summary */}
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Cart Summary</h2>

        {/* Main container: Billing address + total summary */}
        <div className="bg-white rounded-lg p-6 shadow-md flex flex-col md:flex-row gap-6">
          
          {/* Left: Billing Address */}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Billing Address
            </h3>

            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* First Name */}
              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  className="border p-2 rounded focus:outline-none focus:ring-1 ring-teal-500"
                />
              </div>
              {/* Last Name */}
              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  className="border p-2 rounded focus:outline-none focus:ring-1 ring-teal-500"
                />
              </div>

              {/* Email */}
              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">
                  Email*
                </label>
                <input
                  type="email"
                  className="border p-2 rounded focus:outline-none focus:ring-1 ring-teal-500"
                />
              </div>
              {/* Phone Number */}
              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  className="border p-2 rounded focus:outline-none focus:ring-1 ring-teal-500"
                />
              </div>
              
              {/* Address */}
              <div className="flex flex-col col-span-2">
                <label className="text-sm text-gray-600 mb-1">
                  Address
                </label>
                <textarea
                  className="border p-2 rounded focus:outline-none focus:ring-1 ring-teal-500"
                  rows={2}
                ></textarea>
              </div>
              
              {/* State */}
              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">
                  State
                </label>
                <input
                  type="text"
                  className="border p-2 rounded focus:outline-none focus:ring-1 ring-teal-500"
                />
              </div>

              {/* Pincode */}
              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">
                  Pincode
                </label>
                <input
                  type="text"
                  className="border p-2 rounded focus:outline-none focus:ring-1 ring-teal-500"
                />
              </div>

              {/* City */}
              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">
                  City
                </label>
                <input
                  type="text"
                  className="border p-2 rounded focus:outline-none focus:ring-1 ring-teal-500"
                />
              </div>
            </div>
          </div>

          {/* Right: Total Summary */}
          <div className="w-full md:w-80 border-l border-gray-200 pl-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Total Summary
            </h3>
            
            {/* Product List */}
            <div className="text-sm mb-4">
              <p className="font-medium mb-2">Product</p>
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <span>{item.course_title}</span>
                  <span className="font-semibold text-indigo-600">${item.course_price}</span>
                </div>
              ))}
            </div>

            {/* Grand Total */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-700">Grand Total:</span>
              <span className="text-teal-600 font-semibold">${totalPrice}</span>
            </div>

            {/* Buy Now button */}
            <button className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 rounded-md transition">
              Buy Now
            </button>

            {/* Note */}
            <p className="mt-2 text-xs text-gray-400">
              Course(s) will be added to the library
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
