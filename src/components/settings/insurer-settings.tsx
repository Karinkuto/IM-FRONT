import { Settings } from "lucide-react";
import { ProfileSettings } from "./profile-settings";
import { SettingsLayout } from "./SettingsLayout";
import { SecuritySettings } from "./security-settings";

export function InsurerSettings() {
	const tabs = [
		{
			value: "profile",
			label: "Profile",
			icon: Settings,
			content: <ProfileSettings />,
		},
		{
			value: "security",
			label: "Security",
			icon: Settings,
			content: <SecuritySettings />,
		},
	];

	return <SettingsLayout tabs={tabs} />;
}
