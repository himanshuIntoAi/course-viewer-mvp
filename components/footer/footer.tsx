import React from 'react'

const 
footer = () => {
    return (
        <footer className="bg-white shadow-lg rounded-t-3xl p-10 mt-24" >
            {/* Curved Top Design (Placeholder for styling) */}
            {/* <div className="w-full h-10 bg-teal-500 rounded-t-full"></div> */}

            <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start gap-10">
                {/* Logo and Socials */}
                <div>
                    <div className="text-3xl font-bold flex items-center">
                        <img src="/app-logo.svg" alt="Logo" className="h-10 mr-2" /> {/* Placeholder for logo */}
                      
                    </div>
                    <div className="flex gap-4 mt-4">
                        {/* <Linkedin className="w-6 h-6 cursor-pointer hover:text-teal-500" />
                        <Instagram className="w-6 h-6 cursor-pointer hover:text-teal-500" />
                        <Facebook className="w-6 h-6 cursor-pointer hover:text-teal-500" /> */}
                        <p>Linkedin</p>
                        <p>Instagram</p>
                        <p>Facebook</p>
                    </div>
                </div>

                {/* Quick Links */}
                <div>
                    <h3 className="text-lg font-semibold">Quick Links</h3>
                    <div className="w-12 h-1 bg-teal-500 my-1"></div>
                    <ul className="space-y-2 text-gray-700">
                        <li><a href="#">Home</a></li>
                        <li><a href="#">About us</a></li>
                        <li><a href="#">Who we are?</a></li>
                        <li><a href="#">Blogs</a></li>
                        <li><a href="#">Community</a></li>
                        <li><a href="#">FAQ’s</a></li>
                    </ul>
                </div>

                {/* Resources */}
                <div>
                    <h3 className="text-lg font-semibold">Resources</h3>
                    <div className="w-12 h-1 bg-teal-500 my-1"></div>
                    <ul className="space-y-2 text-gray-700">
                        <li><a href="#">Careers</a></li>
                        <li><a href="#">Affiliates</a></li>
                        <li><a href="#">Events</a></li>
                        <li><a href="#">For Businesses</a></li>
                        <li><a href="#">For Charity</a></li>
                    </ul>
                </div>

                {/* Contact Us */}
                <div>
                    <h3 className="text-lg font-semibold">Contact Us</h3>
                    <div className="w-12 h-1 bg-teal-500 my-1"></div>
                    <p className="text-gray-700 italic">
                        83, 2, Next To Pizza Hut, Vyalikaval
                    </p>
                    <p className="text-gray-700 italic mt-2">+1 378-343-2344</p>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="mt-10 text-center text-gray-500 text-sm">
                <p>&copy; 2025, CloudOU Inc.</p>
                <div className="flex justify-center gap-4 mt-2">
                    <a href="#" className="hover:underline">Privacy Policy</a> |
                    <a href="#" className="hover:underline">Terms & Conditions</a> |
                    <a href="#" className="hover:underline">Site Maps</a>
                </div>
            </div>

            {/* Scroll to Top Button */}
            <button
                className="fixed bottom-5 right-5 bg-teal-500 text-white p-3 rounded-full shadow-lg hover:bg-teal-600 transition"
            
            >
                ↑
            </button>
        </footer>
    )
}

export default footer