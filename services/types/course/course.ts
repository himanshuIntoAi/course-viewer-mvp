// You might want to create separate interfaces for related entities
import { User } from "../user/user";
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
}

export interface CartItem {
    user_id: number;
    course_id: number;
}