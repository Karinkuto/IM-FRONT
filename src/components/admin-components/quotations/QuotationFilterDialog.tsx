import type React from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import type { QuotationFilters as QuotationFiltersType } from "@/types/quotation";
import { QuotationFilters } from "./QuotationFilters";

interface QuotationFilterDialogProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	onApplyFilters: (filters: QuotationFiltersType) => void;
	currentFilters: QuotationFiltersType;
}

export const QuotationFilterDialog: React.FC<QuotationFilterDialogProps> = ({
	isOpen,
	onOpenChange,
	onApplyFilters,
	currentFilters,
}) => {
	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Filter Quotations</DialogTitle>
				</DialogHeader>
				<QuotationFilters
					onFilterChange={onApplyFilters}
					currentFilters={currentFilters}
				/>
			</DialogContent>
		</Dialog>
	);
};
