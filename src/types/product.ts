export interface InsuranceProduct {
	id: string;
	name: string;
	description: string;
	estimated_price: number;
	customer_rating: number | null;
	status: string; // Consider making this an enum if specific statuses are known
	coverage_type_id: string; // Consider making this a specific type if known
	insurer_id: string; // Assuming an insurer_id is associated with the product
	created_at: string;
	updated_at: string;
	coverage_type?: CoverageType & { insurance_type?: InsuranceType };
	insurer?: { id: string; name: string };
}

export interface CreateInsuranceProductPayload {
	name: string;
	description: string;
	estimated_price: number;
	customer_rating: number;
	status: string;
	coverage_type_id: string;
}

// Local Product type for form usage (frontend only)
export interface Product {
	id: string;
	name: string;
	insuranceType: string;
	coverageType: string;
	description: string;
	pricing: number;
}

export interface ComboboxOption {
	value: string;
	label: string;
}

export const insuranceTypeOptions: ComboboxOption[] = [
	{ value: "motor", label: "Motor" },
	{ value: "health", label: "Health" },
	{ value: "life", label: "Life" },
	{ value: "travel", label: "Travel" },
	{ value: "property", label: "Property" },
];

export const coverageTypeOptions: ComboboxOption[] = [
	{ value: "third_party", label: "Third Party" },
	{ value: "comprehensive", label: "Comprehensive" },
	{ value: "individual_basic", label: "Individual Basic" },
	{ value: "family_floater", label: "Family Floater" },
	{ value: "term_life_20", label: "Term Life 20 Years" },
	{ value: "whole_life", label: "Whole Life" },
];

export interface CoverageType {
	id: string;
	name: string;
	description: string;
}

export interface InsuranceType {
	id: string;
	name: string;
	description: string;
	coverage_types: CoverageType[];
}
