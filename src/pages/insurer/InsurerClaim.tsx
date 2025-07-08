import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
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
  const [searchTerm, setSearchTerm] = useState("");
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

  const filteredClaims = useMemo(() => {
    return mockClaims.filter((claim) => {
      const matchesSearch =
        claim.claimNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.policyNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.claimantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || claim.status === statusFilter;
      const matchesType =
        claimTypeFilter === "all" || claim.claimType === claimTypeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [searchTerm, statusFilter, claimTypeFilter]);

  const stats = useMemo(() => {
    const total = mockClaims.length;
    const pending = mockClaims.filter((c) => c.status === "pending").length;
    const approved = mockClaims.filter((c) => c.status === "approved").length;
    const settled = mockClaims.filter((c) => c.status === "settled").length;
    const totalAmount = mockClaims.reduce((sum, c) => sum + c.amount, 0);
    return { total, pending, approved, settled, totalAmount };
  }, []);

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

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-10"
                placeholder="Search by claim #, policy # or name"
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearchTerm(e.target.value)
                }
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {[
                  "all",
                  "pending",
                  "under_review",
                  "approved",
                  "settled",
                  "rejected",
                ].map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.replace("_", " ").toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={claimTypeFilter} onValueChange={setClaimTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Claim Type" />
              </SelectTrigger>
              <SelectContent>
                {[
                  "all",
                  "Collision/Accident",
                  "Theft",
                  "Fire",
                  "Natural Disaster",
                  "Vandalism",
                  "Other",
                ].map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {(searchTerm ||
              statusFilter !== "all" ||
              claimTypeFilter !== "all") && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setClaimTypeFilter("all");
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Claims Table */}
      <Card>
        <CardHeader>
          <CardTitle>Claims ({filteredClaims.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Claim #</TableHead>
                  <TableHead>Policy #</TableHead>
                  <TableHead>Claimant</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Incident Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClaims.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-6">
                      <div className="text-muted-foreground">
                        No claims found.
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredClaims.map((claim) => (
                    <TableRow key={claim.id}>
                      <TableCell>{claim.claimNumber}</TableCell>
                      <TableCell>{claim.policyNumber}</TableCell>
                      <TableCell>{claim.claimantName}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{claim.claimType}</Badge>
                      </TableCell>
                      <TableCell>{formatDate(claim.incidentDate)}</TableCell>
                      <TableCell>{formatCurrency(claim.amount)}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(claim.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(claim.status)}
                            {claim.status.replace("_", " ").toLowerCase()}
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
