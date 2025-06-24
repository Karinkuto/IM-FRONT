import type React from "react";
import type { QuotationRequest } from "@/types/quotation";

// Shared DescriptionItem for all cards
interface DescriptionItemProps {
	label: string;
	value: React.ReactNode;
}

function DescriptionItem({ label, value }: DescriptionItemProps) {
	return (
		<div className="flex flex-col">
			<p className="text-sm text-muted-foreground">{label}</p>
			<p className="font-medium text-lg">{value}</p>
		</div>
	);
}

// VehicleDetailsCard
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
					label="Chassis Number"
					value={vehicle.chassis_number}
				/>
				<DescriptionItem label="Engine Number" value={vehicle.engine_number} />
				<DescriptionItem
					label="Year of Manufacture"
					value={vehicle.year_of_manufacture}
				/>
				<DescriptionItem label="Make" value={vehicle.make} />
				<DescriptionItem label="Model" value={vehicle.model} />
				<DescriptionItem
					label="Estimated Value"
					value={vehicle.estimated_value}
				/>
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

// InsuranceDetailsCard
interface InsuranceDetailsCardProps {
	insuranceType: QuotationRequest["insurance_type"];
	coverageType: QuotationRequest["coverage_type"];
	coverageAmount: QuotationRequest["form_data"]["coverage_amount"];
	insuranceProduct?: QuotationRequest["insurance_product"];
}

export function InsuranceDetailsCard({
	insuranceType,
	coverageType,
	coverageAmount,
	insuranceProduct,
}: InsuranceDetailsCardProps) {
	const safeCoverageAmount = coverageAmount as number;
	return (
		<div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 space-y-4">
			<h3 className="text-xl font-semibold">Insurance Details</h3>
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<DescriptionItem label="Insurance Type" value={insuranceType.name} />
				<DescriptionItem label="Coverage Type" value={coverageType.name} />
				<DescriptionItem
					label="Coverage Amount"
					value={new Intl.NumberFormat("en-US", {
						style: "currency",
						currency: "ETB",
					}).format(safeCoverageAmount)}
				/>
				{insuranceProduct?.insurer?.name && (
					<DescriptionItem
						label="Insurer"
						value={insuranceProduct.insurer.name}
					/>
				)}
			</div>
		</div>
	);
}
