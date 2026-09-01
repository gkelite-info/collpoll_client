"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@/app/utils/context/UserContext";
import ConfirmDeleteModal from "@/app/(screens)/admin/calendar/components/ConfirmDeleteModal";
import { deleteEmployeeExpenseReport, fetchEmployeeExpenseReports, fetchEmployeeExpenseReportStats, type EmployeeExpenseReport } from "@/lib/helpers/reimbursements/employeeExpenseReportsAPI";
import toast from "react-hot-toast";
import ReimbursementDetailsModal from "./components/ReimbursementDetailsModal";
import ReimbursementsList from "./components/ReimbursementsList";
import SubmitReimbursement from "./components/SubmitReimbursement";

export default function ReimbursementsClient() {
  const { userId, collegeId, loading: userLoading } = useUser();
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<"list" | "form">("list");
  const [selectedReport, setSelectedReport] = useState<EmployeeExpenseReport | null>(null);
  const [editingReport, setEditingReport] = useState<EmployeeExpenseReport | null>(null);
  const [deletingReport, setDeletingReport] = useState<EmployeeExpenseReport | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const {
    data: statsData = { total: 0, pending: 0, awaitingPayment: 0, paid: 0, rejected: 0 },
    isLoading: isFetchingStats,
  } = useQuery({
    queryKey: ["employeeExpenseReportStats", userId, collegeId],
    queryFn: async () => {
      if (!userId || !collegeId) throw new Error("Employee context is unavailable.");
      return await fetchEmployeeExpenseReportStats(userId, collegeId);
    },
    enabled: !!userId && !!collegeId && !userLoading,
  });

  const {
    data: reportsData,
    isLoading: isFetchingReports,
    isFetching: isFetchingReportsBackground,
    error: queryError,
  } = useQuery({
    queryKey: ["employeeExpenseReports", userId, collegeId, currentPage, itemsPerPage, sortOrder],
    queryFn: async () => {
      if (!userId || !collegeId) throw new Error("Employee context is unavailable.");
      return await fetchEmployeeExpenseReports(userId, collegeId, currentPage, itemsPerPage, sortOrder);
    },
    enabled: !!userId && !!collegeId && !userLoading,
    placeholderData: (previousData) => previousData,
  });

  const reports = reportsData?.reports || [];
  const totalCount = reportsData?.totalCount || 0;

  const loading = userLoading || isFetchingReports || isFetchingStats;
  const error = queryError instanceof Error ? queryError.message : queryError ? "Unable to load reimbursements." : null;

  if (mode === "form") {
    return <SubmitReimbursement initialReport={editingReport} onBack={() => { setEditingReport(null); setMode("list"); }} onSubmitted={() => { 
      queryClient.invalidateQueries({ queryKey: ["employeeExpenseReports"] }); 
      queryClient.invalidateQueries({ queryKey: ["employeeExpenseReportStats"] }); 
      setCurrentPage(1);
      setMode("list"); 
    }} />;
  }

  const confirmDelete = async () => {
    if (!deletingReport || !userId || !collegeId) return;
    setIsDeleting(true);
    try {
      await deleteEmployeeExpenseReport(deletingReport.employeeExpenseReportId, userId, collegeId);
      toast.success("Reimbursement request deleted successfully.");
      setDeletingReport(null);
      queryClient.invalidateQueries({ queryKey: ["employeeExpenseReports"] });
      queryClient.invalidateQueries({ queryKey: ["employeeExpenseReportStats"] });
    } catch (deleteError) {
      toast.error(deleteError instanceof Error ? deleteError.message : "Could not delete the reimbursement request.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExport = async () => {
    if (!userId || !collegeId) throw new Error("Employee context is unavailable.");
    const limit = Math.max(totalCount, 1);
    const data = await fetchEmployeeExpenseReports(userId, collegeId, 1, limit, sortOrder);
    return data.reports;
  };

  return <>
    <ReimbursementsList reports={reports} totalCount={totalCount} stats={statsData} loading={loading} tableLoading={isFetchingReportsBackground} error={error} currentPage={currentPage} itemsPerPage={itemsPerPage} sortOrder={sortOrder} onPageChange={setCurrentPage} onItemsPerPageChange={setItemsPerPage} onSortChange={setSortOrder} onCreate={() => { setEditingReport(null); setMode("form"); }} onViewDetails={setSelectedReport} onEdit={(report) => { setEditingReport(report); setMode("form"); }} onDelete={setDeletingReport} onExport={handleExport}/>
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
