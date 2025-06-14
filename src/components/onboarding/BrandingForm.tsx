import AvatarUploader from "@/components/avatar-uploader"; // New import
// import { AlertCircleIcon, ImageUpIcon, XIcon } from "lucide-react"; // Removed as useFileUpload is no longer needed
// import { useFileUpload } from "@/hooks/use-file-upload"; // Removed as useFileUpload is no longer needed
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useImperativeHandle } from "react";
import { useForm } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";
import * as z from "zod";

const brandingSchema = z.object({
	logo_url: z.union([z.instanceof(Blob), z.string()]).nullable(), // Allows Blob, string, or null
});

interface BrandingFormProps {
	onUpdateData: (data: { logo_url: Blob | null }) => void; // Updated prop type to accept Blob | null
	initialLogoUrl?: string | null;
	// No onNext prop anymore
}

export const BrandingForm = React.forwardRef<
	UseFormReturn<z.infer<typeof brandingSchema>>,
	BrandingFormProps
>(({ onUpdateData, initialLogoUrl = null }, ref) => {
	const form = useForm<z.infer<typeof brandingSchema>>({
		resolver: zodResolver(brandingSchema),
		defaultValues: {
			logo_url: initialLogoUrl,
		},
	});

	useImperativeHandle(ref, () => form, [form]);

	// const maxSizeMB = 5; // Removed as useFileUpload is no longer needed
	// const maxSize = maxSizeMB * 1024 * 1024; // Removed as useFileUpload is no longer needed

	// const [ // Removed as useFileUpload is no longer needed
	// 	{ files, isDragging, errors },
	// 	{
	// 		handleDragEnter,
	// 		handleDragLeave,
	// 		handleDragOver,
	// 		handleDrop,
	// 		openFileDialog,
	// 		removeFile,
	// 		getInputProps,
	// 	},
	// ] = useFileUpload({
	// 	accept: "image/*",
	// 	maxSize,
	// });

	// const previewUrl = files[0]?.preview || null; // Removed as useFileUpload is no longer needed

	React.useEffect(
		() => {
			// This effect is no longer needed as onImageChange directly updates parent and form
			// if (previewUrl !== form.getValues("logo_url")) {
			// 	form.setValue("logo_url", previewUrl);
			// 	onUpdateData({ logo_url: previewUrl });
			// }
		},
		[
			/* previewUrl, form, onUpdateData */
		],
	); // Dependencies commented out

	// Effect to handle initialLogoUrl changes from parent
	React.useEffect(() => {
		if (initialLogoUrl !== form.getValues("logo_url")) {
			form.setValue("logo_url", initialLogoUrl);
		}
	}, [initialLogoUrl, form]);

	const handleImageChange = React.useCallback(
		(blob: Blob | null) => {
			form.setValue("logo_url", blob); // Update form value
			onUpdateData({ logo_url: blob }); // Notify parent
			// Manually trigger validation for the logo_url field after change
			form.trigger("logo_url");
		},
		[form, onUpdateData],
	);

	const onSubmit = (values: z.infer<typeof brandingSchema>) => {
		// The data is already passed up via onUpdateData in the handleImageChange.
		// This onSubmit is primarily for validation to ensure the form is valid before proceeding.
	};

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="space-y-4 max-w-full flex justify-center" // Added flex and justify-center for centering
			>
				<FormField
					control={form.control}
					name="logo_url"
					render={({ field }) => (
						<FormItem className="space-y-2 text-center">
							<FormDescription className="text-sm text-muted-foreground mb-4">
								Upload your company logo. Recommended: square aspect ratio, max
								size 5MB.
							</FormDescription>
							<FormControl>
								<AvatarUploader
									initialImageUrl={initialLogoUrl}
									onImageChange={handleImageChange}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Errors display from useFileUpload removed */}
				{/* {errors.length > 0 && (
					<div
						className="text-destructive flex items-center gap-1 text-xs"
						role="alert"
					>
						<AlertCircleIcon className="size-3 shrink-0" />
						<span>{errors[0]}</span>
					</div>
				)} */}
			</form>
		</Form>
	);
});

BrandingForm.displayName = "BrandingForm";
