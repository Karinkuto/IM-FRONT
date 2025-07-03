import * as React from "react";

import { cn } from "@/lib/utils";

export interface TextareaProps
	extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
	icon?: React.ReactNode;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
	({ className, icon, ...props }, ref) => {
		return (
			<div className="relative flex items-center">
				{icon && (
					<div className="absolute left-2 top-3 text-muted-foreground">
						{icon}
					</div>
				)}
				<textarea
					className={cn(
						"flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
						icon ? "pl-8" : "",
						className,
					)}
					ref={ref}
					{...props}
				/>
			</div>
		);
	},
);

Textarea.displayName = "Textarea";

export { Textarea };
