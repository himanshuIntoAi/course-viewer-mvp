'use server';

import { FormData } from '@/components/form/types';
import { pool } from '@/services/storage/onboarding/db';

export async function saveFormData(formData: FormData) {
  try {
    const client = await pool.connect();
    try {
      const query = `
        INSERT INTO user_onboarding (
          user_type,
          education_status,
          help_type,
          graduation_year,
          field_of_study,
          major,
          current_skills,
          target_skills,
          wants_mentor,
          preference_type
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `;

      const values = [
        formData.userType,
        formData.educationStatus,
        formData.helpType,
        formData.graduationYear || null,
        formData.fieldOfStudy || null,
        formData.major || null,
        formData.currentSkills || [],
        formData.targetSkills || [],
        formData.wantsMentor,
        formData.preferenceType || null,
      ];

      const result = await client.query(query, values);
      return { data: result.rows[0], error: null };
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error saving form data:', error);
    return { data: null, error };
  }
} 