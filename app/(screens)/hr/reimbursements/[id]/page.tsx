"use client";

import { useEffect, useState, use } from "react";
import { notFound } from "next/navigation";
import ReimbursementReview from "../components/ReimbursementReview";
import { HRReimbursementDetailShimmer } from "../components/ReimbursementShimmers";
import { fetchReimbursementById, type HRReimbursementRequest } from "@/lib/helpers/reimbursements/employeeExpenseApprovalsAPI";

export default function ReimbursementDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const reportId = parseInt(id, 10);
  const invalidReportId = Number.isNaN(reportId);
  
  const [request, setRequest] = useState<HRReimbursementRequest | null>(null);
  const [loading, setLoading] = useState(!invalidReportId);
  const [error, setError] = useState(invalidReportId);

  useEffect(() => {
    if (invalidReportId) return;

    fetchReimbursementById(reportId)
      .then((data) => {
        if (!data) setError(true);
        else setRequest(data);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [invalidReportId, reportId]);

  if (loading) return <HRReimbursementDetailShimmer />;
  if (error || !request) return notFound();
  
  return <ReimbursementReview request={request} />;
}
