"use client";

import CardComponent from "@/app/utils/card";
import {
  ArrowsClockwise,
  HourglassIcon,
  LaptopIcon,
  UsersThree,
} from "@phosphor-icons/react";
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
import { ValueShimmer } from "@/app/components/shimmers/valueShimmer";

export default function AdminDashLeft({
  onPendingFull,
}: {
  onPendingFull: () => void;
}) {
  // 1. ALL hooks must be called at the top level, before any early returns!
  const searchParams = useSearchParams();
  const router = useRouter();
  const { cards, loading: adminLoading } = useAdminDashboard();
  const { fullName, gender, loading: userLoading } = useUser(); // <-- Moved this up!

  const currentView = searchParams.get("view") || "MAIN";
  const isAutomationsView = searchParams.get("view") === "automations";
  const isPolicyView = searchParams.get("view") === "policy-setup";

  const handleBack = () => {
    router.push("?");
  };

  // 2. Early returns happen AFTER all hooks are called
  if (currentView === "automations") {
    return (
      <div className="w-[68%] p-2">
        <ActiveAutomations onBack={handleBack} />
      </div>
    );
  }

  if (currentView === "policy-setup") {
    return (
      <div className="w-[68%] p-2">
        <PolicyManagement onBack={handleBack} />
      </div>
    );
  }

  if (currentView === "TOTAL_USERS") {
    return (
      <div className="w-[68%] p-2">
        <TotalUsersView onBack={handleBack} />
      </div>
    );
  }

  if (currentView === "SYSTEM_HEALTH") {
    return (
      <div className="w-[68%] p-2">
        <SystemHealth onBack={handleBack} onViewDetails={() => {}} />
      </div>
    );
  }

  const cardData = [
    {
      id: "TOTAL_USERS",
      style: "bg-[#E2DAFF] h-[126.35px] w-[162px]",
      icon: <UsersThree size={32} weight="fill" color="#714EF2" />,
      value: userLoading || adminLoading ? <ValueShimmer /> : cards?.totalUsers,
      label: "Total Users",
    },
    {
      id: "PENDING_APPROVALS",
      style: "bg-[#FFEDDA] h-[126.35px] w-[182px]",
      icon: <HourglassIcon size={32} weight="fill" color="#FFBB70" />,
      value: "0",
      label: "Pending Approvals",
    },
    {
      id: "SYSTEM_HEALTH",
      style: "bg-[#E6FBEA] h-[126.35px] w-[182px]",
      icon: <LaptopIcon size={32} weight="fill" color="#74FF8F" />,
      value: "Good",
      label: "System Health",
    },
    {
      id: "AUTOMATIONS",
      style: "bg-[#CEE6FF] h-[126.35px] w-[182px] ",
      icon: <ArrowsClockwise size={32} weight="fill" color="#60AEFF" />,
      value: "0",
      label: "Automations",
    },
  ];

  const adminImage = gender && (gender === "Female" ? "/admin-f.png" : "/male-admin1.png");

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

  const overlayCardIds = ["PENDING_APPROVALS", "SYSTEM_HEALTH", "AUTOMATIONS"];
  const normalCards = cardData.filter((c) => !overlayCardIds.includes(c.id));
  const overlayCards = cardData.filter((c) => overlayCardIds.includes(c.id));

  return (
    <>
      <div className="w-[68%] p-2">
        <AdminInfoCard cardProps={card} />

        <div className="mt-5 rounded-lg grid grid-cols-4 gap-3 text-xs relative z-10 w-full">
          {normalCards.map((item, index) => (
            <CardComponent
              key={index}
              style={`${item.style} cursor-pointer w-full`}
              icon={item.icon}
              value={item.value}
              label={item.label}
              iconBgColor="#FFFFFF"
              onClick={() => {
                if (item.id === "TOTAL_USERS") router.push("?view=TOTAL_USERS");
              }}
            />
          ))}

          <div className="col-span-3 relative grid grid-cols-3 gap-3">
            {/* <WipOverlay
              isMedium={true}
              fullWidth={true}
              borderRadius="rounded-lg"
            /> */}

            {overlayCards.map((item, index) => (
              <CardComponent
                key={index}
                style={`${item.style} cursor-pointer w-full`}
                icon={item.icon}
                value={item.value}
                label={item.label}
                iconBgColor="#FFFFFF"
                onClick={() => {
                  if (item.id === "SYSTEM_HEALTH")
                    router.push("?view=SYSTEM_HEALTH");
                  if (item.id === "AUTOMATIONS")
                    router.push("?view=automations");
                  if (item.id === "PENDING_APPROVALS") onPendingFull();
                }}
              />
            ))}
          </div>
        </div>

        <div>
          <div className="overflow-hidden bg-gray-100 mt-5">
            <DashboardGrid data={dashboardData} />
          </div>
        </div>
      </div>
    </>
  );
}
