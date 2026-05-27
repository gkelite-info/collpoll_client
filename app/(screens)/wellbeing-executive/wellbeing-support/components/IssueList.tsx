"use client";

import { useSearchParams, useRouter } from "next/navigation";
import IssueCard from "./IssueCard";
import { Pagination } from "@/app/(screens)/admin/academic-setup/components/pagination";
import { useEffect, useState } from "react";
import IssueCardShimmer from "@/app/utils/shimmers/IssueCardShimmer";
import { mockIssues } from "../data";
import { CaretDown } from "@phosphor-icons/react";

export default function IssueList() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const currentTab = searchParams.get("tab") || "raised";
  const currentPageStr = searchParams.get("page") || "1";
  const currentPage = parseInt(currentPageStr, 10) || 1;
  const itemsPerPage = 3;

  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState("student");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, [currentTab, currentPage]);

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

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    router.push(`?${params.toString()}`);
  };

  const getIssues = () => {
    switch (currentTab) {
      case "pending":
        return mockIssues.pending;
      case "resolved":
        return mockIssues.resolved;
      case "rejected":
        return mockIssues.rejected;
      case "raised":
      default:
        return mockIssues.raised;
    }
  };

  const allIssues = getIssues();
  const totalItems = allIssues.length;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedIssues = allIssues.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="flex-1 flex flex-col mt-6 w-full max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-4 px-2">
        <h2 className="text-lg sm:text-xl font-bold text-[#16284F] capitalize">{currentTab} Issues</h2>
        <div className="flex items-center gap-2">
          <div className="relative custom-dropdown-container">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex cursor-pointer items-center justify-between gap-1.5 bg-[#43C17A] hover:bg-[#36a666] text-white px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-medium transition-all shadow-sm focus:outline-none min-w-[100px]"
            >
              <span className="capitalize">{selectedRole}</span>
              <CaretDown className="text-white" size={16} weight="bold" />
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-1 w-full min-w-[120px] bg-white border border-gray-100 rounded-lg shadow-lg py-1 z-20 overflow-hidden">
                {["student", "faculty", "parent"].map((role) => (
                  <button
                    key={role}
                    onClick={() => {
                      setSelectedRole(role);
                      setIsDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-[#16284F] hover:!text-white capitalize bg-white hover:!bg-blue-600 transition-colors duration-150 cursor-pointer block"
                  >
                    {role}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={() => {
              const params = new URLSearchParams(searchParams);
              params.delete("tab");
              params.delete("page");
              router.push(`?${params.toString()}`);
            }}
            className="flex cursor-pointer items-center gap-1.5 bg-[#43C17A] hover:bg-[#36a666] text-white px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-medium transition-all shadow-sm"
          >
            <span className="text-lg leading-none mt-[1px]">+</span> Raise Issue
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 mt-2">
          <IssueCardShimmer />
        </div>
      ) : (
        <>
          <div className="flex-1 min-h-[500px]">
            {paginatedIssues.length > 0 ? (
              paginatedIssues.map((issue) => (
                <IssueCard key={issue.id} issue={issue} />
              ))
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
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
            // roundedBottom="rounded-xl"
            />
          </div>
        </>
      )}
    </div>
  );
}
