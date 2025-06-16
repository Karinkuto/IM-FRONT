import { cn } from "@/lib/utils";
import type React from "react";
import type { PasswordStrength } from "./types/types";

interface PasswordStrengthMeterProps {
	strength: PasswordStrength;
	className?: string;
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({
	strength,
	className = "",
}) => {
	const { score, color } = strength;

	// Calculate how many segments should be filled (4 segments total)
	const filledSegments = Math.min(4, Math.ceil((score / 6) * 4));

	// Color mapping for the meter
	const colorMap = {
		red: "bg-red-500",
		orange: "bg-orange-500",
		yellow: "bg-yellow-500",
		green: "bg-green-500",
	};

	// Get the current color class
	const activeColor = colorMap[color];

	return (
		<div className={cn("w-full flex gap-1", className)}>
			{[1, 2, 3, 4].map((segment) => (
				<div
					key={segment}
					className={cn(
						"h-1 flex-1 rounded-full transition-colors duration-300",
						segment <= filledSegments ? activeColor : "bg-gray-200",
					)}
				/>
			))}
		</div>
	);
};

export default PasswordStrengthMeter;
