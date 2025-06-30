import { useState } from "react";

export interface ProfileData {
	name: string;
	description: string;
	contact_email: string;
	contact_phone: string;
	api_endpoint: string;
	api_key: string;
	logo: string;
}

const initialProfileData: ProfileData = {
	name: "Acme Insurance Co.",
	description:
		"Leading provider of comprehensive insurance solutions with over 25 years of experience in the industry.",
	contact_email: "contact@acmeinsurance.com",
	contact_phone: "+1 (555) 123-4567",
	api_endpoint: "https://api.acmeinsurance.com/v1",
	api_key: "ak_live_1234567890abcdef",
	logo: "/placeholder.svg?height=80&width=80",
};

export function useProfileData() {
	const [profileData, setProfileData] =
		useState<ProfileData>(initialProfileData);

	return {
		profileData,
		setProfileData,
	};
}
