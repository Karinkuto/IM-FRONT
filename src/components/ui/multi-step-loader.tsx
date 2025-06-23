import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

// const BRAND_COLOR = 'var(--color-primary)';
// const BRAND_COLOR_DARK = 'var(--color-primary)'; // same variable, theme switches root
const GREEN = "var(--badge-approved-background)";
const RED = "var(--badge-rejected-background)";

const CheckFilled = ({ className }: { className?: string }) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill={GREEN}
			className={cn("w-6 h-6 ", className)}
			aria-hidden="true"
		>
			<path
				fillRule="evenodd"
				d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
				clipRule="evenodd"
			/>
		</svg>
	);
};

const Spinner = ({ className }: { className?: string }) => (
	<svg
		className={cn("w-6 h-6 animate-spin", className)}
		xmlns="http://www.w3.org/2000/svg"
		fill="none"
		viewBox="0 0 24 24"
	>
		<title>Loading spinner</title>
		<circle
			className="opacity-25"
			cx="12"
			cy="12"
			r="10"
			stroke="currentColor"
			strokeWidth="4"
		/>
		<path
			className="opacity-75"
			fill="currentColor"
			d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
		/>
	</svg>
);

const XCircle = ({ className }: { className?: string }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		fill="none"
		viewBox="0 0 24 24"
		strokeWidth={1.5}
		stroke={RED}
		className={cn("w-6 h-6", className)}
	>
		<title>Error icon</title>
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
		/>
	</svg>
);

// Modern, minimal, subtle orange beacon
const OrangeBeacon = ({ className }: { className?: string }) => (
	<span
		className={cn(
			"relative flex h-3 w-3 items-center justify-center",
			className,
		)}
	>
		<span
			className="absolute inline-flex h-full w-full rounded-full bg-orange-300 opacity-30 animate-ping"
			style={{ animationDuration: "1.6s", transform: "scale(1.4)" }}
		></span>
		<span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-orange-300" />
	</span>
);

type LoadingState = {
	text: string;
	errorDetail?: string;
	errorText?: string;
};

const LoaderCore = ({
	loadingStates,
	value = 0,
	errorStep,
	errorMessage,
}: {
	loadingStates: LoadingState[];
	value?: number;
	errorStep?: number | null;
	errorMessage?: string | null;
}) => {
	return (
		<div className="flex relative justify-start max-w-xl mx-auto flex-col mt-40">
			{loadingStates.map((loadingState, index) => {
				const distance = Math.abs(index - value);
				const opacity = Math.max(1 - distance * 0.2, 0);
				const isError = index === errorStep;
				const displayError =
					errorMessage ||
					loadingState.errorDetail ||
					loadingState.errorText ||
					"An error occurred.";

				return (
					<motion.div
						key={`${loadingState.text}-${index}`}
						className={cn("flex gap-2 items-start mb-4")}
						initial={{ opacity: 0, y: -(value * 40) }}
						animate={{ opacity: opacity, y: -(value * 40) }}
						transition={{ duration: 0.5 }}
					>
						{/* Icon and vertical rail column */}
						<div className="flex flex-col items-center min-w-[2rem] relative">
							<div
								className={cn(
									"flex items-center justify-center rounded-full h-8 w-8",
								)}
							>
								{isError ? (
									<XCircle />
								) : index < value ? (
									<CheckFilled />
								) : index === value ? (
									<Spinner className="text-primary" />
								) : (
									<OrangeBeacon />
								)}
							</div>
							{/* Vertical rail, positioned absolutely to connect icons, only if error */}
							{isError && index < loadingStates.length - 1 && (
								<div
									className={cn(
										"w-0.5 bg-neutral-200 dark:bg-neutral-700 absolute left-1/2 -translate-x-1/2",
										"h-[78px]", // Fixed height for error connection
									)}
									style={{ top: "16px" }} // Starts at icon's center
								/>
							)}
						</div>
						{/* Step text and optional error message column */}
						<div className="flex flex-col flex-grow">
							<span
								className={cn(
									"text-base font-medium",
									"text-black dark:text-white",
								)}
							>
								{loadingState.text}
							</span>
							{isError && displayError && (
								<p className="text-red-400 text-sm font-semibold whitespace-pre-line mt-1">
									{displayError}
								</p>
							)}
						</div>
					</motion.div>
				);
			})}
		</div>
	);
};

export const MultiStepLoader = ({
	loadingStates,
	loading,
	duration = 2000,
	loop = true,
	onComplete,
	currentState: externalState,
	errorStep,
	errorMessage,
}: {
	loadingStates: LoadingState[];
	loading?: boolean;
	duration?: number;
	loop?: boolean;
	onComplete?: () => void;
	currentState?: number;
	errorStep?: number | null;
	errorMessage?: string | null;
}) => {
	const [internalState, setInternalState] = useState(0);

	const isControlled = externalState !== undefined;
	const currentState = isControlled ? externalState : internalState;

	useEffect(() => {
		if (!loading || errorStep !== null) {
			return;
		}

		if (currentState === loadingStates.length - 1 && !loop) {
			const completeTimeout = setTimeout(() => {
				if (onComplete) onComplete();
			}, duration);
			return () => clearTimeout(completeTimeout);
		}

		if (!isControlled) {
			const timeout = setTimeout(() => {
				setInternalState((prevState) =>
					loop
						? prevState === loadingStates.length - 1
							? 0
							: prevState + 1
						: Math.min(prevState + 1, loadingStates.length - 1),
				);
			}, duration);
			return () => clearTimeout(timeout);
		}
	}, [
		currentState,
		isControlled,
		loading,
		loop,
		onComplete,
		duration,
		loadingStates.length,
		errorStep,
	]);

	return (
		<AnimatePresence mode="wait">
			{loading && (
				<motion.div
					initial={{
						opacity: 0,
					}}
					animate={{
						opacity: 1,
					}}
					exit={{
						opacity: 0,
					}}
					className="flex items-center justify-center"
				>
					<div className="h-96  relative">
						<LoaderCore
							value={currentState}
							loadingStates={loadingStates}
							errorStep={errorStep}
							errorMessage={errorMessage}
						/>
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	);
};
