export type QuotationStatus =
	| "draft"
	| "pending"
	| "in_review"
	| "approved"
	| "rejected"
	| "completed";

export interface Address {
	id?: number;
	region: string;
	subcity?: string;
	woreda?: string;
	zone?: string;
	house_number?: string;
	kebele?: string;
}

export interface UserRiskProfile {
	account_age_days: number;
	verified_status: boolean;
	total_entities: number;
	total_policies: number;
	total_quotation_requests: number;
	has_active_policies: boolean;
}

export interface RequestSummary {
	request_type: string;
	entity_summary: string;
	user_risk_profile: UserRiskProfile;
	estimated_value: string;
	request_age_days: number;
	completeness_score: number;
}

export interface InsuranceType {
	id: number;
	name: string;
	description: string;
}

export interface CoverageType {
	id: number;
	name: string;
	description: string;
	insurance_type: InsuranceType;
}

export interface Insurer {
	id: number;
	name: string;
	description: string;
	contact_email: string;
	contact_phone: string;
}

export interface InsuranceProduct {
	id: number;
	name: string;
	description: string;
	estimated_price: string;
	customer_rating: number | null;
	status: string;
	coverage_type: CoverageType;
}

export interface Customer {
	id: number;
	full_name: string;
	first_name: string;
	middle_name: string;
	last_name: string;
	birthdate: string;
	age: number;
	gender: string;
	registration_address: {
		region: string;
		subcity: string;
		woreda: string;
	};
	current_address: Address;
	total_addresses: number;
}

export interface Role {
	id: number;
	name: string;
	created_at: string;
	updated_at: string;
}

export interface User {
	id: number;
	email: string | null;
	phone_number: string;
	verified: boolean;
	fin: string;
	roles: Role[];
	temporary_password: boolean;
	created_at: string;
	updated_at: string;
	customer: Customer;
}

export interface EntityType {
	id: number;
	name: string;
}

export interface Vehicle {
	id: number;
	plate_number: string;
	chassis_number: string;
	engine_number: string;
	year_of_manufacture: number;
	make: string;
	model: string;
	vehicle_type: string;
	usage_type: string;
	estimated_value: number | string;
	front_view_photo_url: string | null;
	back_view_photo_url: string | null;
	left_view_photo_url: string | null;
	right_view_photo_url: string | null;
	engine_photo_url: string | null;
	chassis_number_photo_url: string | null;
	libre_photo_url: string | null;
	entity_type: string;
	created_at: string;
	updated_at: string;
}

export interface PolicyHistory {
	total_policies: number;
	first_policy_date: string | null;
	last_policy_date?: string | null;
	claims_count: number;
	total_premiums_paid: string | number;
}

export interface Policy {
	id: number;
	policy_number: string;
	start_date: string;
	end_date: string;
	premium_amount: number | string;
	status: "active" | "expired" | "cancelled" | "pending";
	coverage_details: {
		coverage_type: string;
		coverage_limit: number | string;
		deductible: number | string;
	};
	created_at: string;
	updated_at: string;
}

export interface VehicleEntity {
	id: number;
	plate_number: string;
	chassis_number: string;
	engine_number: string;
	year_of_manufacture: number;
	make: string;
	model: string;
	estimated_value: string;
	front_view_photo_url: string | null;
	back_view_photo_url: string | null;
	left_view_photo_url: string | null;
	right_view_photo_url: string | null;
	engine_photo_url: string | null;
	chassis_number_photo_url: string | null;
	libre_photo_url: string | null;
}

export interface EntityData {
	type: "vehicle";
	vehicle: VehicleEntity;
}

export interface InsuredEntity {
	id: number;
	insurance_type: InsuranceType;
	entity: EntityData;
}

export interface QuotationFormData {
	additional_notes?: string;
	vehicle_details?: {
		vehicle_type?: string;
		vehicle_usage?: string;
		goods?: string;
		number_of_passengers?: string | number;
	};
	current_residence_address?: Address;
}

export interface QuotationRequest {
	id: number;
	status: QuotationStatus;
	form_data: QuotationFormData;
	created_at: string;
	updated_at: string;
	request_summary: RequestSummary;
	insurance_product: InsuranceProduct;
	coverage_type: CoverageType;
	user: User;
	insured_entity: InsuredEntity;
}

// For filtering
export interface QuotationFiltersType {
	status?: QuotationRequest["status"];
	insuranceType?: string;
	coverageType?: string;
	vehicleType?: string;
	region?: string;
	dateRange?: {
		from?: Date;
		to?: Date;
	};
}
