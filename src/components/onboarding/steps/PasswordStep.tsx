import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { OnboardingData } from "../types/types";

export const PasswordStep = () => {
	const {
		register,
		formState: { errors },
		watch,
	} = useFormContext<OnboardingData>();

	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	const password = watch("password");

	return (
		<div className="space-y-6">
			<div className="space-y-2">
				<Label htmlFor="password" className="text-sm font-medium">
					New Password
				</Label>
				<div className="relative">
					<Input
						id="password"
						type={showPassword ? "text" : "password"}
						{...register("password")}
						className={`pr-10 ${errors.password ? "border-destructive" : ""}`}
					/>
					<Button
						type="button"
						variant="ghost"
						size="icon"
						className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
						onClick={() => setShowPassword(!showPassword)}
					>
						{showPassword ? (
							<EyeOff className="h-4 w-4 text-muted-foreground" />
						) : (
							<Eye className="h-4 w-4 text-muted-foreground" />
						)}
						<span className="sr-only">
							{showPassword ? "Hide password" : "Show password"}
						</span>
					</Button>
				</div>
				{errors.password ? (
					<p className="text-sm text-destructive mt-1">
						{errors.password.message}
					</p>
				) : (
					<p className="text-xs text-muted-foreground mt-1">
						Use at least 8 characters with a mix of letters, numbers, and symbols
					</p>
				)}
			</div>

			<div className="space-y-2">
				<Label htmlFor="confirmPassword" className="text-sm font-medium">
					Confirm Password
				</Label>
				<div className="relative">
					<Input
						id="confirmPassword"
						type={showConfirmPassword ? "text" : "password"}
						{...register("confirmPassword")}
						className={`pr-10 ${
							errors.confirmPassword ? "border-destructive" : ""
						}`}
					/>
					<Button
						type="button"
						variant="ghost"
						size="icon"
						className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
						onClick={() => setShowConfirmPassword(!showConfirmPassword)}
					>
						{showConfirmPassword ? (
							<EyeOff className="h-4 w-4 text-muted-foreground" />
						) : (
							<Eye className="h-4 w-4 text-muted-foreground" />
						)}
						<span className="sr-only">
							{showConfirmPassword ? "Hide password" : "Show password"}
						</span>
					</Button>
				</div>
				{errors.confirmPassword ? (
					<p className="text-sm text-destructive mt-1">
						{errors.confirmPassword.message}
					</p>
				) : password ? (
					<p className="text-xs text-muted-foreground mt-1">
						Make sure your passwords match
					</p>
				) : null}
			</div>
		</div>
	);
};
