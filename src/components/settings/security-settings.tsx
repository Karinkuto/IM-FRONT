import { z } from "zod";
import {
	FormSection,
	SmartForm,
	SmartFormField,
} from "@/components/smart-form";
import { PasswordStrengthMeter } from "@/components/strength-meter";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { PasswordInput } from "@/components/ui/password-input";
import { useChangePasswordMutation } from "@/redux/apis/authApi";

const passwordSchema = z
	.object({
		current_password: z.string().min(1, "Current password is required"),
		new_password: z
			.string()
			.min(8, "Password must be at least 8 characters long")
			.regex(/[A-Z]/, "Must contain at least one uppercase letter")
			.regex(/[a-z]/, "Must contain at least one lowercase letter")
			.regex(/[0-9]/, "Must contain at least one number")
			.regex(/[^A-Za-z0-9]/, "Must contain at least one special character"),
		new_password_confirmation: z.string(),
	})
	.refine((data) => data.new_password === data.new_password_confirmation, {
		message: "Passwords do not match",
		path: ["new_password_confirmation"],
	});

const passwordRequirements = [
	{
		label: "At least 8 characters",
		validator: (password: string) => password.length >= 8,
	},
	{
		label: "At least one lowercase letter",
		validator: (password: string) => /[a-z]/.test(password),
	},
	{
		label: "At least one uppercase letter",
		validator: (password: string) => /[A-Z]/.test(password),
	},
	{
		label: "At least one number",
		validator: (password: string) => /\d/.test(password),
	},
	{
		label: "At least one special character",
		validator: (password: string) => /[^A-Za-z0-9]/.test(password),
	},
];

export function SecuritySettings() {
	const [changePassword] = useChangePasswordMutation();

	return (
		<Card className="max-w-2xl">
			<CardHeader>
				<CardTitle className="text-lg">Change Password</CardTitle>
				<CardDescription>
					Update your password to keep your account secure
				</CardDescription>
			</CardHeader>
			<SmartForm
				schema={passwordSchema}
				mutationFn={async (data) => {
					return changePassword({
						current_password: data.current_password,
						new_password: data.new_password,
						new_password_confirmation: data.new_password_confirmation,
					}).unwrap();
				}}
				submitText="Update Password"
				card={false}
			>
				{(form) => (
					<>
						<FormSection
							title="Password"
							description="Update your password to keep your account secure"
						>
							<div className="space-y-4">
								<div className="space-y-2">
									<SmartFormField
										form={form}
										name="current_password"
										type="password"
										label="Current Password"
										placeholder="Enter current password"
										className="relative"
										render={({ field, id }) => (
											<PasswordInput
												{...field}
												value={field.value || ""}
												id={id}
											/>
										)}
									/>
								</div>
								<div className="space-y-2">
									<SmartFormField
										form={form}
										name="new_password"
										type="password"
										label="New Password"
										placeholder="Enter new password"
										className="relative"
										render={({ field, id }) => (
											<PasswordStrengthMeter
												value={field.value || ""}
												onValueChange={field.onChange}
												id={id}
												segments={passwordRequirements.length}
												requirements={passwordRequirements}
												showText
												showRequirements={false}
												showPasswordToggle
												placeholder="Enter new password"
											/>
										)}
									/>
								</div>
								<div className="space-y-2">
									<SmartFormField
										form={form}
										name="new_password_confirmation"
										type="password"
										label="Confirm New Password"
										placeholder="Confirm new password"
										className="relative"
										render={({ field, id }) => (
											<PasswordInput
												{...field}
												value={field.value || ""}
												id={id}
											/>
										)}
									/>
								</div>
								<div className="bg-muted/50 p-4 rounded-lg">
									<h4 className="font-medium text-sm mb-2">
										Password Requirements:
									</h4>
									<ul className="text-sm text-muted-foreground space-y-1">
										<li>• At least 8 characters long</li>
										<li>• Contains at least one uppercase letter</li>
										<li>• Contains at least one lowercase letter</li>
										<li>• Contains at least one number</li>
										<li>• Contains at least one special character</li>
									</ul>
								</div>
							</div>
						</FormSection>
					</>
				)}
			</SmartForm>
		</Card>
	);
}
