import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Building2, Mail, Phone, Text } from "lucide-react";
import { SettingsSection } from "../../../components/SettingsSection";

interface ProfilePreviewProps {
	companyName: string;
	email: string;
	contactEmail?: string;
	contactPhone?: string;
	description?: string;
	logo_url: string | null;
}

export function ProfilePreview({
	companyName,
	email,
	contactEmail,
	contactPhone,
	description,
	logo_url,
}: ProfilePreviewProps) {
	return (
		<SettingsSection
			title="Profile Preview"
			description="Preview your profile information."
		>
			<div className="bg-card rounded-lg border p-6">
				<div className="flex items-center gap-4">
					<Avatar className="h-16 w-16 rounded-lg">
						{logo_url ? (
							<AvatarImage
								src={logo_url}
								alt={companyName}
								className="object-cover"
							/>
						) : (
							<AvatarFallback className="rounded-lg bg-primary/10 text-primary">
								{companyName?.charAt(0)?.toUpperCase() || "C"}
							</AvatarFallback>
						)}
					</Avatar>
					<div>
						<h3 className="text-lg font-semibold">
							<Building2 className="mr-2 inline h-5 w-5" />
							{companyName || "Your Company Name"}
						</h3>
						<p className="text-sm text-muted-foreground">
							<Mail className="mr-1 inline h-3 w-3" />
							{email || "email@example.com"}
						</p>
					</div>
				</div>

				{(contactEmail || contactPhone) && (
					<div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<h4 className="text-sm font-medium mb-3">Contact Information</h4>
							<div className="space-y-2">
								{contactEmail && (
									<div>
										<p className="text-sm text-muted-foreground">
											<Mail className="mr-1 inline h-3 w-3" />
											Email
										</p>
										<p className="text-sm">{contactEmail}</p>
									</div>
								)}
								{contactPhone && (
									<div>
										<p className="text-sm text-muted-foreground">
											<Phone className="mr-1 inline h-3 w-3" />
											Phone
										</p>
										<p className="text-sm">{contactPhone}</p>
									</div>
								)}
							</div>
						</div>

						{description && (
							<div>
								<h4 className="text-sm font-medium mb-3">
									<Text className="mr-1 inline h-3 w-3" />
									About
								</h4>
								<p className="text-sm text-muted-foreground">{description}</p>
							</div>
						)}
					</div>
				)}
			</div>
		</SettingsSection>
	);
}
