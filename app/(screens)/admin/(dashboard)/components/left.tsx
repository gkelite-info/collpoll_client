"use client";

import CardComponent from "@/app/utils/card";
import {
  ArrowsClockwise,
  BookOpenIcon,
  HourglassIcon,
  UsersThree,
} from "@phosphor-icons/react";
import { useState } from "react";

import { AdminInfoCard } from "../../utils/adminInfoCard";
import { DashboardGrid } from "./dashboardGrid";
import { dashboardData } from "./data";

import TotalUsersView from "./totalUsers";

type ViewState = "MAIN" | "TOTAL_USERS" | "PENDING_APPROVALS" | "SYSTEM_HEALTH";

export default function AdminDashLeft() {
  const [view, setView] = useState<ViewState>("MAIN");

  const cardData = [
    {
      id: "TOTAL_USERS",
      style: "bg-[#E2DAFF] h-[126.35px] w-[182px]",
      icon: <UsersThree size={32} weight="fill" color="#714EF2" />,
      value: "1200",
      label: "Total Users",
    },
    {
      id: "PENDING_APPROVALS",
      style: "bg-[#FFEDDA] h-[126.35px] w-[182px]",
      icon: <HourglassIcon size={32} weight="fill" color="#FFBB70" />,
      value: "34",
      label: "Pending Approvals",
    },
    {
      id: "SYSTEM_HEALTH",
      style: "bg-[#E6FBEA] h-[126.35px] w-[182px]",
      icon: <BookOpenIcon size={32} weight="fill" color="#74FF8F" />,
      value: "Good",
      label: "System Health",
    },
    {
      id: "AUTOMATIONS",
      style: "bg-[#CEE6FF] h-[126.35px] w-[182px]",
      icon: <ArrowsClockwise size={32} weight="fill" color="#60AEFF" />,
      value: "12",
      label: "Automations",
    },
  ];

  const card = [
    {
      show: false,
      user: "Stephen Jones",
      activeFacultyTasks: 12,
      pendingApprovals: 3,
      adminSubject: "Keep the system running smoothly!",
      image: "./male-admin.png",
      top: "lg:top-[-181.5px]",
    },
  ];

  const EmptyPage = (title: string) => (
    <div className="w-full p-8 bg-[#F8F9FA] min-h-screen text-black">
      <button
        onClick={() => setView("MAIN")}
        className="mb-4 text-sm font-bold flex items-center gap-2 underline decoration-2 underline-offset-4"
      >
        ← Back to Dashboard
      </button>
      <div className="h-96 border-2 border-dashed border-gray-200 rounded-3xl flex items-center justify-center">
        <h2 className="text-xl font-semibold text-gray-400">{title} Page</h2>
      </div>
    </div>
  );

  if (view === "TOTAL_USERS") {
    return (
      <div className="w-[68%] p-2">
        <TotalUsersView
          onBack={() => setView("MAIN")}
          onViewDetails={() => {}}
        />
      </div>
    );
  }

  if (view === "SYSTEM_HEALTH") {
    return <div className="w-[68%] p-2">{EmptyPage("System Health")}</div>;
  }

  return (
    <>
      <div className="w-[68%] p-2">
        <AdminInfoCard cardProps={card} />

        <div className="mt-5 rounded-lg flex gap-3 text-xs relative z-10">
          {cardData.map((item, index) => (
            <CardComponent
              key={index}
              style={`${item.style} cursor-pointer`}
              icon={item.icon}
              value={item.value}
              label={item.label}
              iconBgColor="#FFFFFF"
              onClick={() => {
                if (item.id === "TOTAL_USERS") setView("TOTAL_USERS");
                if (item.id === "PENDING_APPROVALS")
                  setView("PENDING_APPROVALS");
                if (item.id === "SYSTEM_HEALTH") setView("SYSTEM_HEALTH");
              }}
            />
          ))}
        </div>

        <div>
          <div className=" bg-gray-100 mt-5">
            <DashboardGrid data={dashboardData} />
          </div>
        </div>
      </div>
    </>
  );
}
