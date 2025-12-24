"use client";

import { useRouter, useSearchParams } from "next/navigation";
import CardComponent from "@/app/utils/card";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import AttendanceInsight from "@/app/utils/insightChart";
import SemesterAttendanceCard from "@/app/utils/seminsterAttendanceCard";
import Table from "@/app/utils/table";
import { Chalkboard, FilePdf, UsersThree } from "@phosphor-icons/react";

import WorkWeekCalendar from "@/app/utils/workWeekCalendar";
import ParentSubjectAttendance from "./subject-attendance/page";
import ParentSubjectAttendanceDetails from "./subject-attendance-details/page";

interface TableRow {
    Subject: string;
    "Today's Status": string;
    "Class Attendance": string;
    "Percentage %": string;
    Notes: React.ReactNode;
}

interface CardItem {
    id: number;
    icon: React.ReactNode;
    value: string | number;
    label: string;
    style?: string;
    iconBgColor?: string;
    iconColor?: string;
    underlineValue?: boolean;
    totalPercentage?: string | number;
}

const columns = [
    "Subject",
    "Today's Status",
    "Class Attendance",
    "Percentage %",
    "Notes",
];

const data: TableRow[] = [
    {
        Subject: "Data Structures",
        "Today's Status": "Present",
        "Class Attendance": "08/10",
        "Percentage %": "80%",
        Notes: <FilePdf size={32} />,
    },
    {
        Subject: "OOPs using C++",
        "Today's Status": "Present",
        "Class Attendance": "07/10",
        "Percentage %": "70%",
        Notes: <FilePdf size={32} />,
    },
    {
        Subject: "Analog and Digital Electronics",
        "Today's Status": "Present",
        "Class Attendance": "08/10",
        "Percentage %": "80%",
        Notes: <FilePdf size={32} />,
    },
    {
        Subject: "Algorithms",
        "Today's Status": "Absent",
        "Class Attendance": "06/10",
        "Percentage %": "60%",
        Notes: <FilePdf size={32} />,
    },
    {
        Subject: "Operating Systems",
        "Today's Status": "Present",
        "Class Attendance": "09/12",
        "Percentage %": "75%",
        Notes: <FilePdf size={32} />,
    },
    {
        Subject: "Database Management",
        "Today's Status": "Present",
        "Class Attendance": "10/10",
        "Percentage %": "100%",
        Notes: <FilePdf size={32} />,
    },
    {
        Subject: "Computer Networks",
        "Today's Status": "Late",
        "Class Attendance": "07/10",
        "Percentage %": "70%",
        Notes: <FilePdf size={32} />,
    },
    {
        Subject: "Discrete Mathematics",
        "Today's Status": "Present",
        "Class Attendance": "09/10",
        "Percentage %": "90%",
        Notes: <FilePdf size={32} />,
    },
];

const cards: CardItem[] = [
    {
        id: 1,
        icon: <UsersThree size={32} />,
        value: "8/10",
        label: "Total Classes",
        style: "bg-[#FFEDDA] w-44",
        iconBgColor: "#FFBB70",
        iconColor: "#EFEFEF",
    },
    {
        id: 2,
        icon: <Chalkboard size={32} />,
        value: "220/250",
        label: "Semester wise Classes",
        style: "bg-[#CEE6FF] w-44",
        iconBgColor: "#7764FF",
        iconColor: "#EFEFEF",
        totalPercentage: "85%",
    },
];

export default function ParentAttendanceClient() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const tab = searchParams.get("tab");
    const showSubjectAttendanceTable = tab === "subject-attendance";
    const showSubjectAttendanceDetails = tab === "subject-attendance-details";

    const hideRightSection =
        showSubjectAttendanceTable || showSubjectAttendanceDetails;

    const handleCardClick = (cardId: number) => {
        if (cardId === 2) {
            router.push(`/parent/attendance?tab=subject-attendance`);
        }
    };

    return (
        <>
            <div className="bg-red-00 flex w-full h-fit p-2">
                <div
                    className={`flex flex-col gap-2 ${hideRightSection ? "w-full" : "w-[68%]"
                        }`}
                >
                    {!showSubjectAttendanceTable && !showSubjectAttendanceDetails && (
                        <>
                            <div className="mb-5">
                                <h1 className="text-[#282828] font-bold text-2xl mb-1">
                                    Attendance
                                </h1>
                                <p className="text-[#282828]">
                                    Track, Manage, and Maintain Your Attendance Effortlessly
                                </p>
                            </div>

                            <div className="flex gap-4 flex-wrap">
                                {cards.map((card, index) => (
                                    <div key={card.id} onClick={() => handleCardClick(card.id)}>
                                        <CardComponent
                                            key={index}
                                            style={card.style}
                                            icon={card.icon}
                                            value={card.value}
                                            label={card.label}
                                            iconBgColor={card.iconBgColor}
                                            iconColor={card.iconColor}
                                            underlineValue={card.underlineValue}
                                            totalPercentage={card.totalPercentage}
                                        />
                                    </div>
                                ))}
                                <SemesterAttendanceCard
                                    presentPercent={80}
                                    absentPercent={15}
                                    latePercent={5}
                                    overallPercent={85}
                                />
                            </div>
                            <div className="bg-red-00 flex flex-col">
                                <h5 className="text-[#282828] font-medium text-md">Today’s Attendance</h5>
                                <p className="text-[#282828] text-sm">Today’s Classes – 6th Nov 2025</p>
                                <Table columns={columns} data={data} />
                            </div>
                        </>
                    )}

                    {showSubjectAttendanceTable && <ParentSubjectAttendance />}
                    {showSubjectAttendanceDetails && <ParentSubjectAttendanceDetails />}
                </div>

                {!hideRightSection && (
                    <div className="w-[32%] flex flex-col gap-1.5 p-3">
                        <CourseScheduleCard />
                        <WorkWeekCalendar />
                        <div className="mt-5">
                            <AttendanceInsight weeklyData={[80, 70, 90, 50, 30, 85, 62]} />
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
