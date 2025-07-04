import { z } from "zod";
import {
	FormSection,
	SmartForm,
	SmartFormField,
} from "@/components/smart-form";
import { PasswordStrengthMeter } from "@/components/strength-meter";
import { Card } from "@/components/ui/card";
import { PasswordInput } from "@/components/ui/password-input";
import { useChangePasswordMutation } from "@/redux/apis/authApi";

// Password validation patterns
const PASSWORD_PATTERNS = {
	UPPERCASE: /[A-Z]/,
	LOWERCASE: /[a-z]/,
	NUMBER: /[0-9]/,
	SPECIAL_CHAR: /[^A-Za-z0-9]/,
} as const;

const passwordSchema = z
	.object({
		current_password: z.string().min(1, "Current password is required"),
		new_password: z
			.string()
			.min(8, "Password must be at least 8 characters long")
			.regex(
				PASSWORD_PATTERNS.UPPERCASE,
				"Must contain at least one uppercase letter"
			)
			.regex(
				PASSWORD_PATTERNS.LOWERCASE,
				"Must contain at least one lowercase letter"
			)
			.regex(PASSWORD_PATTERNS.NUMBER, "Must contain at least one number")
			.regex(
				PASSWORD_PATTERNS.SPECIAL_CHAR,
				"Must contain at least one special character"
			),
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
		validator: (password: string) => PASSWORD_PATTERNS.LOWERCASE.test(password),
	},
	{
		label: "At least one uppercase letter",
		validator: (password: string) => PASSWORD_PATTERNS.UPPERCASE.test(password),
	},
	{
		label: "At least one number",
		validator: (password: string) => PASSWORD_PATTERNS.NUMBER.test(password),
	},
	{
		label: "At least one special character",
		validator: (password: string) =>
			PASSWORD_PATTERNS.SPECIAL_CHAR.test(password),
	},
];

export function SecuritySettings() {
	const [changePassword] = useChangePasswordMutation();

	return (
		<Card className="max-w-2xl">
			<SmartForm
				card={false}
				mutationFn={async (data) => {
					const response = await changePassword({
						current_password: data.current_password,
						new_password: data.new_password,
						new_password_confirmation: data.new_password_confirmation,
					}).unwrap();
					return response;
				}}
				schema={passwordSchema}
				submitText="Update Password"
			>
				{(form) => (
					<>
						<FormSection
							description="Update your password to keep your account secure"
							title="Change Password"
						>
							<div className="space-y-4">
								<div className="space-y-2">
									<SmartFormField
										className="relative"
										form={form}
										label="Current Password"
										name="current_password"
										placeholder="Enter current password"
										render={({ field, id }) => (
											<PasswordInput
												{...field}
												id={id}
												value={field.value || ""}
											/>
										)}
										type="password"
									/>
								</div>
								<div className="space-y-2">
									<SmartFormField
										className="relative"
										form={form}
										label="New Password"
										name="new_password"
										placeholder="Enter new password"
										render={({ field, id }) => (
											<PasswordStrengthMeter
												enableAutoGenerate={true}
												id={id}
												meterClassName="h-1"
												onValueChange={field.onChange}
												placeholder="Enter new password"
												requirements={passwordRequirements}
												segments={passwordRequirements.length}
												showPasswordToggle
												showRequirements={false}
												showText
												size="sm"
												value={field.value || ""}
											/>
										)}
										type="password"
									/>
								</div>
								<div className="space-y-2">
									<SmartFormField
										className="relative"
										form={form}
										label="Confirm New Password"
										name="new_password_confirmation"
										placeholder="Confirm new password"
										render={({ field, id }) => (
											<PasswordInput
												{...field}
												id={id}
												value={field.value || ""}
											/>
										)}
										type="password"
									/>
								</div>
								<div className="rounded-lg bg-muted/50 p-4">
									<h4 className="mb-2 font-medium text-sm">
										Password Requirements:
									</h4>
									<ul className="space-y-1 text-muted-foreground text-sm">
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
