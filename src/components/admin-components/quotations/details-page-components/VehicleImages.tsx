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
	if (!frontViewPhotoUrl && !backViewPhotoUrl) {
		return null;
	}

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
			url: leftViewPhotoUrl || frontViewPhotoUrl,
			label: "Left View",
		},
		{
			url: rightViewPhotoUrl || backViewPhotoUrl || frontViewPhotoUrl,
			label: "Right View",
		},
		{
			url: enginePhotoUrl || frontViewPhotoUrl,
			label: "Engine Photo",
		},
		{
			url: chassisNumberPhotoUrl || frontViewPhotoUrl,
			label: "Chassis Number Photo",
		},
		{
			url: librePhotoUrl || frontViewPhotoUrl,
			label: "Libre Photo",
		},
	];

	return (
		<div className="space-y-4">
			<div className={containerClass}>
				{images.map((img) =>
					img.url ? (
						<div
							key={img.label}
							className="group relative overflow-hidden rounded-lg"
						>
							<img
								src={img.url}
								alt={img.label}
								className="w-full h-80 object-cover transition-transform duration-300 group-hover:scale-105 rounded-lg"
							/>
							<div className="absolute inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg">
								<p className="text-white text-lg font-semibold">{img.label}</p>
							</div>
						</div>
					) : null,
				)}
			</div>
		</div>
	);
}
