import { useCallback, useState } from "react";
import { toast } from "sonner";
import { SecurityForm } from "../page-sections/security/SecurityForm";
import { useChangePasswordMutation } from "@/redux/api/authApi";

export default function SecurityPage() {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [changePassword] = useChangePasswordMutation();

	const handleSecuritySubmit = useCallback(
		async (data: {
			currentPassword: string;
			newPassword: string;
			confirmPassword: string;
		}) => {
			setIsSubmitting(true);
			try {
				if (data.newPassword !== data.confirmPassword) {
					toast.error("New password and confirmation do not match.");
					setIsSubmitting(false);
					return;
				}

				await changePassword({
					current_password: data.currentPassword,
					new_password: data.newPassword,
					new_password_confirmation: data.confirmPassword,
				}).unwrap();

				toast.success("Password updated successfully!");
				// Optionally reset form fields here if needed
			} catch (error) {
				console.error("Failed to update password:", error);
				toast.error("Failed to update password.", {
					description: error?.data?.message || "Unknown error",
				});
			} finally {
				setIsSubmitting(false);
			}
		},
		[changePassword],
	);

	return (
		<SecurityForm onSubmit={handleSecuritySubmit} isSubmitting={isSubmitting} />
	);
}
