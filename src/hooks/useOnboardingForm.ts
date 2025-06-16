import { useContext } from 'react';
import { OnboardingFormContext } from '../components/onboarding/context/OnboardingFormContext';
import type { OnboardingFormContextType } from '../components/onboarding/types/onboarding';

export const useOnboardingForm = (): OnboardingFormContextType => {
  const context = useContext(OnboardingFormContext);
  if (!context) {
    throw new Error('useOnboardingForm must be used within an OnboardingFormProvider');
  }
  return context;
};
