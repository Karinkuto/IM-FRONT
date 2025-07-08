import { Columns, LogOut, Settings, ShieldCheck, Users, FileText } from "lucide-react";

export type NavItem = {
	link: string;
	label: string;
	icon: React.ComponentType<{ className?: string }>;
};

// Updated structure to support grouped navigation
export type NavItemGroup = {
	title: string;
	items: NavItem[];
};

export const navigationData: Record<string, NavItemGroup[]> = {
	insurer: [
		{
			title: "MANAGEMENT",
			items: [
				{ link: "/insurer/products", label: "Products", icon: Columns },
				{
					link: "/insurer/quotation-requests",
					label: "Quotations",
					icon: ShieldCheck,
				},
				{ link: "/insurer/claims", label: "Claims", icon: FileText },
			],
		},
	],
	admin: [
		{
			title: "ADMINISTRATION",
			items: [{ link: "/admin/users", label: "User Management", icon: Users }],
		},
	],
};

export const footerNavigation = [
	{ link: "/:role/settings", label: "Settings", icon: Settings },
	{ link: "/logout", label: "Logout", icon: LogOut },
];
