import { DescriptionItem } from "@/components/shared/DescriptionItem";
import type { QuotationRequest } from "@/types/quotation";

interface AddressInformationCardProps {
	address: QuotationRequest["form_data"]["current_residence_address"];
}

export function AddressInformationCard({
	address,
}: AddressInformationCardProps) {
	const safeAddress = address as { region: string; house_number: string };
	return (
		<div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 space-y-4">
			<h3 className="text-xl font-semibold">Address Information</h3>
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<DescriptionItem label="Region" value={safeAddress.region} />
				<DescriptionItem
					label="House Number"
					value={safeAddress.house_number}
				/>
			</div>
		</div>
	);
}
