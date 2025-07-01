import { Info } from "lucide-react";
import React from "react";
import type { ControllerRenderProps, UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
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
import { useGetAllInsuranceTypesQuery } from "@/redux/apis/productApi";
import type { Product } from "@/types/product";
import { FormModal } from "../../../ui/FormModal";

const formSchema = z.object({
	name: z.string().min(1, "Product name is required"),
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
	// Fetch insurance types (with coverage types) from backend
	const {
		data: insuranceTypes,
		isLoading: isTypesLoading,
		error: typesError,
	} = useGetAllInsuranceTypesQuery();

	// Refactor getInitialValues to useCallback
	const getInitialValues = React.useCallback(() => {
		if (mode === "edit" && product) {
			return {
				name: product.name || "",
				insuranceType: product.insuranceType || "",
				coverageType: product.coverageType || "",
				description: product.description || "",
				pricing:
					product.pricing !== undefined && product.pricing !== null
						? product.pricing.toString()
						: "",
			};
		}
		return {
			name: "",
			insuranceType: "",
			coverageType: "",
			description: "",
			pricing: "",
		};
	}, [mode, product]);

	const [initialValues, setInitialValues] = React.useState<ProductFormValues>(
		getInitialValues(),
	);

	React.useEffect(() => {
		setInitialValues(getInitialValues());
	}, [getInitialValues]);

	// State for selected insurance type (for filtering coverage types)
	const [selectedInsuranceTypeId, setSelectedInsuranceTypeId] =
		React.useState<string>(initialValues.insuranceType || "");
	// State for form instance
	const formRef = React.useRef<UseFormReturn<ProductFormValues> | null>(null);

	// Find the selected insurance type object
	const selectedInsuranceType = React.useMemo(
		() =>
			insuranceTypes?.data?.find(
				(type) => String(type.id) === String(selectedInsuranceTypeId),
			),
		[insuranceTypes, selectedInsuranceTypeId],
	);

	// Add a ref to reset the form
	const formInstanceRef = React.useRef<UseFormReturn<ProductFormValues> | null>(
		null,
	);

	// Sync selectedInsuranceTypeId with initialValues.insuranceType
	React.useEffect(() => {
		setSelectedInsuranceTypeId(initialValues.insuranceType || "");
	}, [initialValues.insuranceType]);

	// Unified submit handler
	const handleSubmit = async (values: ProductFormValues) => {
		try {
			// Prepare payload for backend
			const payload = {
				name: values.name,
				description: values.description,
				estimated_price: Number.parseFloat(values.pricing),
				coverage_type_id: values.coverageType,
			};

			await onSubmit(
				mode === "edit" && product
					? { ...product, ...payload }
					: {
							name: values.name,
							insuranceType: values.insuranceType,
							coverageType: values.coverageType,
							description: values.description,
							pricing: Number.parseFloat(values.pricing),
						},
			);

			const successMessage =
				mode === "edit"
					? "Product updated successfully!"
					: "Product created successfully!";

			toast.success(successMessage);
			onOpenChange(false);

			// Reset form values
			setInitialValues({
				name: "",
				insuranceType: "",
				coverageType: "",
				description: "",
				pricing: "",
			});

			if (formInstanceRef.current) {
				formInstanceRef.current.reset();
			}
		} catch (_error) {
			const errorMessage =
				mode === "edit"
					? "Failed to update product"
					: "Failed to create product";
			toast.error(errorMessage);
		}
	};

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

	return (
		<>
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
				renderFields={(form: UseFormReturn<ProductFormValues>) => {
					formRef.current = form;
					formInstanceRef.current = form;
					return (
						<>
							<div className="space-y-4 p-6 ">
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
										render={({ field }) => {
											const insuranceTypeOptions =
												isTypesLoading || !!typesError
													? []
													: (insuranceTypes?.data || []).map((type) => ({
															value: String(type.id),
															label: type.name,
														}));
											return (
												<FormItem>
													<FormLabel>Insurance Type</FormLabel>
													<FormControl>
														<Combobox
															options={insuranceTypeOptions}
															value={field.value}
															onValueChange={(val) => {
																field.onChange(val);
																setSelectedInsuranceTypeId(val);
																form.setValue("coverageType", "");
															}}
															placeholder={
																isTypesLoading
																	? "Loading..."
																	: typesError
																		? "Failed to load types"
																		: "Select Insurance Type"
															}
															searchPlaceholder="Search insurance types..."
															emptyStateMessage={
																typesError
																	? "Failed to load types"
																	: "No insurance type found."
															}
															className="w-full"
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											);
										}}
									/>
									{/* Coverage Type */}
									<FormField
										control={form.control}
										name="coverageType"
										render={({ field }) => {
											const coverageTypeOptions =
												selectedInsuranceType?.coverage_types
													? selectedInsuranceType.coverage_types.map((ct) => ({
															value: String(ct.id),
															label: "name" in ct ? ct.name : "Unknown",
														}))
													: [];
											return (
												<FormItem>
													<FormLabel>Coverage Type</FormLabel>
													<FormControl>
														<Combobox
															options={coverageTypeOptions}
															value={field.value}
															onValueChange={field.onChange}
															placeholder={
																selectedInsuranceType
																	? "Select Coverage Type"
																	: "Select insurance Type"
															}
															searchPlaceholder="Search coverage types..."
															emptyStateMessage="No coverage type found."
															className="w-full"
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											);
										}}
									/>
								</div>
								{/* Description */}
								<FormField
									control={form.control}
									name="description"
									render={({
										field,
									}: {
										field: ControllerRenderProps<
											ProductFormValues,
											"description"
										>;
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
														const value = e.target.value.replace(
															/[^0-9.]/g,
															"",
														);
														const decimalCount = (value.match(/\./g) || [])
															.length;
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
					);
				}}
			/>
		</>
	);
};
