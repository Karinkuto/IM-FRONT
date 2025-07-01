import type { CoverageType as ProductCoverageType } from "./product";
import type {
	CoverageType as QuotationCoverageType,
	InsuranceType as QuotationInsuranceType,
} from "./quotation";

export type InsuranceType = {
	id: string | number;
	name: string;
	description: string;
	coverage_types?: (ProductCoverageType | QuotationCoverageType)[];
};

// Re-export types without causing conflicts
export type { QuotationInsuranceType, QuotationCoverageType };
export type { ProductCoverageType };
