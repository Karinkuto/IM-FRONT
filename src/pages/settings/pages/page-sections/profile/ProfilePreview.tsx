import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Building2, Globe, Key, Mail, Phone, Text } from "lucide-react";
import { SettingsSection } from "../../../components/SettingsSection";

interface ProfilePreviewProps {
	companyName: string;
	contactEmail?: string;
	contactPhone?: string;
	description?: string;
	apiEndpoint?: string;
	apiKey?: string;
	logo_url: string | null;
}

// Helper function to mask API keys for display
function maskApiKey(apiKey?: string): string {
	if (!apiKey) return "Not set";
	if (apiKey.length <= 8) return "••••••••"; // Very short key, just show all masked

	// Show first 4 and last 4 characters, mask the rest
	const firstChars = apiKey.substring(0, 4);
	const lastChars = apiKey.substring(apiKey.length - 4);
	return `${firstChars}${"•".repeat(8)}${lastChars}`;
}

export function ProfilePreview({
	companyName,
	contactEmail,
	contactPhone,
	description,
	apiEndpoint,
	apiKey,
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
						<p className="text-sm text-muted-foreground mt-0.5">
							{contactEmail || "contact@example.com"}
						</p>
					</div>
				</div>

				<div className="mt-8 space-y-8">
					{(contactEmail || contactPhone) && (
						<div className="pt-6 border-t">
							<h4 className="text-md font-semibold flex items-center mb-4">
								<Mail className="mr-2 h-5 w-5 text-primary" />
								Contact Information
							</h4>
							<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-8">
								{contactEmail && (
									<div className="space-y-1">
										<p className="text-xs font-medium text-muted-foreground">
											Contact Email
										</p>
										<p className="text-sm text-foreground">{contactEmail}</p>
									</div>
								)}
								{contactPhone && (
									<div className="space-y-1">
										<p className="text-xs font-medium text-muted-foreground">
											Phone
										</p>
										<p className="text-sm text-foreground">{contactPhone}</p>
									</div>
								)}
							</div>
						</div>
					)}

					{(apiEndpoint || apiKey) && (
						<div className="pt-6 border-t">
							<h4 className="text-md font-semibold flex items-center mb-4">
								<Globe className="mr-2 h-5 w-5 text-primary" />
								API Settings
							</h4>
							<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-8">
								{apiEndpoint && (
									<div className="space-y-1">
										<p className="text-xs font-medium text-muted-foreground">
											API Endpoint
										</p>
										<p className="text-sm font-mono break-all text-foreground">
											{apiEndpoint}
										</p>
									</div>
								)}
								{apiKey && (
									<div className="space-y-1">
										<p className="text-xs font-medium text-muted-foreground">
											API Key
										</p>
										<p className="text-sm font-mono text-foreground">
											{maskApiKey(apiKey)}
										</p>
										<p className="text-xs text-muted-foreground mt-1">
											(Key is masked for security)
										</p>
									</div>
								)}
							</div>
						</div>
					)}

					{description && (
						<div className="pt-6 border-t">
							<h4 className="text-md font-semibold flex items-center mb-4">
								<Text className="mr-2 h-5 w-5 text-primary" />
								About
							</h4>
							<p className="text-sm text-foreground">{description}</p>
						</div>
					)}
				</div>
			</div>
		</SettingsSection>
	);
}
