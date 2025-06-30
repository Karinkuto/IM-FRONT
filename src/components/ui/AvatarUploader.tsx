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
	outputHeight: number = pixelCrop.height,
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
			outputHeight,
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
		if (!previewUrl || !fileId || !croppedAreaPixels) return;
		const croppedBlob = await getCroppedImg(
			previewUrl,
			croppedAreaPixels,
			160,
			160,
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
		<div className="flex flex-col items-center gap-2 h-full w-full">
			<div className="w-full h-full flex-grow">
				<button
					type="button"
					className={`relative flex flex-col items-center justify-center w-full h-full border-2 border-dashed border-input rounded-md transition-colors cursor-pointer bg-background hover:bg-accent/50 data-[dragging=true]:bg-accent/50 focus-visible:border-ring focus-visible:ring-ring/50 outline-none focus-visible:ring-[3px] ${isDragging ? "ring-2 ring-primary" : ""}`}
					style={dropzoneStyle}
					onClick={openFileDialog}
					onDragEnter={handleDragEnter}
					onDragLeave={handleDragLeave}
					onDragOver={handleDragOver}
					onDrop={handleDrop}
					data-dragging={isDragging || undefined}
					aria-label={preview ? "Change image" : "Upload image"}
				>
					<div className="relative w-full h-full">
						{preview ? (
							<Avatar className={`w-20 h-20 ${avatarClass} mx-auto`}>
								<AvatarImage src={preview} alt="Logo" />
								<AvatarFallback>
									<CircleUserRoundIcon className="w-8 h-8 opacity-60" />
								</AvatarFallback>
							</Avatar>
						) : (
							<div className="flex flex-col items-center justify-center py-4">
								<CircleUserRoundIcon className="w-10 h-10 mb-2 opacity-60" />
								<span className="text-sm text-muted-foreground">
									Drag & drop or click to upload
								</span>
								<span className="text-xs text-muted-foreground">
									JPEG/PNG, max {maxSizeMB}MB
								</span>
							</div>
						)}
						{preview && (
							<button
								onClick={(e) => {
									e.stopPropagation();
									handleRemove();
								}}
								className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-background shadow-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
								aria-label="Remove image"
								type="button"
							>
								<XIcon className="h-4 w-4" />
							</button>
						)}
					</div>
					<input
						{...getInputProps()}
						className="sr-only"
						aria-label="Upload image file"
						tabIndex={-1}
					/>
				</button>
			</div>
			{label && (
				<span className="text-xs text-muted-foreground mt-1">{label}</span>
			)}
			{errors.length > 0 && (
				<div
					className="text-destructive flex items-center gap-1 text-xs"
					role="alert"
				>
					<XIcon className="size-3 shrink-0" />
					<span>{errors[0]}</span>
				</div>
			)}
			{/* Cropper Dialog */}
			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogContent className="z-[10000] gap-0 p-0 sm:max-w-140 *:[button]:hidden">
					<DialogHeader className="contents space-y-0 text-left">
						<DialogTitle className="flex items-center justify-between border-b p-4 text-base">
							<span>Crop image</span>
							<Button
								className="-my-1"
								onClick={handleApply}
								disabled={!previewUrl}
								autoFocus
							>
								Apply
							</Button>
						</DialogTitle>
					</DialogHeader>
					{previewUrl && (
						<div className="relative h-72 w-full bg-black">
							<Cropper
								image={previewUrl}
								crop={crop}
								zoom={zoom}
								aspect={1}
								cropShape={shape === "circle" ? "round" : "rect"}
								showGrid={false}
								onCropChange={setCrop}
								onCropComplete={(_, areaPixels) =>
									setCroppedAreaPixels(areaPixels)
								}
								onZoomChange={setZoom}
							/>
						</div>
					)}
					<DialogFooter className="border-t px-4 py-6">
						<div className="mx-auto flex w-full max-w-80 items-center gap-4">
							<ZoomOutIcon
								className="shrink-0 opacity-60"
								size={16}
								aria-hidden="true"
							/>
							<Slider
								defaultValue={[1]}
								value={[zoom]}
								min={1}
								max={3}
								step={0.1}
								onValueChange={(value) => setZoom(value[0])}
								aria-label="Zoom slider"
							/>
							<ZoomInIcon
								className="shrink-0 opacity-60"
								size={16}
								aria-hidden="true"
							/>
						</div>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default AvatarUploader;
