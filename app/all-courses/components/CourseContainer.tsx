"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { CourseCard } from ".";
import { getAllCourses, ApiCourse, getCourseSubcategories, SubcategoryDto, getCoursesBySubcategory, searchCourses, getCourseCategories, CourseCategoryDto, getCoursesByCategory } from "@/services/api/course/api";

interface CourseContainerProps {
	onSearchChange?: (query: string) => void;
	searchQuery?: string;
}

function CourseContainer({ searchQuery: externalSearchQuery }: CourseContainerProps) {
	const [courses, setCourses] = useState<ApiCourse[]>([]);
	const [currentPage, setCurrentPage] = useState(1);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const coursesPerPage = 12; // 4 per row x 3 rows
	const [subcategories, setSubcategories] = useState<SubcategoryDto[]>([]);
	const [categories, setCategories] = useState<CourseCategoryDto[]>([]);
	const [activeSubcategory, setActiveSubcategory] = useState<SubcategoryDto | null>(null);
	const [activeCategory, setActiveCategory] = useState<CourseCategoryDto | null>(null);
	const [searchQuery, setSearchQuery] = useState<string>(externalSearchQuery || "");
	const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>(externalSearchQuery || "");
	const [reachedEnd, setReachedEnd] = useState<boolean>(false);

	// Debounce search query
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearchQuery(searchQuery);
		}, 300);

		return () => clearTimeout(timer);
	}, [searchQuery]);

	useEffect(() => {
		const fetchCourses = async () => {
			setLoading(true);
			setError(null);
			try {
				const skip = (currentPage - 1) * coursesPerPage;
				let data: ApiCourse[] = [];
				
				if (debouncedSearchQuery.trim()) {
					// Search takes priority over subcategory filter
					data = await searchCourses(debouncedSearchQuery, skip, coursesPerPage);
				} else if (activeCategory) {
					data = await getCoursesByCategory(activeCategory.id, skip, coursesPerPage);
				} else if (activeSubcategory) {
					data = await getCoursesBySubcategory(activeSubcategory.id, skip, coursesPerPage);
				} else {
					data = await getAllCourses(skip, coursesPerPage);
				}
				setCourses(data);
				setReachedEnd(data.length === 0);
			} catch (error: unknown) {
				const message =
					(error && typeof error === 'object' && 'message' in error && typeof (error as { message?: unknown }).message === 'string')
						? (error as { message: string }).message
						: 'Failed to fetch courses';
				setError(message);
				console.error('Error fetching courses:', error);
			} finally {
				setLoading(false);
			}
		};

		fetchCourses();
	}, [currentPage, activeSubcategory, activeCategory, debouncedSearchQuery]);

	useEffect(() => {
		const loadSubcategories = async () => {
			try {
				const data = await getCourseSubcategories();
				setSubcategories(data.slice(0, 8)); // show first 8
			} catch (e) {
				console.error(e);
			}
		};
		const loadCategories = async () => {
			try {
				const data = await getCourseCategories();
				setCategories(data);
			} catch (e) {
				console.error(e);
			}
		};
		loadSubcategories();
		loadCategories();
	}, []);

	const handlePageChange = (page: number) => {
		setCurrentPage(page);
		setReachedEnd(false);
		window.scrollTo({ top: 0, behavior: 'smooth' });
	};
	const handleSelectSubcategory = (sub: SubcategoryDto) => {
		setActiveSubcategory(sub);
		setCurrentPage(1);
		setSearchQuery(""); // Clear search when selecting subcategory
		setActiveCategory(null); // Clear category when selecting subcategory
	};

	// Intentionally keeping `onSearchChange` prop for potential parent-driven search,
	// but local search is controlled via internal state and filters in this component.

	// Sync with external search query changes
	useEffect(() => {
		if (externalSearchQuery !== undefined) {
			setSearchQuery(externalSearchQuery);
		}
	}, [externalSearchQuery]);

// total pages unknown; we paginate by requesting next page until fewer than page size is returned

	// Helper function to get category name from category_id
	const getCategoryName = (categoryId?: number | null): string => {
		const categories: { [key: number]: string } = {
			1: "Software Development",
			2: "IT & Consulting", 
			3: "Business",
			4: "Sales & Marketing",
			5: "Healthcare",
			6: "Data Science"
		};
		return categories[categoryId || 0] || "General";
	};

	// Helper function to get course level
	const getCourseLevel = (course: ApiCourse): string => {
		if (course.Course_level) return course.Course_level;
		if (course.title.toLowerCase().includes('beginner')) return 'Beginner';
		if (course.title.toLowerCase().includes('intermediate')) return 'Intermediate';
		if (course.title.toLowerCase().includes('advanced')) return 'Advanced';
		return 'Beginner';
	};

	// Helper function to get duration
	const getDuration = (course: ApiCourse): string => {
		if (course.Avg_Completion_Time) return `${course.Avg_Completion_Time}Hrs`;
		return '2Hrs'; // Default
	};

	return (
		<div
			className="w-full bg-no-repeat bg-center bg-cover"
			style={{
				backgroundImage:
					"url(/images/course-catalog/transparent-bg-course-catalog.png)",
			}}
		>
			<div className="w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-12 md:py-16">
				<div className="text-center">
					<h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-gray-900">
						Explore the Catalog
					</h2>
					<p className="mt-2 text-sm sm:text-base text-gray-600">
						Start a conversation and find learning to match your goals.
					</p>
				</div>

				<div className="mt-6 flex flex-col items-center gap-3">
					<div className="flex flex-wrap items-center justify-center gap-3">
						<button className="rounded-full border border-violet-300 bg-white/70 px-4 py-2 text-xs sm:text-sm text-gray-800 shadow-sm hover:bg-violet-50 flex items-center gap-2">
						<Image src={"/images/course-catalog/magicpen.svg"} alt="magic pen" width={20} height={30}/>
						<span>
							I’m new to coding, what courses should I take?
						</span>
						</button>
						<button className="rounded-full border border-violet-300 bg-white/70 px-4 py-2 text-xs sm:text-sm text-gray-800 shadow-sm hover:bg-violet-50 flex items-center gap-2">
						<Image src={"/images/course-catalog/magicpen.svg"} alt="magic pen" width={20} height={30}/>
						<span>
							What can I learn for my career?
						</span>
						</button>
					</div>
					<button className="rounded-full border border-violet-300 bg-white/70 px-4 py-2 text-xs sm:text-sm text-gray-800 shadow-sm hover:bg-violet-50 flex items-center gap-2">
						<Image src={"/images/course-catalog/magicpen.svg"} alt="magic pen" width={20} height={30}/>
						<span>
						Projects can help me showcase my skills?
						</span>
					</button>
				</div>

				<div className="mt-5 flex items-center justify-center">
					<div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs sm:text-sm text-gray-700 shadow-sm">
						<span>Struck? ask our AI to explore prefect courses for you!!</span>
						<span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-violet-600 text-white">★</span>
					</div>
				</div>

				{/* Trending subjects */}
				<div className="mt-10">
					<h3 className="text-base sm:text-lg font-semibold text-gray-900">
						Trending subjects & languages
					</h3>
					<div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
					{(subcategories.length ? subcategories : [
						{ id: 6, name: "Artificial Intelligence" },
						{ id: 7, name: "Cloud Computing" },
						{ id: 5, name: "Cybersecurity" },
						{ id: 17, name: "Software Development" },
						]).map((s) => (
							<div
								key={s.id}
								className={`rounded-xl border-2 px-4 py-5 text-center shadow-xs cursor-pointer ${
									activeSubcategory?.id === s.id ? 'border-violet-600 bg-violet-50' : 'border-violet-300 bg-white/80'
								}`}
								onClick={() => handleSelectSubcategory(s)}
							>
								<p className="text-[11px] text-gray-500">Explore all</p>
								<p className="mt-0.5 text-base sm:text-lg font-semibold text-gray-900">
									{s.name}
								</p>
							</div>
						))}
            </div>
       </div>

				{/* Filters row */}
		<div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex flex-wrap gap-2">
				{/* All button */}
				<button
					className={
						"rounded-md border px-3 py-1.5 text-xs sm:text-sm " +
						(!activeCategory && !activeSubcategory && !debouncedSearchQuery.trim()
							? "border-violet-500 bg-violet-600 text-white"
							: "border-gray-200 bg-white text-gray-700 hover:bg-gray-50")
					}
					onClick={() => { setActiveCategory(null); setActiveSubcategory(null); setSearchQuery(""); setCurrentPage(1); }}
				>
					All
				</button>
				{(categories.length ? categories : []).map((cat) => (
					<button
						key={cat.id}
						className={
							"rounded-md border px-3 py-1.5 text-xs sm:text-sm " +
							(activeCategory?.id === cat.id
								? "border-violet-500 bg-violet-600 text-white"
								: "border-gray-200 bg-white text-gray-700 hover:bg-gray-50")
						}
						onClick={() => { setActiveCategory(cat); setActiveSubcategory(null); setSearchQuery(""); setCurrentPage(1); }}
					>
						{cat.name}
					</button>
				))}
					</div>
					<div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
						<span>Sort by:</span>
						<select className="rounded-md border border-gray-200 bg-white px-2 py-1.5 text-gray-700">
							<option>Relevance</option>
							<option>Newest</option>
							<option>Top Rated</option>
						</select>
					</div>
				</div>

				{/* Catalog preview cards */}
				<div className="mt-6">
					<p className="text-sm text-gray-600">Browse full catalog</p>
					
					{loading && (
						<div className="mt-4 flex items-center justify-center py-8">
							<div className="text-gray-600">Loading courses...</div>
						</div>
					)}

					{error && (
						<div className="mt-4 flex items-center justify-center py-8">
							<div className="text-red-600">Error: {error}</div>
						</div>
					)}

					{!loading && !error && (
						<div className="mt-4 grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
							{courses.map((course) => (
								<CourseCard
									key={course.id}
									courseId={course.id}
									category={getCategoryName(course.category_id)}
									title={course.title}
									description={course.description || "No description available"}
									level={getCourseLevel(course)}
									duration={getDuration(course)}
									rating={course.ratings || 0}
									ratingCount={Math.floor(Math.random() * 5000) + 100} // Random rating count
									price={course.price ? `$${course.price}` : "Free"}
									instructorName={course.instructor?.name?.trim() || "Instructor"}
									instructorTitle={course.instructor?.expertise || "Expert"}
									instructorAvatar="/mascot2.png" // Default avatar
									imageSrc="/course-card-img.svg" // Default course image
								/>
							))}
						</div>
					)}

					{/* Pagination: Previous / Next only */}
					{!loading && !error && courses.length > 0 && (
						<div className="mt-8 flex items-center justify-center gap-3">
					<button
								className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 disabled:opacity-40 hover:bg-gray-50"
								onClick={() => handlePageChange(currentPage - 1)}
								disabled={currentPage === 1}
							>
								Previous
							</button>
					<button
								className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 disabled:opacity-40 hover:bg-gray-50"
								onClick={() => handlePageChange(currentPage + 1)}
						disabled={reachedEnd || loading}
							>
								Next
							</button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

export default CourseContainer;