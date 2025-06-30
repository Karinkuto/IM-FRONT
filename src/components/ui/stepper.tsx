import { AnimatePresence, motion, type Variants } from "motion/react";
import React, {
	Children,
	type HTMLAttributes,
	type ReactNode,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from "@/components/ui/card";
import { MultiStepLoader } from "@/components/ui/multi-step-loader";

interface LoaderProps {
	loadingStates: { text: string }[];
	loading: boolean;
	currentState: number;
	errorStep?: number | null;
	errorMessage?: string | null;
}

interface StepperProps extends HTMLAttributes<HTMLDivElement> {
	children: ReactNode;
	initialStep?: number;
	onStepChange?: (step: number) => void;
	onFinalStepCompleted?: () => void;
	validate?: (step: number) => Promise<boolean>;
	onComplete?: () => Promise<void>;
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
	onLoaderComplete?: () => void;
	loaderProps?: LoaderProps;
}

export default function Stepper({
	children,
	initialStep = 1,
	onStepChange = () => {},
	onFinalStepCompleted = () => {},
	validate,
	onComplete,
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
	onLoaderComplete,
	loaderProps,
}: StepperProps) {
	const [currentStep, setCurrentStep] = useState<number>(initialStep);
	const [direction, setDirection] = useState<number>(0);
	const [isSubmitting, setIsSubmitting] = useState(false);
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
		if (validate) {
			const isValid = await validate(currentStep);
			if (!isValid) {
				return;
			}
		}

		if (!isLastStep) {
			setDirection(1);
			updateStep(currentStep + 1);
		}
	};

	const handleComplete = async () => {
		if (onComplete) {
			setIsSubmitting(true);
			try {
				await onComplete();
			} catch (error) {
				console.error("Submission failed in onComplete", error);
				setIsSubmitting(false);
			}
		} else {
			setDirection(1);
			updateStep(totalSteps + 1);
		}
	};

	const loadingStates = loaderProps?.loadingStates || [
		{ text: "Finalizing" },
		{ text: "Saving your profile" },
		{ text: "Redirecting..." },
	];

	return (
		<div className="flex min-h-full flex-1 flex-col items-center justify-center">
			{isSubmitting ? (
				<MultiStepLoader
					loadingStates={loadingStates}
					loading={loaderProps?.loading || isSubmitting}
					currentState={loaderProps?.currentState || 0}
					errorStep={loaderProps?.errorStep}
					errorMessage={loaderProps?.errorMessage}
					loop={false}
					onComplete={() => {
						setIsSubmitting(false);
						updateStep(totalSteps + 1);
						if (onLoaderComplete) {
							onLoaderComplete();
						}
					}}
				/>
			) : (
				!isCompleted && (
					<Card
						className={`mx-auto w-full max-w-md ${stepCircleContainerClassName}`}
					>
						<CardHeader
							className={`${stepContainerClassName} flex w-full items-center`}
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
						</CardHeader>
						<CardContent className={`space-y-2 ${contentClassName}`}>
							<StepContentWrapper
								isCompleted={isCompleted}
								currentStep={currentStep}
								direction={direction}
							>
								{stepsArray[currentStep - 1]}
							</StepContentWrapper>
						</CardContent>
						<CardFooter className={`${footerClassName}`}>
							<div
								className={`mt-6 flex w-full ${
									currentStep !== 1 ? "justify-between" : "justify-end"
								}`}
							>
								{currentStep !== 1 && (
									<Button
										onClick={handleBack}
										variant="outline"
										{...backButtonProps}
									>
										{backButtonText}
									</Button>
								)}
								<Button
									onClick={isLastStep ? handleComplete : handleNext}
									variant="default"
									{...nextButtonProps}
									disabled={isSubmitting || nextButtonProps.disabled}
								>
									{isLastStep
										? isSubmitting
											? "Submitting..."
											: "Complete"
										: nextButtonText}
								</Button>
							</div>
						</CardFooter>
					</Card>
				)
			)}
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
			transition={{ type: "spring", stiffness: 300, damping: 30 }}
			className={className}
		>
			<AnimatePresence initial={false} mode="sync" custom={direction}>
				{!isCompleted && (
					<SlideTransition
						key={currentStep}
						direction={direction}
						onHeightReady={setParentHeight}
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

	useLayoutEffect(() => {
		const node = containerRef.current;
		if (!node) return;

		const resizeObserver = new ResizeObserver(() => {
			onHeightReady(node.offsetHeight);
		});
		resizeObserver.observe(node);

		return () => resizeObserver.disconnect();
	}, [onHeightReady]);

	return (
		<motion.div
			ref={containerRef}
			custom={direction}
			variants={stepVariants}
			initial="enter"
			animate="center"
			exit="exit"
			transition={{
				x: { type: "spring", stiffness: 300, damping: 30 },
				opacity: { duration: 0.2 },
			}}
			style={{ position: "absolute", left: 0, right: 0, top: 0 }}
		>
			{children}
		</motion.div>
	);
}

const stepVariants: Variants = {
	enter: (dir: number) => ({
		x: dir > 0 ? "100%" : "-100%",
		opacity: 0,
	}),
	center: {
		x: "0%",
		opacity: 1,
	},
	exit: (dir: number) => ({
		x: dir < 0 ? "100%" : "-100%",
		opacity: 0,
	}),
};

interface StepProps {
	children: ReactNode;
}

export function Step({ children }: StepProps) {
	return <div className="px-4">{children}</div>;
}

interface StepIndicatorProps {
	step: number;
	currentStep: number;
	onClickStep: (clicked: number) => void;
	disableStepIndicators?: boolean;
}

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
			initial={false}
		>
			<motion.div
				variants={{
					inactive: {
						scale: 1,
						backgroundColor: "var(--color-background)",
						color: "var(--color-foreground)",
					},
					active: {
						scale: 1,
						backgroundColor: "var(--color-primary)",
						color: "var(--color-primary-foreground)",
					},
					complete: {
						scale: 1,
						backgroundColor: "var(--color-primary)",
						color: "var(--color-primary-foreground)",
					},
				}}
				transition={{ duration: 0.3 }}
				className="flex h-8 w-8 items-center justify-center rounded-full font-semibold"
			>
				{status === "complete" ? (
					<CheckIcon className="h-4 w-4 text-primary-foreground" />
				) : status === "active" ? (
					<div className="h-3 w-3 rounded-full bg-primary-foreground" />
				) : (
					<span className="text-sm">{step}</span>
				)}
			</motion.div>
		</motion.div>
	);
}

interface StepConnectorProps {
	isComplete: boolean;
}

function StepConnector({ isComplete }: StepConnectorProps) {
	const lineVariants: Variants = {
		incomplete: { width: 0, backgroundColor: "rgba(0,0,0,0)" },
		complete: { width: "100%", backgroundColor: "var(--color-primary)" },
	};

	return (
		<div className="relative mx-2 h-0.5 flex-1 overflow-hidden rounded bg-muted">
			<motion.div
				className="absolute left-0 top-0 h-full"
				variants={lineVariants}
				initial={false}
				animate={isComplete ? "complete" : "incomplete"}
				transition={{ duration: 0.4 }}
			/>
		</div>
	);
}

interface CheckIconProps extends React.SVGProps<SVGSVGElement> {}

function CheckIcon(props: CheckIconProps) {
	return (
		<svg
			{...props}
			fill="none"
			stroke="currentColor"
			strokeWidth={2}
			viewBox="0 0 24 24"
			aria-hidden={true}
		>
			<motion.path
				initial={{ pathLength: 0 }}
				animate={{ pathLength: 1 }}
				transition={{
					delay: 0.1,
					type: "tween",
					ease: "easeOut",
					duration: 0.3,
				}}
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M5 13l4 4L19 7"
			/>
		</svg>
	);
}
