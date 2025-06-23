import { DescriptionItem } from "@/components/shared/DescriptionItem";
import type { QuotationRequest } from "@/types/quotation";

interface VehicleDetailsCardProps {
	vehicle: QuotationRequest["vehicle"];
	formData: QuotationRequest["form_data"];
}

export function VehicleDetailsCard({
	vehicle,
	formData,
}: VehicleDetailsCardProps) {
	const vehicleDetails = formData.vehicle_details as {
		vehicle_type: string;
		vehicle_usage: string;
	};

	return (
		<div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 space-y-4">
			<h3 className="text-xl font-semibold">Vehicle Details</h3>
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<DescriptionItem label="Plate Number" value={vehicle.plate_number} />
				<DescriptionItem
					label="Vehicle Type"
					value={vehicleDetails.vehicle_type}
				/>
				<DescriptionItem
					label="Vehicle Usage"
					value={vehicleDetails.vehicle_usage}
				/>
			</div>
		</div>
	);
}
