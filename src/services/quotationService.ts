import type { QuotationRequest, QuotationStatus } from "@/types/quotation";
import { store } from "@/redux/store";
import axios from "axios";

const api = axios.create({
	baseURL: import.meta.env.VITE_BACKEND_URL,
	withCredentials: true,
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
	const state = store.getState();
	const token = state.auth.token;
	
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	
	return config;
});

interface ApiResponse<T> {
	success: boolean;
	data: T;
}

export const fetchQuotations = async (): Promise<QuotationRequest[]> => {
	try {
		const response = await api.get<ApiResponse<QuotationRequest[]>>("/quotation_requests/");
		
		if (!response.data.success) {
			throw new Error("API request failed");
		}
		
		return response.data.data;
	} catch (error) {
		console.error("Error fetching quotations:", error);
		throw error;
	}
};

export const fetchQuotationById = async (
	id: number,
): Promise<QuotationRequest | undefined> => {
	try {
		const response = await api.get<ApiResponse<QuotationRequest>>(`/quotation_requests/${id}`);
		
		if (!response.data.success) {
			throw new Error("API request failed");
		}
		
		return response.data.data;
	} catch (error) {
		if (axios.isAxiosError(error) && error.response?.status === 404) {
			return undefined;
		}
		console.error("Error fetching quotation:", error);
		throw error;
	}
};

export const updateQuotationStatus = async (
	id: number,
	status: QuotationStatus,
): Promise<QuotationRequest | undefined> => {
	try {
		const response = await api.patch<ApiResponse<QuotationRequest>>(
			`/quotation_requests/${id}`,
			{
				quotation_request: {
					status,
				},
			}
		);
		
		if (!response.data.success) {
			throw new Error("API request failed");
		}
		
		return response.data.data;
	} catch (error) {
		if (axios.isAxiosError(error) && error.response?.status === 404) {
			throw new Error("Quotation not found");
		}
		console.error("Error updating quotation status:", error);
		throw error;
	}
};
