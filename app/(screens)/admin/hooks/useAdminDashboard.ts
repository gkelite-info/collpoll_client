"use client";

import { useEffect, useState } from "react";
import { getAdminDashboardSummary } from "@/lib/helpers/admin/dashboard";
import { getDepartmentOverview } from "@/lib/helpers/admin/departments";

export function useAdminDashboard() {
  const [cards, setCards] = useState<any>(null);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [summary, deptData] = await Promise.all([
      getAdminDashboardSummary(),
      getDepartmentOverview(),
    ]);
    setCards(summary);
    setDepartments(deptData);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  return {
    cards,
    departments,
    loading,
    refresh: load,
  };
}
