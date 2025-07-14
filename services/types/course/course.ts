// You might want to create separate interfaces for related entities
// Define User interface locally instead of importing
interface User {
  id: number;
  name?: string;
  email?: string;
  profile_image?: string;
  display_name?: string;
}

export interface Course {
    id: number;
    title: string;
    description?: string;
    category_id?: number;
    subcategory_id?: number;
    course_type_id?: number;
    sells_type_id?: number;
    language_id?: number;
    created_at: string; // ISO date string
    updated_at: string; // ISO date string
    created_by?: number;
    updated_by?: number;
    is_flagship: boolean;
    active: boolean;
    ratings: number;
    price: number;
    mentor_id?: number;
    instructor?: User;
    category_name?: string;
    subcategory_name?: string;
    course_type_name?: string;
    sells_type_name?: string;
    language_name?: string;
    image_url?: string;
}

export interface CartItem {
    id?: number;
    user_id: number;
    course_id: number;
    course_title?: string;
    course_price?: number;
    image_url?: string;
}