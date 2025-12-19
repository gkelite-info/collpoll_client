'use client';

import TableComponent from "@/app/utils/table/table";
import { ArrowBendUpLeft } from "@phosphor-icons/react";

type MidExamsProps = {
    onBack: () => void;
};

type Subject = {
    subject: string;
    attendance: number;
};

export default function MidExams({ onBack }: MidExamsProps) {

    const data = [
        {
            title: "Exam start date",
            subTitle: "11 March 2025",
        },
        {
            title: "Exam type",
            subTitle: "Mid Term Exams (CSE Year 2)",
        },
    ];

    const subjects: Subject[] = [
        { subject: "Data Structures", attendance: 87 },
        { subject: "OOPs using C++", attendance: 72 },
        { subject: "Discrete Mathematics", attendance: 65 },
    ];

    const columns = [
        { title: "Subject", key: "subject" },
        { title: "Attendance", key: "attendance" },
        { title: "Actions", key: "actions" },
    ];

    const tableData = subjects.map((item) => ({
        subject: item.subject,

        attendance: (
            <div className="flex items-center justify-center gap-0.5">
                <p
                    className={`text-xs font-medium ${item.attendance >= 75 ? "text-green-500" : "text-red-500"
                        }`}
                >
                    {item.attendance}%
                </p>
                <p className="text-xs">/100%</p>
            </div>
        ),

        actions: (
            <div className="flex items-center justify-center">
                <div
                    className={`rounded-md px-2 py-0.5 ${item.attendance >= 75
                        ? "bg-[#43C17A] cursor-pointer"
                        : "bg-gray-300 cursor-not-allowed"
                        }`}
                >
                    <p className="text-white text-sm">
                        {item.attendance >= 75 ? "ENROLL" : "NOT ELIGIBLE"}
                    </p>
                </div>
            </div>
        ),
    }));

    return (
        <div className="flex flex-col items-start justify-start gap-3">
            <div className="flex items-center gap-3">
                <ArrowBendUpLeft size={22} weight="fill" onClick={onBack} className="text-[#282828] cursor-pointer" />
                <h3 className="text-[#282828] text-lg font-semibold">
                    Mid Term Exam Enrollment
                </h3>
            </div>

            <p className="text-sm text-[#515151]">
                Enroll for your upcoming exams starting March 11, 2025.
            </p>

            <div className="bg-white rounded-lg p-3 shadow-md w-full flex flex-col gap-3 mt-0.5">
                {data.map((item, index) => (
                    <div className="flex items-center gap-3" key={index}>
                        <div className="w-[18%]">
                            <h6 className="text-[#282828] text-md">{item.title}</h6>
                        </div>
                        <div className="rounded-full bg-[#E5F6EC] px-3 py-1.5">
                            <p className="text-[#43C17A] font-medium">{item.subTitle}</p>
                        </div>
                    </div>
                ))}

                <div className="flex items-center">
                    <div className="w-[20%]">
                        <h6 className="text-[#282828] text-md">Note</h6>
                    </div>
                    <p className="text-[#282828] text-md">
                        You’re eligible to enroll if your attendance ≥ 75%
                    </p>
                </div>
            </div>

            <div className="bg-white w-full rounded-lg p-3 shadow-md mt-2">
                <div className="flex items-center justify-between mb-3">
                    <h5 className="text-[#282828] font-medium">
                        Select Subjects to Enroll
                    </h5>
                    <div className="rounded-lg bg-[#E5F6EC] px-3 py-1.5">
                        <p className="text-[#43C17A] font-medium">Hall Ticket</p>
                    </div>
                </div>

                <TableComponent
                    columns={columns}
                    tableData={tableData}
                />
            </div>
        </div>
    );
}
