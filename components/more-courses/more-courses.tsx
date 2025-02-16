import React from "react";

export default function MoreCoursesPage() {
  const courses = [
    {
      id: 1,
      title: "Complete Web Designing Course for Beginners",
      label: "Bestseller",
      price: "$50",
      students: "894, 456",
      rating: 4.5,
      reviews: "Reviews",
      description:
        "Practical online workshops — Learn from home or office in small and intimate classes with direct teacher feedback.",
      image:
        "https://images.unsplash.com/photo-1487611459768-bd414656ea10?w=800&auto=format&fit=crop&q=60",
    },
    {
      id: 2,
      title: "Complete Web Designing Course for Beginners",
      label: "Bestseller",
      price: "$50",
      students: "894, 456",
      rating: 4.5,
      reviews: "Reviews",
      description:
        "Practical online workshops — Learn from home of office in small and intimate classes with direct teacher feedback.",
      image:
        "https://images.unsplash.com/photo-1487611459768-bd414656ea10?w=800&auto=format&fit=crop&q=60",
    },
    {
      id: 2,
      title: "Complete Web Designing Course for Beginners",
      label: "Bestseller",
      price: "$50",
      students: "894, 456",
      rating: 4.5,
      reviews: "Reviews",
      description:
        "Practical online workshops — Learn from home of office in small and intimate classes with direct teacher feedback.",
      image:
        "https://images.unsplash.com/photo-1487611459768-bd414656ea10?w=800&auto=format&fit=crop&q=60",
    },
    {
      id: 2,
      title: "Complete Web Designing Course for Beginners",
      label: "Bestseller",
      price: "$50",
      students: "894, 456",
      rating: 4.5,
      reviews: "Reviews",
      description:
        "Practical online workshops — Learn from home of office in small and intimate classes with direct teacher feedback.",
      image:
        "https://images.unsplash.com/photo-1487611459768-bd414656ea10?w=800&auto=format&fit=crop&q=60",
    }

  ];

  return (
    <div className="max-w-[95%] mx-auto p-6 mt-10">
      {/* Top: Heading + 'View all Courses' button */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          More Course By{" "}
          <span className="text-indigo-600">John Doe</span>
        </h1>
        <button className="px-5 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition">
          View all Courses
        </button>
      </div>

      <div className="flex flex-wrap justify-between">
        {courses.map((course) => (
          <div
            key={course.id}
            className="bg-white rounded-lg shadow hover:shadow-lg transition w-[23%] m-2"
          >
            {/* Course Image */}
            <img
              src={course.image}
              alt={course.title}
              className="w-full h-48 object-cover rounded-t-lg"
            />

            {/* Course Info */}
            <div className="p-4">
              {/* Label (e.g. 'Bestseller') */}
              <span className="inline-block bg-teal-500 text-white text-xs font-semibold px-2 py-1 rounded mb-2">
                {course.label}
              </span>

              {/* Course Title */}
              <h2 className="text-lg font-bold text-indigo-900 leading-tight mb-1">
                {course.title}
              </h2>

              {/* Course Description */}
              <p className="text-sm text-gray-700 mb-4">
                {course.description}
              </p>

              {/* Pricing / Rating row */}
              <div className="flex items-center justify-between mb-4">
                <p className="font-semibold text-gray-800">
                  {course.price}
                  <span className="text-sm text-gray-500 ml-2">
                    ({course.students})
                  </span>
                  <span className="text-sm text-gray-500 ml-1">
                    {course.reviews}
                  </span>
                </p>
                {/* Star rating example (4.5 stars) */}
                <div className="flex items-center text-teal-500">
                  {"★★★★☆"} {/* or use half-star icons for 4.5 */}
                </div>
              </div>

              {/* Add to Cart button */}
              <button className="w-full bg-indigo-900 hover:bg-indigo-800 text-white font-semibold py-2 rounded transition">
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
