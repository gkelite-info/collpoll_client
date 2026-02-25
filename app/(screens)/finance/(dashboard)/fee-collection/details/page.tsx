"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  CurrencyDollarSimpleIcon,
  UsersThreeIcon,
  MagnifyingGlass,
  CaretDown,
  CaretLeftIcon,
} from "@phosphor-icons/react";
import CardComponent from "@/app/utils/card";
import TableComponent from "@/app/utils/table/table";
import { Suspense } from "react";
import { Loader } from "@/app/(screens)/(student)/calendar/right/timetable";

function FeeCollectionDetailsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const year = searchParams.get("year") || "1st Year";
  const columns = [
    { title: "Student Name", key: "name" },
    { title: "Student ID", key: "id" },
    { title: "Department", key: "dept" },
    { title: "Total Fee (₹)", key: "total" },
    { title: "Paid Amount (₹)", key: "paid" },
    { title: "Balance (₹)", key: "balance" },
    { title: "Payment Status", key: "status" },
  ];

  const tableData = [
    {
      name: "Aarav Reddy",
      id: "CSE21A045",
      dept: "CSE",
      total: "85,000",
      paid: "85,000",
      balance: "0",
      status: (
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-600"></span>
          <span className="text-green-600 font-medium">Paid</span>
        </div>
      ),

    },
    {
      name: "Priya Sharma",
      id: "CSE21A046",
      dept: "CSE",
      total: "85,000",
      paid: "50,000",
      balance: "35,000",
      status: (
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500"></span>
          <span className="text-red-500 font-medium">Pending</span>
        </div>
      ),
    },
    {
      name: "Aarav Reddy",
      id: "CSE21A045",
      dept: "CSE",
      total: "85,000",
      paid: "85,000",
      balance: "0",
      status: (
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-600"></span>
          <span className="text-green-600 font-medium">Paid</span>
        </div>
      ),

    },
    {
      name: "Priya Sharma",
      id: "CSE21A046",
      dept: "CSE",
      total: "85,000",
      paid: "50,000",
      balance: "35,000",
      status: (
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500"></span>
          <span className="text-red-500 font-medium">Pending</span>
        </div>
      ),
    },
    {
      name: "Aarav Reddy",
      id: "CSE21A045",
      dept: "CSE",
      total: "85,000",
      paid: "85,000",
      balance: "0",
      status: (
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-600"></span>
          <span className="text-green-600 font-medium">Paid</span>
        </div>
      ),

    },
    {
      name: "Priya Sharma",
      id: "CSE21A046",
      dept: "CSE",
      total: "85,000",
      paid: "50,000",
      balance: "35,000",
      status: (
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500"></span>
          <span className="text-red-500 font-medium">Pending</span>
        </div>
      ),
    },
    {
      name: "Aarav Reddy",
      id: "CSE21A045",
      dept: "CSE",
      total: "85,000",
      paid: "85,000",
      balance: "0",
      status: (
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-600"></span>
          <span className="text-green-600 font-medium">Paid</span>
        </div>
      ),

    },
    {
      name: "Priya Sharma",
      id: "CSE21A046",
      dept: "CSE",
      total: "85,000",
      paid: "50,000",
      balance: "35,000",
      status: (
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500"></span>
          <span className="text-red-500 font-medium">Pending</span>
        </div>
      ),
    },
  ];

  return (
    <div className="p-2 bg-[#F3F4F6] min-h-screen">
      <div className="flex items-center gap-2 mb-6">
        <CaretLeftIcon size={20} weight="bold" className="text-black cursor-pointer active:scale-90" onClick={router.back} />
        <h1 className="text-xl font-semibold text-[#282828]">
          {year} Fee Collection Details
        </h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-4">
        <CardComponent
          icon={<UsersThreeIcon size={22} weight="fill" />}
          value="320"
          label="Total Students"
          iconBgColor="#FFFFFF"
          iconColor="#6D28D9"
          style="bg-[#F3E8FF]"
        />
        <CardComponent
          icon={<CurrencyDollarSimpleIcon size={22} weight="fill" />}
          value="24.2 L"
          label="Total Expected"
          iconBgColor="#FFFFFF"
          iconColor="#2563EB"
          style="bg-[#EFF6FF]"
        />
        <CardComponent
          icon={<CurrencyDollarSimpleIcon size={22} weight="fill" />}
          value="23.6 L"
          label="Total Collected"
          iconBgColor="#FFFFFF"
          iconColor="#16A34A"
          style="bg-[#ECFDF5]"
        />
        <CardComponent
          icon={<CurrencyDollarSimpleIcon size={22} weight="fill" />}
          value="0.6 L"
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
          />
          <MagnifyingGlass size={20} className="text-[#43C17A]" />
        </div>
        <div className="flex items-center gap-6 text-sm text-[#374151]">
          <FilterPill title="Branch" value="CSE" />
          <FilterPill title="Year" value="1st" />
          <FilterPill title="Status" value="All" showCaret />
        </div>
      </div>
      <TableComponent
        columns={columns}
        tableData={tableData}
        height="60vh"
      />
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