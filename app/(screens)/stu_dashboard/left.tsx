'use client'

import AcademicPerformance from "@/app/utils/AcademicPerformance";
import CardComponent from "@/app/utils/card";
import SubjectProgressCard from "@/app/utils/subProgressCard";
import { BookOpen, Chalkboard, ClockAfternoon, UsersThree } from "@phosphor-icons/react";
import UserInfoCard from "../../utils/userInfoCardComp";
import { FaChevronRight } from "react-icons/fa6";
import LectureCard from "../../utils/lectureCard";
import { useState } from "react";
import MidExams from "./midExams";

export default function StuDashLeft() {

    const [view, setView] = useState<"dashboard" | "exams">("dashboard");

    const cardData = [
        {
            style: "bg-[#E2DAFF] h-[126.35px] w-[182px]",
            icon: <Chalkboard size={32} weight="fill" color="#714EF2" />,
            value: "92%",
            label: "Attendance",
            to: "/attendance",
        },
        {
            style: "bg-[#FFEDDA] h-[126.35px] w-[182px]",
            icon: <UsersThree size={32} weight="fill" color="#FFBB70" />,
            value: "2 Due",
            label: "Assignments",
            to: "/assignments"
        },
        {
            style: "bg-[#E6FBEA] h-[126.35px] w-[182px]",
            icon: <BookOpen size={32} weight="fill" color="#74FF8F" />,
            value: "Mid Exams",
            label: "11/03/2025",
            onClick: () => setView("exams")
        },
        {
            style: "bg-[#CEE6FF] h-[126.35px] w-[182px]",
            icon: <ClockAfternoon size={32} weight="fill" color="#60AEFF" />,
            value: "Fee Due",
            label: "$5600",
            to: "/payments"
        }
    ]

    const lectures = [
        {
            time: "10:30 AM",
            title: "Java Programming",
            professor: "Prof. Ramesh Kumar",
            description: "We’ll cover classes, objects, and inheritance with examples.",
        },
        {
            time: "12:00 PM",
            title: "Data Structures",
            professor: "Prof. Anita Sharma",
            description: "Introduction to arrays, linked lists, and stacks.",
        },
        {
            time: "02:00 PM",
            title: "Operating Systems",
            professor: "Prof. Suresh Reddy",
            description: "Processes, threads, and memory management explained.",
        },
        {
            time: "03:30 PM",
            title: "DBMS",
            professor: "Prof. Rajesh Gupta",
            description: "SQL queries, normalization, and transactions.",
        },
    ];

    return (
        <>
            <div className="w-[68%] p-2">
                {view === "dashboard" ? (
                    <>
                        <UserInfoCard />
                        <div className="mt-5 rounded-lg flex gap-3 text-xs">
                            {cardData.map((item, index) => (
                                <CardComponent
                                    key={index}
                                    style={item.style}
                                    icon={item.icon}
                                    value={item.value}
                                    label={item.label}
                                    to={item.to}
                                    onClick={item.onClick}
                                />
                            ))}
                        </div>
                        <div className="mt-5">
                            <AcademicPerformance />
                        </div>
                        <div className="mt-5 flex items-center justify-between rounded-lg">
                            <div className="bg-white h-64 rounded-lg w-[49%] p-4 shadow-md flex flex-col gap-2">
                                <div className="flex justify-between items-center">
                                    <h6 className="text-[#282828] font-semibold">Subjects Progress</h6>
                                    <FaChevronRight className="cursor-pointer text-black" />
                                </div>
                                <SubjectProgressCard />
                            </div>
                            <div className="bg-red-400 h-64 rounded-lg w-[49%] shadow-md">
                                <div className="bg-white h-64 rounded-lg w-[100%] p-4 flex flex-col gap-2">
                                    <div className="flex justify-between items-center">
                                        <h6 className="text-[#282828] font-semibold">Upcoming Classes</h6>
                                        <FaChevronRight className="cursor-pointer text-black" />
                                    </div>
                                    <div className="overflow-y-auto">
                                        {lectures.map((lec, index) => (
                                            <LectureCard
                                                key={index}
                                                time={lec.time}
                                                title={lec.title}
                                                professor={lec.professor}
                                                description={lec.description}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <MidExams
                        onBack={() => setView("dashboard")}
                    />
                )}
            </div >
        </>
    )
}