import type { Customer } from "@/types/user";

export type QuotationStatus = "draft" | "pending" | "approved" | "rejected";

export interface VehicleDetails {
	vehicle_type: string;
	vehicle_usage: string;
	goods?: string;
	number_of_passengers?: number;
}

export interface Address {
	region: string;
	house_number: string;
	zone?: string;
	kebele?: string;
	woreda?: string;
}

export interface UserInfo {
	id: string | number; // Allow both string and number for backward compatibility
	email?: string;
	verified?: boolean;
	phone_number?: string;
	fin?: string;
	temporary_password?: string | null;
	roles?: string[];
	created_at?: string;
	updated_at?: string;
	customer?: Customer;
}

export interface CoverageType {
	id: string;
	name: string;
	description: string;
	insurance_type_id: string;
	insurance_type?: InsuranceType;
}

export interface InsuranceType {
	id: string;
	name: string;
	description: string;
	coverage_types: CoverageType[];
}

export interface VehiclePhotoUrls {
	front_view_photo_url: string | null;
	back_view_photo_url: string | null;
	left_view_photo_url?: string | null;
	right_view_photo_url?: string | null;
	engine_photo_url?: string | null;
	chassis_number_photo_url?: string | null;
	libre_photo_url?: string | null;
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
	// Add direct photo URL properties for easier access
	front_view_photo_url?: string | null;
	back_view_photo_url?: string | null;
	left_view_photo_url?: string | null;
	right_view_photo_url?: string | null;
	engine_photo_url?: string | null;
	chassis_number_photo_url?: string | null;
	libre_photo_url?: string | null;
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
	current_residence_address?: Address;
	vehicle_details?: VehicleDetails;
}

export interface CreateQuotationRequestPayload {
	user_id?: string;
	insurance_product_id: string;
	coverage_type_id: string;
	status: QuotationStatus;
	form_data?: QuotationFormData;
	vehicle_attributes: VehicleAttributes;
}

export interface Insurer {
	id: string;
	name: string;
	contact_email: string;
	contact_phone: string;
	// logo?: string; // If you want to support logo URLs
}

export interface InsuranceProduct {
	id: string;
	name: string;
	description: string;
	estimated_price?: string;
	customer_rating?: number;
	status: string;
	coverage_type?: CoverageType;
	insurer?: Insurer;
}

export interface QuotationRequest {
	id: string;
	status: QuotationStatus;
	form_data?: QuotationFormData;
	user_id: string;
	user: UserInfo;
	insurance_product_id: string;
	insurance_product?: InsuranceProduct;
	coverage_type_id: string;
	coverage_type: CoverageType;
	vehicle: Vehicle;
	created_at: string;
	updated_at: string;
	// Add missing properties
	insurance_type?: string;
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
