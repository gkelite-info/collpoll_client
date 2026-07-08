import { supabase } from "@/lib/supabaseClient";

export async function upsertTaxDeclaration(
  userId: number,
  collegeId: number,
  financialYear: string,
  data: any
) {
  // TODO: Connect to backend API when available
  console.log("Upserting tax declaration:", { userId, collegeId, financialYear, data });
  return { success: true };
}

export async function getMyTaxDeclaration(userId: number, financialYear: string) {
  // TODO: Connect to backend API when available
  return null;
}

export async function getTaxDeclarations(collegeId: number, filterStatus: string, page: number, limit: number, searchQuery: string = "") {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  // Resolve search query if present
  let matchedUserIds: number[] | null = null;
  if (searchQuery && searchQuery.trim() !== "") {
    const term = `%${searchQuery.trim()}%`;
    const [usersRes, empRes] = await Promise.all([
      supabase.from('users')
        .select('userId')
        .eq('collegeId', collegeId)
        .or(`fullName.ilike.${term},email.ilike.${term},mobile.ilike.${term}`),
      supabase.from('employee_ids')
        .select('userId')
        .eq('collegeId', collegeId)
        .ilike('employeeId', term)
    ]);
    const uIds = new Set([
      ...(usersRes.data || []).map(u => u.userId),
      ...(empRes.data || []).map(e => e.userId)
    ]);
    matchedUserIds = Array.from(uIds);
    if (matchedUserIds.length === 0) {
      return { declarations: [], total: 0 };
    }
  }

  let query = supabase
    .from("employee_tax_declarations")
    .select(`
      *,
      user:userId!inner (
        fullName,
        email,
        role,
        employee_ids (employeeId)
      )
    `, { count: "exact" })
    .eq("collegeId", collegeId)
    .not("user.role", "in", '("Student","Parent","SuperAdmin","GroundStaff")')
    .eq("is_deleted", false);

  if (filterStatus !== "all") {
    query = query.eq("proofStatus", filterStatus);
  }

  if (matchedUserIds) {
    query = query.in("userId", matchedUserIds);
  }

  const { data, error, count } = await query
    .order("createdAt", { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  return { declarations: data || [], total: count || 0 };
}
