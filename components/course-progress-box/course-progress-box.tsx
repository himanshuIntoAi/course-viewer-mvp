import React from "react";

interface ProgressProps {
  title: string;
  value: number;
  total?: number;
}

const ProgressCircle: React.FC<ProgressProps> = ({ title, value, total }) => {
  const percentage = total ? (value / total) * 100 : value;

  // Colors (Updated for unfinished modules with light orange)
  const colorMap: { [key: string]: { light: string; dark: string } } = {
    "Quiz Perfection": { light: "#C6F6D5", dark: "#38A169" }, // Green Shades
    "Module Completions": { light: "#FEEBC8", dark: "#E53E3E" }, // Orange Shades
  };

  const colors = colorMap[title] || { light: "#E2E8F0", dark: "#4A5568" }; // Default Gray

  return (
    <div className="flex flex-col items-center w-24">
      <div className="relative w-24 h-24">
        <svg className="w-full h-full" viewBox="0 0 40 40">
          {/* Background Circle (Light Color) */}
          <circle
            stroke={colors.light}
            strokeWidth="4"
            fill="transparent"
            cx="20"
            cy="20"
            r="18"
          />
          {/* Foreground Circle (Main Progress Color) */}
          <circle
            stroke={colors.dark}
            strokeWidth="4"
            fill="transparent"
            strokeDasharray="100"
            strokeDashoffset={`${100 - percentage}`}
            cx="20"
            cy="20"
            r="18"
            className="transition-all duration-500"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center font-bold text-lg">
          {total ? `${value}/${total}` : `${percentage}%`}
        </span>
      </div>
      <p className="mt-1 text-xs text-gray-600 text-center">{title}</p>
    </div>
  );
};


// MAIN COMPONENT
const CourseProgress: React.FC = () => {
  return (
    <div className="w-full max-w-[90vw] mx-auto bg-white shadow-lg rounded-xl border border-gray-200 px-8 py-6">
      {/* Breadcrumb */}

      {/* Title and Info */}
      <h1 className="text-xl font-bold text-blue-900">Complete Web Designing Course</h1>
      <p className="text-sm text-gray-600">Total Estimated Time: 2 hrs 30 mins</p>

      {/* Space After Estimated Time (Like Python print() Empty Line) */}
      <div className="h-6"></div>

      {/* Flex Container for Dates & Progress Circles */}
      <div className="flex items-center justify-between">
        {/* Dates Section (Aligned Left) */}
        <div className="flex flex-col text-left">
          <p className="font-semibold text-gray-700">
            Start Date: <span className="text-gray-600">3/01/2025</span>
          </p>

          {/* Small Gap Between Start Date & End Date */}
          <div className="h-2"></div>

          <p className="font-semibold text-gray-700">
            End Date: <span className="text-gray-600">20/02/2025</span>
          </p>
        </div>


        {/* Progress Circles Section (Aligned Right) */}
        <div className="flex gap-8">
          <ProgressCircle title="Module Completions" value={1} total={6} />
          <ProgressCircle title="Quiz Perfection" value={87} />
          <ProgressCircle title="Module Completions" value={1} total={6} />
          <ProgressCircle title="Module Completions" value={1} total={6} />
        </div>
      </div>
    </div>
  );
};



export default CourseProgress;
