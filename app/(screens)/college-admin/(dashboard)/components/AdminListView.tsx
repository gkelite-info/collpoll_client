"use client";

import { useEffect, useState } from "react";
import { MagnifyingGlass, CaretLeft, CaretRight, X } from "@phosphor-icons/react";
import { useCollegeAdmin } from "@/app/utils/context/college-admin/useCollegeAdmin";
import { supabase } from "@/lib/supabaseClient";
import TableComponent from "@/app/utils/table/table";
import { AdminListRow, getAdminListData } from "@/lib/helpers/collegeAdmin/Getadminlistdata";

const TABLE_COLUMNS = [
  { title: "Admin Name",     key: "adminName" },
  { title: "Education Type", key: "educationType" },
  { title: "Branches",       key: "branches" },
  { title: "Created By",     key: "createdBy" },
  { title: "Faculty",        key: "faculty" },
  { title: "Student",        key: "student" },
  { title: "Parent",         key: "parent" },
  { title: "Finance",        key: "finance" },
  { title: "Action",         key: "action" },
];

type AdminDetailRow = AdminListRow & {
  email: string;
  mobile: string;
  gender: string;
  action: React.ReactNode;
};

type Props = { onBack: () => void };

const ROWS_PER_PAGE = 10;

function AdminDetailModal({ admin, onClose }: { admin: AdminDetailRow; onClose: () => void }) {
  const initials = admin.adminName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(62,61,61,0.64)" }} onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 cursor-pointer">
          <X size={18} weight="bold" className="text-[#282828]" />
        </button>
        <h2 className="text-lg font-bold text-[#282828] mb-4">Admin Details</h2>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-full bg-[#D1FAE5] flex items-center justify-center text-[#059669] font-bold text-base flex-shrink-0">{initials}</div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Full Name</p>
            <p className="text-[#22A55D] font-bold text-[15px]">{admin.adminName}</p>
          </div>
        </div>
        <div className="space-y-3 text-[13px]">
          {[
            { label: "Email",            value: admin.email },
            { label: "Phone Number",     value: admin.mobile },
            { label: "Gender",           value: admin.gender },
            { label: "Educational Type", value: admin.educationType },
            { label: "Branches",         value: admin.branches },
            { label: "Created By",       value: admin.createdBy },
            { label: "Faculty",          value: String(admin.faculty) },
            { label: "Students",         value: String(admin.student) },
            { label: "Parents",          value: String(admin.parent) },
            { label: "Finance",          value: String(admin.finance) },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-start gap-2">
              <span className="text-gray-500 font-medium w-[130px] flex-shrink-0">{label} :</span>
              <span className="font-semibold text-[#282828]">{value || "—"}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AdminListView({ onBack }: Props) {
  const { collegeId, loading: contextLoading } = useCollegeAdmin();

  const [rows, setRows]           = useState<AdminDetailRow[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [search, setSearch]       = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminDetailRow | null>(null);

  const totalPages = Math.ceil(totalRecords / ROWS_PER_PAGE);

  const load = async (page: number) => {
    if (contextLoading || !collegeId) return;
    setIsFetching(true);
    try {
      const { data, totalCount } = await getAdminListData(collegeId, page, ROWS_PER_PAGE);

      const adminIds = data.map((d) => d.adminId);
      const { data: adminExtras } = await supabase
        .from("admins").select("adminId, email, mobile, gender").in("adminId", adminIds);

      const extrasMap = new Map((adminExtras ?? []).map((a: any) => [a.adminId, a]));

      const withAction: AdminDetailRow[] = data.map((row) => {
        const extra = extrasMap.get(row.adminId) ?? {};
        const fullRow: AdminDetailRow = {
          ...row,
          email:  extra.email  ?? "—",
          mobile: extra.mobile ?? "—",
          gender: extra.gender ?? "—",
          action: null,
        };
        fullRow.action = (
          <span className="text-[#22A55D] cursor-pointer hover:underline text-sm font-medium"
            onClick={() => setSelectedAdmin(fullRow)}>
            View
          </span>
        );
        return fullRow;
      });

      setRows(withAction);
      setTotalRecords(totalCount);
    } catch (err) {
      console.error("AdminListView fetch error:", err);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    load(currentPage);
  }, [collegeId, contextLoading, currentPage]);

  // Client-side search filter on current page data
  const filtered = search
    ? rows.filter((r) =>
        r.adminName.toLowerCase().includes(search.toLowerCase()) ||
        r.educationType.toLowerCase().includes(search.toLowerCase()) ||
        r.branches.toLowerCase().includes(search.toLowerCase())
      )
    : rows;

  return (
    <div className="flex w-full min-h-screen pb-4">
      <div className="flex-1 p-2 flex flex-col overflow-hidden">

        <div className="flex items-center gap-2 mb-4">
          <CaretLeft size={20} weight="bold" className="cursor-pointer text-[#282828] active:scale-90" onClick={onBack} />
          <h1 className="text-xl font-semibold text-[#282828]">Admins</h1>
        </div>

        <p className="text-[#1E40AF] font-semibold text-[15px] mb-3">
          Admins : {isFetching ? "…" : totalRecords}
        </p>

        <div className="w-[40%] bg-[#EAEAEA] px-3 rounded-full flex items-center mb-4">
          <input type="text" placeholder="Search by Admin Name, Department, or Course"
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full p-2 outline-none text-sm bg-transparent text-[#282828] placeholder:text-[#6B7280]"
          />
          <MagnifyingGlass size={18} className="text-[#43C17A]" />
        </div>

        {isFetching ? (
          <div className="animate-pulse bg-gray-200 rounded-2xl h-64 mt-5" />
        ) : filtered.length === 0 ? (
          <p className="text-gray-400 text-sm mt-8 text-center">No admins found.</p>
        ) : (
          <TableComponent columns={TABLE_COLUMNS} tableData={filtered} height="65vh" />
        )}

        {totalPages > 1 && (
          <div className="flex justify-end items-center gap-3 mt-4 mb-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`w-10 h-10 flex items-center justify-center rounded-lg border ${currentPage === 1 ? "border-gray-200 text-gray-300" : "border-gray-300 text-gray-600 hover:bg-gray-100"}`}
            >
              <CaretLeft size={18} weight="bold" />
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button key={i} onClick={() => setCurrentPage(i + 1)}
                className={`w-10 h-10 rounded-lg font-semibold ${currentPage === i + 1 ? "bg-[#16284F] text-white" : "border border-gray-300 text-gray-600 hover:bg-gray-100"}`}>
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`w-10 h-10 flex items-center justify-center rounded-lg border ${currentPage === totalPages ? "border-gray-200 text-gray-300" : "border-gray-300 text-gray-600 hover:bg-gray-100"}`}
            >
              <CaretRight size={18} weight="bold" />
            </button>
          </div>
        )}
      </div>

      {selectedAdmin && (
        <AdminDetailModal admin={selectedAdmin} onClose={() => setSelectedAdmin(null)} />
      )}
    </div>
  );
}
