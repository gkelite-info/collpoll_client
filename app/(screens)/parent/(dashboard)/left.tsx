'use client'
import { UserInfoCard } from "../../faculty/utils/userInfoCard";
import AttendanceCard from "./cards/attendanceCard";


export default function ParentLeft() {

    const card = [{
        show: true,
        studentId: 12,
        studentBranch: "CSE - 2nd Year",
        user: "Mr. Janardhan",
        studentName: "Deekshitha",
        childPerformance: "Your child’s academic performance and attendance summary are available below.",
        image: "../../../male-parent.png",
    }]

    return (
        <>
            <div className="bg-blue-00 w-[68%] px-1">
                <UserInfoCard
                    cardProps={card}
                />
                <div className="bg-blue-00 w-full flex items-center mt-4 rounded-lg">
                    <AttendanceCard
                        percentage={92}
                    />
                </div>
            </div>
        </>
    )
}