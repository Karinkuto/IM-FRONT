import { CheckIcon, EyeIcon, EyeOffIcon, XIcon } from "lucide-react";
import * as React from "react";
import { Input, type InputProps } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface PasswordStrengthInputProps extends InputProps {
	value: string;
	id?: string;
	placeholder?: string;
}

const PasswordStrengthInput = React.forwardRef<
	HTMLInputElement,
	PasswordStrengthInputProps
>(({ className, value, id, placeholder, ...props }, ref) => {
	const [isVisible, setIsVisible] = React.useState<boolean>(false);
	const toggleVisibility = () => setIsVisible((prevState) => !prevState);

	const requirements = React.useMemo(
		() => [
			{ regex: /.{8,}/, text: "At least 8 characters" },
			{ regex: /[0-9]/, text: "At least 1 number" },
			{ regex: /[a-z]/, text: "At least 1 lowercase letter" },
			{ regex: /[A-Z]/, text: "At least 1 uppercase letter" },
		],
		[],
	);

	const strength = React.useMemo(
		() =>
			requirements.map((req) => ({
				...req,
				met: req.regex.test(value),
			})),
		[value, requirements],
	);

	const strengthScore = React.useMemo(
		() => strength.filter((req) => req.met).length,
		[strength],
	);

	const getStrengthColor = (score: number) => {
		if (score <= 1) return "bg-red-500";
		if (score <= 2) return "bg-orange-500";
		if (score === 3) return "bg-amber-500";
		return "bg-emerald-500";
	};

	const firstUnmetRequirement = strength.find((req) => !req.met);

	return (
		<div>
			<div className="relative">
				<Input
					type={isVisible ? "text" : "password"}
					className={cn("pe-9", className)}
					ref={ref}
					value={value}
					id={id}
					placeholder={placeholder}
					{...props}
				/>
				<button
					className="text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
					type="button"
					onClick={toggleVisibility}
					aria-label={isVisible ? "Hide password" : "Show password"}
					aria-pressed={isVisible}
				>
					{isVisible ? (
						<EyeOffIcon size={16} aria-hidden="true" />
					) : (
						<EyeIcon size={16} aria-hidden="true" />
					)}
				</button>
			</div>

			{value && value.length > 0 && (
				<>
					<div
						className="bg-border mt-3 mb-2 h-1 w-full overflow-hidden rounded-full"
						role="progressbar"
						aria-valuenow={strengthScore}
						aria-valuemin={0}
						aria-valuemax={4}
						aria-label="Password strength"
					>
						<div
							className={`h-full ${getStrengthColor(strengthScore)} transition-all duration-300 ease-in-out`}
							style={{ width: `${(strengthScore / 4) * 100}%` }}
						/>
					</div>

					<div className="flex items-center gap-2">
						{firstUnmetRequirement ? (
							<>
								<XIcon size={14} className="text-muted-foreground/80" />
								<span className="text-xs text-muted-foreground">
									{firstUnmetRequirement.text}
								</span>
							</>
						) : (
							<>
								<CheckIcon size={14} className="text-emerald-500" />
								<span className="text-xs text-emerald-600">
									Strong password
								</span>
							</>
						)}
					</div>
				</>
			)}
		</div>
	);
});
PasswordStrengthInput.displayName = "PasswordStrengthInput";

export { PasswordStrengthInput };
