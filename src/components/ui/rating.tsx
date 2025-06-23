import { Star } from "lucide-react";
import type React from "react";
import { cn } from "@/lib/utils";

interface RatingProps {
	/** Current rating value (supports decimals for partial ratings) */
	rating: number;
	/** Maximum number of rating items to display */
	maxRating?: number;
	/** Size of the rating icons */
	size?: "sm" | "md" | "lg" | "xl";
	/** Custom icon component to use instead of default star */
	icon?: React.ComponentType<{ className?: string }>;
	/** Color for filled/active rating items */
	activeColor?: string;
	/** Color for unfilled/inactive rating items */
	inactiveColor?: string;
	/** Additional CSS classes */
	className?: string;
	/** Show rating value as text */
	showValue?: boolean;
	/** Custom label for accessibility */
	ariaLabel?: string;
}

const sizeClasses = {
	sm: "w-4 h-4",
	md: "w-5 h-5",
	lg: "w-6 h-6",
	xl: "w-8 h-8",
};

export function Rating({
	rating,
	maxRating = 5,
	size = "md",
	icon: Icon = Star,
	activeColor = "text-yellow-400",
	inactiveColor = "text-gray-300",
	className,
	showValue = false,
	ariaLabel,
}: RatingProps) {
	// Clamp rating between 0 and maxRating
	const clampedRating = Math.max(0, Math.min(rating, maxRating));

	// Generate array of rating items
	const ratingItems = Array.from({ length: maxRating }, (_, index) => {
		const itemValue = index + 1;
		const fillPercentage = Math.max(0, Math.min(1, clampedRating - index));

		return {
			key: itemValue,
			filled: fillPercentage > 0,
			fillPercentage,
		};
	});

	return (
		<div
			className={cn("flex items-center gap-1", className)}
			role="img"
			aria-label={ariaLabel || `Rating: ${rating} out of ${maxRating} stars`}
		>
			<div className="flex items-center">
				{ratingItems.map(({ key, filled, fillPercentage }) => (
					<div key={key} className="relative">
						{/* Background (unfilled) icon */}
						<Icon
							className={cn(
								sizeClasses[size],
								inactiveColor,
								"transition-colors duration-200",
							)}
						/>

						{/* Foreground (filled) icon with clipping for partial fills */}
						{filled && (
							<div
								className="absolute inset-0 overflow-hidden"
								style={{
									clipPath: `inset(0 ${100 - fillPercentage * 100}% 0 0)`,
								}}
							>
								<Icon
									className={cn(
										sizeClasses[size],
										activeColor,
										"transition-colors duration-200",
									)}
								/>
							</div>
						)}
					</div>
				))}
			</div>

			{showValue && (
				<span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-200">
					{rating.toFixed(1)}
				</span>
			)}
		</div>
	);
}
