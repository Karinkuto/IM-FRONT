import { Shield, User } from "lucide-react";
import { ProfileSettings } from "./profile-settings";
import { SettingsLayout } from "./SettingsLayout";
import { SecuritySettings } from "./security-settings";

export function InsurerSettings() {
	const tabs = [
		{
			value: "profile",
			label: "Profile",
			icon: User,
			content: <ProfileSettings />,
		},
		{
			value: "security",
			label: "Security",
			icon: Shield,
			content: <SecuritySettings />,
		},
	];

	return <SettingsLayout tabs={tabs} />;
}
