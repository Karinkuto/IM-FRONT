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
import { useAuth } from "@/hooks/useAuth";
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
	refetch: () => Promise<unknown>;
}

function InsurerProfileForm({
	insurer,
	schema,
	mutationFn,
	refetch,
}: InsurerProfileFormProps) {
	// Track the current logo file or URL
	const [logoState, setLogoState] = React.useState<{
		file: File | Blob | null;
		url: string | null;
	}>({ file: null, url: insurer.logo_url || null });

	const formRef = React.useRef<
		import("react-hook-form").UseFormReturn<Record<string, unknown>> | null
	>(null);

	// Initialize form with insurer data
	React.useEffect(() => {
		if (formRef.current) {
			formRef.current.reset({
				name: insurer.name ?? "",
				description: insurer.description ?? "",
				contact_email: insurer.contact_email ?? "",
				contact_phone: insurer.contact_phone ?? "",
				api_endpoint: insurer.api_endpoint ?? "",
				api_key: insurer.api_key ?? "",
				logo: undefined, // Only set to null if user removes logo
			});
			// Update logo state when insurer data changes
			setLogoState({
				file: null,
				url: insurer.logo_url || null,
			});
		}
	}, [insurer]);

	// Handle logo changes from the AvatarUploader
	const handleLogoChange = (fileOrBlob: File | Blob | null) => {
		if (formRef.current) {
			// Explicitly set to null when removing the logo
			const value = fileOrBlob === null ? null : fileOrBlob;
			formRef.current.setValue("logo", value, {
				shouldValidate: true,
				shouldDirty: true,
				shouldTouch: true,
			});

			// Update the logo state
			setLogoState({
				file: fileOrBlob,
				url: fileOrBlob ? URL.createObjectURL(fileOrBlob) : null,
			});
		}
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
			onSuccess={async () => {
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
								height={180}
								maxSizeMB={5}
								onChange={handleLogoChange}
								shape="rounded"
								value={logoState.url}
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

// Helper to prepare the payload for the insurer form
function prepareInsurerPayload(
	data: Record<string, unknown>,
	insurer: Insurer
) {
	return {
		name: String(data.name ?? insurer.name ?? ""),
		contact_email: String(data.contact_email ?? insurer.contact_email ?? ""),
		contact_phone: String(data.contact_phone ?? insurer.contact_phone ?? ""),
		description:
			data.description !== undefined
				? String(data.description)
				: (insurer.description ?? undefined),
		api_endpoint:
			data.api_endpoint !== undefined
				? String(data.api_endpoint)
				: (insurer.api_endpoint ?? undefined),
		api_key:
			data.api_key !== undefined
				? String(data.api_key)
				: (insurer.api_key ?? undefined),
	};
}

// Helper to extract the logo if changed or removed
function extractLogo(data: Record<string, unknown>) {
	if (
		"logo" in data &&
		(data.logo === null ||
			data.logo instanceof File ||
			data.logo instanceof Blob)
	) {
		return data.logo as File | Blob | null;
	}
	return;
}

export function ProfileSettings() {
	const { user } = useAuth();
	const insurerId = user?.insurer?.id;
	const {
		data: insurer,
		isLoading,
		isError,
		refetch,
	} = useGetInsurerQuery(insurerId as string | number, { skip: !insurerId });
	const [patchInsurer] = usePatchInsurerMutation();

	// Zod schema for validation
	const schema = z.object({
		logo: z
			.instanceof(File, { message: "Logo must be a file" })
			.or(z.instanceof(Blob, { message: "Logo must be a blob" }))
			.or(z.null())
			.optional(),
		name: z.string().optional(),
		description: z.string().optional(),
		contact_email: z.string().email("Please enter a valid email").optional(),
		contact_phone: z.string().optional(),
		api_endpoint: z.string().url("Please enter a valid URL").optional(),
		api_key: z.string().optional(),
	});

	const mutationFn = async (
		data: Record<string, unknown>
	): Promise<Insurer> => {
		if (!insurer) {
			throw new Error("No insurer data available");
		}

		const payload = prepareInsurerPayload(data, insurer);
		const logo = extractLogo(data);
		const formData = buildInsurerOnboardingFormData({ ...payload, logo });
		if (!insurerId) {
			throw new Error("No insurer ID available");
		}
		const updated = await patchInsurer({
			id: insurerId,
			data: formData,
		}).unwrap();
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
				<CardContent className="relative">
					{isLoading && <p>Loading...</p>}
					{!isLoading && isError && <p>Error loading profile.</p>}
					{!(isLoading || isError) && insurer && (
						<div className="flex items-start gap-6">
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
								<div className="mt-1 line-clamp-2 flex items-start gap-2 text-muted-foreground text-sm">
									<TextCursorInput className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
									<span>{insurer.description}</span>
								</div>
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
											icon={
												<LinkIcon
													aria-hidden="true"
													className="text-inherit opacity-60"
													size={12}
												/>
											}
											variant="status-approved"
										>
											API Connected
										</Badge>
									) : (
										<Badge
											className="flex items-center gap-1 text-xs"
											icon={
												<LinkIcon
													aria-hidden="true"
													className="text-inherit opacity-60"
													size={12}
												/>
											}
											variant="status-rejected"
										>
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
				/>
			)}
		</div>
	);
}
