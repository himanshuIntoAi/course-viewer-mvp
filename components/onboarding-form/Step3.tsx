'use client';

import { FormData } from './types';
import { useState, useEffect, useRef } from 'react';
import Select, { StylesConfig } from 'react-select';
import { useFormData } from '@/app/utils/hooks/useFormData';
import { onboardingApiClient } from '@/services/api/onboarding/api';
import { onboardingStore } from '@/services/storage/onboarding';
import { generateUUID } from '@/app/utils/utils';
import { SelectOption } from '@/services/types/onboarding/data';
import React from 'react';

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

interface Step3Props {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  prevStep: () => void;
  sessionId: string | null;
  setSessionId: (id: string | null) => void;
}

export default function Step3({ 
  formData, 
  updateFormData, 
  prevStep, 
  sessionId, 
  setSessionId 
}: Step3Props): React.ReactElement | null {
  const [mounted, setMounted] = useState(false);
  const [showTargetSkills, setShowTargetSkills] = useState(false);
  const [showPreference, setShowPreference] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get skills and job roles from the API without filtering
  const { skillOptions, jobRoleOptions, loading, fetchSkills, fetchJobRoles } = useFormData();

  // Add refs for each section
  const skillsLearningRef = useRef<HTMLDivElement>(null);
  const targetSkillsRef = useRef<HTMLDivElement>(null);
  const preferenceRef = useRef<HTMLDivElement>(null);
  const mentorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    // Fetch all jobs and skills without filtering by category/subcategory
    fetchSkills();
    fetchJobRoles();
  }, [fetchSkills, fetchJobRoles]);

  // Add a new useEffect to handle loading states
  useEffect(() => {
    if (mounted && formData.knowsPath === true) {
      // Ensure jobs are loaded when path is known
      fetchJobRoles();
    }
  }, [mounted, formData.knowsPath, fetchJobRoles]);

  useEffect(() => {
    if (formData.knowsPath === false) {
      setShowPreference(true);
      preferenceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [formData.knowsPath]);

  const handleKnowsPath = (knows: boolean) => {
    // Reset all subsequent data when changing path
    updateFormData({
      ...formData,
      knowsPath: knows,
      targetRoles: [], // Reset target roles
      targetSkills: [], // Reset target skills
      preferenceType: undefined, // Reset preference type
      wantsMentor: undefined // Reset mentor choice
    });
    
    if (knows) {
      setShowPreference(false);
      setShowTargetSkills(false); // Reset this state too
    } else {
      setShowPreference(true);
      setShowTargetSkills(false);
    }
  };

  const handlePreferenceType = (type: 'coding' | 'lessCode' | 'noCoding') => {
    updateFormData({ ...formData, preferenceType: type });
  };

  const handleMentorChoice = (wants: boolean) => {
    updateFormData({ ...formData, wantsMentor: wants });
  };

  const handleFormSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      if (sessionId) {
        // Update existing onboarding progress with type conversion
        await onboardingApiClient.updateOnboardingProgress(sessionId, {
          session_id: sessionId,
          step_number: 3,
          // Force TypeScript to accept this type
          data: formData as any // eslint-disable-line @typescript-eslint/no-explicit-any
        });
        
        // Update IndexedDB with the latest data
        await onboardingStore.saveProgress({
          session_id: sessionId,
          step_number: 3,
          // Force TypeScript to accept this type
          data: formData as any // eslint-disable-line @typescript-eslint/no-explicit-any
        });
      } else {
        // Create new onboarding progress and get session_id
        const newSessionId = generateUUID();
        await onboardingApiClient.createOnboardingProgress({
          session_id: newSessionId,
          step_number: 3,
          // Force TypeScript to accept this type
          data: formData as any // eslint-disable-line @typescript-eslint/no-explicit-any
        });
        
        // Save the session_id and data to IndexedDB
        await onboardingStore.saveProgress({
          session_id: newSessionId,
          step_number: 3,
          // Force TypeScript to accept this type
          data: formData as any // eslint-disable-line @typescript-eslint/no-explicit-any
        });
        setSessionId(newSessionId);
      }
      // If successful, show completion message
      setShowCompletion(true);
    } catch (err) {
      setError('Failed to save your progress. Please try again.');
      console.error('Error saving onboarding progress:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) {
    return null;
  }

  if (showCompletion) {
    return (
      <div className="flex flex-col items-center justify-center space-y-6 py-12 animate-fadeIn">
        <div className="bg-green-100 border border-green-400 text-green-700 px-8 py-6 rounded-lg text-center">
          <h2 className="text-2xl font-semibold mb-4">🎉 Onboarding Complete!</h2>
          <p className="text-lg mb-4">Thank you for completing the onboarding process.</p>
          <p>We will analyze your preferences and provide personalized recommendations.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="question-container">
      <div className="space-y-6">
        {/* What skills are you learning */}
        <div className="animate-fadeIn" ref={skillsLearningRef}>
          <p className="chat-bubble">What skills are you currently learning or want to learn?</p>
          <div className="options-grid">
            <button
              className={`btn ${formData.knowsPath === true ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => handleKnowsPath(true)}
            >
              I know, What I want to become
            </button>
            <button
              className={`btn ${formData.knowsPath === false ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => handleKnowsPath(false)}
            >
              No, I am not sure, guide me
            </button>
          </div>
          {formData.knowsPath === true && (
            <p className="text-green-600 text-xs mt-2 text-center">Great to know!</p>
          )}
          {formData.knowsPath === false && (
            <p className="text-green-600 text-xs mt-2 text-center">No worries!! We can help you choose</p>
          )}
        </div>

        {/* Target Job - shown when user knows their path */}
        {formData.knowsPath === true && (
          <div className="animate-fadeIn mt-4">
            <p className="chat-bubble">Target Job:</p>
            <Select
              isMulti
              options={jobRoleOptions}
              className="mt-2"
              classNamePrefix="select"
              styles={selectStyles}
              isLoading={loading.jobRoles}
              value={formData.targetRoles?.map(role => 
                jobRoleOptions.find(opt => opt.value === role) || { value: role, label: role }
              )}
              onChange={(selected) => {
                updateFormData({
                  ...formData,
                  targetRoles: selected ? selected.map(option => option.value) : []
                });
                setShowTargetSkills(selected && selected.length > 0);
              }}
              placeholder="Search and select your target job(s)..."
            />
          </div>
        )}

        {/* Target Skills - shown when user knows their path AND has selected target roles */}
        {showTargetSkills && (formData.targetRoles?.length ?? 0) > 0 && (
          <div className="animate-fadeIn mt-4" ref={targetSkillsRef}>
            <p className="chat-bubble">Target Skills:</p>
            <Select
              isMulti
              options={skillOptions}
              className="mt-2"
              classNamePrefix="select"
              styles={selectStyles}
              isLoading={loading.skills}
              value={formData.targetSkills?.map(skill => 
                skillOptions.find(opt => opt.value === skill) || { value: skill, label: skill }
              )}
              onChange={(selected) => {
                updateFormData({
                  ...formData,
                  targetSkills: selected ? selected.map(option => option.value) : []
                });
              }}
              placeholder="Select your target skills..."
            />
          </div>
        )}

        {/* Preference Selection - shown when user needs guidance */}
        {showPreference && (
          <div className="animate-fadeIn" ref={preferenceRef}>
            <p className="chat-bubble">What is your preference?</p>
            <div className="options-grid">
              <div className="flex flex-col items-center">
                <button
                  className={`btn ${formData.preferenceType === 'coding' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => handlePreferenceType('coding')}
                >
                  Coding
                </button>
                <p className="text-xs text-gray-600 mt-2 text-center">
                  Software Engineer, ML Engineer, AI Engineer
                </p>
              </div>
              <div className="flex flex-col items-center">
                <button
                  className={`btn ${formData.preferenceType === 'lessCode' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => handlePreferenceType('lessCode')}
                >
                  Less Coding / Scripts
                </button>
                <p className="text-xs text-gray-600 mt-2 text-center">
                  Data Engineer, Reporting Developer
                </p>
              </div>
              <div className="flex flex-col items-center">
                <button
                  className={`btn ${formData.preferenceType === 'noCoding' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => handlePreferenceType('noCoding')}
                >
                  No Coding
                </button>
                <p className="text-xs text-gray-600 mt-2 text-center">
                  Support Engineer, Business Analyst, Digital Marketing
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Mentor Question */}
        {((formData.knowsPath === false && formData.preferenceType) || 
          (formData.knowsPath === true && (formData.targetSkills?.length ?? 0) > 0)) && (
          <div className="animate-fadeIn" ref={mentorRef}>
            <p className="chat-bubble">Do you want to hire 1-1 mentor?</p>
            <div className="options-grid">
              <button
                className={`btn ${formData.wantsMentor === true ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => handleMentorChoice(true)}
              >
                Yes, I might
              </button>
              <button
                className={`btn ${formData.wantsMentor === false ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => handleMentorChoice(false)}
              >
                No, I am a self learner
              </button>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 animate-fadeIn">
          <button onClick={prevStep} className="btn btn-secondary min-w-[120px]">
            Back
          </button>
          {((formData.knowsPath === false && formData.preferenceType && formData.wantsMentor !== undefined) || 
            (formData.knowsPath === true && (formData.targetSkills?.length ?? 0) > 0 && formData.wantsMentor !== undefined)) && (
            <button 
              onClick={handleFormSubmit} 
              className="btn btn-primary min-w-[120px]"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'I\'m Done!'}
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
} 