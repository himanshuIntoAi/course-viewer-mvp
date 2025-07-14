'use server';

import { FormData } from '@/components/onboarding-form/types';
import { makeDbRequest } from '@/services/storage/onboarding/db';

export async function saveFormData(formData: FormData) {
  try {
    const data = {
      user_type: formData.userType,
      education_status: formData.educationStatus,
      help_type: formData.helpType,
      graduation_year: formData.graduationYear || null,
      field_of_study: formData.fieldOfStudy || null,
      major: formData.major || null,
      current_skills: formData.currentSkills || [],
      target_skills: formData.targetSkills || [],
      wants_mentor: formData.wantsMentor,
      preference_type: formData.preferenceType || null,
    };

    const result = await makeDbRequest('/onboarding', 'POST', data);
    return { data: result, error: null };
  } catch (error) {
    console.error('Error saving form data:', error);
    return { data: null, error };
  }
} 