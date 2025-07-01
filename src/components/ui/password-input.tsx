import { EyeIcon, EyeOffIcon } from "lucide-react";
import * as React from "react";
import { Input, type InputProps } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface PasswordInputProps extends InputProps {
	id?: string;
	placeholder?: string;
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
	({ className, id, placeholder, ...props }, ref) => {
		const [isVisible, setIsVisible] = React.useState<boolean>(false);
		const toggleVisibility = () => setIsVisible((prevState) => !prevState);

		return (
			<div className="relative">
				<Input
					type={isVisible ? "text" : "password"}
					className={cn("pe-9", className)}
					ref={ref}
					id={id}
					placeholder={placeholder}
					{...props}
				/>
				<button
					className="text-gray-700 dark:text-gray-200 hover:text-primary focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
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
		);
	},
);
PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
