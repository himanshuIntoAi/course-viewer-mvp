"use client"
import React from 'react'
import Navbar from '@/components/navbar/navbar'
import HomeSignupComponent from '@/components/home-signup/home-signup'
import TrendingCourses from '@/components/TrendingCourses/TrendingCourses'
import BestWayToLearn from '@/components/best-way-to-learn/bestWayToLearn'
import Footer from '@/components/footer/footer'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const Home = () => {

    const [user, setUser] = useState<boolean>(false);

    useEffect(() => {
        let user = localStorage.getItem("user");
        console.log("User at home ",user);
        if (user) {
            console.log("User at home ",user);
            setUser(JSON.parse(user));
        }
    }, [])
    return (
        <div>


            <div className="h-screen w-full bg-gray-100 from-[#E4F7F7] to-white " style={{ backgroundImage: "url('/home-hero.svg')" }} >
                {/* Navbar */}
                <Navbar />

                {/* Hero Section */}

                <section className="absolute flex items-center h-screen justify-left p-10">

                    <div className="relative left-0 bottom-[-10%]   text-white max-w-[80%]">
                        <h1 className="text-8xl font-bold">
                            <span className="text-teal-400">AI Infused</span> Self <br /> Tutoring 🌱
                        </h1>
                        <div className='flex flex-row gap-4'>
                            <p className="mt-4 text-lg">
                                Enable seamless course exploration and enrollment. Provide onboarding
                                experiences tailored to user types (students, mentors). Facilitate
                                communication between students and mentors.
                            </p>

                            <div>
                                <button className='bg-white flex items-center text-gray-800 px-6 py-3 rounded-full shadow-lg text-sm w-[15vw]  '>
                                    <span className='text-left'>Personalise Learning Pathway</span>
                                    <img src="/right-arrow-filled.svg" alt="right-arrow" className='' />
                                </button>
                            </div>
                        </div>

                    </div>
                </section>

                {/* Info Cards */}
                <div className="absolute top-40 right-10 flex flex-col space-y-4">
                    <div className="bg-white p-4 rounded-lg shadow-lg flex items-center space-x-4">
                        <div className="bg-blue-500 text-white p-2 rounded-full">🎓</div>
                        <p className="text-gray-800">Never Stop <strong>LEARNING</strong></p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-lg flex items-center space-x-4">
                        <div className="bg-teal-500 text-white p-2 rounded-full">💰</div>
                        <p className="text-gray-800">Never Stop <strong>EARNING</strong></p>
                    </div>
                </div>
            </div>

            {/* Footer */}
            {
                (user == false) && <HomeSignupComponent />
            }
            <TrendingCourses />
            <BestWayToLearn />

            <section className="max-w-7xl mx-auto px-4 py-10 flex flex-col-reverse md:flex-row items-center">
                {/* Left (Illustration) */}
                <div className="relative mt-8 md:mt-0 md:w-1/2 flex justify-center">
                    {/* Green circular background shape */}
                    <div className="absolute bg-green-100 rounded-full w-64 h-64 -z-10"
                        style={{ top: "0", left: "-2rem" }} />

                    {/* Illustration image (replace src with your own) */}
                    <img
                        src="/health-run.svg"
                        alt="Person on Skateboard"
                        className="relative max-w-sm"
                    />
                </div>

                {/* Right (Text and Button) */}
                <div className="md:w-1/2 md:pl-8">
                    <h1 className="text-4xl font-bold leading-tight text-gray-800 mb-4">
                        We Help You to Achieve <br className="hidden lg:block" />
                        Your Dream
                    </h1>
                    <p className="text-gray-600 mb-6">
                        1000+ courses offered to choose and learn on our platform.
                        Use our course helpers for doubts too...
                    </p>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition">
                        Let's Do It
                    </button>
                </div>
            </section>
            <Footer />
        </div>
    )
}

export default Home