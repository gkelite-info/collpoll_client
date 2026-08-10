import { supabase } from "@/lib/supabaseClient";

export type ManagerExecutive = {
  wellBeingId: number;
  categoryId: number;
  categoryName: string;
  name: string;
  staffId: string;
  image: string;
  phone: string;
  email: string;
};

type Relation<T> = T | T[] | null;
type ExecutiveRow = {
  wellBeingId: number;
  users: Relation<{
    userId: number;
    fullName: string | null;
    email: string | null;
    mobile: string | null;
    employee_ids: Relation<{ employeeId: string | null }>;
  }>;
};
type ProfileRow = { userId: number; profileUrl: string | null };

const first = <T,>(value: Relation<T>) =>
  Array.isArray(value) ? value[0] ?? null : value;

export async function fetchManagerExecutives(
  collegeId: number,
): Promise<ManagerExecutive[]> {
  const { data: executiveData, error: executiveError } = await supabase
    .from("well_beings")
    .select(`
      wellBeingId,
      users:userId!inner (
        userId,
        fullName,
        email,
        mobile,
        employee_ids (employeeId)
      )
    `)
    .eq("collegeId", collegeId)
    .eq("roleType", "wellbeingExecutive")
    .eq("isActive", true)
    .eq("is_deleted", false)
    .is("deletedAt", null)
    .eq("users.isActive", true)
    .eq("users.is_deleted", false)
    .is("users.deletedAt", null)
    .order("createdAt", { ascending: true });

  if (executiveError) throw executiveError;

  const rows = (executiveData ?? []) as ExecutiveRow[];
  const wellBeingIds = rows.map((row) => row.wellBeingId);
  if (!wellBeingIds.length) return [];

  const userIds = rows
    .map((row) => first(row.users)?.userId)
    .filter((userId): userId is number => Boolean(userId));
  const [assignmentsResult, profilesResult] = await Promise.all([
    supabase
      .from("wellbeing_assigned_categories")
      .select("wellBeingId, categoryId")
      .in("wellBeingId", wellBeingIds)
      .eq("isActive", true)
      .eq("is_deleted", false)
      .is("deletedAt", null)
      .order("assignedCategoryId", { ascending: true }),
    userIds.length
      ? supabase
          .from("user_profile")
          .select("userId, profileUrl")
          .in("userId", userIds)
          .eq("is_deleted", false)
          .is("deletedAt", null)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (assignmentsResult.error) throw assignmentsResult.error;
  if (profilesResult.error) throw profilesResult.error;

  const assignments = (assignmentsResult.data ?? []) as Array<{
    wellBeingId: number;
    categoryId: number;
  }>;
  const categoryIds = Array.from(new Set(assignments.map((item) => item.categoryId)));
  const { data: categoryData, error: categoryError } = categoryIds.length
    ? await supabase
        .from("wellbeing_categories")
        .select("categoryId, categoryName")
        .in("categoryId", categoryIds)
        .eq("collegeId", collegeId)
    : { data: [], error: null };

  if (categoryError) throw categoryError;

  const categoryNames = new Map(
    ((categoryData ?? []) as Array<{ categoryId: number; categoryName: string }>).map(
      (category) => [category.categoryId, category.categoryName],
    ),
  );
  const rowById = new Map(rows.map((row) => [row.wellBeingId, row]));
  const profileByUserId = new Map(
    ((profilesResult.data ?? []) as ProfileRow[]).map((profile) => [
      profile.userId,
      profile.profileUrl,
    ]),
  );

  return assignments.flatMap((assignment) => {
    const row = rowById.get(assignment.wellBeingId);
    const user = row ? first(row.users) : null;
    if (!row || !user) return [];

    const employee = first(user.employee_ids);
    return [{
      wellBeingId: row.wellBeingId,
      categoryId: assignment.categoryId,
      categoryName: categoryNames.get(assignment.categoryId) ?? "Assigned Category",
      name: user.fullName ?? "Wellbeing Executive",
      staffId: employee?.employeeId ?? String(row.wellBeingId),
      image: profileByUserId.get(user.userId) || "",
      phone: user.mobile ?? "-",
      email: user.email ?? "-",
    }];
  });
}
