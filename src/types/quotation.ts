export type QuotationStatus = "draft" | "pending" | "approved" | "rejected";

export interface VehicleDetails {
	vehicle_type: string;
	vehicle_usage: string;
}

export interface Address {
	region: string;
	house_number: string;
}

export interface UserInfo {
	phone_number: string;
	fin: string;
	name?: string;
}

export interface InsuranceType {
	name: string;
}

export interface CoverageType {
	name: string;
}

export interface Vehicle {
	plate_number: string;
	front_view_photo_url: string;
	back_view_photo_url: string;
}

export interface QuotationFormData {
	coverage_amount: number;
	vehicle_details: VehicleDetails;
	current_residence_address: Address;
}

export interface QuotationRequest {
	id: number;
	status: QuotationStatus;
	form_data: QuotationFormData;
	user: UserInfo;
	insurance_type: InsuranceType;
	coverage_type: CoverageType;
	vehicle: Vehicle;
}

// For filtering
export interface QuotationFilters {
	status?: QuotationStatus;
	insuranceType?: string;
	coverageType?: string;
	dateRange?: {
		from: Date;
		to: Date;
	};
	vehicleType?: string;
	region?: string;
}
