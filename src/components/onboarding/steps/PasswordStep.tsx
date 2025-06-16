import { useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { Eye, EyeOff, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordStrengthMeter } from "../PasswordStrengthMeter";
import { checkPasswordStrength } from "../types/types";
import type { OnboardingData } from "../types/types";
import { cn } from "@/lib/utils";

export const PasswordStep = () => {
	const {
		register,
		formState: { errors },
		watch,
	} = useFormContext<OnboardingData>();

	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	const password = watch("password");
  const [strength, setStrength] = useState(() => checkPasswordStrength(password || ''));

  // Update strength when password changes
  useEffect(() => {
    setStrength(checkPasswordStrength(password || ''));
  }, [password]);

  // Check if password meets all requirements
  const requirements = [
    { id: 'length', label: 'At least 8 characters', regex: /.{8,}/ },
    { id: 'lowercase', label: 'At least one lowercase letter', regex: /[a-z]/ },
    { id: 'uppercase', label: 'At least one uppercase letter', regex: /[A-Z]/ },
    { id: 'number', label: 'At least one number', regex: /[0-9]/ },
    { id: 'special', label: 'At least one special character', regex: /[^A-Za-z0-9]/ },
  ];

  const getRequirementStatus = (regex: RegExp) => {
    if (!password) return 'pending';
    return regex.test(password) ? 'valid' : 'invalid';
  };

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
				<div className="mt-2 h-1.5">
          {password && <PasswordStrengthMeter strength={strength} />}
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
