interface StarRatingProps {
  rating: number
  maxRating?: number
}

export function StarRating({ rating, maxRating = 5 }: StarRatingProps) {
  // Ensure rating is between 0 and maxRating
  const ratingValue = Math.min(Math.max(Math.round(rating), 0), maxRating);
  
  return (
    <div className="flex items-center">
      {Array.from({ length: ratingValue }).map((_, index) => (
        <svg 
          key={index}
          className="mr-1"
          width="18" 
          height="18" 
          viewBox="0 0 18 18" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            fillRule="evenodd" 
            clipRule="evenodd" 
            d="M15.0485 10.4624C14.6642 10.8336 14.4896 11.3684 14.5796 11.893L15.1601 15.2496C15.341 16.2945 14.504 17.1431 13.5545 17.1431C13.3043 17.1431 13.046 17.084 12.7958 16.9537L9.75826 15.3688C9.52066 15.2454 9.26055 15.1836 8.99955 15.1836C8.73945 15.1836 8.47935 15.2454 8.24174 15.3688L5.20419 16.9537C4.95399 17.084 4.69569 17.1431 4.44548 17.1431C3.49597 17.1431 2.65896 16.2945 2.83986 15.2496L3.42037 11.893C3.51037 11.3684 3.33577 10.8336 2.95146 10.4624L0.493523 8.08554C-0.473092 7.15039 0.0606188 5.52094 1.39624 5.32808L4.79289 4.83864C5.32389 4.76236 5.7829 4.4315 6.01961 3.95406L7.53883 0.900866C7.83763 0.3 8.41904 0 8.99955 0C9.58096 0 10.1624 0.3 10.4612 0.900866L11.9804 3.95406C12.2171 4.4315 12.6761 4.76236 13.2071 4.83864L16.6038 5.32808C17.9394 5.52094 18.4731 7.15039 17.5065 8.08554L15.0485 10.4624Z" 
            fill="#01B7BA"
          />
        </svg>
      ))}
      <span className="ml-1 text-sm text-gray-500">({ratingValue})</span>
    </div>
  )
} 
