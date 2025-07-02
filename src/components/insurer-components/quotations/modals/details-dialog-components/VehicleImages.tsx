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
							<img
								alt={img.label}
								className="h-80 w-full rounded-lg object-cover transition-transform duration-300 group-hover:scale-105"
								src={img.url}
							/>
							<div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/30 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
								<p className="font-semibold text-lg text-white">{img.label}</p>
							</div>
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
