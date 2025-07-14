export interface FormData {
  userType: string;
  educationStatus: string;
  helpType: string;
  graduationYear?: string[];
  fieldOfStudy?: string[];
  major?: string[];
  currentSkills?: string[];
  targetSkills?: string[];
  wantsMentor?: boolean;
  preferenceType?: 'coding' | 'lessCode' | 'noCoding';
  collegeHelpTypes?: string[];
  graduateHelpTypes?: string[];
  knowsPath?: boolean;
  experience?: string;
  currentRoles?: string[];
  targetRoles?: string[];
  workingHelpTypes?: string[];
}

export interface StepProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
  updateFormField: <K extends keyof FormData>(field: K, value: FormData[K]) => void;
  updateFormData: (updates: Partial<FormData>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

export interface Step2Props {
  formData: FormData;
  updateFormField: <K extends keyof FormData>(field: K, value: FormData[K]) => void;
  updateFormData: (updates: Partial<FormData>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

export interface Option {
  value: string;
  label: string;
}

export interface OnboardingProgress {
  session_id: string;
  step_number: number;
  data: FormData;
  user_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface OnboardingStore {
  getProgress: () => Promise<OnboardingProgress | null>;
  saveProgress: (data: OnboardingProgress) => Promise<OnboardingProgress>;
  clearProgress: () => Promise<void>;
  getSessionId: () => Promise<string | null>;
} 