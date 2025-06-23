import { Info } from "lucide-react";
import type { ControllerRenderProps, UseFormReturn } from "react-hook-form";
import * as z from "zod";
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
import {
	type ComboboxOption,
	coverageTypeOptions,
	insuranceTypeOptions,
	type Product,
} from "../product-data-types";
import { FormModal } from "./FormModal";

const formSchema = z.object({
	insuranceType: z.string().min(1, "Insurance type is required"),
	coverageType: z.string().min(1, "Coverage type is required"),
	description: z.string().min(1, "Description is required"),
	pricing: z
		.string()
		.regex(/^[0-9]+(\.[0-9]{1,2})?$/, "Please enter a valid price"),
});

type ProductFormValues = z.infer<typeof formSchema>;

interface ProductDialogProps {
	mode: "create" | "edit";
	isOpen: boolean;
	onOpenChange: (isOpen: boolean) => void;
	onSubmit: (product: Product | Omit<Product, "id">) => void;
	isLoading?: boolean;
	product?: Product | null; // Only for edit mode
}

export const ProductDialog = ({
	mode,
	isOpen,
	onOpenChange,
	onSubmit,
	isLoading,
	product,
}: ProductDialogProps) => {
	// Initial values
	const initialValues: ProductFormValues =
		mode === "edit" && product
			? {
					insuranceType:
						insuranceTypeOptions.find(
							(opt) =>
								opt.value === product.insuranceType ||
								opt.label === product.insuranceType,
						)?.value || "",
					coverageType:
						coverageTypeOptions.find(
							(opt) =>
								opt.value === product.coverageType ||
								opt.label === product.coverageType,
						)?.value || "",
					description: product.description || "",
					pricing:
						product.pricing !== undefined && product.pricing !== null
							? product.pricing.toString()
							: "",
				}
			: { insuranceType: "", coverageType: "", description: "", pricing: "" };

	// Dynamic left section
	const leftSection = (
		<div className="bg-muted/50 p-6 rounded-lg h-full">
			<div className="space-y-4">
				<div className="flex items-center gap-3">
					<div className="p-2 rounded-full bg-primary/10">
						<Info className="h-5 w-5 text-primary" />
					</div>
					<h3 className="font-semibold">
						{mode === "create" ? "Create New Product" : "Edit Product"}
					</h3>
				</div>
				<p className="text-sm text-muted-foreground">
					{mode === "create"
						? "Fill in the product details to create a new insurance product. All fields are required to ensure proper processing."
						: "Update the product details. All fields are required to ensure proper processing."}
				</p>
				<div className="space-y-2 pt-4">
					<h4 className="text-sm font-medium">Tips:</h4>
					<ul className="text-sm text-muted-foreground space-y-2 list-disc pl-4">
						<li>Select the appropriate insurance type from the dropdown</li>
						<li>Choose the coverage type that best fits the product</li>
						<li>Provide a clear and concise description</li>
						<li>Enter the pricing in the format: 00.00</li>
					</ul>
				</div>
			</div>
		</div>
	);

	// Unified submit handler
	const handleSubmit = (values: ProductFormValues) => {
		if (mode === "edit" && product) {
			const updatedProduct: Product = {
				...product,
				insuranceType:
					insuranceTypeOptions.find((opt) => opt.value === values.insuranceType)
						?.label || values.insuranceType,
				coverageType:
					coverageTypeOptions.find((opt) => opt.value === values.coverageType)
						?.label || values.coverageType,
				description: values.description,
				pricing: Number.parseFloat(values.pricing),
			};
			onSubmit(updatedProduct);
		} else {
			const newProduct: Omit<Product, "id"> = {
				insuranceType:
					insuranceTypeOptions.find((opt) => opt.value === values.insuranceType)
						?.label || values.insuranceType,
				coverageType:
					coverageTypeOptions.find((opt) => opt.value === values.coverageType)
						?.label || values.coverageType,
				description: values.description,
				pricing: Number.parseFloat(values.pricing),
			};
			onSubmit(newProduct);
		}
	};

	return (
		<FormModal<ProductFormValues>
			open={isOpen}
			onOpenChange={onOpenChange}
			onSubmit={handleSubmit}
			initialValues={initialValues}
			validationSchema={formSchema}
			isLoading={isLoading}
			mode={mode}
			title={mode === "create" ? "Create New Product" : "Edit Product"}
			description={
				mode === "create"
					? "Fill in the product details to create a new insurance product. All fields are required to ensure proper processing."
					: "Update the product details. All fields are required to ensure proper processing."
			}
			leftSection={leftSection}
			renderFields={(form: UseFormReturn<ProductFormValues>) => (
				<>
					<div className="space-y-4 p-6 ">
						<div className="grid grid-cols-2 gap-4">
							{/* Insurance Type */}
							<FormField
								control={form.control}
								name="insuranceType"
								render={({
									field,
								}: {
									field: ControllerRenderProps<
										ProductFormValues,
										"insuranceType"
									>;
								}) => (
									<FormItem>
										<FormLabel>Insurance Type</FormLabel>
										<FormControl>
											<Combobox
												options={insuranceTypeOptions as ComboboxOption[]}
												value={field.value}
												onValueChange={field.onChange}
												placeholder="Select Insurance Type"
												searchPlaceholder="Search insurance types..."
												emptyStateMessage="No insurance type found."
												className="w-full"
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
								render={({
									field,
								}: {
									field: ControllerRenderProps<
										ProductFormValues,
										"coverageType"
									>;
								}) => (
									<FormItem>
										<FormLabel>Coverage Type</FormLabel>
										<FormControl>
											<Combobox
												options={coverageTypeOptions as ComboboxOption[]}
												value={field.value}
												onValueChange={field.onChange}
												placeholder="Select Coverage Type"
												searchPlaceholder="Search coverage types..."
												emptyStateMessage="No coverage type found."
												className="w-full"
											/>
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
							render={({
								field,
							}: {
								field: ControllerRenderProps<ProductFormValues, "description">;
							}) => (
								<FormItem>
									<FormLabel>Description</FormLabel>
									<FormControl>
										<Textarea
											placeholder="Enter product description..."
											className="min-h-[100px]"
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
							name="pricing"
							render={({
								field,
							}: {
								field: ControllerRenderProps<ProductFormValues, "pricing">;
							}) => (
								<FormItem>
									<FormLabel>Pricing (ETB)</FormLabel>
									<FormControl>
										<Input
											type="text"
											placeholder="0.00"
											{...field}
											onChange={(e) => {
												// Allow only numbers and one decimal point
												const value = e.target.value.replace(/[^0-9.]/g, "");
												const decimalCount = (value.match(/\./g) || []).length;
												if (decimalCount <= 1) {
													field.onChange(value);
												}
											}}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
				</>
			)}
		/>
	);
};
