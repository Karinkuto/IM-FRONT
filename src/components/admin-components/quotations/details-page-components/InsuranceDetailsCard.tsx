import { DescriptionItem } from "@/components/shared/DescriptionItem";
import type { QuotationRequest } from "@/types/quotation";

interface InsuranceDetailsCardProps {
	insuranceType: QuotationRequest["insurance_type"];
	coverageType: QuotationRequest["coverage_type"];
	coverageAmount: QuotationRequest["form_data"]["coverage_amount"];
}

export function InsuranceDetailsCard({
	insuranceType,
	coverageType,
	coverageAmount,
}: InsuranceDetailsCardProps) {
	const safeCoverageAmount = coverageAmount as number;
	return (
		<div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 space-y-4">
			<h3 className="text-xl font-semibold">Insurance Details</h3>
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<DescriptionItem label="Insurance Type" value={insuranceType.name} />
				<DescriptionItem label="Coverage Type" value={coverageType.name} />
				<DescriptionItem
					label="Coverage Amount"
					value={new Intl.NumberFormat("en-US", {
						style: "currency",
						currency: "ETB",
					}).format(safeCoverageAmount)}
				/>
			</div>
		</div>
	);
}
