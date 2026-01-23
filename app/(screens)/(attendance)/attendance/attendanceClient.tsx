// "use client";

// import { useRouter, useSearchParams } from "next/navigation";
// import CardComponent from "@/app/utils/card";
// import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
// import AttendanceInsight from "@/app/utils/insightChart";
// import SemesterAttendanceCard from "@/app/utils/seminsterAttendanceCard";
// import Table from "@/app/utils/table";
// import { Chalkboard, FilePdf, UsersThree } from "@phosphor-icons/react";

// import WorkWeekCalendar from "@/app/utils/workWeekCalendar";
// import SubjectAttendance from "../../(attendance)/subject-attendance/page";
// import SubjectAttendanceDetails from "../../(attendance)/subject-attendance-details/page";

// interface TableRow {
//     Subject: string;
//     "Today's Status": string;
//     "Class Attendance": string;
//     "Percentage %": string;
//     Notes: React.ReactNode;
// }

// interface CardItem {
//     id: number;
//     icon: React.ReactNode;
//     value: string | number;
//     label: string;
//     style?: string;
//     iconBgColor?: string;
//     iconColor?: string;
//     underlineValue?: boolean;
//     totalPercentage?: string | number;
// }

// const columns = [
//     "Subject",
//     "Today's Status",
//     "Class Attendance",
//     "Percentage %",
//     "Notes",
// ];

// const data: TableRow[] = [
//     {
//         Subject: "Data Structures",
//         "Today's Status": "Present",
//         "Class Attendance": "08/10",
//         "Percentage %": "80%",
//         Notes: <FilePdf size={32} />,
//     },
//     {
//         Subject: "OOPs using C++",
//         "Today's Status": "Present",
//         "Class Attendance": "07/10",
//         "Percentage %": "70%",
//         Notes: <FilePdf size={32} />,
//     },
//     {
//         Subject: "Data Structures",
//         "Today's Status": "Present",
//         "Class Attendance": "08/10",
//         "Percentage %": "80%",
//         Notes: <FilePdf size={32} />,
//     },
//     {
//         Subject: "Algorithms",
//         "Today's Status": "Absent",
//         "Class Attendance": "06/10",
//         "Percentage %": "60%",
//         Notes: <FilePdf size={32} />,
//     },
//     {
//         Subject: "Operating Systems",
//         "Today's Status": "Present",
//         "Class Attendance": "09/12",
//         "Percentage %": "75%",
//         Notes: <FilePdf size={32} />,
//     },
//     {
//         Subject: "Database Management",
//         "Today's Status": "Present",
//         "Class Attendance": "10/10",
//         "Percentage %": "100%",
//         Notes: <FilePdf size={32} />,
//     },
//     {
//         Subject: "Computer Networks",
//         "Today's Status": "Late",
//         "Class Attendance": "07/10",
//         "Percentage %": "70%",
//         Notes: <FilePdf size={32} />,
//     },
//     {
//         Subject: "Discrete Mathematics",
//         "Today's Status": "Present",
//         "Class Attendance": "09/10",
//         "Percentage %": "90%",
//         Notes: <FilePdf size={32} />,
//     },
// ];

// const cards: CardItem[] = [
//     {
//         id: 1,
//         icon: <UsersThree size={32} />,
//         value: "8/10",
//         label: "Total Classes",
//         style: "bg-[#FFEDDA] w-44",
//         iconBgColor: "#FFBB70",
//         iconColor: "#EFEFEF",
//     },
//     {
//         id: 2,
//         icon: <Chalkboard size={32} />,
//         value: "220/250",
//         label: "Semester wise Classes",
//         style: "bg-[#CEE6FF] w-44",
//         iconBgColor: "#7764FF",
//         iconColor: "#EFEFEF",
//         totalPercentage: "85%",
//     },
// ];

// export default function AttendanceClient() {
//     const searchParams = useSearchParams();
//     const router = useRouter();

//     const tab = searchParams.get("tab");

//     const showSubjectAttendanceTable = tab === "subject-attendance";
//     const showSubjectAttendanceDetails = tab === "subject-attendance-details";

//     const hideRightSection =
//         showSubjectAttendanceTable || showSubjectAttendanceDetails;

//     const handleCardClick = (cardId: number) => {
//         if (cardId === 2) {
//             router.push(`/attendance?tab=subject-attendance`);
//         }
//     };

//     return (
//         <>
//             <div className="bg-red-00 flex w-full h-fit p-2">
//                 <div
//                     className={`flex flex-col gap-2 ${hideRightSection ? "w-full" : "w-[68%]"
//                         }`}
//                 >
//                     {!showSubjectAttendanceTable && !showSubjectAttendanceDetails && (
//                         <>
//                             <div className="mb-5">
//                                 <h1 className="text-[#282828] font-bold text-2xl mb-1">
//                                     Attendance
//                                 </h1>
//                                 <p className="text-[#282828]">
//                                     Track, Manage, and Maintain Your Attendance Effortlessly
//                                 </p>
//                             </div>

//                             <div className="flex gap-4 flex-wrap">
//                                 {cards.map((card, index) => (
//                                     <div key={card.id}>
//                                         <CardComponent
//                                             key={index}
//                                             style={card.style}
//                                             icon={card.icon}
//                                             value={card.value}
//                                             label={card.label}
//                                             iconBgColor={card.iconBgColor}
//                                             iconColor={card.iconColor}
//                                             underlineValue={card.underlineValue}
//                                             totalPercentage={card.totalPercentage}
//                                             onClick={() => handleCardClick(card.id)}
//                                         />
//                                     </div>
//                                 ))}
//                                 <SemesterAttendanceCard
//                                     presentPercent={80}
//                                     absentPercent={15}
//                                     latePercent={5}
//                                     overallPercent={85}
//                                 />
//                             </div>
//                             <div className="bg-red-00 flex flex-col">
//                                 <h5 className="text-[#282828] font-medium text-md">Today’s Attendance</h5>
//                                 <p className="text-[#282828] text-sm">Today’s Classes – 6th Nov 2025</p>
//                                 <Table columns={columns} data={data} />
//                             </div>
//                         </>
//                     )}

//                     {showSubjectAttendanceTable && <SubjectAttendance />}
//                     {showSubjectAttendanceDetails && <SubjectAttendanceDetails />}
//                 </div>

//                 {!hideRightSection && (
//                     <div className="w-[32%] flex flex-col gap-1.5 p-3">
//                         <CourseScheduleCard />
//                         <WorkWeekCalendar />
//                         <div className="mt-5">
//                             <AttendanceInsight weeklyData={[80, 70, 90, 50, 30, 85, 62]} />
//                         </div>
//                     </div>
//                 )}
//             </div>
//         </>
//     );
// }

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
import { getStudentDashboardData } from "@/lib/helpers/attendance/studentAtendanceActions";
import {
  DashboardSkeleton,
  TableSkeleton,
} from "../shimmer/attendanceDashSkeleton";

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
  "Daily Status",
  "Class Attendance",
  "Percentage %",
  "Notes",
];

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
    if (userLoading) return;
    if (!userId) {
      console.warn("No User ID found: Student not logged in");
      setLoading(false);
      return;
    }

    let isMounted = true;

    async function fetchData() {
      try {
        setLoading(true);

        // 2. Convert date to YYYY-MM-DD (local time)
        const year = viewDate.getFullYear();
        const month = String(viewDate.getMonth() + 1).padStart(2, "0");
        const day = String(viewDate.getDate()).padStart(2, "0");
        const dateStr = `${year}-${month}-${day}`;

        // 3. Pass dateStr to server action
        const data = await getStudentDashboardData(userId!, dateStr);

        if (isMounted) {
          setDashboardData(data);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [userId, userLoading, viewDate]); // 4. Add viewDate to dependencies

  const handleCardClick = (cardId: number) => {
    if (cardId === 2) {
      router.push(`/attendance?tab=subject-attendance`);
    }
  };

  const tableRows: TableRow[] =
    dashboardData?.tableData?.map((row: any) => ({
      Subject: row.subject,
      "Today's Status": row.status,
      "Class Attendance": row.classAttendance,
      "Percentage %": row.percentage,
      Notes: <FilePdf size={32} />,
    })) || [];

  const dynamicCards: CardItem[] = [
    {
      id: 1,
      icon: <UsersThree size={32} />,
      value: dashboardData
        ? `${dashboardData.cards.attended}/${dashboardData.cards.totalClasses}`
        : "0/0",
      label: "Total Classes Attended",
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
      label: "Semester wise Classes",
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
          className={`flex flex-col gap-2 ${
            hideRightSection ? "w-full" : "w-[68%]"
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
                  overallPercent={dashboardData?.cards.percentage || 0}
                />
              </div>

              <div className="bg-red-00 flex flex-col">
                {/* 5. Update Title to reflect date */}
                <h5 className="text-[#282828] font-medium text-md">
                  {isToday
                    ? "Today’s Attendance"
                    : `Attendance – ${formattedDate}`}
                </h5>
                <p className="text-[#282828] text-sm">
                  Classes on {formattedDate}
                </p>
                {loading ? (
                  <div className="mt-5">
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
