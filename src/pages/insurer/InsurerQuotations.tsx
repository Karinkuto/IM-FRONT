import { Filter } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { QuotationFilterDialog } from "@/components/insurer-components/quotations/QuotationFilterDialog";
import { QuotationRequestsTable } from "@/components/insurer-components/quotations/QuotationRequestsTable";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
	useGetQuotationRequestsQuery,
	useUpdateQuotationRequestMutation,
} from "@/redux/apis/quotationApi";
import type {
	QuotationFilters as QuotationFiltersType,
	QuotationRequest,
} from "@/types/quotation";

interface CustomError {
	error: {
		status?: number;
		data: string;
	};
}

export default function AdminQuotations() {
	const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
	const [currentFilters, setCurrentFilters] = useState<QuotationFiltersType>(
		{},
	);

	const navigate = useNavigate();

	const {
		data: quotationsData,
		isLoading,
		error,
		refetch,
	} = useGetQuotationRequestsQuery({
		page: 1, // You might want to manage pagination state here
		per_page: 10, // And per_page state
		status: currentFilters.status,
		insurance_type: currentFilters.insuranceType,
		coverage_type: currentFilters.coverageType,
		vehicle_type: currentFilters.vehicleType,
		region: currentFilters.region,
	});

	const [updateQuotationStatus] = useUpdateQuotationRequestMutation();

	const applyFilters = (data: QuotationFiltersType) => {
		setCurrentFilters(data);
		// refetch with new filters
		refetch();
		setIsFilterDialogOpen(false);
	};

	const handleViewDetails = (quotationId: string) => {
		console.log("Viewing details for quotation:", quotationId);
		navigate(`/admin/quotation-requests/${quotationId}`);
	};

	const handleStatusChange = async (
		quotationId: string,
		newStatus: QuotationRequest["status"],
	) => {
		try {
			await updateQuotationStatus({
				id: quotationId,
				payload: { status: newStatus },
			}).unwrap();
			console.log(`Quotation ${quotationId} status updated to ${newStatus}`);
		} catch (err) {
			console.error("Failed to update quotation status:", err);
		}
	};

	if (isLoading) {
		return <LoadingSpinner />;
	}

	if (error) {
		const errorMessage =
			(error as CustomError).error?.data || "An unexpected error occurred.";
		return (
			<div className="flex justify-center items-center h-full min-h-[calc(100vh-80px)] text-red-500">
				<p className="text-lg font-medium">Error: {errorMessage}</p>
			</div>
		);
	}

	const quotations = quotationsData?.data || [];

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-start">
				<div>
					<h1 className="text-2xl font-bold">Quotation Requests</h1>
					<p className="text-muted-foreground text-sm">
						View and manage all incoming insurance quotation requests.
					</p>
				</div>
			</div>

			<QuotationRequestsTable
				quotations={quotations}
				onViewDetails={handleViewDetails}
				onStatusChange={handleStatusChange}
				toolbarActionsPrefix={
					<Button onClick={() => setIsFilterDialogOpen(true)} variant="outline">
						<Filter className="mr-2 h-4 w-4" /> Filter
					</Button>
				}
			/>

			<QuotationFilterDialog
				isOpen={isFilterDialogOpen}
				onOpenChange={setIsFilterDialogOpen}
				onApplyFilters={applyFilters}
				currentFilters={currentFilters}
			/>
		</div>
	);
}
