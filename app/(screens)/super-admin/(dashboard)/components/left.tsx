"use client";

import { useSearchParams } from "next/navigation";
import { UserInfoCard } from "./financerInfoCard";
import DashboardPage from "./gridDashMain";

// const superAdminImage = "/super-admin-m.png";
const male = "/sa-m.png"
const female = "/sa-f.png"

const card = [
  {
    show: false,
    user: "User",
    todayCollection: 245000,
    // image: superAdminImage ?? undefined,
    image: male ?? undefined,
    top: "lg:top-[-10px]",
    imageHeight: 175,
  },
];
const card1 = [
  {
    show: false,
    user: "User",
    todayCollection: 245000,
    // image: superAdminImage ?? undefined,
    image: female ?? undefined,
    top: "lg:top-[-10px]",
    imageHeight: 175,
  },
];

export default function DashLeft() {
  // const searchParams = useSearchParams();
  // const view = searchParams.get("view");

  return (
    <div className="w-[68%] p-2">
      <UserInfoCard cardProps={card} />
      <div className="mt-5 rounded-lg flex gap-3 text-xs"></div>
      <DashboardPage />
    </div>
  );
}
