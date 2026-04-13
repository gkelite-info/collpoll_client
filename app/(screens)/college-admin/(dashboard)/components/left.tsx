"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { UserInfoCard } from "./financerInfoCard";
import DashboardPage from "./gridDashMain";
import { useUser } from "@/app/utils/context/UserContext";
import { fetchTodayCollectionAmount } from "../../../../../lib/helpers/collegeAdmin/fetchcollection";

const collegeImage = "/college-admin-m.png";

const SUBVIEWS = ["admins", "faculty", "students", "parents", "finance", "hr"];

export default function FinanceDashLeft() {
  const searchParams = useSearchParams();
  const subview = searchParams.get("subview");
  const isSubview = SUBVIEWS.includes(subview ?? "");

  const { collegeId } = useUser();
  const [todayCollection, setTodayCollection] = useState<number>(0);

  useEffect(() => {
    async function loadTodayCollection() {
      if (collegeId) {
        const amount = await fetchTodayCollectionAmount(collegeId);
        setTodayCollection(amount);
      }
    }
    loadTodayCollection();
  }, [collegeId]);

  const card = [
    {
      show: false,
      user: "Finance Officer",
      todayCollection: todayCollection,
      image: collegeImage ?? undefined,
      top: "lg:top-[-173px]",
      imageHeight: 170,
    },
  ];

  return (
    <div className="w-[68%] p-2">
      {!isSubview && <UserInfoCard cardProps={card} />}
      {!isSubview && <div className="mt-5 rounded-lg flex gap-3 text-xs" />}
      <DashboardPage />
    </div>
  );
}
