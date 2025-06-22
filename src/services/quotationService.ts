import type { QuotationRequest, QuotationStatus } from "@/types/quotation";

export const mockQuotations: QuotationRequest[] = [
	{
		id: 1,
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
			plate_number: "ABC123",
			photos: {
				front_view_photo_url: "/front.png",
				back_view_photo_url: "/back.png",
			},
		},
	},
	{
		id: 2,
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
			plate_number: "XYZ789",
			photos: {
				front_view_photo_url: "/front.png",
				back_view_photo_url: "/back.png",
			},
		},
	},
	{
		id: 3,
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
			plate_number: "MCL456",
			photos: {
				front_view_photo_url: "/front.png",
				back_view_photo_url: "/back.png",
			},
		},
	},
	{
		id: 4,
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
			plate_number: "TRK777",
			photos: {
				front_view_photo_url: "/front.png",
				back_view_photo_url: "/back.png",
			},
		},
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
	id: number,
): Promise<QuotationRequest | undefined> => {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve(mockQuotations.find((q) => q.id === id));
		}, 500);
	});
};

export const updateQuotationStatus = (
	id: number,
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
