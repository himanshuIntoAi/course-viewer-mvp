import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getAllFilters } from '@/services/api/course-and-filters/api';
// Tailwind CSS components
export const Sidebar: React.FC<{ filtersPassingFunction: (filters: any) => void }> = ({ filtersPassingFunction }) => {
  const initialFilters = {
    category_id: '',
    subcategory_id: '',
    course_type_id: '',
    sells_type_id: '',
    language_id: '',
    mentor_id: '',
    is_flagship: '',
    active: '',
    min_price: '',
    max_price: '',
    min_ratings: '',
    max_ratings: '',
  };

  const [filters, setFilters] = useState(initialFilters);

  const [filterOptions, setFilterOptions] = useState({
    categories: [],
    subcategories: [],
    course_types: [],
    sells_types: [],
    languages: [],
    price_range: { min: 0, max: 1000 },
    ratings_range: { min: 0, max: 5 },
  });

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const data = await getAllFilters();
        if (data) {
          setFilterOptions(data);
        }
      } catch (error) {
        console.error('Error fetching filter options:', error);
      }
    };

    fetchFilterOptions();
  }, []);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newFilters = {
      ...filters,
      [name]: value === "" ? null : value,
    };
    setFilters(newFilters);
    
    // Only pass non-empty values to parent
    const cleanFilters = Object.fromEntries(
      Object.entries(newFilters).filter(([_, value]) => value !== null && value !== '')
    );
    filtersPassingFunction(cleanFilters);
  };

  console.log("Filters we get", filters);
  const fetchFilteredCourses = async () => {
    try {
      const response = await getAllFilters();
      console.log(response.data);

    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  return (
    <aside className="w-full md:w-1/4 p-4 border-r border-gray-200">
      <h2 className="text-lg font-bold mb-4">Find Your Tutor</h2>
      <div className="mb-4">
        <label className="block font-semibold">Category</label>
        <select name="category_id" value={filters.category_id} onChange={handleFilterChange} className="w-full p-2 border border-gray-300 rounded">
          <option value="">Select Category</option>
          {filterOptions.categories && filterOptions.categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label className="block font-semibold">Subcategory</label>
        <select name="subcategory_id" value={filters.subcategory_id} onChange={handleFilterChange} className="w-full p-2 border border-gray-300 rounded">
          <option value="">Select Subcategory</option>
          {filterOptions.subcategories && filterOptions.subcategories.map(subcategory => (
            <option key={subcategory.id} value={subcategory.id}>
              {subcategory.name}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label className="block font-semibold">Course Type</label>
        <select name="course_type_id" value={filters.course_type_id} onChange={handleFilterChange} className="w-full p-2 border border-gray-300 rounded">
          <option value="">Select Type</option>
          {filterOptions.course_types && filterOptions.course_types.map(courseType => (
            <option key={courseType.id} value={courseType.id}>
              {courseType.name}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label className="block font-semibold">Sells Type</label>
        <select name="sells_type_id" value={filters.sells_type_id} onChange={handleFilterChange} className="w-full p-2 border border-gray-300 rounded">
          <option value="">Select Type</option>
          {filterOptions.sells_types && filterOptions.sells_types.map(sellsType => (
            <option key={sellsType.id} value={sellsType.id}>
              {sellsType.name}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label className="block font-semibold">Language</label>
        <select name="language_id" value={filters.language_id} onChange={handleFilterChange} className="w-full p-2 border border-gray-300 rounded">
          <option value="">Select Language</option>
          {filterOptions.languages && filterOptions.languages.map(language => (
            <option key={language.id} value={language.id}>
              {language.name}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label className="block font-semibold">Flagship</label>
        <select name="is_flagship" value={filters.is_flagship} onChange={handleFilterChange} className="w-full p-2 border border-gray-300 rounded">
          <option value="">Select</option>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      </div>
      <div className="mb-4">
        <label className="block font-semibold">Active</label>
        <select name="active" value={filters.active} onChange={handleFilterChange} className="w-full p-2 border border-gray-300 rounded">
          <option value="">Select</option>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      </div>
      <div className="mb-4">
        <label className="block font-semibold">Min Price</label>
        <input
          type="number"
          name="min_price"
          value={filters.min_price}
          onChange={handleFilterChange}
          placeholder={filterOptions.price_range.min.toString()}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>
      <div className="mb-4">
        <label className="block font-semibold">Max Price</label>
        <input
          type="number"
          name="max_price"
          value={filters.max_price}
          onChange={handleFilterChange}
          placeholder={filterOptions.price_range.max.toString()}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>
      <div className="mb-4">
        <label className="block font-semibold">Min Ratings</label>
        <input
          type="number"
          name="min_ratings"
          value={filters.min_ratings}
          onChange={handleFilterChange}
          placeholder={filterOptions.ratings_range.min.toString()}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>
      <div className="mb-4">
        <label className="block font-semibold">Max Ratings</label>
        <input
          type="number"
          name="max_ratings"
          value={filters.max_ratings}
          onChange={handleFilterChange}
          placeholder={filterOptions.ratings_range.max.toString()}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>
      <button
        onClick={() => {
          filtersPassingFunction(filters);
          console.log("Filters we get", filters);
        }}
        className="w-full bg-purple-500 text-white py-2 rounded mt-2 hover:bg-purple-600"
      >
        Search
      </button>
      <button onClick={() => {
        filtersPassingFunction(initialFilters);
        setFilters(initialFilters);
      }} className="w-full bg-purple-500 text-white py-2 rounded mt-2 hover:bg-purple-600">Remove Filters</button>
    </aside>
  );
};