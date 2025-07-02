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
					className={cn("pe-9", className)}
					id={id}
					placeholder={placeholder}
					ref={ref}
					type={isVisible ? "text" : "password"}
					{...props}
				/>
				<button
					aria-label={isVisible ? "Hide password" : "Show password"}
					aria-pressed={isVisible}
					className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md text-gray-700 outline-none transition-[color,box-shadow] hover:text-primary focus:z-10 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-200"
					onClick={toggleVisibility}
					type="button"
				>
					{isVisible ? (
						<EyeOffIcon aria-hidden="true" size={16} />
					) : (
						<EyeIcon aria-hidden="true" size={16} />
					)}
				</button>
			</div>
		);
	}
);
PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
