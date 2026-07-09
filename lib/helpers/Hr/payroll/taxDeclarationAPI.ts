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

export async function getTaxDeclarationById(taxDeclarationId: number) {
  const { data, error } = await supabase
    .from("employee_tax_declarations")
    .select(`
      *,
      user:userId (
        fullName,
        email,
        employee_ids (employeeId)
      )
    `)
    .eq("taxDeclarationId", taxDeclarationId)
    .single();

  if (error) throw new Error(error.message);
  return data;
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
        .or(`fullName.ilike.${term},email.ilike.${term},mobile.ilike.${term}`)
        .limit(1000),
      supabase.from('employee_ids')
        .select('userId')
        .eq('collegeId', collegeId)
        .ilike('employeeId', term)
        .limit(1000)
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

  const isSpecificFilter = filterStatus !== "all" && filterStatus !== "not_declared";
  const declarationRelation = isSpecificFilter 
    ? 'employee_tax_declarations!employee_tax_declarations_userId_fkey!inner' 
    : 'employee_tax_declarations!employee_tax_declarations_userId_fkey';

  let query = supabase
    .from("users")
    .select(`
      userId,
      fullName,
      email,
      role,
      employee_ids (employeeId),
      ${declarationRelation} (
        taxRegime,
        totalDeclared,
        proofStatus
      )
    `, { count: "exact" })
    .eq("collegeId", collegeId)
    .eq("is_deleted", false)
    .not("role", "in", '("Student","Parent","SuperAdmin","GroundStaff")');

  if (isSpecificFilter) {
    query = query.eq("employee_tax_declarations.proofStatus", filterStatus);
  } else if (filterStatus === "not_declared") {
    // Exclude users who already have a declaration
    const { data: declared } = await supabase
      .from('employee_tax_declarations')
      .select('userId')
      .eq('collegeId', collegeId);
    
    if (declared && declared.length > 0) {
      const declaredIds = declared.map(d => d.userId);
      query = query.not('userId', 'in', `(${declaredIds.join(',')})`);
    }
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

  // Map the users to match the frontend expectations
  const mappedDeclarations = data?.map((user: any) => {
    const dec = user.employee_tax_declarations?.[0]; // Get the first declaration if exists
    return {
      userId: user.userId,
      user: {
        fullName: user.fullName,
        email: user.email,
        employee_ids: Array.isArray(user.employee_ids) ? user.employee_ids[0] : user.employee_ids
      },
      taxDeclarationId: dec?.taxDeclarationId || null,
      taxRegime: dec?.taxRegime || 'N/A',
      totalDeclared: dec?.totalDeclared || 0,
      proofStatus: dec?.proofStatus || 'not_declared'
    };
  });

  return { declarations: mappedDeclarations || [], total: count || 0 };
}
