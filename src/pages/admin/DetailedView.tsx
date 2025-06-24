import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Separator } from "@/components/ui/separator";
import {
  fetchQuotationById,
  updateQuotationStatus,
} from "@/services/quotationService";
import type { QuotationRequest, QuotationStatus } from "@/types/quotation";
import {
  ArrowLeft,
  CheckCircle,
  Mail,
  MapPin,
  Phone,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function DetailedView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quotation, setQuotation] = useState<QuotationRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const getQuotationDetails = async () => {
      if (!id) return;

      setIsLoading(true);
      setError(null);
      try {
        const fetchedQuotation = await fetchQuotationById(parseInt(id));
        setQuotation(fetchedQuotation || null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    getQuotationDetails();
  }, [id]);

  const handleStatusChange = async (newStatus: QuotationStatus) => {
    if (!quotation) return;

    try {
      const updated = await updateQuotationStatus(quotation.id, newStatus);
      if (updated) {
        setQuotation(updated);
      }
    } catch (err) {
      console.error("Failed to update quotation status:", err);
    }
  };

  const getStatusBadgeVariant = (status: QuotationStatus) => {
    switch (status) {
      case "approved":
        return "default";
      case "rejected":
        return "destructive";
      case "pending":
        return "secondary";
      case "draft":
        return "outline";
      default:
        return "outline";
    }
  };

  const formatCurrency = (value: string) => {
    const numValue = parseFloat(value);
    return `ETB ${numValue.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !quotation) {
    return (
      <div className="flex justify-center items-center h-full min-h-[calc(100vh-80px)] text-red-500">
        <p className="text-lg font-medium">
          {error ? `Error: ${error.message}` : "Quotation not found"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {" "}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/insurer/quotation-requests")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Quotations
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              Quotation Request #{quotation.id}
            </h1>
            <p className="text-muted-foreground">
              Created on {formatDate(quotation.created_at)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={getStatusBadgeVariant(quotation.status)}>
            {quotation.status.charAt(0).toUpperCase() +
              quotation.status.slice(1)}
          </Badge>
          {quotation.status === "pending" && (
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => handleStatusChange("approved")}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleStatusChange("rejected")}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 font-semibold">
                  {quotation.user.customer.first_name[0]}
                  {quotation.user.customer.last_name[0]}
                </span>
              </div>
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-lg">
                {quotation.user.customer.full_name}
              </h4>
              <p className="text-muted-foreground">
                {quotation.user.customer.gender} • Age{" "}
                {quotation.user.customer.age}
              </p>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{quotation.user.phone_number}</span>
              </div>
              {quotation.user.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{quotation.user.email}</span>
                </div>
              )}
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                <div>
                  <p className="font-medium">Current Address:</p>
                  <p className="text-sm text-muted-foreground">
                    {quotation.user.customer.current_address.house_number},{" "}
                    {quotation.user.customer.current_address.woreda},{" "}
                    {quotation.user.customer.current_address.subcity},{" "}
                    {quotation.user.customer.current_address.region}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h5 className="font-medium mb-2">Account Status</h5>
              <div className="flex items-center gap-2">
                <Badge
                  variant={quotation.user.verified ? "default" : "secondary"}
                >
                  {quotation.user.verified ? "Verified" : "Unverified"}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Role: {quotation.user.roles.join(", ")}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vehicle Information */}
        <Card>
          <CardHeader>
            <CardTitle>Vehicle Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-lg">
                {quotation.insured_entity.entity.year_of_manufacture}{" "}
                {quotation.insured_entity.entity.make}{" "}
                {quotation.insured_entity.entity.model}
              </h4>
              <p className="text-muted-foreground font-mono">
                {quotation.insured_entity.entity.plate_number}
              </p>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium">Chassis Number</p>
                <p className="text-muted-foreground font-mono">
                  {quotation.insured_entity.entity.chassis_number}
                </p>
              </div>
              <div>
                <p className="font-medium">Engine Number</p>
                <p className="text-muted-foreground font-mono">
                  {quotation.insured_entity.entity.engine_number}
                </p>
              </div>
              <div>
                <p className="font-medium">Estimated Value</p>
                <p className="text-muted-foreground">
                  {formatCurrency(
                    quotation.insured_entity.entity.estimated_value
                  )}
                </p>
              </div>
              <div>
                <p className="font-medium">Entity Type</p>
                <p className="text-muted-foreground">
                  {quotation.insured_entity.entity.entity_type}
                </p>
              </div>
            </div>

            {/* Vehicle Photos */}
            {(quotation.insured_entity.entity.front_view_photo_url ||
              quotation.insured_entity.entity.back_view_photo_url) && (
              <>
                <Separator />
                <div>
                  <h5 className="font-medium mb-2">Vehicle Photos</h5>
                  <div className="grid grid-cols-2 gap-2">
                    {quotation.insured_entity.entity.front_view_photo_url && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Front View
                        </p>
                        <img
                          src={
                            quotation.insured_entity.entity.front_view_photo_url
                          }
                          alt="Front view"
                          className="w-full h-24 object-cover rounded border"
                        />
                      </div>
                    )}
                    {quotation.insured_entity.entity.back_view_photo_url && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Back View
                        </p>
                        <img
                          src={
                            quotation.insured_entity.entity.back_view_photo_url
                          }
                          alt="Back view"
                          className="w-full h-24 object-cover rounded border"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Insurance Information */}
        <Card>
          <CardHeader>
            <CardTitle>Insurance Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-lg">
                {quotation.insurance_product.name}
              </h4>
              <p className="text-muted-foreground">
                {quotation.insurance_product.description}
              </p>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium">Coverage Type:</span>
                <Badge variant="outline">{quotation.coverage_type.name}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Insurance Type:</span>
                <span>{quotation.coverage_type.insurance_type.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Estimated Price:</span>
                <span className="font-semibold">
                  {formatCurrency(quotation.insurance_product.estimated_price)}
                </span>
              </div>
            </div>

            <Separator />

            <div>
              <h5 className="font-medium mb-2">Insurer Details</h5>
              <div className="space-y-2 text-sm">
                <p className="font-medium">
                  {quotation.insurance_product.insurer.name}
                </p>
                <p className="text-muted-foreground">
                  {quotation.insurance_product.insurer.description}
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    <span>
                      {quotation.insurance_product.insurer.contact_email}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    <span>
                      {quotation.insurance_product.insurer.contact_phone}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Risk Profile & Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Risk Profile & Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h5 className="font-medium mb-2">Request Summary</h5>
              <p className="text-sm text-muted-foreground mb-2">
                {quotation.request_summary.entity_summary}
              </p>
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {quotation.request_summary.request_type}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Completeness: {quotation.request_summary.completeness_score}%
                </span>
              </div>
            </div>

            <Separator />

            <div>
              <h5 className="font-medium mb-2">User Risk Profile</h5>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="font-medium">Account Age</p>
                  <p className="text-muted-foreground">
                    {
                      quotation.request_summary.user_risk_profile
                        .account_age_days
                    }{" "}
                    days
                  </p>
                </div>
                <div>
                  <p className="font-medium">Total Entities</p>
                  <p className="text-muted-foreground">
                    {quotation.request_summary.user_risk_profile.total_entities}
                  </p>
                </div>
                <div>
                  <p className="font-medium">Total Policies</p>
                  <p className="text-muted-foreground">
                    {quotation.request_summary.user_risk_profile.total_policies}
                  </p>
                </div>
                <div>
                  <p className="font-medium">Quote Requests</p>
                  <p className="text-muted-foreground">
                    {
                      quotation.request_summary.user_risk_profile
                        .total_quotation_requests
                    }
                  </p>
                </div>
              </div>
              <div className="mt-2">
                <Badge
                  variant={
                    quotation.request_summary.user_risk_profile
                      .has_active_policies
                      ? "default"
                      : "secondary"
                  }
                >
                  {quotation.request_summary.user_risk_profile
                    .has_active_policies
                    ? "Has Active Policies"
                    : "No Active Policies"}
                </Badge>
              </div>
            </div>

            {quotation.form_data.additional_notes && (
              <>
                <Separator />
                <div>
                  <h5 className="font-medium mb-2">Additional Notes</h5>
                  <p className="text-sm text-muted-foreground">
                    {quotation.form_data.additional_notes}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
