'use client';

import { useState, useEffect } from 'react';
import StepsContainer from './StepsContainer';
import Step1 from './Step1';
import Step2 from './Step2';
import Step3 from './Step3';
import { FormData } from './types';
import { onboardingStore } from '@/services/storage/onboarding';
import { onboardingApiClient, CreateOnboardingProgressRequest, UpdateOnboardingProgressRequest } from '@/services/api/onboarding/api';
import { generateUUID } from '@/app/utils/utils';
import Image from 'next/image';
import './onboarding.css';

const TITLE = "Find What's Right";
const TITLE2 = " For You";
const DESCRIPTION = "Help us to know about you";

export default function MultiStepForm() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    userType: '',
    educationStatus: '',
    helpType: '',
    wantsMentor: false,
  });
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Load saved progress on mount
  useEffect(() => {
    const loadProgress = async () => {
      try {
        // Get or initialize session using the improved storage layer
        const progress = await onboardingStore.getProgress();
        
        if (progress) {
          setStep(progress.step_number);
          setFormData(progress.data);
          setSessionId(progress.session_id);
        } else {
          // This will create a new session if needed
          const newSessionId = await onboardingStore.getSessionId();
          if (newSessionId) {
            setSessionId(newSessionId);
            // Initial save with empty form data
            await onboardingStore.saveProgress({
              session_id: newSessionId,
              step_number: 1,
              data: formData
            });
          }
        }
      } catch (error) {
        // Handle error silently or implement proper error handling UI if needed
      }
    };
    loadProgress();
  }, []);

  const nextStep = async () => {
    if (!sessionId) {
      return;
    }

    const newStep = step + 1;
    setStep(newStep);

    try {
      await onboardingStore.saveProgress({
        session_id: sessionId,
        step_number: newStep,
        data: formData
      });
    } catch (error) {
      // Revert step if save fails
      setStep(step);
    }
  };

  const prevStep = async () => {
    if (!sessionId) {
      return;
    }

    const newStep = step - 1;
    setStep(newStep);
    
    try {
      await onboardingStore.saveProgress({
        session_id: sessionId,
        step_number: newStep,
        data: formData
      });
    } catch (error) {
      // Revert step if save fails
      setStep(step);
    }
  };

  const handleFormDataChange = async (newData: FormData) => {
    if (!sessionId) {
      return;
    }

    setFormData(newData);
    
    try {
      await onboardingStore.saveProgress({
        session_id: sessionId,
        step_number: step,
        data: newData
      });
    } catch (error) {
      // Handle error silently or implement proper error handling UI if needed
    }
  };

  const renderStep = () => {
    const props = {
      formData,
      setFormData: handleFormDataChange,
      nextStep,
      prevStep,
      sessionId,
      setSessionId
    };

    switch (step) {
      case 1:
        return <Step1 {...props} />;
      case 2:
        return <Step2 {...props} />;
      case 3:
        return <Step3 {...props} />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl w-full mx-auto">
      <div className="flex items-start justify-between mb-3">
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