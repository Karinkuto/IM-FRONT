import { Upload } from "lucide-react";
import type React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useProfileData } from "@/hooks/use-profile-data";

export function ProfileSettings() {
	const { profileData, setProfileData } = useProfileData();

	const handleProfileSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		// Handle profile update
		console.log("Profile updated:", profileData);
	};

	const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = (e) => {
				setProfileData((prev) => ({
					...prev,
					logo: e.target?.result as string,
				}));
			};
			reader.readAsDataURL(file);
		}
	};

	return (
		<div className="space-y-6">
			{/* Profile Preview Card */}
			<Card>
				<CardHeader>
					<CardTitle className="text-lg">Profile Preview</CardTitle>
					<CardDescription>
						How your company profile appears to others
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex items-center gap-6">
						<Avatar className="h-20 w-20 rounded-md flex-shrink-0">
							<AvatarImage
								src={profileData.logo || "/placeholder.svg"}
								alt={profileData.name}
							/>
							<AvatarFallback className="text-lg">
								{profileData.name
									.split(" ")
									.map((n) => n[0])
									.join("")
									.slice(0, 2)}
							</AvatarFallback>
						</Avatar>
						<div className="flex-1 min-w-0">
							<h3 className="font-semibold text-lg">{profileData.name}</h3>
							<p className="text-sm text-muted-foreground mt-1 line-clamp-2">
								{profileData.description}
							</p>
							<div className="flex items-center gap-4 mt-3">
								<div className="flex items-center gap-2 text-sm">
									<span className="text-muted-foreground">Email:</span>
									<span className="font-medium">
										{profileData.contact_email}
									</span>
								</div>
								<div className="flex items-center gap-2 text-sm">
									<span className="text-muted-foreground">Phone:</span>
									<span className="font-medium">
										{profileData.contact_phone}
									</span>
								</div>
								<Badge variant="secondary" className="text-xs">
									API Connected
								</Badge>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Profile Form */}
			<Card>
				<CardHeader>
					<CardTitle className="text-lg">Company Information</CardTitle>
					<CardDescription>
						Update your company profile information
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleProfileSubmit} className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="name">Company Name</Label>
								<Input
									id="name"
									value={profileData.name}
									onChange={(e) =>
										setProfileData((prev) => ({
											...prev,
											name: e.target.value,
										}))
									}
									placeholder="Enter company name"
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="contact_email">Contact Email</Label>
								<Input
									id="contact_email"
									type="email"
									value={profileData.contact_email}
									onChange={(e) =>
										setProfileData((prev) => ({
											...prev,
											contact_email: e.target.value,
										}))
									}
									placeholder="contact@company.com"
								/>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="description">Description</Label>
							<Textarea
								id="description"
								value={profileData.description}
								onChange={(e) =>
									setProfileData((prev) => ({
										...prev,
										description: e.target.value,
									}))
								}
								placeholder="Brief description of your company"
								rows={3}
							/>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="contact_phone">Contact Phone</Label>
								<Input
									id="contact_phone"
									value={profileData.contact_phone}
									onChange={(e) =>
										setProfileData((prev) => ({
											...prev,
											contact_phone: e.target.value,
										}))
									}
									placeholder="+1 (555) 123-4567"
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="api_endpoint">API Endpoint</Label>
								<Input
									id="api_endpoint"
									value={profileData.api_endpoint}
									onChange={(e) =>
										setProfileData((prev) => ({
											...prev,
											api_endpoint: e.target.value,
										}))
									}
									placeholder="https://api.company.com/v1"
								/>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="api_key">API Key</Label>
							<Input
								id="api_key"
								type="password"
								value={profileData.api_key}
								onChange={(e) =>
									setProfileData((prev) => ({
										...prev,
										api_key: e.target.value,
									}))
								}
								placeholder="Enter your API key"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="logo">Company Logo</Label>
							<div className="flex items-center gap-4">
								<Input
									id="logo"
									type="file"
									accept="image/*"
									onChange={handleLogoUpload}
									className="hidden"
								/>
								<Button
									type="button"
									variant="outline"
									onClick={() => document.getElementById("logo")?.click()}
									className="flex items-center gap-2"
								>
									<Upload size={16} />
									Upload Logo
								</Button>
								<span className="text-sm text-muted-foreground">
									PNG, JPG up to 2MB
								</span>
							</div>
						</div>

						<div className="flex justify-end pt-4">
							<Button type="submit">Save Changes</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
