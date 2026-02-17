"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { CaretRight } from "@phosphor-icons/react";

export default function FinanceStudentsView() {
    const router = useRouter();
    const sp = useSearchParams();

    const educationType = sp.get("type") ?? "B Tech";
    const branch = sp.get("branch") ?? "CSE";
    const year = "1st year";
    const academicYear = "2026";

    const students = [
        {
            name: "Aarav Reddy",
            id: "64287492",
            expected: "1,01,000",
            paid: "1,01,000",
            pending: "0",
            lastPayment: "10 Feb 2026",
        },
        {
            name: "Priya Sharma",
            id: "64287492",
            expected: "1,01,000",
            paid: "85,000",
            pending: "16,000",
            lastPayment: "10 Feb 2026",
        },
        {
            name: "Rohit Kumar",
            id: "64287492",
            expected: "1,01,000",
            paid: "0",
            pending: "1,01,000",
            lastPayment: "10 Feb 2026",
        },
        {
            name: "Aarav Reddy",
            id: "64287492",
            expected: "1,01,000",
            paid: "1,01,000",
            pending: "0",
            lastPayment: "10 Feb 2026",
        },
        {
            name: "Priya Sharma",
            id: "64287492",
            expected: "1,01,000",
            paid: "85,000",
            pending: "16,000",
            lastPayment: "10 Feb 2026",
        },
        {
            name: "Rohit Kumar",
            id: "64287492",
            expected: "1,01,000",
            paid: "0",
            pending: "1,01,000",
            lastPayment: "10 Feb 2026",
        },
        {
            name: "Aarav Reddy",
            id: "64287492",
            expected: "1,01,000",
            paid: "1,01,000",
            pending: "0",
            lastPayment: "10 Feb 2026",
        },
        {
            name: "Priya Sharma",
            id: "64287492",
            expected: "1,01,000",
            paid: "85,000",
            pending: "16,000",
            lastPayment: "10 Feb 2026",
        },
        {
            name: "Rohit Kumar",
            id: "64287492",
            expected: "1,01,000",
            paid: "0",
            pending: "1,01,000",
            lastPayment: "10 Feb 2026",
        },
    ];

    return (
        <div className="flex flex-col">

            {/* ================= FILTERS (STATIC - NO CARET) ================= */}
            <div className="flex items-center gap-6 mb-6 text-sm text-[#6B7280]">
                <FilterLabel title="Education Type" value={educationType} />
                <FilterLabel title="Branch" value={branch} />
                <FilterLabel title="Year" value={year} />
                <FilterLabel title="Academic Year" value={academicYear} />
            </div>

            {/* ================= TABLE ================= */}
            <div className="bg-white rounded-[16px] overflow-hidden">

                {/* Header */}
                <div className="grid grid-cols-6 px-6 py-4 bg-[#F3F4F6] text-sm font-semibold text-[#374151]">
                    <div>Student Name</div>
                    <div>Student ID</div>
                    <div>Expected Fee</div>
                    <div>Paid</div>
                    <div>Pending</div>
                    <div>Last Payment</div>
                </div>

                {/* Rows */}
                {students.map((student, index) => (
                    <div
                        key={index}
                        className="grid grid-cols-6 px-6 py-4 text-sm text-[#374151] border-b border-[#E5E7EB] last:border-none"
                    >
                        <div className=" text-[#1F2937]">
                            {student.name}
                        </div>

                        <div>{student.id}</div>
                        <div>{student.expected}</div>
                        <div>{student.paid}</div>

                        {/* Pending Column - Exact Figma Colors */}
                        <div className="text-[#1F2937]">
                            {student.pending}
                        </div>
                        <div>
                            {student.lastPayment}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ================= STATIC FILTER LABEL ================= */

function FilterLabel({ title, value }: any) {
    return (
        <div className="flex items-center gap-2">
            <span>{title} :</span>
            <span className="bg-[#43C17A1C] text-[#43C17A] px-3 py-1 rounded-full">
                {value}
            </span>
        </div>
    );
}
