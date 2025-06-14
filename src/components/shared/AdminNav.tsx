import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import type { User } from "@/types/auth";

interface AdminNavProps {
	user: User;
}

export function AdminNav({ user }: AdminNavProps) {
	const userInitials = user.name
		? user.name.substring(0, 2).toUpperCase()
		: "AD";

	const handleProfileClick = () => {
		// Assuming there will be an admin profile settings page later
		// For now, it could navigate to /admin/settings or just be a placeholder
		console.log("Admin profile click");
	};

	return (
		<SidebarMenu className="mt-auto mb-4">
			<SidebarMenuItem>
				<SidebarMenuButton
					size="lg"
					className="hover:bg-transparent dark:hover:bg-transparent cursor-pointer"
					onClick={handleProfileClick}
					aria-label="View admin profile settings"
				>
					<Avatar className="h-10 w-10 rounded-md">
						<AvatarImage src="/avatars/01.png" alt="@shadcn" />
						<AvatarFallback className="rounded-md bg-black text-white">
							{userInitials}
						</AvatarFallback>
					</Avatar>
					<div className="grid flex-1 text-left text-sm leading-tight gap-y-1">
						<span className="truncate font-medium text-primary">
							{user.email}
						</span>
						<Badge variant="secondary" className="w-fit">
							{user.role}
						</Badge>
					</div>
				</SidebarMenuButton>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
