import { useState, useMemo } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Download,
  Eye,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface Claim {
  id: string;
  claimNumber: string;
  policyNumber: string;
  claimantName: string;
  incidentDate: string;
  claimDate: string;
  claimType:
    | "Collision/Accident"
    | "Theft"
    | "Fire"
    | "Natural Disaster"
    | "Vandalism"
    | "Other";
  status: "pending" | "under_review" | "approved" | "rejected" | "settled";
  amount: number;
  description: string;
  location: string;
}

const mockClaims: Claim[] = [
  {
    id: "1",
    claimNumber: "CLM-2024-001234",
    policyNumber: "POL-2023-001234",
    claimantName: "Samuel Asmare Zerefs",
    incidentDate: "2024-01-15",
    claimDate: "2024-01-16",
    claimType: "Collision/Accident",
    status: "pending",
    amount: 15000,
    description: "Vehicle collision with minor damages to front bumper",
    location: "Addis Ababa, Kirkos",
  },
  {
    id: "2",
    claimNumber: "CLM-2024-001235",
    policyNumber: "POL-2023-001235",
    claimantName: "Meron Tadesse",
    incidentDate: "2024-01-10",
    claimDate: "2024-01-11",
    claimType: "Theft",
    status: "under_review",
    amount: 25000,
    description: "Vehicle stolen from parking lot",
    location: "Addis Ababa, Bole",
  },
  {
    id: "3",
    claimNumber: "CLM-2024-001236",
    policyNumber: "POL-2023-001236",
    claimantName: "Dawit Alemayehu",
    incidentDate: "2024-01-08",
    claimDate: "2024-01-09",
    claimType: "Fire",
    status: "approved",
    amount: 45000,
    description: "Engine fire caused significant damage",
    location: "Addis Ababa, Lideta",
  },
  {
    id: "4",
    claimNumber: "CLM-2024-001237",
    policyNumber: "POL-2023-001237",
    claimantName: "Hanna Bekele",
    incidentDate: "2024-01-05",
    claimDate: "2024-01-06",
    claimType: "Natural Disaster",
    status: "settled",
    amount: 12000,
    description: "Hail damage to vehicle roof and windows",
    location: "Addis Ababa, Yeka",
  },
  {
    id: "5",
    claimNumber: "CLM-2024-001238",
    policyNumber: "POL-2023-001238",
    claimantName: "Yonas Getachew",
    incidentDate: "2024-01-03",
    claimDate: "2024-01-04",
    claimType: "Vandalism",
    status: "rejected",
    amount: 8000,
    description: "Intentional damage to vehicle exterior",
    location: "Addis Ababa, Arada",
  },
];

export default function InsurerClaim() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [claimTypeFilter, setClaimTypeFilter] = useState("all");

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "pending":
        return "status-pending";
      case "under_review":
        return "status-draft";
      case "approved":
        return "status-approved";
      case "settled":
        return "status-approved";
      case "rejected":
        return "status-rejected";
      default:
        return "status-pending";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "under_review":
        return <FileText className="h-4 w-4" />;
      case "approved":
      case "settled":
        return <CheckCircle className="h-4 w-4" />;
      case "rejected":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-ET", {
      style: "currency",
      currency: "ETB",
    }).format(amount);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-ET", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  // Define columns for the DataTable
  const columns: ColumnDef<Claim>[] = [
    {
      accessorKey: "claimNumber",
      header: "Claim #",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("claimNumber")}</div>
      ),
    },
    {
      accessorKey: "policyNumber",
      header: "Policy #",
    },
    {
      accessorKey: "claimantName",
      header: "Claimant",
    },
    {
      accessorKey: "claimType",
      header: "Type",
      cell: ({ row }) => (
        <Badge variant="outline">{row.getValue("claimType")}</Badge>
      ),
    },
    {
      accessorKey: "incidentDate",
      header: "Incident Date",
      cell: ({ row }) => formatDate(row.getValue("incidentDate")),
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => (
        <div className="font-medium">
          {formatCurrency(row.getValue("amount"))}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge variant={getStatusBadgeVariant(status)}>
            <div className="flex items-center gap-1">
              {getStatusIcon(status)}
              {status.replace("_", " ").toLowerCase()}
            </div>
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            console.log("View claim:", row.original.id);
            // Navigate to claim details
          }}
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  // Filter data based on status and claim type filters
  const filteredClaims = useMemo(() => {
    return mockClaims.filter((claim) => {
      const matchesStatus =
        statusFilter === "all" || claim.status === statusFilter;
      const matchesType =
        claimTypeFilter === "all" || claim.claimType === claimTypeFilter;
      return matchesStatus && matchesType;
    });
  }, [statusFilter, claimTypeFilter]);

  const stats = useMemo(() => {
    const total = mockClaims.length;
    const pending = mockClaims.filter((c) => c.status === "pending").length;
    const approved = mockClaims.filter((c) => c.status === "approved").length;
    const settled = mockClaims.filter((c) => c.status === "settled").length;
    const totalAmount = mockClaims.reduce((sum, c) => sum + c.amount, 0);
    return { total, pending, approved, settled, totalAmount };
  }, []);

  // Toolbar actions for DataTable
  const toolbarActions = (
    <div className="flex items-center gap-2">
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="under_review">Under Review</SelectItem>
          <SelectItem value="approved">Approved</SelectItem>
          <SelectItem value="settled">Settled</SelectItem>
          <SelectItem value="rejected">Rejected</SelectItem>
        </SelectContent>
      </Select>

      <Select value={claimTypeFilter} onValueChange={setClaimTypeFilter}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="Collision/Accident">Collision/Accident</SelectItem>
          <SelectItem value="Theft">Theft</SelectItem>
          <SelectItem value="Fire">Fire</SelectItem>
          <SelectItem value="Natural Disaster">Natural Disaster</SelectItem>
          <SelectItem value="Vandalism">Vandalism</SelectItem>
          <SelectItem value="Other">Other</SelectItem>
        </SelectContent>
      </Select>

      {(statusFilter !== "all" || claimTypeFilter !== "all") && (
        <Button
          variant="outline"
          onClick={() => {
            setStatusFilter("all");
            setClaimTypeFilter("all");
          }}
        >
          Clear Filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Claims Management</h1>
          <p className="text-muted-foreground">
            Track and manage submitted claims.
          </p>
        </div>
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {[
          {
            title: "Total Claims",
            value: stats.total,
            icon: <FileText className="h-4 w-4" />,
            note: "All time claims",
          },
          {
            title: "Pending",
            value: stats.pending,
            icon: <Clock className="h-4 w-4 text-orange-500" />,
            note: "Awaiting review",
          },
          {
            title: "Approved",
            value: stats.approved,
            icon: <CheckCircle className="h-4 w-4 text-green-500" />,
            note: "Ready for payment",
          },
          {
            title: "Settled",
            value: stats.settled,
            icon: <CheckCircle className="h-4 w-4 text-blue-500" />,
            note: "Payment completed",
          },
          {
            title: "Total Value",
            value: formatCurrency(stats.totalAmount),
            icon: <FileText className="h-4 w-4" />,
            note: "All claims value",
          },
        ].map(({ title, value, icon, note }) => (
          <Card key={title}>
            <CardHeader className="flex items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{title}</CardTitle>
              {icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{value}</div>
              <p className="text-xs text-muted-foreground">{note}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Claims Table with DataTable */}
      <Card>
        <CardHeader>
          <CardTitle>Claims ({filteredClaims.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={filteredClaims}
            toolbarActionsPrefix={toolbarActions}
          />
        </CardContent>
      </Card>
    </div>
  );
}
