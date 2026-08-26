"use client";
import { useEffect, useMemo, useState } from "react";
import { CaretLeft } from "@phosphor-icons/react";
import { supabase } from "@/lib/supabaseClient";
import TableComponent from "@/app/utils/table/table";
import { Pagination } from "@/app/(screens)/admin/academic-setup/components/pagination";

export type DashboardRoleKey = "ADMIN" | "FACULTY" | "STUDENT" | "PARENT" | "FINANCE" | "FINANCE_MANAGER" | "ACCOUNTANT" | "COLLEGE_HR" | "PLACEMENT_OFFICER" | "WELLBEING_EXECUTIVE" | "WELLBEING_MANAGER" | "GROUND_STAFF";
type UserRow = { userId: number; fullName: string; email: string; mobile: string; gender: string | null; role: string; dateOfJoining: string | null };
const ROLE_ALIASES: Record<DashboardRoleKey, string[]> = { ADMIN: ["Admin"], FACULTY: ["Faculty"], STUDENT: ["Student"], PARENT: ["Parent"], FINANCE: ["Finance"], FINANCE_MANAGER: ["FinanceManager", "Finance Manager"], ACCOUNTANT: ["Accountant"], COLLEGE_HR: ["CollegeHr"], PLACEMENT_OFFICER: ["PlacementOfficer"], WELLBEING_EXECUTIVE: ["WellbeingExecutive"], WELLBEING_MANAGER: ["WellbeingManager"], GROUND_STAFF: ["GroundStaff"] };
const LABELS: Record<DashboardRoleKey, string> = { ADMIN: "Admin", FACULTY: "Faculty", STUDENT: "Students", PARENT: "Parents", FINANCE: "Finance", FINANCE_MANAGER: "Finance Managers", ACCOUNTANT: "Accountants", COLLEGE_HR: "College HR", PLACEMENT_OFFICER: "Placement Officers", WELLBEING_EXECUTIVE: "Wellbeing Executives", WELLBEING_MANAGER: "Wellbeing Managers", GROUND_STAFF: "Ground Staff" };
const DETAIL_COLUMNS = [
  { title: <span className="whitespace-nowrap">Name</span>, key: "name" }, { title: <span className="whitespace-nowrap">Role</span>, key: "role" },
  { title: <span className="whitespace-nowrap">Email</span>, key: "email" }, { title: <span className="whitespace-nowrap">Contact</span>, key: "contact" },
  { title: <span className="whitespace-nowrap">Gender</span>, key: "gender" }, { title: <span className="whitespace-nowrap">Date of Joining</span>, key: "joining" },
];

async function getFinanceUserIdsForEducation(
  collegeId: number,
  financeType: "executive" | "manager",
  collegeEducationId: number,
) {
  const { data: financeRows } = await supabase
    .from("finance_manager")
    .select("financeManagerId, userId, collegeEducationId")
    .eq("collegeId", collegeId)
    .eq("type", financeType)
    .eq("isActive", true)
    .eq("is_deleted", false)
    .is("deletedAt", null);

  const financeManagerIds = (financeRows ?? []).map((row) => row.financeManagerId);
  const { data: mappings } = financeManagerIds.length
    ? await supabase
        .from("finance_manager_education_types")
        .select("financeManagerId, collegeEducationId")
        .in("financeManagerId", financeManagerIds)
        .eq("isActive", true)
        .eq("is_deleted", false)
        .is("deletedAt", null)
    : { data: [] };
  const mappedManagerIds = new Set(
    (mappings ?? [])
      .filter((mapping) => mapping.collegeEducationId === collegeEducationId)
      .map((mapping) => mapping.financeManagerId),
  );

  return (financeRows ?? [])
    .filter((row) => row.collegeEducationId != null
      ? row.collegeEducationId === collegeEducationId
      : mappedManagerIds.has(row.financeManagerId))
    .map((row) => row.userId);
}

export default function RoleUsersTable({ collegeId, role, educationFilter, branchFilter, educations }: { collegeId: number; role: DashboardRoleKey; educationFilter: string; branchFilter: string; educations: { id: number; label: string }[] }) {
  const [users, setUsers] = useState<UserRow[]>([]); const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(role === "PARENT"); const [page, setPage] = useState(1); const [itemsPerPage, setItemsPerPage] = useState(10);
  const [educationUserIds, setEducationUserIds] = useState<Record<number, number[]>>({});
  const [detailEducationId, setDetailEducationId] = useState<number | null>(null);
  useEffect(() => {
    let mounted = true; setLoading(true); setShowDetails(role === "PARENT"); setPage(1);
    const load = async () => {
      const { data, error } = await supabase.from("users").select("userId, fullName, email, mobile, gender, role, dateOfJoining").eq("collegeId", collegeId).eq("isActive", true).eq("is_deleted", false).in("role", ROLE_ALIASES[role]).order("fullName", { ascending: true });
      let rows = (data as UserRow[] | null) ?? [];
      if (educationFilter !== "All") {
        let scopedUserIds: number[] | null = null;
        if (role === "FINANCE" || role === "FINANCE_MANAGER") {
          const financeType = role === "FINANCE" ? "executive" : "manager";
          scopedUserIds = await getFinanceUserIdsForEducation(
            collegeId,
            financeType,
            Number(educationFilter),
          );
        } else if (role === "ACCOUNTANT") {
          const { data: scoped } = await supabase.from("accountants").select("userId, accountant_education_types!inner(collegeEducationId)").eq("collegeId", collegeId).eq("accountant_education_types.collegeEducationId", Number(educationFilter)).eq("isActive", true).eq("is_deleted", false);
          scopedUserIds = (scoped ?? []).map((item) => item.userId);
        }
        if (scopedUserIds) rows = rows.filter((user) => scopedUserIds!.includes(user.userId));
      }
      const scopedMap: Record<number, number[]> = {};
      for (const education of educations) {
        if (role === "FINANCE" || role === "FINANCE_MANAGER") {
          const financeType = role === "FINANCE" ? "executive" : "manager";
          scopedMap[education.id] = await getFinanceUserIdsForEducation(
            collegeId,
            financeType,
            education.id,
          );
        } else if (role === "ACCOUNTANT") {
          const { data: scoped } = await supabase.from("accountants").select("userId, accountant_education_types!inner(collegeEducationId)").eq("collegeId", collegeId).eq("accountant_education_types.collegeEducationId", education.id).eq("isActive", true).eq("is_deleted", false);
          scopedMap[education.id] = (scoped ?? []).map((item) => item.userId);
        } else if (role === "WELLBEING_EXECUTIVE" || role === "WELLBEING_MANAGER") {
          let query = supabase.from("well_beings").select("userId, wellbeing_college_details!inner(collegeEducationId, collegeBranchId)").eq("collegeId", collegeId).eq("wellbeing_college_details.collegeEducationId", education.id).eq("isActive", true).eq("is_deleted", false);
          if (role === "WELLBEING_EXECUTIVE" && branchFilter !== "All") query = query.eq("wellbeing_college_details.collegeBranchId", Number(branchFilter));
          const { data: scoped } = await query;
          const directUserIds = (scoped ?? []).map((item) => item.userId);
          if (role === "WELLBEING_EXECUTIVE") {
            const { data: managerDetails } = await supabase.from("wellbeing_college_details").select("wellBeingId").eq("collegeEducationId", education.id).match(branchFilter !== "All" ? { collegeBranchId: Number(branchFilter) } : {});
            const managerWellbeingIds = (managerDetails ?? []).map((item) => item.wellBeingId);
            let managerUserIds: number[] = [];
            if (managerWellbeingIds.length) {
              const { data: managers } = await supabase.from("well_beings").select("userId").in("wellBeingId", managerWellbeingIds).eq("collegeId", collegeId).eq("roleType", "wellbeingManager").eq("isActive", true).eq("is_deleted", false);
              managerUserIds = (managers ?? []).map((item) => item.userId);
            }
            if (managerUserIds.length) {
              const { data: inheritedExecutives } = await supabase.from("well_beings").select("userId").eq("collegeId", collegeId).eq("roleType", "wellbeingExecutive").in("byManager", managerUserIds).eq("isActive", true).eq("is_deleted", false);
              directUserIds.push(...(inheritedExecutives ?? []).map((item) => item.userId));
            }
          }
          scopedMap[education.id] = [...new Set(directUserIds)];
        }
      }
      if (!mounted) return; if (error) console.error("Failed to load selected role users", error); setEducationUserIds(scopedMap); setUsers(rows); setLoading(false);
    };
    load();
    return () => { mounted = false; };
  }, [branchFilter, collegeId, educationFilter, educations, role]);
  const detailUsers = detailEducationId ? users.filter((user) => (educationUserIds[detailEducationId] ?? []).includes(user.userId)) : users;
  const paginated = useMemo(() => detailUsers.slice((page - 1) * itemsPerPage, page * itemsPerPage), [detailUsers, itemsPerPage, page]);
  const rows = paginated.map((user) => ({ name: user.fullName, role: user.role, email: user.email, contact: user.mobile, gender: user.gender || "—", joining: user.dateOfJoining || "—" }));
  const detailColumns = role === "PARENT" ? DETAIL_COLUMNS.filter((column) => column.key !== "joining") : DETAIL_COLUMNS;
  if (!showDetails) {
    const summaryRows = educations.length ? educations.filter((education) => educationFilter === "All" || String(education.id) === educationFilter).map((education) => ({ role: education.label, count: users.filter((user) => (educationUserIds[education.id] ?? []).includes(user.userId)).length, action: <button onClick={() => { setDetailEducationId(education.id); setShowDetails(true); setPage(1); }} className="cursor-pointer font-bold text-[#22A55D] hover:underline">View</button> })) : [{ role: LABELS[role], count: users.length, action: <button onClick={() => { setDetailEducationId(null); setShowDetails(true); }} className="cursor-pointer font-bold text-[#22A55D] hover:underline">View</button> }];
    const paginatedSummaryRows = summaryRows.slice((page - 1) * itemsPerPage, page * itemsPerPage);
    return <div><TableComponent columns={[{ title: <span className="whitespace-nowrap">{educations.length ? "Education Type" : "User Role"}</span>, key: "role" }, { title: <span className="whitespace-nowrap">Total Count</span>, key: "count" }, { title: "Actions", key: "action" }]} tableData={loading ? [] : paginatedSummaryRows} isLoading={loading} tableClassName="min-w-[600px]" emptyStateMessage="No users found for this role." /><Pagination currentPage={page} totalItems={summaryRows.length} itemsPerPage={itemsPerPage} onPageChange={setPage} alwaysShow roundedBottom="rounded-b-lg" /></div>;
  }
  return <div>{role !== "PARENT" && <button onClick={() => setShowDetails(false)} className="mb-2 flex cursor-pointer items-center gap-2 font-bold text-[#282828]"><CaretLeft size={18} weight="bold" />{LABELS[role]} Details</button>}<TableComponent columns={detailColumns} tableData={rows} isLoading={loading} tableClassName={role === "PARENT" ? "min-w-[760px]" : "min-w-[900px]"} emptyStateMessage={`No ${LABELS[role].toLowerCase()} found.`} /><Pagination currentPage={page} totalItems={detailUsers.length} itemsPerPage={itemsPerPage} onPageChange={setPage} itemsPerPageOptions={[5, 10, 20]} onItemsPerPageChange={(value) => { setItemsPerPage(value); setPage(1); }} alwaysShow roundedBottom="rounded-b-lg" /></div>;
}
