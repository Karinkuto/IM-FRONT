import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useFormContext } from "react-hook-form";
import type { OnboardingData } from "../types/types";

export const CompanyInfoStep = () => {
	const {
		register,
		formState: { errors },
	} = useFormContext<OnboardingData>();

	return (
		<div className="space-y-6">
			<div className="space-y-2">
				<Label htmlFor="companyName" className="text-sm font-medium">
					Company Name
				</Label>
				<Input
					id="companyName"
					placeholder="Acme Inc."
					{...register("companyName")}
					className={errors.companyName ? "border-destructive" : ""}
				/>
				{errors.companyName ? (
					<p className="text-sm text-destructive mt-1">
						{errors.companyName.message}
					</p>
				) : (
					<p className="text-xs text-muted-foreground mt-1">
						Your company's name as it should appear to customers
					</p>
				)}
			</div>

			<div className="space-y-2">
				<Label htmlFor="description" className="text-sm font-medium">
					Company Description
				</Label>
				<Textarea
					id="description"
					rows={4}
					placeholder="Tell us about your company..."
					className={`min-h-[120px] ${errors.description ? "border-destructive" : ""}`}
					{...register("description")}
				/>
				{errors.description ? (
					<p className="text-sm text-destructive mt-1">
						{errors.description.message}
					</p>
				) : (
					<p className="text-xs text-muted-foreground mt-1">
						A brief description of your company (max 500 characters)
					</p>
				)}
			</div>
		</div>
	);
};
