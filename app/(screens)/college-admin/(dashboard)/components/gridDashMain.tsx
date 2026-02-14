"use client";

import React from "react";
import {
  GraduationCap,
  UserGear,
  Buildings,
  UsersThree,
} from "@phosphor-icons/react";

const statsData = [
  {
    id: 1,
    label: "Education Types",
    value: "05",
    color: "bg-[#EAE4FF]", // Light Purple
    icon: GraduationCap,
    iconColor: "text-[#7C3AED]",
  },
  {
    id: 2,
    label: "Admins",
    value: "05",
    color: "bg-[#FFF0D9]", // Light Peach
    icon: UserGear,
    iconColor: "text-[#EA580C]",
  },
  {
    id: 3,
    label: "Branches",
    value: "14",
    color: "bg-[#E2F9EB]", // Light Green
    icon: Buildings,
    iconColor: "text-[#10B981]",
  },
  {
    id: 4,
    label: "Total Users",
    value: "5,480",
    color: "bg-[#D1E9FF]", // Light Blue
    icon: UsersThree,
    iconColor: "text-[#2563EB]",
  },
];

const quickLinks = [
  "Admins",
  "Faculty",
  "Students",
  "Parents",
  "Finance",
  "Placement",
];

const adminProfiles = [
  {
    name: "Shravani",
    email: "shravani@college.in",
    status: "Active",
    eduType: "B.Tech",
    eduColor: "text-[#1E40AF]",
    branches: 4,
    faculty: 210,
    students: 2850,
    createdOn: "1/13/2026",
  },
  {
    name: "Arjun",
    email: "arjun@college.in",
    status: "Active",
    eduType: "BBA",
    eduColor: "text-[#1E3A8A]", // Darker blue for BBA
    branches: 4,
    faculty: 210,
    students: 2850,
    createdOn: "1/13/2026",
  },
  {
    name: "Deeksha",
    email: "deeksha@college.in",
    status: "",
    eduType: "",
    branches: null,
    faculty: 210,
    students: null,
    createdOn: "1/13/2026",
    isEmpty: false,
  },
];

const StatCard = ({
  label,
  value,
  color,
  icon: Icon,
  iconColor,
}: {
  label: string;
  value: string;
  color: string;
  icon: React.ElementType;
  iconColor: string;
}) => (
  <div
    className={`${color} rounded-xl p-5 flex flex-col justify-between h-[120px] shadow-sm`}
  >
    <div className="bg-white w-10 h-10 p-0.5 rounded-lg flex items-center justify-center mb-2">
      <Icon size={24} weight="fill" className={iconColor} />
    </div>
    <div>
      <h3 className="text-2xl font-bold text-[#1F2937]">{value}</h3>
      <p className="text-sm font-medium text-gray-600">{label}</p>
    </div>
  </div>
);

const QuickLinkCard = ({ title }: { title: string }) => (
  <div className="bg-[#E4F2E7] hover:bg-[#d4eadd] transition-colors rounded-lg p-4 flex flex-col justify-between h-[75px] cursor-pointer shadow-sm">
    <span className="font-bold text-[#1F2937] text-[15px]">{title}</span>
    <span className="text-xs font-semibold text-[#1F2937] underline decoration-1 underline-offset-2">
      View
    </span>
  </div>
);

const AdminProfileCard = ({ data }: { data: any }) => (
  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col h-full">
    {/* Header */}
    <div className="flex justify-between items-start mb-1">
      <h3 className="font-bold text-[#1F2937] text-lg">{data.name}</h3>
      {data.status === "Active" && (
        <span className="bg-[#D1FAE5] text-[#059669] text-[10px] font-bold px-2 py-0.5 rounded-full">
          Active
        </span>
      )}
    </div>

    <a
      href={`mailto:${data.email}`}
      className="text-[#22C55E] text-xs font-medium mb-5 hover:underline block"
    >
      {data.email}
    </a>

    {/* Details Grid */}
    <div className="space-y-2 text-[13px]">
      <div className="flex justify-between items-center">
        <span className="text-gray-600 font-medium">Education Type :</span>
        <span className={`font-bold ${data.eduColor || "text-gray-800"}`}>
          {data.eduType}
        </span>
      </div>

      <div className="flex justify-between items-center">
        <span className="text-gray-600 font-medium">Branches:</span>
        <span className="font-bold text-gray-800">{data.branches || 4}</span>
      </div>

      <div className="flex justify-between items-center">
        <span className="text-gray-600 font-medium">Faculty:</span>
        <span className="font-bold text-gray-800">{data.faculty}</span>
      </div>

      <div className="flex justify-between items-center">
        <span className="text-gray-600 font-medium">Students:</span>
        <span className="font-bold text-gray-800">{data.students || 2850}</span>
      </div>

      <div className="flex justify-between items-center pt-1">
        <span className="text-gray-600 font-medium">Created on:</span>
        <span className="font-bold text-gray-600">{data.createdOn}</span>
      </div>
    </div>
  </div>
);

// --- Main Layout ---

export default function AdminDashboard() {
  return (
    <div className=" min-h-screen">
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        {statsData.map((stat) => (
          <StatCard key={stat.id} {...stat} />
        ))}
      </div>

      {/* Middle Quick Links Row */}
      <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {quickLinks.map((link) => (
            <QuickLinkCard key={link} title={link} />
          ))}
        </div>
      </div>

      {/* Bottom Section: Admins */}
      <div>
        <h2 className="text-[#1F2937] text-xl font-bold mb-4">Admins</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {adminProfiles.map((profile, index) => (
            <AdminProfileCard key={index} data={profile} />
          ))}
        </div>
      </div>
    </div>
  );
}
