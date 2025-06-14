import { useCallback, useState } from "react";
import { toast } from "sonner";
import { SecurityForm } from "../page-sections/security/SecurityForm";

export default function SecurityPage() {
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSecuritySubmit = useCallback(
		async (data: {
			currentPassword: string;
			newPassword: string;
			confirmPassword: string;
		}) => {
			setIsSubmitting(true);
			try {
				// Simulate API call
				await new Promise((resolve) => setTimeout(resolve, 1000));
				console.log("Password updated:", data);
				toast.success("Password updated successfully!");
				// Optionally reset form fields here if needed
			} catch (error) {
				toast.error("Failed to update password.", {
					description: error instanceof Error ? error.message : "Unknown error",
				});
			} finally {
				setIsSubmitting(false);
			}
		},
		[],
	);

	return (
		<SecurityForm onSubmit={handleSecuritySubmit} isSubmitting={isSubmitting} />
	);
}
