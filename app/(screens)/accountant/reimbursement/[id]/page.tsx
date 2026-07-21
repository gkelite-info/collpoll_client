"use client";

import { use, useEffect, useState } from "react";
import { notFound } from "next/navigation";
import ProcessPayment from "../components/ProcessPayment";
import { ReimbursementDetailShimmer } from "../components/ReimbursementShimmers";
import {
  fetchReimbursementById,
  type HRReimbursementRequest,
} from "@/lib/helpers/reimbursements/employeeExpenseApprovalsAPI";

export default function ReimbursementPaymentPage({ params }: { params: Promise<{ id: string }> }) {
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
        if (!data || !["approved", "paid", "payment_rejected"].includes(data.status?.toLowerCase() ?? "")) setError(true);
        else setRequest(data);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [invalidReportId, reportId]);

  if (loading) return <ReimbursementDetailShimmer />;

  if (error || !request) return notFound();

  return <ProcessPayment request={request} />;
}
