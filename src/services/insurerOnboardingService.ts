import { z } from "zod";

export const insurerOnboardingPayloadSchema = z.object({
	name: z.string(),
	description: z.string().optional(),
	contact_email: z.string().email(),
	contact_phone: z.string(), // Validation is handled in the PhoneNumberInput component
	api_endpoint: z.string().optional(),
	api_key: z.string().optional(),
	logo: z
		.instanceof(File, { message: "Logo must be a file" })
		.or(z.instanceof(Blob, { message: "Logo must be a blob" }))
		.nullable()
		.optional(),
});

export type InsurerOnboardingFormValues = z.infer<
	typeof insurerOnboardingPayloadSchema
>;

type InsurerOnboardingPayload = Omit<InsurerOnboardingFormValues, "logo">;

export function buildInsurerOnboardingFormData(
	values: InsurerOnboardingFormValues
): FormData {
	const formData = new FormData();
	const payload: InsurerOnboardingPayload = {
		name: values.name,
		description: values.description || "",
		contact_email: values.contact_email,
		contact_phone: values.contact_phone,
		api_endpoint: values.api_endpoint || "",
		api_key: values.api_key || "",
	};

	// Add all payload fields to form data
	for (const [key, value] of Object.entries(payload)) {
		if (value !== undefined) {
			formData.append(`payload[${key}]`, String(value));
		}
	}

	// Explicitly handle logo: null, undefined, or File/Blob
	if ("logo" in values) {
		if (values.logo === null) {
			// Explicitly set logo to null for removal
			formData.append("payload[logo]", "");
		} else if (values.logo) {
			// Add new logo file
			formData.append("payload[logo]", values.logo);
		}
	}

	return formData;
}
