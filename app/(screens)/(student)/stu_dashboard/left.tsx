'use client'

import AcademicPerformance from "@/app/utils/AcademicPerformance";
import CardComponent from "@/app/utils/card";
import { BookOpen, Chalkboard, ClockAfternoon, UsersThree } from "@phosphor-icons/react";
import { FaChevronRight } from "react-icons/fa6";
import { useState, useEffect } from "react";
import MidExams from "./midExams";
import UserInfoCard from "@/app/utils/userInfoCardComp";
import LectureCard from "@/app/utils/lectureCard";
import SubjectProgressCards from "../../faculty/utils/subjectProgressCards";
import { fetchUpcomingClassesForStudent } from "@/lib/helpers/profile/calender/fetchUpcomingClassesForStudent";
import { fetchStudentContext } from "@/app/utils/context/student/studentContextAPI";
import { supabase } from "@/lib/supabaseClient";
import { useStudent } from "@/app/utils/context/student/useStudent";



const formatTimeToAMPM = (time24: string) => {
    const [h, m] = time24.split(":");
    let hour = Number(h);

    const period = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;

    return `${hour}:${m} ${period}`;
};


export default function StuDashLeft() {

    const [view, setView] = useState<"dashboard" | "exams">("dashboard");
    const [loadingLectures, setLoadingLectures] = useState(true);
    const [lectures, setLectures] = useState<any[]>([]);

    useEffect(() => {
        const loadUpcomingClasses = async () => {
            try {
                setLoadingLectures(true);

                const {
                    data: { user },
                } = await supabase.auth.getUser();

                if (!user) {
                    throw new Error("No auth user found");
                }

                const { data: userRow, error: userErr } = await supabase
                    .from("users")
                    .select("userId")
                    .eq("auth_id", user.id)
                    .single();

                if (userErr || !userRow) {
                    throw new Error("Internal user not found");
                }

                const internalUserId = userRow.userId;

                const studentContext = await fetchStudentContext(internalUserId);

                const data = await fetchUpcomingClassesForStudent({
                    collegeEducationId: studentContext.collegeEducationId,
                    collegeBranchId: studentContext.collegeBranchId,
                    collegeAcademicYearId: studentContext.collegeAcademicYearId,
                    collegeSemesterId: studentContext.collegeSemesterId,
                    collegeSectionId: studentContext.collegeSectionsId,
                });

                setLectures(data);
            } catch (err) {
                console.error("Failed to load classes", err);
            } finally {
                setLoadingLectures(false);
            }
        };

        loadUpcomingClasses();
    }, []);

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
    ];

    const subjects = [
        {
            title: "Data Structures and Algorithms",
            professor: "Prof. Ramesh Kumar",
            image: "dsa.jpg",
            percentage: 85,
            radialStart: "#10FD77",
            radialEnd: "#1C6B3F",
            remainingColor: "#A1FFCA",
        },
        {
            title: "Object-Oriented Programming",
            professor: "Prof. Anita Sharma",
            image: "oops.jpg",
            percentage: 85,
            radialStart: "#EFEDFF",
            radialEnd: "#705CFF",
            remainingColor: "#E8E4FF",
        },
        {
            title: "Computer Organization and Architecture",
            professor: "Prof. Suresh Reddy",
            image: "coa.jpg",
            percentage: 85,
            radialStart: "#FFFFFF",
            radialEnd: "#FFBE48",
            remainingColor: "#F7EBD5",
        },
        {
            title: "Discrete Mathematics",
            professor: "Prof. Rajesh Gupta",
            image: "dm.jpg",
            percentage: 85,
            radialStart: "#FEFFFF",
            radialEnd: "#008993",
            remainingColor: "#C4FBFF",
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
                            <SubjectProgressCards
                                props={subjects}
                            />
                            <div className="bg-red-400 h-64 rounded-lg w-[49%] shadow-md">
                                <div className="bg-white h-64 rounded-lg w-[100%] p-4 flex flex-col gap-2">
                                    <div className="flex justify-between items-center">
                                        <h6 className="text-[#282828] font-semibold">Upcoming Classes</h6>
                                        <FaChevronRight className="cursor-pointer text-black" />
                                    </div>
                                    <div className="overflow-y-auto">
                                        {loadingLectures ? (
                                            <div className="flex justify-center items-center h-[120px]">
                                                <div className="w-8 h-8 border-4 border-[#E8EAED] border-t-[#16284F] rounded-full animate-spin"></div>
                                            </div>
                                        ) : (
                                            lectures.map((lec) => (
                                                <LectureCard
                                                    key={lec.calendarEventId}
                                                    time={formatTimeToAMPM(lec.fromTime)}
                                                    title={lec.eventTitle}
                                                    professor={`Prof. ${lec.facultyName}`}
                                                    description={lec.eventTopic}
                                                />
                                            ))
                                        )}
                                        {/* {lectures.map((lec, index) => (
                                            <LectureCard
                                                key={index}
                                                time={lec.time}
                                                title={lec.title}
                                                professor={lec.professor}
                                        {/* />
                                        ))} */


                                        }
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