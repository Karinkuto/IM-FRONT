import type React from "react";
import { z } from "zod";
import { SmartForm, SmartFormField } from "@/components/smart-form";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { coverageTypeOptions, insuranceTypeOptions } from "@/types/product";
import type { QuotationFiltersType, QuotationStatus } from "@/types/quotation";

const statusOptions = [
	{ value: "draft", label: "Draft" },
	{ value: "pending", label: "Pending" },
	{ value: "approved", label: "Approved" },
	{ value: "rejected", label: "Rejected" },
];

// Define the form schema that matches QuotationFiltersType
type FormValues = {
	status?: QuotationStatus;
	insuranceType?: string;
	coverageType?: string;
	vehicleType?: string;
	region?: string;
};

const filterSchema = z.object({
	status: z
		.enum([
			"draft",
			"pending",
			"in_review",
			"approved",
			"rejected",
			"completed",
		])
		.optional(),
	insuranceType: z.string().optional(),
	coverageType: z.string().optional(),
	vehicleType: z.string().optional(),
	region: z.string().optional(),
}) satisfies z.ZodType<FormValues>;

interface QuotationFilterDialogProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	onApplyFilters: (filters: QuotationFiltersType) => void;
	currentFilters: QuotationFiltersType;
}

export const QuotationFilterDialog: React.FC<QuotationFilterDialogProps> = ({
	isOpen,
	onOpenChange,
	onApplyFilters,
	currentFilters,
}) => {
	// We'll use mutationFn to handle the form submission
	const handleFormSubmit = async (data: FormValues) => {
		// Map the form values to the expected QuotationFiltersType
		const filters: QuotationFiltersType = {
			status: data.status,
			insuranceType: data.insuranceType,
			coverageType: data.coverageType,
			vehicleType: data.vehicleType,
			region: data.region,
		};

		onApplyFilters(filters);
		onOpenChange(false);
		return Promise.resolve();
	};

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Filter Quotations</DialogTitle>
				</DialogHeader>

				<SmartForm<FormValues>
					schema={filterSchema}
					defaultValues={currentFilters as FormValues}
					mutationFn={handleFormSubmit}
					submitText="Apply Filters"
					className="space-y-6"
					card={false}
				>
					{(form) => (
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<SmartFormField
								form={form}
								name="status"
								type="select"
								label="Status"
								options={statusOptions}
							/>

							<SmartFormField
								form={form}
								name="insuranceType"
								type="select"
								label="Insurance Type"
								options={insuranceTypeOptions}
							/>

							<SmartFormField
								form={form}
								name="coverageType"
								type="select"
								label="Coverage Type"
								options={coverageTypeOptions}
							/>

							<SmartFormField
								form={form}
								name="vehicleType"
								type="text"
								label="Vehicle Type"
								placeholder="Enter vehicle type"
							/>

							<SmartFormField
								form={form}
								name="region"
								type="text"
								label="Region"
								placeholder="Enter region"
							/>
						</div>
					)}
				</SmartForm>
			</DialogContent>
		</Dialog>
	);
};
