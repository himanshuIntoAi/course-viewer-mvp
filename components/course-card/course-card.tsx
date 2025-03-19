import Link from "next/link";
import axios from "axios";
import { useState } from "react";
import { Course, CartItem } from "@/services/types/course/course";
import React from "react";
import { addToCart } from "@/services/api/cart/api";

interface CourseCardProps {
    course: Course;
    setShowCart: (show: boolean) => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, setShowCart }) => {
    const [userId, setUserId] = useState<string | null>(null);



    React.useEffect(() => {
        const userString = localStorage.getItem("user");
        if (userString) {
            try {
                const user = JSON.parse(userString);
                setUserId(user.id);
            } catch (error) {
                console.error("Error parsing user data from localStorage:", error);
            }
        }
    }, [])


    const handleAddToCart = async () => {
        if (!userId) {
            alert("please login to add to cart");
            return;
        }
        setShowCart(true);
        const cartData: CartItem = {
            user_id: Number(userId),
            course_id: Number(course.id),
        }
        try {
            await addToCart(cartData);
            alert("Course successfully added to cart!");
        } catch (error) {
            // console.error("Error adding to cart:");
            // alert("Failed to add course to cart");
        }
    }


    return (
        <div className="w-full max-w-sm bg-white rounded-xl shadow-lg overflow-hidden sticky top-[0px]" style={{ height: "max-content" }}>
            {/* Top Image/Heading Section */}
            <div className="">
                <img
                    src="/course-card-img.svg"
                    alt="Web Design Course"
                    className="h-44 w-full object-cover"
                />

            </div>

            {/* Content Section */}
            <div className="p-4 sm:p-6">
                {/* Top Text */}
                <h3 className="text-gray-800 text-lg font-semibold mb-2">
                    Subscribe to our top courses
                </h3>
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                    Get this course, plus 12,000+ of our top-rated courses, with Personal
                    Plan. <br />
                    <span className="font-medium">Full Time Access / Cancel Anytime</span>
                </p>

                {/* Subscription Button */}
                <button className="w-full border border-[#16197C] text-[#16197C] font-semibold py-2 px-4 rounded-md mb-3">
                    Start Subscription
                </button>

                {/* Or Divider */}
                <div className="flex items-center justify-center text-gray-500 text-sm mb-3">
                    <span>or</span>
                </div>

                {/* Price + Offer */}
                <div className="flex items-center justify-between text-gray-800 mb-2">
                    <div className="flex justify-between">
                        <span className="line-through text-sm text-gray-500">${course?.price}</span>
                        <span className="text-xl font-bold text-black">${course?.price}</span>
                    </div>
                    <span className="text-xs text-rose-600">Hurry | 2 days left</span>
                </div>

                {/* Add to Cart / Buy Now */}
                {/* <Link href="/cart"> */}
                <button
                    className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded-md mb-2"
                    onClick={handleAddToCart}
                >
                    Add to Cart
                </button>
                {/* </Link> */}
                <button className="w-full border border-teal-500 text-teal-500 font-semibold py-2 px-4 rounded-md mb-4 hover:bg-teal-50">
                    Buy Now
                </button>

                {/* Course Details */}
                <div className="text-sm text-gray-700 gap-y-2 mb-4">
                    <div className="flex justify-between border-b border-gray-200 pb-2">
                        <div className="font-medium">Start Date</div>
                        <div>2/02/2025</div>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 pb-2">
                        <div className="font-medium">Enrolled</div>
                        <div>100</div>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 pb-2">

                        <div className="font-medium">Languages</div>
                        <div>English</div>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 pb-2">
                        <div className="font-medium">Quizzes</div>
                        <div>10</div>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 pb-2">
                        <div className="font-medium">Certificate</div>
                        <div>Yes</div>
                    </div>
                    <div className="flex justify-between pb-2">
                        <div className="font-medium">Pass Percentage</div>
                        <div>90%</div>
                    </div>
                </div>

                {/* Social Icons (placeholder links) */}
                <div className="flex items-center justify-center space-x-4 mb-4">
                    <a
                        href="#"
                        className="text-gray-500 hover:text-blue-600 transition-colors"
                        aria-label="Facebook"
                    >
                        {/* Replace with actual icon */}
                        <svg
                            className="w-5 h-5 fill-current"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >
                            <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.99 3.66 9.12 8.44 9.88v-6.99H7.9v-2.89h2.54V9.41c0-2.5 1.49-3.89 3.78-3.89 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.89h2.78l-.44 2.89h-2.34V21.88C18.34 21.12 22 16.99 22 12z"></path>
                        </svg>
                    </a>

                    <a
                        href="#"
                        className="text-gray-500 hover:text-blue-600 transition-colors"
                        aria-label="LinkedIn"
                    >
                        {/* Replace with actual icon */}
                        <svg
                            className="w-5 h-5 fill-current"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >
                            <path d="M19 0h-14c-2.76...z" />
                        </svg>
                    </a>

                    <a
                        href="#"
                        className="text-gray-500 hover:text-red-600 transition-colors"
                        aria-label="Youtube"
                    >
                        {/* Replace with actual icon */}
                        <svg
                            className="w-5 h-5 fill-current"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >
                            <path d="M10 15l5.19-2.74L10...z" />
                        </svg>
                    </a>

                    <a
                        href="#"
                        className="text-gray-500 hover:text-pink-600 transition-colors"
                        aria-label="Instagram"
                    >
                        {/* Replace with actual icon */}
                        <svg
                            className="w-5 h-5 fill-current"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >
                            <path d="M12 2.16c3.2 0...z" />
                        </svg>
                    </a>
                </div>

                {/* Chat Button */}
                <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md">
                    Chat with humans
                </button>
            </div>
        </div>
    );
};

export default CourseCard;
