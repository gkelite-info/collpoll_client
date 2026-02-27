"use client";

import { UserInfoCard } from "./financerInfoCard";
import DashboardPage from "./gridDashMain";

export default function FinanceDashLeft() {
  const card = [
    {
      show: false,
      user: "Placement Officer",
      partnerCompanies: 24,
      drives: 3,
      image: "/placement-m.png",
      top: "lg:top-[-173px]",
      imageHeight: "h-45",
      right: "right-30",
    },
  ];

  return (
    <div className="w-[68%] p-2">
      <UserInfoCard cardProps={card} />
      <div className="mt-5 rounded-lg flex gap-3 text-xs"></div>
      <DashboardPage />
    </div>
  );
}
