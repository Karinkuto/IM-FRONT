import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import type { InsurerProfile } from "@/types/insurer";
import { useNavigate } from "react-router-dom";

interface InsurerNavProps {
	user: InsurerProfile;
}

export function InsurerNav({ user }: InsurerNavProps) {
	const navigate = useNavigate();

	const userInitials = user.companyName
		.split(" ")
		.map((n) => n[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);

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
						{user.logo_url ? (
							<AvatarImage
								src={
									typeof user.logo_url === "string"
										? user.logo_url
										: URL.createObjectURL(user.logo_url)
								}
								alt={user.companyName}
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
							{user.companyName}
						</span>
						<span className="truncate text-xs text-muted-foreground">
							{user.email}
						</span>
					</div>
				</SidebarMenuButton>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
