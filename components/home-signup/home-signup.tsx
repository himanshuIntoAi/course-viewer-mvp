import { useState } from "react";
import { FaEye, FaEnvelope, FaLock } from "react-icons/fa";
import OnBoardingChat from "../OnBoardingChat/OnBoardingChat";
import LoginForm from "../auth/LoginForm";
import MultiStepForm from "../onboarding-form/MultiStepForm";
const HomeSignupComponent = () => {
    const [passwordVisible, setPasswordVisible] = useState(false);

    return (
        <div className="flex md:flex-row min-h-screen p-[7vw] w-full ">
            {/* Left Section */}
            <div className="flex bg-white w-full h-full rounded-[100px]">
                <MultiStepForm />
                <LoginForm />   
            </div>

            {/* Right Section */}
        </div>
    );
};

export default HomeSignupComponent;
