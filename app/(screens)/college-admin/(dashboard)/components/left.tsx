"use client";

import { useSearchParams } from "next/navigation";
import { UserInfoCard } from "./financerInfoCard";
import DashboardPage from "./gridDashMain";

// const financerImage = "/financer-m.png";
const collegeImage = "/college-admin-m.png"

const card = [
  {
    show: false,
    user: "Finance Officer",
    todayCollection: 0,
    image: collegeImage ?? undefined,
    top: "lg:top-[-173px]",
    imageHeight: 170,
  },
];

const SUBVIEWS = ["admins", "faculty", "students", "parents", "finance", "hr"];

export default function FinanceDashLeft() {
  const searchParams = useSearchParams();
  const subview = searchParams.get("subview");

  const isSubview = SUBVIEWS.includes(subview ?? "");

  return (
    <div className="w-[68%] p-2">
      {!isSubview && <UserInfoCard cardProps={card} />}
      {!isSubview && <div className="mt-5 rounded-lg flex gap-3 text-xs" />}
      <DashboardPage />
    </div>
  );
}
