"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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

const initialData = [
  {
    studentName: "Priya Sharma",
    rollNo: "22CSE101",
    educationType: "B.Tech",
    branch: "CSE",
    year: "3rd Year",
    semester: "Sem 5",
    paid: 214000,
    pending: 0,
  },
  {
    studentName: "Rahul Mehta",
    rollNo: "22EEE099",
    educationType: "B.Tech",
    branch: "EEE",
    year: "3rd Year",
    semester: "Sem 5",
    paid: 214000,
    pending: 30000,
  },
  {
    studentName: "Neha Patel",
    rollNo: "22MECH051",
    educationType: "B.Tech",
    branch: "MECH",
    year: "2nd Year",
    semester: "Sem 4",
    paid: 0,
    pending: 55000,
  },
  {
    studentName: "Arjun Kumar",
    rollNo: "23CSE045",
    educationType: "B.Tech",
    branch: "CSE",
    year: "2nd Year",
    semester: "Sem 3",
    paid: 50000,
    pending: 0,
  },
  {
    studentName: "Sneha Reddy",
    rollNo: "21ECE078",
    educationType: "B.Tech",
    branch: "ECE",
    year: "4th Year",
    semester: "Sem 7",
    paid: 30000,
    pending: 35000,
  },
  {
    studentName: "Vikram Singh",
    rollNo: "22CIVIL032",
    educationType: "B.Tech",
    branch: "CIVIL",
    year: "3rd Year",
    semester: "Sem 5",
    paid: 58000,
    pending: 0,
  },
  {
    studentName: "Anjali Verma",
    rollNo: "23EEE012",
    educationType: "B.Tech",
    branch: "EEE",
    year: "2nd Year",
    semester: "Sem 4",
    paid: 25000,
    pending: 30000,
  },
  {
    studentName: "Karthik Nair",
    rollNo: "21CSE089",
    educationType: "B.Tech",
    branch: "CSE",
    year: "4th Year",
    semester: "Sem 8",
    paid: 70000,
    pending: 0,
  },
  {
    studentName: "Deepika Rao",
    rollNo: "22ECE056",
    educationType: "B.Tech",
    branch: "ECE",
    year: "3rd Year",
    semester: "Sem 6",
    paid: 0,
    pending: 60000,
  },
  {
    studentName: "Aditya Joshi",
    rollNo: "23MECH021",
    educationType: "B.Tech",
    branch: "MECH",
    year: "2nd Year",
    semester: "Sem 3",
    paid: 52000,
    pending: 0,
  },
];

const cardsData = [
  {
    style: "bg-[#E2DAFF]",
    icon: <UsersThree size={24} color="#6C20CA" weight="fill" />,
    value: "2,450",
    label: "Total Students",
  },
  {
    style: "bg-[#E6FBEA]",
    icon: <UsersThree size={24} color="#43C17A" weight="fill" />,
    value: "2,000",
    label: "Fully Paid Students",
  },
  {
    style: "bg-[#FFEDDA]",
    icon: <UsersThree size={24} color="#FFBB70" weight="fill" />,
    value: "350",
    label: "Partially Paid Students",
  },
  {
    style: "bg-[#FFE2E2]",
    icon: <UsersThree size={24} color="#FF0000" weight="fill" />,
    value: "100",
    label: "Pending Students",
  },
  {
    style: "bg-[#CEE6FF]",
    icon: <BuildingApartmentIcon size={24} color="#60AEFF" weight="fill" />,
    value: "04",
    label: "Departments Covered",
  },
];

export default function OverallStudentsOverview() {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [educationFilter, setEducationFilter] = useState("All");
  const [branchFilter, setBranchFilter] = useState("All");
  const [yearFilter, setYearFilter] = useState("All");
  const [semesterFilter, setSemesterFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const branchOptions = ["All", "CSE", "ECE", "EEE", "MECH", "CIVIL"];
  const yearOptions = ["All", "1st Year", "2nd Year", "3rd Year", "4th Year"];
  const semesterOptions = [
    "All",
    "Sem 1",
    "Sem 2",
    "Sem 3",
    "Sem 4",
    "Sem 5",
    "Sem 6",
    "Sem 7",
    "Sem 8",
  ];
  const statusOptions = ["All", "Paid", "Pending", "Partial"];

  const filteredData = useMemo(() => {
    return initialData
      .filter(
        (item) =>
          item.studentName.toLowerCase().includes(search.toLowerCase()) ||
          item.rollNo.toLowerCase().includes(search.toLowerCase()),
      )
      .filter(
        (item) =>
          (educationFilter === "All" ||
            item.educationType === educationFilter) &&
          (branchFilter === "All" || item.branch === branchFilter) &&
          (yearFilter === "All" || item.year === yearFilter) &&
          (semesterFilter === "All" || item.semester === semesterFilter),
      )
      .filter((item) => {
        if (statusFilter === "All") return true;
        if (statusFilter === "Paid") return item.pending === 0;
        if (statusFilter === "Pending")
          return item.pending > 0 && item.paid === 0;
        if (statusFilter === "Partial")
          return item.pending > 0 && item.paid > 0;
        return true;
      })
      .map((item) => ({
        ...item,
        paid: `₹ ${item.paid.toLocaleString("en-IN")}`,
        pending: `₹ ${item.pending.toLocaleString("en-IN")}`,
        status: (() => {
          let statusType: "Paid" | "Pending" | "Partial" = "Paid";

          if (item.pending === 0) statusType = "Paid";
          else if (item.paid === 0) statusType = "Pending";
          else statusType = "Partial";

          return (
            <div className="flex items-center justify-center gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  statusType === "Paid"
                    ? "bg-green-500"
                    : statusType === "Pending"
                      ? "bg-red-500"
                      : "bg-orange-500"
                }`}
              />
              <span
                className={`text-sm font-medium ${
                  statusType === "Paid"
                    ? "text-green-600"
                    : statusType === "Pending"
                      ? "text-red-600"
                      : "text-orange-600"
                }`}
              >
                {statusType === "Paid"
                  ? "Paid"
                  : statusType === "Pending"
                    ? "Pending"
                    : "Partial"}
              </span>
            </div>
          );
        })(),

        action: (
          <span
            onClick={() =>
              router.push(`/finance/finance-analytics/students/${item.branch}`)
            }
            className="text-[#22A55D] cursor-pointer hover:underline text-sm font-medium"
          >
            View
          </span>
        ),
      }));
  }, [
    search,
    educationFilter,
    branchFilter,
    yearFilter,
    semesterFilter,
    statusFilter,
  ]);

  const handleDownload = () => {
    downloadCSV(initialData, "students-report");
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

  return (
    <div className="p-2 min-h-screen space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1">
          <CaretLeftIcon
            size={20}
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

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
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
            className="bg-transparent outline-none text-sm w-full"
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
                value="B-Tech"
                disabled
                onChange={(e) => setBranchFilter(e.target.value)}
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
                  onChange={(e) => setBranchFilter(e.target.value)}
                  className="appearance-none bg-[#43C17A26] text-center text-[#43C17A] outline-none px-6 py-1 pr-8 rounded-full text-sm cursor-pointer"
                >
                  {branchOptions.map((o) => (
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

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#282828] font-semibold">
                  Year
                </span>
                <div className="relative">
                  <select
                    value={yearFilter}
                    onChange={(e) => setYearFilter(e.target.value)}
                    className="appearance-none bg-[#43C17A26] text-center text-[#43C17A] outline-none px-6 py-1 pr-8 rounded-full text-sm cursor-pointer"
                  >
                    {yearOptions.map((o) => (
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

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#282828] font-semibold">
                  Sem
                </span>
                <div className="relative">
                  <select
                    value={semesterFilter}
                    onChange={(e) => setSemesterFilter(e.target.value)}
                    className="appearance-none bg-[#43C17A26] text-center text-[#43C17A] outline-none px-6 py-1 pr-8 rounded-full text-sm cursor-pointer"
                  >
                    {semesterOptions.map((o) => (
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
        tableData={filteredData}
        height="55vh"
      />
    </div>
  );
}
