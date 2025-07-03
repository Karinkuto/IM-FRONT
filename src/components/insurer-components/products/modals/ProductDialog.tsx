import { Info } from "lucide-react";
import { toast } from "sonner";
import { FormModal } from "@/components/ui/FormModal";
import type { Product } from "@/types/product";
import { ProductFormFields } from "./ProductFormFields";
import { useProductFormLogic } from "./useProductFormLogic";

interface ProductDialogProps {
	mode: "create" | "edit";
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	onSubmit: (values: unknown) => Promise<void>;
	isLoading: boolean;
	product?: Product | null;
}

type FormValues = {
	name: string;
	insuranceType: string;
	coverageType: string;
	description: string;
	estimated_price: string;
};

export function ProductDialog({
	mode,
	isOpen,
	onOpenChange,
	onSubmit,
	isLoading,
	product,
}: ProductDialogProps) {
	const {
		initialValues,
		formRef,
		formSchema,
		insuranceTypes,
		isTypesLoading,
		typesError,
		selectedInsuranceType,
		setSelectedInsuranceTypeId,
	} = useProductFormLogic({ mode, product });

	// Dynamic left section
	const leftSection = (
		<div className="h-full rounded-lg bg-muted/50 p-6">
			<div className="space-y-4">
				<div className="flex items-center gap-3">
					<div className="rounded-full bg-primary/10 p-2">
						<Info className="h-5 w-5 text-primary" />
					</div>
					<h3 className="font-semibold">
						{mode === "create" ? "Create New Product" : "Edit Product"}
					</h3>
				</div>
				<p className="text-muted-foreground text-sm">
					{mode === "create"
						? "Fill in the product details to create a new insurance product. All fields are required."
						: "Update the product details. All fields are required."}
				</p>
				<div className="space-y-2 pt-4">
					<h4 className="font-medium text-sm">Tips:</h4>
					<ul className="list-disc space-y-2 pl-4 text-muted-foreground text-sm">
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
	const handleSubmit = async (values: FormValues) => {
		try {
			const payload = {
				name: values.name,
				description: values.description,
				estimated_price: Number.parseFloat(values.estimated_price),
				coverage_type_id: values.coverageType,
			};

			const productData = {
				...(mode === "edit" && product ? product : {}),
				...payload,
				insuranceType: values.insuranceType,
				coverageType: values.coverageType,
			};

			await onSubmit(productData);
			toast.success(
				`Product ${mode === "create" ? "created" : "updated"} successfully`
			);
			onOpenChange(false);

			if (formRef.current) {
				formRef.current.reset(initialValues);
			}
		} catch (_error) {
			const errorMessage =
				mode === "edit"
					? "Failed to update product"
					: "Failed to create product";
			toast.error(errorMessage);
		}
	};

	return (
		<FormModal
			description={
				mode === "create"
					? "Fill in the product details to create a new insurance product. All fields are required."
					: "Update the product details. All fields are required."
			}
			initialValues={initialValues}
			isLoading={isLoading}
			leftSection={leftSection}
			mode={mode}
			onOpenChange={onOpenChange}
			onSubmit={handleSubmit}
			open={isOpen}
			renderFields={(form) => (
				<ProductFormFields
					form={form}
					insuranceTypes={insuranceTypes}
					isTypesLoading={isTypesLoading}
					selectedInsuranceType={selectedInsuranceType}
					setSelectedInsuranceTypeId={setSelectedInsuranceTypeId}
					typesError={typesError}
				/>
			)}
			title={mode === "create" ? "Create New Product" : "Edit Product"}
			validationSchema={formSchema}
		/>
	);
}
