import { zodResolver } from "@hookform/resolvers/zod";
import { Info, PlusCircle } from "lucide-react";
import type React from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogTrigger,
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
	type ComboboxOption,
	coverageTypeOptions,
	insuranceTypeOptions,
	type Product,
} from "../product-data-types.ts";

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

	const resetFormFields = () => {
		form.reset();
	};

	const onSubmit = (values: z.infer<typeof formSchema>) => {
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

		onProductCreate(newProduct as Product);
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
			<DialogTrigger asChild>
				<Button>
					<PlusCircle className="mr-2 h-4 w-4" /> Create Product
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
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
											render={({ field }) => (
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
