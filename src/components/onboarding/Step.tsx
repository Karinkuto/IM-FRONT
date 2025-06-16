import { CheckCircle2 } from "lucide-react";
import type React from "react";

interface StepProps {
	title: string;
	children: React.ReactNode;
	stepNumber?: number;
	isActive?: boolean;
	isCompleted?: boolean;
	isLast?: boolean;
}

export const Step: React.FC<StepProps> = ({
	title,
	children,
	stepNumber,
	isActive = false,
	isCompleted = false,
	isLast = false,
}) => {
	return (
		<div className="relative">
			{/* Step indicator */}
			<div className="flex items-center">
				<div
					className={`flex items-center justify-center w-8 h-8 rounded-full ${
						isActive || isCompleted
							? "bg-blue-600 text-white"
							: "bg-gray-200 text-gray-600"
					}`}
				>
					{isCompleted ? (
						<CheckCircle2 className="w-5 h-5" />
					) : (
						<span className="font-medium">{stepNumber}</span>
					)}
				</div>
				<h3
					className={`ml-3 text-sm font-medium ${
						isActive ? "text-blue-600" : "text-gray-600"
					}`}
				>
					{title}
				</h3>
				{!isLast && (
					<div className="hidden md:block absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-300" />
				)}
			</div>

			{/* Step content */}
			{isActive && (
				<div className="mt-6 pl-11">
					<div className="p-6 bg-gray-50 rounded-lg">{children}</div>
				</div>
			)}
		</div>
	);
};
