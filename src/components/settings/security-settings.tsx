import { Eye, EyeOff } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SecuritySettings() {
	const [showCurrentPassword, setShowCurrentPassword] = useState(false);
	const [showNewPassword, setShowNewPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	// Security form state
	const [securityData, setSecurityData] = useState({
		current_password: "",
		new_password: "",
		confirm_password: "",
	});

	const handleSecuritySubmit = (e: React.FormEvent) => {
		e.preventDefault();
		// Handle password update
		console.log("Password updated");
		setSecurityData({
			current_password: "",
			new_password: "",
			confirm_password: "",
		});
	};

	return (
		<Card className="max-w-2xl">
			<CardHeader>
				<CardTitle className="text-lg">Change Password</CardTitle>
				<CardDescription>
					Update your password to keep your account secure
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSecuritySubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="current_password">Current Password</Label>
						<div className="relative">
							<Input
								id="current_password"
								type={showCurrentPassword ? "text" : "password"}
								value={securityData.current_password}
								onChange={(e) =>
									setSecurityData((prev) => ({
										...prev,
										current_password: e.target.value,
									}))
								}
								placeholder="Enter current password"
							/>
							<Button
								type="button"
								variant="ghost"
								size="sm"
								className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
								onClick={() => setShowCurrentPassword(!showCurrentPassword)}
							>
								{showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
							</Button>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="new_password">New Password</Label>
						<div className="relative">
							<Input
								id="new_password"
								type={showNewPassword ? "text" : "password"}
								value={securityData.new_password}
								onChange={(e) =>
									setSecurityData((prev) => ({
										...prev,
										new_password: e.target.value,
									}))
								}
								placeholder="Enter new password"
							/>
							<Button
								type="button"
								variant="ghost"
								size="sm"
								className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
								onClick={() => setShowNewPassword(!showNewPassword)}
							>
								{showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
							</Button>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="confirm_password">Confirm New Password</Label>
						<div className="relative">
							<Input
								id="confirm_password"
								type={showConfirmPassword ? "text" : "password"}
								value={securityData.confirm_password}
								onChange={(e) =>
									setSecurityData((prev) => ({
										...prev,
										confirm_password: e.target.value,
									}))
								}
								placeholder="Confirm new password"
							/>
							<Button
								type="button"
								variant="ghost"
								size="sm"
								className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
								onClick={() => setShowConfirmPassword(!showConfirmPassword)}
							>
								{showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
							</Button>
						</div>
					</div>

					<div className="bg-muted/50 p-4 rounded-lg">
						<h4 className="font-medium text-sm mb-2">Password Requirements:</h4>
						<ul className="text-sm text-muted-foreground space-y-1">
							<li>• At least 8 characters long</li>
							<li>• Contains at least one uppercase letter</li>
							<li>• Contains at least one lowercase letter</li>
							<li>• Contains at least one number</li>
							<li>• Contains at least one special character</li>
						</ul>
					</div>

					<div className="flex justify-end pt-4">
						<Button type="submit">Update Password</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	);
}
