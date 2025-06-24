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
		<div className="space-y-4 w-full">
			<div className={containerClass}>
				{images.map((img) => {
					return img.url ? (
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
					) : (
						<div
							key={img.label}
							className="w-full h-80 bg-muted flex items-center justify-center rounded-lg border border-dashed border-gray-300"
						>
							<span className="text-gray-400 text-lg font-semibold">
								{img.label}
							</span>
						</div>
					);
				})}
			</div>
		</div>
	);
}
