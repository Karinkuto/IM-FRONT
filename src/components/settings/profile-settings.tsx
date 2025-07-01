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
		undefined,
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
			schema={schema}
			mutationFn={mutationFn}
			defaultValues={{
				name: insurer.name ?? "",
				description: insurer.description ?? "",
				contact_email: insurer.contact_email ?? "",
				contact_phone: insurer.contact_phone ?? "",
				api_endpoint: insurer.api_endpoint ?? "",
				api_key: insurer.api_key ?? "",
				logo: undefined,
			}}
			submitText="Save Changes"
			onSuccess={async (data: any) => {
				setProfileData(data);
				await refetch();
			}}
		>
			{(form: any) => {
				formRef.current = form;
				return (
					<>
						<div className="mb-2">
							<Label className="mb-2">Company Logo</Label>
							<AvatarUploader
								value={logoFile}
								onChange={handleLogoChange}
								maxSizeMB={5}
								shape="rounded"
								label="PNG, JPG up to 5MB"
								height={120}
							/>
						</div>
						{/* Second row: Company Name and Contact Email */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<SmartFormField
								form={form}
								name="name"
								type="text"
								label="Company Name"
								placeholder="Enter company name"
							/>
							<SmartFormField
								form={form}
								name="contact_email"
								type="email"
								label="Contact Email"
								placeholder="contact@company.com"
							/>
						</div>
						{/* Description */}
						<div className="space-y-2">
							<SmartFormField
								form={form}
								name="description"
								type="textarea"
								label="Description"
								placeholder="Brief description of your company"
							/>
						</div>
						{/* Contact Phone and API Endpoint */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<SmartFormField
								form={form}
								name="contact_phone"
								type="text"
								label="Contact Phone"
								placeholder="+1 (555) 123-4567"
							/>
							<SmartFormField
								form={form}
								name="api_endpoint"
								type="text"
								label="API Endpoint"
								placeholder="https://api.company.com/v1"
							/>
						</div>
						{/* API Key */}
						<div className="space-y-2">
							<SmartFormField
								form={form}
								name="api_key"
								type="password"
								label="API Key"
								placeholder="Enter your API key"
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
	function mapNullsToUndefined<T extends Record<string, any>>(obj: T): T {
		const mapped: Record<string, any> = {};
		for (const key in obj) {
			if (obj[key] === null) mapped[key] = undefined;
			else mapped[key] = obj[key];
		}
		return mapped as T;
	}

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
							<Avatar className="h-20 w-20 rounded-md flex-shrink-0">
								<AvatarImage
									src={insurer.logo_url || "/placeholder.svg"}
									alt={insurer.name}
								/>
								<AvatarFallback className="text-lg">
									{insurer.name
										.split(" ")
										.map((n: string) => n[0])
										.join("")
										.slice(0, 2)}
								</AvatarFallback>
							</Avatar>
							<div className="flex-1 min-w-0">
								<h3 className="font-semibold text-lg">{insurer.name}</h3>
								<p className="text-sm text-muted-foreground mt-1 line-clamp-2">
									{insurer.description}
								</p>
								<div className="flex items-center gap-4 mt-3">
									<div className="flex items-center gap-2 text-sm">
										<span className="text-muted-foreground">Email:</span>
										<span className="font-medium">{insurer.contact_email}</span>
									</div>
									<div className="flex items-center gap-2 text-sm">
										<span className="text-muted-foreground">Phone:</span>
										<span className="font-medium">{insurer.contact_phone}</span>
									</div>
									{insurer.api_endpoint && insurer.api_key ? (
										<Badge variant="secondary" className="text-xs">
											API Connected
										</Badge>
									) : (
										<Badge variant="destructive" className="text-xs">
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
					schema={schema}
					mutationFn={mutationFn}
					setProfileData={setProfileData}
					refetch={refetch}
				/>
			)}
		</div>
	);
}

// Helper to convert dataURL to Blob for AvatarUploader preview
function dataURLtoBlob(dataurl: string): Blob | null {
	if (!dataurl) return null;
	const arr = dataurl.split(",");
	if (arr.length < 2) return null;
	const mimeMatch = arr[0].match(/:(.*?);/);
	if (!mimeMatch) return null;
	const mime = mimeMatch[1];
	const bstr = atob(arr[1]);
	let n = bstr.length;
	const u8arr = new Uint8Array(n);
	while (n--) {
		u8arr[n] = bstr.charCodeAt(n);
	}
	return new Blob([u8arr], { type: mime });
}
