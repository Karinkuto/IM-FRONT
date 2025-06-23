import type { QuotationRequest, QuotationStatus } from "@/types/quotation";

export const mockQuotations: QuotationRequest[] = [
	{
		id: "1",
		status: "pending",
		form_data: {
			coverage_amount: 5000,
			vehicle_details: {
				vehicle_type: "Sedan",
				vehicle_usage: "Personal",
			},
			current_residence_address: {
				region: "Addis Ababa",
				house_number: "123",
			},
		},
		user_id: "u1",
		insurance_product_id: "ip1",
		coverage_type_id: "ct1",
		user: {
			phone_number: "+251912345678",
			fin: "123456789",
		},
		insurance_type: {
			name: "Motor",
		},
		coverage_type: {
			name: "Comprehensive",
		},
		vehicle: {
			id: "v1",
			plate_number: "ABC123",
			chassis_number: "CH123",
			engine_number: "EN123",
			make: "Toyota",
			model: "Corolla",
			year_of_manufacture: 2020,
			estimated_value: 10000,
			photos: {
				front_view_photo_url: "/front.png",
				back_view_photo_url: "/back.png",
			},
		},
		created_at: "2024-01-01T00:00:00Z",
		updated_at: "2024-01-01T00:00:00Z",
	},
	{
		id: "2",
		status: "approved",
		form_data: {
			coverage_amount: 7500,
			vehicle_details: {
				vehicle_type: "SUV",
				vehicle_usage: "Commercial",
			},
			current_residence_address: {
				region: "Oromia",
				house_number: "456",
			},
		},
		user_id: "u2",
		insurance_product_id: "ip2",
		coverage_type_id: "ct2",
		user: {
			phone_number: "+251923456789",
			fin: "987654321",
		},
		insurance_type: {
			name: "Motor",
		},
		coverage_type: {
			name: "Third Party",
		},
		vehicle: {
			id: "v2",
			plate_number: "XYZ789",
			chassis_number: "CH456",
			engine_number: "EN456",
			make: "Hyundai",
			model: "Santa Fe",
			year_of_manufacture: 2021,
			estimated_value: 20000,
			photos: {
				front_view_photo_url: "/front.png",
				back_view_photo_url: "/back.png",
			},
		},
		created_at: "2024-01-02T00:00:00Z",
		updated_at: "2024-01-02T00:00:00Z",
	},
	{
		id: "3",
		status: "rejected",
		form_data: {
			coverage_amount: 1000,
			vehicle_details: {
				vehicle_type: "Motorcycle",
				vehicle_usage: "Personal",
			},
			current_residence_address: {
				region: "Amhara",
				house_number: "789",
			},
		},
		user_id: "u3",
		insurance_product_id: "ip3",
		coverage_type_id: "ct3",
		user: {
			phone_number: "+251934567890",
			fin: "112233445",
		},
		insurance_type: {
			name: "Motor",
		},
		coverage_type: {
			name: "Comprehensive",
		},
		vehicle: {
			id: "v3",
			plate_number: "MCL456",
			chassis_number: "CH789",
			engine_number: "EN789",
			make: "Honda",
			model: "CBR",
			year_of_manufacture: 2019,
			estimated_value: 5000,
			photos: {
				front_view_photo_url: "/front.png",
				back_view_photo_url: "/back.png",
			},
		},
		created_at: "2024-01-03T00:00:00Z",
		updated_at: "2024-01-03T00:00:00Z",
	},
	{
		id: "4",
		status: "draft",
		form_data: {
			coverage_amount: 20000,
			vehicle_details: {
				vehicle_type: "Truck",
				vehicle_usage: "Commercial",
			},
			current_residence_address: {
				region: "Tigray",
				house_number: "101",
			},
		},
		user_id: "u4",
		insurance_product_id: "ip4",
		coverage_type_id: "ct4",
		user: {
			phone_number: "+251945678901",
			fin: "667788990",
		},
		insurance_type: {
			name: "Motor",
		},
		coverage_type: {
			name: "Third Party",
		},
		vehicle: {
			id: "v4",
			plate_number: "TRK777",
			chassis_number: "CH101",
			engine_number: "EN101",
			make: "Isuzu",
			model: "NPR",
			year_of_manufacture: 2018,
			estimated_value: 30000,
			photos: {
				front_view_photo_url: "/front.png",
				back_view_photo_url: "/back.png",
			},
		},
		created_at: "2024-01-04T00:00:00Z",
		updated_at: "2024-01-04T00:00:00Z",
	},
];

export const fetchQuotations = (): Promise<QuotationRequest[]> => {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve(mockQuotations);
		}, 500);
	});
};

export const fetchQuotationById = (
	id: string,
): Promise<QuotationRequest | undefined> => {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve(mockQuotations.find((q) => q.id === id));
		}, 500);
	});
};

export const updateQuotationStatus = (
	id: string,
	status: QuotationStatus,
): Promise<QuotationRequest | undefined> => {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			const quotationIndex = mockQuotations.findIndex((q) => q.id === id);
			if (quotationIndex !== -1) {
				mockQuotations[quotationIndex] = {
					...mockQuotations[quotationIndex],
					status,
				};
				resolve(mockQuotations[quotationIndex]);
			} else {
				reject(new Error("Quotation not found"));
			}
		}, 500);
	});
};
