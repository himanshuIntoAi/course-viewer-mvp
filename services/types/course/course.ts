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
    what_will_you_learn?: string;
    description?: string;
    category_id?: number | null;
    subcategory_id?: number | null;
    course_type_id?: number | null;
    sells_type_id?: number | null;
    mentor_id?: number | null;
    language_id?: number | null;
    created_at: string; // ISO date string
    updated_at: string; // ISO date string
    created_by?: number | null;
    updated_by?: number | null;
    is_flagship: boolean;
    active: boolean;
    price: number;
    ratings?: number | null;
    slug?: string | null;
    discount?: number | null;
    introduction_video_link?: string | null;
    prerequisites?: string | null;
    skill_level?: string | null;
    max_students?: number | null;
    thumbnail?: string | null;
    time?: string | null;
    is_live?: boolean | null;
    IT: boolean;
    Coding_Required: boolean;
    Avg_Completion_TIme?: string | null;
    Course_level?: string;
    audience?: string | null;
    duration_hours?: number | null;
    course_bundle?: string | null;
    course_1?: string | null;
    course_duration?: string | null;
    duration_unit?: string;
    recurrence?: string;
    start_date?: string | null;
    end_date?: string | null;
    intro_video_source?: string | null;
    intro_video_url?: string | null;
    intro_video_filename?: string | null;
    tags?: string | null;
    learning_outcomes?: string | null;
    targeted_audience?: string | null;
    material_included?: string | null;
    requirements_text?: string | null;
    expiration_setting?: string;
    expiration_date?: string | null;
    expiration_time?: string | null;
    student_interaction_with_tutor: boolean;
    co_peer_interaction: boolean;
    student_upload_file_access: boolean;
    skip_topics: boolean;
    skip_lessons: boolean;
    mandatory_attendance: boolean;
    installments_availability: boolean;
    refund_upon_cancellation: boolean;
    course_switch: boolean;
    timeline_extension: boolean;
    publish_date?: string | null;
    publish_time?: string | null;
    enrollment_expiration: number;
    is_public_course: boolean;
    has_qa: boolean;
    regular_price?: number | null;
    sale_price?: number | null;
    pricing_type?: string;
    instructor_type?: string | null;
    publish_type?: string;
    instructor?: User | null;
    
    // Legacy fields for backward compatibility
    rating?: number; // Individual rating for display
    total_reviews?: number; // Total number of reviews
    original_price?: number; // Original price before discount
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