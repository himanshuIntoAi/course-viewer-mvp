import React from "react";

export default function ReviewsSection() {
  return (
    <div className="max-w-3xl mt-10 bg-white p-6 rounded-lg shadow">
      {/* Section Heading */}
      <h2 className="text-xl font-bold text-indigo-900 mb-6">Reviews</h2>

      {/* Top row: average rating + star distribution */}
      <div className="flex flex-col md:flex-row gap-6 mb-6">
        
        {/* Left card: overall rating */}
        <div className="bg-indigo-50 rounded-lg p-4 w-40 flex flex-col items-center justify-center">
          <p className="text-4xl font-bold text-gray-800">4.5</p>
          <div className="flex items-center my-1">
            {/* Example 4.5-star representation */}
            <span className="text-teal-500 mr-1">★★★★☆</span>
          </div>
          <p className="text-gray-600 text-sm">47,102 ratings</p>
        </div>

        {/* Right area: star distribution bars */}
        <div className="flex-1 flex flex-col justify-center space-y-2">
          {[
            { stars: 5, width: "w-4/5" },
            { stars: 4, width: "w-3/5" },
            { stars: 3, width: "w-2/5" },
            { stars: 2, width: "w-1/5" },
            { stars: 1, width: "w-1/12" },
          ].map((item) => (
            <div key={item.stars} className="flex items-center">
              <div className="bg-gray-200 w-48 h-3 rounded-full mr-2 relative overflow-hidden">
                <div className={`bg-teal-500 h-3 absolute top-0 left-0 ${item.width}`}></div>
              </div>
              <p className="text-sm text-gray-600">{item.stars} Stars</p>
            </div>
          ))}
        </div>
      </div>

      {/* Review Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Single review card */}
        <div className="border border-gray-200 rounded-md p-4 shadow-sm">
          <div className="flex items-center mb-2">
            {/* User initials avatar */}
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-semibold mr-2">
              SM
            </div>
            <div>
              <p className="font-semibold text-gray-800">Sakshi Malhotra</p>
              {/* Star rating */}
              <div className="text-teal-500 text-sm -mt-1">
                ★★★★☆ 
                {/* or use a half-star graphic for "4.5" */}
              </div>
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-3">
            “Good class and actually purchased this class few years back but now 
            finally have time to finish it, thanks.”
          </p>
          <div className="flex items-center text-gray-500 text-sm">
            <span className="mr-2">Helpful ?</span>
            <button className="mr-4 hover:text-teal-500 flex items-center">
              👍
            </button>
            <button className="hover:text-teal-500 flex items-center">
              👎
            </button>
          </div>
        </div>

        {/* Another review card (same content for demo) */}
        <div className="border border-gray-200 rounded-md p-4 shadow-sm">
          <div className="flex items-center mb-2">
            {/* User initials avatar */}
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-semibold mr-2">
              SM
            </div>
            <div>
              <p className="font-semibold text-gray-800">Sakshi Malhotra</p>
              <div className="text-teal-500 text-sm -mt-1">
                ★★★★☆ 
              </div>
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-3">
            “Good class and actually purchased this class few years back but now 
            finally have time to finish it, thanks.”
          </p>
          <div className="flex items-center text-gray-500 text-sm">
            <span className="mr-2">Helpful ?</span>
            <button className="mr-4 hover:text-teal-500 flex items-center">
              👍
            </button>
            <button className="hover:text-teal-500 flex items-center">
              👎
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
