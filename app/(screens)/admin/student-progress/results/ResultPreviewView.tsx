"use client";

import {
  ArrowLeft,
  DownloadSimple,
  FunnelSimple,
  NotePencil,
  Tray,
} from "@phosphor-icons/react";
import Image from "next/image";
import type { ResultCard } from "./types";

const gradeRows = [
  {
    studentId: "208234",
    studentName: "Elena Rodriguez",
    subjectCode: "PHY-701",
    grade: "A+",
    points: 6,
    result: "P",
    credits: "3.0",
  },
  {
    studentId: "208235",
    studentName: "Adrian Sterling",
    subjectCode: "PHY-701",
    grade: "B",
    points: 6,
    result: "P",
    credits: "3.0",
  },
  {
    studentId: "208236",
    studentName: "Marcus Chen",
    subjectCode: "PHY-702",
    grade: "F",
    points: 2,
    result: "F",
    credits: "3.0",
  },
  {
    studentId: "208237",
    studentName: "Sophia Loren",
    subjectCode: "PHY-701",
    grade: "A",
    points: 6,
    result: "P",
    credits: "3.0",
  },
  {
    studentId: "208238",
    studentName: "Jameson Blake",
    subjectCode: "PHY-703",
    grade: "B+",
    points: 6,
    result: "P",
    credits: "3.0",
  },
];

export default function ResultPreviewView({
  result,
  onBack,
}: {
  result: ResultCard;
  onBack: () => void;
}) {
  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 pb-8">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-bold text-[#16284F] shadow-sm"
      >
        <ArrowLeft size={16} weight="bold" />
        Back
      </button>

      <div className="relative h-[190px] overflow-hidden rounded-xl bg-[#16284F] shadow-sm">
        <Image
          src="/dashboard-banner-bg.png"
          alt="College campus"
          fill
          priority
          className="object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-black/20" />
        <div className="absolute inset-x-8 bottom-8 flex items-center gap-6">
          <div className="grid h-20 w-20 shrink-0 place-items-center rounded-lg border-4 border-white bg-[#16284F] text-sm font-black text-white">
            Logo
          </div>
          <div>
            <h1 className="text-3xl font-black text-white">
              St. Xavier&apos;s College of Excellence
            </h1>
            <p className="mt-1 text-base font-medium text-white/85">
              Faculty of Science • Department of {result.subject}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-black text-[#047857]">
            Memorandum of Grades
          </h2>
          <p className="text-sm font-medium text-gray-600">
            Previewing parsed data for Semester VII - Autumn 2024
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="inline-flex h-11 items-center gap-2 rounded-lg border border-[#047857] px-5 text-sm font-bold text-[#047857]"
          >
            <NotePencil size={18} weight="bold" />
            Edit Data
          </button>
          <button
            type="button"
            className="inline-flex h-11 items-center gap-2 rounded-lg border border-[#047857] px-5 text-sm font-bold text-[#047857]"
          >
            <Tray size={18} weight="bold" />
            Save Draft
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-[#C9D7CE] bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-[#C9D7CE] bg-[#F8FAFB] p-5 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              className="inline-flex h-10 min-w-[160px] items-center justify-between rounded-lg border border-[#C9D7CE] bg-white px-4 text-sm font-semibold text-[#34425E]"
            >
              <span className="inline-flex items-center gap-3">
                <FunnelSimple size={15} weight="bold" />
                All Sections
              </span>
            </button>
            <span className="text-sm font-medium text-gray-600">
              Showing 148 Students
            </span>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 text-sm font-black text-[#047857]"
          >
            <DownloadSimple size={18} weight="bold" />
            Export as PDF
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[980px] w-full border-collapse">
            <thead>
              <tr className="bg-[#F0F2F4] text-left text-xs font-black uppercase tracking-widest text-[#34425E]">
                <th className="px-8 py-5">Student ID</th>
                <th className="px-8 py-5">Student Name</th>
                <th className="px-8 py-5">Subject Code</th>
                <th className="px-8 py-5">Grade Secured</th>
                <th className="px-8 py-5">Grade Points</th>
                <th className="px-8 py-5">Results</th>
                <th className="px-8 py-5">Credits</th>
              </tr>
            </thead>
            <tbody>
              {gradeRows.map((row) => {
                const isFailed = row.result === "F";

                return (
                  <tr key={row.studentId} className="border-b border-gray-100 last:border-0">
                    <td className="px-8 py-6 font-mono text-lg text-[#047857]">
                      {row.studentId}
                    </td>
                    <td className="px-8 py-6 text-base font-black text-[#171717]">
                      {row.studentName}
                    </td>
                    <td className="px-8 py-6">
                      <span className="rounded-md bg-gray-100 px-3 py-2 text-sm font-semibold text-[#34425E]">
                        {row.subjectCode}
                      </span>
                    </td>
                    <td
                      className={`px-8 py-6 text-lg font-black ${
                        isFailed ? "text-[#D00000]" : "text-[#047857]"
                      }`}
                    >
                      {row.grade}
                    </td>
                    <td
                      className={`px-8 py-6 text-lg font-black ${
                        isFailed ? "text-[#D00000]" : "text-[#047857]"
                      }`}
                    >
                      {row.points}
                    </td>
                    <td
                      className={`px-8 py-6 text-lg font-black ${
                        isFailed ? "text-[#D00000]" : "text-[#047857]"
                      }`}
                    >
                      {row.result}
                    </td>
                    <td className="px-8 py-6 text-lg font-black text-[#20B66A]">
                      {row.credits}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
