"use client";

import { useSearchParams } from "next/navigation";
import { UserInfoCard } from "./financerInfoCard";
import DashboardPage from "./gridDashMain";
import SemwiseDetail from "../components/semwiseDetail";
import { useUser } from "@/app/utils/context/UserContext";


export default function FinanceDashLeft() {
  const searchParams = useSearchParams();
  const view = searchParams.get("view");
  const semester = searchParams.get("semester");

  const { gender } = useUser();

  const financerImage = gender
    && (gender === "Female" ? "/finance-fe.png" : "/financer-m.png")

  const card = [
    {
      show: false,
      user: "Finance Officer",
      todayCollection: 245000,
      image: financerImage ?? undefined,
      top: "lg:top-[-173px]",
      imageHeight: "h-45",
      right: "right-35"
    },
  ];


  if (view === "semwise" && semester) {
    return (
      <div className="w-[68%] p-2">
        <SemwiseDetail semester={semester} />
      </div>
    );
  }

  return (
    <div className="w-[68%] p-2">
      <UserInfoCard cardProps={card} />
      <div className="mt-5 rounded-lg flex gap-3 text-xs"></div>
      <DashboardPage />
    </div>
  );
}
