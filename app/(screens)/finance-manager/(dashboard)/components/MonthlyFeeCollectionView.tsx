"use client";

import TableComponent from "@/app/utils/table/table";
import { useFinanceManager } from "@/app/utils/context/financeManager/useFinanceManager";
import {
  fetchMonthlyFeeCollectionDetails,
  type MonthlyPaymentModeBreakdownRow,
  type MonthlyRecentTransactionRow,
} from "@/lib/helpers/finance-manager/dashboard/FetchMonthlyFeeCollection";
import { CaretLeft } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import MonthlyFeeCollectionChart from "./MonthlyFeeCollectionChart";

const rupee = "\u20B9";

const transactionColumns = [
  { title: "Student Name", key: "studentName" },
  { title: "Student ID", key: "studentId" },
  { title: "Year", key: "year" },
  { title: "Semester", key: "semester" },
  { title: "Amount Paid", key: "amountPaid" },
  { title: "Payment Mode", key: "paymentMode" },
  { title: "Transaction Date", key: "transactionDate" },
];

const formatCurrency = (value: number) =>
  `${rupee}${Math.round(value).toLocaleString("en-IN")}`;

const buildTransactionRows = (rows: MonthlyRecentTransactionRow[]) =>
  rows.map((row) => ({
    studentName: <span className="font-semibold">{row.studentName}</span>,
    studentId: row.studentId,
    year: row.year,
    semester: row.semester,
    amountPaid: formatCurrency(row.amountPaid),
    paymentMode: row.paymentMode,
    transactionDate: row.transactionDate,
  }));

export default function MonthlyFeeCollectionView() {
  const router = useRouter();
  const { collegeId, collegeEducationId, loading: contextLoading } =
    useFinanceManager();
  const [paymentModeBreakdown, setPaymentModeBreakdown] = useState<
    MonthlyPaymentModeBreakdownRow[]
  >([]);
  const [recentTransactions, setRecentTransactions] = useState<
    MonthlyRecentTransactionRow[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadDetails() {
      if (contextLoading || !collegeId || !collegeEducationId) return;

      setLoading(true);
      try {
        const result = await fetchMonthlyFeeCollectionDetails(
          collegeId,
          collegeEducationId,
        );
        if (!isMounted) return;
        setPaymentModeBreakdown(result.paymentModeBreakdown);
        setRecentTransactions(result.recentTransactions);
      } catch {
        if (!isMounted) return;
        setPaymentModeBreakdown([]);
        setRecentTransactions([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadDetails();

    return () => {
      isMounted = false;
    };
  }, [collegeEducationId, collegeId, contextLoading]);

  const isLoading = contextLoading || loading;

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
          {isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="contents">
                <span className="h-4 w-28 animate-pulse rounded bg-[#F2F2F2]" />
                <span className="h-4 w-20 animate-pulse rounded bg-[#F2F2F2]" />
              </div>
            ))
          ) : paymentModeBreakdown.length === 0 ? (
            <span className="col-span-2 py-3 text-sm text-[#525252]">
              No payment mode data available
            </span>
          ) : (
            paymentModeBreakdown.map((item) => (
              <div key={item.feeType} className="contents">
                <span>{item.feeType}</span>
                <span className="font-semibold text-[#43C17A]">
                  {formatCurrency(item.amountCollected)}
                </span>
              </div>
            ))
          )}
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
              tableData={buildTransactionRows(recentTransactions)}
              height="42vh"
              isLoading={isLoading}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
