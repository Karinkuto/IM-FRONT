import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { useGetAllInsuranceTypesQuery } from "@/redux/apis/productApi";
import type { InsuranceType as QuotationInsuranceType } from "@/types/insurance";
import type {
	Product,
	InsuranceType as ProductInsuranceType,
} from "@/types/product";

// Create a union type for insurance types from both sources
type CombinedInsuranceType = ProductInsuranceType | QuotationInsuranceType;

const formSchema = z.object({
	name: z.string().min(1, "Product name is required"),
	insuranceType: z.string().min(1, "Insurance type is required"),
	coverageType: z.string().min(1, "Coverage type is required"),
	description: z.string().min(1, "Description is required"),
	estimated_price: z
		.string()
		.regex(/^[0-9]+(\.[0-9]{1,2})?$/, "Please enter a valid price"),
});

type ProductFormValues = z.infer<typeof formSchema>;

interface UseProductFormLogicProps {
	mode: "create" | "edit";
	product?: Product | null;
}

export function useProductFormLogic({ mode, product }: UseProductFormLogicProps) {
	const {
		data: insuranceTypes,
		isLoading: isTypesLoading,
		error: rawTypesError,
		isSuccess: isTypesLoaded,
	} = useGetAllInsuranceTypesQuery(undefined, {
		refetchOnMountOrArgChange: true,
	});

	let typesError: Error | null = null;
	if (rawTypesError instanceof Error) {
		typesError = rawTypesError;
	} else if (rawTypesError) {
		typesError = new Error("Failed to load types");
	}

	const getInsuranceTypeInfo = useCallback(
		(
			productItem: Product,
			types: CombinedInsuranceType[] = []
		): { insuranceType: string; coverageType: string } => {
			let insuranceType = productItem.insuranceType
				? String(productItem.insuranceType)
				: "";
			const coverageType = productItem.coverageType
				? String(productItem.coverageType)
				: "";
			if (!insuranceType && coverageType && types.length > 0) {
				const found = types.find((type) => {
					const coverageTypes =
						"coverage_types" in type ? type.coverage_types : [];
					return coverageTypes?.some((ct) => {
						if (!ct) { return false; }
						if (typeof ct === "string") { return ct === coverageType; }
						return String(ct.id) === coverageType;
					});
				});
				if (found) {
					insuranceType = String(found.id);
				}
			}
			return { insuranceType, coverageType };
		},
		[]
	);

	const getInitialValues = useCallback((): ProductFormValues => {
		if (mode === "edit" && product) {
			const { insuranceType, coverageType } = getInsuranceTypeInfo(
				product,
				insuranceTypes?.data
			);
			return {
				name: product.name || "",
				insuranceType,
				coverageType,
				description: product.description || "",
				estimated_price: product.estimated_price?.toString() || "",
			};
		}
		return {
			name: "",
			insuranceType: "",
			coverageType: "",
			description: "",
			estimated_price: "",
		};
	}, [mode, product, insuranceTypes?.data, getInsuranceTypeInfo]);

	const [initialValues, setInitialValues] = useState<ProductFormValues>(() =>
		getInitialValues()
	);
	const [selectedInsuranceTypeId, setSelectedInsuranceTypeId] = useState(
		initialValues.insuranceType || ""
	);
	const formRef = useRef<UseFormReturn<ProductFormValues> | null>(null);

	const findMatchingInsuranceType = useCallback((productItem: Product, types: CombinedInsuranceType[]): string | undefined => {
		if (!(productItem?.insuranceType && types)) { return; }
		const typeMatch = types.find((t) => String(t.id) === String(productItem.insuranceType));
		return typeMatch ? String(typeMatch.id) : undefined;
	}, []);

	const updateFormValues = useCallback((values: ProductFormValues) => {
		setInitialValues(values);
		setSelectedInsuranceTypeId(values.insuranceType || "");

		if (!formRef.current) {
			return;
		}

		formRef.current.reset(values);

		if (values.coverageType) {
			formRef.current.setValue("coverageType", values.coverageType, { shouldValidate: true });
		} else {
			formRef.current.setValue("coverageType", "", { shouldValidate: false });
		}
	}, []);

	const updateForm = useCallback(() => {
		if (!(isTypesLoaded || isTypesLoading)) { return; }

		const newValues = getInitialValues();

		if (mode === "edit" && product?.insuranceType && !newValues.insuranceType && insuranceTypes?.data) {
			const matchedTypeId = findMatchingInsuranceType(product, insuranceTypes.data);
			if (matchedTypeId) {
				newValues.insuranceType = matchedTypeId;
			}
		}

		updateFormValues(newValues);
	}, [
		isTypesLoaded,
		isTypesLoading,
		getInitialValues,
		mode,
		product,
		insuranceTypes?.data,
		findMatchingInsuranceType,
		updateFormValues
	]);

	useEffect(() => {
		updateForm();
	}, [updateForm]);

	const selectedInsuranceType = useMemo(() => {
		if (mode === "edit" && product?.insuranceType && insuranceTypes?.data) {
			const typeId = String(product.insuranceType);
			const matched = insuranceTypes.data.find((t) => String(t.id) === typeId);
			if (matched) {
				setSelectedInsuranceTypeId(typeId);
				return matched;
			}
		}
		return insuranceTypes?.data?.find(
			(type) => String(type.id) === String(selectedInsuranceTypeId)
		);
	}, [insuranceTypes, selectedInsuranceTypeId, mode, product]);

	return {
		insuranceTypes,
		isTypesLoading,
		typesError,
		isTypesLoaded,
		initialValues,
		selectedInsuranceTypeId,
		setSelectedInsuranceTypeId,
		selectedInsuranceType,
		formRef,
		formSchema,
	};
}
