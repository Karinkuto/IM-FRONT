"use client";

import { rankItem } from "@tanstack/match-sorter-utils";
import {
	type ColumnDef,
	type ColumnFiltersState,
	type FilterFn,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type SortingState,
	useReactTable,
	type VisibilityState,
} from "@tanstack/react-table";
import { ChevronDown } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import type { QuotationStatus } from "@/types/quotation";

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	toolbarActionsPrefix?: React.ReactNode; // New prop for prefix actions
	// Expose onEditProduct and onDeleteProduct through table options meta
	meta?: {
		onEditProduct?: (id: string) => void;
		onDeleteProduct?: (id: string) => void;
		onViewDetails?: (id: string) => void;
		onStatusChange?: (id: string, newStatus: QuotationStatus) => void;
	};
}

export function DataTable<TData, TValue>({
	columns,
	data,
	toolbarActionsPrefix, // Destructure new prop
	meta,
}: DataTableProps<TData, TValue>) {
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
		[]
	);
	const [columnVisibility, setColumnVisibility] =
		React.useState<VisibilityState>({}); // Control column visibility
	const [rowSelection, setRowSelection] = React.useState({}); // If you need row selection
	const [globalFilter, setGlobalFilter] = React.useState(""); // New state for global filter

	// Define fuzzy filter function
	const fuzzyFilter: FilterFn<TData> = (row, columnId, value, addMeta) => {
		// Rank the item
		const itemRank = rankItem(row.getValue(columnId), value);

		// Store the itemRank on the row for sorting
		addMeta({
			itemRank,
		});

		// Return if the item should be filtered in/out
		return itemRank.passed;
	};

	const table = useReactTable({
		data,
		columns,
		meta, // Pass meta to the table instance
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(), // For pagination
		onSortingChange: setSorting,
		getSortedRowModel: getSortedRowModel(), // For sorting
		onColumnFiltersChange: setColumnFilters,
		getFilteredRowModel: getFilteredRowModel(), // For filtering
		onColumnVisibilityChange: setColumnVisibility, // For column visibility
		onRowSelectionChange: setRowSelection, // For row selection
		onGlobalFilterChange: setGlobalFilter, // New: for global filter
		globalFilterFn: fuzzyFilter, // New: apply fuzzy filter globally
		state: {
			sorting,
			columnFilters,
			columnVisibility,
			rowSelection,
			globalFilter, // New: global filter state
		},
		autoResetPageIndex: false, // Prevent page reset on data change
	});

	return (
		<div>
			{/* Toolbar: Create Button, Filtering Input, and Column Visibility Dropdown */}
			<div className="flex items-center justify-between py-4">
				<div className="flex flex-1 items-center gap-2">
					<Input
						className="h-10 max-w-sm" // Updated placeholder
						onChange={(event) => setGlobalFilter(event.target.value)} // Use globalFilter state
						placeholder="Search all columns..." // Update globalFilter
						value={globalFilter ?? ""}
					/>
				</div>
				<div className="flex items-center gap-2">
					{toolbarActionsPrefix && <div>{toolbarActionsPrefix}</div>}
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button className="ml-auto" variant="outline">
								Columns <ChevronDown className="ml-2 h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							{table
								.getAllColumns()
								.filter((column) => column.getCanHide())
								.map((column) => {
									return (
										<DropdownMenuCheckboxItem
											checked={column.getIsVisible()}
											className="capitalize"
											key={column.id}
											onCheckedChange={(value) =>
												column.toggleVisibility(!!value)
											}
										>
											{column.id}
										</DropdownMenuCheckboxItem>
									);
								})}
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>

			{/* Table */}
			<div className="rounded-md border">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => {
									return (
										<TableHead key={header.id}>
											{header.isPlaceholder
												? null
												: flexRender(
														header.column.columnDef.header,
														header.getContext()
													)}
										</TableHead>
									);
								})}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow
									data-state={row.getIsSelected() && "selected"}
									key={row.id}
								>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext()
											)}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									className="h-24 text-center"
									colSpan={columns.length}
								>
									No results.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			{/* Pagination Controls */}
			<div className="flex items-center justify-end space-x-2 py-4">
				<Button
					disabled={!table.getCanPreviousPage()}
					onClick={() => table.previousPage()}
					size="sm"
					variant="outline"
				>
					Previous
				</Button>
				<Button
					disabled={!table.getCanNextPage()}
					onClick={() => table.nextPage()}
					size="sm"
					variant="outline"
				>
					Next
				</Button>
			</div>
		</div>
	);
}
