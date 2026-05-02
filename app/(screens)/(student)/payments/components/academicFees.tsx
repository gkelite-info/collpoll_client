"use client";

import { useMemo } from "react";
import {
  CheckCircle,
  Clock,
  WarningCircle,
  Receipt,
  FilePdfIcon,
} from "@phosphor-icons/react";
import { generateSemesterReceipt } from "./generateReceipt";
import { useTranslations } from "next-intl";

export type StripePaymentStatus =
  | "succeeded"
  | "failed"
  | "processing"
  | string;

export interface FeeSummaryItem {
  id: number;
  paidAmount: number;
  paymentMode: string;
  entity: string;
  paidOn: string;
  status: StripePaymentStatus;
  comments: string;
}

interface AcademicFeesProps {
  plan: any;
  summary: FeeSummaryItem[];
  profile?: any;
  onPay: () => void;
}

export const AcademicFees: React.FC<AcademicFeesProps> = ({
  plan,
  summary,
  profile,
  onPay,
}) => {
  const t = useTranslations("Payments.student");
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);

  if (!plan)
    return (
      <div className="p-6 text-center text-gray-500">
        {t("Loading fee details")}
      </div>
    );

  const currentDue = plan.semesterPendingAmount ?? plan.pendingAmount;

  const groupedRoadmap = useMemo(() => {
    if (!plan.semesterRoadmap) return {};

    return plan.semesterRoadmap.reduce((acc: any, sem: any) => {
      const year = sem.academicYearName || "Other";
      if (!acc[year]) acc[year] = [];
      acc[year].push(sem);
      return acc;
    }, {});
  }, [plan.semesterRoadmap]);

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return (
          <span className="flex items-center gap-1 bg-emerald-100 text-emerald-700 text-[9px] font-bold px-1.5 py-1 rounded-full uppercase tracking-wider">
            <CheckCircle weight="fill" size={12} /> {t("Paid")}
          </span>
        );
      case "PARTIAL":
        return (
          <span className="flex items-center gap-1 bg-amber-100 text-amber-700 text-[9px] font-bold px-1.5 py-1 rounded-full uppercase tracking-wider">
            <Clock weight="fill" size={12} /> {t("Partial")}
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 bg-rose-100 text-rose-700 text-[9px] font-bold px-1.5 py-1 rounded-full uppercase tracking-wider">
            <WarningCircle weight="fill" size={12} /> {t("Unpaid")}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 relative max-w-5xl mx-auto">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          {t("Active Fee Plan")}
        </h2>

        <div className="bg-emerald-50 rounded-lg p-4 mb-6 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-gray-800 text-lg">
              {plan.programName}
            </h3>
            <p className="text-gray-500 text-sm">
              {t(plan.type || "Academic Fees")}
            </p>
          </div>
          <span className="text-gray-500 font-medium">{plan.academicYear}</span>
        </div>

        <div className="space-y-3 w-full py-2 px-4 mb-8">
          <div className="flex justify-between items-center pb-2 border-b border-dashed border-gray-200">
            <span className="text-gray-700 font-bold">
              {t("Standard Semester Cost Breakdown")}
            </span>
          </div>

          {plan.components?.length > 0 ? (
            plan.components.map((comp: any, idx: number) => (
              <div
                key={idx}
                className="flex justify-between items-center text-sm"
              >
                <span className="text-gray-600">{comp.label}</span>
                <span className="text-gray-600">
                  {formatCurrency(comp.amount)}
                </span>
              </div>
            ))
          ) : (
            <div className="text-gray-400 italic text-sm py-1">
              {t("No fee details found")}
            </div>
          )}

          {plan.gstAmount > 0 && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">
                {t("GST")} {plan.gstPercent > 0 ? `(${plan.gstPercent}%)` : ""}
              </span>
              <span className="text-gray-600">
                {formatCurrency(plan.gstAmount)}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center border-t border-dashed pt-3 mt-3">
            <span className="text-gray-800 font-bold">
              {t("Base Semester Fee")}
            </span>
            <span className="text-emerald-500 font-bold">
              {formatCurrency(plan.semesterTotalPayable)}
            </span>
          </div>
        </div>

        {plan.semesterRoadmap && plan.semesterRoadmap.length > 0 && (
          <div className="px-4">
            <h4 className="font-bold text-gray-800 mb-6 text-lg">
              {t("Program Progress Tracker")}
            </h4>

            <div className="space-y-8 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
              {Object.entries(groupedRoadmap).map(
                ([yearName, semesters]: [string, any]) => (
                  <div
                    key={yearName}
                    className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-slate-200 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                      <span className="text-xs font-bold">
                        {yearName.split(" ")[0]}
                      </span>
                    </div>

                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-gray-100 bg-gray-50/50 shadow-sm">
                      <h5 className="font-bold text-gray-700 mb-4">
                        {yearName}
                      </h5>

                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                        {semesters.map((sem: any) => (
                          <div
                            key={sem.semesterId}
                            className={`relative p-4 pb-6 rounded-lg bg-white transition-all duration-200 flex flex-col h-full
                            ${
                              sem.isCurrent
                                ? "ring-2 ring-blue-500 shadow-md transform scale-[1.02] z-10"
                                : "border border-gray-200 hover:border-gray-300 hover:shadow-sm"
                            }
                          `}
                          >
                            <div className="flex justify-between gap-1 items-start mb-3">
                              <div>
                                <span
                                  className={`font-semibold text-sm ${sem.isCurrent ? "text-blue-700" : "text-gray-800"}`}
                                >
                                  {t("Semester")} {sem.semesterNumber}
                                </span>
                                {sem.isCurrent && (
                                  <div className="text-[10px] text-blue-600 font-bold uppercase tracking-wider mt-0.5">
                                    {t("Current")}
                                  </div>
                                )}
                              </div>

                              <div>{renderStatusBadge(sem.status)}</div>
                            </div>

                            <div className="space-y-1">
                              {sem.status === "PAID" ? (
                                <div className="text-xs text-gray-500">
                                  {t("Paid:")}{" "}
                                  <span className="font-semibold text-emerald-600">
                                    {formatCurrency(sem.paidAmount)}
                                  </span>
                                </div>
                              ) : (
                                <>
                                  <div className="text-xs text-gray-500">
                                    {t("Due:")}{" "}
                                    <span className="font-bold text-red-500">
                                      {formatCurrency(sem.pendingAmount)}
                                    </span>
                                  </div>
                                  {sem.paidAmount > 0 && (
                                    <div className="text-[10px] text-gray-400">
                                      ({t("Paid:")}{" "}
                                      {formatCurrency(sem.paidAmount)})
                                    </div>
                                  )}
                                </>
                              )}
                            </div>

                            {sem.paidAmount > 0 && (
                              <div className="absolute bottom-2 right-2.5">
                                <button
                                  onClick={() =>
                                    generateSemesterReceipt(
                                      plan,
                                      sem,
                                      profile,
                                      summary,
                                    )
                                  }
                                  title="Download Receipt"
                                  className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all duration-200 cursor-pointer"
                                >
                                  <Receipt size={18} weight="duotone" />
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        )}

        <div className="flex justify-between items-center bg-red-50 p-5 rounded-xl border border-red-100 mt-10 mx-4 shadow-sm">
          <div className="flex flex-col">
            <span className="text-red-700 font-bold uppercase text-sm tracking-wide">
              {t("Current Semester Due")}
            </span>
            <span className="text-red-400 text-xs mt-0.5">
              {t("Includes past pending balances")}
            </span>
          </div>
          <span className="text-red-600 font-black text-3xl tracking-tight">
            {formatCurrency(currentDue)}
          </span>
        </div>

        <div className="flex justify-end mt-6 px-4">
          <button
            onClick={onPay}
            disabled={currentDue <= 0}
            className={`
                px-8 py-3 text-base rounded-lg font-bold shadow-sm transition-all duration-200 flex items-center gap-2
                ${
                  currentDue > 0
                    ? "bg-emerald-500 hover:bg-emerald-600 hover:shadow-md text-white cursor-pointer active:scale-95"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }
            `}
          >
            {currentDue > 0
              ? `${t("Pay")} ${formatCurrency(currentDue)}`
              : t("Fully Paid")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AcademicFees;
