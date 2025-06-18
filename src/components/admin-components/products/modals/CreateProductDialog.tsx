import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Dialog,
	DialogContent,
	DialogDescription,
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
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { Textarea } from "@/components/ui/textarea";
import { CircleDollarSign, Info } from "lucide-react";
import type { Product } from "@/components/admin-components/products/product-data-types";

// Importing the RTK Query hooks and types
import {
	useGetInsuranceTypesQuery,
	type InsuranceType, // Using types from productsApi.ts
	type CoverageType, // Using types from productsApi.ts
} from "@/redux/api/productsApi";

const formSchema = z.object({
	name: z
		.string()
		.min(2, "Product name must be at least 2 characters.")
		.max(50, "Product name must not be longer than 50 characters."),
	insuranceType: z.string().min(1, "Insurance type is required"),
	coverageType: z.string().min(1, "Coverage type is required"),
	description: z
		.string()
		.min(10, "Description must be at least 10 characters.")
		.max(160, "Description must not be longer than 160 characters."),
	pricing: z
		.string()
		.min(1, "Pricing is required")
		.regex(/^\d+(\.\d{1,2})?$/, "Invalid price format. Use 00.00"),
});

interface CreateProductDialogProps {
	isOpen: boolean;
	onOpenChange: (isOpen: boolean) => void;
	onProductCreate: (newProduct: Product) => void;
}

export const CreateProductDialog: React.FC<CreateProductDialogProps> = ({
	isOpen,
	onOpenChange,
	onProductCreate,
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

	const [dynamicInsuranceTypeOptions, setDynamicInsuranceTypeOptions] =
		useState<{ value: string; label: string }[]>([]);
	const [dynamicCoverageTypeOptions, setDynamicCoverageTypeOptions] = useState<
		{ value: string; label: string }[]
	>([]);

	const selectedInsuranceType = form.watch("insuranceType");

	// Fetch Insurance Types using RTK Query
	const {
		data: insuranceTypes,
		isLoading: isLoadingInsuranceTypes,
		isError: isErrorInsuranceTypes,
	} = useGetInsuranceTypesQuery();

	useEffect(() => {
		if (insuranceTypes) {
			const options = insuranceTypes.map((item: InsuranceType) => ({
				value: item.id.toString(),
				label: item.name,
			}));
			setDynamicInsuranceTypeOptions(options);
		} else if (isErrorInsuranceTypes) {
			console.error("Error fetching insurance types using RTK Query.");
			setDynamicInsuranceTypeOptions([]);
		}
	}, [insuranceTypes, isErrorInsuranceTypes]);

	// **Refactored: Get Coverage Types from insuranceTypes data**
	useEffect(() => {
		console.log("Coverage Types Effect Triggered (new logic).");
		console.log("Selected Insurance Type:", selectedInsuranceType);
		console.log("All Insurance Types from API:", insuranceTypes);

		if (selectedInsuranceType && insuranceTypes) {
			const selectedInsType = insuranceTypes.find(
				(type: InsuranceType) => type.id.toString() === selectedInsuranceType,
			);

			if (selectedInsType?.coverage_types) {
				const options = selectedInsType.coverage_types.map(
					(item: CoverageType) => ({
						value: item.id.toString(),
						label: item.name,
					}),
				);
				console.log("Mapped Coverage Type Options:", options);
				setDynamicCoverageTypeOptions(options);
				form.setValue("coverageType", ""); // Reset coverageType when insuranceType changes
				console.log("Coverage type reset to empty string.");
			} else {
				console.log(
					"No coverage types found for selected insurance type or coverage_types is missing.",
				);
				setDynamicCoverageTypeOptions([]);
				form.setValue("coverageType", "");
			}
		} else {
			console.log(
				"No insurance type selected or insuranceTypes not loaded, resetting coverage types.",
			);
			setDynamicCoverageTypeOptions([]);
			form.setValue("coverageType", "");
		}
	}, [selectedInsuranceType, insuranceTypes, form]); // Dependencies now include insuranceTypes

	const resetFormFields = () => {
		form.reset();
	};

	const onSubmit = (values: z.infer<typeof formSchema>) => {
		const newProduct: Omit<Product, "id"> = {
			name: values.name,
			insuranceType: values.insuranceType,
			insuranceTypeId: values.insuranceType,
			coverageType: values.coverageType,
			coverageTypeId: values.coverageType,
			description: values.description,
			pricing: Number.parseFloat(values.pricing),
			status: "active",
			customerRating: null,
		};

		onProductCreate(newProduct as Product);
		resetFormFields();
		onOpenChange(false);
	};

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Create New Product</DialogTitle>
					<DialogDescription>
						Fill in the product details to create a new insurance product. All
						fields are required to ensure proper processing.
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
										<h3 className="font-semibold">Create New Product</h3>
									</div>
									<p className="text-sm text-muted-foreground">
										Fill in the product details to create a new insurance
										product. All fields are required to ensure proper
										processing.
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
															options={dynamicInsuranceTypeOptions}
															value={field.value}
															onValueChange={field.onChange}
															placeholder="Select Insurance Type"
															searchPlaceholder="Search insurance types..."
															emptyStateMessage={
																isLoadingInsuranceTypes
																	? "Loading insurance types..."
																	: "No insurance type found."
															}
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
															options={dynamicCoverageTypeOptions}
															value={field.value}
															onValueChange={field.onChange}
															placeholder="Select Coverage Type"
															searchPlaceholder="Search coverage types..."
															emptyStateMessage={
																!selectedInsuranceType
																	? "Select an insurance type first."
																	: dynamicCoverageTypeOptions.length === 0 &&
																			!isLoadingInsuranceTypes
																		? "No coverage types found for this insurance type."
																		: "Loading coverage types..."
															}
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
												<FormLabel>Pricing</FormLabel>
												<FormControl>
													<div className="relative">
														<CircleDollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
														<Input
															placeholder="0.00"
															className="pl-9"
															type="text" // Keep as text to handle regex for decimal
															{...field}
														/>
													</div>
												</FormControl>
												<FormDescription>
													Set the estimated price for this product.
												</FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<div className="flex justify-end p-6 gap-2">
									<Button
										variant="outline"
										onClick={() => {
											resetFormFields();
											onOpenChange(false);
										}}
										type="button"
									>
										Cancel
									</Button>
									<Button type="submit">Create Product</Button>
								</div>
							</div>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
};
