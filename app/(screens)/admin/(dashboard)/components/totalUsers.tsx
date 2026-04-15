"use client";

import React from "react";
import { CaretLeft, UserCircle } from "@phosphor-icons/react";
import { useRouter, useSearchParams } from "next/navigation";
import CardComponent, { CardProps } from "./totalUsersCard";
import FacultyView from "./facultyView";
import { useTotalUsers } from "../../hooks/useTotalUsers";
import { useAdmin } from "@/app/utils/context/admin/useAdmin";

interface TotalUsersProps {
  onBack: () => void;
}

const TotalUsersView: React.FC<TotalUsersProps> = ({ onBack }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    collegeId,
    collegeEducationId,
    loading: adminContextLoading,
  } = useAdmin();

  const {
    roles,
    departments,
    loading: dataLoading,
  } = useTotalUsers(collegeId, collegeEducationId);

  const deptId = searchParams.get("deptId");
  const deptName = searchParams.get("deptName");

  // Determine global loading state for shimmers
  const isLoading = adminContextLoading || dataLoading;

  const cardData: CardProps[] = [
    {
      value: roles?.ADMIN?.toString() || "0",
      label: "Admin",
      bgColor: "bg-[#E2DAFF]",
      icon: <UserCircle />,
      iconBgColor: "bg-[#FFFFFF]",
      iconColor: "text-[#6C20CA]",
    },
    {
      value: roles?.FACULTY?.toString() || "0",
      label: "Faculty",
      bgColor: "bg-[#FFEDDA]",
      icon: <UserCircle />,
      iconBgColor: "bg-[#FFFFFF]",
      iconColor: "text-[#FFBB70]",
    },
    {
      value: roles?.STUDENT?.toString() || "0",
      label: "Students",
      bgColor: "bg-[#E6FBEA]",
      icon: <UserCircle />,
      iconBgColor: "bg-[#FFFFFF]",
      iconColor: "text-[#3DAD6E]",
    },
    {
      value: roles?.PARENT?.toString() || "0",
      label: "Parent",
      bgColor: "bg-[#EAF4FF]",
      icon: <UserCircle />,
      iconBgColor: "bg-[#FFFFFF]",
      iconColor: "text-[#4A90E2]",
    },
    {
      value: roles?.FINANCE?.toString() || "0",
      label: "Finance",
      bgColor: "bg-[#FFE4E6]", // Soft pink/red theme
      icon: <UserCircle />,
      iconBgColor: "bg-[#FFFFFF]",
      iconColor: "text-[#E11D48]",
    },
    {
      value: roles?.COLLEGE_HR?.toString() || "0",
      label: "College HR",
      bgColor: "bg-[#FEF3C7]", // Soft amber/yellow theme
      icon: <UserCircle />,
      iconBgColor: "bg-[#FFFFFF]",
      iconColor: "text-[#D97706]",
    },
  ];

  if (deptId && deptName && collegeId && collegeEducationId) {
    return (
      <FacultyView
        departmentId={Number(deptId)}
        departmentName={deptName}
        collegeId={collegeId}
        collegeEducationId={collegeEducationId}
        onBack={() => router.push("?view=TOTAL_USERS")}
      />
    );
  }

  return (
    <div className="flex flex-col w-full min-h-screen">
      {/* Header stays static and mounts immediately */}
      <div className="mb-3">
        <div className="flex items-center gap-2 w-fit">
          <CaretLeft
            onClick={onBack}
            size={24}
            weight="bold"
            className="text-[#2D3748] cursor-pointer hover:-translate-x-1 transition-transform"
          />
          <h1 className="text-2xl font-bold text-[#282828]">Total Users</h1>
        </div>
        <p className="text-[#282828] mt-1 ml-8 text-sm">
          Overview of all user roles in the system
        </p>
      </div>

      {/* Scrollable Cards Section */}
      <div className="w-full mb-4">
        {/* Hides the scrollbar but allows horizontal swiping/scrolling */}
        <article className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth
         [scrollbar-width:thin] [scrollbar-color:#cbd5e1_transparent]
          [&::-webkit-scrollbar]:h-2.5
          [&::-webkit-scrollbar-track]:bg-transparent
          [&::-webkit-scrollbar-track]:rounded-full
          [&::-webkit-scrollbar-thumb]:bg-slate-300
          [&::-webkit-scrollbar-thumb]:rounded-full
          hover:[&::-webkit-scrollbar-thumb]:bg-slate-400
         ">
          {isLoading
            ? // Card Shimmer Effect
            [...Array(6)].map((_, i) => (
              <div
                key={`shimmer-card-${i}`}
                className="min-w-[22.5%] shrink-0 h-[135px] rounded-lg bg-gray-200 animate-pulse snap-start"
              />
            ))
            : // Actual Cards
            cardData.map((item, index) => (
              <div key={index} className="min-w-[22.5%] shrink-0 snap-start">
                <CardComponent {...item} />
              </div>
            ))}
        </article>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F1F2F4]">
              <th className="py-4 px-8 font-semibold text-[#4A5568] text-sm">
                Branches
              </th>
              <th className="py-4 px-4 font-semibold text-[#4A5568] text-sm text-center">
                Faculty
              </th>
              <th className="py-4 px-4 font-semibold text-[#4A5568] text-sm text-center">
                Students
              </th>
              <th className="py-4 px-4 font-semibold text-[#4A5568] text-sm text-center">
                Total
              </th>
              <th className="py-4 px-8 font-semibold text-[#4A5568] text-sm text-right">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              // Table Shimmer Effect (4 placeholder rows)
              [...Array(4)].map((_, i) => (
                <tr key={`shimmer-row-${i}`} className="animate-pulse bg-white">
                  <td className="py-4 px-8">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                  </td>
                  <td className="py-4 px-8">
                    <div className="h-4 bg-gray-200 rounded w-1/2 ml-auto"></div>
                  </td>
                </tr>
              ))
            ) : departments?.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-gray-500">
                  No Branches found
                </td>
              </tr>
            ) : (
              departments?.map((dept) => (
                <tr
                  key={dept.departmentId}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="py-3 px-8 text-[#2D3748] font-medium">
                    {dept.departmentName}
                  </td>
                  <td className="py-3 px-4 text-center text-gray-600">
                    {dept.faculty}
                  </td>
                  <td className="py-3 px-4 text-center text-gray-600">
                    {dept.students}
                  </td>
                  <td className="py-3 px-4 text-center text-gray-600">
                    {dept.total}
                  </td>
                  <td className="py-3 px-8 text-right">
                    <button
                      onClick={() => {
                        const params = new URLSearchParams(
                          searchParams.toString(),
                        );
                        params.set("deptId", dept.departmentId.toString());
                        params.set("deptName", dept.departmentName);
                        params.set("tab", "Faculty");
                        router.push(`?${params.toString()}`);
                      }}
                      className="text-green-500 cursor-pointer font-bold hover:underline decoration-2 underline-offset-4 transition-colors"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TotalUsersView;
