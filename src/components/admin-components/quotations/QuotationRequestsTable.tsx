import type { FC } from "react";
import { useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Dialog } from "@/components/ui/dialog";
import type { QuotationRequest } from "@/types/quotation";
import QuotationDetailsDialog from "./modals/QuotationDetailsDialog";
import { columns } from "./quotation-columns.tsx";

interface QuotationRequestsTableProps {
	quotations: QuotationRequest[];
	onStatusChange: (
		quotationId: number,
		newStatus: QuotationRequest["status"],
	) => void;
	toolbarActionsPrefix?: React.ReactNode;
}

export const QuotationRequestsTable: FC<QuotationRequestsTableProps> = ({
	quotations,
	onStatusChange,
	toolbarActionsPrefix,
}) => {
	const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
	const [selectedQuotationId, setSelectedQuotationId] = useState<string | null>(
		null,
	);

	const onViewDetails = (quotationId: number) => {
		setSelectedQuotationId(quotationId.toString());
		setIsDetailsDialogOpen(true);
	};

	return (
		<>
			<DataTable
				columns={columns}
				data={quotations}
				toolbarActionsPrefix={toolbarActionsPrefix}
				meta={{
					onViewDetails,
					onStatusChange,
				}}
			/>
			<Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
				{/* DialogTrigger is not needed here as we are controlling the open state programmatically */}
				{selectedQuotationId && (
					<QuotationDetailsDialog quotationId={selectedQuotationId} />
				)}
			</Dialog>
		</>
	);
};
