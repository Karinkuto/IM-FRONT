import {
	CircleUserRoundIcon,
	XIcon,
	ZoomInIcon,
	ZoomOutIcon,
} from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Area } from "react-easy-crop";
import Cropper from "react-easy-crop";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { useFileUpload } from "@/hooks/use-file-upload";

// Helper to create an HTMLImageElement from a URL
const createImage = (url: string): Promise<HTMLImageElement> =>
	new Promise((resolve, reject) => {
		const image = new window.Image();
		image.addEventListener("load", () => resolve(image));
		image.addEventListener("error", (error) => reject(error));
		image.setAttribute("crossOrigin", "anonymous");
		image.src = url;
	});

// Crop and return a Blob
async function getCroppedImg(
	imageSrc: string,
	pixelCrop: { x: number; y: number; width: number; height: number },
	outputWidth: number = pixelCrop.width,
	outputHeight: number = pixelCrop.height
): Promise<Blob | null> {
	try {
		const image = await createImage(imageSrc);
		const canvas = document.createElement("canvas");
		const ctx = canvas.getContext("2d");
		if (!ctx) return null;
		canvas.width = outputWidth;
		canvas.height = outputHeight;
		ctx.drawImage(
			image,
			pixelCrop.x,
			pixelCrop.y,
			pixelCrop.width,
			pixelCrop.height,
			0,
			0,
			outputWidth,
			outputHeight
		);
		return new Promise((resolve) => {
			canvas.toBlob((blob) => resolve(blob), "image/jpeg");
		});
	} catch (error) {
		console.error("Error in getCroppedImg:", error);
		return null;
	}
}

interface AvatarUploaderProps {
	value?: Blob | null;
	onChange: (file: Blob | null) => void;
	maxSizeMB?: number;
	shape?: "circle" | "rounded";
	label?: string;
	height?: number | string; // Optional adaptive height
}

export const AvatarUploader: React.FC<AvatarUploaderProps> = ({
	value,
	onChange,
	maxSizeMB = 5,
	shape = "rounded",
	label = "",
	height,
}) => {
	const maxSize = maxSizeMB * 1024 * 1024;
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
		accept: "image/jpeg,image/png",
		maxSize,
		multiple: false,
	});

	const previewUrl = files[0]?.preview || null;
	const fileId = files[0]?.id;
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
	const [zoom, setZoom] = useState(1);
	const [preview, setPreview] = useState<string | null>(null);
	const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

	// Open dialog when a new file is selected
	const previousFileId = useRef<string | undefined | null>(null);
	useEffect(() => {
		if (fileId && fileId !== previousFileId.current) {
			setIsDialogOpen(true);
			setCroppedAreaPixels(null);
			setZoom(1);
			setCrop({ x: 0, y: 0 });
		}
		previousFileId.current = fileId;
	}, [fileId]);

	// Clean up blob URLs
	useEffect(() => {
		return () => {
			if (preview?.startsWith("blob:")) {
				URL.revokeObjectURL(preview);
			}
		};
	}, [preview]);

	// When value prop changes, update preview
	useEffect(() => {
		if (value) {
			const url = URL.createObjectURL(value);
			setPreview(url);
		} else {
			setPreview(null);
		}
	}, [value]);

	// Handle crop apply
	const handleApply = useCallback(async () => {
		if (!(previewUrl && fileId && croppedAreaPixels)) return;
		const croppedBlob = await getCroppedImg(
			previewUrl,
			croppedAreaPixels,
			160,
			160
		);
		if (!croppedBlob) return;
		if (preview) URL.revokeObjectURL(preview);
		const newUrl = URL.createObjectURL(croppedBlob);
		setPreview(newUrl);
		onChange(croppedBlob);
		setIsDialogOpen(false);
	}, [previewUrl, fileId, croppedAreaPixels, preview, onChange]);

	// Remove avatar
	const handleRemove = () => {
		if (preview) URL.revokeObjectURL(preview);
		setPreview(null);
		onChange(null);
		if (fileId) removeFile(fileId);
	};

	// Avatar shape classes
	const avatarClass = shape === "circle" ? "rounded-full" : "rounded-md";

	// Compute style for adaptive height
	const dropzoneStyle = height
		? {
				minHeight: typeof height === "number" ? `${height}px` : height,
				height: "100%",
			}
		: { minHeight: "120px" };

	return (
		<div className="flex h-full w-full flex-col items-center gap-2">
			<div className="h-full w-full flex-grow">
				<button
					aria-label={preview ? "Change image" : "Upload image"}
					className={`relative flex h-full w-full cursor-pointer flex-col items-center justify-center rounded-md border-2 border-input border-dashed bg-background outline-none transition-colors hover:bg-accent/50 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[dragging=true]:bg-accent/50 ${isDragging ? "ring-2 ring-primary" : ""}`}
					data-dragging={isDragging || undefined}
					onClick={openFileDialog}
					onDragEnter={handleDragEnter}
					onDragLeave={handleDragLeave}
					onDragOver={handleDragOver}
					onDrop={handleDrop}
					style={dropzoneStyle}
					type="button"
				>
					<div className="relative h-full w-full">
						{preview ? (
							<Avatar className={`h-20 w-20 ${avatarClass} mx-auto`}>
								<AvatarImage alt="Logo" src={preview} />
								<AvatarFallback>
									<CircleUserRoundIcon className="h-8 w-8 opacity-60" />
								</AvatarFallback>
							</Avatar>
						) : (
							<div className="flex flex-col items-center justify-center py-4">
								<CircleUserRoundIcon className="mb-2 h-10 w-10 opacity-60" />
								<span className="text-muted-foreground text-sm">
									Drag & drop or click to upload
								</span>
								<span className="text-muted-foreground text-xs">
									JPEG/PNG, max {maxSizeMB}MB
								</span>
							</div>
						)}
						{preview && (
							<button
								aria-label="Remove image"
								className="-top-2 -right-2 absolute flex h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-background shadow-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
								onClick={(e) => {
									e.stopPropagation();
									handleRemove();
								}}
								type="button"
							>
								<XIcon className="h-4 w-4" />
							</button>
						)}
					</div>
					<input
						{...getInputProps()}
						aria-label="Upload image file"
						className="sr-only"
						tabIndex={-1}
					/>
				</button>
			</div>
			{label && (
				<span className="mt-1 text-muted-foreground text-xs">{label}</span>
			)}
			{errors.length > 0 && (
				<div
					className="flex items-center gap-1 text-destructive text-xs"
					role="alert"
				>
					<XIcon className="size-3 shrink-0" />
					<span>{errors[0]}</span>
				</div>
			)}
			{/* Cropper Dialog */}
			<Dialog onOpenChange={setIsDialogOpen} open={isDialogOpen}>
				<DialogContent className="z-[10000] gap-0 p-0 sm:max-w-140 *:[button]:hidden">
					<DialogHeader className="contents space-y-0 text-left">
						<DialogTitle className="flex items-center justify-between border-b p-4 text-base">
							<span>Crop image</span>
							<Button
								autoFocus
								className="-my-1"
								disabled={!previewUrl}
								onClick={handleApply}
							>
								Apply
							</Button>
						</DialogTitle>
					</DialogHeader>
					{previewUrl && (
						<div className="relative h-72 w-full bg-black">
							<Cropper
								aspect={1}
								crop={crop}
								cropShape={shape === "circle" ? "round" : "rect"}
								image={previewUrl}
								onCropChange={setCrop}
								onCropComplete={(_, areaPixels) =>
									setCroppedAreaPixels(areaPixels)
								}
								onZoomChange={setZoom}
								showGrid={false}
								zoom={zoom}
							/>
						</div>
					)}
					<DialogFooter className="border-t px-4 py-6">
						<div className="mx-auto flex w-full max-w-80 items-center gap-4">
							<ZoomOutIcon
								aria-hidden="true"
								className="shrink-0 opacity-60"
								size={16}
							/>
							<Slider
								aria-label="Zoom slider"
								defaultValue={[1]}
								max={3}
								min={1}
								onValueChange={(value) => setZoom(value[0])}
								step={0.1}
								value={[zoom]}
							/>
							<ZoomInIcon
								aria-hidden="true"
								className="shrink-0 opacity-60"
								size={16}
							/>
						</div>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default AvatarUploader;
