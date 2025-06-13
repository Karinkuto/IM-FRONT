import {
	Building2,
	Columns,
	LogOut,
	Settings,
	ShieldCheck,
} from "lucide-react";

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
	admin: [
		// Super admin navigation goes here in the future
	],
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
				{ link: "/insurer/policies", label: "Policies", icon: Building2 },
			],
		},
	],
};

export const footerNavigation = [
	{ link: "/insurer/settings", label: "Settings", icon: Settings },
	{ link: "/logout", label: "Logout", icon: LogOut },
];
