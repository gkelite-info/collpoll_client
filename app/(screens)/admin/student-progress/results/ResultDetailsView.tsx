"use client";

import {
  ArrowLeft,
  CaretDown,
  DownloadSimple,
  Eye,
  GraduationCap,
} from "@phosphor-icons/react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useMemo, useState } from "react";
import type { ResultCard } from "./types";

type HistoryRow = {
  id: number;
  examinationType: string;
  semester: string;
  uploadedOn: string;
  students: number;
  status: "Published" | "Draft";
};

export default function ResultDetailsView({
  result,
  selectedBranch,
  selectedYear,
  selectedSection,
  selectedSemester,
  onBack,
  onViewResult,
}: {
  result: ResultCard;
  selectedBranch: string;
  selectedYear: string;
  selectedSection: string;
  selectedSemester: string;
  onBack: () => void;
  onViewResult: () => void;
}) {
  const [semesterFilter, setSemesterFilter] = useState("All Semesters");
  const historyRows = useMemo<HistoryRow[]>(
    () => [
      {
        id: 1,
        examinationType: "Mid Term",
        semester: "Semester-1",
        uploadedOn: "12 May 2025",
        students: Math.min(result.totalStudents, 62),
        status: "Published",
      },
      {
        id: 2,
        examinationType: "End Semester",
        semester: "Semester-1",
        uploadedOn: "02 May 2025",
        students: Math.min(result.totalStudents, 62),
        status: "Draft",
      },
      {
        id: 3,
        examinationType: "Assignment Test",
        semester: "Semester-2",
        uploadedOn: "18 Jun 2025",
        students: Math.min(result.totalStudents, 66),
        status: "Published",
      },
      {
        id: 4,
        examinationType: "Internal Practical",
        semester: "Semester-2",
        uploadedOn: "25 Jun 2025",
        students: Math.min(result.totalStudents, 64),
        status: "Draft",
      },
      {
        id: 5,
        examinationType: "Mid Term",
        semester: "Semester-3",
        uploadedOn: "08 Aug 2025",
        students: Math.min(result.totalStudents, 70),
        status: "Published",
      },
      {
        id: 6,
        examinationType: "End Semester",
        semester: "Semester-3",
        uploadedOn: "26 Aug 2025",
        students: Math.min(result.totalStudents, 70),
        status: "Draft",
      },
    ],
    [result.totalStudents],
  );
  const semesterOptions = ["All Semesters", "Semester-1", "Semester-2", "Semester-3"];
  const filteredRows = useMemo(
    () =>
      semesterFilter === "All Semesters"
        ? historyRows
        : historyRows.filter((row) => row.semester === semesterFilter),
    [historyRows, semesterFilter],
  );

  const downloadPdf = (row: HistoryRow) => {
    const doc = new jsPDF();
    const fileSubject = result.subject.replace(/\s+/g, "-").toLowerCase();

    doc.setFontSize(16);
    doc.text("Class Result Details", 14, 18);
    doc.setFontSize(10);
    doc.text(`Subject: ${result.subject}`, 14, 28);
    doc.text(`Branch: ${selectedBranch}`, 14, 34);
    doc.text(`Year: ${selectedYear}`, 14, 40);
    doc.text(`Section: ${selectedSection}`, 14, 46);
    doc.text(`Semester: ${row.semester}`, 14, 52);
    doc.text(`Total Students: ${result.totalStudents}`, 14, 58);

    autoTable(doc, {
      startY: 68,
      head: [["#", "Examination Type", "Uploaded On", "Students", "Status"]],
      body: [
        [
          row.id,
          row.examinationType,
          row.uploadedOn,
          row.students,
          row.status,
        ],
      ],
      styles: { fontSize: 9 },
      headStyles: { fillColor: [22, 40, 79] },
    });

    doc.save(`${fileSubject}-${row.semester.toLowerCase()}-${row.id}.pdf`);
  };

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 pb-8">
      <div>
        <button
          type="button"
          onClick={onBack}
          className="mb-4 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-bold text-[#16284F] shadow-sm"
        >
          <ArrowLeft size={16} weight="bold" />
          Back
        </button>
        <h1 className="text-2xl font-bold text-[#16284F]">Class Result Details</h1>
        <p className="text-sm font-medium text-gray-500">
          View and manage all result uploaded by faculty
        </p>
      </div>

      <div className="rounded-xl bg-white p-7 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-[#E8F8EF] text-[#047857]">
            <GraduationCap size={22} weight="bold" />
          </span>
          <h2 className="text-lg font-bold text-[#16284F]">Class Information</h2>
        </div>

        <div className="grid grid-cols-2 gap-5 md:grid-cols-3 xl:grid-cols-5">
          <InfoBlock label="Branch" value={selectedBranch} />
          <InfoBlock label="Year" value={selectedYear} />
          <InfoBlock label="Section" value={selectedSection} />
          <InfoBlock label="Semester" value={selectedSemester} />
          <InfoBlock label="Total Students" value={String(result.totalStudents)} />
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-bold text-[#047857]">Previous Uploads History</h2>
        <label className="relative">
          <select
            value={semesterFilter}
            onChange={(event) => setSemesterFilter(event.target.value)}
            className="h-10 min-w-[170px] cursor-pointer appearance-none rounded-lg bg-white pl-4 pr-10 text-sm font-semibold text-gray-500 shadow-sm outline-none"
          >
            {semesterOptions.map((semester) => (
              <option key={semester} value={semester}>
                {semester}
              </option>
            ))}
          </select>
          <CaretDown
            size={14}
            weight="bold"
            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
          />
        </label>
      </div>

      <div className="overflow-hidden rounded-xl bg-white p-4 shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[820px] w-full border-collapse">
            <thead>
              <tr className="bg-[#F7F8FA] text-left text-[11px] font-black uppercase tracking-wider text-gray-500">
                <th className="px-5 py-4">#</th>
                <th className="px-5 py-4">Examination Type</th>
                <th className="px-5 py-4">Semester</th>
                <th className="px-5 py-4">Uploaded On</th>
                <th className="px-5 py-4">Students</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => (
                <tr key={row.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-5 py-5 text-sm font-medium text-gray-500">{row.id}</td>
                  <td className="px-5 py-5 text-sm font-semibold text-[#34425E]">
                    {row.examinationType}
                  </td>
                  <td className="px-5 py-5 text-sm text-gray-500">{row.semester}</td>
                  <td className="px-5 py-5 text-sm text-gray-500">{row.uploadedOn}</td>
                  <td className="px-5 py-5 text-sm text-gray-500">{row.students}</td>
                  <td className="px-5 py-5">
                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-bold ${
                        row.status === "Published"
                          ? "bg-[#E8F8EF] text-[#047857]"
                          : "bg-[#FFF5D6] text-[#D97706]"
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="px-5 py-5">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={onViewResult}
                        className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-500 transition-colors hover:border-[#43C17A] hover:text-[#047857]"
                      >
                        <Eye size={14} />
                        View Result
                      </button>
                      <button
                        type="button"
                        onClick={() => downloadPdf(row)}
                        className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-500 transition-colors hover:border-[#43C17A] hover:text-[#047857]"
                      >
                        <DownloadSimple size={14} />
                        Download PDF
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/*
      <div className="rounded-xl bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 rounded-xl border border-[#D9F4E5] bg-[#F5FFF9] p-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <span className="grid h-12 w-12 place-items-center rounded-lg bg-white text-[#047857]">
              <FileText size={22} weight="bold" />
            </span>
            <div>
              <h3 className="text-base font-bold text-[#047857]">
                Need to update results?
              </h3>
              <p className="text-sm font-medium text-gray-500">
                You can re-upload new results. The latest published result will be visible to students.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="inline-flex min-w-[210px] items-center justify-center gap-2 rounded-lg border border-[#43C17A] bg-white px-5 py-3 text-sm font-bold text-[#047857]"
          >
            <UploadSimple size={17} weight="bold" />
            Upload New Results
          </button>
        </div>
      </div>
      */}
    </section>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-black uppercase tracking-wider text-gray-400">
        {label}
      </p>
      <p className="mt-2 truncate text-sm font-black text-[#16284F]" title={value}>
        {value}
      </p>
    </div>
  );
}
