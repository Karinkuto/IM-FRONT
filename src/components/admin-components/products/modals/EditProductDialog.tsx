import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
	useGetInsuranceTypesQuery,
	type InsuranceType,
	type CoverageType,
} from "@/redux/api/productsApi";
import { zodResolver } from "@hookform/resolvers/zod";
import { Info, Save } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import type { ComboboxOption, Product } from "../product-data-types";

const formSchema = z.object({
	name: z
		.string()
		.min(2, "Product name must be at least 2 characters.")
		.max(50, "Product name must not be longer than 50 characters."),
	insuranceType: z.string().min(1, "Insurance type is required"),
	coverageType: z.string().min(1, "Coverage type is required"),
	description: z.string().min(1, "Description is required"),
	pricing: z.string().regex(/^\d+(\.\d{1,2})?$/, "Please enter a valid price"),
});

interface EditProductDialogProps {
	isOpen: boolean;
	onOpenChange: (isOpen: boolean) => void;
	onProductUpdate: (updatedProduct: Product) => void;
	product: Product | null; // The product to be edited
}

export const EditProductDialog: React.FC<EditProductDialogProps> = ({
	isOpen,
	onOpenChange,
	onProductUpdate,
	product,
}) => {
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
			insuranceType: "",
			coverageType: "",
			description: "",
			pricing: "",
		},
		mode: "onBlur",
	});

	const [dynamicCoverageTypeOptions, setDynamicCoverageTypeOptions] = useState<
		ComboboxOption[]
	>([]);
	const [dynamicInsuranceTypeOptions, setDynamicInsuranceTypeOptions] =
		useState<ComboboxOption[]>([]);

	const selectedInsuranceType = form.watch("insuranceType");

	// Fetch Insurance Types using RTK Query
	const { data: insuranceTypes, isLoading: isLoadingInsuranceTypes } =
		useGetInsuranceTypesQuery();

	useEffect(() => {
		if (insuranceTypes) {
			const options = insuranceTypes.map((item: InsuranceType) => ({
				value: item.id.toString(),
				label: item.name,
			}));
			setDynamicInsuranceTypeOptions(options);
		} else {
			setDynamicInsuranceTypeOptions([]);
		}
	}, [insuranceTypes]);

	// Get Coverage Types from insuranceTypes data
	useEffect(() => {
		if (selectedInsuranceType && insuranceTypes) {
			const selectedInsType = insuranceTypes.find(
				(type) => type.id.toString() === selectedInsuranceType,
			);

			if (selectedInsType?.coverage_types) {
				const options = selectedInsType.coverage_types.map(
					(item: CoverageType) => ({
						value: item.id.toString(),
						label: item.name,
					}),
				);
				setDynamicCoverageTypeOptions(options);
				if (
					!options.some(
						(opt) => opt.value === form.getValues("coverageType"),
					) &&
					product?.coverageTypeId !== form.getValues("coverageType") // Only reset if current value is not the product's original coverage type
				) {
					form.setValue("coverageType", "");
				}
			} else {
				setDynamicCoverageTypeOptions([]);
				form.setValue("coverageType", "");
			}
		} else {
			setDynamicCoverageTypeOptions([]);
			form.setValue("coverageType", "");
		}
	}, [selectedInsuranceType, insuranceTypes, form, product]);

	// Populate form fields when the product prop changes (i.e., when dialog opens with a product)
	useEffect(() => {
		if (product) {
			form.setValue("name", product.name, { shouldValidate: true });
			form.setValue("description", product.description);
			form.setValue("pricing", product.pricing.toString());
			form.setValue("insuranceType", product.insuranceTypeId, {
				shouldValidate: true,
			});
			form.setValue("coverageType", product.coverageTypeId, {
				shouldValidate: true,
			});
		}
	}, [product, form]);

	const resetFormFields = () => {
		form.reset();
	};

	const onSubmit = (values: z.infer<typeof formSchema>) => {
		if (!product) return; // Should not happen if dialog is opened with a product

		const updatedProduct: Product = {
			...product, // Keep the existing ID
			name: values.name,
			insuranceType:
				dynamicInsuranceTypeOptions.find(
					(opt) => opt.value === values.insuranceType,
				)?.label || "",
			insuranceTypeId: values.insuranceType, // Send the ID
			coverageType:
				dynamicCoverageTypeOptions.find(
					(opt) => opt.value === values.coverageType,
				)?.label || "",
			coverageTypeId: values.coverageType, // Send the ID
			description: values.description,
			pricing: Number.parseFloat(values.pricing),
			status: product.status, // Preserve status as it's not editable in this dialog
			customerRating: product.customerRating, // Preserve customerRating as it's not editable in this dialog
		};

		onProductUpdate(updatedProduct);
		resetFormFields();
		onOpenChange(false);
	};

	return (
		<Dialog
			open={isOpen}
			onOpenChange={(openState) => {
				onOpenChange(openState);
				if (!openState) resetFormFields();
			}}
		>
			<DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Edit Product</DialogTitle>
					<DialogDescription>
						Update the product details. All fields are required to ensure proper
						processing.
					</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
						<div className="grid grid-cols-12 gap-6">
							{/* Left Column - Description */}
							<div className="col-span-4 bg-muted/50 p-6 rounded-lg">
								<div className="space-y-4">
									<div className="flex items-center gap-3">
										<div className="p-2 rounded-full bg-primary/10">
											<Info className="h-5 w-5 text-primary" />
										</div>
										<h3 className="font-semibold">Edit Product</h3>
									</div>
									<p className="text-sm text-muted-foreground">
										Update the product details. All fields are required to
										ensure proper processing.
									</p>
									<div className="space-y-2 pt-4">
										<h4 className="text-sm font-medium">Tips:</h4>
										<ul className="text-sm text-muted-foreground space-y-2 list-disc pl-4">
											<li>
												Select the appropriate insurance type from the dropdown
											</li>
											<li>
												Choose the coverage type that best fits the product
											</li>
											<li>Provide a clear and concise description</li>
											<li>Enter the pricing in the format: 00.00</li>
										</ul>
									</div>
								</div>
							</div>

							{/* Right Column - Form */}
							<div className="col-span-8 flex flex-col justify-between">
								<div className="space-y-4 p-6 ">
									<div className="grid grid-cols-2 gap-4">
										{/* Product Name */}
										<FormField
											control={form.control}
											name="name"
											render={({ field }) => (
												<FormItem className="col-span-2">
													<FormLabel>Product Name</FormLabel>
													<FormControl>
														<Input
															placeholder="Enter product name"
															{...field}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										{/* Insurance Type */}
										<FormField
											control={form.control}
											name="insuranceType"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Insurance Type</FormLabel>
													<FormControl>
														<Combobox
															key={field.value}
															options={dynamicInsuranceTypeOptions}
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
											render={({ field }) => (
												<FormItem>
													<FormLabel>Coverage Type</FormLabel>
													<FormControl>
														<Combobox
															key={field.value}
															options={dynamicCoverageTypeOptions}
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
										render={({ field }) => (
											<FormItem>
												<FormLabel>Description</FormLabel>
												<FormControl>
													<Textarea
														placeholder="Enter product description..."
														className="min-h-[100px]"
														{...field}
													/>
												</FormControl>
												<FormDescription>
													Provide a detailed description of the insurance
													product.
												</FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>

									{/* Pricing */}
									<FormField
										control={form.control}
										name="pricing"
										render={({ field }) => (
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

								<DialogFooter className="pt-4">
									<Button
										type="button"
										variant="outline"
										onClick={() => onOpenChange(false)}
									>
										Cancel
									</Button>
									<Button type="submit">
										<Save className="mr-2 h-4 w-4" /> Save Changes
									</Button>
								</DialogFooter>
							</div>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
};
