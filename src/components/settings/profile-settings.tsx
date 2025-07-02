import React from "react";
import { z } from "zod";
import { SmartForm, SmartFormField } from "@/components/smart-form";
import AvatarUploader from "@/components/ui/AvatarUploader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useProfileData } from "@/hooks/use-profile-data";
import {
	useGetInsurerQuery,
	usePatchInsurerMutation,
} from "@/redux/apis/insurerApi";
import { buildInsurerOnboardingFormData } from "@/services/insurerOnboardingService";

function InsurerProfileForm({
	insurer,
	schema,
	mutationFn,
	setProfileData,
	refetch,
}: any) {
	const [logoFile, setLogoFile] = React.useState<File | Blob | undefined>(
		undefined
	);
	const formRef = React.useRef<any>(null);

	React.useEffect(() => {
		if (formRef.current) {
			formRef.current.reset({
				name: insurer.name ?? "",
				description: insurer.description ?? "",
				contact_email: insurer.contact_email ?? "",
				contact_phone: insurer.contact_phone ?? "",
				api_endpoint: insurer.api_endpoint ?? "",
				api_key: insurer.api_key ?? "",
				logo: undefined,
			});
			setLogoFile(undefined);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [insurer]);

	const handleLogoChange = (fileOrBlob: File | Blob | null) => {
		if (formRef.current) {
			formRef.current.setValue("logo", fileOrBlob || undefined, {
				shouldValidate: true,
			});
		}
		setLogoFile(fileOrBlob || undefined);
	};

	const formContent = (
		<SmartForm
			defaultValues={{
				name: insurer.name ?? "",
				description: insurer.description ?? "",
				contact_email: insurer.contact_email ?? "",
				contact_phone: insurer.contact_phone ?? "",
				api_endpoint: insurer.api_endpoint ?? "",
				api_key: insurer.api_key ?? "",
				logo: undefined,
			}}
			mutationFn={mutationFn}
			onSuccess={async (data: any) => {
				setProfileData(data);
				await refetch();
			}}
			schema={schema}
			submitText="Save Changes"
		>
			{(form: any) => {
				formRef.current = form;
				return (
					<>
						<div className="mb-2">
							<Label className="mb-2">Company Logo</Label>
							<AvatarUploader
								height={120}
								label="PNG, JPG up to 5MB"
								maxSizeMB={5}
								onChange={handleLogoChange}
								shape="rounded"
								value={logoFile}
							/>
						</div>
						{/* Second row: Company Name and Contact Email */}
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<SmartFormField
								form={form}
								label="Company Name"
								name="name"
								placeholder="Enter company name"
								type="text"
							/>
							<SmartFormField
								form={form}
								label="Contact Email"
								name="contact_email"
								placeholder="contact@company.com"
								type="email"
							/>
						</div>
						{/* Description */}
						<div className="space-y-2">
							<SmartFormField
								form={form}
								label="Description"
								name="description"
								placeholder="Brief description of your company"
								type="textarea"
							/>
						</div>
						{/* Contact Phone and API Endpoint */}
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<SmartFormField
								form={form}
								label="Contact Phone"
								name="contact_phone"
								placeholder="+1 (555) 123-4567"
								type="text"
							/>
							<SmartFormField
								form={form}
								label="API Endpoint"
								name="api_endpoint"
								placeholder="https://api.company.com/v1"
								type="text"
							/>
						</div>
						{/* API Key */}
						<div className="space-y-2">
							<SmartFormField
								form={form}
								label="API Key"
								name="api_key"
								placeholder="Enter your API key"
								type="password"
							/>
						</div>
					</>
				);
			}}
		</SmartForm>
	);
	return formContent;
}

export function ProfileSettings() {
	const { profileData, setProfileData } = useProfileData();
	const insurerId = (profileData && (profileData as any).id) || 1;
	const {
		data: insurer,
		isLoading,
		isError,
		refetch,
	} = useGetInsurerQuery(insurerId);
	const [patchInsurer] = usePatchInsurerMutation();

	// Zod schema for validation
	const schema = z.object({
		logo: z
			.instanceof(File, { message: "Logo must be a file" })
			.or(z.instanceof(Blob, { message: "Logo must be a blob" }))
			.optional(),
		name: z.string().optional(),
		description: z.string().optional(),
		contact_email: z.string().optional(),
		contact_phone: z.string().optional(),
		api_endpoint: z.string().optional(),
		api_key: z.string().optional(),
	});

	// Mutation function for SmartForm
	const mutationFn = async (data: any) => {
		if (!insurer) return;
		const allowedKeys = [
			"name",
			"description",
			"contact_email",
			"contact_phone",
			"api_endpoint",
			"api_key",
			"logo",
		];
		const changedFields: Record<string, any> = {};
		let onlyLogoChanged = true;
		for (const key of allowedKeys) {
			if (data[key] !== undefined && data[key] !== (insurer as any)[key]) {
				changedFields[key] = data[key];
				if (key !== "logo") {
					onlyLogoChanged = false;
				}
			}
		}
		if (Object.keys(changedFields).length === 0) {
			return insurer;
		}

		let formData: FormData;
		if (onlyLogoChanged && changedFields.logo !== undefined) {
			// Only logo changed: send all required fields plus logo
			formData = buildInsurerOnboardingFormData({
				name: insurer.name,
				description: insurer.description ?? undefined,
				contact_email: insurer.contact_email,
				contact_phone: insurer.contact_phone,
				api_endpoint: insurer.api_endpoint ?? undefined,
				api_key: insurer.api_key ?? undefined,
				logo: changedFields.logo,
			});
		} else {
			// Other fields changed: send all fields (logo only if changed)
			formData = buildInsurerOnboardingFormData({
				name: data.name,
				description: data.description,
				contact_email: data.contact_email,
				contact_phone: data.contact_phone,
				api_endpoint: data.api_endpoint,
				api_key: data.api_key,
				logo: changedFields.logo !== undefined ? changedFields.logo : undefined,
			});
		}
		const updated = await patchInsurer({
			id: insurerId,
			data: formData,
		}).unwrap();
		setProfileData({
			name: updated.name ?? "",
			description: updated.description ?? "",
			contact_email: updated.contact_email ?? "",
			contact_phone: updated.contact_phone ?? "",
			api_endpoint: updated.api_endpoint ?? "",
			api_key: updated.api_key ?? "",
			logo: updated.logo_url ?? "",
		});
		return updated;
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
					{isLoading ? (
						<p>Loading...</p>
					) : isError ? (
						<p>Error loading profile.</p>
					) : insurer ? (
						<div className="flex items-center gap-6">
							<Avatar className="h-20 w-20 flex-shrink-0 rounded-md">
								<AvatarImage
									alt={insurer.name}
									src={insurer.logo_url || "/placeholder.svg"}
								/>
								<AvatarFallback className="text-lg">
									{insurer.name
										.split(" ")
										.map((n: string) => n[0])
										.join("")
										.slice(0, 2)}
								</AvatarFallback>
							</Avatar>
							<div className="min-w-0 flex-1">
								<h3 className="font-semibold text-lg">{insurer.name}</h3>
								<p className="mt-1 line-clamp-2 text-muted-foreground text-sm">
									{insurer.description}
								</p>
								<div className="mt-3 flex items-center gap-4">
									<div className="flex items-center gap-2 text-sm">
										<span className="text-muted-foreground">Email:</span>
										<span className="font-medium">{insurer.contact_email}</span>
									</div>
									<div className="flex items-center gap-2 text-sm">
										<span className="text-muted-foreground">Phone:</span>
										<span className="font-medium">{insurer.contact_phone}</span>
									</div>
									{insurer.api_endpoint && insurer.api_key ? (
										<Badge className="text-xs" variant="secondary">
											API Connected
										</Badge>
									) : (
										<Badge className="text-xs" variant="destructive">
											API Not Connected
										</Badge>
									)}
								</div>
							</div>
						</div>
					) : null}
				</CardContent>
			</Card>

			{/* Only render the form when insurer data is loaded */}
			{!isLoading && insurer && (
				<InsurerProfileForm
					insurer={insurer}
					mutationFn={mutationFn}
					refetch={refetch}
					schema={schema}
					setProfileData={setProfileData}
				/>
			)}
		</div>
	);
}
