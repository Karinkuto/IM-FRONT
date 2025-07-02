import { Filter, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { QuotationFilterDialog } from "@/components/insurer-components/quotations/QuotationFilterDialog";
import { QuotationRequestsTable } from "@/components/insurer-components/quotations/QuotationRequestsTable";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
	useGetQuotationRequestsQuery,
	useUpdateQuotationRequestMutation,
} from "@/redux/apis/quotationApi";
import type { QuotationFiltersType, QuotationRequest } from "@/types/quotation";

interface CustomError {
	error: {
		status?: number;
		data: string;
	};
}

export default function InsurerQuotations() {
	const [searchParams, setSearchParams] = useSearchParams();
	const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);

	// Parse filters from URL
	const getFiltersFromParams = (): QuotationFiltersType => {
		const params = Object.fromEntries(searchParams.entries());
		const filters: QuotationFiltersType = {};

		if (params.status)
			filters.status = params.status as QuotationRequest["status"];
		if (params.insuranceType) filters.insuranceType = params.insuranceType;
		if (params.coverageType) filters.coverageType = params.coverageType;
		if (params.vehicleType) filters.vehicleType = params.vehicleType;
		if (params.region) filters.region = params.region;

		if (params.fromDate || params.toDate) {
			filters.dateRange = {
				from: params.fromDate ? new Date(params.fromDate) : undefined,
				to: params.toDate ? new Date(params.toDate) : undefined,
			};
		}

		return filters;
	};

	const [currentFilters, setCurrentFilters] = useState<QuotationFiltersType>(
		getFiltersFromParams()
	);

	// Update URL when filters change
	useEffect(() => {
		const params = new URLSearchParams();

		Object.entries(currentFilters).forEach(([key, value]) => {
			if (key === "dateRange" && value) {
				const { from, to } = value as { from?: Date; to?: Date };
				if (from) params.set("fromDate", from.toISOString().split("T")[0]);
				if (to) params.set("toDate", to.toISOString().split("T")[0]);
			} else if (value) {
				params.set(key, String(value));
			}
		});

		setSearchParams(params);
	}, [currentFilters, setSearchParams]);

	// RTK Query hook with filters
	// Define the query parameters type
	type QuotationQueryParams = {
		status?: string;
		insurance_type?: string;
		coverage_type?: string;
		vehicle_type?: string;
		region?: string;
		start_date?: string;
		end_date?: string;
		page?: number;
		per_page?: number;
	};

	const queryParams: QuotationQueryParams = {
		status: currentFilters.status,
		insurance_type: currentFilters.insuranceType,
		coverage_type: currentFilters.coverageType,
		vehicle_type: currentFilters.vehicleType,
		region: currentFilters.region,
		start_date: currentFilters.dateRange?.from?.toISOString().split("T")[0],
		end_date: currentFilters.dateRange?.to?.toISOString().split("T")[0],
		page: 1,
		per_page: 10,
	};

	const {
		data: quotationsData,
		isLoading,
		isError,
		error,
		refetch,
	} = useGetQuotationRequestsQuery(queryParams);

	const [updateQuotationStatus] = useUpdateQuotationRequestMutation();

	const applyFilters = (filters: QuotationFiltersType) => {
		setCurrentFilters(filters);
		setIsFilterDialogOpen(false);
	};

	const clearFilters = () => {
		setCurrentFilters({});
	};

	const handleViewDetails = (quotationId: number) => {
		// Navigate to quotation detail page
		window.open(`/insurer/quotation-requests/${quotationId}`, "_blank");
	};

	const handleStatusChange = async (
		quotationId: number,
		newStatus: QuotationRequest["status"]
	) => {
		try {
			await updateQuotationStatus({
				id: quotationId,
				payload: { status: newStatus },
			}).unwrap();

			toast.success(`Quotation ${newStatus} successfully`);

			refetch();
		} catch (err) {
			const errorMessage =
				(err as CustomError)?.error?.data ||
				"Failed to update quotation status";
			toast.error(errorMessage);
		}
	};

	const hasActiveFilters = Object.keys(currentFilters).length > 0;
	const quotations = quotationsData?.data || [];

	if (isLoading) {
		return (
			<div className="flex h-[calc(100vh-200px)] items-center justify-center">
				<LoadingSpinner />
			</div>
		);
	}

	if (isError) {
		const errorMessage =
			(error as CustomError)?.error?.data || "An unexpected error occurred.";
		return (
			<div className="flex h-[calc(100vh-200px)] flex-col items-center justify-center p-4 text-center">
				<div className="mb-4 text-red-500">
					<X className="h-12 w-12" />
				</div>
				<h2 className="mb-2 font-semibold text-xl">Error Loading Quotations</h2>
				<p className="mb-4 text-muted-foreground">{errorMessage}</p>
				<Button onClick={() => refetch()} variant="outline">
					Retry
				</Button>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="font-bold text-2xl">Quotation Requests</h1>
				<p className="text-muted-foreground text-sm">
					View and manage all incoming insurance quotation requests
					{quotationsData?.meta?.total_count
						? ` (${quotationsData.meta.total_count})`
						: ""}
				</p>
			</div>

			<QuotationRequestsTable
				onStatusChange={handleStatusChange}
				onViewDetails={handleViewDetails}
				quotations={quotations}
				toolbarActionsPrefix={
					<div className="flex items-center gap-2">
						{hasActiveFilters && (
							<Button
								className="text-muted-foreground hover:bg-transparent hover:text-foreground"
								onClick={clearFilters}
								size="sm"
								variant="ghost"
							>
								Clear filters
								<X className="ml-2 h-4 w-4" />
							</Button>
						)}
						<Button
							onClick={() => setIsFilterDialogOpen(true)}
							size="sm"
							variant={hasActiveFilters ? "default" : "outline"}
						>
							<Filter className="mr-2 h-4 w-4" />
							{hasActiveFilters ? "Edit filters" : "Filter"}
							{hasActiveFilters && (
								<span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs">
									{Object.keys(currentFilters).length}
								</span>
							)}
						</Button>
					</div>
				}
			/>

			<QuotationFilterDialog
				currentFilters={currentFilters}
				isOpen={isFilterDialogOpen}
				onApplyFilters={applyFilters}
				onOpenChange={setIsFilterDialogOpen}
			/>
		</div>
	);
}
