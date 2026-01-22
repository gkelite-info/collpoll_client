'use client'
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import { FaChevronDown } from "react-icons/fa6";
import SubjectCard, { CardProps } from "../components/subjectCards";
import { CaretLeft } from "@phosphor-icons/react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

const MOCK_SUBJECT_DATA: CardProps[] = [
    {
        subjectTitle: "Data Structures",
        year: "Year 2 – CSE A",
        units: 15,
        topicsCovered: 15,
        topicsTotal: 15,
        nextLesson: "Trees & Traversals",
        students: 35,
        percentage: 100,
        fromDate: "10-12-2025",
        toDate: "01-01-2026",
    },
    {
        subjectTitle: "Algorithms",
        year: "Year 3 CSE",
        units: 3,
        topicsCovered: 10,
        topicsTotal: 15,
        nextLesson: "Trees & Traversals",
        students: 35,
        percentage: 60,
        fromDate: "15 Jan 2026",
        toDate: "10 Apr 2026",
    },
    {
        subjectTitle: "Data Structures",
        year: "Year 2 IT",
        units: 8,
        topicsCovered: 15,
        topicsTotal: 20,
        nextLesson: "Hashing",
        students: 38,
        percentage: 55,
        fromDate: "12 Dec 2025",
        toDate: "02 Mar 2026",
    },
    {
        subjectTitle: "Algorithms",
        year: "Year 3 CSE",
        units: 3,
        topicsCovered: 10,
        topicsTotal: 15,
        nextLesson: "Trees & Traversals",
        students: 35,
        percentage: 60,
        fromDate: "15 Jan 2026",
        toDate: "10 Apr 2026",
    },
    {
        subjectTitle: "OS",
        year: "Year 3 CSE",
        units: 8,
        topicsCovered: 15,
        topicsTotal: 30,
        nextLesson: "Hashing",
        students: 38,
        percentage: 40,
        fromDate: "12 Dec 2025",
        toDate: "02 Mar 2026",
    },
    {
        subjectTitle: "Algorithms",
        year: "Year 3 CSE",
        units: 3,
        topicsCovered: 10,
        topicsTotal: 15,
        nextLesson: "Trees & Traversals",
        students: 35,
        percentage: 60,
        fromDate: "15 Jan 2026",
        toDate: "10 Apr 2026",
    },
];

function Academics() {
    const router = useRouter();
    const params = useParams()
    const searchParams = useSearchParams();
    const year = searchParams.get("year") || "2";
    const rawCategory = params.category;

    const category =
        typeof rawCategory === "string"
            ? decodeURIComponent(rawCategory)
            : "CSE";


    const handleBack = () => {
        router.back();
    }
    return (
        <div className="p-2 flex flex-col lg:pb-5">
            <div className="flex justify-between items-center mb-5">
                <div className="flex flex-col w-[50%]">
                    <div className="flex items-center gap-1">
                        <button className="cursor-pointer" onClick={handleBack}><CaretLeft size={23} className="-ml-1.5" /></button>
                        <h1 className="text-[#282828] font-semibold text-2xl mb-1">
                            Academics - {category} Year {year}
                        </h1>
                    </div>
                    <p className="text-[#282828] text-sm">
                        Track syllabus Progress and manage notes by semester
                    </p>
                </div>
                <div className="flex justify-end w-[32%]">
                    <CourseScheduleCard style="w-[320px]" />
                </div>
            </div>

            <div className="mt-4">
                <SubjectCard subjectProps={MOCK_SUBJECT_DATA} />
            </div>
        </div>
    );
}

export default function Page() {
    return (
        <Suspense fallback={<div>Loading academics...</div>}>
            <Academics />
        </Suspense>
    );
}