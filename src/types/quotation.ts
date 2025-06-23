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
}

export interface CoverageType {
	id: string;
	name: string;
	description: string;
	insurance_type_id: string;
}

export interface InsuranceType {
	id: string;
	name: string;
	description: string;
	coverage_types: CoverageType[];
}

export interface VehiclePhotoUrls {
	front_view_photo_url: string;
	back_view_photo_url: string;
	left_view_photo_url?: string;
	right_view_photo_url?: string;
	engine_photo_url?: string;
	chassis_number_photo_url?: string;
	libre_photo_url?: string;
}

export interface Vehicle {
	id: string;
	plate_number: string;
	chassis_number: string;
	engine_number: string;
	make: string;
	model: string;
	year_of_manufacture: number;
	estimated_value: number;
	photos: VehiclePhotoUrls;
}

export interface VehicleAttributes {
	plate_number: string;
	chassis_number: string;
	engine_number: string;
	make: string;
	model: string;
	year_of_manufacture: number;
	estimated_value: number;
	front_view_photo?: File;
	back_view_photo?: File;
	left_view_photo?: File;
	right_view_photo?: File;
	engine_photo?: File;
	chassis_number_photo?: File;
	libre_photo?: File;
}

export interface QuotationFormData {
	// This can be expanded based on specific form data requirements
	[key: string]: unknown;
}

export interface CreateQuotationRequestPayload {
	user_id?: string;
	insurance_product_id: string;
	coverage_type_id: string;
	status: QuotationStatus;
	form_data?: QuotationFormData;
	vehicle_attributes: VehicleAttributes;
}

export interface QuotationRequest {
	id: string;
	status: QuotationStatus;
	form_data: QuotationFormData;
	user_id: string;
	user: UserInfo;
	insurance_product_id: string;
	insurance_type: InsuranceType;
	coverage_type_id: string;
	coverage_type: CoverageType;
	vehicle: Vehicle;
	created_at: string;
	updated_at: string;
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
