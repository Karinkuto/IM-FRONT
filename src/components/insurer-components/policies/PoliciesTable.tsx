import type { FC } from "react";
import { DataTable } from "@/components/ui/data-table";
import type { Policy } from "@/types/policy";
import { columns } from "./policy-columns";

interface PoliciesTableProps {
	policies: Policy[];
	toolbarActionsPrefix?: React.ReactNode;
}

export const PoliciesTable: FC<PoliciesTableProps> = ({
	policies,
	toolbarActionsPrefix,
}) => {
	return (
		<DataTable
			columns={columns}
			data={policies}
			toolbarActionsPrefix={toolbarActionsPrefix}
		/>
	);
};
