'use client';

import { Step2Props } from './types';
import Select, { StylesConfig } from 'react-select';
import { useState, useEffect, useRef } from 'react';
import { useFormData } from '@/app/utils/hooks/useFormData';
import { SelectOption } from '@/services/types/onboarding/data';
import React from 'react';

// Use the proper type for selectStyles
const selectStyles: StylesConfig<SelectOption, true> = {
  container: (base) => ({
    ...base,
    position: 'relative',
    zIndex: 99999,
  }),
  menu: (base) => ({
    ...base,
    position: 'absolute',
    zIndex: 99999,
  }),
  menuPortal: (base) => ({
    ...base,
    zIndex: 99999,
  }),
  dropdownIndicator: (base) => ({
    ...base,
    zIndex: 99998,
  }),
  control: (base) => ({
    ...base,
    position: 'relative',
    zIndex: 99997,
  }),
  option: (base) => ({
    ...base,
    position: 'relative',
    zIndex: 99999,
  }),
};

export default function Step2({ 
  formData, 
  updateFormField, 
  updateFormData, 
  nextStep, 
  prevStep 
}: Step2Props): React.ReactElement | null {
  const {
    loading,
    categoryOptions,
    subcategoryOptions,
    skillOptions,
    fetchSubcategories,
    fetchSkills,
    fetchJobRoles,
  } = useFormData();

  const [mounted, setMounted] = useState(false);
  const [graduationYear, setGraduationYear] = useState(formData.graduationYear?.[0] || '');

  // Add refs for each question section
  const graduationYearRef = useRef<HTMLDivElement>(null);
  const fieldOfStudyRef = useRef<HTMLDivElement>(null);
  const majorRef = useRef<HTMLDivElement>(null);
  const currentSkillsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    // Fetch skills immediately for working professionals
    if (formData.userType === 'working') {
      fetchSkills();
    }
  }, [fetchSkills, formData.userType]);

  // Keep existing useEffect for student flow
  useEffect(() => {
    if ((formData.major?.length ?? 0) > 0 && formData.userType === 'student') {
      const firstFieldOfStudy = formData.fieldOfStudy?.[0];
      const firstMajor = formData.major?.[0];
      if (firstFieldOfStudy && firstMajor) {
        // Add appropriate handling based on whether these functions accept parameters
        fetchSkills();
      }
    }
  }, [formData.major, formData.fieldOfStudy, formData.userType, fetchSkills]);

  // Update graduation year effect
  useEffect(() => {
    if (!graduationYear) return;
    
    // Use updateFormField instead of setFormData
    updateFormField('graduationYear', [graduationYear]);
    fieldOfStudyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graduationYear]);

  // Add scroll effects for each section
  useEffect(() => {
    const fieldOfStudyLength = formData.fieldOfStudy?.length ?? 0;
    if (fieldOfStudyLength === 0) return;
    
    majorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Fetch subcategories when field of study (category) is selected
    const firstFieldOfStudy = formData.fieldOfStudy?.[0];
    if (firstFieldOfStudy) {
      fetchSubcategories();
    }
    
   
  }, [formData.fieldOfStudy, fetchSubcategories]); // Explicitly disable exhaustive-deps for formData

  useEffect(() => {
    const majorLength = formData.major?.length ?? 0;
    if (majorLength === 0) return;
    
    currentSkillsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Fetch skills when major (subcategory) is selected
    const firstFieldOfStudy = formData.fieldOfStudy?.[0];
    const firstMajor = formData.major?.[0];
    if (firstFieldOfStudy && firstMajor) {
      fetchSkills();
      fetchJobRoles();
    }
    
    
  }, [formData.major, formData.fieldOfStudy, fetchSkills, fetchJobRoles]); // Explicitly disable exhaustive-deps for formData

  if (!mounted) return null;

  // Show different flows based on user type
  if (formData.userType === 'working') {
    return (
      <div className="question-container">
        <div className="space-y-6">
          {/* Current Skills */}
          <div className="animate-fadeIn">
            <p className="chat-bubble">Current Skills</p>
            <Select
              isMulti
              options={skillOptions}
              className="mt-2"
              classNamePrefix="select"
              styles={selectStyles}
              isLoading={loading.skills}
              value={formData.currentSkills?.map(skill => 
                skillOptions.find(opt => opt.value === skill) || { value: skill, label: skill }
              )}
              onChange={(selected) => {
                const values = selected ? selected.map(option => option.value) : [];
                updateFormData({
                  currentSkills: values,
                });
              }}
              placeholder="Select your current skills..."
            />
          </div>

          {/* How can we help you */}
          {(formData.currentSkills?.length ?? 0) > 0 && (
            <div className="animate-fadeIn">
              <p className="chat-bubble">How can we help you?</p>
              <div className="options-grid">
                <button
                  className={`btn ${formData.workingHelpTypes?.includes('betterSalary') ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => {
                    const currentTypes = formData.workingHelpTypes || [];
                    const newTypes = currentTypes.includes('betterSalary')
                      ? currentTypes.filter(t => t !== 'betterSalary')
                      : [...currentTypes, 'betterSalary'];
                    updateFormData({ workingHelpTypes: newTypes });
                  }}
                >
                  Better Salary
                </button>
                <button
                  className={`btn ${formData.workingHelpTypes?.includes('switchCareer') ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => {
                    const currentTypes = formData.workingHelpTypes || [];
                    const newTypes = currentTypes.includes('switchCareer')
                      ? currentTypes.filter(t => t !== 'switchCareer')
                      : [...currentTypes, 'switchCareer'];
                    updateFormData({ workingHelpTypes: newTypes });
                  }}
                >
                  Switch Career
                </button>
                <button
                  className={`btn ${formData.workingHelpTypes?.includes('upskill') ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => {
                    const currentTypes = formData.workingHelpTypes || [];
                    const newTypes = currentTypes.includes('upskill')
                      ? currentTypes.filter(t => t !== 'upskill')
                      : [...currentTypes, 'upskill'];
                    updateFormData({ workingHelpTypes: newTypes });
                  }}
                >
                  Upskill
                </button>
                <button
                  className={`btn ${formData.workingHelpTypes?.includes('careerGuidance') ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => {
                    const currentTypes = formData.workingHelpTypes || [];
                    const newTypes = currentTypes.includes('careerGuidance')
                      ? currentTypes.filter(t => t !== 'careerGuidance')
                      : [...currentTypes, 'careerGuidance'];
                    updateFormData({ workingHelpTypes: newTypes });
                  }}
                >
                  Career Guidance and Advice
                </button>
                <button
                  className={`btn ${formData.workingHelpTypes?.includes('furtherStudies') ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => {
                    const currentTypes = formData.workingHelpTypes || [];
                    const newTypes = currentTypes.includes('furtherStudies')
                      ? currentTypes.filter(t => t !== 'furtherStudies')
                      : [...currentTypes, 'furtherStudies'];
                    updateFormData({ workingHelpTypes: newTypes });
                  }}
                >
                  📚 Preparing for further studies
                </button>
                <button
                  className={`btn ${formData.workingHelpTypes?.includes('startup') ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => {
                    const currentTypes = formData.workingHelpTypes || [];
                    const newTypes = currentTypes.includes('startup')
                      ? currentTypes.filter(t => t !== 'startup')
                      : [...currentTypes, 'startup'];
                    updateFormData({ workingHelpTypes: newTypes });
                  }}
                >
                  🚀 Starting my own business/startup
                </button>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          {(formData.currentSkills?.length ?? 0) > 0 && (formData.workingHelpTypes?.length ?? 0) > 0 && (
            <div className="flex justify-between mt-8 animate-fadeIn">
              <button onClick={prevStep} className="btn btn-secondary">
                Back
              </button>
              <button onClick={nextStep} className="btn btn-primary">
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="question-container">
      <div className="space-y-6">
        {/* Graduation Year */}
        <div className="animate-fadeIn" ref={graduationYearRef}>
          <p className="chat-bubble">What is your graduation year?</p>
          <input
            type="text"
            className="w-full mt-2 px-4 py-2 text-sm text-gray-900 border border-gray-200 rounded-xl focus:border-[#00BCD4] focus:ring-1 focus:ring-[#00BCD4] outline-none"
            value={graduationYear}
            onChange={(e) => setGraduationYear(e.target.value)}
            placeholder="Enter your graduation year..."
          />
        </div>

        {/* Field of Study (Categories) */}
        {graduationYear && (
          <div className="animate-fadeIn" ref={fieldOfStudyRef}>
            <p className="chat-bubble">What is your field of study?</p>
            <Select
              isMulti
              options={categoryOptions}
              className="mt-2"
              classNamePrefix="select"
              styles={selectStyles}
              isLoading={loading.categories}
              value={formData.fieldOfStudy?.map(field => 
                categoryOptions.find(opt => opt.value === field) || { value: field, label: field }
              )}
              onChange={(selected) => {
                const values = selected ? selected.map(option => option.value) : [];
                updateFormData({
                  fieldOfStudy: values,
                  major: [], // Reset dependent fields
                  currentSkills: [],
                });
                if (values[0]) {
                  fetchSubcategories();
                }
              }}
              placeholder="Select your field(s) of study..."
            />
          </div>
        )}

        {/* Major (Subcategories) */}
        {(formData.fieldOfStudy?.length ?? 0) > 0 && (
          <div className="animate-fadeIn" ref={majorRef}>
            <p className="chat-bubble">What is your major?</p>
            <Select
              isMulti
              options={subcategoryOptions}
              className="mt-2"
              classNamePrefix="select"
              styles={selectStyles}
              isLoading={loading.subcategories}
              value={formData.major?.map(major => 
                subcategoryOptions.find(opt => opt.value === major) || { value: major, label: major }
              )}
              onChange={(selected) => {
                const values = selected ? selected.map(option => option.value) : [];
                updateFormData({
                  major: values,
                  currentSkills: [], // Reset dependent fields
                });
                if (formData.fieldOfStudy?.[0] && values[0]) {
                  fetchSkills();
                }
              }}
              placeholder="Select your major(s)..."
            />
          </div>
        )}

        {/* Current Skills */}
        {(formData.major?.length ?? 0) > 0 && (
          <div className="animate-fadeIn" ref={currentSkillsRef}>
            <p className="chat-bubble">What are your current skills?</p>
            <Select
              isMulti
              options={skillOptions}
              className="mt-2"
              classNamePrefix="select"
              styles={selectStyles}
              isLoading={loading.skills}
              value={formData.currentSkills?.map(skill => 
                skillOptions.find(opt => opt.value === skill) || { value: skill, label: skill }
              )}
              onChange={(selected) => {
                updateFormField('currentSkills', selected ? selected.map(option => option.value) : []);
              }}
              placeholder="Select your current skills..."
            />
          </div>
        )}

        {/* Navigation Buttons - Show when either working professional path is complete OR student path is complete */}
        {((formData.userType === 'working' && (formData.currentSkills?.length ?? 0) > 0) || 
          (formData.userType === 'student' && (formData.currentSkills?.length ?? 0) > 0)) && (
          <div className="flex justify-between mt-8 animate-fadeIn">
            <button onClick={prevStep} className="btn btn-secondary">
              Back
            </button>
            <button 
              onClick={nextStep} 
              className="btn btn-primary"
              disabled={!formData.currentSkills?.length}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 