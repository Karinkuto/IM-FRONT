import { Button } from "@/components/ui/button";
import {
	Cropper,
	CropperCropArea,
	CropperImage,
} from "@/components/ui/cropper";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { useFileUpload } from "@/hooks/use-file-upload";
import { cn } from "@/lib/utils";
import { AlertCircle, ImageUp, ZoomIn, ZoomOut } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

type Area = { x: number; y: number; width: number; height: number };

// Helper function to create a cropped image blob
const createImage = (url: string): Promise<HTMLImageElement> =>
	new Promise((resolve, reject) => {
		const image = new Image();
		image.addEventListener("load", () => resolve(image));
		image.addEventListener("error", (error) => reject(error));
		image.setAttribute("crossOrigin", "anonymous");
		image.src = url;
	});

async function getCroppedImg(
	imageSrc: string,
	pixelCrop: Area,
	outputSize = 160, // Default to 160x160 for avatar
): Promise<Blob | null> {
	try {
		const image = await createImage(imageSrc);
		const canvas = document.createElement("canvas");
		const ctx = canvas.getContext("2d");

		if (!ctx) return null;

		// Set canvas size to desired output size (square)
		canvas.width = outputSize;
		canvas.height = outputSize;

		// Calculate scale to maintain aspect ratio
		const scale = Math.max(
			outputSize / pixelCrop.width,
			outputSize / pixelCrop.height,
		);
		const scaledWidth = pixelCrop.width * scale;
		const scaledHeight = pixelCrop.height * scale;
		const offsetX = (outputSize - scaledWidth) / 2;
		const offsetY = (outputSize - scaledHeight) / 2;

		// Draw the cropped and scaled image onto the canvas
		ctx.drawImage(
			image,
			pixelCrop.x,
			pixelCrop.y,
			pixelCrop.width,
			pixelCrop.height,
			offsetX,
			offsetY,
			scaledWidth,
			scaledHeight,
		);

		// Convert canvas to blob
		return new Promise((resolve) => {
			canvas.toBlob(
				(blob) => {
					resolve(blob);
				},
				"image/jpeg",
				0.9,
			);
		});
	} catch (error) {
		console.error("Error in getCroppedImg:", error);
		return null;
	}
}

interface AvatarUploaderProps {
	initialImageUrl?: string | null;
	onImageChange?: (blob: Blob | null) => void;
	className?: string;
}

export default function AvatarUploader({
	initialImageUrl = null,
	onImageChange = () => {},
	className,
}: AvatarUploaderProps) {
	const maxSizeMB = 5;
	const maxSize = maxSizeMB * 1024 * 1024; // 5MB

	// Track local image changes separately from initial prop
	const [localImageUrl, setLocalImageUrl] = useState<string | null>(null);
	const finalImageUrl = localImageUrl !== null ? localImageUrl : initialImageUrl;

	const [
		{ files, isDragging, errors },
		{
			handleDragEnter,
			handleDragLeave,
			handleDragOver,
			handleDrop,
			openFileDialog,
			removeFile,
			getInputProps,
		},
	] = useFileUpload({
		accept: "image/jpeg,image/png,image/svg+xml,image/webp",
		maxSize,
	});

	const fileId = files[0]?.id;
	const filePreview = files[0]?.preview || null;
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
	const [zoom, setZoom] = useState(1);
	const previousFileIdRef = useRef<string | null>(null);

	// Handle crop changes
	const handleCropChange = useCallback((pixels: Area | null) => {
		setCroppedAreaPixels(pixels);
	}, []);

	// Apply the crop and close the dialog
	const handleApply = async () => {
		if (!previewUrl || !croppedAreaPixels) {
			if (fileId) removeFile(fileId);
			return;
		}

		setIsDialogOpen(false); // Close dialog immediately to prevent further interactions

		try {
			// 1. Generate the cropped image
			const croppedBlob = await getCroppedImg(previewUrl, croppedAreaPixels);

			if (!croppedBlob) {
				throw new Error("Failed to generate cropped image");
			}

			// 2. Create a new object URL for the cropped image
			const newFinalUrl = URL.createObjectURL(croppedBlob);

			// 3. Clean up old URLs
			if (previewUrl?.startsWith?.("blob:")) {
				URL.revokeObjectURL(previewUrl);
			}

			// 4. Update state with the new image
			setLocalImageUrl(newFinalUrl);
			setPreviewUrl(null);

			// 5. Pass the Blob directly to the parent component
			onImageChange(croppedBlob);

			// 6. Clean up file
			if (fileId) {
				removeFile(fileId);
			}
		} catch (error) {
			console.error("Error during crop:", error);
			// Clean up on error
			if (fileId) removeFile(fileId);
			setPreviewUrl(null);
			setLocalImageUrl(null);
			setIsDialogOpen(false);
		}
	};

	// Remove the current image
	const handleRemoveImage = useCallback(() => {
		// Clean up any blob URLs
		if (finalImageUrl?.startsWith?.("blob:")) {
			URL.revokeObjectURL(finalImageUrl);
		}
		if (previewUrl?.startsWith?.("blob:")) {
			URL.revokeObjectURL(previewUrl);
		}
		
		// Reset all states
		// Use empty string to indicate removal (null would show the initial image)
		setLocalImageUrl("");
		setPreviewUrl(null);
		
		// Clear any selected files
		for (const file of files) {
			removeFile(file.id);
		}
		
		// Notify parent that the image was removed
		onImageChange(null);
	}, [finalImageUrl, previewUrl, files, removeFile, onImageChange]);

	// Clean up object URLs on unmount or when finalImageUrl changes
	useEffect(() => {
		// Capture the current value of finalImageUrl when the effect is defined
		const urlToRevokeOnUnmount = finalImageUrl;
		return () => {
			// Only revoke when component unmounts and if it's a blob URL
			if (urlToRevokeOnUnmount?.startsWith?.("blob:")) {
				URL.revokeObjectURL(urlToRevokeOnUnmount);
			}
		};
	}, [finalImageUrl]); // Include finalImageUrl in dependencies

	// Update local state when initialImageUrl changes from parent
	// but only if we don't have any local changes
	useEffect(() => {
		if (localImageUrl === null && initialImageUrl !== finalImageUrl) {
			// Clean up old blob URL if it exists
			if (finalImageUrl?.startsWith?.("blob:")) {
				URL.revokeObjectURL(finalImageUrl);
			}
		}
	}, [initialImageUrl, localImageUrl, finalImageUrl]);

	// Open crop dialog when a new file is selected
	useEffect(() => {
		if (fileId && fileId !== previousFileIdRef.current) {
			previousFileIdRef.current = fileId;
			if (filePreview) {
				setPreviewUrl(filePreview);
				setIsDialogOpen(true);
			} else {
				console.error("filePreview is null or undefined");
			}
		}
	}, [fileId, filePreview]);

	return (
		<div className={cn("flex flex-col gap-4 w-full", className)}>
			{!finalImageUrl || finalImageUrl === "" ? (
				/* Drop zone - shown when no image is selected */
				<button
					type="button"
					className={cn(
						"w-full border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-4",
						"hover:border-primary/50 transition-colors outline-none",
						"focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
						isDragging
							? "border-primary/50 bg-primary/5"
							: "border-muted-foreground/25",
					)}
					onDragEnter={handleDragEnter}
					onDragOver={handleDragOver}
					onDragLeave={handleDragLeave}
					onDrop={handleDrop}
					onClick={openFileDialog}
				>
					<div className="p-3 rounded-full bg-primary/10">
						<ImageUp className="h-6 w-6 text-primary" />
					</div>
					<div className="text-center">
						<p className="font-medium">
							<span className="text-primary">Click to upload</span> or drag and
							drop
						</p>
						<p className="text-sm text-muted-foreground">
							SVG, PNG, JPG, or WebP (max. 5MB)
						</p>
					</div>
				</button>
			) : (
					/* Preview mode - shown after image is selected and cropped */
				<div className="flex flex-col items-center gap-4">
					{finalImageUrl && (
						<div className="relative w-40 h-40 rounded-lg overflow-hidden border">
							<img
								src={finalImageUrl}
								alt="Company logo preview"
								className="w-full h-full object-cover"
								onLoad={(e) => {
									// Revoke previous blob URL only after the new image has loaded
									const currentSrc = (e.target as HTMLImageElement).src;
									const oldUrl = (e.target as HTMLImageElement).dataset.oldUrl;
									if (oldUrl?.startsWith("blob:") && oldUrl !== currentSrc) {
										URL.revokeObjectURL(oldUrl);
									}
									// Store the current src for the next load event to compare
									(e.target as HTMLImageElement).dataset.oldUrl = currentSrc;
								}}
								onError={(e) => {
									const target = e.target as HTMLImageElement;
									const erroredSrc = target.src;

									if (erroredSrc.startsWith("blob:")) {
										URL.revokeObjectURL(erroredSrc);
									}
									target.src = ""; // Clear the broken image
									setLocalImageUrl(null); // Clear the image on error
								}}
								data-old-url={
									finalImageUrl.startsWith("blob:") ? finalImageUrl : ""
								} // Store current URL to compare in onLoad
							/>
						</div>
					)}
					<div className="flex gap-2">
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={(e) => {
								e.stopPropagation();
								openFileDialog();
							}}
						>
							Change
						</Button>
						<Button
							type="button"
							variant="outline"
							size="sm"
							className="text-destructive hover:text-destructive"
							onClick={(e) => {
								e.stopPropagation();
								handleRemoveImage();
							}}
						>
							Remove
						</Button>
					</div>
				</div>
			)}

			{/* Hidden file input - always present but not visible */}

			{/* Hidden file input */}
			<input
				{...getInputProps({
					onChange: (e) => {
						getInputProps().onChange?.(e);
					},
				})}
				className="hidden"
				id="avatar-upload"
				accept="image/*"
			/>

			{/* Error message */}
			{errors.length > 0 && (
				<div className="flex items-center gap-1 text-xs text-destructive">
					<AlertCircle className="h-3 w-3" />
					<span>{errors[0]}</span>
				</div>
			)}

			{/* Crop Dialog */}
			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle>Crop your logo</DialogTitle>
						<DialogDescription>
							Adjust the crop area to your preference
						</DialogDescription>
					</DialogHeader>

					{previewUrl && (
						<div className="relative h-[400px] w-full bg-muted">
							<div className="absolute inset-0 flex items-center justify-center">
								<Cropper
									className="h-full w-full"
									image={previewUrl}
									zoom={zoom}
									onCropChange={handleCropChange}
									onZoomChange={setZoom}
									aspectRatio={1}
									minZoom={0.5}
									maxZoom={3}
								>
									<CropperImage />
									<CropperCropArea className="border-2 border-primary/50" />
								</Cropper>
							</div>

							<div className="absolute bottom-4 left-1/2 w-full max-w-[80%] -translate-x-1/2 px-4">
								<div className="flex items-center gap-4">
									<ZoomOut className="h-5 w-5 shrink-0" />
									<Slider
										value={[zoom]}
										min={0.5}
										max={3}
										step={0.1}
										onValueChange={(value) => setZoom(value[0])}
										className="w-full"
									/>
									<ZoomIn className="h-5 w-5 shrink-0" />
								</div>
							</div>
						</div>
					)}

					<DialogFooter className="mt-4">
						<Button
							type="button"
							variant="outline"
							onClick={() => {
								setIsDialogOpen(false);
								if (fileId) removeFile(fileId);
							}}
						>
							Cancel
						</Button>
						<Button type="button" onClick={handleApply}>
							Apply
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
