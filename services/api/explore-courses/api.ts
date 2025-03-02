export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export interface CategoryCount {
  id: number
  name: string
  count: number
}

export interface InstructorFilter {
  name: string
  count: number
}

export interface Category {
  id: number
  name: string
  count: number
}

export interface User {
  id: number
  display_name: string
  first_name?: string
  last_name?: string
  work_email?: string
  personal_email?: string
  role_id?: number
  login_type_id?: number
  mobile?: string
  affiliate_id?: number
  facebook?: string
  instagram?: string
  linkedin?: string
  twitter?: string
  youtube?: string
  monitor?: boolean
  remarks?: string
  currency_id?: number
  country_id?: number
  is_student?: boolean
  is_instructor?: boolean
}

export interface Course {
  id: number
  title: string
  description?: string
  category_id?: number
  subcategory_id?: number
  course_type_id?: number
  sells_type_id?: number
  mentor_id?: number
  language_id?: number
  is_flagship?: boolean
  active?: boolean
  price?: number
  ratings?: number
  created_at: string
  updated_at: string
  mentor?: User
  instructor?: User
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  size: number
  pages: number
}

export async function getCategories(): Promise<Category[]> {
  const response = await fetch(`${API_BASE_URL}/api/v1/coursecategories`)
  if (!response.ok) {
    throw new Error('Failed to fetch categories')
  }
  return response.json()
}

export async function getCourses(page: number = 1, size: number = 1000): Promise<PaginatedResponse<Course>> {
  const response = await fetch(`${API_BASE_URL}/api/v1/courses?page=${page}&size=${size}&include=instructor`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch courses')
  }

  const data = await response.json()
  
  // Check if the response is already paginated
  if (data.items && data.total !== undefined) {
    // Map instructor data to mentor field
    const coursesWithMentors = data.items.map((course: any) => ({
      ...course,
      mentor: course.instructor || null
    }));
    
    return {
      ...data,
      items: coursesWithMentors
    };
  }
  
  // If not paginated, manually paginate the data
  const allCourses = Array.isArray(data) ? data : [];
  const start = (page - 1) * size
  const end = start + size
  const paginatedItems = allCourses.slice(start, end)
  
  return {
    items: paginatedItems,
    total: allCourses.length,
    page,
    size,
    pages: Math.max(1, Math.ceil(allCourses.length / size))
  }
}

export async function searchCourses(
  query: string, 
  filters: {
    categories?: string[]
    ratings?: number[]
    instructors?: number[]
    priceType?: 'all' | 'free' | 'paid'
    levels?: string[]
  },
  page: number = 1,
  size: number = 10
): Promise<PaginatedResponse<Course>> {
  // Build query parameters
  const params = new URLSearchParams();
  if (query.trim()) {
    params.append('search', query.trim());
  }
  if (filters.categories?.length) {
    params.append('categories', filters.categories.join(','));
  }
  if (filters.instructors?.length) {
    params.append('instructors', filters.instructors.join(','));
  }
  if (filters.ratings?.length) {
    params.append('ratings', filters.ratings.join(','));
  }
  if (filters.priceType && filters.priceType !== 'all') {
    params.append('priceType', filters.priceType);
  }
  if (filters.levels?.length) {
    params.append('levels', filters.levels.join(','));
  }
  params.append('page', page.toString());
  params.append('size', size.toString());
  params.append('include', 'instructor');

  const response = await fetch(`${API_BASE_URL}/api/v1/courses/search?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to search courses');
  }

  const data = await response.json();

  // Check if the response is already paginated
  if (data.items && data.total !== undefined) {
    // Map instructor data to mentor field
    const coursesWithMentors = data.items.map((course: any) => ({
      ...course,
      mentor: course.instructor || null
    }));
    
    return {
      ...data,
      items: coursesWithMentors
    };
  }

  // If not paginated, manually filter and paginate the data
  let filteredData = Array.isArray(data) ? data : [];
  if (query.trim() || Object.values(filters).some(f => f?.length) || filters.priceType !== 'all') {
    const searchTerm = query.toLowerCase().trim();
    filteredData = filteredData.filter((course: Course) => {
      const matchesSearch = !searchTerm || 
        course.title.toLowerCase().includes(searchTerm) ||
        (course.description?.toLowerCase() || '').includes(searchTerm);

      const matchesCategories = !filters.categories?.length ||
        filters.categories.includes(course.category_id?.toString() || '');

      const matchesInstructors = !filters.instructors?.length || 
        (course.mentor && filters.instructors.includes(course.mentor.id));

      const matchesRating = !filters.ratings?.length ||
        filters.ratings.includes(Math.floor(course.ratings || 0));

      const matchesPrice = !filters.priceType || filters.priceType === 'all' ||
        (filters.priceType === 'free' && (course.price || 0) === 0) ||
        (filters.priceType === 'paid' && (course.price || 0) > 0);

      return matchesSearch && matchesCategories && matchesInstructors && matchesRating && matchesPrice;
    });
  }
  
  const start = (page - 1) * size;
  const end = start + size;
  const paginatedItems = filteredData.slice(start, end);
  
  return {
    items: paginatedItems,
    total: filteredData.length,
    page,
    size,
    pages: Math.max(1, Math.ceil(filteredData.length / size))
  };
}

export async function getInstructor(id: number): Promise<User | null> {
  const response = await fetch(`${API_BASE_URL}/api/v1/users/${id}`)
  if (!response.ok) {
    throw new Error('Failed to fetch instructor')
  }
  return response.json()
} 