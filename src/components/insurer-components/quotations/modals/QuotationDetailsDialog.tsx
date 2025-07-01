import { VehicleImages } from "@/components/insurer-components/quotations/modals/details-dialog-components/VehicleImages";
import { Badge } from "@/components/ui/badge";
import {
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGetQuotationRequestByIdQuery } from "@/redux/apis/quotationApi";
import QuotationDetails from "./details-dialog-components/QuotationDetails";

interface QuotationDetailsDialogProps {
	quotationId: string;
}

interface CustomError {
	error: {
		status?: number;
		data: string;
	};
}

export default function QuotationDetailsDialog({
	quotationId,
}: QuotationDetailsDialogProps) {
	const {
		data: responseData,
		isLoading,
		error,
	} = useGetQuotationRequestByIdQuery(Number(quotationId));

	// The `useGetQuotationRequestByIdQuery` hook returns `QuotationRequest` directly.
	const quotation = responseData;

	if (isLoading) {
		return <LoadingSpinner />;
	}

	if (error) {
		const errorMessage =
			(error as CustomError).error?.data || "An unexpected error occurred.";
		return (
			<div className="p-4 text-center text-red-500">Error: {errorMessage}</div>
		);
	}

	if (!quotation) {
		return <div className="p-4 text-center">Quotation not found.</div>;
	}

	// Debug: Log the data being sent to QuotationDetails
	console.log("[QuotationDetailsDialog] Quotation data:", quotation);

	return (
		<DialogContent className="max-h-[90vh] overflow-hidden sm:max-w-[90vw] lg:max-w-[80vw] xl:max-w-[80vw] p-0">
			<div className="flex h-[80vh] w-full">
				{/* Left: Images stacked vertically */}
				<div className="flex-shrink-0 bg-muted flex flex-col items-center justify-start max-w-[380px] min-w-[320px] w-fit overflow-y-auto border-r p-4">
					<VehicleImages
						frontViewPhotoUrl={
							quotation.insured_entity_data?.front_view_photo_url ?? null
						}
						backViewPhotoUrl={
							quotation.insured_entity_data?.back_view_photo_url ?? null
						}
						leftViewPhotoUrl={
							quotation.insured_entity_data?.left_view_photo_url ?? null
						}
						rightViewPhotoUrl={
							quotation.insured_entity_data?.right_view_photo_url ?? null
						}
						enginePhotoUrl={
							quotation.insured_entity_data?.engine_photo_url ?? null
						}
						chassisNumberPhotoUrl={
							quotation.insured_entity_data?.chassis_number_photo_url ?? null
						}
						librePhotoUrl={
							quotation.insured_entity_data?.libre_photo_url ?? null
						}
						stacked
					/>
				</div>
				{/* Right: Details handled by QuotationDetails */}
				<div className="flex-1 min-w-0">
					<ScrollArea className="h-full p-8">
						<DialogHeader>
							<DialogTitle className="flex items-center gap-2">
								Quotation Details{" "}
								<span className="text-muted-foreground">#{quotation.id}</span>
								{quotation.status && (
									<Badge
										variant={
											`status-${quotation.status}` as
												| "status-draft"
												| "status-pending"
												| "status-approved"
												| "status-rejected"
										}
									>
										{quotation.status.charAt(0).toUpperCase() +
											quotation.status.slice(1)}
									</Badge>
								)}
							</DialogTitle>
							<DialogDescription>
								View the comprehensive details of the selected quotation
								request.
							</DialogDescription>
						</DialogHeader>
						<QuotationDetails quotation={quotation} />
					</ScrollArea>
				</div>
			</div>
		</DialogContent>
	);
}
