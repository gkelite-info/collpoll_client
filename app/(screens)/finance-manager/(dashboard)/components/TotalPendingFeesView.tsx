"use client";

import CardComponent from "@/app/utils/card";
import TableComponent from "@/app/utils/table/table";
import {
  CaretDown,
  CaretLeft,
  CurrencyInr,
  MagnifyingGlass,
  UsersThree,
} from "@phosphor-icons/react";
import { useRouter } from "next/navigation";

const rupee = "\u20B9";

const pendingMetricCards = [
  {
    label: "Fully Paid Students",
    value: "2,130",
    style: "bg-[#E6FBEA]",
    iconBgColor: "#FFFFFF",
    iconColor: "#43C17A",
    icon: <UsersThree size={20} weight="fill" />,
  },
  {
    label: "Total Pending Amount",
    value: `${rupee} 2.1 CR`,
    style: "bg-[#FFEDDA]",
    iconBgColor: "#FFFFFF",
    iconColor: "#FFB45F",
    icon: <CurrencyInr size={20} weight="bold" />,
  },
  {
    label: "Students With Pending Fees",
    value: "6,820",
    style: "bg-[#E2DAFF]",
    iconBgColor: "#FFFFFF",
    iconColor: "#714EF2",
    icon: <UsersThree size={20} weight="fill" />,
  },
  {
    label: "High Pending Students",
    value: "5",
    style: "bg-[#FFE0E0]",
    iconBgColor: "#FFFFFF",
    iconColor: "#FF2525",
    icon: <UsersThree size={20} weight="fill" />,
  },
];

const yearBreakdown = [
  { label: "1st Year", value: "18.2 L", width: "w-[88%]" },
  { label: "2nd Year", value: "20.4 L", width: "w-[72%]" },
  { label: "3rd Year", value: "16.8 L", width: "w-[84%]" },
  { label: "4th Year", value: "14.6 L", width: "w-[60%]" },
];

const semesterBreakdown = [
  { label: "Sem 1", value: "18.2 L", width: "w-[88%]" },
  { label: "Sem 2", value: "20.4 L", width: "w-[72%]" },
];

const pendingStudents = [
  "Rahul Sharma",
  "Priya Verma",
  "Ankit Joshi",
  "Sneha Reddy",
  "Rahul Sharma",
  "Priya Verma",
  "Ankit Joshi",
  "Sneha Reddy",
  "Rahul Sharma",
  "Priya Verma",
  "Ankit Joshi",
  "Sneha Reddy",
  "Rahul Sharma",
  "Priya Verma",
];

const pendingTableColumns = [
  { title: "Student Name", key: "studentName" },
  { title: "Student ID", key: "studentId" },
  { title: "Year", key: "year" },
  { title: "Semester", key: "semester" },
  { title: "Total Fee", key: "totalFee" },
  { title: "Paid", key: "paid" },
  { title: "Pending", key: "pending" },
  { title: "Action", key: "actions" },
];

const pendingTableData = pendingStudents.map((student) => ({
  studentName: <span className="font-semibold">{student}</span>,
  studentId: "CSE23A045",
  year: "2nd Year",
  semester: "4th sem",
  totalFee: `${rupee} 80,000`,
  paid: `${rupee} 40,000`,
  pending: `${rupee} 40,000`,
  actions: (
    <button
      type="button"
      className="rounded-md bg-[#16284F] px-4 py-1 text-sm font-semibold text-white"
    >
      Send Reminder
    </button>
  ),
}));

function SelectPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-[#282828]">
      <span>{label} :</span>
      <button
        type="button"
        className="flex items-center gap-1 rounded-full bg-[#43C17A] px-3 py-1 text-xs font-semibold text-white"
      >
        {value}
        <CaretDown size={12} weight="bold" />
      </button>
    </div>
  );
}

function BreakdownCard({
  title,
  rows,
}: {
  title: string;
  rows: { label: string; value: string; width: string }[];
}) {
  return (
    <section className="rounded-lg bg-white p-4 shadow-sm">
      <h3 className="mb-4 text-md font-semibold text-[#282828]">{title}</h3>
      <div className="space-y-3">
        {rows.map((row) => (
          <div
            key={row.label}
            className="grid grid-cols-[4.5rem_1fr_4rem] items-center gap-3"
          >
            <span className="text-xs text-[#525252]">{row.label}</span>
            <div className="h-4 rounded-sm bg-[#E8F8EF]">
              <div
                className={`${row.width} h-full rounded-sm bg-gradient-to-r from-[#43C17A] to-[#205B3A]`}
              />
            </div>
            <span className="text-xs font-semibold text-[#43C17A]">
              {rupee} {row.value}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function TotalPendingFeesView() {
  const router = useRouter();

  return (
    <div className="w-full p-2 pb-7 lg:pb-5">
      <div className="mb-3 flex items-center gap-3">
        <button
          type="button"
          aria-label="Back to Finance Analytics"
          className="flex h-8 w-8 items-center justify-center rounded-full text-[#282828] transition hover:bg-[#F0F0F0] cursor-pointer"
          onClick={() => router.push("/finance-manager")}
        >
          <CaretLeft size={24} weight="bold" />
        </button>
        <h1 className="text-lg font-semibold text-[#282828]">
          Pending Fee Overview - CSE (B.Tech)
        </h1>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-4">
        <SelectPill label="Academic Year" value="2026" />
        <SelectPill label="Educational Type" value="B.Tech" />
        <SelectPill label="Branch" value="CSE" />
        <SelectPill label="Year" value="2nd Yr" />
      </div>

      <section className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {pendingMetricCards.map((card) => (
          <CardComponent
            key={card.label}
            style={`${card.style} w-full !h-[122px] !justify-start gap-1 py-3 [&>div:first-child]:!mb-2 [&>div:nth-of-type(2)]:!text-md [&>span]:!text-sm [&>span]:!leading-tight [&>span]:break-words`}
            textSize="text-sm"
            icon={card.icon}
            value={card.value}
            label={card.label}
            iconBgColor={card.iconBgColor}
            iconColor={card.iconColor}
          />
        ))}
      </section>

      <div className="mt-3 grid grid-cols-1 gap-2 lg:grid-cols-2">
        <BreakdownCard title="Pending Breakdown by Year" rows={yearBreakdown} />
        <BreakdownCard title="Pending Fee Semester" rows={semesterBreakdown} />
      </div>

      <div className="mt-3 flex max-w-md items-center justify-between rounded-full bg-white px-5 py-3 shadow-sm">
        <span className="text-sm text-[#282828]">
          Search by Student Name, Branch
        </span>
        <MagnifyingGlass size={22} className="text-[#43C17A]" />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-5 text-sm text-[#282828]">
        <span>
          Total Fee :{" "}
          <strong className="rounded-full bg-[#D9F4E4] px-3 py-1 text-[#43C17A]">
            {rupee} 1,11,00,000
          </strong>
        </span>
        <span>
          Paid:{" "}
          <strong className="rounded-full bg-[#D9F4E4] px-3 py-1 text-[#43C17A]">
            25,60,000
          </strong>
        </span>
        <span>
          Pending:{" "}
          <strong className="rounded-full bg-[#FFE0E0] px-3 py-1 text-[#FF2525]">
            92,40,000
          </strong>
        </span>
      </div>

      <div className="custom-scrollbar mt-3 overflow-x-auto">
        <div className="min-w-[980px]">
          <TableComponent
            columns={pendingTableColumns}
            tableData={pendingTableData}
            height="calc(100vh - 24rem)"
          />
        </div>
      </div>
    </div>
  );
}
