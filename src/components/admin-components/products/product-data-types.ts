// Define the Product type based on Requirement.md
export interface Product {
	id: string; // Or number, depending on your API
	insuranceType: string;
	insuranceTypeId: string;
	coverageType: string; // This will also serve as the Title
	coverageTypeId: string;
	description: string;
	pricing: number;
}

// Options for Comboboxes
export interface ComboboxOption {
	value: string;
	label: string;
}

// TODO: Coverage types might be dependent on selected insurance type in a real app
export const insuranceTypeOptions: ComboboxOption[] = [
	{ value: "motor", label: "Motor" },
	{ value: "health", label: "Health" },
	{ value: "life", label: "Life" },
	{ value: "travel", label: "Travel" },
	{ value: "property", label: "Property" },
];
