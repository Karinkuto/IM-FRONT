import type { UseFormReturn } from 'react-hook-form';
import type { InsurerProfile } from '@/types/profile';

export interface OnboardingData {
  password: string;
  confirmPassword: string;
  companyName: string;
  description: string;
  contactEmail: string;
  contactPhone: string;
  apiEndpoint: string;
  apiKey: string;
  logo: File | string | null;
}

export interface OnboardingFormContextType {
  currentStep: number;
  totalSteps: number;
  isSubmitting: boolean;
  form: UseFormReturn<OnboardingData>;
  nextStep: () => Promise<boolean>;
  prevStep: () => void;
  submitForm: () => Promise<void>;
  goToStep: (step: number) => void;
}

export interface OnboardingFormProviderProps {
  children: React.ReactNode;
  initialData?: Partial<InsurerProfile>;
  onComplete: (profile: InsurerProfile) => void;
}
