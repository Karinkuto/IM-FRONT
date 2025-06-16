import { createContext } from "react";
import type { OnboardingFormContextType } from "../types/onboarding";

export const OnboardingFormContext =
	createContext<OnboardingFormContextType | null>(null);
