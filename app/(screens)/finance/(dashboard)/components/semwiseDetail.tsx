"use client";

import { useMemo, useState } from "react";
import CardComponent from "@/app/utils/card";
import {
  UsersThree,
  MagnifyingGlass,
  CurrencyInr,
  FunnelSimple,
  Faders,
} from "@phosphor-icons/react";
import TableComponent from "@/app/utils/table/table";

export default function SemwiseDetail({ semester }: { semester: string }) {
  const breadcrumb = `B-Tech → CSE - Year 1 - ${semester}`;
  const [sortKey, setSortKey] = useState<string>("studentName");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "pending">(
    "all",
  );
  const [search, setSearch] = useState("");
  const [showFilter, setShowFilter] = useState(false);

  const filterOptions: { label: string; value: "all" | "paid" | "pending" }[] =
    [
      { label: "All", value: "all" },
      { label: "Paid", value: "paid" },
      { label: "Pending", value: "pending" },
    ];

  const initialData = [
    {
      studentName: "Aarav Reddy",
      studentId: "CSE21A001",
      department: "CSE",
      totalFee: 85000,
      paidAmount: 85000,
      lastPaymentDate: "15 Jan 2026",
    },
    {
      studentName: "Priya Sharma",
      studentId: "CSE21A002",
      department: "CSE",
      totalFee: 85000,
      paidAmount: 60000,
      lastPaymentDate: "15 Jan 2026",
    },
    {
      studentName: "Rohit Kumar",
      studentId: "CSE21A003",
      department: "CSE",
      totalFee: 85000,
      paidAmount: 85000,
      lastPaymentDate: "15 Jan 2026",
    },
    {
      studentName: "Ananya Verma",
      studentId: "CSE21A004",
      department: "CSE",
      totalFee: 85000,
      paidAmount: 45000,
      lastPaymentDate: "15 Jan 2026",
    },
    {
      studentName: "Sai Teja",
      studentId: "CSE21A005",
      department: "CSE",
      totalFee: 85000,
      paidAmount: 85000,
      lastPaymentDate: "15 Jan 2026",
    },
    {
      studentName: "Kiran Rao",
      studentId: "CSE21A006",
      department: "CSE",
      totalFee: 85000,
      paidAmount: 50000,
      lastPaymentDate: "15 Jan 2026",
    },
    {
      studentName: "Megha Das",
      studentId: "CSE21A007",
      department: "CSE",
      totalFee: 85000,
      paidAmount: 85000,
      lastPaymentDate: "15 Jan 2026",
    },
    {
      studentName: "Rahul Singh",
      studentId: "CSE21A008",
      department: "CSE",
      totalFee: 85000,
      paidAmount: 30000,
      lastPaymentDate: "15 Jan 2026",
    },
    {
      studentName: "Divya Patel",
      studentId: "CSE21A009",
      department: "CSE",
      totalFee: 85000,
      paidAmount: 85000,
      lastPaymentDate: "15 Jan 2026",
    },
    {
      studentName: "Vikram Jain",
      studentId: "CSE21A010",
      department: "CSE",
      totalFee: 85000,
      paidAmount: 70000,
      lastPaymentDate: "15 Jan 2026",
    },
    {
      studentName: "Harsha Vardhan",
      studentId: "CSE21A011",
      department: "CSE",
      totalFee: 85000,
      paidAmount: 85000,
      lastPaymentDate: "15 Jan 2026",
    },
    {
      studentName: "Neha Kapoor",
      studentId: "CSE21A012",
      department: "CSE",
      totalFee: 85000,
      paidAmount: 40000,
      lastPaymentDate: "15 Jan 2026",
    },
    {
      studentName: "Manoj Kumar",
      studentId: "CSE21A013",
      department: "CSE",
      totalFee: 85000,
      paidAmount: 85000,
      lastPaymentDate: "15 Jan 2026",
    },
    {
      studentName: "Sneha Reddy",
      studentId: "CSE21A014",
      department: "CSE",
      totalFee: 85000,
      paidAmount: 65000,
      lastPaymentDate: "15 Jan 2026",
    },
    {
      studentName: "Arjun Nair",
      studentId: "CSE21A015",
      department: "CSE",
      totalFee: 85000,
      paidAmount: 85000,
      lastPaymentDate: "15 Jan 2026",
    },
  ];

  const columns = [
    { title: "Student Name", key: "studentName" },
    { title: "Student ID", key: "studentId" },
    { title: "Department", key: "department" },
    { title: "Total Fee (₹)", key: "totalFee" },
    { title: "Paid Amount (₹)", key: "paidAmount" },
    { title: "Balance (₹)", key: "balance" },
    { title: "Payment Status", key: "paymentStatus" },
    { title: "Last Payment Date", key: "lastPaymentDate" },
    { title: "Action", key: "action" },
  ];

  const processedData = useMemo(() => {
    let data = [...initialData];

    if (search) {
      data = data.filter(
        (item) =>
          item.studentName.toLowerCase().includes(search.toLowerCase()) ||
          item.studentId.toLowerCase().includes(search.toLowerCase()),
      );
    }

    if (statusFilter === "paid") {
      data = data.filter((item) => item.paidAmount === item.totalFee);
    }

    if (statusFilter === "pending") {
      data = data.filter((item) => item.paidAmount < item.totalFee);
    }

    data = data.map((item) => {
      const balance = item.totalFee - item.paidAmount;
      const isPaid = balance === 0;

      return {
        ...item,
        balance,

        paymentStatus: (
          <div className="flex items-center justify-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${
                isPaid ? "bg-green-600" : "bg-red-600"
              }`}
            />
            <span className={`${isPaid ? "text-green-600" : "text-red-600"}`}>
              {isPaid ? "Paid" : "Pending"}
            </span>
          </div>
        ),

        action: <span className="cursor-pointer">View</span>,
      };
    });

    data.sort((a: any, b: any) => {
      if (typeof a[sortKey] === "number") {
        return sortDirection === "asc"
          ? a[sortKey] - b[sortKey]
          : b[sortKey] - a[sortKey];
      }
      return sortDirection === "asc"
        ? String(a[sortKey]).localeCompare(String(b[sortKey]))
        : String(b[sortKey]).localeCompare(String(a[sortKey]));
    });

    return data;
  }, [search, statusFilter, sortKey, sortDirection]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <h2 className="text-lg font-semibold text-[#2E7D32] mb-3">
        {breadcrumb}
      </h2>
      <div className="bg-[#E2DAFF] rounded-lg p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 text-sm font-medium">
        <div>
          <p className="text-[#3E18CB] font-semibold text-md">2025-26</p>
          <p className="text-[#282828] text-sm">Academic Year</p>
        </div>
        <div>
          <p className="text-[#3E18CB] font-semibold text-md">620</p>
          <p className="text-[#282828] text-sm">Total Students</p>
        </div>
        <div>
          <p className="text-[#3E18CB] font-semibold text-md">₹24,00,000</p>
          <p className="text-[#282828] text-sm">Expected Amount</p>
        </div>
        <div>
          <p className="text-[#3E18CB] font-semibold text-md">₹21,75,300</p>
          <p className="text-[#282828] text-sm">Collected Amount</p>
        </div>
        <div>
          <p className="text-[#3E18CB] font-semibold text-md">₹2,24,700</p>
          <p className="text-[#282828] text-sm">Pending</p>
        </div>
      </div>

      <div className="flex gap-4 mt-6">
        <CardComponent
          style="bg-[#CEE6FF] h-[120px] w-[220px]"
          icon={<CurrencyInr size={28} weight="fill" color="#60AEFF" />}
          value="₹21,75,300"
          label="Collected"
        />
        <CardComponent
          style="bg-[#FFE2E2] h-[120px] w-[220px]"
          icon={<CurrencyInr size={28} weight="fill" color="#FF0000" />}
          value="₹2,24,700"
          label="Pending"
        />
        <CardComponent
          style="bg-[#E6FBEA] h-[120px] w-[220px]"
          icon={<UsersThree size={28} weight="fill" color="#43C17A" />}
          value="480"
          label="Paid Students"
        />
        <CardComponent
          style="bg-[#FFEDDA] h-[120px] w-[220px]"
          icon={<UsersThree size={28} weight="fill" color="#FFBB70" />}
          value="140"
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
            onClick={() => handleSort("studentName")}
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
                {filterOptions.map((option) => (
                  <div
                    key={option.value}
                    className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${
                      statusFilter === option.value
                        ? "bg-gray-100 font-medium"
                        : ""
                    }`}
                    onClick={() => {
                      setStatusFilter(option.value);
                      setShowFilter(false);
                    }}
                  >
                    {option.label}
                  </div>
                ))}
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
