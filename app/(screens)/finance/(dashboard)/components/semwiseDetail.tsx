"use client";
 
import { useEffect, useMemo, useState } from "react";
import CardComponent from "@/app/utils/card";
import {
  UsersThree,
  MagnifyingGlass,
  CurrencyInr,
  FunnelSimple,
  Faders,
} from "@phosphor-icons/react";
import TableComponent from "@/app/utils/table/table";
import { useRouter } from "next/navigation";
import { useFinanceManager } from "@/app/utils/context/financeManager/useFinanceManager";
 
import { useSearchParams } from "next/navigation";
import { getSemesterFinanceSummary } from "@/lib/helpers/finance/getSemesterStudents";
// import { getCurrentSemesterPendingStudents } from "@/lib/helpers/finance/dashboard/getPendingStudentsCount";
// import { getSemesterStudents } from "@/lib/helpers/finance/getSemesterStudents";
// import { getFinanceYearSemesterCollectionSummary } from "@/lib/helpers/finance/getSemesterStudents";
// import { getSemesterStudents } from "@/lib/helpers/finance/getSemesterStudents";
 
type StudentRow = {
  studentId: number;
  fullName: string;
  branch: string;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  paymentStatus: "Paid" | "Pending" | "Partial";
  lastPaymentDate: string | null;
};
 
export default function SemwiseDetail({ semester }: { semester: string }) {
  const [sortKey, setSortKey] = useState<string>("studentName");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "pending" | "partial">("all");
  const [search, setSearch] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [summary, setSummary] = useState({
    totalStudents: 0,
    expected: 0,
    collected: 0,
    pending: 0,
    paidStudents: 0,
    pendingStudents: 0,
  });
  const { collegeId, collegeEducationId, loading } = useFinanceManager();
  const router = useRouter();
 
  const searchParams = useSearchParams();
 
  const branchIdParam = searchParams.get("branchId");
  const academicYearParam = searchParams.get("academicYearId");
  const academicYear = searchParams.get("academicYear");
  const semesterParam = searchParams.get("semesterId");
 
  const branchId = branchIdParam ? Number(branchIdParam) : null;
  const academicYearId = academicYearParam ? Number(academicYearParam) : null;
  const semesterId = semesterParam ? Number(semesterParam) : null;
  const branchName = searchParams.get("branchName");
  const year = searchParams.get("year");
  const breadcrumb = `B-Tech → ${branchName} - ${academicYear} - ${semester}`;
 
  const filterOptions: { label: string; value: "all" | "paid" | "pending" | "partial" }[] =
    [
      { label: "All", value: "all" },
      { label: "Paid", value: "paid" },
      { label: "Pending", value: "pending" },
      { label: "Partial", value: "partial" },
    ];
 
 
  // const initialData = [
  //   {
  //     studentName: "Aarav Reddy",
  //     studentId: "CSE21A001",
  //     department: "CSE",
  //     totalFee: 85000,
  //     paidAmount: 85000,
  //     lastPaymentDate: "15 Jan 2026",
  //   },
  //   {
  //     studentName: "Priya Sharma",
  //     studentId: "CSE21A002",
  //     department: "CSE",
  //     totalFee: 85000,
  //     paidAmount: 60000,
  //     lastPaymentDate: "15 Jan 2026",
  //   },
  //   {
  //     studentName: "Rohit Kumar",
  //     studentId: "CSE21A003",
  //     department: "CSE",
  //     totalFee: 85000,
  //     paidAmount: 85000,
  //     lastPaymentDate: "15 Jan 2026",
  //   },
  //   {
  //     studentName: "Ananya Verma",
  //     studentId: "CSE21A004",
  //     department: "CSE",
  //     totalFee: 85000,
  //     paidAmount: 45000,
  //     lastPaymentDate: "15 Jan 2026",
  //   },
  //   {
  //     studentName: "Sai Teja",
  //     studentId: "CSE21A005",
  //     department: "CSE",
  //     totalFee: 85000,
  //     paidAmount: 85000,
  //     lastPaymentDate: "15 Jan 2026",
  //   },
  //   {
  //     studentName: "Kiran Rao",
  //     studentId: "CSE21A006",
  //     department: "CSE",
  //     totalFee: 85000,
  //     paidAmount: 50000,
  //     lastPaymentDate: "15 Jan 2026",
  //   },
  //   {
  //     studentName: "Megha Das",
  //     studentId: "CSE21A007",
  //     department: "CSE",
  //     totalFee: 85000,
  //     paidAmount: 85000,
  //     lastPaymentDate: "15 Jan 2026",
  //   },
  //   {
  //     studentName: "Rahul Singh",
  //     studentId: "CSE21A008",
  //     department: "CSE",
  //     totalFee: 85000,
  //     paidAmount: 30000,
  //     lastPaymentDate: "15 Jan 2026",
  //   },
  //   {
  //     studentName: "Divya Patel",
  //     studentId: "CSE21A009",
  //     department: "CSE",
  //     totalFee: 85000,
  //     paidAmount: 85000,
  //     lastPaymentDate: "15 Jan 2026",
  //   },
  //   {
  //     studentName: "Vikram Jain",
  //     studentId: "CSE21A010",
  //     department: "CSE",
  //     totalFee: 85000,
  //     paidAmount: 70000,
  //     lastPaymentDate: "15 Jan 2026",
  //   },
  //   {
  //     studentName: "Harsha Vardhan",
  //     studentId: "CSE21A011",
  //     department: "CSE",
  //     totalFee: 85000,
  //     paidAmount: 85000,
  //     lastPaymentDate: "15 Jan 2026",
  //   },
  //   {
  //     studentName: "Neha Kapoor",
  //     studentId: "CSE21A012",
  //     department: "CSE",
  //     totalFee: 85000,
  //     paidAmount: 40000,
  //     lastPaymentDate: "15 Jan 2026",
  //   },
  //   {
  //     studentName: "Manoj Kumar",
  //     studentId: "CSE21A013",
  //     department: "CSE",
  //     totalFee: 85000,
  //     paidAmount: 85000,
  //     lastPaymentDate: "15 Jan 2026",
  //   },
  //   {
  //     studentName: "Sneha Reddy",
  //     studentId: "CSE21A014",
  //     department: "CSE",
  //     totalFee: 85000,
  //     paidAmount: 65000,
  //     lastPaymentDate: "15 Jan 2026",
  //   },
  //   {
  //     studentName: "Arjun Nair",
  //     studentId: "CSE21A015",
  //     department: "CSE",
  //     totalFee: 85000,
  //     paidAmount: 85000,
  //     lastPaymentDate: "15 Jan 2026",
  //   },
  // ];
 
  const columns = [
    { title: "Student Name", key: "fullName" },
    { title: "Student ID", key: "studentId" },
    { title: "Branch", key: "branch" },
    { title: "Total Fee (₹)", key: "totalAmountFormatted" },
    { title: "Paid Amount (₹)", key: "paidAmountFormatted" },
    { title: "Balance (₹)", key: "balanceAmountFormatted" },
    { title: "Payment Status", key: "paymentStatusElement" },
    { title: "Last Payment Date", key: "lastPaymentDate" },
    { title: "Action", key: "action" },
  ];
 
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
 
    const date = new Date(dateString);
 
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };
 
  const processedData = useMemo(() => {
    let data = [...students];
 
    if (search) {
      data = data.filter(
        (item) =>
          item.fullName.toLowerCase().includes(search.toLowerCase()) ||
          String(item.studentId).toLowerCase().includes(search.toLowerCase())
      );
    }
 
    data.sort((a: any, b: any) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
 
      if (typeof aVal === "number") {
        return sortDirection === "asc"
          ? aVal - bVal
          : bVal - aVal;
      }
 
      return sortDirection === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
 
    return data.map((item) => ({
      ...item,
 
      totalAmount: item.totalAmount,   // keep number
      paidAmount: item.paidAmount,
      balanceAmount: item.balanceAmount,
 
      totalAmountFormatted: `₹ ${item.totalAmount.toLocaleString("en-IN")}`,
      paidAmountFormatted: `₹ ${item.paidAmount.toLocaleString("en-IN")}`,
      balanceAmountFormatted: `₹ ${item.balanceAmount.toLocaleString("en-IN")}`,
 
      lastPaymentDate: formatDate(item.lastPaymentDate),
 
      paymentStatusElement: (
        <div className="flex items-center justify-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${item.paymentStatus === "Paid"
              ? "bg-green-600"
              : item.paymentStatus === "Partial"
                ? "bg-orange-500"
                : "bg-red-600"
              }`}
          />
 
          <span
            className={`${item.paymentStatus === "Paid"
              ? "text-green-600"
              : item.paymentStatus === "Partial"
                ? "text-orange-500"
                : "text-red-600"
              }`}
          >
            {item.paymentStatus}
          </span>
        </div>
      ),
 
      action: (
        <span
          className="cursor-pointer text-[#00A94A] font-medium"
          onClick={() => router.push(`/finance/${item.studentId}`)}
        >
          View Details
        </span>
      ),
    }));
  }, [students, search]);
 
 
 
 
  // const processedData = useMemo(() => {
  //   let data = [...initialData];
 
  //   if (search) {
  //     data = data.filter(
  //       (item) =>
  //         item.studentName.toLowerCase().includes(search.toLowerCase()) ||
  //         item.studentId.toLowerCase().includes(search.toLowerCase()),
  //     );
  //   }
 
  //   if (statusFilter === "paid") {
  //     data = data.filter((item) => item.paidAmount === item.totalFee);
  //   }
 
  //   if (statusFilter === "pending") {
  //     data = data.filter((item) => item.paidAmount < item.totalFee);
  //   }
 
  //   data = data.map((item) => {
  //     const balance = item.totalFee - item.paidAmount;
  //     const isPaid = balance === 0;
 
  //     return {
  //       ...item,
  //       balance,
 
  //       paymentStatus: (
  //         <div className="flex items-center justify-center gap-2">
  //           <span
  //             className={`h-2 w-2 rounded-full ${isPaid ? "bg-green-600" : "bg-red-600"
  //               }`}
  //           />
  //           <span className={`${isPaid ? "text-green-600" : "text-red-600"}`}>
  //             {isPaid ? "Paid" : "Pending"}
  //           </span>
  //         </div>
  //       ),
 
  //       action: (
  //         <span
  //           className="cursor-pointer text-[#00A94A] font-medium"
  //           onClick={() => router.push(`/finance/${item.studentId}`)}
  //         >
  //           View Details
  //         </span>
  //       ),
  //     };
  //   });
 
  //   data.sort((a: any, b: any) => {
  //     if (typeof a[sortKey] === "number") {
  //       return sortDirection === "asc"
  //         ? a[sortKey] - b[sortKey]
  //         : b[sortKey] - a[sortKey];
  //     }
  //     return sortDirection === "asc"
  //       ? String(a[sortKey]).localeCompare(String(b[sortKey]))
  //       : String(b[sortKey]).localeCompare(String(a[sortKey]));
  //   });
 
  //   return data;
  // }, [search, statusFilter, sortKey, sortDirection]);
 
  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };
 
  useEffect(() => {
    const loadData = async () => {
      if (
        loading ||
        !collegeId ||
        !collegeEducationId ||
        branchId === null ||
        academicYearId === null ||
        semesterId === null
      ) return;
 
      try {
        const response = await getSemesterFinanceSummary({
          collegeId,
          collegeEducationId,
          collegeBranchId: branchId,
          collegeAcademicYearId: academicYearId,
          collegeSemesterId: semesterId,
        });
 
        if (!response) return;
 
        let studentData: StudentRow[] = response.students || [];
 
        if (statusFilter === "paid") {
          studentData = studentData.filter((s) => s.paymentStatus === "Paid");
        }
 
        if (statusFilter === "pending") {
          studentData = studentData.filter((s) => s.paymentStatus === "Pending");
        }
 
        if (statusFilter === "partial") {
          studentData = studentData.filter((s) => s.paymentStatus === "Partial");
        }
 
        setStudents(studentData);
        setSummary(response.summary);
      } catch (error) {
      }
    };
 
    loadData();
  }, [
    loading,
    collegeId,
    collegeEducationId,
    branchId,
    academicYearId,
    semesterId,
    statusFilter,
  ]);
 
  return (
    <div className="flex flex-col h-screen">
      <h2 className="text-lg font-semibold text-[#2E7D32] mb-3">
        {breadcrumb}
      </h2>
      <div className="bg-[#E2DAFF] rounded-lg p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 text-sm font-medium">
        <div>
          <p className="text-[#3E18CB] font-semibold text-md">
            {year
              ? `${year}-${String(Number(year) + 1).slice(-2)}`
              : ""}
          </p>
          <p className="text-[#282828] text-sm">Academic Year</p>
        </div>
        <div>
          <p className="text-[#3E18CB] font-semibold text-md">{summary.totalStudents}</p>
          <p className="text-[#282828] text-sm">Total Students</p>
        </div>
        <div>
          <p className="text-[#3E18CB] font-semibold text-md">{summary.expected.toLocaleString()}</p>
          <p className="text-[#282828] text-sm">Expected Amount</p>
        </div>
        <div>
          <p className="text-[#3E18CB] font-semibold text-md">{summary.collected.toLocaleString()}</p>
          <p className="text-[#282828] text-sm">Collected Amount</p>
        </div>
        <div>
          <p className="text-[#3E18CB] font-semibold text-md">{summary.pending.toLocaleString()}</p>
          <p className="text-[#282828] text-sm">Pending</p>
        </div>
      </div>
 
      <div className="flex gap-4 mt-6">
        <CardComponent
          style="bg-[#CEE6FF] h-[120px] w-[220px]"
          icon={<CurrencyInr size={28} weight="fill" color="#60AEFF" />}
          value={`₹ ${summary.collected.toLocaleString("en-IN")}`}
          label="Collected"
        />
        <CardComponent
          style="bg-[#FFE2E2] h-[120px] w-[220px]"
          icon={<CurrencyInr size={28} weight="fill" color="#FF0000" />}
          value={`₹ ${summary.pending.toLocaleString("en-IN")}`}
          label="Pending"
        />
        <CardComponent
          style="bg-[#E6FBEA] h-[120px] w-[220px]"
          icon={<UsersThree size={28} weight="fill" color="#43C17A" />}
          value={summary.paidStudents.toString()}
          label="Paid Students"
        />
 
        <CardComponent
          style="bg-[#FFEDDA] h-[120px] w-[220px]"
          icon={<UsersThree size={28} weight="fill" color="#FFBB70" />}
          value={summary.pendingStudents.toString()}
          label="Pending Students"
        />
      </div>
 
      <div className="flex justify-between items-center mt-6 mb-3 ">
        <div className="w-[55%] bg-[#EAEAEA] px-2 rounded-2xl flex items-center justify-center">
          <input
            type="text"
            placeholder="Search by Student Name or ID"
            className="w-full p-2 outline-none rounded-lg text-sm text-[#282828]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <MagnifyingGlass size={20} className="text-[#43C17A] left-3 top-3" />
        </div>
 
        <div className="flex gap-2">
          <div
            onClick={() => handleSort("fullName")}
            className="bg-[#43C17A1F] cursor-pointer rounded-full p-2 flex items-center justify-center"
          >
            <FunnelSimple size={20} className="text-[#00A94A]" />
          </div>
 
          <div
            onClick={() => setShowFilter(!showFilter)}
            className="relative bg-[#43C17A1F] cursor-pointer rounded-full p-2 flex items-center justify-center"
          >
            <Faders size={20} className="text-[#00A94A]" />
            {showFilter && (
              <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-white shadow-lg rounded-lg text-sm w-36 z-50">
                {filterOptions.map((option) => {
                  const getTextColor = () => {
                    if (option.value === "paid") return "text-green-600";
                    if (option.value === "pending") return "text-red-600";
                    if (option.value === "partial") return "text-orange-500";
                    return "text-gray-700"; // all
                  };
 
                  const getDotColor = () => {
                    if (option.value === "paid") return "bg-green-600";
                    if (option.value === "pending") return "bg-red-600";
                    if (option.value === "partial") return "bg-orange-500";
                    return "bg-gray-400";
                  };
 
                  return (
                    <div
                      key={option.value}
                      className={`px-3 py-2 cursor-pointer hover:bg-gray-100 flex items-center gap-2 ${statusFilter === option.value
                          ? "bg-gray-100 font-semibold"
                          : ""
                        }`}
                      onClick={() => {
                        setStatusFilter(option.value);
                        setShowFilter(false);
                      }}
                    >
                      <span className={`h-2 w-2 rounded-full ${getDotColor()}`} />
                      <span className={`${getTextColor()}`}>
                        {option.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
 
      <div className="flex-1">
        <TableComponent
          columns={columns}
          tableData={processedData}
          height="69vh"
        />
      </div>
    </div>
  );
}
 
 