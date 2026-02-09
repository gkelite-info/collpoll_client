"use client";

import CardComponent from "@/app/utils/card";
import { ArrowsClockwise, BookOpenIcon, HourglassIcon, UsersThree } from "@phosphor-icons/react";
import { useState } from "react";

import { AdminInfoCard } from "../../utils/adminInfoCard";
import { dashboardData } from "../data";
import { DashboardGrid } from "./dashboardGrid";
import SystemHealth from "./systemHealth";
import TotalUsersView from "./totalUsers";
import { useUser } from "@/app/utils/context/UserContext";
import ActiveAutomations from "./activeAutomations";
import PolicyManagement from "./policyManagement";
import { useRouter, useSearchParams } from "next/navigation";
import { useAdminDashboard } from "../../hooks/useAdminDashboard";

type ViewState =
  | "MAIN"
  | "TOTAL_USERS"
  | "PENDING_APPROVALS"
  | "SYSTEM_HEALTH"
  | "AUTOMATIONS";

export default function AdminDashLeft({
  onPendingFull,
}: {
  onPendingFull: () => void;
}) {
  const [view, setView] = useState<ViewState>("MAIN");
  const searchParams = useSearchParams();
  const router = useRouter();
  const {
    cards,
    loading: adminLoading,
  } = useAdminDashboard();
  const isAutomationsView = searchParams.get("view") === "automations";
  const isPolicyView = searchParams.get("view") === "policy-setup";

  const handleBack = () => {
    if (isAutomationsView || isPolicyView) {
      router.push("?");
    } else {
      setView("MAIN");
    }
  };

  if (isAutomationsView) {
    return (
      <div className="w-[68%] p-2">
        <ActiveAutomations onBack={handleBack} />
      </div>
    );
  }

  if (isPolicyView) {
    return (
      <div className="w-[68%] p-2">
        <PolicyManagement onBack={handleBack} />
      </div>
    );
  }

  const { fullName, gender, loading } = useUser();

  const adminImage =
    !loading && gender === "Female"
      ? "/admin-f.png"
      : !loading && gender === "Male"
        ? "/admin-m.png"
        : null;

  const cardData = [
    {
      id: "TOTAL_USERS",
      style: "bg-[#E2DAFF] h-[126.35px] w-[182px]",
      icon: <UsersThree size={32} weight="fill" color="#714EF2" />,
      value: loading ? "..." : cards?.totalUsers,
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
      style: "bg-[#CEE6FF] h-[126.35px] w-[182px] ",
      icon: <ArrowsClockwise size={32} weight="fill" color="#60AEFF" />,
      value: "12",
      label: "Automations",
    },
  ];

  const card = [
    {
      show: false,
      user: fullName ?? "User",
      activeFacultyTasks: 12,
      pendingApprovals: 3,
      adminSubject: "Keep the system running smoothly!",
      image: adminImage ?? undefined,
      top: "lg:top-[-172.5px]",
      imageHeight: 170,
    },
  ];

  if (view === "TOTAL_USERS") {
    return (
      <div className="w-[68%] p-2">
        <TotalUsersView onBack={() => setView("MAIN")} />
      </div>
    );
  }

  if (view === "SYSTEM_HEALTH") {
    return (
      <div className="w-[68%] p-2">
        <SystemHealth onBack={() => setView("MAIN")} onViewDetails={() => { }} />
      </div>
    );
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
                if (item.id === "SYSTEM_HEALTH") setView("SYSTEM_HEALTH");
                if (item.id === "AUTOMATIONS") router.push("?view=automations");
                if (item.id === "PENDING_APPROVALS") {
                  onPendingFull();
                }
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
