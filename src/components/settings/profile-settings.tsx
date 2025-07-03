import {
	Building2,
	KeyRound,
	Link as LinkIcon,
	Mail,
	Phone,
	TextCursorInput,
} from "lucide-react";
import React from "react";
import type { ZodType, ZodTypeDef } from "zod";
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
import type { ProfileData } from "@/hooks/use-profile-data";
import { useProfileData } from "@/hooks/use-profile-data";
import {
	useGetInsurerQuery,
	usePatchInsurerMutation,
} from "@/redux/apis/insurerApi";
import { buildInsurerOnboardingFormData } from "@/services/insurerOnboardingService";
import type { Insurer } from "@/types/insurer";

interface InsurerProfileFormProps {
	insurer: Insurer;
	schema: ZodType<Record<string, unknown>, ZodTypeDef, Record<string, unknown>>;
	mutationFn: (data: Record<string, unknown>) => Promise<Insurer>;
	setProfileData: (data: ProfileData) => void;
	refetch: () => Promise<unknown>;
}

function InsurerProfileForm({
	insurer,
	schema,
	mutationFn,
	setProfileData,
	refetch,
}: InsurerProfileFormProps) {
	const [logoFile, setLogoFile] = React.useState<File | Blob | undefined>(
		undefined
	);
	const formRef = React.useRef<
		import("react-hook-form").UseFormReturn<Record<string, unknown>> | null
	>(null);

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
	}, [insurer]);

	const handleLogoChange = (fileOrBlob: File | Blob | null) => {
		if (formRef.current) {
			formRef.current.setValue("logo", fileOrBlob || undefined, {
				shouldValidate: true,
			});
		}
		setLogoFile(fileOrBlob || undefined);
	};

	return (
		<SmartForm<Record<string, unknown>>
			defaultValues={{
				name: insurer.name ?? "",
				description: insurer.description ?? "",
				contact_email: insurer.contact_email ?? "",
				contact_phone: insurer.contact_phone ?? "",
				api_endpoint: insurer.api_endpoint ?? "",
				api_key: insurer.api_key ?? "",
				logo: undefined,
			}}
			mutationFn={
				mutationFn as (data: Record<string, unknown>) => Promise<Insurer>
			}
			onSuccess={async (data: unknown) => {
				setProfileData({
					name: (data as Insurer).name ?? "",
					description: (data as Insurer).description ?? "",
					contact_email: (data as Insurer).contact_email ?? "",
					contact_phone: (data as Insurer).contact_phone ?? "",
					api_endpoint: (data as Insurer).api_endpoint ?? "",
					api_key: (data as Insurer).api_key ?? "",
					logo: (data as Insurer).logo_url ?? "",
				});
				await refetch();
			}}
			schema={schema}
			submitText="Save Changes"
		>
			{(
				form: import("react-hook-form").UseFormReturn<Record<string, unknown>>
			) => {
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
								icon={<Building2 className="h-4 w-4" />}
								label="Company Name"
								name="name"
								placeholder="Enter company name"
								type="text"
							/>
							<SmartFormField
								form={form}
								icon={<Mail className="h-4 w-4" />}
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
								icon={<TextCursorInput className="h-4 w-4" />}
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
								icon={<Phone className="h-4 w-4" />}
								label="Contact Phone"
								name="contact_phone"
								placeholder="+1 (555) 123-4567"
								type="text"
							/>
							<SmartFormField
								form={form}
								icon={<LinkIcon className="h-4 w-4" />}
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
								icon={<KeyRound className="h-4 w-4" />}
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
}

export function ProfileSettings() {
	const { profileData, setProfileData } = useProfileData();
	const insurerId = (profileData && (profileData as { id?: number }).id) || 1;
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

	const mutationFn = async (
		data: Record<string, unknown>
	): Promise<Insurer> => {
		if (!insurer) {
			throw new Error("No insurer data available");
		}
		const allowedKeys = [
			"name",
			"description",
			"contact_email",
			"contact_phone",
			"api_endpoint",
			"api_key",
			"logo",
		] as const;
		type AllowedKey = (typeof allowedKeys)[number];
		const changedFields: Record<string, unknown> = {};
		let onlyLogoChanged = true;
		for (const key of allowedKeys) {
			if (
				key === "logo"
					? data[key] !== undefined
					: data[key] !== undefined &&
						data[key] !==
							(insurer as Record<Exclude<AllowedKey, "logo">, unknown>)[
								key as Exclude<AllowedKey, "logo">
							]
			) {
				changedFields[key] = data[key];
				if (key !== "logo") {
					onlyLogoChanged = false;
				}
			}
		}
		if (Object.keys(changedFields).length === 0) {
			return insurer;
		}

		// Create a properly typed object with all required fields
		const formData = buildInsurerOnboardingFormData({
			name: onlyLogoChanged
				? insurer.name
				: (data.name as string) || insurer.name,
			description: onlyLogoChanged
				? (insurer.description ?? "")
				: ((data.description as string) ?? insurer.description ?? ""),
			contact_email: onlyLogoChanged
				? insurer.contact_email
				: (data.contact_email as string) || insurer.contact_email,
			contact_phone: onlyLogoChanged
				? insurer.contact_phone
				: (data.contact_phone as string) || insurer.contact_phone,
			api_endpoint: onlyLogoChanged
				? (insurer.api_endpoint ?? "")
				: ((data.api_endpoint as string) ?? insurer.api_endpoint ?? ""),
			api_key: onlyLogoChanged
				? (insurer.api_key ?? "")
				: ((data.api_key as string) ?? insurer.api_key ?? ""),
			logo: changedFields.logo as File | Blob | undefined,
		});
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
					{isLoading && <p>Loading...</p>}
					{!isLoading && isError && <p>Error loading profile.</p>}
					{!(isLoading || isError) && insurer && (
						<div className="flex items-center gap-6">
							<Avatar className="h-20 w-20 flex-shrink-0 rounded-md">
								<AvatarImage
									alt={insurer.name}
									src={insurer.logo_url || "/placeholder.svg"}
								/>
								<AvatarFallback className="text-lg">
									{insurer.name
										?.split(" ")
										.map((n: string) => n[0])
										.join("")
										.slice(0, 2)}
								</AvatarFallback>
							</Avatar>
							<div className="min-w-0 flex-1">
								<h3 className="flex items-center gap-2 font-semibold text-lg">
									<Building2 className="h-4 w-4 text-muted-foreground" />
									{insurer.name}
								</h3>
								<p className="mt-1 line-clamp-2 flex items-center gap-2 text-muted-foreground text-sm">
									<TextCursorInput className="h-4 w-4 text-muted-foreground" />
									{insurer.description}
								</p>
								<div className="mt-3 flex flex-wrap items-center gap-4">
									<div className="flex items-center gap-2 text-sm">
										<Mail className="h-4 w-4 text-muted-foreground" />
										<span className="text-muted-foreground">Email:</span>
										<span className="font-medium">{insurer.contact_email}</span>
									</div>
									<div className="flex items-center gap-2 text-sm">
										<Phone className="h-4 w-4 text-muted-foreground" />
										<span className="text-muted-foreground">Phone:</span>
										<span className="font-medium">{insurer.contact_phone}</span>
									</div>
									{insurer.api_endpoint && insurer.api_key ? (
										<Badge
											className="flex items-center gap-1 text-xs"
											variant="secondary"
										>
											<LinkIcon className="h-3 w-3 text-muted-foreground" />
											<KeyRound className="h-3 w-3 text-muted-foreground" />
											API Connected
										</Badge>
									) : (
										<Badge
											className="flex items-center gap-1 text-xs"
											variant="destructive"
										>
											<LinkIcon className="h-3 w-3 text-muted-foreground" />
											<KeyRound className="h-3 w-3 text-muted-foreground" />
											API Not Connected
										</Badge>
									)}
								</div>
							</div>
						</div>
					)}
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
