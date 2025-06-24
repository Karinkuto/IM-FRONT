import { useAuth } from "@/hooks/useAuth";
import { useCallback, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import { ZodError } from "zod";

import {
  useChangePasswordMutation,
  useCreateInsurerProfileMutation,
  useUpdateInsurerProfileMutation,
} from "@/redux/api/authApi";
import { createFormData } from "@/utils/formHelpers";
import type { InsurerProfile } from "@/types/profile";
import { OnboardingFormContext } from "./context/OnboardingFormContext";
import type {
  OnboardingData,
  OnboardingFormProviderProps,
} from "./types/onboarding";
import { stepSchemas } from "./types/types";

// Helper to safely extract field names from a Zod schema
const getSchemaFields = (schema: z.ZodTypeAny): string[] => {
  try {
    // Try to get the shape directly
    if (
      "shape" in schema &&
      typeof schema.shape === "object" &&
      schema.shape !== null
    ) {
      return Object.keys(schema.shape);
    }

    // Try to get shape from _def if available
    if (
      "_def" in schema &&
      typeof schema._def === "object" &&
      schema._def !== null
    ) {
      const def = schema._def as Record<string, unknown>;

      // Handle shape as a function
      if (typeof def.shape === "function") {
        const shape = def.shape();
        if (shape && typeof shape === "object") {
          return Object.keys(shape);
        }
      }

      // Handle shape as an object
      if (def.shape && typeof def.shape === "object" && def.shape !== null) {
        return Object.keys(def.shape);
      }

      // Fallback to empty array if shape can't be determined
      return [];
    }
  } catch (error) {
    console.error("Error getting schema fields:", error);
    return [];
  }
};

// Using dataURLtoBlob from formHelpers utility

export const OnboardingFormProvider: React.FC<OnboardingFormProviderProps> = ({
  children,
  initialData = {},
  onComplete,
  isTemporaryPassword = false,
}) => {
  const { user } = useAuth();
  const userId = user?.id || initialData.id;

  // Debug logging
  console.log("=== OnboardingFormProvider Debug ===");
  console.log("isTemporaryPassword:", isTemporaryPassword);
  console.log("stepSchemas length:", stepSchemas.length);
  console.log("stepSchemas:", stepSchemas);

  // Fix the initial step logic
  const initialStep = 1;
  const totalSteps = isTemporaryPassword ? 5 : 4;

  console.log("totalSteps calculated:", totalSteps);
  console.log("===================================");

  const [currentStep, setCurrentStep] = useState(initialStep);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<OnboardingData>({
    defaultValues: {
      password: "",
      confirmPassword: "",
      companyName: "",
      description: "",
      contactEmail: "",
      contactPhone: "",
      apiEndpoint: "",
      apiKey: "",
      logo: null,
    },
    mode: "onChange",
    resolver: async (data) => {
      try {
        // Fix: Calculate correct schema index based on isTemporaryPassword
        let schemaIndex: number;

        if (isTemporaryPassword) {
          // When temporary password is true: use step directly (1->0, 2->1, 3->2, etc.)
          schemaIndex = currentStep - 1;
        } else {
          // When temporary password is false: skip password schema (1->1, 2->2, 3->3, etc.)
          schemaIndex = currentStep; // This skips index 0 (password schema)
        }

        console.log("Resolver - Current step:", currentStep);
        console.log("Resolver - Schema index:", schemaIndex);
        console.log("Resolver - Using schema:", stepSchemas[schemaIndex]);

        const schema = stepSchemas[schemaIndex];
        const values = await schema.parseAsync(data);
        return { values, errors: {} };
      } catch (error) {
        console.log("Resolver validation error:", error);
        if (error instanceof ZodError) {
          return {
            values: {},
            errors: error.errors.reduce((acc, curr) => {
              const newAcc = Object.assign({}, acc);
              newAcc[curr.path[0]] = { message: curr.message };
              return newAcc;
            }, {} as Record<string, { message: string }>),
          };
        }
        throw error;
      }
    },
  });

  const nextStep = useCallback(async () => {
    try {
      // Fix: Calculate correct schema index based on isTemporaryPassword
      let currentSchemaIndex: number;

      if (isTemporaryPassword) {
        // When temporary password is true: use step directly
        currentSchemaIndex = currentStep - 1;
      } else {
        // When temporary password is false: skip password schema
        currentSchemaIndex = currentStep; // Skip index 0
      }

      const currentSchema = stepSchemas[currentSchemaIndex];
      const fields = getSchemaFields(currentSchema);

      // Enhanced debug logging
      console.log("=== NextStep Debug Info ===");
      console.log("isTemporaryPassword:", isTemporaryPassword);
      console.log("Current step:", currentStep);
      console.log("Total steps:", totalSteps);
      console.log("Schema index:", currentSchemaIndex);
      console.log("Schema:", currentSchema);
      console.log("Fields to validate:", fields);
      console.log("Form values:", form.getValues());
      console.log("===========================");

      // Trigger validation for the current step fields
      const isValid = await form.trigger(fields as (keyof OnboardingData)[]);

      console.log("Validation result:", isValid);
      console.log("Form errors:", form.formState.errors);

      if (isValid) {
        setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
      }
      return isValid;
    } catch (error) {
      console.error("Error in nextStep:", error);
      return false;
    }
  }, [currentStep, form, totalSteps, isTemporaryPassword]);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  }, []);

  const goToStep = useCallback(
    (step: number) => {
      setCurrentStep(() => Math.max(1, Math.min(step, totalSteps)));
    },
    [totalSteps]
  );

  const [changePassword] = useChangePasswordMutation();
  const [createInsurerProfile] = useCreateInsurerProfileMutation();
  const [updateInsurerProfile] = useUpdateInsurerProfileMutation();

  const submitForm = useCallback(async () => {
    if (!userId) {
      toast.error("User ID is required to update insurer profile");
      return;
    }

    let profile: InsurerProfile;

    try {
      setIsSubmitting(true);
      const values = form.getValues();

      // 1. Handle password change (always from temporary password during onboarding)
      if (isTemporaryPassword && values.password && values.confirmPassword) {
        if (values.password !== values.confirmPassword) {
          toast.error("Passwords do not match.");
          setIsSubmitting(false);
          return;
        }

        try {
          // Change password from temporary to permanent
          await changePassword({
            new_password: values.password,
            new_password_confirmation: values.confirmPassword,
          }).unwrap();
          toast.success("Password changed successfully!");
        } catch (error) {
          console.error("Password change error:", error);
          toast.error("Failed to update password. Please try again.");
          setIsSubmitting(false);
          return;
        }
      }

      // 2. Handle Insurer Profile creation or update
      const insurerPayload: Record<string, any> = {
        name: values.companyName,
        description: values.description || "",
        contact_email: values.contactEmail,
        contact_phone: values.contactPhone || "",
        api_endpoint: values.apiEndpoint || "",
        api_key: values.apiKey || "",
      };

      // Only add logo if it exists and is a valid file/blob
      if (
        values.logo &&
        (values.logo instanceof File || values.logo instanceof Blob)
      ) {
        insurerPayload.logo = values.logo;
      }

      // Create FormData with proper file handling
      const formData = createFormData(
        insurerPayload,
        values.logo ? ["logo"] : []
      );

      // Enhanced logging for debugging
      console.log("=== FormData Debug ===");
      console.log("Original values.logo:", values.logo);
      console.log("Logo type:", typeof values.logo);
      console.log("Logo instanceof File:", values.logo instanceof File);
      console.log("Logo instanceof Blob:", values.logo instanceof Blob);
      console.log("Including logo in fileFields:", values.logo ? true : false);

      // Log FormData contents
      console.log("FormData contents:");
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(
            `  ${key}: [File] ${value.name} (${value.type}, ${value.size} bytes)`
          );
        } else {
          console.log(`  ${key}:`, value);
        }
      }
      console.log("==================");

      // 3. Create or update the insurer profile
      if (initialData.insurerId) {
        // Update existing profile using the insurer ID
        profile = await updateInsurerProfile({
          id: initialData.insurerId,
          payload: formData,
        }).unwrap();
        toast.success("Profile updated successfully!");
      } else {
        // Create new profile
        profile = await createInsurerProfile(formData).unwrap();

        // Update the form with the new insurer ID for any subsequent updates
        if (profile.id) {
          form.setValue("insurerId", profile.id);
        }

        toast.success("Profile created successfully!");
      }

      // 4. Call the onComplete callback with the updated profile
      onComplete(profile);
    } catch (error) {
      console.error("Error submitting form:", error);
      const errorMessage =
        error?.data?.message ||
        error?.data?.error ||
        "Failed to save profile. Please try again.";
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [
    userId,
    form,
    changePassword,
    initialData.insurerId,
    updateInsurerProfile,
    createInsurerProfile,
    onComplete,
    isTemporaryPassword,
  ]);

  const contextValue = useMemo(
    () => ({
      currentStep,
      totalSteps,
      isSubmitting,
      form,
      nextStep,
      prevStep,
      submitForm,
      goToStep,
    }),
    [
      currentStep,
      isSubmitting,
      form,
      nextStep,
      prevStep,
      submitForm,
      goToStep,
      totalSteps,
    ]
  );

  return (
    <OnboardingFormContext.Provider value={contextValue}>
      <FormProvider {...form}>{children}</FormProvider>
    </OnboardingFormContext.Provider>
  );
};
