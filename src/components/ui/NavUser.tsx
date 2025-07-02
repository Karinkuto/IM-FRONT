import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";

interface NavUserProps {
	user: {
		name: string;
		email: string;
		role: string;
		avatar?: string;
	};
}

export function NavUser({ user }: NavUserProps) {
	const userInitials = user.name
		.split(" ")
		.map((n) => n[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);

	return (
		<SidebarMenu className="mt-auto mb-4">
			<SidebarMenuItem>
				<SidebarMenuButton
					className="hover:bg-transparent dark:hover:bg-transparent"
					size="lg"
				>
					<Avatar className="h-10 w-10 rounded-md">
						{user.avatar ? (
							<AvatarImage alt={user.name} src={user.avatar} />
						) : (
							<AvatarFallback className="rounded-md bg-black text-white">
								{userInitials}
							</AvatarFallback>
						)}
					</Avatar>
					<div className="grid flex-1 text-left text-sm leading-tight">
						<span className="truncate font-medium text-primary">
							{user.name}
						</span>
						<span className="truncate text-muted-foreground text-xs capitalize">
							{user.role}
						</span>
					</div>
				</SidebarMenuButton>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
