"use client";

import TableComponent from "@/app/utils/table/table";
import {
  CaretDown,
  CaretLeft,
  CaretRight,
  FunnelSimple,
  MagnifyingGlass,
} from "@phosphor-icons/react";
import { useRouter } from "next/navigation";

const rupee = "\u20B9";

const leftYearData = [
  { year: "4th yr", label: "4-1", collected: 11.8, pending: 2.0 },
  { year: "3rd yr", label: "3-1", collected: 10.0, pending: 1.8 },
  { year: "2nd yr", label: "2-1", collected: 13.8, pending: 0.2 },
  { year: "1st yr", label: "1-1", collected: 11.2, pending: 2.1 },
];

const rightYearData = [
  { year: "4th yr", label: "4-2", collected: 11.8, pending: 2.0 },
  { year: "3rd yr", label: "3-2", collected: 13.0, pending: 0.8 },
  { year: "2nd yr", label: "2-2", collected: 10.4, pending: 1.8 },
  { year: "1st yr", label: "1-2", collected: 12.0, pending: 1.0 },
];

const columns = [
  { title: "Student Name", key: "studentName" },
  { title: "Roll No.", key: "rollNo" },
  { title: "Branch", key: "branch" },
  { title: "Year", key: "year" },
  { title: "Semester", key: "semester" },
  { title: "Paid Amount", key: "paidAmount" },
  { title: "Pending Amount", key: "pendingAmount" },
  { title: "Status", key: "status" },
];

const studentRows = [
  "Priya Sharma",
  "Rahul Mehta",
  "Neha Patel",
  "Rahul Mehta",
  "Priya Sharma",
  "Neha Patel",
].map((student, index) => {
  const statuses = ["Partial", "Paid", "Pending", "Partial", "Paid", "Pending"];
  const status = statuses[index] || "Partial";
  const statusColor =
    status === "Paid"
      ? "from-[#66F35E] to-[#00A91A]"
      : status === "Pending"
        ? "from-[#FF6060] to-[#D90000]"
        : "from-[#FFE45C] to-[#FFC400]";

  return {
    studentName: <span className="font-semibold">{student}</span>,
    rollNo: index % 2 === 0 ? "22CSE101" : "22EEE099",
    branch: "CSE",
    year: "3rd Year",
    semester: "Sem 3",
    paidAmount: `${rupee} 30,0000`,
    pendingAmount: `${rupee} 30,0000`,
    status: (
      <span className="inline-flex items-center gap-2">
        <span className={`h-3 w-3 rounded-full bg-gradient-to-b ${statusColor}`} />
        {status}
      </span>
    ),
  };
});

function HorizontalTrendCard({
  data,
  color,
  lightColor,
}: {
  data: { year: string; label: string; collected: number; pending: number }[];
  color: string;
  lightColor: string;
}) {
  return (
    <section className="rounded-lg bg-white p-5 shadow-sm">
      <div className="space-y-5">
        {data.map((item) => {
          const total = item.collected + item.pending;
          const collectedWidth = `${(item.collected / 14) * 100}%`;
          const totalWidth = `${(total / 14) * 100}%`;

          return (
            <div
              key={`${item.year}-${item.label}`}
              className="grid grid-cols-[3.5rem_1fr_2.5rem] items-center gap-3"
            >
              <span className="text-sm text-[#282828]">{item.year}</span>
              <div className="relative h-8">
                <div
                  className="absolute inset-y-0 left-0 rounded-r-sm"
                  style={{ width: totalWidth, backgroundColor: lightColor }}
                />
                <div
                  className="absolute inset-y-0 left-0 rounded-r-sm"
                  style={{ width: collectedWidth, backgroundColor: color }}
                />
              </div>
              <span className="text-sm text-[#282828]">{item.label}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-5 grid grid-cols-5 pl-14 text-xs text-[#525252]">
        <span>2.0L</span>
        <span>4.0L</span>
        <span>6.0L</span>
        <span>9.0L</span>
        <span>1.4Cr</span>
      </div>
    </section>
  );
}

function SemesterPill() {
  return (
    <button
      type="button"
      className="flex items-center gap-2 rounded-full bg-[#D9F4E4] px-4 py-2 text-sm font-semibold text-[#43C17A]"
    >
      Semester 1
      <CaretDown size={14} weight="bold" />
    </button>
  );
}

export default function YearWiseFeeCollectionView({
  branch,
  backHref = "?view=branch-wise",
}: {
  branch: string;
  backHref?: string;
}) {
  const router = useRouter();
  const branchTitle = branch || "CSE";

  return (
    <div className="min-h-screen w-full bg-[#F4F4F4] p-2 pb-7 lg:pb-5">
      <div className="mb-3 flex items-center gap-2">
        <button
          type="button"
          aria-label="Back to Branch Wise Collection"
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-[#282828] transition hover:bg-[#F0F0F0]"
          onClick={() => router.push(backHref)}
        >
          <CaretLeft size={24} weight="bold" />
        </button>
        <h1 className="text-xl font-semibold text-[#282828]">{branchTitle}</h1>
        <CaretRight size={18} className="text-[#8A8A8A]" />
        <span className="text-sm text-[#525252]">Year-wise Fee Collection</span>
      </div>

      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-md font-semibold text-[#282828]">
          Fee Collection Trends
        </h2>
        <div className="flex items-center gap-5 text-sm text-[#525252]">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#282828]">Academic Year</span>
            <button
              type="button"
              className="flex items-center gap-1 rounded-full bg-[#E9D8FF] px-3 py-1 font-semibold text-[#714EF2]"
            >
              2026 <CaretDown size={14} weight="bold" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm bg-[#43C17A]" />
            <span>Collected</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm bg-[#CFF3DD]" />
            <span>Pending</span>
          </div>
        </div>
      </div>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <HorizontalTrendCard
          data={leftYearData}
          color="#43C17A"
          lightColor="#CFF3DD"
        />
        <HorizontalTrendCard
          data={rightYearData}
          color="#7654E8"
          lightColor="#E3DAFF"
        />
      </section>

      <section className="mt-5">
        <h2 className="mb-3 text-lg font-semibold text-[#282828]">
          Students Overview
        </h2>

        <div className="custom-scrollbar mb-3 flex items-center justify-between gap-4 overflow-x-auto pb-2">
          <div className="flex w-full max-w-md shrink-0 items-center rounded-full bg-[#EAEAEA] px-4 py-2">
            <input
              placeholder="Search by Student Name / Roll No."
              className="w-full bg-transparent text-sm text-[#282828] outline-none placeholder:text-[#525252]"
            />
            <MagnifyingGlass size={22} className="text-[#43C17A]" />
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <SemesterPill />
            <button
              type="button"
              aria-label="Filter students"
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-[#D9F4E4] text-[#43C17A]"
            >
              <FunnelSimple size={22} weight="bold" />
            </button>
          </div>
        </div>

        <div className="custom-scrollbar overflow-x-auto">
          <div className="min-w-[1180px]">
            <TableComponent
              columns={columns}
              tableData={studentRows}
              height="38vh"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
