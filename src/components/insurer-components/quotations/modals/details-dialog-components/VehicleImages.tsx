import { AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface VehicleImagesProps {
	frontViewPhotoUrl: string | null;
	backViewPhotoUrl: string | null;
	leftViewPhotoUrl?: string | null;
	rightViewPhotoUrl?: string | null;
	enginePhotoUrl?: string | null;
	chassisNumberPhotoUrl?: string | null;
	librePhotoUrl?: string | null;
	stacked?: boolean;
}

export function VehicleImages({
	frontViewPhotoUrl,
	backViewPhotoUrl,
	leftViewPhotoUrl = null,
	rightViewPhotoUrl = null,
	enginePhotoUrl = null,
	chassisNumberPhotoUrl = null,
	librePhotoUrl = null,
	stacked = false,
}: VehicleImagesProps) {
	const containerClass = stacked
		? "flex flex-col gap-6 w-full"
		: "grid grid-cols-1 gap-6 sm:grid-cols-2";

	const images = [
		{
			url: frontViewPhotoUrl,
			label: "Front View",
		},
		{
			url: backViewPhotoUrl,
			label: "Back View",
		},
		{
			url: leftViewPhotoUrl,
			label: "Left View",
		},
		{
			url: rightViewPhotoUrl,
			label: "Right View",
		},
		{
			url: enginePhotoUrl,
			label: "Engine Photo",
		},
		{
			url: chassisNumberPhotoUrl,
			label: "Chassis Number Photo",
		},
		{
			url: librePhotoUrl,
			label: "Libre Photo",
		},
	];

	return (
		<div className="w-full space-y-4">
			<div className={containerClass}>
				{images.map((img) => {
					return img.url ? (
						<div
							className="group relative overflow-hidden rounded-lg"
							key={img.label}
						>
							<AvatarImage
								alt={img.label}
								className="h-80 w-full rounded-lg object-cover transition-transform duration-300"
								src={img.url}
							/>
							<Badge
								className="absolute top-2 left-2 z-10 rounded bg-black/70 px-2 py-1 text-white text-xs"
								variant="secondary"
							>
								{img.label}
							</Badge>
						</div>
					) : (
						<div
							className="flex h-80 w-full items-center justify-center rounded-lg border border-gray-300 border-dashed bg-muted"
							key={img.label}
						>
							<span className="font-semibold text-gray-400 text-lg">
								{img.label}
							</span>
						</div>
					);
				})}
			</div>
		</div>
	);
}
