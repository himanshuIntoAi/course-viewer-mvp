import { useState } from "react";
import { FaEye, FaEnvelope, FaLock } from "react-icons/fa";
import OnBoardingChat from "../OnBoardingChat/OnBoardingChat";
const HomeSignupComponent = () => {
    const [passwordVisible, setPasswordVisible] = useState(false);

    return (
        <div className="flex flex-col md:flex-row justify-center min-h-screen p-[7vw] bg-gray-100">
            {/* Left Section */}
            <div className="bg-[#16197C] text-white p-8 rounded-[50px] z-[1] w-full md:w-1/2">
                <div className="flex flex-row justify-between">
                    <div>
                        <h2 className="text-5xl font-bold">Find What’s Right For You</h2>
                        <p className="mt-2 text-xl">Help us to know about you</p>
                    </div>
                    <img src="/searching-looking.svg" alt="searching-looking" className="w-[10vw] h-[10vw]" />
                </div>

                <div className="flex items-center  my-4">
                    <div className="w-8 h-8 p-6 flex items-center justify-center bg-blue-500 text-center rounded-full">1</div>
                    <div className="w-[50%] h-1 bg-blue-500"></div>
                    <div className="w-8 h-8 p-6     flex items-center justify-center bg-blue-500 text-center rounded-full">2</div>
                    <div className="w-[50%] h-1 bg-gray-500"></div>
                    <div className="w-8 h-8 p-6 flex items-center justify-center bg-gray-500 text-center rounded-full">3</div>
                </div>
                <OnBoardingChat />


            </div>

            {/* Right Section */}
            <div className="bg-white p-12 relative left-[-35px] rounded-r-[50px]  shadow-lg w-full md:w-1/2 mt-6 md:mt-0">
                {/* Heading and Subheading */}
                <h2 className="text-5xl font-bold text-gray-900 mb-1">
                    Join Our Extra-Ordinary Journey
                </h2>
                <p className="text-black mb-6">
                    Sign-up and Start learning with AI
                </p>

                {/* Form Fields */}
                <div className="space-y-6">
                    {/* Email Field */}
                    <div className="relative">
                        <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-2xl" />
                        <input
                            type="email"
                            placeholder="email@mail.com"
                            className="w-full p-4 pl-12 pr-4 
                       border-2 border-[#16197C] rounded-2xl text-2xl
                       focus:outline-none focus:ring-2 focus:ring-[#16197C]"
                        />
                    </div>

                    {/* Password Field */}
                    <div className="relative">
                        <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-2xl" />
                        <input
                            type={passwordVisible ? "text" : "password"}
                            placeholder="********"
                            className="w-full p-4 pl-12 pr-12 
                       border-2 border-[#16197C] rounded-2xl text-2xl
                       focus:outline-none focus:ring-2 focus:ring-[#16197C]"
                        />
                        <FaEye
                            onClick={() => setPasswordVisible(!passwordVisible)}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 
                       text-gray-500 cursor-pointer"
                        />
                    </div>

                    {/* Submit Button */}
                    <button className="w-full bg-teal-500 text-white py-3 
                           rounded-full font-bold hover:bg-teal-600">
                        Become A Superstar
                    </button>

                    {/* OR Divider */}
                    <div className="flex items-center justify-center space-x-2">
                        <div className="h-px bg-gray-300 w-20" />
                        <span className="text-gray-400">OR</span>
                        <div className="h-px bg-gray-300 w-20" />
                    </div>

                    {/* Google Sign In Button */}
                    <button className="w-full border border-gray-300 py-3 rounded-full 
                           flex items-center justify-center gap-2 
                           hover:bg-gray-100">
                        <img
                            src="/google-logo.svg"
                            alt="Google Logo"
                            className="w-5 h-5"
                        />
                        <span className="text-gray-700 font-semibold">
                            Continue with Google
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HomeSignupComponent;
