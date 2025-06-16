import AvatarUploader from "@/components/avatar-uploader";
import { useCallback } from "react";
import { useFormContext } from "react-hook-form";
import type { OnboardingData } from "../types/onboarding";

export const BrandingStep = () => {
	const { setValue, watch } = useFormContext<OnboardingData>();
	const logo = watch("logo");

	const handleLogoChange = useCallback(
		(blob: Blob | null) => {
			setValue("logo", blob);
		},
		[setValue],
	);

	return (
		<div className="space-y-6">
			<div>
				<h3 className="text-lg font-medium">Company Logo</h3>
				<p className="text-sm text-muted-foreground">
					Upload your company logo. Recommended size: 512x512px
				</p>
			</div>

			<div className="flex justify-center">
				<div className="w-full max-w-md">
					<AvatarUploader
						initialImageUrl={typeof logo === "string" ? logo : null}
						onImageChange={handleLogoChange}
					/>
				</div>
			</div>
		</div>
	);
};
