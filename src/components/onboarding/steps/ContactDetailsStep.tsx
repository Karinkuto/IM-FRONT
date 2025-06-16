import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFormContext } from "react-hook-form";
import type { OnboardingData } from "../types/types";

export const ContactDetailsStep = () => {
	const {
		register,
		formState: { errors },
	} = useFormContext<OnboardingData>();

	return (
		<div className="space-y-6">
			<div className="space-y-2">
				<Label htmlFor="contactEmail" className="text-sm font-medium">
					Contact Email
				</Label>
				<Input
					id="contactEmail"
					type="email"
					placeholder="contact@company.com"
					className={errors.contactEmail ? "border-destructive" : ""}
					{...register("contactEmail")}
				/>
				{errors.contactEmail ? (
					<p className="text-sm text-destructive mt-1">
						{errors.contactEmail.message}
					</p>
				) : (
					<p className="text-xs text-muted-foreground mt-1">
						We'll use this email to contact you about your account
					</p>
				)}
			</div>

			<div className="space-y-2">
				<Label htmlFor="contactPhone" className="text-sm font-medium">
					Contact Phone
				</Label>
				<Input
					id="contactPhone"
					type="tel"
					placeholder="+251 000-0000"
					className={errors.contactPhone ? "border-destructive" : ""}
					{...register("contactPhone")}
				/>
				{errors.contactPhone ? (
					<p className="text-sm text-destructive mt-1">
						{errors.contactPhone.message}
					</p>
				) : (
					<p className="text-xs text-muted-foreground mt-1">
						We'll only contact you if we can't reach you by email.
					</p>
				)}
			</div>
		</div>
	);
};
