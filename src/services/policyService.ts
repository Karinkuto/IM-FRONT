import type { Policy } from "@/types/policy";

export const mockPolicies: Policy[] = [
	{
		policyNumber: "POL-001",
		userPhoneNumber: "+1234567890",
		insuredEntity: "John Doe",
		coverageType: "Comprehensive",
		startDate: new Date("2024-01-01"),
		endDate: new Date("2025-01-01"),
		premiumAmount: 1200,
		status: "active",
	},
	{
		policyNumber: "POL-002",
		userPhoneNumber: "+1987654321",
		insuredEntity: "Jane Smith",
		coverageType: "Third Party",
		startDate: new Date("2023-12-01"),
		endDate: new Date("2024-12-01"),
		premiumAmount: 800,
		status: "active",
	},
	// Add more mock data as needed
];

export const fetchPolicies = (): Promise<Policy[]> => {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve(mockPolicies);
		}, 500);
	});
};

export const createPolicy = (newPolicy: Policy): Promise<Policy> => {
	return new Promise((resolve) => {
		setTimeout(() => {
			mockPolicies.push(newPolicy);
			resolve(newPolicy);
		}, 500);
	});
};

export const updatePolicy = (updatedPolicy: Policy): Promise<Policy> => {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			const index = mockPolicies.findIndex(
				(p) => p.policyNumber === updatedPolicy.policyNumber
			);
			if (index !== -1) {
				mockPolicies[index] = updatedPolicy;
				resolve(updatedPolicy);
			} else {
				reject(new Error("Policy not found"));
			}
		}, 500);
	});
};

export const deletePolicy = (policyNumber: string): Promise<boolean> => {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			const initialLength = mockPolicies.length;
			const newPolicies = mockPolicies.filter(
				(p) => p.policyNumber !== policyNumber
			);
			if (newPolicies.length < initialLength) {
				mockPolicies.splice(0, mockPolicies.length, ...newPolicies);
				resolve(true);
			} else {
				reject(new Error("Policy not found"));
			}
		}, 500);
	});
};
