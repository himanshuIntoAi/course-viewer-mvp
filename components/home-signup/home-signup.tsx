import React from "react";
import LoginForm from "../auth/LoginForm";
import MultiStepForm from "../onboarding-form/MultiStepForm";

const HomeSignupComponent = () => {
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
