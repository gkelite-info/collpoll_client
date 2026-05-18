"use client";

import CardComponent from "@/app/utils/card";
import { downloadCSV } from "@/app/utils/downloadCSV";
import TableComponent from "@/app/utils/table/table";
import {
  CaretDown,
  CaretLeft,
  DownloadSimple,
  MagnifyingGlass,
  UsersThree,
} from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const rupee = "\u20B9";

const overviewCards = [
  {
    label: "Total Students",
    value: "2,450",
    style: "bg-[#E2DAFF]",
    iconBgColor: "#FFFFFF",
    iconColor: "#714EF2",
  },
  {
    label: "Fully Paid Students",
    value: "2,000",
    style: "bg-[#E6FBEA]",
    iconBgColor: "#FFFFFF",
    iconColor: "#43C17A",
  },
  {
    label: "Partially Paid Students",
    value: "350",
    style: "bg-[#FFEDDA]",
    iconBgColor: "#FFFFFF",
    iconColor: "#FFB45F",
  },
  {
    label: "Pending Students",
    value: "100",
    style: "bg-[#FFE0E0]",
    iconBgColor: "#FFFFFF",
    iconColor: "#FF2525",
  },
];

const studentRows = [
  "Priya Sharma",
  "Rahul Mehta",
  "Neha Patel",
  "Priya Sharma",
  "Rahul Mehta",
  "Neha Patel",
  "Priya Sharma",
  "Rahul Mehta",
  "Neha Patel",
];

const columns = [
  { title: "Student Name", key: "studentName" },
  { title: "Roll No", key: "rollNo" },
  { title: "Education Type", key: "educationType" },
  { title: "Branch", key: "branch" },
  { title: "Year", key: "year" },
  { title: "Semester", key: "semester" },
  { title: "Paid", key: "paid" },
  { title: "Pending", key: "pending" },
  { title: "Status", key: "status" },
];

const tableData = studentRows.map((student) => ({
  studentName: <span className="font-semibold">{student}</span>,
  rollNo: "22CSE101",
  educationType: "B.Tech",
  branch: "CSE",
  year: "3rd",
  semester: "3rd",
  paid: `${rupee}1,40,000`,
  pending: `${rupee}0`,
  status: (
    <span className="inline-flex items-center gap-2">
      <span className="h-3 w-3 rounded-full bg-gradient-to-b from-[#66F35E] to-[#00A91A]" />
      Paid
    </span>
  ),
}));

function FilterPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex shrink-0 items-center gap-2 text-sm font-semibold text-[#282828]">
      <span>{label}</span>
      <button
        type="button"
        className="flex items-center gap-2 rounded-full bg-[#D9F4E4] px-4 py-1 text-sm font-semibold text-[#43C17A]"
      >
        {value}
        <CaretDown size={14} weight="bold" />
      </button>
    </div>
  );
}

export default function TotalStudentsOverviewView() {
  const router = useRouter();
  const [downloadLoading, setDownloadLoading] = useState(false);

  const handleDownload = () => {
    setDownloadLoading(true);

    const exportData = studentRows.map((student) => ({
      "Student Name": student,
      "Roll No": "22CSE101",
      "Education Type": "B.Tech",
      Branch: "CSE",
      Year: "3rd",
      Semester: "3rd",
      Paid: `${rupee}1,40,000`,
      Pending: `${rupee}0`,
      Status: "Paid",
    }));

    window.setTimeout(() => {
      downloadCSV(exportData, "overall-students-overview");
      setDownloadLoading(false);
    }, 300);
  };

  return (
    <div className="w-full p-2 pb-7 lg:pb-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Back to Finance Analytics"
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#282828] transition hover:bg-[#F0F0F0] cursor-pointer"
            onClick={() => router.push("/finance-manager")}
          >
            <CaretLeft size={24} weight="bold" />
          </button>
          <h1 className="text-lg font-semibold text-[#282828]">
            Overall Students Overview
          </h1>
        </div>

        <button
          type="button"
          onClick={handleDownload}
          disabled={downloadLoading}
          className={`flex items-center gap-2 rounded-md bg-[#16284F] px-4 py-2 text-sm font-semibold text-white transition-all ${
            downloadLoading
              ? "cursor-not-allowed opacity-70"
              : "cursor-pointer hover:bg-[#1E3A8A]"
          }`}
        >
          {downloadLoading ? "Downloading..." : "Download Report"}
          {!downloadLoading && <DownloadSimple size={18} />}
        </button>
      </div>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {overviewCards.map((card) => (
          <CardComponent
            key={card.label}
            style={`${card.style} w-full !h-[108px] py-3 [&>div:first-child]:!mb-2 [&>div:nth-of-type(2)]:!text-md [&>span]:!text-sm [&>span]:!leading-tight`}
            textSize="text-sm"
            icon={<UsersThree size={22} weight="fill" />}
            value={card.value}
            label={card.label}
            iconBgColor={card.iconBgColor}
            iconColor={card.iconColor}
          />
        ))}
      </section>

      <section className="custom-scrollbar mt-4 flex items-center gap-4 overflow-x-auto pb-2">
        <div className="flex w-full max-w-sm items-center rounded-full bg-[#EAEAEA] px-4 py-2">
          <input
            placeholder="Search by Student Name / Roll No."
            className="w-full bg-transparent text-sm text-[#282828] outline-none placeholder:text-[#525252]"
          />
          <MagnifyingGlass size={22} className="text-[#43C17A]" />
        </div>
        <div className="flex shrink-0 items-center gap-4">
          <FilterPill label="Educational Type" value="B-Tech" />
          <FilterPill label="Branch" value="CSE" />
          <FilterPill label="Year" value="1st" />
          <FilterPill label="Sem" value="2" />
          <FilterPill label="Status" value="Paid" />
        </div>
      </section>

      <h2 className="mt-4 text-md font-semibold text-[#282828]">
        Overall Students Overview
      </h2>

      <div className="custom-scrollbar mt-2 overflow-x-auto">
        <div className="min-w-[1050px]">
          <TableComponent columns={columns} tableData={tableData} height="55vh" />
        </div>
      </div>
    </div>
  );
}
