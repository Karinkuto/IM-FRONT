import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import type { User } from "@/types/auth";
import { useNavigate } from "react-router-dom";

interface AdminNavProps {
	user: User;
}

export function AdminNav({ user }: AdminNavProps) {
	const navigate = useNavigate();

	const userInitials = user.name
		? user.name
				.split(" ")
				.map((n) => n[0])
				.join("")
				.toUpperCase()
				.slice(0, 2)
		: "AD";

	const handleProfileClick = () => {
		navigate("/admin/settings?tab=profile");
	};

	return (
		<SidebarMenu className="mt-auto mb-4">
			<SidebarMenuItem>
				<SidebarMenuButton
					size="lg"
					className="hover:bg-transparent dark:hover:bg-transparent cursor-pointer"
					onClick={handleProfileClick}
					aria-label="View profile settings"
				>
					<Avatar className="h-10 w-10 rounded-md">
						{user.avatar ? (
							<AvatarImage
								src={user.avatar}
								alt={user.name || "Admin"}
								className="object-cover"
							/>
						) : (
							<AvatarFallback className="rounded-md bg-black text-white">
								{userInitials}
							</AvatarFallback>
						)}
					</Avatar>
					<div className="grid flex-1 text-left text-sm leading-tight">
						<span className="truncate font-medium text-primary">
							{user.name || user.email}
						</span>
						<span className="truncate text-xs text-muted-foreground capitalize">
							{user.role?.toLowerCase() || "admin"}
						</span>
					</div>
				</SidebarMenuButton>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
