import type { UseFormReturn } from "react-hook-form";
import { Combobox } from "@/components/ui/combobox";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type CoverageType = {
	id: string | number;
	name: string;
};

type InsuranceType = {
	id: string | number;
	name: string;
	coverage_types?: CoverageType[];
};

interface ProductFormFieldsProps {
	form: UseFormReturn<{
		name: string;
		insuranceType: string;
		coverageType: string;
		description: string;
		estimated_price: string;
	}>;
	insuranceTypes?: {
		data?: InsuranceType[];
	};
	isTypesLoading: boolean;
	typesError: Error | null;
	selectedInsuranceType?: InsuranceType | null;
	setSelectedInsuranceTypeId: (id: string) => void;
}

export function getPlaceholderText(
	isLoading: boolean,
	hasError: boolean
): string {
	if (isLoading) {
		return "Loading...";
	}
	if (hasError) {
		return "Failed to load types";
	}
	return "Select Insurance Type";
}

export const ProductFormFields = ({
	form,
	insuranceTypes,
	isTypesLoading,
	typesError,
	selectedInsuranceType,
	setSelectedInsuranceTypeId,
}: ProductFormFieldsProps) => {
	const insuranceTypeOptions =
		insuranceTypes?.data?.map((type) => {
			return { value: String(type.id), label: type.name };
		}) || [];

	const coverageTypeOptions =
		selectedInsuranceType?.coverage_types?.map((type) => {
			return { value: String(type.id), label: type.name };
		}) || [];

	return (
		<div className="space-y-4">
			{/* Product Name */}
			<FormField
				control={form.control}
				name="name"
				render={({ field }) => (
					<FormItem>
						<FormLabel>Product Name</FormLabel>
						<FormControl>
							<Input placeholder="Enter product name..." {...field} />
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>

			<div className="grid grid-cols-2 gap-4">
				{/* Insurance Type */}
				<FormField
					control={form.control}
					name="insuranceType"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Insurance Type</FormLabel>
							<FormControl>
								<Combobox
									className="w-full"
									emptyStateMessage={
										typesError
											? "Failed to load types"
											: "No insurance types available"
									}
									onValueChange={(value) => {
										// Update the form field
										field.onChange(value);

										// Clear the coverage type when insurance type changes
										// Use shouldValidate: false to prevent validation on clear
										form.setValue("coverageType", "", {
											shouldValidate: false,
										});

										// Update the selected insurance type
										setSelectedInsuranceTypeId(value);
									}}
									options={insuranceTypeOptions}
									placeholder={getPlaceholderText(isTypesLoading, !!typesError)}
									searchPlaceholder="Search insurance types..."
									value={field.value}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Coverage Type */}
				<FormField
					control={form.control}
					name="coverageType"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Coverage Type</FormLabel>
							<FormControl>
								<div
									className={
										selectedInsuranceType ? "" : "cursor-not-allowed opacity-50"
									}
								>
									<Combobox
										className="w-full"
										emptyStateMessage={
											selectedInsuranceType
												? "No coverage types available"
												: "Select an insurance type first"
										}
										onValueChange={
											selectedInsuranceType
												? field.onChange
												: (_value: string) => {
														/* No-op when disabled */
													}
										}
										options={selectedInsuranceType ? coverageTypeOptions : []}
										placeholder={
											selectedInsuranceType
												? "Select Coverage Type"
												: "Select insurance type first"
										}
										searchPlaceholder="Search coverage types..."
										value={field.value}
									/>
								</div>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
			</div>

			{/* Description */}
			<FormField
				control={form.control}
				name="description"
				render={({ field }) => (
					<FormItem>
						<FormLabel>Description</FormLabel>
						<FormControl>
							<Textarea
								className="min-h-[100px]"
								placeholder="Enter product description..."
								{...field}
							/>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>

			{/* Pricing */}
			<FormField
				control={form.control}
				name="estimated_price"
				render={({ field }) => (
					<FormItem>
						<FormLabel>Estimated Price</FormLabel>
						<FormControl>
							<Input
								placeholder="Enter estimated price..."
								{...field}
								type="text"
							/>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
		</div>
	);
};
