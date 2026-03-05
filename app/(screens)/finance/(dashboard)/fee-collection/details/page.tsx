"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  CurrencyDollarSimpleIcon,
  UsersThreeIcon,
  MagnifyingGlass,
  CaretDown,
  CaretLeftIcon,
  CaretRight,
} from "@phosphor-icons/react";
import CardComponent from "@/app/utils/card";
import TableComponent from "@/app/utils/table/table";
import { Suspense, useEffect, useState } from "react";
import { Loader } from "@/app/(screens)/(student)/calendar/right/timetable";
import { useFinanceManager } from "@/app/utils/context/financeManager/useFinanceManager";
import { getYearFinanceStudentList } from "@/lib/helpers/finance/dashboard/getYearFinanceStudentList";

function FeeCollectionDetailsPage() {
  const searchParams = useSearchParams();
  const branchId = searchParams.get("branchId");
  const branchType = searchParams.get("branchType");
  const academicYearId = searchParams.get("academicYearId");
  const academicYear = searchParams.get("academicYear");
  const selectedYear = searchParams.get("selectedYear");
  const expected = searchParams.get("TotalExpected");
  const collected = searchParams.get("TotalCollected");
  const pending = searchParams.get("TotalPending");
  const branchTypeRaw = searchParams.get("branchType") || "";
  const academicYearRaw = searchParams.get("academicYear") || "";

  const branchTypeClean = decodeURIComponent(branchTypeRaw).trim();
  const academicYearClean = decodeURIComponent(academicYearRaw).trim();
  const yearShort = academicYearClean.split(" ")[0];


  console.log("📌 Details Params:", {
    branchId,
    branchType,
    academicYearId,
    academicYear,
    selectedYear,
    expected,
    collected,
    pending
  });
  const router = useRouter();
  const { collegeId, collegeEducationId } = useFinanceManager();

  const [semesterData, setSemesterData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "pending" | "partial">("all");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const rowsPerPage = 10;
  const totalPages = Math.ceil(totalRecords / rowsPerPage);


  const year = searchParams.get("year") || "1st Year";
  const columns = [
    { title: "Student Name", key: "name" },
    { title: "Student ID", key: "id" },
    { title: "Branch", key: "dept" },
    { title: "Total Fee (₹)", key: "total" },
    { title: "Paid Amount (₹)", key: "paid" },
    { title: "Balance (₹)", key: "balance" },
    { title: "Payment Status", key: "status" },
  ];

  const filteredStudents = students.filter((s) => {
    const matchesStatus =
      statusFilter === "all"
        ? true
        : s.paymentStatus.toLowerCase() === statusFilter;

    const matchesSearch =
      s.studentName.toLowerCase().includes(search.toLowerCase()) ||
      String(s.studentId).toLowerCase().includes(search.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const tableData = filteredStudents.map((s) => ({
    name: s.studentName,
    id: s.studentId,
    dept: s.branch,
    total: s.totalFee.toLocaleString(),
    paid: s.paidAmount.toLocaleString(),
    balance: s.balanceAmount.toLocaleString(),
    status: (
      <div className="flex items-center gap-2">
        <span
          className={`w-2 h-2 rounded-full ${s.paymentStatus === "Paid"
            ? "bg-green-600"
            : s.paymentStatus === "Partial"
              ? "bg-yellow-500"
              : "bg-red-500"
            }`}
        />
        <span
          className={`font-medium ${s.paymentStatus === "Paid"
            ? "text-green-600"
            : s.paymentStatus === "Partial"
              ? "text-yellow-600"
              : "text-red-500"
            }`}
        >
          {s.paymentStatus}
        </span>
      </div>
    ),
  }));

  useEffect(() => {
    const fetchStudents = async () => {
      if (!collegeId || !collegeEducationId || !branchId || !academicYearId) return;

      setLoading(true);

      try {
        const res = await getYearFinanceStudentList(
          {
            collegeId,
            collegeEducationId,
            collegeBranchId: Number(branchId),
            collegeAcademicYearId: Number(academicYearId),
          },
          currentPage,
          rowsPerPage
        );

        setStudents(Array.isArray(res?.students) ? res.students : []);
        setTotalRecords(typeof res?.totalCount === "number" ? res.totalCount : 0);
      } catch (err) {
        console.error("Failed to load students:", err);
        setStudents([]);
        setTotalRecords(0);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [collegeId, collegeEducationId, branchId, academicYearId, currentPage]);

  return (
    <div className="p-2 bg-[#F3F4F6] min-h-screen">
      <div className="flex items-center gap-2 mb-6">
        <CaretLeftIcon size={20} weight="bold" className="text-black cursor-pointer active:scale-90" onClick={router.back} />
        <h1 className="text-xl font-semibold text-[#282828]">
          {academicYearClean} Fee Collection Details
        </h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-4">
        <CardComponent
          icon={<UsersThreeIcon size={22} weight="fill" />}
          value={totalRecords.toString()}
          label="Total Students"
          iconBgColor="#FFFFFF"
          iconColor="#6D28D9"
          style="bg-[#F3E8FF]"
        />
        <CardComponent
          icon={<CurrencyDollarSimpleIcon size={22} weight="fill" />}
          value={String(expected)}
          label="Total Expected"
          iconBgColor="#FFFFFF"
          iconColor="#2563EB"
          style="bg-[#EFF6FF]"
        />
        <CardComponent
          icon={<CurrencyDollarSimpleIcon size={22} weight="fill" />}
          value={String(collected)}
          label="Total Collected"
          iconBgColor="#FFFFFF"
          iconColor="#16A34A"
          style="bg-[#ECFDF5]"
        />
        <CardComponent
          icon={<CurrencyDollarSimpleIcon size={22} weight="fill" />}
          value={String(pending)}
          label="Pending Amount"
          iconBgColor="#FFFFFF"
          iconColor="#DC2626"
          style="bg-[#FEF2F2]"
        />
      </div>
      <div className="flex flex-wrap items-center gap-6 mb-6">
        <div className="w-[40%] bg-[#EAEAEA] px-2 rounded-2xl flex items-center justify-center">
          <input
            type="text"
            placeholder="Search by Student Name / Roll No."
            className="w-full p-2 outline-none rounded-lg text-sm text-[#282828] bg-transparent"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <MagnifyingGlass size={20} className="text-[#43C17A]" />
        </div>
        <div className="flex items-center gap-6 text-sm text-[#374151]">
          <FilterPill title="Branch" value={branchTypeClean} />
          <FilterPill title="Year" value={yearShort} />
          <div className="flex items-center gap-2 relative">
            <span className="font-medium text-[#374151]">Status</span>

            <div
              onClick={() => setShowStatusDropdown(!showStatusDropdown)}
              className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#43C17A26] text-[#43C17A] font-medium cursor-pointer"
            >
              {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
              <CaretDown size={14} weight="bold" />
            </div>

            {showStatusDropdown && (
              <div className="absolute top-10 left-0 bg-white shadow-lg rounded-lg w-32 z-50 text-sm">
                {["all", "paid", "pending", "partial"].map((status) => (
                  <div
                    key={status}
                    className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${statusFilter === status ? "bg-gray-100 font-semibold" : ""
                      }`}
                    onClick={() => {
                      setStatusFilter(status as any);
                      setShowStatusDropdown(false);
                    }}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      {loading ? (
        <div className="flex justify-center items-center h-[200px]">
          <Loader />
        </div>
      ) : (
        <TableComponent
          columns={columns}
          tableData={tableData}
          height="60vh"
        />
      )}
      {totalPages > 1 && (
        <div className="flex justify-end items-center gap-3 mt-8 mb-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className={`w-10 h-10 flex items-center justify-center rounded-lg border
        ${currentPage === 1
                ? "border-gray-200 text-gray-300"
                : "border-gray-300 text-gray-600 hover:bg-gray-100"
              }`}
          >
            <CaretLeftIcon size={18} weight="bold" />
          </button>

          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`w-10 h-10 rounded-lg font-semibold
          ${currentPage === i + 1
                  ? "bg-[#16284F] text-white"
                  : "border border-gray-300 text-gray-600 hover:bg-gray-100"
                }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() =>
              setCurrentPage((p) =>
                Math.min(totalPages, p + 1)
              )
            }
            disabled={currentPage === totalPages}
            className={`w-10 h-10 flex items-center justify-center rounded-lg border
        ${currentPage === totalPages
                ? "border-gray-200 text-gray-300"
                : "border-gray-300 text-gray-600 hover:bg-gray-100"
              }`}
          >
            <CaretRight size={18} weight="bold" />
          </button>
        </div>
      )}
    </div>
  );
}

function FilterPill({
  title,
  value,
  showCaret = false,
}: {
  title: string;
  value: string;
  showCaret?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-medium text-[#374151]">{title}</span>

      <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#43C17A26] text-[#43C17A] font-medium">
        {value}
        {showCaret && <CaretDown size={14} weight="bold" />}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6"><Loader /></div>}>
      <FeeCollectionDetailsPage />
    </Suspense>
  );
}