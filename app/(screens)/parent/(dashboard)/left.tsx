'use client'
import { UserInfoCard, UserInfoCardProps } from "../../faculty/utils/userInfoCard";
import AssignMentCard from "./cards/assignmentsCard";
import AttendanceCard from "./cards/attendanceCard";
import NextExamCard from "./cards/nextExamCard";
import AcademicPerformanceSmall from "./components/academicPerformanceSmall";
import FeeDueCard from "./cards/feeDueCard";
import SubjectProgressCards from "../../faculty/utils/subjectProgressCards";
import FacultyChat from "./cards/facultyChat";
import { useUser } from "@/app/utils/context/UserContext";


export default function ParentLeft() {
    const { fullName, gender, loading } = useUser();

    const parentImage =
        !loading && gender === "Female"
            ? "/parent-m.png"
            : !loading && gender === "Male"
                ? "/parent-d.png"
                : null;


    const card: UserInfoCardProps[] = [
        {
            show: true,
            studentId: 12,
            studentBranch: "CSE - 2nd Year",
            user: fullName ?? "User",
            studentName: "Deekshitha",
            childPerformance:
                "Your child’s academic performance and attendance summary are available below.",
            image: parentImage ?? undefined,
            imageHeight: 170,
            imageAlign: "center",
        },
    ];
    const data = [
        {
            month: "Jan",
            value: 100
        },
        {
            month: "Feb",
            value: 49,
        },
        {
            month: "Mar",
            value: 60
        },
        {
            month: "Apr",
            value: 92
        },
        {
            month: "May",
            value: 40
        },
        {
            month: "Jun",
            value: 99
        },
    ];

    const assignMent = [{
        completed: 8,
        total: 12,
        nextDate: "20/Nov/2025",
    }];

    const nextExam =
    {
        date: "21/Dec/2025",
        subject: "Cumputer Networks"
    }

    const feeDue = {
        totalFee: "75,000",
        feePaid: "45,000"
    }

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

    const chats = [
        {
            image: "/faculty.png",
            professor: "Ramesh Reddy",
            subject: "Date Structures"
        },
        {
            image: "/faculty.png",
            professor: "Ramu",
            subject: "Oops"
        },
        {
            image: "/faculty.png",
            professor: "Ashish",
            subject: "Discrete Mathematics"
        },
        {
            image: "/faculty.png",
            professor: "Shiva Prasad",
            subject: "Digital Electronics"
        },
    ];

    return (
        <>
            <div className="bg-blue-00 w-[68%] px-1">
                <UserInfoCard
                    cardProps={card}
                />
                <div className="bg-blue-00 w-full flex items-center justify-between mt-4 rounded-lg">
                    <AttendanceCard
                        percentage={92}
                        data={data}
                    />
                    <AssignMentCard
                        props={assignMent}
                    />
                    <NextExamCard
                        date={nextExam.date}
                        subject={nextExam.subject}
                    />
                </div>
                <div className="bg-blue-00 w-full lg:h-fit flex items-start justify-between mt-4">
                    <AcademicPerformanceSmall
                    />
                    <FeeDueCard
                        totalFee={feeDue.totalFee}
                        feePaid={feeDue.feePaid}
                    />
                </div>
                <div className="bg-blue-00 mt-4 flex justify-between">
                    <SubjectProgressCards
                        props={subjects}
                    />
                    <FacultyChat
                        props={chats}
                    />
                </div>
            </div>
        </>
    )
}