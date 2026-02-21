"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  MagnifyingGlass,
  DownloadSimple,
  UsersThree,
  CaretLeftIcon,
  BuildingApartmentIcon,
  CaretDown,
} from "@phosphor-icons/react";
import CardComponent from "@/app/utils/card";
import TableComponent from "@/app/utils/table/table";
import { downloadCSV } from "@/app/utils/downloadCSV";
import { useFinanceManager } from "@/app/utils/context/financeManager/useFinanceManager";
import { getFinanceFilterOptions } from "@/lib/helpers/finance/getFinanceFilterOptions";
import { getOverallStudentsOverview, getOverallStudentsSummary } from "@/lib/helpers/finance/getOverallStudentsOverview";
import toast from "react-hot-toast";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";


function OverallStudentsOverview() {
  const router = useRouter();

  const {
    collegeId,
    collegeEducationId,
    collegeEducationType,
    loading,
  } = useFinanceManager();
  const [search, setSearch] = useState("");
  const [educationFilter, setEducationFilter] = useState("All");
  const [branchFilter, setBranchFilter] = useState("All");
  const [yearFilter, setYearFilter] = useState("All");
  const [semesterFilter, setSemesterFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const searchParams = useSearchParams();
  const studentsCount = searchParams.get("studentsCount");
  const [branches, setBranches] = useState<any[]>([]);
  const [years, setYears] = useState<any[]>([]);
  const [semesters, setSemesters] = useState<any[]>([]);
  const [studentsData, setStudentsData] = useState<any[]>([]);
  const [summaryCounts, setSummaryCounts] = useState({
    total: 0,
    paid: 0,
    pending: 0,
    partial: 0,
  });
  const [tableLoading, setTableLoading] = useState(false);
  const [cardsLoading, setCardsLoading] = useState(false);



  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const rowsPerPage = 10; 
  const totalPages = Math.ceil(totalRecords / rowsPerPage);

  const statusOptions = ["All", "Paid", "Pending", "Partial"];



  const cardsData = [
    {
      style: "bg-[#E2DAFF]",
      icon: <UsersThree size={24} color="#6C20CA" weight="fill" />,
      value: summaryCounts.total.toString(),
      label: "Total Students",
    },
    {
      style: "bg-[#E6FBEA]",
      icon: <UsersThree size={24} color="#43C17A" weight="fill" />,
      value: summaryCounts.paid.toString(),
      label: "Fully Paid Students",
    },
    {
      style: "bg-[#FFEDDA]",
      icon: <UsersThree size={24} color="#FFBB70" weight="fill" />,
      value: summaryCounts.partial.toString(),
      label: "Partially Paid Students",
    },
    {
      style: "bg-[#FFE2E2]",
      icon: <UsersThree size={24} color="#FF0000" weight="fill" />,
      value: summaryCounts.pending.toString(),
      label: "Pending Students",
    },
  ];

  const loadCardsSummary = async () => {
    if (!collegeId || !collegeEducationId) return;

    const summary = await getOverallStudentsSummary(
      collegeId,
      collegeEducationId
    );

    setSummaryCounts(summary);

  };


  const loadStudents = async () => {
    if (!collegeId || !collegeEducationId || loading) return;
    setTableLoading(true);
    try {
      const data = await getOverallStudentsOverview(
        {
          collegeId,
          collegeEducationId,
          collegeBranchId:
            branchFilter !== "All" ? Number(branchFilter) : undefined,
          collegeAcademicYearId:
            yearFilter !== "All" ? Number(yearFilter) : undefined,
          collegeSemesterId:
            semesterFilter !== "All"
              ? Number(semesterFilter)
              : undefined,
          status:
            statusFilter !== "All"
              ? (statusFilter as "Paid" | "Pending" | "Partial")
              : undefined,
        },
        currentPage,
        rowsPerPage,
        search
      );


      setStudentsData(data.students);
      // setCounts(data.counts);
      setTotalRecords(data.totalCount ?? 0);


    } catch (error) {
      console.error("Error loading students data:", error);
      toast.error("vamshi.");
    }
    finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    loadCardsSummary();
  }, [collegeId, collegeEducationId]);


  useEffect(() => {
    loadStudents();
  }, [
    collegeId,
    collegeEducationId,
    branchFilter,
    yearFilter,
    semesterFilter,
    statusFilter,
    currentPage,
    search,
  ]);

  const renderStatus = (status: "Paid" | "Pending" | "Partial") => {
    if (status === "Paid") {
      return (
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#22A55D]" />
          <span className="text-[#22A55D] font-medium">Paid</span>
        </div>
      );
    }

    if (status === "Partial") {
      return (
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
          <span className="text-[#F59E0B] font-medium">Partial</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
        <span className="text-[#EF4444] font-medium">Pending</span>
      </div>
    );
  };




  const tableData = useMemo(() => {
    return studentsData.map((item) => ({
      studentName: item.studentName,
      rollNo: item.rollNo,
      educationType: collegeEducationType,
      branch: item.branchCode,
      year: item.yearName,
      semester: `Sem ${item.semester}`,
      paid: `₹ ${Number(item.paidAmount).toLocaleString("en-IN")}`,
      pending: `₹ ${Number(item.pendingAmount).toLocaleString("en-IN")}`,
      status: renderStatus(item.status),
      action: (
        <span
          onClick={() =>
            router.push(
              `/finance/finance-analytics/students/${item.studentId}`
            )
          }
          className="text-[#22A55D] cursor-pointer hover:underline text-sm font-medium"
        >
          View
        </span>
      ),
    }));
  }, [studentsData]);


  const handleDownload = () => {
    downloadCSV(studentsData, "students-report");
  };


  const columns = [
    { title: "Student Name", key: "studentName" },
    { title: "Roll No.", key: "rollNo" },
    { title: "Education Type", key: "educationType" },
    { title: "Branch", key: "branch" },
    { title: "Year", key: "year" },
    { title: "Semester", key: "semester" },
    { title: "Paid", key: "paid" },
    { title: "Pending", key: "pending" },
    { title: "Status", key: "status" },
    { title: "Action", key: "action" },
  ];

  useEffect(() => {
    if (!collegeId || !collegeEducationId || loading) return;

    const loadFilters = async () => {
      const data = await getFinanceFilterOptions(
        collegeId,
        collegeEducationId
      );

      setBranches(data.branches);
      setYears(data.years);
      setSemesters(data.semesters);
    };

    loadFilters();
  }, [collegeId, collegeEducationId]);

  return (
    <div className="p-2 min-h-screen space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1 cursor-pointer">
          <CaretLeftIcon
            size={20}
            color="#282828"
            className="cursor-pointer"
            onClick={() => router.back()}
          />
          <h2 className="text-lg font-semibold text-[#282828]">
            Overall Students Overview
          </h2>
        </div>
        <button
          onClick={handleDownload}
          className="bg-[#16284F] cursor-pointer text-white px-4 py-2 rounded-md text-sm flex items-center gap-2"
        >
          Download Report
          <DownloadSimple size={18} />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3">
        {cardsData.map((card, index) => (
          <CardComponent
            key={index}
            style={card.style}
            icon={card.icon}
            value={card.value}
            label={card.label}
          />
        ))}
      </div>
      <div className="flex items-center gap-6">
        <div className="flex items-center bg-[#EAEAEA] rounded-full px-4 py-2 w-[300px] flex-shrink-0">
          <input
            placeholder="Search by Student Name / Roll No."
            className="bg-transparent outline-none text-sm w-full text-[#282828]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <MagnifyingGlass size={24} className="text-[#22A55D]" />
        </div>
        <div className="overflow-x-auto w-full">
          <div className="flex items-center gap-6 min-w-max">
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#282828] font-semibold">
                Education Type
              </span>
              <input
                value={collegeEducationType ?? ""}
                disabled
                className="bg-[#43C17A26] text-center text-[#43C17A] outline-none w-[80px] cursor-not-allowed px-3 py-1 rounded-full text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#282828] font-semibold">
                Branch
              </span>

              <div className="relative">
                <select
                  value={branchFilter}
                  onChange={(e) => {
                    const value = e.target.value;
                    setBranchFilter(value);

                    // Reset dependent fields
                    setYearFilter("All");
                    setSemesterFilter("All");
                  }}
                  className="appearance-none bg-[#43C17A26] text-center text-[#43C17A] outline-none px-6 py-1 pr-8 rounded-full text-sm cursor-pointer"
                >
                  <option value="All">All</option>
                  {branches.map((b) => (
                    <option key={b.collegeBranchId} value={b.collegeBranchId}>
                      {b.collegeBranchCode}
                    </option>
                  ))}
                </select>
                <CaretDown
                  size={14}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#43C17A] pointer-events-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#282828] font-semibold">
                  Year
                </span>
                <div className="relative">
                  <select
                    value={yearFilter}
                    onChange={(e) => {
                      const value = e.target.value;
                      setYearFilter(value);

                      // Reset Semester when Year changes
                      setSemesterFilter("All");
                    }}
                    disabled={branchFilter === "All"}
                    className="appearance-none bg-[#43C17A26] text-center text-[#43C17A] outline-none px-6 py-1 pr-8 rounded-full text-sm cursor-pointer"
                  >
                    <option value="All">All</option>
                    {years
                      .filter(
                        (y) =>
                          branchFilter === "All" ||
                          y.collegeBranchId == branchFilter
                      )
                      .map((y) => (
                        <option
                          key={y.collegeAcademicYearId}
                          value={y.collegeAcademicYearId}
                        >
                          {y.collegeAcademicYear}
                        </option>
                      ))}
                  </select>
                  <CaretDown
                    size={14}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#43C17A] pointer-events-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#282828] font-semibold">
                  Sem
                </span>
                <div className="relative">
                  <select
                    value={semesterFilter}
                    onChange={(e) => setSemesterFilter(e.target.value)}
                    disabled={yearFilter === "All"}
                    className="appearance-none bg-[#43C17A26] text-center text-[#43C17A] outline-none px-6 py-1 pr-8 rounded-full text-sm cursor-pointer"
                  >
                    <option value="All">All</option>
                    {semesters
                      .filter(
                        (s) =>
                          yearFilter === "All" ||
                          s.collegeAcademicYearId == yearFilter
                      )
                      .map((s) => (
                        <option
                          key={s.collegeSemesterId}
                          value={s.collegeSemesterId}
                        >
                          Sem {s.collegeSemester}
                        </option>
                      ))}
                  </select>
                  <CaretDown
                    size={14}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#43C17A] pointer-events-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-[#282828] font-semibold">
                Status
              </span>
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none bg-[#43C17A26] text-center text-[#43C17A] outline-none px-6 py-1 pr-8 rounded-full text-sm cursor-pointer"
                >
                  {statusOptions.map((o) => (
                    <option key={o} value={o} className="text-left">
                      {o}
                    </option>
                  ))}
                </select>

                <CaretDown
                  size={14}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#43C17A] pointer-events-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <h1 className="text-lg text-[#282828] font-bold mb-3 -mt-3">
        Overall Students Overview
      </h1>
      <TableComponent
        columns={columns}
        tableData={tableData}
        isLoading={tableLoading}
        height="55vh"
      />
      {totalPages > 1 && (
        <div className="flex justify-end items-center gap-3 mt-8 mb-4">

          {/* Prev Button */}
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className={`w-10 h-10 flex items-center justify-center rounded-lg border transition-all
        ${currentPage === 1
                ? "border-gray-200 text-gray-300 cursor-not-allowed"
                : "border-gray-300 text-gray-600 hover:bg-gray-100"
              }`}
          >
            <CaretLeft size={18} weight="bold" />
          </button>

          {/* Page Numbers */}
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`w-10 h-10 rounded-lg font-semibold transition-all
          ${currentPage === i + 1
                  ? "bg-[#16284F] text-white shadow-md"
                  : "border border-gray-300 text-gray-600 hover:bg-gray-100"
                }`}
            >
              {i + 1}
            </button>
          ))}

          {/* Next Button */}
          <button
            onClick={() =>
              setCurrentPage((p) => Math.min(totalPages, p + 1))
            }
            disabled={currentPage === totalPages}
            className={`w-10 h-10 flex items-center justify-center rounded-lg border transition-all
        ${currentPage === totalPages
                ? "border-gray-200 text-gray-300 cursor-not-allowed"
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
export default function Page() {
  return (
    <Suspense fallback={<div>Loading students overview...</div>}>
      <OverallStudentsOverview />
    </Suspense>
  );
}
