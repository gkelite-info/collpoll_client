"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CaretDown } from "@phosphor-icons/react";
import IssueCard from "./IssueCard";
import { Pagination } from "@/app/(screens)/admin/academic-setup/components/pagination";
import IssueCardShimmer from "@/app/utils/shimmers/IssueCardShimmer";
import { useUser } from "@/app/utils/context/UserContext";
import { supabase } from "@/lib/supabaseClient";
import type { WellbeingIssue } from "../data";
import type {
  WellbeingIssueRaisedRole,
  WellbeingIssueStatus,
} from "@/lib/helpers/wellbeingSupportIssues/types";

type IssueRoleOption = {
  label: string;
  value: WellbeingIssueRaisedRole;
};

type SupportIssueRow = {
  wellbeingSupportIssueId: number;
  issueTitle: string;
  categoryId: number;
  subCategoryId: number;
  appliesTo: string;
  description: string;
  IssueStatus: WellbeingIssueStatus;
  createdAt: string | null;
};

type CategoryRow = {
  categoryId: number;
  categoryName: string;
};

type SubCategoryRow = {
  subCategoryId: number;
  subCategoryName: string;
};

type AttachmentRow = {
  wellbeingSupportIssueAttachmentId: number;
  wellbeingSupportIssueId?: number;
  attachment: string;
  is_deleted: boolean | null;
  deletedAt: string | null;
};

const issueRoleOptions: IssueRoleOption[] = [
  { label: "Student", value: "Student" },
  { label: "College Admin", value: "CollegeAdmin" },
  { label: "Admin", value: "Admin" },
  { label: "Faculty", value: "Faculty" },
  { label: "Finance", value: "Finance" },
  { label: "College HR", value: "CollegeHr" },
  { label: "Placement Officer", value: "PlacementOfficer" },
  { label: "Wellbeing Executive", value: "WellbeingExecutive" },
  { label: "Wellbeing Manager", value: "WellbeingManager" },
  { label: "Finance Manager", value: "FinanceManager" },
];

const getRoleLabel = (value: WellbeingIssueRaisedRole) =>
  issueRoleOptions.find((option) => option.value === value)?.label ?? value;

const getAttachmentName = (path: string) => {
  const fileName = path.split("/").pop() || path;
  return fileName.replace(/^\d+_\d+_/, "");
};

const formatDate = (date: string | null) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-GB", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
};

const toUiStatus = (status: WellbeingIssueStatus): WellbeingIssue["status"] => {
  if (status === "resolved") return "Resolved";
  if (status === "rejected") return "Rejected";
  return "Pending";
};

const isTabStatus = (
  tab: string,
): tab is "pending" | "resolved" | "rejected" =>
  ["pending", "resolved", "rejected"].includes(tab);

export default function IssueList() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { collegeId, wellBeingCategoryId, wellBeingCategoryIds } = useUser();
  const assignedCategoryIds = useMemo(
    () =>
      wellBeingCategoryIds.length || !wellBeingCategoryId
        ? wellBeingCategoryIds
        : [wellBeingCategoryId],
    [wellBeingCategoryId, wellBeingCategoryIds],
  );

  const currentTab = searchParams.get("tab") || "raised";
  const currentPageStr = searchParams.get("page") || "1";
  const currentPage = parseInt(currentPageStr, 10) || 1;
  const itemsPerPage = 3;

  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] =
    useState<WellbeingIssueRaisedRole>("Student");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [issues, setIssues] = useState<WellbeingIssue[]>([]);

  useEffect(() => {
    if (!isDropdownOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".custom-dropdown-container")) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  const loadIssues = useCallback(async () => {
    if (!collegeId) return;

    if (!assignedCategoryIds.length) {
      setIssues([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("wellbeing_support_issues")
        .select(
          `
          wellbeingSupportIssueId,
          issueTitle,
          categoryId,
          subCategoryId,
          appliesTo,
          description,
          IssueStatus,
          createdAt
        `,
        )
        .eq("collegeId", collegeId)
        .eq("isActive", true)
        .eq("is_deleted", false)
        .in("categoryId", assignedCategoryIds)
        .in("issueVisibilityRole", ["wellbeingexecutive", "both"])
        .order("createdAt", { ascending: false });

      if (error) throw error;

      const rows = (data ?? []) as SupportIssueRow[];
      const categoryIds = Array.from(new Set(rows.map((issue) => issue.categoryId)));
      const subCategoryIds = Array.from(new Set(rows.map((issue) => issue.subCategoryId)));
      const issueIds = rows.map((issue) => issue.wellbeingSupportIssueId);

      const [categoriesRes, subCategoriesRes, attachmentsRes] = await Promise.all([
        categoryIds.length
          ? supabase
              .from("wellbeing_categories")
              .select("categoryId, categoryName")
              .in("categoryId", categoryIds)
          : Promise.resolve({ data: [], error: null }),
        subCategoryIds.length
          ? supabase
              .from("wellbeing_sub_categories")
              .select("subCategoryId, subCategoryName")
              .in("subCategoryId", subCategoryIds)
          : Promise.resolve({ data: [], error: null }),
        issueIds.length
          ? supabase
              .from("wellbeing_support_issue_attachments")
              .select("wellbeingSupportIssueAttachmentId, wellbeingSupportIssueId, attachment, is_deleted, deletedAt")
              .in("wellbeingSupportIssueId", issueIds)
          : Promise.resolve({ data: [], error: null }),
      ]);

      if (categoriesRes.error) throw categoriesRes.error;
      if (subCategoriesRes.error) throw subCategoriesRes.error;
      if (attachmentsRes.error) throw attachmentsRes.error;

      const categoryById = new Map(
        ((categoriesRes.data ?? []) as CategoryRow[]).map((category) => [
          category.categoryId,
          category.categoryName,
        ]),
      );
      const subCategoryById = new Map(
        ((subCategoriesRes.data ?? []) as SubCategoryRow[]).map((subCategory) => [
          subCategory.subCategoryId,
          subCategory.subCategoryName,
        ]),
      );
      const attachmentsByIssueId = new Map<number, AttachmentRow[]>();
      ((attachmentsRes.data ?? []) as AttachmentRow[]).forEach((attachment) => {
        const issueId = attachment.wellbeingSupportIssueId;
        if (!issueId) return;
        const existing = attachmentsByIssueId.get(issueId) ?? [];
        existing.push(attachment);
        attachmentsByIssueId.set(issueId, existing);
      });

      setIssues(
        rows.map((issue) => ({
          id: String(issue.wellbeingSupportIssueId),
          title: issue.issueTitle,
          subCategory:
            subCategoryById.get(issue.subCategoryId) ||
            categoryById.get(issue.categoryId) ||
            "Not specified",
          branch: issue.appliesTo || "Not specified",
          description: issue.description,
          dateReported: formatDate(issue.createdAt),
          status: toUiStatus(issue.IssueStatus),
          attachments: (attachmentsByIssueId.get(issue.wellbeingSupportIssueId) ?? [])
            .filter((attachment) => !attachment.is_deleted && !attachment.deletedAt)
            .map((attachment) => ({
              name: getAttachmentName(attachment.attachment),
              size: "File",
            })),
        })),
      );
    } catch (error) {
      console.error("fetch wellbeing support issues error:", error);
      setIssues([]);
    } finally {
      setLoading(false);
    }
  }, [assignedCategoryIds, collegeId]);

  useEffect(() => {
    loadIssues();
  }, [loadIssues]);

  const filteredIssues = useMemo(() => {
    if (!isTabStatus(currentTab)) return issues;
    const statusMap: Record<typeof currentTab, WellbeingIssue["status"]> = {
      pending: "Pending",
      resolved: "Resolved",
      rejected: "Rejected",
    };
    return issues.filter((issue) => issue.status === statusMap[currentTab]);
  }, [currentTab, issues]);

  const totalItems = filteredIssues.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedIssues = filteredIssues.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="mx-auto mt-6 flex w-full max-w-3xl flex-1 flex-col">
      <div className="mb-4 flex flex-col justify-between gap-3 px-2 sm:flex-row sm:items-center">
        <h2 className="text-lg font-bold capitalize text-[#16284F] sm:text-xl">
          {currentTab} Issues
        </h2>
        <div className="flex items-center gap-2">
          <div className="custom-dropdown-container relative">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex min-w-[170px] cursor-pointer items-center justify-between gap-1.5 rounded-lg bg-[#43C17A] px-3 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-[#36a666] focus:outline-none sm:px-4 sm:text-base"
            >
              <span>{getRoleLabel(selectedRole)}</span>
              <CaretDown className="text-white" size={16} weight="bold" />
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 z-20 mt-1 max-h-72 w-full min-w-[190px] overflow-y-auto rounded-lg border border-gray-100 bg-white py-1 shadow-lg">
                {issueRoleOptions.map((role) => (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => {
                      setSelectedRole(role.value);
                      setIsDropdownOpen(false);
                      const params = new URLSearchParams(searchParams);
                      params.set("page", "1");
                      router.push(`?${params.toString()}`);
                    }}
                    className="block w-full cursor-pointer bg-white px-4 py-2 text-left text-sm text-[#16284F] transition-colors duration-150 hover:!bg-blue-600 hover:!text-white"
                  >
                    {role.label}
                  </button>
                ))}
              </div>
            )}
          </div>
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
      </div>

      {loading ? (
        <div className="mt-2 flex-1">
          <IssueCardShimmer />
        </div>
      ) : (
        <>
          <div className="min-h-[500px] flex-1">
            {paginatedIssues.length > 0 ? (
              paginatedIssues.map((issue) => (
                <IssueCard key={issue.id} issue={issue} />
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
    </div>
  );
}
