import type { LucideIcon } from "lucide-react";
import type React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface SettingsTab {
	value: string;
	label: string;
	icon: LucideIcon;
	content: React.ReactNode;
}

export function SettingsLayout({ tabs }: { tabs: SettingsTab[] }) {
	return (
		<div className="container mx-auto py-8 px-4 max-w-6xl">
			<div className="mb-8">
				<h1 className="text-3xl font-bold">Settings</h1>
				<p className="text-muted-foreground mt-2">
					Manage your company profile and security settings
				</p>
			</div>
			<Tabs
				defaultValue={tabs[0]?.value}
				orientation="vertical"
				className="w-full flex-row"
			>
				<TabsList className="text-foreground flex-col gap-1 rounded-none bg-transparent px-1 py-0">
					{tabs.map((tab) => (
						<TabsTrigger
							key={tab.value}
							value={tab.value}
							className="hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative w-full justify-start after:absolute after:inset-y-0 after:start-0 after:-ms-1 after:w-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
						>
							<tab.icon
								className="-ms-0.5 me-1.5 opacity-60"
								size={16}
								aria-hidden="true"
							/>
							{tab.label}
						</TabsTrigger>
					))}
				</TabsList>
				<div className="grow rounded-md text-start border-0">
					{tabs.map((tab) => (
						<TabsContent key={tab.value} value={tab.value} className="px-6">
							{tab.content}
						</TabsContent>
					))}
				</div>
			</Tabs>
		</div>
	);
}
