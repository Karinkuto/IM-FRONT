import { useTransition } from "react";
import { useNavigate } from "react-router-dom";
import { AddressInformationCard } from "@/components/admin-components/quotations/details-page-components/AddressInformationCard";
import { DetailSection } from "@/components/admin-components/quotations/details-page-components/DetailSection";
import { InsuranceDetailsCard } from "@/components/admin-components/quotations/details-page-components/InsuranceDetailsCard";
import { UserInformationCard } from "@/components/admin-components/quotations/details-page-components/UserInformationCard";
import { VehicleDetailsCard } from "@/components/admin-components/quotations/details-page-components/VehicleDetailsCard";
import { VehicleImages } from "@/components/admin-components/quotations/details-page-components/VehicleImages";
import { Badge } from "@/components/ui/badge";
import {
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuotation } from "@/hooks/useQuotation";

interface QuotationDetailsDialogProps {
	quotationId: string;
}

export default function QuotationDetailsDialog({
	quotationId,
}: QuotationDetailsDialogProps) {
	const { quotation, isLoading, error } = useQuotation(quotationId);
	const [isPending] = useTransition();
	const navigate = useNavigate(); // This navigate is not used in dialog context anymore, but keeping it for now

	console.log("Front View URL:", quotation?.vehicle.front_view_photo_url);
	console.log("Back View URL:", quotation?.vehicle.back_view_photo_url);

	if (isLoading) {
		return <LoadingSpinner />;
	}

	if (error) {
		return (
			<div className="p-4 text-center text-red-500">Error: {error.message}</div>
		);
	}

	if (!quotation) {
		return <div className="p-4 text-center">Quotation not found.</div>;
	}

	return (
		<DialogContent className="max-h-[90vh] overflow-hidden sm:max-w-[90vw] lg:max-w-[80vw] xl:max-w-[70vw] p-0">
			<div className="flex h-[80vh] w-full">
				{/* Left: Images stacked vertically */}
				<div className="flex-shrink-0 bg-muted flex flex-col items-center justify-start max-w-[420px] min-w-[320px] w-fit overflow-y-auto border-r p-4">
					<VehicleImages
						frontViewPhotoUrl={quotation.vehicle.front_view_photo_url}
						backViewPhotoUrl={quotation.vehicle.back_view_photo_url}
						leftViewPhotoUrl={quotation.vehicle.left_view_photo_url}
						rightViewPhotoUrl={quotation.vehicle.right_view_photo_url}
						enginePhotoUrl={quotation.vehicle.engine_photo_url}
						chassisNumberPhotoUrl={quotation.vehicle.chassis_number_photo_url}
						librePhotoUrl={quotation.vehicle.libre_photo_url}
						stacked
					/>
				</div>
				{/* Right: Details stacked vertically */}
				<div className="flex-1 min-w-0">
					<ScrollArea className="h-full p-8">
						<DialogHeader>
							<DialogTitle className="flex items-center gap-2">
								Quotation Details{" "}
								<span className="text-muted-foreground">#{quotation.id}</span>
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
							</DialogTitle>
							<DialogDescription>
								View the comprehensive details of the selected quotation
								request.
							</DialogDescription>
						</DialogHeader>
						<div className="flex flex-col gap-8 mt-8">
							<DetailSection title="User & Insurance Details">
								<UserInformationCard user={quotation.user} />
								<InsuranceDetailsCard
									insuranceType={quotation.insurance_type}
									coverageType={quotation.coverage_type}
									coverageAmount={quotation.form_data.coverage_amount}
								/>
							</DetailSection>
							<DetailSection title="Vehicle & Address Details">
								<VehicleDetailsCard
									vehicle={quotation.vehicle}
									formData={quotation.form_data}
								/>
								<AddressInformationCard
									address={quotation.form_data.current_residence_address}
								/>
							</DetailSection>
						</div>
					</ScrollArea>
				</div>
			</div>
		</DialogContent>
	);
}
