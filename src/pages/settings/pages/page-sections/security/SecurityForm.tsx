import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, KeyRound, Lock } from "lucide-react";
import type { ChangeEvent } from "react";
import { useState } from "react";
import { SettingsSection } from "../../../components/SettingsSection";

interface SecurityFormProps {
	onSubmit: (data: {
		currentPassword: string;
		newPassword: string;
		confirmPassword: string;
	}) => Promise<void>;
	isSubmitting?: boolean;
}

export function SecurityForm({
	onSubmit,
	isSubmitting = false,
}: SecurityFormProps) {
	const [formData, setFormData] = useState({
		currentPassword: "",
		newPassword: "",
		confirmPassword: "",
	});

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		await onSubmit(formData);
	};

	return (
		<form onSubmit={handleSubmit}>
			<SettingsSection
				title="Change Password"
				description="Update your password. Make sure it's strong and secure."
			>
				<Card>
					<CardContent>
						<div className="space-y-6">
							<div className="space-y-2">
								<Label htmlFor="currentPassword">Current Password</Label>
								<Input
									id="currentPassword"
									name="currentPassword"
									type="password"
									value={formData.currentPassword}
									onChange={handleChange}
									placeholder="Enter current password"
									icon={<Lock className="h-4 w-4" />}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="newPassword">New Password</Label>
								<Input
									id="newPassword"
									name="newPassword"
									type="password"
									value={formData.newPassword}
									onChange={handleChange}
									placeholder="Enter new password"
									icon={<KeyRound className="h-4 w-4" />}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="confirmPassword">Confirm New Password</Label>
								<Input
									id="confirmPassword"
									name="confirmPassword"
									type="password"
									value={formData.confirmPassword}
									onChange={handleChange}
									placeholder="Confirm new password"
									icon={<Check className="h-4 w-4" />}
								/>
							</div>

							<div className="flex justify-end pt-2">
								<Button type="submit" disabled={isSubmitting}>
									{isSubmitting ? "Updating..." : "Update Password"}
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>
			</SettingsSection>
		</form>
	);
}
