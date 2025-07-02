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
		<Dialog onOpenChange={onOpenChange} open={isOpen}>
			<DialogContent className="max-h-[80vh] max-w-4xl overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Filter Quotations</DialogTitle>
				</DialogHeader>

				<SmartForm<FormValues>
					card={false}
					className="space-y-6"
					defaultValues={currentFilters as FormValues}
					mutationFn={handleFormSubmit}
					schema={filterSchema}
					submitText="Apply Filters"
				>
					{(form) => (
						<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
							<SmartFormField
								form={form}
								label="Status"
								name="status"
								options={statusOptions}
								type="select"
							/>

							<SmartFormField
								form={form}
								label="Insurance Type"
								name="insuranceType"
								options={insuranceTypeOptions}
								type="select"
							/>

							<SmartFormField
								form={form}
								label="Coverage Type"
								name="coverageType"
								options={coverageTypeOptions}
								type="select"
							/>

							<SmartFormField
								form={form}
								label="Vehicle Type"
								name="vehicleType"
								placeholder="Enter vehicle type"
								type="text"
							/>

							<SmartFormField
								form={form}
								label="Region"
								name="region"
								placeholder="Enter region"
								type="text"
							/>
						</div>
					)}
				</SmartForm>
			</DialogContent>
		</Dialog>
	);
};
