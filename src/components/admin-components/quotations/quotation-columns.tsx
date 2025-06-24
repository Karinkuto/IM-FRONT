"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { QuotationRequest, QuotationStatus } from "@/types/quotation";
import type { ColumnDef } from "@tanstack/react-table";
import { CheckCircle, Eye, MoreHorizontal, XCircle } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const columns: ColumnDef<QuotationRequest>[] = [
  {
    id: "user",
    accessorFn: (row) => row.user.customer.full_name,
    header: "User",
    cell: ({ row }) => {
      const customer = row.original.user.customer;
      const phoneNumber = row.original.user.phone_number;

      const initials = customer.full_name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase();

      return (
        <div className="flex items-center gap-2">
          <Avatar className="h-10 w-10 rounded-md">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium">{customer.full_name}</span>
            <span className="text-sm text-gray-500">{phoneNumber}</span>
            <span className="text-sm text-gray-500">Age: {customer.age}</span>
          </div>
        </div>
      );
    },
  },
  {
    id: "requestType",
    accessorFn: (row) => row.request_summary.request_type,
    header: "Request Type",
    cell: ({ row }) => {
      const requestType = row.original.request_summary.request_type;
      return <Badge variant="outline">{requestType}</Badge>;
    },
  },
  {
    id: "entitySummary",
    accessorFn: (row) => row.request_summary.entity_summary,
    header: "Vehicle",
    cell: ({ row }) => {
      const entitySummary = row.original.request_summary.entity_summary;
      const plateNumber = row.original.insured_entity.entity.plate_number;
      return (
        <div className="flex flex-col">
          <span className="font-medium">{entitySummary}</span>
          <span className="text-sm text-gray-500 font-mono">{plateNumber}</span>
        </div>
      );
    },
  },
  {
    id: "estimatedValue",
    accessorFn: (row) => row.request_summary.estimated_value,
    header: "Estimated Value",
    cell: ({ row }) => {
      const value = parseFloat(row.original.request_summary.estimated_value);
      return <div className="font-medium">ETB {value.toLocaleString()}</div>;
    },
  },
  {
    id: "insurer",
    accessorFn: (row) => row.insurance_product.insurer.name,
    header: "Insurer",
    cell: ({ row }) => {
      const insurer = row.original.insurance_product.insurer;
      return (
        <div className="flex flex-col">
          <span className="font-medium">{insurer.name}</span>
          <span className="text-sm text-gray-500">
            ETB{" "}
            {parseFloat(
              row.original.insurance_product.estimated_price
            ).toLocaleString()}
          </span>
        </div>
      );
    },
  },
  {
    id: "riskProfile",
    accessorFn: (row) => row.request_summary.user_risk_profile.total_entities,
    header: "Risk Profile",
    cell: ({ row }) => {
      const riskProfile = row.original.request_summary.user_risk_profile;
      return (
        <div className="flex flex-col text-sm">
          <span>Entities: {riskProfile.total_entities}</span>
          <span>Policies: {riskProfile.total_policies}</span>
          <span
            className={
              riskProfile.verified_status ? "text-green-600" : "text-red-600"
            }
          >
            {riskProfile.verified_status ? "Verified" : "Unverified"}
          </span>
        </div>
      );
    },
  },
  {
    id: "requestAge",
    accessorFn: (row) => row.request_summary.request_age_days,
    header: "Age",
    cell: ({ row }) => {
      const ageDays = row.original.request_summary.request_age_days;
      return (
        <div className="text-sm">
          {ageDays === 0 ? "Today" : `${ageDays} day${ageDays > 1 ? "s" : ""}`}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as QuotationStatus;
      return (
        <Badge
          variant={
            `status-${status}` as
              | "status-draft"
              | "status-pending"
              | "status-approved"
              | "status-rejected"
          }
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-center">Actions</div>,
    cell: ({ row, table }) => {
      const quotation = row.original;
      const { onViewDetails, onStatusChange } = table.options.meta as {
        onViewDetails: (id: number) => void;
        onStatusChange: (id: number, status: QuotationStatus) => void;
      };

      return (
        <div className="text-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onViewDetails(quotation.id)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {quotation.status === "pending" && (
                <>
                  <DropdownMenuItem
                    onClick={() => onStatusChange(quotation.id, "approved")}
                    className="text-green-600"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onStatusChange(quotation.id, "rejected")}
                    className="text-red-600"
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
