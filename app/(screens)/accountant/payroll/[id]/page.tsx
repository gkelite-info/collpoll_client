"use client";

import Link from "next/link";
import { use } from "react";
import { useEffect, useState } from "react";

import { useUser } from "@/app/utils/context/UserContext";
import {
  fetchEmployeeMonthlyAttendance,
  fetchAccountantPayrollQueue,
  type AccountantPayrollQueueEmployee,
  type EmployeeAttendanceDay,
} from "@/lib/helpers/accountant/employeeSalaryPaymentsAPI";
import PayrollDetailScreen from "../components/PayrollDetailScreen";
import PayrollDetailShimmer from "../components/PayrollDetailShimmer";
import type { StaticPayrollEmployee } from "../data";

const methodLabels: Record<string, string> = {
  banktransfer: "Bank Transfer",
  neft: "NEFT",
  rtgs: "RTGS",
  imps: "IMPS",
  upi: "UPI",
  cheque: "Cheque",
  cash: "Cash",
};

function toDetailEmployee(employee: AccountantPayrollQueueEmployee): StaticPayrollEmployee {
  const payment = employee.payment;
  const reference = payment
    ? payment.transactionId
      || payment.neftUtrNumber
      || payment.rtgsUtrNumber
      || payment.impsReferenceNumber
      || payment.upiTransactionId
      || payment.chequeNo
      || payment.receiptNumber
      || ""
    : "";

  return {
    ...employee,
    status: employee.paymentStatus === "paid" ? "paid" : "ready",
    bank: employee.bank ?? {
      bankName: "-",
      accountNumber: "-",
      ifscCode: "-",
      accountHolderName: employee.name,
      branch: "-",
    },
    payment: {
      paymentMethod: payment ? methodLabels[payment.paymentMethod] ?? payment.paymentMethod : "Bank Transfer",
      transactionId: reference,
      paymentDate: payment?.paymentDate ?? "",
      remarks: payment?.remarks ?? "",
      upiId: payment?.upiId ?? "",
      bankName: payment?.bankName ?? "",
      chequeDate: payment?.chequeDate ?? "",
      recordedByRole: payment?.creator?.fullName?.trim()
        || payment?.creator?.role?.trim()
        || "Accountant",
      createdAt: payment?.createdAt ?? "",
    },
  };
}

export default function AccountantPayrollDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { collegeId } = useUser();
  const [employee, setEmployee] = useState<StaticPayrollEmployee | null>(null);
  const [attendance, setAttendance] = useState<EmployeeAttendanceDay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function loadEmployee() {
      if (!collegeId) {
        if (isMounted) {
          setError("College details are not available.");
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);
      setError("");
      try {
        const result = await fetchAccountantPayrollQueue(
          Number(collegeId),
          undefined,
          undefined,
          { entryId: Number(id), limit: 1 },
        );
        const match = result.employees.find((item) => item.payrollEntryId === Number(id));
        if (!isMounted) return;
        if (!match) {
          setError("This payroll entry was not found in an active finalized payroll run.");
        } else {
          const attendanceRows = await fetchEmployeeMonthlyAttendance(match.userId, match.payrollMonth, match.payrollYear);
          if (!isMounted) return;
          setEmployee({
            ...toDetailEmployee(match),
            payrollCreatedAt: result.run?.createdAt,
            payrollProcessedAt: result.run?.createdAt,
            payrollFinalizedAt: result.run?.processedAt ?? undefined,
            payrollProcessedBy: result.run?.processor?.fullName?.trim()
              || result.run?.processor?.role?.trim()
              || "HR Manager",
            payrollRunStatus: result.run?.status,
          });
          setAttendance(attendanceRows);
        }
      } catch (loadError) {
        if (isMounted) setError(loadError instanceof Error ? loadError.message : "Unable to load payroll details.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadEmployee();
    return () => { isMounted = false; };
  }, [collegeId, id, refreshKey]);

  if (isLoading) return <PayrollDetailShimmer />;
  if (error || !employee) return <div className="m-5 rounded-xl border border-red-200 bg-white p-8 text-center"><p className="font-semibold text-red-700">{error || "Payroll entry not found."}</p><Link href="/accountant/payroll" className="mt-4 inline-flex rounded-lg bg-[#1769e0] px-4 py-2 text-sm font-semibold text-white">Back to payroll</Link></div>;
  return <PayrollDetailScreen
    key={`${employee.payrollEntryId}-${refreshKey}`}
    employee={employee}
    attendance={attendance}
    onPaymentRecorded={() => setRefreshKey((key) => key + 1)}
  />;
}
