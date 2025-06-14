import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { NavLink, Outlet } from "react-router-dom";

export type SettingsTab = "profile" | "security";

export interface TabType {
	id: SettingsTab;
	label: string;
	to: string;
	icon: ReactNode;
}

interface SettingsLayoutProps {
	children?: ReactNode;
	tabs: TabType[];
	baseUrl: string;
}

export function SettingsLayout({ tabs, baseUrl }: SettingsLayoutProps) {
	return (
		<div className="container mx-auto py-8">
			<div className="flex flex-col space-y-6">
				<div className="flex flex-col md:flex-row gap-6">
					{/* Navigation */}
					<nav className="w-full md:w-64 flex-shrink-0">
						<div className="space-y-1">
							{tabs.map((tab) => (
								<NavLink
									key={tab.id}
									to={`${baseUrl}/${tab.to}`}
									end={tab.to === ""}
									className={({ isActive }) =>
										cn(
											buttonVariants({
												variant: isActive ? "outline" : "ghost",
											}),
											"w-full justify-start",
											isActive ? "bg-accent" : "",
										)
									}
								>
									{tab.icon}
									{tab.label}
								</NavLink>
							))}
						</div>
					</nav>

					{/* Content */}
					<div className="flex-1 px-6">
						<div className="space-y-6">
							<Outlet />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
