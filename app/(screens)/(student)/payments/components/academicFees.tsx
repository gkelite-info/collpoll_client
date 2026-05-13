"use client";

import { useMemo, useState, useEffect } from "react";
import {
  CheckCircle,
  Clock,
  WarningCircle,
  Receipt,
  CaretDown,
} from "@phosphor-icons/react";
import { generateSemesterReceipt } from "./generateReceipt";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";

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

  // Accordion State
  const [expandedYears, setExpandedYears] = useState<Record<string, boolean>>(
    {},
  );

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);

  const groupedRoadmap = useMemo(() => {
    if (!plan?.semesterRoadmap) return {};

    return plan.semesterRoadmap.reduce((acc: any, sem: any) => {
      const year = sem.academicYearName || "Other";
      if (!acc[year]) acc[year] = [];
      acc[year].push(sem);
      return acc;
    }, {});
  }, [plan?.semesterRoadmap]);

  // Automatically expand the year that has the current semester
  useEffect(() => {
    if (!groupedRoadmap) return;
    const initialExpanded: Record<string, boolean> = {};
    let hasCurrent = false;

    Object.entries(groupedRoadmap).forEach(
      ([yearName, semesters]: [string, any]) => {
        const isCurrentYear = semesters.some((s: any) => s.isCurrent);
        if (isCurrentYear) {
          initialExpanded[yearName] = true;
          hasCurrent = true;
        } else {
          initialExpanded[yearName] = false;
        }
      },
    );

    if (!hasCurrent && Object.keys(groupedRoadmap).length > 0) {
      initialExpanded[Object.keys(groupedRoadmap)[0]] = true;
    }

    setExpandedYears(initialExpanded);
  }, [groupedRoadmap]);

  const toggleYear = (year: string) => {
    setExpandedYears((prev) => ({ ...prev, [year]: !prev[year] }));
  };

  if (!plan)
    return (
      <div className="p-6 text-center text-gray-500 font-medium">
        {t("Loading fee details")}
      </div>
    );

  const currentDue = plan.semesterPendingAmount ?? plan.pendingAmount;

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return (
          <span className="flex items-center gap-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider shrink-0 whitespace-nowrap shadow-sm">
            <CheckCircle weight="fill" size={12} /> {t("Paid")}
          </span>
        );
      case "PARTIAL":
        return (
          <span className="flex items-center gap-1 bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider shrink-0 whitespace-nowrap shadow-sm">
            <Clock weight="fill" size={12} /> {t("Partial")}
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider shrink-0 whitespace-nowrap shadow-sm">
            <WarningCircle weight="fill" size={12} /> {t("Unpaid")}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6 relative max-w-5xl mx-auto">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 max-md:text-lg">
          {t("Active Fee Plan")}
        </h2>

        <div className="bg-emerald-50 rounded-lg p-4 mb-6 flex justify-between items-center border border-emerald-100/50">
          <div className="min-w-0 pr-3">
            <h3 className="font-bold text-gray-800 text-base md:text-lg truncate">
              {plan.programName}
            </h3>
            <p className="text-gray-500 text-xs md:text-sm mt-0.5 truncate">
              {t(plan.type || "Academic Fees")}
            </p>
          </div>
          <span className="text-gray-500 font-bold text-xs md:text-sm shrink-0 bg-white px-2 py-1 rounded-md shadow-sm border border-emerald-100">
            {plan.academicYear}
          </span>
        </div>

        <div className="space-y-3 w-full py-2 px-2 md:px-4 mb-8">
          <div className="flex justify-between items-center pb-2 border-b border-dashed border-gray-200">
            <span className="text-gray-700 font-bold max-md:text-sm">
              {t("Standard Semester Cost Breakdown")}
            </span>
          </div>

          {plan.components?.length > 0 ? (
            plan.components.map((comp: any, idx: number) => (
              <div
                key={idx}
                className="flex justify-between items-center text-sm max-md:text-[13px]"
              >
                <span className="text-gray-600">{comp.label}</span>
                <span className="text-gray-600 font-medium">
                  {formatCurrency(comp.amount)}
                </span>
              </div>
            ))
          ) : (
            <div className="text-gray-400 italic text-sm max-md:text-xs py-1">
              {t("No fee details found")}
            </div>
          )}

          {plan.gstAmount > 0 && (
            <div className="flex justify-between items-center text-sm max-md:text-[13px]">
              <span className="text-gray-600">
                {t("GST")} {plan.gstPercent > 0 ? `(${plan.gstPercent}%)` : ""}
              </span>
              <span className="text-gray-600 font-medium">
                {formatCurrency(plan.gstAmount)}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center border-t border-dashed pt-3 mt-3">
            <span className="text-gray-800 font-bold max-md:text-sm">
              {t("Base Semester Fee")}
            </span>
            <span className="text-emerald-500 font-bold max-md:text-base">
              {formatCurrency(plan.semesterTotalPayable)}
            </span>
          </div>
        </div>

        {plan.semesterRoadmap && plan.semesterRoadmap.length > 0 && (
          <div className="px-1 md:px-4 mt-12 mb-8 ">
            <h4 className="font-bold text-gray-800 mb-8 text-lg max-md:text-base text-center md:text-left">
              {t("Program Progress Tracker")}
            </h4>

            <div className="relative w-full hidden max-md:block">
              <div className="absolute top-2 bottom-2 left-[24px] md:left-1/2 w-0.5 bg-gradient-to-b from-transparent via-slate-200 to-transparent md:-translate-x-1/2"></div>

              <div className="space-y-6 md:space-y-10">
                {Object.entries(groupedRoadmap).map(
                  ([yearName, semesters]: [string, any], index) => {
                    const isExpanded = expandedYears[yearName] || false;

                    return (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        key={yearName}
                        className="relative flex flex-col md:flex-row items-start md:items-center md:even:flex-row-reverse group w-full"
                      >
                        <motion.div
                          initial={{ scale: 0 }}
                          whileInView={{ scale: 1 }}
                          viewport={{ once: true }}
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 20,
                            delay: index * 0.1 + 0.2,
                          }}
                          className="absolute left-[24px] md:left-1/2 -translate-x-1/2 flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-slate-100 text-slate-600 shadow-sm z-10"
                        >
                          <span className="text-[11px] font-bold">
                            {yearName.split(" ")[0]}
                          </span>
                        </motion.div>

                        {/* Content Box */}
                        <div className="ml-[60px] md:ml-0 md:w-[calc(50%-3rem)] w-[calc(100%-60px)] bg-gray-50 border border-gray-100 rounded-2xl p-4 md:p-5 shadow-sm transition-all hover:shadow-md">
                          {/* Accordion Header */}
                          <div
                            className="flex justify-between items-center cursor-pointer select-none"
                            onClick={() => toggleYear(yearName)}
                          >
                            <h5 className="font-bold text-gray-800 max-md:text-[15px] m-0">
                              {yearName}
                            </h5>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] md:text-xs text-gray-500 font-semibold bg-white px-2 py-0.5 md:py-1 rounded-md border border-gray-200 shadow-sm">
                                {semesters.length} {t("Semesters")}
                              </span>
                              <motion.div
                                animate={{ rotate: isExpanded ? 180 : 0 }}
                                transition={{ duration: 0.3 }}
                                className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-white flex items-center justify-center shadow-sm border border-gray-200 text-gray-500 hover:bg-gray-100 transition-colors"
                              >
                                <CaretDown size={14} weight="bold" />
                              </motion.div>
                            </div>
                          </div>

                          <AnimatePresence initial={false}>
                            {isExpanded && (
                              <motion.div
                                initial={{
                                  height: 0,
                                  opacity: 0,
                                  marginTop: 0,
                                }}
                                animate={{
                                  height: "auto",
                                  opacity: 1,
                                  marginTop: 16,
                                }}
                                exit={{ height: 0, opacity: 0, marginTop: 0 }}
                                transition={{
                                  duration: 0.3,
                                  ease: "easeInOut",
                                }}
                                className="overflow-hidden"
                              >
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 md:gap-4 p-1 pb-2">
                                  {semesters.map((sem: any) => (
                                    <div
                                      key={sem.semesterId}
                                      className={`relative p-3.5 md:p-4 pb-5 md:pb-6 rounded-xl bg-white transition-all duration-300 flex flex-col h-full
                                      ${
                                        sem.isCurrent
                                          ? "border-2 border-blue-500 shadow-md transform md:scale-[1.02] z-10"
                                          : "border border-gray-200 hover:border-blue-200 hover:shadow-sm"
                                      }
                                    `}
                                    >
                                      <div className="flex justify-between gap-2 items-start mb-3 w-full">
                                        <div className="min-w-0 flex-1 pr-1">
                                          <span
                                            className={`font-bold text-sm max-md:text-[13px] truncate block ${
                                              sem.isCurrent
                                                ? "text-blue-700"
                                                : "text-gray-800"
                                            }`}
                                          >
                                            {t("Semester")} {sem.semesterNumber}
                                          </span>
                                          {sem.isCurrent && (
                                            <div className="text-[9px] text-blue-600 font-black uppercase tracking-widest mt-0.5">
                                              {t("Current")}
                                            </div>
                                          )}
                                        </div>
                                        <div className="shrink-0 pl-1">
                                          {renderStatusBadge(sem.status)}
                                        </div>
                                      </div>

                                      <div className="relative space-y-1.5 mt-auto">
                                        {sem.status === "PAID" ? (
                                          <div className="text-[11px] md:text-xs text-gray-500 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                                            {t("Paid:")}{" "}
                                            <span className="font-bold text-emerald-600 block mt-0.5 text-[13px] md:text-sm">
                                              {formatCurrency(sem.paidAmount)}
                                            </span>
                                          </div>
                                        ) : (
                                          <div className="bg-red-50/50 p-2.5 rounded-lg border border-red-100/50">
                                            <div className="text-[11px] md:text-xs text-gray-500">
                                              {t("Due:")}{" "}
                                              <span className="font-bold text-red-600 block mt-0.5 text-[13px] md:text-sm">
                                                {formatCurrency(
                                                  sem.pendingAmount,
                                                )}
                                              </span>
                                            </div>
                                            {sem.paidAmount > 0 && (
                                              <div className="text-[10px] md:text-[11px] text-gray-500 mt-1.5 font-medium flex items-center gap-1 before:content-[''] before:block before:w-1.5 before:h-1.5 before:rounded-full before:bg-emerald-500">
                                                {t("Paid:")}{" "}
                                                <span className="font-semibold text-gray-700">
                                                  {formatCurrency(
                                                    sem.paidAmount,
                                                  )}
                                                </span>
                                              </div>
                                            )}
                                          </div>
                                        )}
                                        {sem.paidAmount > 0 && (
                                          <div className="absolute bottom-4 right-2 md:bottom-2.5 md:right-2.5">
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
                                              className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all duration-200 cursor-pointer border border-transparent hover:border-emerald-100"
                                            >
                                              <Receipt
                                                size={28}
                                                weight="duotone"
                                              />
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    );
                  },
                )}
              </div>
            </div>

            <div className="max-md:hidden space-y-8 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
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
                                  className={`font-semibold text-xs max-md:text-xs ${sem.isCurrent ? "text-blue-700" : "text-gray-800"}`}
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

        <div className="flex justify-between items-center bg-red-50 p-4 md:p-6 rounded-2xl border border-red-100 mt-10 md:mx-4 shadow-sm max-md:flex-col max-md:gap-2 max-md:text-center max-md:items-center">
          <div className="flex flex-col">
            <span className="text-red-700 font-bold uppercase text-xs md:text-sm tracking-widest">
              {t("Current Semester Due")}
            </span>
            <span className="text-red-400 text-[10px] md:text-[11px] mt-1 font-medium">
              {t("Includes past pending balances")}
            </span>
          </div>
          <span className="text-red-600 font-black text-2xl md:text-3xl tracking-tight mt-1 md:mt-0">
            {formatCurrency(currentDue)}
          </span>
        </div>

        <div className="flex justify-end max-md:justify-center mt-6 md:px-4">
          <button
            onClick={onPay}
            disabled={currentDue <= 0}
            className={`
                px-8 py-3.5 text-sm md:text-base rounded-xl font-bold shadow-sm transition-all duration-200 flex items-center justify-center gap-2 w-full md:w-auto
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
