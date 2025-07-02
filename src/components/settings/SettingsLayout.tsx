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
		<div className="container mx-auto max-w-6xl px-4 py-8">
			<div className="mb-8">
				<h1 className="font-bold text-3xl">Settings</h1>
				<p className="mt-2 text-muted-foreground">
					Manage your company profile and security settings
				</p>
			</div>
			<Tabs
				className="w-full flex-row"
				defaultValue={tabs[0]?.value}
				orientation="vertical"
			>
				<TabsList className="flex-col gap-1 rounded-none bg-transparent px-1 py-0 text-foreground">
					{tabs.map((tab) => (
						<TabsTrigger
							className="after:-ms-1 relative w-full justify-start after:absolute after:inset-y-0 after:start-0 after:w-0.5 hover:bg-accent hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:hover:bg-accent data-[state=active]:after:bg-primary"
							key={tab.value}
							value={tab.value}
						>
							<tab.icon
								aria-hidden="true"
								className="-ms-0.5 me-1.5 opacity-60"
								size={16}
							/>
							{tab.label}
						</TabsTrigger>
					))}
				</TabsList>
				<div className="grow rounded-md border-0 text-start">
					{tabs.map((tab) => (
						<TabsContent className="px-6" key={tab.value} value={tab.value}>
							{tab.content}
						</TabsContent>
					))}
				</div>
			</Tabs>
		</div>
	);
}
