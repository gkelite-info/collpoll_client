'use client'

import AcademicPerformance from "@/app/utils/AcademicPerformance";
import CardComponent from "@/app/utils/card";
import { BookOpen, Chalkboard, ClockAfternoon, UsersThree } from "@phosphor-icons/react";
import { FaChevronRight } from "react-icons/fa6";
import { useState, useEffect } from "react";
import MidExams from "./midExams";
import UserInfoCard from "@/app/utils/userInfoCardComp";
import LectureCard from "@/app/utils/lectureCard";
import SubjectProgressCards from "../../faculty/utils/subjectProgressCard/subjectProgressCards";
import { fetchUpcomingClassesForStudent } from "@/lib/helpers/profile/calender/fetchUpcomingClassesForStudent";
import { fetchStudentContext } from "@/app/utils/context/student/studentContextAPI";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { fetchAssignmentsForStudent } from "@/lib/helpers/student/assignments/assignmentsAPI";
import { getStudentDashboardData } from "@/lib/helpers/student/attendance/studentAttendanceActions";
import { ValueShimmer } from "@/app/components/shimmers/valueShimmer";
import { fetchStudentFeePlan } from "@/lib/helpers/student/payments/fetchStudentFeePlan";
import { fetchSubjects } from "@/lib/helpers/admin/academics/academicDropdowns";
import { Loader } from "../calendar/right/timetable";

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
    const router = useRouter();
    const [dueAssignmentsCount, setDueAssignmentsCount] = useState(0);
    const [attendancePercent, setAttendancePercent] = useState<number | null>(null);
    const [assignmentsLoading, setAssignmentsLoading] = useState(true);
    const [pendingFeeAmount, setPendingFeeAmount] = useState<number | null>(null);
    const [feeLoading, setFeeLoading] = useState(true);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [subjectsLoading, setSubjectsLoading] = useState(true);

    useEffect(() => {
        loadUpcomingClasses();
        loadAssignmentCount();
        loadAttendancePercent();
        loadPendingFee();
        loadSubjects();
    }, []);

    const loadSubjects = async () => {
        try {
            setSubjectsLoading(true);

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: userRow } = await supabase
                .from("users")
                .select("userId")
                .eq("auth_id", user.id)
                .single();
            if (!userRow) return;

            const studentContext = await fetchStudentContext(userRow.userId);

            const today = new Date().toISOString().split("T")[0];
            const attendanceRes = await getStudentDashboardData(
                userRow.userId,
                today,
                1,
                1,
                studentContext.collegeEducationType === "Inter"
            );

            const attendanceBySubject = attendanceRes?.subjectWiseAttendance ?? [];

            const subjectData = await fetchSubjects(
                studentContext.collegeId,
                studentContext.collegeEducationId,
                studentContext.collegeBranchId,
                studentContext.collegeAcademicYearId,
                studentContext.collegeSemesterId
            );

            const mappedSubjects = subjectData.map((sub: any) => {
                const attendance = attendanceBySubject.find(
                    (row: any) => row.subjectName === sub.subjectName
                );

                return {
                    title: sub.subjectName,
                    professor: "Faculty Assigned",
                    image: "/subject-default.png",
                    percentage: attendance?.percentage ?? 0,
                    radialStart: "#10FD77",
                    radialEnd: "#1C6B3F",
                    remainingColor: "#A1FFCA",
                };
            });


            setSubjects(mappedSubjects);
        } catch (err) {
            console.error("Failed to load subjects", err);
        } finally {
            setSubjectsLoading(false);
        }
    };

    const loadPendingFee = async () => {
        try {
            setFeeLoading(true);

            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) return;

            const { data: userRow } = await supabase
                .from("users")
                .select("userId")
                .eq("auth_id", user.id)
                .single();
            if (!userRow) return;

            const plan = await fetchStudentFeePlan(userRow.userId);

            setPendingFeeAmount(plan?.pendingAmount ?? 0);
        } catch (err) {
            console.error("Failed to load pending fee", err);
        } finally {
            setFeeLoading(false);
        }
    };

    const loadAttendancePercent = async () => {
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        const { data: userRow } = await supabase
            .from("users")
            .select("userId")
            .eq("auth_id", user.id)
            .single();

        if (!userRow) return;

        const studentContext = await fetchStudentContext(userRow.userId);

        const today = new Date().toISOString().split("T")[0];

        const res = await getStudentDashboardData(
            userRow.userId,
            today,
            1,
            1,
            studentContext.collegeEducationType === "Inter"
        );

        setAttendancePercent(res?.cards?.percentage ?? 0);
    };

    const loadAssignmentCount = async () => {
        try {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) return;

            const { data: userRow } = await supabase
                .from("users")
                .select("userId")
                .eq("auth_id", user.id)
                .single();

            if (!userRow) return;

            const studentContext = await fetchStudentContext(userRow.userId);

            const res = await fetchAssignmentsForStudent(
                {
                    collegeBranchId: studentContext.collegeBranchId,
                    collegeAcademicYearId: studentContext.collegeAcademicYearId,
                    collegeSectionsId: studentContext.collegeSectionsId,
                },
                1,
                1,
                "active"
            );

            if (res.success) {
                setDueAssignmentsCount(res.totalCount);
            }
        } catch (err) {
            console.error("Failed to load assignment count", err);
        }
        finally {
            setAssignmentsLoading(false);
        }
    };

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

    const cardData = [
        {
            style: "bg-[#E2DAFF] h-[126.35px] w-[182px]",
            icon: <Chalkboard size={32} weight="fill" color="#714EF2" />,
            value: attendancePercent === null ? (
                <ValueShimmer />
            ) : (
                `${attendancePercent}%`
            ),
            label: "Attendance",
            to: "/attendance",
        },
        {
            style: "bg-[#FFEDDA] h-[126.35px] w-[182px]",
            icon: <UsersThree size={32} weight="fill" color="#FFBB70" />,
            value: assignmentsLoading ? (
                <ValueShimmer />
            ) : (
                `${dueAssignmentsCount} Due`
            ),
            label: "Assignments",
            to: "/assignments",
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
            value: feeLoading ? (
                <ValueShimmer />
            ) : (
                `₹${pendingFeeAmount?.toLocaleString("en-IN")}`
            ),
            label: "Fee Due",
            to: "/payments"
        }
    ];

    const subjectss = [
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

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();

        return `${day}-${month}-${year}`;
    };

    const handleUpcomingClasses = () => {
        router.push('/calendar');
        return
    };

    const handleSubjectProgress = () => {
        router.push('/academics');
        return
    }

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
                                props={subjectsLoading ? [] : subjects}
                                isLoading={subjectsLoading}
                                onViewMore={handleSubjectProgress}
                            />
                            <div className="bg-red-400 h-64 rounded-lg w-[49%] shadow-md">
                                <div className="bg-white h-64 rounded-lg w-[100%] p-4 flex flex-col gap-2">
                                    <div className="flex justify-between items-center">
                                        <h6 className="text-[#282828] font-semibold">Upcoming Classes</h6>
                                        <FaChevronRight className="cursor-pointer text-black"
                                            onClick={handleUpcomingClasses}
                                        />
                                    </div>
                                    <div className="overflow-y-auto">
                                        {loadingLectures ? (
                                            <div className="flex justify-center items-center h-[120px]">
                                                <div className="w-8 h-8 border-4 border-[#E8EAED] border-t-[#16284F] rounded-full animate-spin"></div>
                                            </div>
                                        ) : lectures.length === 0 ? (
                                            <div className="bg-red-00 min-h-[25vh] flex items-center justify-center">
                                                <p className="text-[#282828] text-sm">No classes yet..</p>
                                            </div>
                                        ) : (
                                            lectures.map((lec) => (
                                                <LectureCard
                                                    key={lec.calendarEventId}
                                                    time={`${formatTimeToAMPM(lec.fromTime)}\n-\n${formatTimeToAMPM(lec.toTime)}`}
                                                    title={lec.eventTitle}
                                                    professor={`Prof. ${lec.facultyName}`}
                                                    description={`${lec.eventTopic} • ${formatDate(lec.date)}`}
                                                    status={lec.isCancelled ? "Class Cancel" : ""}
                                                />
                                            ))
                                        )}
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