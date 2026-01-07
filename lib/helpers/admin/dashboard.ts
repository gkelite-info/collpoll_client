import { supabase } from "@/lib/supabaseClient";

export async function getAdminDashboardSummary() {
  const { count, error } = await supabase
    .from("users")
    .select("userId", { count: "exact", head: true });

  if (error) throw error;

  return {
    totalUsers: count ?? 0,
    pendingApprovals: 30, // placeholder for now
    systemHealth: "Good", // placeholder for now
    automations: 12, // placeholder for now
  };
}
