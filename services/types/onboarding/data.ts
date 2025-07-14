// Frontend-specific types for form handling and UI components
export interface Category {
  id: string;
  name: string;
  is_flagship: boolean;
  is_IT: boolean;
}

export interface Subcategory {
  id: string;
  category_id: string;
  name: string;
  is_flagship: boolean;
  active: boolean;
}

// Note: These interfaces are now imported from services/api/onboarding/api
// Keeping them here for reference and backward compatibility
export type { JobRole, Skill } from '@/services/api/onboarding/api';

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  category_id?: string;
  subcategory_id?: string;
} 