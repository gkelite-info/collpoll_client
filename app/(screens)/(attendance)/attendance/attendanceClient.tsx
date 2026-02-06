"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import CardComponent from "@/app/utils/card";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import AttendanceInsight from "@/app/utils/insightChart";
import SemesterAttendanceCard from "@/app/utils/seminsterAttendanceCard";
import Table from "@/app/utils/table";
import { Chalkboard, FilePdf, UsersThree } from "@phosphor-icons/react";

import WorkWeekCalendar from "@/app/utils/workWeekCalendar";
import SubjectAttendance from "../../(attendance)/subject-attendance/page";
import SubjectAttendanceDetails from "../../(attendance)/subject-attendance-details/page";
import { useUser } from "@/app/utils/context/UserContext";

import {
  DashboardSkeleton,
  TableSkeleton,
} from "../shimmer/attendanceDashSkeleton";
import { getStudentDashboardData } from "@/lib/helpers/student/attendance/studentAttendanceActions";

interface TableRow {
  Subject: string;
  Faculty: string;
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
  "Faculty",
  "Today's Status",
  "Class Attendance",
  "Percentage %",
  "Notes",
];

const STATUS_COLOR_CLASS: Record<string, string> = {
  Present: "text-green-600",
  Late: "text-yellow-600",
  Absent: "text-red-600",
  Leave: "text-blue-600",
  "Class Cancel": "text-gray-600",
};


function formatAttendanceStatus(status: string) {
  return status
    .toLowerCase()              // class_cancel
    .replace(/_/g, " ")         // class cancel
    .replace(/\b\w/g, c => c.toUpperCase()); // Class Cancel
}


export default function AttendanceClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { userId, loading: userLoading } = useUser();

  const tab = searchParams.get("tab");
  const showSubjectAttendanceTable = tab === "subject-attendance";
  const showSubjectAttendanceDetails = tab === "subject-attendance-details";
  const hideRightSection =
    showSubjectAttendanceTable || showSubjectAttendanceDetails;

  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);

  const [viewDate, setViewDate] = useState<Date>(new Date());


  useEffect(() => {
    console.log("🔁 Attendance useEffect triggered", {
      userId,
      userLoading,
      viewDate,
    });

    // 1️⃣ Wait until user context is ready
    if (userLoading) {
      console.log("⏳ User context still loading...");
      return;
    }

    // 2️⃣ Guard: user not logged in
    if (!userId) {
      console.warn("❌ No User ID found: Student not logged in");
      setLoading(false);
      return;
    }

    let isMounted = true;

    async function fetchData() {
      try {
        setLoading(true);

        // 3️⃣ Convert selected date → YYYY-MM-DD (local date)
        const year = viewDate.getFullYear();
        const month = String(viewDate.getMonth() + 1).padStart(2, "0");
        const day = String(viewDate.getDate()).padStart(2, "0");
        const dateStr = `${year}-${month}-${day}`;

        console.log("📅 Fetching attendance dashboard for date:", dateStr);

        // 4️⃣ Call helper (ALL business logic lives there)
        if (!userId) {
          console.warn("⚠️ User ID became null before helper call");
          setLoading(false);
          return;
        }

        const safeUserId = userId;
        console.log("👤 Using safeUserId for dashboard fetch:", safeUserId);

        const data = await getStudentDashboardData(safeUserId, dateStr);

        console.log("✅ Dashboard data received:", {
          cards: data?.cards,
          semesterStats: data?.semesterStats,
          tableDataLength: data?.tableData?.length,
        });

        // 5️⃣ Update state only if component is still mounted
        if (isMounted) {
          setDashboardData(data);
          console.log("🧠 Dashboard state updated");
        }
      } catch (err) {
        console.error("🔥 Failed to fetch attendance dashboard", err);
      } finally {
        if (isMounted) {
          setLoading(false);
          console.log("✅ Attendance dashboard loading finished");
        }
      }
    }

    fetchData();

    // 6️⃣ Cleanup to avoid state update on unmounted component
    return () => {
      console.log("🧹 Attendance useEffect cleanup");
      isMounted = false;
    };
  }, [userId, userLoading, viewDate]);

  const handleCardClick = (cardId: number) => {
    if (cardId === 2) {
      router.push(`/attendance?tab=subject-attendance`);
    }
  };



  const tableRows: TableRow[] =
    dashboardData?.tableData?.map((row: any) => ({
      Subject: row.subject,
      Faculty: row.faculty,
      "Today's Status": formatAttendanceStatus(row.status),
      "Class Attendance": row.classAttendance,
      "Percentage %": row.percentage,
      Notes: <FilePdf size={17} />,
    })) || [];

  const dynamicCards: CardItem[] = [
    {
      id: 1,
      icon: <UsersThree size={32} />,
      value: dashboardData
        ? `${dashboardData.todayStats.attended}/${dashboardData.todayStats.total}`
        : "0/0",
      label: "Today Total Classes",
      style: "bg-[#FFEDDA] w-44",
      iconBgColor: "#FFBB70",
      iconColor: "#EFEFEF",
    },
    {
      id: 2,
      icon: <Chalkboard size={32} />,
      value: dashboardData
        ? `${dashboardData.cards.attended}/${dashboardData.cards.totalClasses}`
        : "0/0",
      label: "Semester wise Attendance",
      style: "bg-[#CEE6FF] w-44",
      iconBgColor: "#7764FF",
      iconColor: "#EFEFEF",
      totalPercentage: dashboardData
        ? `${dashboardData.cards.percentage}%`
        : "0%",
    },
  ];

  if (userLoading) {
    return (
      //   <div className="p-10 text-center text-gray-500">Loading Dashboard...</div>
      <DashboardSkeleton />
    );
  }

  //   if (true) {
  //     return (
  //       //   <div className="p-10 text-center text-gray-500">Loading Dashboard...</div>
  //       <DashboardSkeleton />
  //     );
  //   }

  if (!dashboardData) {
    return (
      <div className="flex flex-col items-center justify-center p-10 text-center space-y-2">
        <div className="text-red-500 text-lg font-bold">
          Student Record Not Found
        </div>
        <p className="text-gray-500 text-sm">
          We could not find a student profile linked to User ID:{" "}
          <strong>{userId}</strong>.
        </p>
        <p className="text-gray-400 text-xs">
          Please contact your administrator.
        </p>
      </div>
    );
  }

  // Helper to format title date
  const formattedDate = viewDate.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  // Check if selected date is today
  const isToday = viewDate.toDateString() === new Date().toDateString();

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
                {dynamicCards.map((card, index) => (
                  <div key={card.id}>
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
                      onClick={() => handleCardClick(card.id)}
                    />
                  </div>
                ))}
                <SemesterAttendanceCard
                  presentPercent={dashboardData?.semesterStats.present || 0}
                  absentPercent={dashboardData?.semesterStats.absent || 0}
                  latePercent={dashboardData?.semesterStats.late || 0}
                  overallPercent={
                    (dashboardData?.semesterStats.present || 0) +
                    (dashboardData?.semesterStats.late || 0)
                  }
                />

              </div>

              <div className="bg-red-00 flex flex-col">
                <h5 className="text-[#282828] font-medium text-md">
                  {isToday
                    ? "Today’s Attendance"
                    : `Attendance – ${formattedDate}`}
                </h5>
                <p className="text-[#282828] text-sm">
                  Classes on {formattedDate}
                </p>
                {loading ? (
                  <div className=" mt-5">
                    <TableSkeleton />
                  </div>
                ) : (
                  <>
                    <Table columns={columns} data={tableRows} />

                    {tableRows.length === 0 && (
                      <p className="text-gray-400 italic text-sm mt-4 text-center border p-4 rounded-lg">
                        No classes scheduled for {formattedDate}.
                      </p>
                    )}
                  </>
                )}
              </div>
            </>
          )}

          {showSubjectAttendanceTable && <SubjectAttendance />}
          {showSubjectAttendanceDetails && <SubjectAttendanceDetails />}
        </div>

        {!hideRightSection && (
          <div className="w-[32%] flex flex-col gap-1.5 p-3">
            <CourseScheduleCard />

            <WorkWeekCalendar
              activeDate={viewDate}
              onDateSelect={setViewDate}
            />

            <div className="mt-5">
              <AttendanceInsight
                weeklyData={dashboardData?.weeklyData || [0, 0, 0, 0, 0, 0, 0]}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
