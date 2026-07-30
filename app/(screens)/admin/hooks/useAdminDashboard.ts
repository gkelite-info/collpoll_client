"use client";

import { useQuery } from "@tanstack/react-query";
import { getAdminDashboardSummary } from "@/lib/helpers/admin/dashboard";
import { getDepartmentOverview } from "@/lib/helpers/admin/departments";
import { useAdmin } from "@/app/utils/context/admin/useAdmin";

export function useAdminDashboard() {
  const { collegeId, collegeEducationId } = useAdmin();

  const isEnabled = !!collegeId && !!collegeEducationId;

  const { data: cardsData, isLoading: loadingCards, refetch: refetchCards } = useQuery({
    queryKey: ["adminDashboardSummary", collegeId, collegeEducationId],
    queryFn: () => getAdminDashboardSummary(collegeId!, collegeEducationId!),
    enabled: isEnabled,
    staleTime: 5 * 60 * 1000,
  });

  const { data: departmentsData, isLoading: loadingDepts, refetch: refetchDepts } = useQuery({
    queryKey: ["adminDepartmentOverview", collegeId, collegeEducationId],
    queryFn: () => getDepartmentOverview(collegeId!, collegeEducationId!),
    enabled: isEnabled,
    staleTime: 5 * 60 * 1000,
  });

  const cards = cardsData || {
    totalUsers: 0,
    pendingApprovals: 0,
    systemHealth: "-",
    automations: 0,
  };
  
  const departments = departmentsData || [];
  
  const loading = !isEnabled || loadingCards || loadingDepts;
  
  const refresh = () => {
    refetchCards();
    refetchDepts();
  };

  return {
    cards,
    departments,
    loading,
    refresh,
  };
}
