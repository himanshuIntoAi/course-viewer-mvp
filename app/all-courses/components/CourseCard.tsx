"use client";

import React from "react";
import Image from "next/image";

type CourseCardProps = {
	category?: string;
	imageSrc?: string;
	level?: string;
	duration?: string;
	rating?: number;
	ratingCount?: number;
	title?: string;
	description?: string;
	instructorName?: string;
	instructorTitle?: string;
	instructorAvatar?: string;
	price?: string;
  courseId?: number;
};

function CourseCard({
	category = "DevOps",
	imageSrc = "/course-card-img.svg",
	level = "Beginner",
	duration = "2Hrs",
	rating = 4.5,
	ratingCount = 2851,
	title = "Ultimate DevOps Project Implementation",
	description =
		"End to End DevOps Implementation on an E-Commerce project with Resume preparation and Interview Q&A",
	instructorName = "Abhishek Veeramalla",
	instructorTitle = "DevOps Specialist",
	instructorAvatar = "/mascot2.png",
	price = "$30",
  courseId,
}: CourseCardProps) {
	const handleOpenDetail = () => {
		const url = `/course-detail?courseId=${courseId ?? 1339}`;
		window.location.href = url;
	};
	return (
		<div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm cursor-pointer" onClick={handleOpenDetail}>
			<div className="relative">
				{/* Cover image */}
				<div className="relative h-44 w-full">
					<Image src={imageSrc} alt={title} fill className="object-cover" />
				</div>
				{/* Category pill */}
				<div className="absolute left-3 top-3 inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-800 shadow">
					{category}
				</div>
			</div>

			<div className="p-4">
				{/* Badge row */}
				<div className="flex flex-wrap items-center gap-3">
					<div className="inline-flex items-center gap-1 rounded-md bg-green-100 px-2.5 py-1 text-xs font-medium text-green-800">
						<span className="inline-block h-3 w-3 rounded-sm bg-green-600" />
						{level}
					</div>
					<div className="flex items-center gap-1 text-xs text-gray-700">
						<span className="inline-block h-3 w-3 rounded-sm bg-gray-400" />
						{duration}
					</div>
					<div className="flex items-center gap-1 text-xs text-gray-700">
						<span className="text-amber-500">★</span>
						{rating}
						<span className="text-gray-500">({ratingCount})</span>
					</div>
				</div>

				{/* Title */}
				<h3 className="mt-3 text-[17px] font-semibold leading-6 text-gray-900">
					{title}
				</h3>

				{/* Description */}
				<p className="mt-2 line-clamp-3 text-[13px] leading-5 text-gray-600">
					{description}
				</p>

				{/* Instructor and price */}
				<div className="mt-4 flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="relative h-8 w-8 overflow-hidden rounded-full">
							<Image src={instructorAvatar} alt={instructorName} fill className="object-cover" />
						</div>
						<div className="leading-4">
							<p className="text-[13px] font-semibold text-violet-700">{instructorName}</p>
							<p className="text-[12px] text-gray-500">{instructorTitle}</p>
						</div>
					</div>
					<div className="text-right text-lg font-semibold text-gray-900">{price}</div>
				</div>
			</div>
		</div>
	);
}

export default CourseCard;


