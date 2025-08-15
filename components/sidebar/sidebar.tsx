"use client"
import React, { useState, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';

// Define TypeScript interfaces for the API response
interface FilterOption {
  id: string | number;
  label: string;
}

interface CompletionTime extends FilterOption {
  min: number;
  max: number;
}

interface Price extends FilterOption {
  value: number | null;
}

interface FiltersData {
  it_non_it: FilterOption[];
  coding_non_coding: FilterOption[];
  criteria: {
    categories: FilterOption[];
    levels: FilterOption[];
  };
  preferences: {
    price: Price[];
    completion_time: CompletionTime[];
  };
}

interface FilterState {
  it_non_it: boolean | null;
  coding_non_coding: boolean | null;
  category_id: number | null;
  level: string | null;
  price_type: string | null;
  completion_time: string | null;
  min_price: number | null;
  max_price: number | null;
}

export const Sidebar: React.FC<{ filtersPassingFunction: (filters: FilterState) => void }> = ({ filtersPassingFunction }) => {
  const [criteria, setCriteria] = useState(true);
  const [preferences, setPreferences] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<string[]>([]);
  const [isIT, setIsIT] = useState(false);
  const [isCoding, setIsCoding] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isLevelDropdownOpen, setIsLevelDropdownOpen] = useState(false);
  const [filtersData, setFiltersData] = useState<FiltersData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPrice, setSelectedPrice] = useState<string[]>([]);
  const [selectedCompletionTime, setSelectedCompletionTime] = useState<string[]>([]);

  // Fetch filters data
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/v1/courses/filters');
        if (!response.ok) {
          throw new Error('Failed to fetch filters');
        }
        const data = await response.json();
        setFiltersData(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching filters:', error);
        setLoading(false);
      }
    };

    fetchFilters();
  }, []);

  const toggleIT = () => {
    const newValue = !isIT;
    setIsIT(newValue);
    updateFilters({ it_non_it: !newValue });
  };

  const toggleCoding = () => {
    const newValue = !isCoding;
    setIsCoding(newValue);
    updateFilters({ coding_non_coding: !newValue });
  };

  const handleCategorySelect = (category: FilterOption) => {
    const newSelected = selectedCategory.includes(category.label)
      ? selectedCategory.filter((c) => c !== category.label)
      : [category.label];
    
    setSelectedCategory(newSelected);

    setTimeout(() => {
      updateFilters({ category_id: category.id as number });
    }, 0);
  };

  // Helper function to get current filters
  const getCurrentFilters = () => ({
    it_non_it: !isIT,
    coding_non_coding: !isCoding,
    category_id: filtersData?.criteria.categories.find(c => selectedCategory.includes(c.label))?.id as number || null,
    level: filtersData?.criteria.levels.find(l => selectedLevel.includes(l.label))?.id as string || null,
    price_type: filtersData?.preferences.price.find(p => selectedPrice.includes(p.label))?.id as string || null,
    completion_time: filtersData?.preferences.completion_time.find(t => selectedCompletionTime.includes(t.label))?.id as string || null,
    min_price: null,
    max_price: null,
  });

  const updateFilters = (newFilter: Partial<FilterState>) => {
    const currentFilters = getCurrentFilters();
    const updatedFilters = { ...currentFilters, ...newFilter } as FilterState;
    
    // Remove null values and ensure proper types
    const cleanFilters = Object.fromEntries(
      Object.entries(updatedFilters).filter(([, value]) => value !== null)
    );

    // Cast the cleaned filters back to FilterState with proper types
    const typedFilters: FilterState = {
      it_non_it: typeof cleanFilters.it_non_it === 'boolean' ? cleanFilters.it_non_it : null,
      coding_non_coding: typeof cleanFilters.coding_non_coding === 'boolean' ? cleanFilters.coding_non_coding : null,
      category_id: typeof cleanFilters.category_id === 'number' ? cleanFilters.category_id : null,
      level: typeof cleanFilters.level === 'string' ? cleanFilters.level : null,
      price_type: typeof cleanFilters.price_type === 'string' ? cleanFilters.price_type : null,
      completion_time: typeof cleanFilters.completion_time === 'string' ? cleanFilters.completion_time : null,
      min_price: typeof cleanFilters.min_price === 'number' ? cleanFilters.min_price : null,
      max_price: typeof cleanFilters.max_price === 'number' ? cleanFilters.max_price : null
    };

    // Use setTimeout to defer the filter update
    setTimeout(() => {
      filtersPassingFunction(typedFilters);
    }, 0);
  };

  // Similar updates for other handlers
  const handleLevelSelect = (level: FilterOption) => {
    const newSelected = selectedLevel.includes(level.label)
      ? selectedLevel.filter((l) => l !== level.label)
      : [level.label];
    
    setSelectedLevel(newSelected);

    setTimeout(() => {
      updateFilters({ level: level.id as string });
    }, 0);
  };

  const handlePriceSelect = (price: Price) => {
    const newSelected = selectedPrice.includes(price.label)
      ? selectedPrice.filter((p) => p !== price.label)
      : [price.label];
    
    setSelectedPrice(newSelected);

    setTimeout(() => {
      updateFilters({ price_type: price.id as string });
    }, 0);
  };

  const handleCompletionTimeSelect = (time: CompletionTime) => {
    const newSelected = selectedCompletionTime.includes(time.label)
      ? selectedCompletionTime.filter((t) => t !== time.label)
      : [time.label];
    
    setSelectedCompletionTime(newSelected);

    setTimeout(() => {
      updateFilters({ completion_time: time.id as string });
    }, 0);
  };

  if (loading) {
    return <div className="bg-white rounded-2xl p-6 shadow-sm max-w-[300px]">Loading...</div>;
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm max-w-[300px]">
      {/* IT | Non IT Card */}
      <div className="mb-4 bg-white rounded-2xl border border-gray-100 p-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-700 text-lg">IT | Non IT</span>
          <div className="relative w-[60px] h-[30px]">
            <div 
              onClick={toggleIT}
              className={`w-full h-full rounded-full cursor-pointer transition-colors duration-300 ${
                !isIT ? 'bg-green-500' : 'bg-gray-200'
              } flex items-center px-1`}
            >
              <div 
                className={`absolute w-[26px] h-[26px] bg-white rounded-full shadow-md transition-transform duration-300 flex items-center justify-center ${
                  !isIT ? 'translate-x-[26px]' : 'translate-x-0'
                }`}
              >
                <span className={`text-xs font-medium ${!isIT ? 'text-green-500' : 'text-gray-400'}`}>
                  {!isIT ? '' : ''}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Coding | Non-Coding Card */}
      <div className="mb-4 bg-white rounded-2xl border border-gray-100 p-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-700 text-lg">Coding | Non-Coding</span>
          <div className="relative w-[60px] h-[30px]">
            <div 
              onClick={toggleCoding}
              className={`w-full h-full rounded-full cursor-pointer transition-colors duration-300 ${
                !isCoding ? 'bg-green-500' : 'bg-gray-200'
              } flex items-center px-1`}
            >
              <div 
                className={`absolute w-[26px] h-[26px] bg-white rounded-full shadow-md transition-transform duration-300 flex items-center justify-center ${
                  !isCoding ? 'translate-x-[26px]' : 'translate-x-0'
                }`}
              >
                <span className={`text-xs font-medium ${!isCoding ? 'text-green-500' : 'text-gray-400'}`}>
                  {!isCoding ? '' : ''}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Criteria Section */}
      <div className="mb-4">
        <button
          className="flex justify-between items-center w-full p-4 bg-[#F8FAFA] rounded-xl"
          onClick={() => setCriteria(!criteria)}
        >
          <span className="text-gray-700 font-medium">Criteria</span>
          <ChevronDown className={`w-5 h-5 transition-transform ${criteria ? 'rotate-180' : ''}`} />
        </button>

        {criteria && filtersData && (
          <div className="mt-4 space-y-4 px-2">
            {/* Category */}
            <div className="space-y-2">
              <label className="text-gray-600">Category</label>
              <div className="relative">
                <div className="flex gap-2 flex-wrap mb-2">
                  {selectedCategory.map((cat) => (
                    <div key={cat} className="flex items-center gap-1 bg-[#F0F7FF] text-sm px-2 py-1 rounded-md">
                      <X className="w-4 h-4 text-[#16197C] cursor-pointer"
                        onClick={() => handleCategorySelect(filtersData.criteria.categories.find(c => c.label === cat) as FilterOption)}
                      />
                      <span className="text-[#16197C]">{cat}</span>
                    </div>
                  ))}
                </div>
                <button
                  className="flex justify-between items-center w-full p-3 border border-gray-200 rounded-lg"
                  onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                >
                  <span className="text-gray-400">Select</span>
                  <ChevronDown className={`w-5 h-5 ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isCategoryDropdownOpen && (
                  <div className="absolute z-10 w-full max-w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filtersData.criteria.categories.map((category) => (
                      <label
                        key={category.id}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 cursor-pointer overflow-hidden"
                      >
                        <input
                          type="checkbox"
                          checked={selectedCategory.includes(category.label)}
                          onChange={() => handleCategorySelect(category)}
                          className="w-4 h-4 accent-[#16197C] flex-shrink-0"
                        />
                        <span className="text-sm text-gray-700 truncate">
                          {category.label}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Level */}
            <div className="space-y-2">
              <label className="text-gray-600">Level</label>
              <div className="relative">
                <div className="flex gap-2 flex-wrap mb-2">
                  {selectedLevel.map((level) => (
                    <div key={level} className="flex items-center gap-1 bg-[#F0F7FF] text-sm px-2 py-1 rounded-md">
                      <X className="w-4 h-4 text-[#16197C] cursor-pointer"
                        onClick={() => handleLevelSelect(filtersData.criteria.levels.find(l => l.label === level) as FilterOption)}
                      />
                      <span className="text-[#16197C]">{level}</span>
                    </div>
                  ))}
                </div>
                <button
                  className="flex justify-between items-center w-full p-3 border border-gray-200 rounded-lg"
                  onClick={() => setIsLevelDropdownOpen(!isLevelDropdownOpen)}
                >
                  <span className="text-gray-400">Select</span>
                  <ChevronDown className={`w-5 h-5 ${isLevelDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isLevelDropdownOpen && (
                  <div className="absolute z-10 w-full max-w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filtersData.criteria.levels.map((level) => (
                      <label
                        key={level.id}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 cursor-pointer overflow-hidden"
                      >
                        <input
                          type="checkbox"
                          checked={selectedLevel.includes(level.label)}
                          onChange={() => handleLevelSelect(level)}
                          className="w-4 h-4 accent-[#16197C] flex-shrink-0"
                        />
                        <span className="text-sm text-gray-700 truncate">
                          {level.label}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Preferences Section */}
      <div className="mb-4">
        <button
          className="flex justify-between items-center w-full p-4 bg-[#F8FAFA] rounded-xl"
          onClick={() => setPreferences(!preferences)}
        >
          <span className="text-gray-700 font-medium">Preferences</span>
          <ChevronDown className={`w-5 h-5 transition-transform ${preferences ? 'rotate-180' : ''}`} />
        </button>

        {preferences && filtersData && (
          <div className="mt-4 space-y-4 px-2">
            {/* Price */}
            <div className="space-y-2">
              <label className="text-gray-600">Price</label>
              <div className="space-y-2">
                {filtersData.preferences.price.map((price) => (
                  <label key={price.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedPrice.includes(price.label)}
                      onChange={() => handlePriceSelect(price)}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <span className="text-gray-700">{price.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Average Completion Time */}
            <div className="space-y-2">
              <label className="text-gray-600">Average Completion Time</label>
              <div className="space-y-2">
                {filtersData.preferences.completion_time.map((time) => (
                  <label key={time.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedCompletionTime.includes(time.label)}
                      onChange={() => handleCompletionTimeSelect(time)}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <span className="text-gray-700">{time.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};