"use client";

import React, { useState } from "react";
import { CaretLeft, UserCircle } from "@phosphor-icons/react";
import CardComponent, { CardProps } from "./totalUsersCard";
import FacultyView from "./facultyView";
interface TotalUsersProps {
  onBack: () => void;

  onViewDetails?: (dept: string) => void;
}

const cardData: CardProps[] = [
  {
    value: "1",
    label: "Admin",
    bgColor: "bg-[#E2DAFF]",
    icon: <UserCircle />,
    iconBgColor: "bg-[#FFFFFF]",
    iconColor: "text-[#6C20CA]",
  },
  {
    value: "350",
    label: "Faculty",
    bgColor: "bg-[#FFEDDA]",
    icon: <UserCircle />,
    iconBgColor: "bg-[#FFFFFF]",
    iconColor: "text-[#FFBB70]",
  },
  {
    value: "849",
    label: "Students",
    bgColor: "bg-[#E6FBEA]",
    icon: <UserCircle />,
    iconBgColor: "bg-[#FFFFFF]",
    iconColor: "text-[#3DAD6E]",
  },
];

const TotalUsersView: React.FC<TotalUsersProps> = ({ onBack }) => {
  const [selectedDept, setSelectedDept] = useState<string | null>(null);

  const departments = [
    { name: "CSE", faculty: 80, students: 220, total: 300 },
    { name: "ECE", faculty: 70, students: 200, total: 270 },
    { name: "EEE", faculty: 60, students: 180, total: 240 },
    { name: "ME", faculty: 70, students: 180, total: 250 },
    { name: "CIVIL", faculty: 70, students: 150, total: 220 },
    { name: "IT", faculty: 65, students: 210, total: 275 },
    { name: "AI & DS", faculty: 50, students: 160, total: 210 },
  ];

  if (selectedDept) {
    return (
      <FacultyView
        department={selectedDept}
        onBack={() => setSelectedDept(null)}
      />
    );
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
          <CardComponent
            key={index}
            value={item.value}
            label={item.label}
            bgColor={item.bgColor}
            icon={item.icon}
            iconBgColor={item.iconBgColor}
            iconColor={item.iconColor}
          />
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
            {departments.map((dept) => (
              <tr
                key={dept.name}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="py-3 px-8 text-[#2D3748] font-medium">
                  {dept.name}
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
                    onClick={() => setSelectedDept(dept.name)}
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
