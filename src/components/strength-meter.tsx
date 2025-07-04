import { cva, type VariantProps } from "class-variance-authority";
import { Check, Eye, EyeOff, RefreshCw, X } from "lucide-react";
import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const strengthMeterVariants = cva(
	"mt-1 flex h-2 w-full gap-1 rounded-full bg-transparent transition-all",
	{
		variants: {
			size: {
				default: "h-2",
				sm: "h-1.5",
				lg: "h-3",
			},
			animated: {
				true: "",
				false: "",
			},
		},
		defaultVariants: {
			size: "default",
			animated: true,
		},
	}
);

const strengthBarSegmentVariants = cva(
	"h-full rounded-full transition-all duration-300 ease-in-out",
	{
		variants: {
			strength: {
				empty: "bg-transparent",
				weak: "bg-red-500",
				fair: "bg-orange-500",
				good: "bg-yellow-500",
				strong: "bg-green-500",
			},
			animated: {
				true: "animate-pulse",
				false: "",
			},
		},
		defaultVariants: {
			strength: "empty",
			animated: false,
		},
	}
);

export type StrengthLevel = "empty" | "weak" | "fair" | "good" | "strong";

export interface PasswordStrengthRequirement {
	label: string;
	validator: (password: string) => boolean;
}

export interface PasswordStrengthMeterProps
	extends React.HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof strengthMeterVariants> {
	value?: string;
	onValueChange?: (value: string) => void;
	showText?: boolean;
	showRequirements?: boolean;
	segments?: number;
	strengthThresholds?: Record<StrengthLevel, number>;
	requirements?: PasswordStrengthRequirement[];
	customCalculateStrength?: (password: string) => number;
	showPasswordToggle?: boolean;
	strengthLabels?: Record<StrengthLevel, string>;
	className?: string;
	meterClassName?: string;
	inputClassName?: string;
	placeholder?: string;
	enableAutoGenerate?: boolean;
	autoGenerateLength?: number;
}

const defaultRequirements: PasswordStrengthRequirement[] = [
	{
		label: "At least 8 characters",
		validator: (password) => password.length >= 8,
	},
	{
		label: "At least one lowercase letter",
		validator: (password) => /[a-z]/.test(password),
	},
	{
		label: "At least one uppercase letter",
		validator: (password) => /[A-Z]/.test(password),
	},
	{
		label: "At least one number",
		validator: (password) => /\d/.test(password),
	},
	{
		label: "At least one special character",
		validator: (password) => /[!@#$%^&*(),.?":{}|<>]/.test(password),
	},
];

const defaultStrengthLabels = {
	empty: "Empty",
	weak: "Weak",
	fair: "Fair",
	good: "Good",
	strong: "Strong",
};

const defaultStrengthThresholds = {
	empty: 0,
	weak: 1,
	fair: 40,
	good: 70,
	strong: 90,
};

export function PasswordStrengthMeter({
	value = "",
	onValueChange,
	showText = true,
	showRequirements = true,
	segments = 4,
	strengthThresholds = defaultStrengthThresholds,
	requirements = defaultRequirements,
	customCalculateStrength,
	showPasswordToggle = true,
	strengthLabels = defaultStrengthLabels,
	className,
	meterClassName,
	inputClassName,
	placeholder = "Enter password",
	size,
	animated = true,
	enableAutoGenerate = false,
	autoGenerateLength = 10,
	...props
}: PasswordStrengthMeterProps) {
	const [password, setPassword] = React.useState(value);
	const [showPassword, setShowPassword] = React.useState(false);

	React.useEffect(() => {
		setPassword(value);
	}, [value]);

	const generateStrongPassword = (
		length: number = autoGenerateLength
	): string => {
		const lowercase = "abcdefghijklmnopqrstuvwxyz";
		const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
		const numbers = "0123456789";
		const specialChars = '!@#$%^&*(),.?":{}|<>';

		const allChars = lowercase + uppercase + numbers + specialChars;

		let password = "";

		password += lowercase[Math.floor(Math.random() * lowercase.length)];
		password += uppercase[Math.floor(Math.random() * uppercase.length)];
		password += numbers[Math.floor(Math.random() * numbers.length)];
		password += specialChars[Math.floor(Math.random() * specialChars.length)];

		for (let i = 4; i < length; i++) {
			password += allChars[Math.floor(Math.random() * allChars.length)];
		}

		return password
			.split("")
			.sort(() => Math.random() - 0.5)
			.join("");
	};

	const handleGeneratePassword = () => {
		const newPassword = generateStrongPassword(autoGenerateLength);
		setPassword(newPassword);
		onValueChange?.(newPassword);
	};

	const calculateBaseStrength = (password: string): number => {
		if (!password) return 0;

		let score = 0;
		let passedRequirements = 0;

		requirements.forEach((requirement) => {
			if (requirement.validator(password)) {
				passedRequirements++;
			}
		});

		score = (passedRequirements / requirements.length) * 100;

		if (password.length > 12) score += 10;
		if (password.length > 16) score += 10;
		if (/[!@#$%^&*(),.?":{}|<>]{2,}/.test(password)) score += 10;

		return Math.min(score, 100);
	};

	const calculateStrength = customCalculateStrength || calculateBaseStrength;
	const strengthScore = calculateStrength(password);

	const getStrengthLevel = (): StrengthLevel => {
		if (strengthScore >= strengthThresholds.strong) return "strong";
		if (strengthScore >= strengthThresholds.good) return "good";
		if (strengthScore >= strengthThresholds.fair) return "fair";
		if (strengthScore >= strengthThresholds.weak) return "weak";
		return "empty";
	};

	const strengthLevel = getStrengthLevel();

	const getSegmentStrength = (index: number): StrengthLevel => {
		const segmentThreshold = (index + 1) * (100 / segments);

		if (strengthScore >= segmentThreshold) {
			if (strengthLevel === "strong") return "strong";
			if (strengthLevel === "good") return "good";
			if (strengthLevel === "fair") return "fair";
			if (strengthLevel === "weak") return "weak";
		}

		return "empty";
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.value;
		setPassword(newValue);
		onValueChange?.(newValue);
	};

	const togglePasswordVisibility = () => {
		setShowPassword(!showPassword);
	};

	const getPassedRequirements = (): PasswordStrengthRequirement[] => {
		return requirements.filter((requirement) =>
			requirement.validator(password)
		);
	};

	const getStrengthColor = (): string => {
		switch (strengthLevel) {
			case "strong":
				return "text-green-500";
			case "good":
				return "text-yellow-500";
			case "fair":
				return "text-orange-500";
			case "weak":
				return "text-red-500";
			default:
				return "text-gray-400";
		}
	};

	return (
		<div className={cn("space-y-2", className)} {...props}>
			<div className="relative">
				<Input
					className={cn(
						showPasswordToggle && enableAutoGenerate
							? "pr-20"
							: showPasswordToggle || enableAutoGenerate
								? "pr-10"
								: "",
						inputClassName
					)}
					onChange={handleChange}
					placeholder={placeholder}
					type={showPassword ? "text" : "password"}
					value={password}
				/>
				<div className="-translate-y-1/2 absolute top-1/2 right-3 flex items-center gap-1">
					{enableAutoGenerate && (
						<button
							aria-label="Generate strong password"
							className="text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
							onClick={handleGeneratePassword}
							title="Generate strong password"
							type="button"
						>
							<RefreshCw className="h-4 w-4" />
						</button>
					)}
					{showPasswordToggle && (
						<button
							aria-label={showPassword ? "Hide password" : "Show password"}
							className="text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
							onClick={togglePasswordVisibility}
							type="button"
						>
							{showPassword ? (
								<EyeOff className="h-4 w-4" />
							) : (
								<Eye className="h-4 w-4" />
							)}
						</button>
					)}
				</div>
			</div>

			<div
				className={cn(
					strengthMeterVariants({ size, animated }),
					meterClassName
				)}
			>
				{Array.from({ length: segments }).map((_, i) => (
					<div
						className={cn(
							strengthBarSegmentVariants({
								strength: getSegmentStrength(i),
								animated:
									animated &&
									getSegmentStrength(i) !== "empty" &&
									strengthLevel !== "strong",
							}),
							"flex-1"
						)}
						key={i}
						style={{
							transitionDelay: `${i * 75}ms`,
						}}
					/>
				))}
			</div>

			{showText && password && (
				<div className="flex items-center">
					<span className={cn("font-medium text-sm", getStrengthColor())}>
						{strengthLabels[strengthLevel]}
					</span>
					<span className="ml-auto text-gray-500 text-xs dark:text-gray-400">
						{getPassedRequirements().length} of {requirements.length}{" "}
						requirements met
					</span>
				</div>
			)}

			{showRequirements && (
				<div className="space-y-3">
					{enableAutoGenerate && (
						<div className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950/30">
							<div className="flex items-center gap-2">
								<RefreshCw className="h-4 w-4 text-blue-600 dark:text-blue-400" />
								<span className="font-medium text-blue-800 text-sm dark:text-blue-200">
									Auto-generate strong password
								</span>
							</div>
							<button
								className="rounded-md bg-blue-100 px-3 py-1 font-medium text-blue-700 text-xs transition-colors hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800"
								onClick={handleGeneratePassword}
								type="button"
							>
								Generate
							</button>
						</div>
					)}
					<ul className="space-y-1.5">
						{requirements.map((requirement, index) => {
							const passed = requirement.validator(password);
							return (
								<li
									className={cn(
										"flex items-center gap-2 text-sm",
										passed
											? "text-green-600 dark:text-green-500"
											: "text-gray-500 dark:text-gray-400"
									)}
									key={index}
								>
									{passed ? (
										<Check className="h-4 w-4 text-green-500" />
									) : (
										<X className="h-4 w-4 text-gray-400" />
									)}
									{requirement.label}
								</li>
							);
						})}
					</ul>
				</div>
			)}
		</div>
	);
}

export function PasswordInput({
	value,
	onChange,
	className,
	showToggle = true,
	...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
	showToggle?: boolean;
}) {
	const [showPassword, setShowPassword] = React.useState(false);

	const togglePasswordVisibility = () => {
		setShowPassword(!showPassword);
	};

	return (
		<div className="relative">
			<Input
				className={cn("pr-10", className)}
				onChange={onChange}
				type={showPassword ? "text" : "password"}
				value={value}
				{...props}
			/>
			{showToggle && (
				<button
					aria-label={showPassword ? "Hide password" : "Show password"}
					className="-translate-y-1/2 absolute top-1/2 right-3 "
					onClick={togglePasswordVisibility}
					type="button"
				>
					{showPassword ? (
						<EyeOff className="h-4 w-4" />
					) : (
						<Eye className="h-4 w-4" />
					)}
				</button>
			)}
		</div>
	);
}
