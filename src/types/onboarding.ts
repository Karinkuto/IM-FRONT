import { isValidPhoneNumber } from "react-phone-number-input";
import { z } from "zod";

export const onboardingSchema = z
	.object({
		newPassword: z.string().min(8, "Password must be at least 8 characters"),
		confirmPassword: z.string(),
		name: z.string().min(1, "Name is required"),
		description: z.string().nullable().optional(),
		email: z.string().email("Invalid email address"),
		phone: z.string().refine(isValidPhoneNumber, {
			message: "Invalid phone number",
		}),
		apiEndpoint: z.string().nullable().optional(),
		apiKey: z.string().nullable().optional(),
		logo: z
			.instanceof(File, { message: "Logo must be a file" })
			.or(z.instanceof(Blob, { message: "Logo must be a blob" }))
			.optional(),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

export type OnboardingFormValues = z.infer<typeof onboardingSchema>;
