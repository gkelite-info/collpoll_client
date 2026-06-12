"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import IssueCard from "./IssueCard";
import { Pagination } from "@/app/(screens)/admin/academic-setup/components/pagination";
import IssueCardShimmer from "@/app/utils/shimmers/IssueCardShimmer";
import { useUser } from "@/app/utils/context/UserContext";
import {
  deleteWellbeingSupportIssue,
  fetchStudentWellbeingIssues,
} from "@/lib/helpers/wellbeingSupportIssues/wellbeingSupportIssueAPI";
import type {
  StudentWellbeingIssueListItem,
  StudentWellbeingIssueTab,
} from "@/lib/helpers/wellbeingSupportIssues/types";
import ConfirmDeleteModal from "@/app/(screens)/admin/calendar/components/ConfirmDeleteModal";

const isIssueTab = (tab: string): tab is StudentWellbeingIssueTab =>
  ["raised", "pending", "resolved", "rejected"].includes(tab);

type IssueListProps = {
  onEditIssue: (issue: StudentWellbeingIssueListItem) => void;
};

export default function IssueList({ onEditIssue }: IssueListProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { userId, collegeId } = useUser();

  const tabParam = searchParams.get("tab") || "raised";
  const currentTab: StudentWellbeingIssueTab = isIssueTab(tabParam)
    ? tabParam
    : "raised";
  const currentPageStr = searchParams.get("page") || "1";
  const currentPage = parseInt(currentPageStr, 10) || 1;
  const itemsPerPage = 3;

  const [loading, setLoading] = useState(false);
  const [issues, setIssues] = useState<StudentWellbeingIssueListItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [deletingIssue, setDeletingIssue] =
    useState<StudentWellbeingIssueListItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadIssues = useCallback(async () => {
    if (!userId || !collegeId) return;

    setLoading(true);
    try {
      const result = await fetchStudentWellbeingIssues({
        userId,
        collegeId,
        page: currentPage,
        limit: itemsPerPage,
        tab: currentTab,
      });
      setIssues(result.data);
      setTotalItems(result.totalCount);
    } catch {
      setIssues([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [collegeId, currentPage, currentTab, userId]);

  useEffect(() => {
    loadIssues();
  }, [loadIssues]);

  useEffect(() => {
    window.addEventListener("wellbeing-issue-created", loadIssues);
    return () => window.removeEventListener("wellbeing-issue-created", loadIssues);
  }, [loadIssues]);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    router.push(`?${params.toString()}`);
  };

  const handleDeleteIssue = async () => {
    if (!deletingIssue || !userId || !collegeId) return;

    setDeleting(true);
    try {
      await deleteWellbeingSupportIssue({
        wellbeingSupportIssueId: Number(deletingIssue.id),
        createdBy: userId,
        collegeId,
      });
      toast.success("Wellbeing issue deleted successfully.");
      setDeletingIssue(null);
      await loadIssues();
      window.dispatchEvent(new Event("wellbeing-issue-created"));
    } catch (error) {
      console.error("deleteWellbeingSupportIssue error:", error);
      toast.error("Failed to delete wellbeing issue.");
    } finally {
      setDeleting(false);
    }
  };

  const handleEditIssue = (issue: StudentWellbeingIssueListItem) => {
    onEditIssue(issue);
    const params = new URLSearchParams(searchParams);
    params.delete("tab");
    params.delete("page");
    router.push(`?${params.toString()}`);
  };

  const showActions = currentTab === "raised" || currentTab === "pending";

  return (
    <div className="mx-auto mt-6 flex w-full max-w-3xl flex-1 flex-col">
      <div className="mb-4 flex items-center justify-between px-2">
        <h2 className="text-lg font-bold capitalize text-[#16284F] sm:text-xl">
          {currentTab} Issues
        </h2>
        <button
          type="button"
          onClick={() => {
            const params = new URLSearchParams(searchParams);
            params.delete("tab");
            params.delete("page");
            router.push(`?${params.toString()}`);
          }}
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#43C17A] px-3 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-[#36a666] sm:px-4 sm:text-base"
        >
          <span className="flex h-5 w-5 items-center justify-center text-xl font-semibold leading-none">
            +
          </span>
          <span className="leading-none">Raise Issue</span>
        </button>
      </div>

      {loading ? (
        <div className="mt-2 flex-1">
          <IssueCardShimmer />
        </div>
      ) : (
        <>
          <div className="min-h-[500px] flex-1">
            {issues.length > 0 ? (
              issues.map((issue) => (
                <IssueCard
                  key={issue.id}
                  issue={issue}
                  showActions={showActions}
                  onEdit={handleEditIssue}
                  onDelete={setDeletingIssue}
                />
              ))
            ) : (
              <div className="flex h-full items-center justify-center text-gray-500">
                No issues found.
              </div>
            )}
          </div>

          <div className="mt-4">
            <Pagination
              currentPage={currentPage}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
            />
          </div>
        </>
      )}

      <ConfirmDeleteModal
        open={deletingIssue !== null}
        onConfirm={handleDeleteIssue}
        onCancel={() => {
          if (!deleting) setDeletingIssue(null);
        }}
        isDeleting={deleting}
        title="Delete"
        name={deletingIssue?.title || "issue"}
        confirmText="Yes, Delete"
      />
    </div>
  );
}
