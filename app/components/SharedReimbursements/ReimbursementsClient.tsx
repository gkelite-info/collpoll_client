"use client";

import { useCallback, useEffect, useState } from "react";
import { useUser } from "@/app/utils/context/UserContext";
import ConfirmDeleteModal from "@/app/(screens)/admin/calendar/components/ConfirmDeleteModal";
import { deleteEmployeeExpenseReport, fetchEmployeeExpenseReports, type EmployeeExpenseReport } from "@/lib/helpers/reimbursements/employeeExpenseReportsAPI";
import toast from "react-hot-toast";
import ReimbursementDetailsModal from "./components/ReimbursementDetailsModal";
import ReimbursementsList from "./components/ReimbursementsList";
import SubmitReimbursement from "./components/SubmitReimbursement";

export default function ReimbursementsClient() {
  const { userId, collegeId, loading: userLoading } = useUser();
  const [mode, setMode] = useState<"list" | "form">("list");
  const [reports, setReports] = useState<EmployeeExpenseReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<EmployeeExpenseReport | null>(null);
  const [editingReport, setEditingReport] = useState<EmployeeExpenseReport | null>(null);
  const [deletingReport, setDeletingReport] = useState<EmployeeExpenseReport | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReports = useCallback(async () => {
    if (!userId || !collegeId) return;
    setLoading(true);
    setError(null);
    try {
      setReports(await fetchEmployeeExpenseReports(userId, collegeId));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load reimbursements.");
    } finally {
      setLoading(false);
    }
  }, [collegeId, userId]);

  useEffect(() => {
    if (userLoading) return;
    if (!userId || !collegeId) {
      setLoading(false);
      setError("Employee context is unavailable.");
      return;
    }
    void loadReports();
  }, [collegeId, loadReports, userId, userLoading]);

  if (mode === "form") {
    return <SubmitReimbursement initialReport={editingReport} onBack={() => { setEditingReport(null); setMode("list"); }} onSubmitted={() => void loadReports()} />;
  }

  const confirmDelete = async () => {
    if (!deletingReport || !userId || !collegeId) return;
    setIsDeleting(true);
    try {
      await deleteEmployeeExpenseReport(deletingReport.employeeExpenseReportId, userId, collegeId);
      toast.success("Reimbursement request deleted successfully.");
      setDeletingReport(null);
      await loadReports();
    } catch (deleteError) {
      toast.error(deleteError instanceof Error ? deleteError.message : "Could not delete the reimbursement request.");
    } finally {
      setIsDeleting(false);
    }
  };

  return <>
    <ReimbursementsList reports={reports} loading={loading} error={error} onCreate={() => { setEditingReport(null); setMode("form"); }} onViewDetails={setSelectedReport} onEdit={(report) => { setEditingReport(report); setMode("form"); }} onDelete={setDeletingReport}/>
    {selectedReport && (
      <ReimbursementDetailsModal
        report={selectedReport}
        onClose={() => setSelectedReport(null)}
      />
    )}
    <ConfirmDeleteModal
      open={Boolean(deletingReport)}
      onConfirm={() => void confirmDelete()}
      onCancel={() => setDeletingReport(null)}
      isDeleting={isDeleting}
      title="Delete"
      name="reimbursement request"
      itemName={deletingReport?.expenseTitle}
      confirmText="Yes, Delete"
      loadingText="Deleting..."
      customDescription={<>Are you sure you want to delete <strong>{deletingReport?.expenseTitle}</strong>? This pending request will be removed from your list.</>}
      actionType="remove"
    />
  </>;
}
