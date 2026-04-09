"use client";

import { useEffect, useState } from "react";
import { getAdminDashboardSummary } from "@/lib/helpers/admin/dashboard";
import { getDepartmentOverview } from "@/lib/helpers/admin/departments";
import { useAdmin } from "@/app/utils/context/admin/useAdmin";

export function useAdminDashboard() {
  const [cards, setCards] = useState<any>(null);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { collegeId, collegeEducationId } = useAdmin();

  const load = async () => {
    if (!collegeId || !collegeEducationId) return;

    if (!cards) {
      setLoading(true);
    }

    const [summaryResult, deptDataResult] = await Promise.allSettled([
      getAdminDashboardSummary(collegeId, collegeEducationId),
      getDepartmentOverview(collegeId, collegeEducationId),
    ]);

    if (summaryResult.status === "fulfilled") {
      setCards(summaryResult.value);
    } else {
      console.error("Failed to load summary:", summaryResult.reason);
      setCards({
        totalUsers: 0,
        pendingApprovals: 0,
        systemHealth: "-",
        automations: 0,
      });
    }

    if (deptDataResult.status === "fulfilled") {
      setDepartments(deptDataResult.value);
    } else {
      console.error("Failed to load departments:", deptDataResult.reason);
      setDepartments([]);
    }

    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [collegeId, collegeEducationId]);

  return {
    cards,
    departments,
    loading,
    refresh: load,
  };
}
