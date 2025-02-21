import { useState, useEffect } from 'react';
import { SelectOption } from '@/services/types/onboarding/data';
import { onboardingApiClient, JobRole, Skill, CourseCategory, CourseSubcategory } from '@/services/api/onboarding/api';

export function useFormData() {
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [subcategories, setSubcategories] = useState<CourseSubcategory[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [jobRoles, setJobRoles] = useState<JobRole[]>([]);
  const [loading, setLoading] = useState({
    categories: false,
    subcategories: false,
    skills: false,
    jobRoles: false,
  });

  // Fetch categories on mount
  useEffect(() => {
    async function fetchCategories() {
      setLoading(prev => ({ ...prev, categories: true }));
      try {
        const data = await onboardingApiClient.getAllCourseCategories();
        // Only set active categories
        setCategories(data.filter(cat => cat.active));
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]);
      } finally {
        setLoading(prev => ({ ...prev, categories: false }));
      }
    }
    fetchCategories();
  }, []);

  // Fetch subcategories based on selected category
  const fetchSubcategories = async (categoryId?: string) => {
    if (!categoryId) return;
    
    setLoading(prev => ({ ...prev, subcategories: true }));
    try {
      const data = await onboardingApiClient.getAllCourseSubcategories();
      // Only set active subcategories for the selected category
      setSubcategories(data.filter(sub => 
        sub.active && sub.category_id.toString() === categoryId
      ));
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      setSubcategories([]);
    } finally {
      setLoading(prev => ({ ...prev, subcategories: false }));
    }
  };

  // Fetch skills based on selected category and subcategory
  const fetchSkills = async (categoryId?: string, subcategoryId?: string) => {
    setLoading(prev => ({ ...prev, skills: true }));
    try {
      const data = await onboardingApiClient.getAllSkills();
      // Only set active skills
      setSkills(data.filter(skill => skill.active));
    } catch (error) {
      console.error('Error fetching skills:', error);
      setSkills([]);
    } finally {
      setLoading(prev => ({ ...prev, skills: false }));
    }
  };

  // Fetch job roles based on selected category and subcategory
  const fetchJobRoles = async (categoryId?: string, subcategoryId?: string) => {
    setLoading(prev => ({ ...prev, jobRoles: true }));
    try {
      const data = await onboardingApiClient.getAllJobRoles();
      // Only set active job roles
      setJobRoles(data.filter(role => role.active));
    } catch (error) {
      console.error('Error fetching job roles:', error);
      setJobRoles([]);
    } finally {
      setLoading(prev => ({ ...prev, jobRoles: false }));
    }
  };

  // Convert data to select options
  const categoryOptions: SelectOption[] = categories.map(cat => ({
    value: cat.id.toString(),
    label: cat.name,
  }));

  const subcategoryOptions: SelectOption[] = subcategories.map(sub => ({
    value: sub.id.toString(),
    label: sub.name,
  }));

  const skillOptions: SelectOption[] = skills.map(skill => ({
    value: skill.id.toString(),
    label: skill.skill_name,
  }));

  const jobRoleOptions: SelectOption[] = jobRoles.map(role => ({
    value: role.id.toString(),
    label: role.job_role_name,
  }));

  return {
    loading,
    categoryOptions,
    subcategoryOptions,
    skillOptions,
    jobRoleOptions,
    fetchSubcategories,
    fetchSkills,
    fetchJobRoles,
  };
} 