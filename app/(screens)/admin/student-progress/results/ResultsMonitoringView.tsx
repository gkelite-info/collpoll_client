"use client";

import { ArrowRight, CheckCircle, FileText } from "@phosphor-icons/react";
import { Avatar } from "@/app/utils/Avatar";
import { motion } from "framer-motion";
import { useState } from "react";
import { FilterDropdown } from "../../academics/components/filterDropdown";
import type { ResultBranchOption, ResultCard, ResultYearOption } from "./types";

const formatSubjectPill = (subject: string) =>
  subject.length > 22 ? `${subject.slice(0, 20)}...` : subject;

export default function ResultsMonitoringView({
  branchOptions,
  yearOptions,
  selectedBranch,
  selectedYear,
  selectBranch,
  selectYear,
  resultCards,
  onViewDetails,
}: {
  branchOptions: ResultBranchOption[];
  yearOptions: ResultYearOption[];
  selectedBranch: ResultBranchOption | null;
  selectedYear: ResultYearOption | null;
  selectBranch: (branch: ResultBranchOption | null) => void;
  selectYear: (year: ResultYearOption | null) => void;
  resultCards: ResultCard[];
  onViewDetails: (resultId: string) => void;
}) {
  const [fallbackYear, setFallbackYear] = useState("All");
  const fallbackYearOptions = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
  const hasYearOptions = yearOptions.length > 0;
  const academicYearOptions = [
    "All",
    ...(hasYearOptions
      ? yearOptions.map((year) => String(year.collegeAcademicYearId))
      : fallbackYearOptions),
  ];

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 pb-6">
      <div>
        <h1 className="text-2xl font-bold text-[#282828]">
          Branch-wise Results Monitoring
        </h1>
      </div>

      <div className="grid w-full max-w-2xl grid-cols-1 gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:grid-cols-2">
        <FilterDropdown
          label="Select Branch"
          value={selectedBranch?.collegeBranchId?.toString() ?? "All"}
          placeholder="All Branches"
          options={["All", ...branchOptions.map((branch) => String(branch.collegeBranchId))]}
          onChange={(value) => {
            if (value === "All") {
              selectBranch(null);
              return;
            }

            selectBranch(
              branchOptions.find((branch) => branch.collegeBranchId === Number(value)) ??
              null,
            );
          }}
          widthClassName="w-full"
          displayModifier={(value) =>
            value === "All"
              ? "All Branches"
              : branchOptions.find((branch) => String(branch.collegeBranchId) === value)
                ?.collegeBranchType ??
              branchOptions.find((branch) => String(branch.collegeBranchId) === value)
                ?.collegeBranchCode ??
              value
          }
        />

        <FilterDropdown
          label="Academic Year"
          value={selectedYear?.collegeAcademicYearId?.toString() ?? fallbackYear}
          placeholder="All Years"
          options={academicYearOptions}
          onChange={(value) => {
            if (value === "All") {
              setFallbackYear("1st Year");
              selectYear(null);
              return;
            }

            if (!hasYearOptions) {
              setFallbackYear(value);
              selectYear(null);
              return;
            }

            setFallbackYear("All");
            selectYear(
              yearOptions.find((year) => year.collegeAcademicYearId === Number(value)) ??
              null,
            );
          }}
          widthClassName="w-full"
          displayModifier={(value) =>
            value === "All"
              ? "All Years"
              : yearOptions.find((year) => String(year.collegeAcademicYearId) === value)
                ?.collegeAcademicYear ?? value
          }
        />
      </div>

      <motion.div layout className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {resultCards.map((result) => (
          <motion.article
            key={result.id}
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22 }}
            className="flex min-h-[250px] flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <div className="mb-5 flex items-center justify-between gap-3">
              <span
                className="truncate rounded-full bg-[#E8F8EF] px-3 py-1 text-[11px] font-black uppercase tracking-wide text-[#047857]"
                title={result.subject}
              >
                {formatSubjectPill(result.subject)}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#009B55]">
                {result.status === "Uploaded" ? (
                  <CheckCircle size={13} weight="fill" />
                ) : (
                  <FileText size={13} weight="fill" />
                )}
                {result.status}
              </span>
            </div>

            <div className="mb-5 flex items-center gap-4">
                <Avatar
                  src={result.profileUrl}
                  alt={result.facultyName}
                  size={56}
                />
              <div className="min-w-0">
                <h2 className="truncate text-base font-bold text-[#16284F]">
                  {result.facultyName}
                </h2>
                <p className="truncate text-xs font-semibold text-gray-500">
                  {result.facultyId}
                </p>
              </div>
            </div>

            <div className="space-y-3 border-t border-gray-100 pt-4">
              <MetricRow label="Total Students" value={String(result.totalStudents)} />
              <MetricRow
                label="Pass Percentage"
                value={`${result.passPercentage.toFixed(1)}%${result.status === "Draft Mode" ? " (Draft)" : ""
                  }`}
                valueClassName="text-[#047857]"
              />
            </div>

            <button
              type="button"
              onClick={() => onViewDetails(result.id)}
              className="mt-7 flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#16284F] px-4 text-sm font-bold text-white transition-colors hover:bg-[#102044]"
            >
              View Detailed Report
              <ArrowRight size={16} weight="bold" />
            </button>
          </motion.article>
        ))}
      </motion.div>
    </section>
  );
}

function MetricRow({
  label,
  value,
  valueClassName = "text-[#16284F]",
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="font-medium text-gray-500">{label}</span>
      <span className={`font-black ${valueClassName}`}>{value}</span>
    </div>
  );
}
