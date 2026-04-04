"use client";
 
import { useEffect, useState, useCallback } from "react";
import {
  MagnifyingGlass, CaretLeft, CaretRight, X,
  UserGear, GraduationCap, UsersThree, UsersFour,
  CurrencyDollar, Buildings, Briefcase,
} from "@phosphor-icons/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCollegeAdmin } from "@/app/utils/context/college-admin/useCollegeAdmin";
import TableComponent from "@/app/utils/table/table";
import { AdminListRow, AdminPageSummary, getAdminListData } from "@/lib/helpers/collegeAdmin/Getadminlistdata";
import CardComponent from "@/app/utils/card";

 
// ─── Table Columns ────────────────────────────────────────────────────────────
 
const TABLE_COLUMNS = [
  { title: "Admin Name",     key: "adminName" },
  { title: "Education Type", key: "educationType" },
  { title: "Branches",       key: "branches" },
  { title: "Created By",     key: "createdBy" },
  { title: "Faculty",        key: "faculty" },
  { title: "Student",        key: "student" },
  { title: "Parent",         key: "parent" },
  { title: "Finance",        key: "finance" },
  { title: "HR Executive",   key: "hrExecutive" },
  { title: "Action",         key: "action" },
];
 
// ─── Types ────────────────────────────────────────────────────────────────────
 
type AdminDetailRow = AdminListRow & {
  action: React.ReactNode;
};
 
type Props = { onBack: () => void };
 
const ROWS_PER_PAGE = 10;
 
// ─── Stat card definitions ────────────────────────────────────────────────────
 
type StatDef = {
  label:     string;
  key:       keyof AdminPageSummary;
  bg:        string;
  iconBg:    string;
  iconColor: string;
  icon:      React.ReactNode;
};
 
const STAT_DEFS: StatDef[] = [
  {
    label: "Admins",           key: "admins",
    bg: "bg-[#EDE9FE]",        iconBg: "#DDD6FE", iconColor: "#7C3AED",
    icon: <UserGear size={18} weight="fill" />,
  },
  {
    label: "Students",         key: "students",
    bg: "bg-[#FEF3C7]",        iconBg: "#FDE68A", iconColor: "#D97706",
    icon: <GraduationCap size={18} weight="fill" />,
  },
  {
    label: "Parents",          key: "parents",
    bg: "bg-[#D1FAE5]",        iconBg: "#A7F3D0", iconColor: "#059669",
    icon: <UsersThree size={18} weight="fill" />,
  },
  {
    label: "Faculty",          key: "faculty",
    bg: "bg-[#DBEAFE]",        iconBg: "#BFDBFE", iconColor: "#2563EB",
    icon: <UsersFour size={18} weight="fill" />,
  },
  {
    label: "Finance Manager",  key: "financeManagers",
    bg: "bg-[#FEE2E2]",        iconBg: "#FECACA", iconColor: "#DC2626",
    icon: <CurrencyDollar size={18} weight="fill" />,
  },
  {
    label: "HR Executive",     key: "hrExecutives",
    bg: "bg-[#E0F2FE]",        iconBg: "#BAE6FD", iconColor: "#0284C7",
    icon: <Buildings size={18} weight="fill" />,
  },
  {
    label: "Placement Manager", key: "placementManagers",
    bg: "bg-[#FCE7F3]",         iconBg: "#FBCFE8", iconColor: "#DB2777",
    icon: <Briefcase size={18} weight="fill" />,
  },
];
 
// ─── Shimmer ──────────────────────────────────────────────────────────────────
 
function CardsShimmer() {
  return (
    <div className="flex gap-3 mb-5 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
      {[...Array(7)].map((_, i) => (
        <div key={i} className="min-w-[176px] h-32 flex-shrink-0 animate-pulse bg-gray-200 rounded-lg" />
      ))}
    </div>
  );
}
 
function TableShimmer() {
  return (
    <div className="animate-pulse">
      <div className="flex gap-4 px-4 py-3 bg-gray-100 rounded-t-xl mb-1">
        {TABLE_COLUMNS.map((col) => (
          <div key={col.key} className="flex-1 h-4 bg-gray-300 rounded" />
        ))}
      </div>
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className={`flex gap-4 px-4 py-4 ${i % 2 === 0 ? "bg-white" : "bg-gray-50"} ${i === 5 ? "rounded-b-xl" : ""}`}
        >
          {TABLE_COLUMNS.map((col) => (
            <div
              key={col.key}
              className="flex-1 h-3.5 bg-gray-200 rounded"
              style={{ opacity: 1 - i * 0.1 }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
 
// ─── Detail Modal ─────────────────────────────────────────────────────────────
 
function AdminDetailModal({ admin, onClose }: { admin: AdminDetailRow; onClose: () => void }) {
  const initials = admin.adminName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
 
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(62,61,61,0.64)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 cursor-pointer">
          <X size={18} weight="bold" className="text-[#282828]" />
        </button>
 
        <h2 className="text-lg font-bold text-[#282828] mb-4">Admin Details</h2>
 
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-full bg-[#D1FAE5] flex items-center justify-center text-[#059669] font-bold text-base flex-shrink-0">
            {initials}
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Full Name</p>
            <p className="text-[#22A55D] font-bold text-[15px]">{admin.adminName}</p>
          </div>
        </div>
 
        <div className="space-y-3 text-[13px]">
          {[
            { label: "Admin ID",         value: String(admin.adminId) },
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
            { label: "HR Executive",     value: String(admin.hrExecutive) },
            { label: "Placement",        value: String(admin.placement) },
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
 
// ─── Main Component ───────────────────────────────────────────────────────────
 
export default function AdminListView({ onBack }: Props) {
  const { collegeId, loading: contextLoading } = useCollegeAdmin();
  const router       = useRouter();
  const searchParams = useSearchParams();
 
  const [rows, setRows]                       = useState<AdminDetailRow[]>([]);
  const [summary, setSummary]                 = useState<AdminPageSummary | null>(null);
  const [isFetching, setIsFetching]           = useState(true);
  const [isSearching, setIsSearching]         = useState(false);
  const [search, setSearch]                   = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage]         = useState(1);
  const [totalRecords, setTotalRecords]       = useState(0);
  const [selectedAdmin, setSelectedAdmin]     = useState<AdminDetailRow | null>(null);
 
  const totalPages = Math.ceil(totalRecords / ROWS_PER_PAGE);
 
  // ── Query routing ──
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("subview", "admins");
    router.replace(`?${params.toString()}`, { scroll: false });
    return () => {
      const cleanParams = new URLSearchParams(searchParams.toString());
      cleanParams.delete("subview");
      router.replace(`?${cleanParams.toString()}`, { scroll: false });
    };
  }, []);
 
  // ── Debounce search ──
  useEffect(() => {
    setIsSearching(true);
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);
 
  // ── Fetch ──
  const load = useCallback(async (page: number, searchTerm: string) => {
    if (contextLoading || !collegeId) return;
    if (page === 1) setIsFetching(true);
    setIsSearching(true);
    try {
      const { data, totalCount, summary: fetchedSummary } = await getAdminListData(
        collegeId,
        page,
        ROWS_PER_PAGE,
        searchTerm || undefined,
      );
 
      const withAction: AdminDetailRow[] = data.map((row) => {
        const fullRow: AdminDetailRow = { ...row, action: null };
        fullRow.action = (
          <span
            className="text-[#22A55D] cursor-pointer hover:underline text-sm font-medium"
            onClick={() => setSelectedAdmin(fullRow)}
          >
            View
          </span>
        );
        return fullRow;
      });
 
      setRows(withAction);
      setTotalRecords(totalCount);
      setSummary(fetchedSummary);
    } catch (err) {
      console.error("AdminListView fetch error:", err);
    } finally {
      setIsFetching(false);
      setIsSearching(false);
    }
  }, [collegeId, contextLoading]);
 
  useEffect(() => {
    load(currentPage, debouncedSearch);
  }, [collegeId, contextLoading, currentPage, debouncedSearch]);
 
  const showShimmer = isFetching || isSearching;
 
  const totalUsers = summary
    ? summary.admins + summary.students + summary.parents + summary.faculty +
      summary.financeManagers + summary.hrExecutives + summary.placementManagers
    : 0;
 
  return (
    <div className="flex w-full min-h-screen pb-4">
      <div className="flex-1 p-2 pt-0 flex flex-col overflow-hidden">
 
        {/* ── Header ── */}
        <div className="flex items-center gap-2 mb-4">
          <CaretLeft
            size={20} weight="bold"
            className="cursor-pointer text-[#282828] active:scale-90"
            onClick={onBack}
          />
          <h1 className="text-xl font-semibold text-[#282828]">Admins</h1>
        </div>
 
        {/* ── Total users ── */}
        <p className="text-[#1E40AF] font-bold text-[15px] mb-3">
          Total Users :{" "}
          <span className="text-[#22A55D]">
            {isFetching ? "…" : totalUsers.toLocaleString("en-IN")}
          </span>
        </p>
 
        {/* ── Stat Cards ── */}
        {isFetching && !summary ? (
          <CardsShimmer />
        ) : (
          <div
            className="flex gap-3 mb-5 overflow-x-auto"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {STAT_DEFS.map((def) => (
              <div key={def.key} className="flex-shrink-0">
                {/* No `to` / `onClick` → CardComponent renders as non-clickable */}
                <CardComponent
                  style={`${def.bg} h-32 w-44`}
                  icon={def.icon}
                  iconBgColor={def.iconBg}
                  iconColor={def.iconColor}
                  value={
                    isFetching
                      ? "…"
                      : (summary?.[def.key] ?? 0).toLocaleString("en-IN")
                  }
                  label={def.label}
                />
              </div>
            ))}
          </div>
        )}
 
        {/* ── Admin count ── */}
        <p className="text-[#1E40AF] font-semibold text-[15px] mb-3">
          Admins : {isFetching ? "…" : totalRecords}
        </p>
 
        {/* ── Search ── */}
        <div className="w-[40%] bg-[#EAEAEA] px-3 rounded-full flex items-center mb-4">
          <input
            type="text"
            placeholder="Search by Admin Name, Department, or Course"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-2 outline-none text-sm bg-transparent text-[#282828] placeholder:text-[#6B7280]"
          />
          {isSearching ? (
            <div className="w-4 h-4 border-2 border-[#43C17A] border-t-transparent rounded-full animate-spin" />
          ) : (
            <MagnifyingGlass size={18} className="text-[#43C17A]" />
          )}
        </div>
 
        {/* ── Table / Shimmer / Empty ── */}
        {showShimmer ? (
          <TableShimmer />
        ) : rows.length === 0 ? (
          <p className="text-gray-400 text-sm mt-8 text-center">No admins found.</p>
        ) : (
          <TableComponent columns={TABLE_COLUMNS} tableData={rows} height="55vh" />
        )}
 
        {/* ── Pagination ── */}
        {totalPages > 1 && !showShimmer && (
          <div className="flex justify-end items-center gap-3 mt-4 mb-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`w-10 h-10 flex items-center justify-center rounded-lg border ${
                currentPage === 1 ? "border-gray-200 text-gray-300" : "border-gray-300 text-gray-600 hover:bg-gray-100"
              }`}
            >
              <CaretLeft size={18} weight="bold" />
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-10 h-10 rounded-lg font-semibold ${
                  currentPage === i + 1 ? "bg-[#16284F] text-white" : "border border-gray-300 text-gray-600 hover:bg-gray-100"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`w-10 h-10 flex items-center justify-center rounded-lg border ${
                currentPage === totalPages ? "border-gray-200 text-gray-300" : "border-gray-300 text-gray-600 hover:bg-gray-100"
              }`}
            >
              <CaretRight size={18} weight="bold" />
            </button>
          </div>
        )}
      </div>
 
      {/* ── Detail Modal ── */}
      {selectedAdmin && (
        <AdminDetailModal admin={selectedAdmin} onClose={() => setSelectedAdmin(null)} />
      )}
    </div>
  );
}
