import { useState } from 'react'

// Define the types locally if they are not defined elsewhere
interface CategoryCount {
  id: number
  name: string
  count: number
}

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

// Define a simple star rating component if it doesn't exist elsewhere
const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-4 h-4 ${star <= rating ? "text-yellow-400" : "text-gray-300"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
};

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