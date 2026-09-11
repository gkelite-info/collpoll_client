"use client";
import { useEffect, useState } from "react";
import { CaretLeft } from "@phosphor-icons/react";
import { supabase } from "@/lib/supabaseClient";
import { fetchRoleMembers, type DashboardRoleKey, type Member } from "@/lib/helpers/admin/totalUserMembers";
import TableComponent from "@/app/utils/table/table";
import { Pagination } from "@/app/(screens)/admin/academic-setup/components/pagination";
export type { DashboardRoleKey } from "@/lib/helpers/admin/totalUserMembers";

const LABELS: Record<DashboardRoleKey, string> = { ADMIN: "Admin", FACULTY: "Faculty", STUDENT: "Students", PARENT: "Parents", FINANCE: "Finance", FINANCE_MANAGER: "Finance Managers", ACCOUNTANT: "Accountants", COLLEGE_HR: "College HR", PLACEMENT_OFFICER: "Placement Officers", WELLBEING_EXECUTIVE: "Wellbeing Executives", WELLBEING_MANAGER: "Wellbeing Managers", GROUND_STAFF: "Ground Staff" };
const DETAIL_COLUMNS = [{ title: "Name", key: "name" }, { title: "Role", key: "role" }, { title: "Email", key: "email" }, { title: "Contact", key: "contact" }, { title: "Gender", key: "gender" }, { title: "Date of Joining", key: "joining" }];

export default function RoleUsersTable({ collegeId, role, educationFilter, branchFilter = "All" }: {
  collegeId: number; role: DashboardRoleKey; educationFilter: string; branchFilter?: string;
}) {
  const [users, setUsers] = useState<Member[]>([]);
  const [summary, setSummary] = useState<{ id: number; label: string; count: number }[]>([]);
  const [detailEducationId, setDetailEducationId] = useState<number | null>(null);
  const [detailEducationLabel, setDetailEducationLabel] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const institutionWide = role === "COLLEGE_HR" || role === "PLACEMENT_OFFICER";
  const directList = role === "PARENT";
  const showDetails = directList || detailEducationId !== null;

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const scope = { collegeId, educationId: detailEducationId ?? (educationFilter === "All" ? null : Number(educationFilter)), branchId: branchFilter === "All" ? null : Number(branchFilter) };
        if (showDetails) {
          const result = await fetchRoleMembers(role, scope, page, itemsPerPage);
          if (mounted) { setUsers(result.members); setTotal(result.count); }
        } else if (institutionWide) {
          const result = await fetchRoleMembers(role, scope, 1, 10, true);
          if (mounted) { setSummary([{ id: 0, label: LABELS[role], count: result.count }]); setTotal(1); }
        } else {
          let query = supabase.from("college_education").select("collegeEducationId, collegeEducationType", { count: "exact" })
            .eq("collegeId", collegeId).eq("isActive", true).is("deletedAt", null);
          if (scope.educationId) query = query.eq("collegeEducationId", scope.educationId);
          const { data, error: queryError, count } = await query.order("collegeEducationId").range((page - 1) * itemsPerPage, page * itemsPerPage - 1);
          if (queryError) throw queryError;
          const rows = await Promise.all((data ?? []).map(async (education) => {
            const result = await fetchRoleMembers(role, { ...scope, educationId: education.collegeEducationId }, 1, 10, true);
            return { id: education.collegeEducationId, label: education.collegeEducationType, count: result.count };
          }));
          if (mounted) { setSummary(rows); setTotal(count ?? 0); }
        }
      } catch (err) {
        console.error("Failed to load role members", err);
        if (mounted) { setUsers([]); setSummary([]); setTotal(0); setError("Unable to load members. Please try again."); }
      } finally { if (mounted) setLoading(false); }
    }
    void load();
    return () => { mounted = false; };
  }, [collegeId, role, educationFilter, branchFilter, detailEducationId, showDetails, institutionWide, page, itemsPerPage]);

  if (error) return <p role="alert" className="px-6 py-4 text-red-600">{error}</p>;
  const summaryRows = summary.map((education) => ({ role: education.label, count: education.count, action: <button onClick={() => { setDetailEducationId(education.id); setDetailEducationLabel(education.label); setPage(1); }} className="cursor-pointer font-bold text-[#22A55D] hover:underline">View</button> }));
  const rows = users.map((user) => ({ name: user.fullName, education: detailEducationLabel, role: user.role, email: user.email, contact: user.mobile, gender: user.gender || "—", joining: user.dateOfJoining || "—" }));
  const columns = role === "ADMIN" ? [{ title: "Admin Name", key: "name" }, { title: "Education Type", key: "education" }, { title: "Email", key: "email" }, { title: "Contact", key: "contact" }] : role === "PARENT" ? DETAIL_COLUMNS.filter((column) => column.key !== "joining") : DETAIL_COLUMNS;
  return <div>
    {showDetails && !directList && <button onClick={() => { setDetailEducationId(null); setPage(1); }} className="mb-2 flex cursor-pointer items-center gap-2 font-bold text-[#282828]"><CaretLeft size={18} weight="bold" />{LABELS[role]} Details</button>}
    {institutionWide && <p className="mb-2 text-sm text-gray-500">These members serve all education types.</p>}
    <TableComponent columns={showDetails ? columns : [{ title: institutionWide ? "User Role" : "Education Type", key: "role" }, { title: role === "ADMIN" ? "Admin Count" : "Total Count", key: "count" }, { title: "Actions", key: "action" }]}
      tableData={loading ? [] : showDetails ? rows : summaryRows} isLoading={loading} tableClassName="min-w-[620px]" emptyStateMessage={`No ${LABELS[role].toLowerCase()} found.`} />
    <Pagination currentPage={page} totalItems={total} itemsPerPage={itemsPerPage} onPageChange={setPage} itemsPerPageOptions={[5, 10, 20]} onItemsPerPageChange={(value) => { setItemsPerPage(value); setPage(1); }} alwaysShow roundedBottom="rounded-b-lg" />
  </div>;
}
