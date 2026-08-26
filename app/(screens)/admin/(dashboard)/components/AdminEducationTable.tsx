"use client";

import { useEffect, useState } from "react";
import { CaretLeft } from "@phosphor-icons/react";
import { supabase } from "@/lib/supabaseClient";
import TableComponent from "@/app/utils/table/table";
import { Pagination } from "@/app/(screens)/admin/academic-setup/components/pagination";

type AdminRow = { adminId: number; fullName: string; email: string; mobile: string; gender: string | null; collegeEducationId: number | null; educationIds?: number[] };
type EducationRow = { collegeEducationId: number; collegeEducationType: string; adminCount: number };

export default function AdminEducationTable({ collegeId, educationFilter }: { collegeId: number; educationFilter: string }) {
  const [educations, setEducations] = useState<EducationRow[]>([]);
  const [admins, setAdmins] = useState<AdminRow[]>([]);
  const [selectedEducation, setSelectedEducation] = useState<EducationRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setSelectedEducation(null);
    Promise.all([
      supabase.from("college_education").select("collegeEducationId, collegeEducationType").eq("collegeId", collegeId).eq("isActive", true).is("deletedAt", null),
      supabase.from("admins").select("adminId, fullName, email, mobile, gender, collegeEducationId").eq("collegeId", collegeId).eq("is_deleted", false),
      supabase.from("admin_education_types").select("adminId, collegeEducationId").eq("isActive", true).eq("is_deleted", false).is("deletedAt", null),
    ]).then(([educationResult, adminResult, mappingResult]) => {
      if (!mounted) return;
      const adminRows = (adminResult.data as AdminRow[] | null) ?? [];
      const mappings = mappingResult.data ?? [];
      const rows = (educationResult.data ?? []).map((education) => {
        const adminCount = adminRows.filter((admin) => {
          const mappedEducationIds = mappings.filter((mapping) => mapping.adminId === admin.adminId).map((mapping) => mapping.collegeEducationId);
          return mappedEducationIds.length
            ? mappedEducationIds.includes(education.collegeEducationId)
            : admin.collegeEducationId === education.collegeEducationId;
        }).length;
        return { ...education, adminCount };
      });
      setEducations(rows);
      setAdmins(adminRows.map((admin) => ({ ...admin, educationIds: mappings.filter((mapping) => mapping.adminId === admin.adminId).map((mapping) => mapping.collegeEducationId) })));
      setLoading(false);
    });
    return () => { mounted = false; };
  }, [collegeId]);

  const visibleEducations = educationFilter === "All" ? educations : educations.filter((education) => String(education.collegeEducationId) === educationFilter);
  const visibleAdmins = selectedEducation ? admins.filter((admin) => admin.educationIds?.includes(selectedEducation.collegeEducationId) || (!admin.educationIds?.length && admin.collegeEducationId === selectedEducation.collegeEducationId)) : [];
  const paginatedAdmins = visibleAdmins.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  if (selectedEducation) return <div>
    <div className="flex items-center gap-2 border-b px-6 py-4"><button onClick={() => setSelectedEducation(null)} className="cursor-pointer text-[#2D3748]"><CaretLeft size={20} weight="bold" /></button><h2 className="font-bold text-[#282828]">{selectedEducation.collegeEducationType} Admins</h2></div>
    <TableComponent columns={[{ title: <span className="whitespace-nowrap">Admin Name</span>, key: "name" }, { title: <span className="whitespace-nowrap">Education Type</span>, key: "education" }, { title: "Email", key: "email" }, { title: "Contact", key: "contact" }]} tableData={paginatedAdmins.map((admin) => ({ name: admin.fullName, education: selectedEducation.collegeEducationType, email: admin.email, contact: admin.mobile }))} tableClassName="min-w-[720px]" emptyStateMessage="No admins found." />
    <Pagination currentPage={page} totalItems={visibleAdmins.length} itemsPerPage={itemsPerPage} onPageChange={setPage} alwaysShow roundedBottom="rounded-b-lg" />
  </div>;

  const summaryRows = visibleEducations.map((education) => ({ education: education.collegeEducationType, count: education.adminCount, action: <button onClick={() => { setSelectedEducation(education); setPage(1); }} className="cursor-pointer font-bold text-[#22A55D] hover:underline">View</button> }));
  const paginatedSummaryRows = summaryRows.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  return <div><TableComponent columns={[{ title: <span className="whitespace-nowrap">Education Type</span>, key: "education" }, { title: <span className="whitespace-nowrap">Admin Count</span>, key: "count" }, { title: "Actions", key: "action" }]} tableData={paginatedSummaryRows} isLoading={loading} tableClassName="min-w-[620px]" emptyStateMessage="No education types found." /><Pagination currentPage={page} totalItems={summaryRows.length} itemsPerPage={itemsPerPage} onPageChange={setPage} alwaysShow roundedBottom="rounded-b-lg" /></div>;
}
