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
import type { RootState } from "@/redux/store";
import { zodResolver } from "@hookform/resolvers/zod";
import { Info, PlusCircle } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import * as z from "zod";
import {
	type ComboboxOption,
	type Product,
	coverageTypeOptions,
	insuranceTypeOptions,
} from "../product-data-types.ts";

interface InsuranceTypeApi {
	id: number;
	name: string;
	description: string;
}

interface CoverageTypeApi {
	id: number;
	name: string;
	description: string;
	insurance_type_id: number;
}

const formSchema = z.object({
	insuranceType: z.string().min(1, "Insurance type is required"),
	coverageType: z.string().min(1, "Coverage type is required"),
	description: z.string().min(1, "Description is required"),
	pricing: z.string().regex(/^\d+(\.\d{1,2})?$/, "Please enter a valid price"),
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
			insuranceType: "",
			coverageType: "",
			description: "",
			pricing: "",
		},
	});

	const [dynamicCoverageTypeOptions, setDynamicCoverageTypeOptions] = useState<
		ComboboxOption[]
	>([]);
	const [dynamicInsuranceTypeOptions, setDynamicInsuranceTypeOptions] =
		useState<ComboboxOption[]>([]);
	const token = useSelector((state: RootState) => state.auth.token);

	const selectedInsuranceType = form.watch("insuranceType");

	useEffect(() => {
		const fetchInsuranceTypes = async () => {
			try {
				const response = await fetch("http://localhost:3000/insurance_types", {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}
				const result = await response.json();
				const { data } = result;
				if (!Array.isArray(data)) {
					setDynamicInsuranceTypeOptions([]);
					return;
				}
				const options = data.map((item) => ({
					value: item.id.toString(),
					label: item.name,
				}));
				setDynamicInsuranceTypeOptions(options);
			} catch (error) {
				console.error("Error fetching insurance types:", error);
			}
		};

		fetchInsuranceTypes();
	}, [token]);

	useEffect(() => {
		const fetchCoverageTypes = async () => {
			if (selectedInsuranceType) {
				try {
					const response = await fetch(
						`http://localhost:3000/insurance_types/${selectedInsuranceType}/coverage_types`,
						{
							headers: {
								Authorization: `Bearer ${token}`,
							},
						},
					);
					if (!response.ok) {
						throw new Error(`HTTP error! status: ${response.status}`);
					}
					const data: CoverageTypeApi[] = await response.json();
					const options = data.map((item) => ({
						value: item.id.toString(),
						label: item.name,
					}));
					setDynamicCoverageTypeOptions(options);
					form.setValue("coverageType", ""); // Reset coverageType when insuranceType changes
				} catch (error) {
					console.error(
						`Error fetching coverage types for ${selectedInsuranceType}:`,
						error,
					);
				}
			} else {
				setDynamicCoverageTypeOptions([]);
				form.setValue("coverageType", "");
			}
		};
		fetchCoverageTypes();
	}, [selectedInsuranceType, form, token]);

	const resetFormFields = () => {
		form.reset();
	};

	const onSubmit = (values: z.infer<typeof formSchema>) => {
		const newProduct: Omit<Product, "id"> = {
			insuranceType: values.insuranceType,
			coverageType: values.coverageType,
			description: values.description,
			pricing: Number.parseFloat(values.pricing),
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
										<PlusCircle className="mr-2 h-4 w-4" /> Create Product
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
