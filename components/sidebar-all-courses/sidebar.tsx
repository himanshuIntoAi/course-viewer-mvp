import { CategoryCount, InstructorFilter } from "../services/api"
import { useState } from 'react'
import { StarRating } from "./star-rating"

interface SidebarProps {
  categories: CategoryCount[]
  instructors: { id: number; display_name: string; count: number }[]
  onFiltersChange?: (filters: {
    categories: string[]
    ratings: number[]
    instructors: number[]
    priceType: 'all' | 'free' | 'paid'
    levels: string[]
  }) => void
}

const ratings = [5, 4, 3, 2, 1]

const levels = [
  { name: "All Levels" },
  { name: "Beginner" },
  { name: "Intermediate" },
  { name: "Expert" },
]

const prices = [
  { type: 'all', label: 'All' },
  { type: 'free', label: 'Free' },
  { type: 'paid', label: 'Paid' },
] as const

export function Sidebar({ categories, instructors, onFiltersChange }: SidebarProps) {
  console.log('Sidebar received instructors:', instructors)
  
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedRatings, setSelectedRatings] = useState<number[]>([])
  const [selectedInstructors, setSelectedInstructors] = useState<number[]>([])
  const [selectedPriceType, setSelectedPriceType] = useState<'all' | 'free' | 'paid'>('all')
  const [selectedLevels, setSelectedLevels] = useState<string[]>([])

  const handleCategoryChange = (categoryId: string) => {
    const updated = selectedCategories.includes(categoryId)
      ? selectedCategories.filter(id => id !== categoryId)
      : [...selectedCategories, categoryId]
    setSelectedCategories(updated)
    onFiltersChange?.({
      categories: updated,
      ratings: selectedRatings,
      instructors: selectedInstructors,
      priceType: selectedPriceType,
      levels: selectedLevels
    })
  }

  const handleRatingChange = (rating: number) => {
    const updated = selectedRatings.includes(rating)
      ? selectedRatings.filter(r => r !== rating)
      : [...selectedRatings, rating]
    setSelectedRatings(updated)
    onFiltersChange?.({
      categories: selectedCategories,
      ratings: updated,
      instructors: selectedInstructors,
      priceType: selectedPriceType,
      levels: selectedLevels
    })
  }

  const handleInstructorChange = (instructorId: number) => {
    const updated = selectedInstructors.includes(instructorId)
      ? selectedInstructors.filter(id => id !== instructorId)
      : [...selectedInstructors, instructorId]
    setSelectedInstructors(updated)
    onFiltersChange?.({
      categories: selectedCategories,
      ratings: selectedRatings,
      instructors: updated,
      priceType: selectedPriceType,
      levels: selectedLevels
    })
  }

  const handlePriceTypeChange = (type: 'all' | 'free' | 'paid') => {
    setSelectedPriceType(type)
    onFiltersChange?.({
      categories: selectedCategories,
      ratings: selectedRatings,
      instructors: selectedInstructors,
      priceType: type,
      levels: selectedLevels
    })
  }

  const handleLevelChange = (level: string) => {
    const updated = selectedLevels.includes(level)
      ? selectedLevels.filter(l => l !== level)
      : [...selectedLevels, level]
    setSelectedLevels(updated)
    onFiltersChange?.({
      categories: selectedCategories,
      ratings: selectedRatings,
      instructors: selectedInstructors,
      priceType: selectedPriceType,
      levels: updated
    })
  }

  return (
    <aside className="w-[350px] bg-white shadow-lg rounded-[22px] p-8 space-y-8">
      {/* Categories Section */}
      <div className="space-y-4">
        <h3 className="text-[#16197C] text-2xl font-semibold font-poppins">Category</h3>
        <div className="space-y-3">
          {categories.map((category) => (
            <label key={category.name} className="flex items-center space-x-3 font-inter">
              <input 
                type="checkbox"
                checked={selectedCategories.includes(category.id.toString())}
                onChange={() => handleCategoryChange(category.id.toString())}
                className="w-5 h-5 rounded border-gray-300"
              />
              <span className="text-gray-600">{category.name}</span>
              <span className="text-gray-400">({category.count})</span>
            </label>
          ))}
        </div>
      </div>

      {/* Levels Section */}
      <div className="space-y-4">
        <h3 className="text-[#16197C] text-2xl font-semibold font-poppins">Levels</h3>
        <div className="space-y-3">
          {levels.map((level) => (
            <label key={level.name} className="flex items-center space-x-3 font-inter">
              <input 
                type="checkbox"
                checked={selectedLevels.includes(level.name)}
                onChange={() => handleLevelChange(level.name)}
                className="w-5 h-5 rounded border-gray-300"
              />
              <span className="text-gray-600">{level.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Instructors Section */}
      <div className="space-y-4">
        <h3 className="text-[#16197C] text-2xl font-semibold font-poppins">Instructor</h3>
        <div className="space-y-3">
          {instructors && instructors.length > 0 ? (
            instructors.map((instructor) => (
              <label key={instructor.id} className="flex items-center space-x-3 font-inter">
                <input 
                  type="checkbox"
                  checked={selectedInstructors.includes(instructor.id)}
                  onChange={() => handleInstructorChange(instructor.id)}
                  className="w-5 h-5 rounded border-gray-300"
                />
                <span className="text-gray-600">{instructor.display_name}</span>
                <span className="text-gray-400">({instructor.count})</span>
              </label>
            ))
          ) : (
            <div className="text-gray-500">No instructors available</div>
          )}
        </div>
      </div>

      {/* Prices Section */}
      <div className="space-y-4">
        <h3 className="text-[#16197C] text-2xl font-semibold font-poppins">Prices</h3>
        <div className="space-y-3">
          {prices.map(({ type, label }) => (
            <label key={type} className="flex items-center space-x-3 font-inter">
              <input 
                type="radio"
                name="price"
                checked={selectedPriceType === type}
                onChange={() => handlePriceTypeChange(type)}
                className="w-5 h-5 rounded border-gray-300"
              />
              <span className="text-gray-600">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Ratings Section */}
      <div className="space-y-4">
        <h3 className="text-[#16197C] text-2xl font-semibold font-poppins">Rating</h3>
        <div className="space-y-3">
          {ratings.map((rating) => (
            <label key={rating} className="flex items-center space-x-3 font-inter">
              <input 
                type="checkbox"
                checked={selectedRatings.includes(rating)}
                onChange={() => handleRatingChange(rating)}
                className="w-5 h-5 rounded border-gray-300"
              />
              <div className="flex items-center">
                <StarRating rating={rating} />
              </div>
            </label>
          ))}
        </div>
      </div>
    </aside>
  )
} 