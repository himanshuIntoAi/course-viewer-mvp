'use client';

import { useState, useEffect, useRef, useReducer, useCallback } from 'react';
import StepsContainer from './StepsContainer';
import Step1 from './Step1';
import Step2 from './Step2';
import Step3 from './Step3';
import { FormData, OnboardingProgress } from './types';
import { onboardingStore } from '@/services/storage/onboarding';
import Image from 'next/image';
import './onboarding.css';

const TITLE = "Find What's Right";
const TITLE2 = " For You";
const DESCRIPTION = "Help us to know about you";

// Define action types for our form reducer
type FormAction = 
  | { type: 'SET_FORM_DATA'; payload: FormData }
  | { type: 'UPDATE_FORM_FIELD'; field: keyof FormData; value: FormData[keyof FormData] }
  | { type: 'UPDATE_MULTIPLE_FIELDS'; updates: Partial<FormData> };

// Form reducer function
const formReducer = (state: FormData, action: FormAction): FormData => {
  switch (action.type) {
    case 'SET_FORM_DATA':
      return action.payload;
    case 'UPDATE_FORM_FIELD':
      return { ...state, [action.field]: action.value };
    case 'UPDATE_MULTIPLE_FIELDS':
      return { ...state, ...action.updates };
    default:
      return state;
  }
};

// Initial form data
const initialFormData: FormData = {
  userType: '',
  educationStatus: '',
  helpType: '',
  wantsMentor: false,
};

export default function MultiStepForm() {
  // Replace useState with useReducer for form data
  const [formData, dispatch] = useReducer(formReducer, initialFormData);
  const [step, setStep] = useState(1);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const isMounted = useRef(false);
  // Create a ref to store the initial form data
  const initialFormDataRef = useRef(initialFormData);

  // Create memoized update function for better performance
  const updateFormData = useCallback((updates: Partial<FormData>) => {
    dispatch({ type: 'UPDATE_MULTIPLE_FIELDS', updates });
  }, []);

  // Set entire form data (for loading from storage)
  const setFormData = useCallback((newData: FormData) => {
    dispatch({ type: 'SET_FORM_DATA', payload: newData });
  }, []);

  // Create a callback for loading progress
  const loadProgress = useCallback(async () => {
    try {
      // Get or initialize session using the improved storage layer
      const progress = await onboardingStore.getProgress();
      
      if (progress) {
        setStep(progress.step_number);
        setFormData(progress.data as unknown as FormData);
        setSessionId(progress.session_id);
      } else {
        // This will create a new session if needed
        const newSessionId = await onboardingStore.getSessionId();
        if (newSessionId) {
          setSessionId(newSessionId);
          // Use initialFormDataRef instead of formData to break the dependency
          await onboardingStore.saveProgress({
            session_id: newSessionId,
            step_number: 1,
            data: initialFormDataRef.current
          });
        }
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  }, [setFormData, setSessionId, setStep]); // No formData dependency needed

  // Load saved progress on mount
  useEffect(() => {
    // Skip effect if it already ran once
    if (isMounted.current) return;
    
    loadProgress();
    
    // Mark effect as having run
    isMounted.current = true;
  }, [loadProgress]);

  const nextStep = async () => {
    if (!sessionId) {
      console.error('No session ID found when trying to save progress');
      return;
    }

    const newStep = step + 1;
    setStep(newStep);

    try {
      await onboardingStore.saveProgress({
        session_id: sessionId,
        step_number: newStep,
        data: formData
      } as OnboardingProgress);
    } catch (error) {
      console.error('Error saving progress:', error);
      // Revert step if save fails
      setStep(step);
    }
  };

  const prevStep = async () => {
    if (!sessionId) {
      console.error('No session ID found when trying to save progress');
      return;
    }

    const newStep = step - 1;
    setStep(newStep);
    
    try {
      await onboardingStore.saveProgress({
        session_id: sessionId,
        step_number: newStep,
        data: formData
      } as OnboardingProgress);
    } catch (error) {
      console.error('Error saving progress:', error);
      // Revert step if save fails
      setStep(step);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <Step1 
          formData={formData}
          updateFormField={<K extends keyof FormData>(field: K, value: FormData[K]) => 
            dispatch({ type: 'UPDATE_FORM_FIELD', field, value })}
          updateFormData={updateFormData}
          nextStep={nextStep}
        />;
      case 2:
        return <Step2 
          formData={formData}
          updateFormField={<K extends keyof FormData>(field: K, value: FormData[K]) => 
            dispatch({ type: 'UPDATE_FORM_FIELD', field, value })}
          updateFormData={updateFormData}
          nextStep={nextStep}
          prevStep={prevStep}
        />;
      case 3:
        return <Step3 
          formData={formData}
          updateFormData={updateFormData}
          prevStep={prevStep}
          sessionId={sessionId}
          setSessionId={setSessionId}
        />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl w-full bg-[#16197C] p-8 h-[40vw] rounded-[50px]" >
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-white mb-2">
            {TITLE}
          </h1>
          <h1 className="text-3xl font-semibold text-white mb-2">
            {TITLE2}
          </h1>
          <p className="text-gray-200">
            {DESCRIPTION}
          </p>
        </div>
        <Image
          src="/mascot2.png"
          alt="AI Assistant Mascot"
          width={140}
          height={140}
          priority
        />
      </div>
      <StepsContainer currentStep={step} />
      {renderStep()}
    </div>
  );
} 