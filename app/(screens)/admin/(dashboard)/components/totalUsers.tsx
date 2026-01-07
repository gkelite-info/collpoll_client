"use client";

import React, { useMemo, useState } from "react";
import { CaretLeft, User, UserCircle } from "@phosphor-icons/react";
import CardComponent, { CardProps } from "./totalUsersCard";
import FacultyView from "./facultyView";
import { useTotalUsers } from "../../hooks/useTotalUsers";

interface TotalUsersProps {
  onBack: () => void;
}

const TotalUsersView: React.FC<TotalUsersProps> = ({ onBack }) => {
  const [selectedDept, setSelectedDept] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const { roles, departments, loading } = useTotalUsers();

  const cardData: CardProps[] = [
    {
      value: roles.ADMIN.toString(),
      label: "Admin",
      bgColor: "bg-[#E2DAFF]",
      icon: <UserCircle />,
      iconBgColor: "bg-[#FFFFFF]",
      iconColor: "text-[#6C20CA]",
    },
    {
      value: roles.FACULTY.toString(),
      label: "Faculty",
      bgColor: "bg-[#FFEDDA]",
      icon: <UserCircle />,
      iconBgColor: "bg-[#FFFFFF]",
      iconColor: "text-[#FFBB70]",
    },
    {
      value: roles.STUDENT.toString(),
      label: "Students",
      bgColor: "bg-[#E6FBEA]",
      icon: <UserCircle />,
      iconBgColor: "bg-[#FFFFFF]",
      iconColor: "text-[#3DAD6E]",
    },
    {
      value: roles.PARENT.toString(),
      label: "Parent",
      bgColor: "bg-[#EAF4FF]",
      icon: <UserCircle />,
      iconBgColor: "bg-[#FFFFFF]",
      iconColor: "text-[#4A90E2]",
    },
  ];

  if (selectedDept) {
    return (
      <FacultyView
        departmentId={selectedDept.id}
        departmentName={selectedDept.name}
        onBack={() => setSelectedDept(null)}
      />
    );
  }

  if (loading) {
    return <div className="p-6 text-sm text-gray-500">Loading users…</div>;
  }

  return (
    <div className="flex flex-col w-full min-h-screen">
      <div className="mb-3">
        <div className="flex items-center gap-2 group w-fit">
          <CaretLeft
            onClick={onBack}
            size={24}
            weight="bold"
            className="text-[#2D3748] cursor-pointer group-hover:-translate-x-1 transition-transform"
          />
          <h1 className="text-2xl font-bold text-[#282828]">Total Users</h1>
        </div>
        <p className="text-[#282828] mt-1 ml-8 text-sm">
          Overview of all user roles in the system
        </p>
      </div>

      <article className="flex gap-3 justify-center items-center mb-4">
        {cardData.map((item, index) => (
          <CardComponent key={index} {...item} />
        ))}
      </article>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F1F2F4]">
              <th className="py-4 px-8 font-semibold text-[#4A5568] text-sm">
                Department
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
            {departments.length === 0 && (
              <tr>
                <td colSpan={5} className="py-6 text-center text-gray-500">
                  No departments found
                </td>
              </tr>
            )}

            {departments.map((dept) => (
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
                    onClick={() =>
                      setSelectedDept({
                        id: dept.departmentId,
                        name: dept.departmentName,
                      })
                    }
                    className="text-[#2D3748] cursor-pointer font-bold underline decoration-2 underline-offset-4 hover:text-black transition-colors"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TotalUsersView;
