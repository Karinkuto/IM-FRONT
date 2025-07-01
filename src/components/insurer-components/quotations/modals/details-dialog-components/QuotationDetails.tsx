import type React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Rating } from "@/components/ui/rating";
import type {
	Address,
	InsuranceType,
	QuotationRequest,
} from "@/types/quotation";

// Shared DescriptionItem for all cards
interface DescriptionItemProps {
	label: string;
	value: React.ReactNode;
}

function DescriptionItem({ label, value }: DescriptionItemProps) {
	return (
		<div className="flex flex-col space-y-0.5">
			<span className="text-sm text-muted-foreground">{label}</span>
			<span className="text-base font-medium text-foreground">{value}</span>
		</div>
	);
}

// Add a simple divider component for visual separation
function CardDivider() {
	return <div className="my-2 border-t border-muted" />;
}

// AddressInformationCard
interface AddressInformationCardProps {
	address?: Address;
}

function AddressInformationCard({ address }: AddressInformationCardProps) {
	return (
		<div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 flex flex-col gap-4">
			<div className="flex items-center gap-3 mb-2">
				<h3 className="text-xl font-semibold">Address Information</h3>
			</div>
			<CardDivider />
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
				<DescriptionItem
					label="Region"
					value={address?.region ? String(address.region) : "-"}
				/>
				<DescriptionItem
					label="Zone"
					value={address?.zone ? String(address.zone) : "-"}
				/>
				<DescriptionItem
					label="Woreda"
					value={address?.woreda ? String(address.woreda) : "-"}
				/>
				<DescriptionItem
					label="Kebele"
					value={address?.kebele ? String(address.kebele) : "-"}
				/>
			</div>
		</div>
	);
}

// VehicleDetailsCard
interface VehicleDetailsCardProps {
	vehicle?: QuotationRequest["insured_entity_data"];
	formData?: QuotationRequest["form_data"];
}

function VehicleDetailsCard({ vehicle, formData }: VehicleDetailsCardProps) {
	const vehicleDetails = formData?.vehicle_details;

	if (!vehicle && !vehicleDetails) {
		return (
			<div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
				<p className="text-muted-foreground">No vehicle details available.</p>
			</div>
		);
	}

	return (
		<div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 flex flex-col gap-4">
			<div className="flex items-center gap-3 mb-2">
				<h3 className="text-xl font-semibold">Vehicle Details</h3>
			</div>
			<CardDivider />
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
				<DescriptionItem label="Make" value={vehicle?.make ?? "-"} />
				<DescriptionItem label="Model" value={vehicle?.model ?? "-"} />
				<DescriptionItem
					label="Year"
					value={vehicle?.year_of_manufacture ?? "-"}
				/>
				<DescriptionItem
					label="Plate Number"
					value={vehicle?.plate_number ?? "-"}
				/>
				<DescriptionItem
					label="Chassis Number"
					value={vehicle?.chassis_number ?? "-"}
				/>
				<DescriptionItem
					label="Engine Number"
					value={vehicle?.engine_number ?? "-"}
				/>
				<DescriptionItem
					label="Estimated Value"
					value={
						vehicle?.estimated_value
							? new Intl.NumberFormat("en-US", {
									style: "currency",
									currency: "ETB",
								}).format(Number(vehicle.estimated_value))
							: "-"
					}
				/>
				<DescriptionItem
					label="Vehicle Type"
					value={vehicleDetails?.vehicle_type ?? vehicle?.vehicle_type ?? "-"}
				/>
				<DescriptionItem
					label="Vehicle Usage"
					value={vehicleDetails?.vehicle_usage ?? vehicle?.usage_type ?? "-"}
				/>
				<DescriptionItem label="Goods" value={vehicleDetails?.goods ?? "-"} />
				<DescriptionItem
					label="Number of Passengers"
					value={vehicleDetails?.number_of_passengers ?? "-"}
				/>
			</div>
		</div>
	);
}

// CustomerProfileCard
interface CustomerProfileCardProps {
	user?: QuotationRequest["user"] & {
		fin?: string | null;
		customer?: {
			first_name?: string;
			middle_name?: string;
			last_name?: string;
			region?: string;
			subcity?: string;
			woreda?: string;
			registration_address?: {
				region: string;
				subcity: string;
				woreda: string;
			};
		};
	};
}

function CustomerProfileCard({ user }: CustomerProfileCardProps) {
	if (!user) {
		return (
			<div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
				<p className="text-muted-foreground">No user information available.</p>
			</div>
		);
	}
	const customer = user.customer;
	const fullName = customer
		? [customer.first_name, customer.middle_name, customer.last_name]
				.filter(Boolean)
				.join(" ")
		: user.email?.split("@")[0] || "-";
	const initials = fullName
		.split(" ")
		.map((n: string) => n[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);

	return (
		<div className="rounded-lg border bg-card text-card-foreground shadow-sm p-0 overflow-hidden">
			{/* Profile Header: Avatar, Name, Status */}
			<div className="flex flex-col sm:flex-row items-center gap-6 p-6 pb-4">
				<Avatar className="h-20 w-20 rounded-md border-2 border-primary/20 shadow-sm">
					<AvatarFallback className="text-2xl">{initials}</AvatarFallback>
				</Avatar>
				<div className="flex-1 flex flex-col gap-2 mt-4 sm:mt-0 items-center sm:items-start">
					<div className="flex items-center gap-2">
						<p className="text-xl font-semibold leading-tight truncate">
							{fullName}
						</p>
						{user.verified !== undefined && (
							<Badge
								variant={user.verified ? "status-approved" : "status-pending"}
							>
								{user.verified ? "Verified" : "Not Verified"}
							</Badge>
						)}
					</div>
				</div>
			</div>

			{/* Personal Information Section */}
			<div className="px-6 py-4">
				<h4 className="text-lg font-semibold mb-2">Personal Information</h4>
				<div className="grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-4">
					<DescriptionItem label="FIN" value={user.fin ?? "-"} />
					<DescriptionItem label="Gender" value={customer?.gender ?? "-"} />
					<DescriptionItem
						label="Date of Birth"
						value={customer?.birthdate ?? "-"}
					/>
				</div>
			</div>

			<CardDivider />

			{/* Address Information Section */}
			{customer && (
				<div className="px-6 py-4">
					<h4 className="text-lg font-semibold mb-2">Address Information</h4>
					<div className="grid grid-cols-1 sm:grid-cols-4 gap-x-8 gap-y-4 text-muted-foreground">
						<DescriptionItem
							label="Region"
							value={
								customer.registration_address?.region ?? customer.region ?? "-"
							}
						/>
						<DescriptionItem
							label="Subcity"
							value={
								customer.registration_address?.subcity ??
								customer.subcity ??
								"-"
							}
						/>
						<DescriptionItem
							label="Woreda"
							value={
								customer.registration_address?.woreda ?? customer.woreda ?? "-"
							}
						/>
					</div>
				</div>
			)}

			<CardDivider />

			{/* Contact Information Section */}
			<div className="px-6 py-4">
				<h4 className="text-lg font-semibold mb-2">Contact Information</h4>
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
					<DescriptionItem
						label="Email"
						value={
							user.email ?? <span className="text-muted-foreground">N/A</span>
						}
					/>
					<DescriptionItem label="Phone" value={user.phone_number ?? "-"} />
				</div>
			</div>

			{/* Roles Section */}
			{user.roles && user.roles.length > 0 && (
				<>
					<CardDivider />
					<div className="px-6 py-4">
						<h4 className="text-lg font-semibold mb-2">Roles</h4>
						<DescriptionItem label="Roles" value={user.roles.join(", ")} />
					</div>
				</>
			)}
		</div>
	);
}

// ProductDetailsCard
interface ProductDetailsCardProps {
	insuranceProduct?: QuotationRequest["insurance_product"];
	insuranceType?: InsuranceType;
	coverageType: QuotationRequest["coverage_type"];
}

function ProductDetailsCard({
	insuranceProduct,
	insuranceType,
	coverageType,
}: ProductDetailsCardProps) {
	return (
		<div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 flex flex-col gap-4">
			<div className="flex items-center gap-3 mb-2">
				<h3 className="text-xl font-semibold">Product Details</h3>
				{insuranceProduct?.status && (
					<Badge
						variant={
							insuranceProduct.status === "active"
								? "status-approved"
								: insuranceProduct.status === "pending"
									? "status-pending"
									: "status-draft"
						}
					>
						{insuranceProduct.status.charAt(0).toUpperCase() +
							insuranceProduct.status.slice(1)}
					</Badge>
				)}
			</div>
			<CardDivider />
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
				<DescriptionItem
					label="Product Name"
					value={insuranceProduct?.name ?? "-"}
				/>
				<DescriptionItem
					label="Description"
					value={insuranceProduct?.description ?? "-"}
				/>
				<DescriptionItem
					label="Insurer"
					value={insuranceProduct?.insurer?.name ?? "-"}
				/>
				<DescriptionItem
					label="Estimated Price"
					value={
						insuranceProduct?.estimated_price !== undefined &&
						Number(insuranceProduct.estimated_price) > 0
							? new Intl.NumberFormat("en-US", {
									style: "currency",
									currency: "ETB",
								}).format(Number(insuranceProduct.estimated_price))
							: "-"
					}
				/>
				<DescriptionItem
					label="Insurance Type"
					value={insuranceType?.name ?? "-"}
				/>
				<DescriptionItem
					label="Coverage Type"
					value={coverageType?.name ?? "-"}
				/>
				<span className="flex items-center gap-2 col-span-1 sm:col-span-2">
					<span className="text-sm text-muted-foreground">Customer Rating</span>
					{insuranceProduct?.customer_rating !== undefined &&
					insuranceProduct?.customer_rating !== null ? (
						<Rating
							rating={insuranceProduct.customer_rating}
							showValue
							size="sm"
						/>
					) : (
						<span className="text-xs text-gray-400">No ratings yet</span>
					)}
				</span>
			</div>
		</div>
	);
}

interface QuotationDetailsProps {
	quotation: QuotationRequest;
}

export default function QuotationDetails({ quotation }: QuotationDetailsProps) {
	return (
		<div className="flex flex-col gap-8 mt-6">
			<CustomerProfileCard user={quotation.user} />
			<ProductDetailsCard
				insuranceProduct={quotation.insurance_product}
				insuranceType={quotation.coverage_type?.insurance_type}
				coverageType={quotation.coverage_type}
			/>
			<VehicleDetailsCard
				vehicle={quotation.insured_entity_data}
				formData={quotation.form_data}
			/>
			<AddressInformationCard
				address={quotation.form_data?.current_residence_address}
			/>
		</div>
	);
}
