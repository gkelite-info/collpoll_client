"use client";

import TableComponent from "@/app/utils/table/table";
import { CaretLeft } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import MonthlyFeeCollectionChart from "./MonthlyFeeCollectionChart";

const rupee = "\u20B9";

const paymentModeBreakdown = [
  { feeType: "Online Payment", amountCollected: `${rupee} 80 L` },
  { feeType: "UPI", amountCollected: `${rupee} 80 L` },
  { feeType: "Bank Transfer", amountCollected: `${rupee} 80 L` },
];

const transactionColumns = [
  { title: "Student Name", key: "studentName" },
  { title: "Student ID", key: "studentId" },
  { title: "Year", key: "year" },
  { title: "Semester", key: "semester" },
  { title: "Amount Paid", key: "amountPaid" },
  { title: "Payment Mode", key: "paymentMode" },
  { title: "Transaction Date", key: "transactionDate" },
];

const transactionRows = [
  ["Rahul Sharma", "UPI"],
  ["Priya Verma", "Online"],
  ["Ankit Joshi", "Bank Transfer"],
  ["Sneha Reddy", "UPI"],
  ["Rahul Sharma", "Online"],
  ["Priya Verma", "Bank Transfer"],
].map(([studentName, paymentMode]) => ({
  studentName: <span className="font-semibold">{studentName}</span>,
  studentId: "CSE23A045",
  year: "2nd Year",
  semester: "4th sem",
  amountPaid: `${rupee}45,000`,
  paymentMode,
  transactionDate: "11/03/2026",
}));

export default function MonthlyFeeCollectionView() {
  const router = useRouter();

  return (
    <div className="min-h-screen w-full bg-[#F4F4F4] p-2 pb-7 lg:pb-5">
      <div className="mb-4 flex items-center gap-3">
        <button
          type="button"
          aria-label="Back to Finance Manager Dashboard"
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-[#282828] transition hover:bg-[#F0F0F0]"
          onClick={() => router.push("/finance-manager")}
        >
          <CaretLeft size={24} weight="bold" />
        </button>
        <h1 className="text-xl font-semibold text-[#282828]">
          Monthly Fee Collection
        </h1>
      </div>

      <section className="rounded-lg bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-md font-semibold text-[#282828]">
            Fee Collection Trends
          </h2>
        </div>

        <div className="custom-scrollbar overflow-x-auto overflow-y-hidden pb-2">
          <div className="h-72 min-w-[125%]">
            <MonthlyFeeCollectionChart />
          </div>
        </div>

      </section>

      <section className="mt-4 w-full max-w-lg rounded-lg bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold text-[#282828]">
          Payment Mode Breakdown
        </h2>
        <div className="grid grid-cols-2 gap-y-2 text-sm text-[#282828]">
          <span className="text-[#525252]">Fee Type</span>
          <span className="text-[#525252]">Amount Collected</span>
          {paymentModeBreakdown.map((item) => (
            <div key={item.feeType} className="contents">
              <span>{item.feeType}</span>
              <span className="font-semibold text-[#43C17A]">
                {item.amountCollected}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-5">
        <h2 className="mb-3 text-lg font-semibold text-[#282828]">
          Recent Transactions
        </h2>
        <div className="custom-scrollbar overflow-x-auto">
          <div className="min-w-[1180px]">
            <TableComponent
              columns={transactionColumns}
              tableData={transactionRows}
              height="42vh"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
