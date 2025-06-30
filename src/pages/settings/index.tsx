import { Shield, User } from "lucide-react";
import { ProfileSettings } from "@/components/settings/profile-settings";
import {
	SettingsLayout,
	type SettingsTab,
} from "@/components/settings/SettingsLayout";
import { SecuritySettings } from "@/components/settings/security-settings";
import type { ValidRole } from "@/config/routes";
import { useAuth } from "@/context/AuthContext";

export default function SettingsPage() {
	const { user } = useAuth();
	const role = user?.role as ValidRole | undefined;

	// Role-specific tab data
	const tabs: SettingsTab[] = [
		{
			value: "profile",
			label: "Profile Settings",
			icon: User,
			content: <ProfileSettings />,
		},
		{
			value: "security",
			label: "Security",
			icon: Shield,
			content: <SecuritySettings />,
		},
		// Add more tabs per role as needed
	];

	// Example: you can add role-specific logic here
	// if (role === "admin") tabs.push(...);

	return <SettingsLayout tabs={tabs} />;
}
