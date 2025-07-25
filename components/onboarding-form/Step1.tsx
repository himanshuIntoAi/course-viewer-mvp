'use client';

import { useState, useEffect } from 'react';
import Select, { StylesConfig } from 'react-select';
import { useFormData } from '@/app/utils/hooks/useFormData';
import { FormData } from './types';
import { SelectOption } from '@/services/types/onboarding/data';
import React from 'react';

interface Step1Props {
  formData: FormData;
  updateFormField: <K extends keyof FormData>(field: K, value: FormData[K]) => void;
  updateFormData: (updates: Partial<FormData>) => void;
  nextStep: () => void;
}

export default function Step1({ 
  formData, 
  updateFormField, 
  updateFormData, 
  nextStep 
}: Step1Props): React.ReactElement | null {
  const [mounted, setMounted] = useState(false);
  const { jobRoleOptions, loading, fetchJobRoles } = useFormData();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Add new useEffect to fetch job roles when working professional is selected
  useEffect(() => {
    if (formData.userType === 'working') {
      fetchJobRoles();
    }
  }, [formData.userType, fetchJobRoles]);

  const handleUserTypeSelect = (type: string) => {
    // Instead of building a large object with all reset values
    // Use updateFormData to update multiple fields at once
    updateFormData({
      userType: type,
      educationStatus: '', // Reset education status
      graduateHelpTypes: [], // Reset graduate help types
      collegeHelpTypes: [], // Reset college help types
      graduationYear: [], // Reset graduation year
      fieldOfStudy: [], // Reset field of study
      major: [], // Reset major
      currentSkills: [], // Reset current skills
      targetSkills: [], // Reset target skills
      knowsPath: undefined, // Reset knows path
      preferenceType: undefined, // Reset preference type
      wantsMentor: undefined, // Reset mentor choice
      experience: '', // Reset experience
      currentRoles: [], // Reset current roles
      workingHelpTypes: [], // Reset working help types
    });
  };

  const handleEducationStatus = (status: string) => {
    // Use updateFormData to update multiple fields at once
    updateFormData({
      educationStatus: status,
      graduateHelpTypes: [], // Reset graduate help types
      collegeHelpTypes: [], // Reset college help types
      graduationYear: [], // Reset graduation year
      fieldOfStudy: [], // Reset field of study
      major: [], // Reset major
      currentSkills: [], // Reset current skills
      targetSkills: [], // Reset target skills
      knowsPath: undefined, // Reset knows path
      preferenceType: undefined, // Reset preference type
      wantsMentor: undefined, // Reset mentor choice
    });
  };

  const handleGraduateHelpTypes = (type: string) => {
    const currentTypes = formData.graduateHelpTypes || [];
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type];
    
    // Use updateFormField instead of setFormData
    updateFormField('graduateHelpTypes', newTypes);
  };

  const handleCollegeHelpTypes = (type: string) => {
    const currentTypes = formData.collegeHelpTypes || [];
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type];
    
    // Use updateFormField instead of setFormData
    updateFormField('collegeHelpTypes', newTypes);
  };

  const handleExperienceChange = (value: string) => {
    // Use updateFormField instead of setFormData
    updateFormField('experience', value);
  };

  const handleBack = () => {
    if (formData.graduateHelpTypes?.length || formData.collegeHelpTypes?.length) {
      // Use updateFormData to update multiple fields at once
      updateFormData({ 
        graduateHelpTypes: [], 
        collegeHelpTypes: [] 
      });
    } else if (formData.educationStatus) {
      // Use updateFormData to update multiple fields at once
      updateFormData({ 
        educationStatus: '', 
        graduateHelpTypes: [], 
        collegeHelpTypes: [] 
      });
    } else if (formData.userType) {
      // Use updateFormField to update a single field
      updateFormField('userType', '');
    }
  };

  const selectStyles: StylesConfig<SelectOption, true> = {
    control: (styles) => ({
      ...styles,
      borderColor: '#00BCD4',
      boxShadow: '0 0 0 1px #00BCD4',
      '&:hover': {
        borderColor: '#00BCD4',
      },
      '&:focus': {
        borderColor: '#00BCD4',
        boxShadow: '0 0 0 1px #00BCD4',
      },
    }),
    menu: (base) => ({
      ...base,
      zIndex: 9999,
    }),
  };

  if (!mounted) return null;

  return (
    <div className="question-container">
      <div>
        <p className="chat-bubble">Are you a Student or Working Professional?</p>
        <div className="options-grid">
          <button
            className={`btn ${formData.userType === 'student' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => handleUserTypeSelect('student')}
          >
            I&apos;m a Student
          </button>
          <button
            className={`btn ${formData.userType === 'working' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => handleUserTypeSelect('working')}
          >
            I&apos;m currently working
          </button>
        </div>
      </div>

      {formData.userType === 'student' && (
        <div className="mt-8 animate-fadeIn">
          <p className="chat-bubble">Did you complete your education?</p>
          <div className="options-grid">
            <button
              className={`btn ${formData.educationStatus === 'graduated' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => handleEducationStatus('graduated')}
            >
              Yes, I&apos;ve graduated
            </button>
            <button
              className={`btn ${formData.educationStatus === 'inCollege' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => handleEducationStatus('inCollege')}
            >
              No, I am still in College
            </button>
          </div>
        </div>
      )}

      {formData.educationStatus === 'graduated' && (
        <div className="mt-8 animate-fadeIn">
          <p className="chat-bubble">How can we help you?</p>
          <div className="options-grid">
            <button
              className={`btn ${formData.graduateHelpTypes?.includes('needJob') ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => handleGraduateHelpTypes('needJob')}
            >
              Need a job now
            </button>
            <button
              className={`btn ${formData.graduateHelpTypes?.includes('internshipFreelancing') ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => handleGraduateHelpTypes('internshipFreelancing')}
            >
              Internship / Freelancing
            </button>
            <button
              className={`btn ${formData.graduateHelpTypes?.includes('upskill') ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => handleGraduateHelpTypes('upskill')}
            >
              Upskill
            </button>
            <button
              className={`btn ${formData.graduateHelpTypes?.includes('careerGuidance') ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => handleGraduateHelpTypes('careerGuidance')}
            >
              Career Guidance and Advice
            </button>
            <button
              className={`btn ${formData.graduateHelpTypes?.includes('furtherStudies') ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => handleGraduateHelpTypes('furtherStudies')}
            >
              📚 Preparing for further studies
            </button>
            <button
              className={`btn ${formData.graduateHelpTypes?.includes('startup') ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => handleGraduateHelpTypes('startup')}
            >
              🚀 Starting my own business/startup
            </button>
          </div>
          {(formData.graduateHelpTypes?.length ?? 0) > 0 && (
            <div className="flex justify-between mt-8 animate-fadeIn">
              <button onClick={handleBack} className="btn btn-secondary">
                Back
              </button>
              <button onClick={nextStep} className="btn btn-primary">
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {formData.educationStatus === 'inCollege' && (
        <div className="mt-8 animate-fadeIn">
          <p className="chat-bubble">How can we help you?</p>
          <div className="options-grid">
            <button
              className={`btn ${formData.collegeHelpTypes?.includes('currentSubjects') ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => handleCollegeHelpTypes('currentSubjects')}
            >
              Need help in my Current Subjects
            </button>
            <button
              className={`btn ${formData.collegeHelpTypes?.includes('academicProject') ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => handleCollegeHelpTypes('academicProject')}
            >
              Help needed in my Academic Project
            </button>
            <button
              className={`btn ${formData.collegeHelpTypes?.includes('internship') ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => handleCollegeHelpTypes('internship')}
            >
              Internship Jobs (Free or Paid)
            </button>
            <button
              className={`btn ${formData.collegeHelpTypes?.includes('upskill') ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => handleCollegeHelpTypes('upskill')}
            >
              Upskill
            </button>
            <button
              className={`btn ${formData.collegeHelpTypes?.includes('careerGuidance') ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => handleCollegeHelpTypes('careerGuidance')}
            >
              Career Guidance and Advice
            </button>
          </div>
          {(formData.collegeHelpTypes?.length ?? 0) > 0 && (
            <div className="flex justify-between mt-8 animate-fadeIn">
              <button onClick={handleBack} className="btn btn-secondary">
                Back
              </button>
              <button onClick={nextStep} className="btn btn-primary">
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* Working Professional Questions */}
      {formData.userType === 'working' && (
        <div className="mt-8 animate-fadeIn">
          <div className="space-y-6">
            {/* Total IT Experience */}
            <div>
              <p className="chat-bubble">Total IT Experience</p>
              <input
                type="text"
                className="w-full mt-2 px-4 py-2 text-sm text-gray-900 border border-gray-200 rounded-xl focus:border-[#00BCD4] focus:ring-1 focus:ring-[#00BCD4] outline-none"
                value={formData.experience}
                onChange={(e) => handleExperienceChange(e.target.value)}
                placeholder="Enter your experience in years..."
              />
            </div>

            {/* Current Role */}
            {formData.experience && (
              <div className="animate-fadeIn">
                <p className="chat-bubble">What is your current role?</p>
                <Select
                  isMulti
                  options={jobRoleOptions}
                  className="mt-2"
                  classNamePrefix="select"
                  styles={selectStyles}
                  isLoading={loading.jobRoles}
                  value={formData.currentRoles?.map(role => 
                    jobRoleOptions.find(opt => opt.value === role) || { value: role, label: role }
                  )}
                  onChange={(selected) => {
                    updateFormData({
                      ...formData,
                      currentRoles: selected ? selected.map(option => option.value) : []
                    });
                  }}
                  placeholder="Select roles..."
                />
              </div>
            )}

            {/* Navigation Buttons */}
            {formData.experience && (formData.currentRoles?.length ?? 0) > 0 && (
              <div className="flex justify-between mt-8 animate-fadeIn">
                <button onClick={handleBack} className="btn btn-secondary">
                  Back
                </button>
                <button onClick={nextStep} className="btn btn-primary">
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}