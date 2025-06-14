import { Button } from "@/components/ui/button";
import { CheckIcon } from "lucide-react";
import { AnimatePresence, type Variants, motion } from "motion/react";
import React, {
	useState,
	Children,
	useRef,
	useLayoutEffect,
	type HTMLAttributes,
	type ReactNode,
} from "react";

interface StepperProps extends HTMLAttributes<HTMLDivElement> {
	children: ReactNode;
	initialStep?: number;
	onStepChange?: (step: number) => void;
	onFinalStepCompleted?: () => void;
	onValidateStep?: (currentStep: number) => Promise<boolean> | boolean;
	stepCircleContainerClassName?: string;
	stepContainerClassName?: string;
	contentClassName?: string;
	footerClassName?: string;
	backButtonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
	nextButtonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
	backButtonText?: string;
	nextButtonText?: string;
	disableStepIndicators?: boolean;
	renderStepIndicator?: (props: {
		step: number;
		currentStep: number;
		onStepClick: (clicked: number) => void;
	}) => ReactNode;
}

export default function Stepper({
	children,
	initialStep = 1,
	onStepChange = () => {},
	onFinalStepCompleted = () => {},
	onValidateStep,
	stepCircleContainerClassName = "",
	stepContainerClassName = "",
	contentClassName = "",
	footerClassName = "",
	backButtonProps = {},
	nextButtonProps = {},
	backButtonText = "Back",
	nextButtonText = "Continue",
	disableStepIndicators = false,
	renderStepIndicator,
	...rest
}: StepperProps) {
	const [currentStep, setCurrentStep] = useState<number>(initialStep);
	const [direction, setDirection] = useState<number>(0);
	const stepsArray = Children.toArray(children);
	const totalSteps = stepsArray.length;
	const isCompleted = currentStep > totalSteps;
	const isLastStep = currentStep === totalSteps;

	const updateStep = (newStep: number) => {
		setCurrentStep(newStep);
		if (newStep > totalSteps) {
			onFinalStepCompleted();
		} else {
			onStepChange(newStep);
		}
	};

	const handleBack = () => {
		if (currentStep > 1) {
			setDirection(-1);
			updateStep(currentStep - 1);
		}
	};

	const handleNext = async () => {
		if (onValidateStep) {
			const isValid = await Promise.resolve(onValidateStep(currentStep));
			if (!isValid) {
				return; // Prevent step change if validation fails
			}
		}

		if (!isLastStep) {
			setDirection(1);
			updateStep(currentStep + 1);
		}
	};

	const handleComplete = async () => {
		if (onValidateStep) {
			const isValid = await Promise.resolve(onValidateStep(currentStep));
			if (!isValid) {
				return; // Prevent completion if validation fails
			}
		}

		setDirection(1);
		updateStep(totalSteps + 1);
	};

	return (
		<div
			className="flex flex-1 flex-col items-center justify-center p-4"
			{...rest}
		>
			<div
				className={`mx-auto w-fit min-w-[500px] rounded-xl shadow-lg bg-card text-card-foreground ${stepCircleContainerClassName}`}
			>
				<div
					className={`${stepContainerClassName} flex w-full items-center p-8`}
				>
					{stepsArray.map((_, index) => {
						const stepNumber = index + 1;
						const isNotLastStep = index < totalSteps - 1;
						return (
							<React.Fragment key={stepNumber}>
								{renderStepIndicator ? (
									renderStepIndicator({
										step: stepNumber,
										currentStep,
										onStepClick: (clicked) => {
											setDirection(clicked > currentStep ? 1 : -1);
											updateStep(clicked);
										},
									})
								) : (
									<StepIndicator
										step={stepNumber}
										disableStepIndicators={disableStepIndicators}
										currentStep={currentStep}
										onClickStep={(clicked) => {
											setDirection(clicked > currentStep ? 1 : -1);
											updateStep(clicked);
										}}
									/>
								)}
								{isNotLastStep && (
									<StepConnector isComplete={currentStep > stepNumber} />
								)}
							</React.Fragment>
						);
					})}
				</div>

				<StepContentWrapper
					isCompleted={isCompleted}
					currentStep={currentStep}
					direction={direction}
					className={`space-y-2 px-8 ${contentClassName}`}
				>
					{stepsArray[currentStep - 1]}
				</StepContentWrapper>

				{!isCompleted && (
					<div className={`px-8 pb-8 ${footerClassName}`}>
						<div
							className={`mt-10 flex ${currentStep !== 1 ? "justify-between" : "justify-end"}`}
						>
							{currentStep !== 1 && (
								<Button
									onClick={handleBack}
									variant="ghost"
									{...backButtonProps}
								>
									{backButtonText}
								</Button>
							)}
							<Button
								onClick={isLastStep ? handleComplete : handleNext}
								{...nextButtonProps}
							>
								{isLastStep ? "Complete" : nextButtonText}
							</Button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

interface StepContentWrapperProps {
	isCompleted: boolean;
	currentStep: number;
	direction: number;
	children: ReactNode;
	className?: string;
}

function StepContentWrapper({
	isCompleted,
	currentStep,
	direction,
	children,
	className = "",
}: StepContentWrapperProps) {
	const [parentHeight, setParentHeight] = useState<number>(0);

	return (
		<motion.div
			style={{ position: "relative", overflow: "hidden" }}
			animate={{ height: isCompleted ? 0 : parentHeight }}
			transition={{ type: "spring", duration: 0.4 }}
			className={className}
		>
			<AnimatePresence initial={false} mode="sync" custom={direction}>
				{!isCompleted && (
					<SlideTransition
						key={currentStep}
						direction={direction}
						onHeightReady={(h) => {
							if (h !== parentHeight) {
								setParentHeight(h);
							}
						}}
					>
						{children}
					</SlideTransition>
				)}
			</AnimatePresence>
		</motion.div>
	);
}

interface SlideTransitionProps {
	children: ReactNode;
	direction: number;
	onHeightReady: (height: number) => void;
}

function SlideTransition({
	children,
	direction,
	onHeightReady,
}: SlideTransitionProps) {
	const containerRef = useRef<HTMLDivElement | null>(null);
	const contentRef = useRef<HTMLDivElement | null>(null);

	useLayoutEffect(() => {
		if (contentRef.current) {
			const observer = new ResizeObserver((entries) => {
				const newHeight = entries[0].contentRect.height;
				onHeightReady(newHeight);
			});
			observer.observe(contentRef.current);

			// Initial height measurement
			onHeightReady(contentRef.current.offsetHeight);

			return () => {
				observer.disconnect();
			};
		}
	}, [onHeightReady]);

	return (
		<motion.div
			ref={containerRef}
			custom={direction}
			variants={stepVariants}
			initial="enter"
			animate="center"
			exit="exit"
			transition={{ duration: 0.4 }}
			style={{ position: "absolute", left: 0, right: 0, top: 0 }}
		>
			<div ref={contentRef} style={{ width: "100%" }}>
				{children}
			</div>
		</motion.div>
	);
}

const stepVariants: Variants = {
	enter: (dir: number) => ({
		x: dir >= 0 ? "-100%" : "100%",
		opacity: 0,
	}),
	center: {
		x: "0%",
		opacity: 1,
	},
	exit: (dir: number) => ({
		x: dir >= 0 ? "50%" : "-50%",
		opacity: 0,
	}),
};

interface StepProps {
	children: ReactNode;
}

export function Step({ children }: StepProps) {
	return <div className="px-8 py-4">{children}</div>;
}

interface StepIndicatorProps {
	step: number;
	currentStep: number;
	onClickStep: (clicked: number) => void;
	disableStepIndicators?: boolean;
}

// Approximated RGB values for light and dark themes
const lightThemeColors = {
	muted: "rgb(242, 242, 242)",
	mutedForeground: "rgb(128, 128, 128)",
	primary: "rgb(109, 100, 100)",
	primaryForeground: "rgb(255, 255, 255)",
	border: "rgb(224, 224, 224)",
};

const darkThemeColors = {
	muted: "rgb(64, 64, 64)",
	mutedForeground: "rgb(196, 196, 196)",
	primary: "rgb(235, 229, 241)",
	primaryForeground: "rgb(51, 62, 70)",
	border: "rgb(61, 62, 62)",
};

function StepIndicator({
	step,
	currentStep,
	onClickStep,
	disableStepIndicators = false,
}: StepIndicatorProps) {
	const status =
		currentStep === step
			? "active"
			: currentStep < step
				? "inactive"
				: "complete";

	const [isDarkMode, setIsDarkMode] = useState(false);

	useLayoutEffect(() => {
		setIsDarkMode(document.documentElement.classList.contains("dark"));
	}, []);

	const colors = isDarkMode ? darkThemeColors : lightThemeColors;

	const handleClick = () => {
		if (step !== currentStep && !disableStepIndicators) {
			onClickStep(step);
		}
	};

	return (
		<motion.div
			onClick={handleClick}
			className="relative cursor-pointer outline-none focus:outline-none"
			animate={status}
			initial={{ scale: 1 }}
			variants={{
				inactive: {
					scale: 1,
				},
				active: {
					scale: 1,
				},
				complete: {
					scale: 1,
				},
			}}
			transition={{ duration: 0.3 }}
			style={{
				borderRadius: "9999px",
				backgroundColor: status === "inactive" ? colors.muted : colors.primary,
				color:
					status === "inactive"
						? colors.mutedForeground
						: colors.primaryForeground,
			}}
		>
			<div className="flex h-8 w-8 items-center justify-center font-semibold">
				{status === "complete" ? (
					<CheckIcon
						className="h-4 w-4"
						style={{ color: colors.primaryForeground }}
					/>
				) : status === "active" ? (
					<div
						className="h-3 w-3 rounded-full"
						style={{ backgroundColor: colors.primaryForeground }}
					/>
				) : (
					<span className="text-sm" style={{ color: colors.mutedForeground }}>
						{step}
					</span>
				)}
			</div>
		</motion.div>
	);
}

interface StepConnectorProps {
	isComplete: boolean;
}

function StepConnector({ isComplete }: StepConnectorProps) {
	const [isDarkMode, setIsDarkMode] = useState(false);

	useLayoutEffect(() => {
		setIsDarkMode(document.documentElement.classList.contains("dark"));
	}, []);

	const colors = isDarkMode ? darkThemeColors : lightThemeColors;

	const lineVariants: Variants = {
		incomplete: { width: 0 },
		complete: { width: "100%" },
	};

	return (
		<div
			className="relative mx-2 h-0.5 flex-1 overflow-hidden rounded"
			style={{ backgroundColor: colors.border }}
		>
			<motion.div
				className="absolute left-0 top-0 h-full"
				variants={lineVariants}
				initial={isComplete ? "complete" : "incomplete"}
				animate={isComplete ? "complete" : "incomplete"}
				transition={{ duration: 0.4 }}
				style={{ backgroundColor: isComplete ? colors.primary : colors.border }}
			/>
		</div>
	);
}
