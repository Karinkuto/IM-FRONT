import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import type { OnboardingData } from "../types/types";

export const ApiConfigStep = () => {
	const {
		register,
		formState: { errors },
	} = useFormContext<OnboardingData>();

	const [showApiKey, setShowApiKey] = useState(false);

	return (
		<div className="space-y-6">
			<div className="space-y-2">
				<Label htmlFor="apiEndpoint" className="text-sm font-medium">
					API Endpoint
				</Label>
				<Input
					id="apiEndpoint"
					type="url"
					placeholder="https://api.yourdomain.com/v1"
					className={errors.apiEndpoint ? "border-destructive" : ""}
					{...register("apiEndpoint")}
				/>
				{errors.apiEndpoint ? (
					<p className="text-sm text-destructive mt-1">
						{errors.apiEndpoint.message}
					</p>
				) : (
					<p className="text-xs text-muted-foreground mt-1">
						The base URL for your API endpoints
					</p>
				)}
			</div>

			<div className="space-y-2">
				<Label htmlFor="apiKey" className="text-sm font-medium">
					API Key
				</Label>
				<div className="relative">
					<Input
						id="apiKey"
						type={showApiKey ? "text" : "password"}
						placeholder="Enter your API key"
						className={`pr-10 ${errors.apiKey ? "border-destructive" : ""}`}
						{...register("apiKey")}
					/>
					<Button
						type="button"
						variant="ghost"
						size="icon"
						className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
						onClick={() => setShowApiKey(!showApiKey)}
					>
						{showApiKey ? (
							<EyeOff className="h-4 w-4 text-muted-foreground" />
						) : (
							<Eye className="h-4 w-4 text-muted-foreground" />
						)}
						<span className="sr-only">
							{showApiKey ? "Hide API key" : "Show API key"}
						</span>
					</Button>
				</div>
				{errors.apiKey ? (
					<p className="text-sm text-destructive mt-1">
						{errors.apiKey.message}
					</p>
				) : (
					<p className="text-xs text-muted-foreground mt-1">
						Keep your API key secure and never share it publicly
					</p>
				)}
			</div>
		</div>
	);
};
