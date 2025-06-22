export interface InsuranceProduct {
	id: string;
	name: string;
	description: string;
	estimated_price: number;
	customer_rating: number;
	status: string; // Consider making this an enum if specific statuses are known
	coverage_type_id: string; // Consider making this a specific type if known
	insurer_id: string; // Assuming an insurer_id is associated with the product
	created_at: string;
	updated_at: string;
}

export interface CreateInsuranceProductPayload {
	name: string;
	description: string;
	estimated_price: number;
	customer_rating: number;
	status: string;
	coverage_type_id: string;
}
