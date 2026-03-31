"use client";

import { useState, useEffect } from "react";
import { useCollegeHr } from "@/app/utils/context/hr/useCollegeHr";
import {
  fetchStaffForOnboarding,
  StaffOnboardingRecord,
} from "@/lib/helpers/Hr/dashboard/onboardingAPI";
import AddEmployeeModal from "./AddEmployeeDetailsModal";
import { Pagination } from "@/app/(screens)/admin/academic-setup/components/pagination";

export default function StaffOnboardingView() {
  const { collegeId } = useCollegeHr();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [staffData, setStaffData] = useState<StaffOnboardingRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] =
    useState<StaffOnboardingRecord | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const LIMIT = 10;

  const loadData = async (page: number) => {
    if (!collegeId) return;
    setIsLoading(true);
    const { data, totalCount } = await fetchStaffForOnboarding(
      collegeId,
      page,
      LIMIT,
    );
    setStaffData(data);
    setTotalCount(totalCount);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData(currentPage);
  }, [collegeId, currentPage]);

  const getStatusStyle = (status: string) => {
    return status === "Onboard"
      ? "bg-[#43C17A] hover:bg-[#3ba869] text-white cursor-pointer"
      : status === "Onboarding"
        ? "bg-[#5DD38F] hover:bg-[#43C17A] text-white cursor-pointer"
        : "bg-[#16284F] text-white cursor-default opacity-90";
  };

  const handleActionClick = (user: StaffOnboardingRecord) => {
    if (user.status !== "Onboarded") {
      setSelectedUser(user);
      setIsModalOpen(true);
    }
  };

  return (
    <div className="rounded-xl p-4 w-full h-full min-h-[80vh] flex flex-col">
      {selectedUser && (
        <AddEmployeeModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          user={selectedUser}
          onSuccess={() => loadData(currentPage)}
        />
      )}

      <h2 className="text-[20px] font-bold text-[#333] mb-4">
        Staff Onboarding
      </h2>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 flex flex-col flex-1">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="bg-[#F2F2F2] text-[#333]">
                <th className="py-3 px-4 font-bold whitespace-nowrap">Name</th>
                <th className="py-3 px-4 font-bold whitespace-nowrap">
                  Mobile
                </th>
                <th className="py-3 px-4 font-bold whitespace-nowrap">ID</th>
                <th className="py-3 px-4 font-bold whitespace-nowrap">Role</th>
                <th className="py-3 px-4 font-bold whitespace-nowrap text-center">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(LIMIT)].map((_, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="py-3 px-4">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="h-7 bg-gray-200 rounded animate-pulse w-24 ml-auto"></div>
                    </td>
                  </tr>
                ))
              ) : staffData.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-8 text-center text-gray-500 font-medium"
                  >
                    No staff members found requiring onboarding.
                  </td>
                </tr>
              ) : (
                staffData.map((row, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-gray-50 last:border-none text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-2.5 px-4 font-medium text-[#333]">
                      {row.name}
                    </td>
                    <td className="py-2.5 px-4">{row.mobile}</td>
                    <td className="py-2.5 px-4">{row.id}</td>
                    <td className="py-2.5 px-4">{row.role}</td>
                    <td className="py-2.5 px-4 text-right">
                      <button
                        onClick={() => handleActionClick(row)}
                        className={`px-4 py-1.5 rounded font-bold text-[12px] min-w-[100px] text-center transition-colors ${getStatusStyle(row.status)}`}
                      >
                        {row.status}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!isLoading && (
          <Pagination
            currentPage={currentPage}
            totalItems={totalCount}
            itemsPerPage={LIMIT}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </div>
  );
}
