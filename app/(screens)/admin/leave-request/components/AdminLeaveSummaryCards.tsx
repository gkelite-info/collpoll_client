"use client";

import CardComponent from "@/app/utils/card";
import { useAdmin } from "@/app/utils/context/admin/useAdmin";
import { useUser } from "@/app/utils/context/UserContext";
import { leaveSummaryCards } from "@/app/(screens)/finance-manager/leave-request/data";
import { fetchEmployeeLeaveRequestCounts } from "@/lib/helpers/employeeLeaveRequests/employeeLeaveRequestAPI";
import { UsersThree } from "@phosphor-icons/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

const cardPalette: Record<
  string,
  { active: string; inactive: string; iconBg: string }
> = {
  total: {
    active: "bg-[#5C98FF]",
    inactive: "bg-[#EBF2FF]",
    iconBg: "#5C98FF",
  },
  approved: {
    active: "bg-[#48C37C]",
    inactive: "bg-[#E7F8EE]",
    iconBg: "#48C37C",
  },
  pending: {
    active: "bg-[#FFB874]",
    inactive: "bg-[#FFF4EB]",
    iconBg: "#FFB874",
  },
  rejected: {
    active: "bg-[#FF4242]",
    inactive: "bg-[#FFE5E5]",
    iconBg: "#FF4242",
  },
};

export default function AdminLeaveSummaryCards() {
  const { userId, loading: userLoading } = useUser();
  const { collegeId, loading: adminLoading } = useAdmin();
  const [isLoading, setIsLoading] = useState(true);
  const [counts, setCounts] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
  });
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeStatus = searchParams.get("status") || "total";

  const loadCounts = useCallback(async () => {
    if (userLoading || adminLoading) return;

    if (!userId || !collegeId) {
      setCounts({ total: 0, approved: 0, pending: 0, rejected: 0 });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      setCounts(
        await fetchEmployeeLeaveRequestCounts({
          userId,
          collegeId,
          role: "Admin",
        }),
      );
    } catch (error) {
      console.error("Error fetching admin leave summary counts:", error);
      setCounts({ total: 0, approved: 0, pending: 0, rejected: 0 });
    } finally {
      setIsLoading(false);
    }
  }, [adminLoading, collegeId, userId, userLoading]);

  useEffect(() => {
    void loadCounts();
  }, [loadCounts]);

  useEffect(() => {
    const handleCreated = () => loadCounts();
    window.addEventListener("employee-leave-request-created", handleCreated);
    return () =>
      window.removeEventListener("employee-leave-request-created", handleCreated);
  }, [loadCounts]);

  const cards = useMemo(
    () =>
      leaveSummaryCards.map((card) => ({
        ...card,
        value: String(counts[card.status as keyof typeof counts] ?? 0).padStart(
          2,
          "0",
        ),
      })),
    [counts],
  );

  const handleCardClick = (status: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (status === "total") {
      params.delete("status");
    } else {
      params.set("status", status);
    }

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  return (
    <section className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
      {cards.map((card) => {
        const isActive = activeStatus === card.status;
        const palette = cardPalette[card.status];

        return isLoading ? (
          <div
            key={card.label}
            className="h-32 w-full animate-pulse rounded-lg bg-white shadow-sm"
          >
            <div className="flex h-full flex-col justify-between p-4">
              <div className="h-9 w-9 rounded-md bg-gray-200" />
              <div>
                <div className="mb-2 h-5 w-12 rounded bg-gray-200" />
                <div className="h-4 w-24 rounded bg-gray-200" />
              </div>
            </div>
          </div>
        ) : (
          <CardComponent
            key={card.label}
            icon={<UsersThree size={20} weight="fill" />}
            value={card.value}
            label={card.label}
            isActive={isActive}
            iconColor="#FFFFFF"
            iconBgColor={
              isActive ? "rgba(255,255,255,0.2)" : palette.iconBg
            }
            style={`w-full transition-all duration-300 ${isActive ? palette.active : palette.inactive}`}
            textSize={isActive ? "text-white" : "text-[#282828]"}
            onClick={() => handleCardClick(card.status)}
          />
        );
      })}
    </section>
  );
}
