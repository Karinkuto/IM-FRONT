import { Lock, User } from "lucide-react";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { SettingsLayout, type TabType } from "./components/SettingsLayout";
import ProfilePage from "./pages/profile/ProfilePage";
import SecurityPage from "./pages/security/SecurityPage";

const TABS: TabType[] = [
	{
		id: "profile",
		label: "Profile",
		to: "profile",
		icon: <User className="mr-2 h-4 w-4" />,
	},
	{
		id: "security",
		label: "Security",
		to: "security",
		icon: <Lock className="mr-2 h-4 w-4" />,
	},
];

const BASE_URL = "/admin/settings";

// Wrapper component to render the settings layout with tabs
function SettingsLayoutWrapper() {
	return (
		<SettingsLayout tabs={TABS} baseUrl={BASE_URL}>
			<Outlet />
		</SettingsLayout>
	);
}

export default function Settings() {
	return (
		<Routes>
			<Route element={<SettingsLayoutWrapper />}>
				<Route index element={<Navigate to="profile" replace />} />
				<Route path="profile" element={<ProfilePage />} />
				<Route path="security" element={<SecurityPage />} />
			</Route>
		</Routes>
	);
}
