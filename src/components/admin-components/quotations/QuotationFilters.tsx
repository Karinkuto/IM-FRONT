import { zodResolver } from "@hookform/resolvers/zod";
import type React from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { DatePicker } from "@/components/ui/date-picker";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { coverageTypeOptions, insuranceTypeOptions } from "@/types/product";
import type { QuotationFilters as QuotationFiltersType } from "@/types/quotation";

const filterSchema = z.object({
	status: z.string().optional(),
	insuranceType: z.string().optional(),
	coverageType: z.string().optional(),
	dateRange: z
		.object({
			from: z.date().optional(),
			to: z.date().optional(),
		})
		.optional(),
	vehicleType: z.string().optional(),
	region: z.string().optional(),
});

const statusOptions = [
	{ value: "draft", label: "Draft" },
	{ value: "pending", label: "Pending" },
	{ value: "approved", label: "Approved" },
	{ value: "rejected", label: "Rejected" },
];

interface QuotationFiltersProps {
	onFilterChange: (filters: QuotationFiltersType) => void;
	currentFilters: QuotationFiltersType;
}

const QuotationFiltersForm: React.FC<QuotationFiltersProps> = ({
	onFilterChange,
	currentFilters,
}) => {
	const form = useForm<z.infer<typeof filterSchema>>({
		resolver: zodResolver(filterSchema),
		defaultValues: {
			status: currentFilters.status || "",
			insuranceType: currentFilters.insuranceType || "",
			coverageType: currentFilters.coverageType || "",
			dateRange: {
				from: currentFilters.dateRange?.from || undefined,
				to: currentFilters.dateRange?.to || undefined,
			},
			vehicleType: currentFilters.vehicleType || "",
			region: currentFilters.region || "",
		},
	});

	const onSubmit = (values: z.infer<typeof filterSchema>) => {
		onFilterChange(values as QuotationFiltersType);
	};

	const handleReset = () => {
		form.reset();
		onFilterChange({});
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{/* Status Filter */}
					<FormField
						control={form.control}
						name="status"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Status</FormLabel>
								<FormControl>
									<Combobox
										options={statusOptions}
										value={field.value}
										onValueChange={field.onChange}
										placeholder="Select status..."
										searchPlaceholder="Search status..."
										emptyStateMessage="No status found."
									/>
								</FormControl>
							</FormItem>
						)}
					/>

					{/* Insurance Type Filter */}
					<FormField
						control={form.control}
						name="insuranceType"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Insurance Type</FormLabel>
								<FormControl>
									<Combobox
										options={insuranceTypeOptions}
										value={field.value}
										onValueChange={field.onChange}
										placeholder="Select insurance type..."
										searchPlaceholder="Search insurance types..."
										emptyStateMessage="No insurance type found."
									/>
								</FormControl>
							</FormItem>
						)}
					/>

					{/* Coverage Type Filter */}
					<FormField
						control={form.control}
						name="coverageType"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Coverage Type</FormLabel>
								<FormControl>
									<Combobox
										options={coverageTypeOptions}
										value={field.value}
										onValueChange={field.onChange}
										placeholder="Select coverage type..."
										searchPlaceholder="Search coverage types..."
										emptyStateMessage="No coverage type found."
									/>
								</FormControl>
							</FormItem>
						)}
					/>

					{/* Date Range Filters */}
					<FormField
						control={form.control}
						name="dateRange.from"
						render={({ field }) => (
							<FormItem>
								<FormLabel>From Date</FormLabel>
								<FormControl>
									<DatePicker date={field.value} onSelect={field.onChange} />
								</FormControl>
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="dateRange.to"
						render={({ field }) => (
							<FormItem>
								<FormLabel>To Date</FormLabel>
								<FormControl>
									<DatePicker date={field.value} onSelect={field.onChange} />
								</FormControl>
							</FormItem>
						)}
					/>

					{/* Vehicle Type Filter */}
					<FormField
						control={form.control}
						name="vehicleType"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Vehicle Type</FormLabel>
								<FormControl>
									<Input placeholder="Enter vehicle type..." {...field} />
								</FormControl>
							</FormItem>
						)}
					/>

					{/* Region Filter */}
					<FormField
						control={form.control}
						name="region"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Region</FormLabel>
								<FormControl>
									<Input placeholder="Enter region..." {...field} />
								</FormControl>
							</FormItem>
						)}
					/>
				</div>

				<div className="flex justify-end gap-2">
					<Button type="button" variant="outline" onClick={handleReset}>
						Reset Filters
					</Button>
					<Button type="submit">Apply Filters</Button>
				</div>
			</form>
		</Form>
	);
};

export { QuotationFiltersForm as QuotationFilters };
