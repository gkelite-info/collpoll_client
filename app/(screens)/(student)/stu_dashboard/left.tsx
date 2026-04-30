// "use client";

// import AcademicPerformance from "@/app/utils/AcademicPerformance";
// import CardComponent from "@/app/utils/card";
// import {
//   BookOpen,
//   Chalkboard,
//   ClockAfternoon,
//   UsersThree,
// } from "@phosphor-icons/react";
// import { FaChevronRight } from "react-icons/fa6";
// import { useState, useEffect } from "react";
// import MidExams from "./midExams";
// import UserInfoCard from "@/app/utils/userInfoCardComp";
// import LectureCard from "@/app/utils/lectureCard";
// import SubjectProgressCards from "../../faculty/utils/subjectProgressCard/subjectProgressCards";
// import { fetchUpcomingClassesForStudent } from "@/lib/helpers/profile/calender/fetchUpcomingClassesForStudent";
// import { fetchStudentContext } from "@/app/utils/context/student/studentContextAPI";
// import { supabase } from "@/lib/supabaseClient";
// import { useRouter } from "next/navigation";
// import { fetchAssignmentsForStudent } from "@/lib/helpers/student/assignments/assignmentsAPI";
// import { getStudentDashboardData } from "@/lib/helpers/student/attendance/studentAttendanceActions";
// import { ValueShimmer } from "@/app/components/shimmers/valueShimmer";
// import { fetchStudentFeePlan } from "@/lib/helpers/student/payments/fetchStudentFeePlan";
// import { Loader } from "../calendar/right/timetable";

// const formatTimeToAMPM = (time24: string) => {
//   const [h, m] = time24.split(":");
//   let hour = Number(h);

//   const period = hour >= 12 ? "PM" : "AM";
//   hour = hour % 12 || 12;

//   return `${hour}:${m} ${period}`;
// };

// export default function StuDashLeft() {
//   const [view, setView] = useState<"dashboard" | "exams">("dashboard");
//   const [loadingLectures, setLoadingLectures] = useState(true);
//   const [lectures, setLectures] = useState<any[]>([]);
//   const router = useRouter();
//   const [dueAssignmentsCount, setDueAssignmentsCount] = useState(0);
//   const [attendancePercent, setAttendancePercent] = useState<number | null>(
//     null,
//   );
//   const [assignmentsLoading, setAssignmentsLoading] = useState(true);
//   const [pendingFeeAmount, setPendingFeeAmount] = useState<number | null>(null);
//   const [feeLoading, setFeeLoading] = useState(true);
//   const [subjects, setSubjects] = useState<any[]>([]);
//   const [subjectsLoading, setSubjectsLoading] = useState(true);

//   useEffect(() => {
//     loadUpcomingClasses();
//     loadAssignmentCount();
//     loadAttendancePercent();
//     loadPendingFee();
//     loadSubjects();
//   }, []);

//   const loadSubjects = async () => {
//     try {
//       setSubjectsLoading(true);

//       const {
//         data: { user },
//       } = await supabase.auth.getUser();
//       if (!user) return;

//       const { data: userRow } = await supabase
//         .from("users")
//         .select("userId")
//         .eq("auth_id", user.id)
//         .single();
//       if (!userRow) return;

//       const studentContext = await fetchStudentContext(userRow.userId);

//       // 🟢 Fetch active subjects and their units to calculate correct completion %
//       let query = supabase
//         .from("college_subjects")
//         .select(
//           `
//           collegeSubjectId,
//           subjectName,
//           image,
//           college_subject_units (
//             completionPercentage,
//             createdBy
//           )
//         `,
//         )
//         .eq("collegeBranchId", studentContext.collegeBranchId)
//         .eq("collegeEducationId", studentContext.collegeEducationId)
//         .eq("collegeAcademicYearId", studentContext.collegeAcademicYearId)
//         .eq("isActive", true)
//         .is("deletedAt", null);

//       if (
//         studentContext.collegeSemesterId !== null &&
//         studentContext.collegeSemesterId !== undefined
//       ) {
//         query = query.eq("collegeSemesterId", studentContext.collegeSemesterId);
//       }

//       const { data: subjectData } = await query;
//       if (!subjectData) {
//         setSubjects([]);
//         return;
//       }

//       // Fetch faculty names for professors
//       const facultyIds = new Set<number>();
//       subjectData.forEach((sub: any) => {
//         sub.college_subject_units?.forEach((unit: any) => {
//           if (unit.createdBy) facultyIds.add(unit.createdBy);
//         });
//       });

//       const facultyMap: Record<number, string> = {};
//       if (facultyIds.size > 0) {
//         const { data: facultyData } = await supabase
//           .from("faculty")
//           .select("facultyId, fullName")
//           .in("facultyId", Array.from(facultyIds));
//         facultyData?.forEach((f: any) => {
//           facultyMap[f.facultyId] = f.fullName;
//         });
//       }

//       // Maintain dynamic colors
//       const colorPalettes = [
//         {
//           radialStart: "#10FD77",
//           radialEnd: "#1C6B3F",
//           remainingColor: "#A1FFCA",
//         },
//         {
//           radialStart: "#EFEDFF",
//           radialEnd: "#705CFF",
//           remainingColor: "#E8E4FF",
//         },
//         {
//           radialStart: "#FFFFFF",
//           radialEnd: "#FFBE48",
//           remainingColor: "#F7EBD5",
//         },
//         {
//           radialStart: "#FEFFFF",
//           radialEnd: "#008993",
//           remainingColor: "#C4FBFF",
//         },
//       ];

//       const mappedSubjects = subjectData.map((sub: any, index: number) => {
//         const units = sub.college_subject_units || [];
//         const totalUnits = units.length;

//         // Calculate average completion percentage of all units
//         const avgPercentage =
//           totalUnits > 0
//             ? Math.round(
//                 units.reduce(
//                   (acc: number, curr: any) =>
//                     acc + (curr.completionPercentage || 0),
//                   0,
//                 ) / totalUnits,
//               )
//             : 0;

//         const firstUnit = units[0];
//         const professor =
//           firstUnit && facultyMap[firstUnit.createdBy]
//             ? `Prof. ${facultyMap[firstUnit.createdBy]}`
//             : "Faculty Assigned";
//         const colors = colorPalettes[index % colorPalettes.length];

//         return {
//           title: sub.subjectName,
//           professor: professor,
//           image: sub.image || "",
//           percentage: avgPercentage,
//           radialStart: colors.radialStart,
//           radialEnd: colors.radialEnd,
//           remainingColor: colors.remainingColor,
//         };
//       });

//       setSubjects(mappedSubjects);
//     } catch (err) {
//       console.error("Failed to load subjects", err);
//     } finally {
//       setSubjectsLoading(false);
//     }
//   };

//   const loadPendingFee = async () => {
//     try {
//       setFeeLoading(true);

//       const {
//         data: { user },
//       } = await supabase.auth.getUser();
//       if (!user) return;

//       const { data: userRow } = await supabase
//         .from("users")
//         .select("userId")
//         .eq("auth_id", user.id)
//         .single();
//       if (!userRow) return;

//       const plan = await fetchStudentFeePlan(userRow.userId);

//       setPendingFeeAmount(plan?.pendingAmount ?? 0);
//     } catch (err) {
//       console.error("Failed to load pending fee", err);
//     } finally {
//       setFeeLoading(false);
//     }
//   };

//   const loadAttendancePercent = async () => {
//     const {
//       data: { user },
//     } = await supabase.auth.getUser();

//     if (!user) return;

//     const { data: userRow } = await supabase
//       .from("users")
//       .select("userId")
//       .eq("auth_id", user.id)
//       .single();

//     if (!userRow) return;

//     const studentContext = await fetchStudentContext(userRow.userId);

//     const today = new Date().toISOString().split("T")[0];

//     const res = await getStudentDashboardData(
//       userRow.userId,
//       today,
//       1,
//       1,
//       studentContext.collegeEducationType === "Inter",
//     );

//     setAttendancePercent(res?.cards?.percentage ?? 0);
//   };

//   const loadAssignmentCount = async () => {
//     try {
//       const {
//         data: { user },
//       } = await supabase.auth.getUser();

//       if (!user) return;

//       const { data: userRow } = await supabase
//         .from("users")
//         .select("userId")
//         .eq("auth_id", user.id)
//         .single();

//       if (!userRow) return;

//       const studentContext = await fetchStudentContext(userRow.userId);

//       const res = await fetchAssignmentsForStudent(
//         {
//           collegeBranchId: studentContext.collegeBranchId,
//           collegeAcademicYearId: studentContext.collegeAcademicYearId,
//           collegeSectionsId: studentContext.collegeSectionsId,
//         },
//         1,
//         1,
//         "active",
//       );

//       if (res.success) {
//         setDueAssignmentsCount(res.totalCount);
//       }
//     } catch (err) {
//       console.error("Failed to load assignment count", err);
//     } finally {
//       setAssignmentsLoading(false);
//     }
//   };

//   const loadUpcomingClasses = async () => {
//     try {
//       setLoadingLectures(true);

//       const {
//         data: { user },
//       } = await supabase.auth.getUser();

//       if (!user) {
//         throw new Error("No auth user found");
//       }

//       const { data: userRow, error: userErr } = await supabase
//         .from("users")
//         .select("userId")
//         .eq("auth_id", user.id)
//         .single();

//       if (userErr || !userRow) {
//         throw new Error("Internal user not found");
//       }

//       const internalUserId = userRow.userId;

//       const studentContext = await fetchStudentContext(internalUserId);

//       const data = await fetchUpcomingClassesForStudent({
//         collegeEducationId: studentContext.collegeEducationId,
//         collegeBranchId: studentContext.collegeBranchId,
//         collegeAcademicYearId: studentContext.collegeAcademicYearId,
//         collegeSemesterId: studentContext.collegeSemesterId,
//         collegeSectionId: studentContext.collegeSectionsId,
//       });

//       setLectures(data);
//     } catch (err) {
//       console.error("Failed to load classes", err);
//     } finally {
//       setLoadingLectures(false);
//     }
//   };

//   const cardData = [
//     {
//       style: "bg-[#E2DAFF] h-[126.35px] w-[182px]",
//       icon: <Chalkboard size={32} weight="fill" color="#714EF2" />,
//       value:
//         attendancePercent === null ? <ValueShimmer /> : `${attendancePercent}%`,
//       label: "Attendance",
//       to: "/attendance",
//     },
//     {
//       style: "bg-[#FFEDDA] h-[126.35px] w-[182px]",
//       icon: <UsersThree size={32} weight="fill" color="#FFBB70" />,
//       value: assignmentsLoading ? (
//         <ValueShimmer />
//       ) : (
//         `${dueAssignmentsCount} Due`
//       ),
//       label: "Assignments",
//       to: "/assignments",
//     },
//     {
//       style: "bg-[#E6FBEA] h-[126.35px] w-[182px]",
//       icon: <BookOpen size={32} weight="fill" color="#74FF8F" />,
//       value: "Mid Exams",
//       label: "N/A",
//       onClick: () => setView("exams"),
//     },
//     {
//       style: "bg-[#CEE6FF] h-[126.35px] w-[182px]",
//       icon: <ClockAfternoon size={32} weight="fill" color="#60AEFF" />,
//       value: feeLoading ? (
//         <ValueShimmer />
//       ) : (
//         `₹${pendingFeeAmount?.toLocaleString("en-IN")}`
//       ),
//       label: "Fee Due",
//       to: "/payments",
//     },
//   ];

// const formatDate = (dateStr: string) => {
//   const date = new Date(dateStr);
//   const day = String(date.getDate()).padStart(2, "0");
//   const month = String(date.getMonth() + 1).padStart(2, "0");
//   const year = date.getFullYear();

//   return `${day}-${month}-${year}`;
// };

// const handleUpcomingClasses = () => {
//   router.push("/calendar");
//   return;
// };

// const handleSubjectProgress = () => {
//   router.push("/academics");
//   return;
// };

//   return (
//     <>
//       <div className="w-[68%] p-2">
//         {view === "dashboard" ? (
//           <>
//             <UserInfoCard />
//             <div className="mt-5 rounded-lg flex gap-3 text-xs">
//               {cardData.map((item, index) => (
//                 <CardComponent
//                   key={index}
//                   style={item.style}
//                   icon={item.icon}
//                   value={item.value}
//                   label={item.label}
//                   to={item.to}
//                   onClick={item.onClick}
//                 />
//               ))}
//             </div>
//             <div className="mt-5">
//               <AcademicPerformance />
//             </div>
//             <div className="mt-5 flex items-center justify-between rounded-lg">
//               <SubjectProgressCards
//                 props={subjectsLoading ? [] : subjects}
//                 isLoading={subjectsLoading}
//                 onViewMore={handleSubjectProgress}
//               />
//               <div className="bg-red-400 h-64 rounded-lg w-[49%] shadow-md">
//                 <div className="bg-white h-64 rounded-lg w-[100%] p-4 flex flex-col gap-2">
//                   <div className="flex justify-between items-center">
//                     <h6 className="text-[#282828] font-semibold">
//                       Upcoming Events
//                     </h6>
//                     <FaChevronRight
//                       className="cursor-pointer text-black"
//                       onClick={handleUpcomingClasses}
//                     />
//                   </div>
//                   <div className="overflow-y-auto pr-1">
//                     {loadingLectures ? (
//                       <div className="flex justify-center items-center h-[120px]">
//                         <div className="w-8 h-8 border-4 border-[#E8EAED] border-t-[#16284F] rounded-full animate-spin"></div>
//                       </div>
//                     ) : lectures.length === 0 ? (
//                       <div className="bg-red-00 min-h-[25vh] flex items-center justify-center">
//                         <p className="text-[#282828] text-sm">
//                           No events scheduled..
//                         </p>
//                       </div>
//                     ) : (
//                       lectures.map((lec) => (
//                         <div
//                           key={lec.calendarEventId}
//                           className="relative mb-3 last:mb-0"
//                         >
//                           <LectureCard
//                             time={`${formatTimeToAMPM(lec.fromTime)}\n-\n${formatTimeToAMPM(lec.toTime)}`}
//                             title={lec.eventTitle}
//                             professor={`Prof. ${lec.facultyName}`}
//                             description={`${lec.eventTopic} • ${formatDate(lec.date)}`}
//                             status={lec.isCancelled ? "Cancelled" : ""}
//                           />

//                           {lec.meetingLink && !lec.isCancelled && (
//                             <a
//                               href={lec.meetingLink}
//                               target="_blank"
//                               rel="noopener noreferrer"
//                               className="absolute right-4 top-1/2 -translate-y-1/2 bg-[#43C17A] text-white px-4 py-0.5 rounded-md text-xs font-medium hover:bg-[#35a868] transition-colors shadow-sm z-10 cursor-pointer"
//                             >
//                               Join
//                             </a>
//                           )}
//                         </div>
//                       ))
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </>
//         ) : (
//           <MidExams onBack={() => setView("dashboard")} />
//         )}
//       </div>
//     </>
//   );
// }

"use client";

import AcademicPerformance from "@/app/utils/AcademicPerformance";
import CardComponent from "@/app/utils/card";
import {
  BookOpen,
  Chalkboard,
  ClockAfternoon,
  UsersThree,
} from "@phosphor-icons/react";
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
import { useStudent } from "@/app/utils/context/student/useStudent";
import toast from "react-hot-toast";
import { Loader } from "../calendar/right/timetable";
import { useTranslations } from "next-intl";

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
  const [attendancePercent, setAttendancePercent] = useState<number | null>(
    null,
  );
  const [assignmentsLoading, setAssignmentsLoading] = useState(true);
  const [pendingFeeAmount, setPendingFeeAmount] = useState<number | null>(null);
  const [feeLoading, setFeeLoading] = useState(true);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [subjectsLoading, setSubjectsLoading] = useState(true);
  const { studentId } = useStudent();

  const t = useTranslations("Dashboard.student");

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

      let query = supabase
        .from("college_subjects")
        .select(
          `
          collegeSubjectId,
          subjectName,
          image,
          college_subject_units (
            completionPercentage,
            createdBy
          )
        `,
        )
        .eq("collegeBranchId", studentContext.collegeBranchId)
        .eq("collegeEducationId", studentContext.collegeEducationId)
        .eq("collegeAcademicYearId", studentContext.collegeAcademicYearId)
        .eq("isActive", true)
        .is("deletedAt", null);

      if (
        studentContext.collegeSemesterId !== null &&
        studentContext.collegeSemesterId !== undefined
      ) {
        query = query.eq("collegeSemesterId", studentContext.collegeSemesterId);
      }

      const { data: subjectData } = await query;
      if (!subjectData) {
        setSubjects([]);
        return;
      }

      const facultyIds = new Set<number>();
      subjectData.forEach((sub: any) => {
        sub.college_subject_units?.forEach((unit: any) => {
          if (unit.createdBy) facultyIds.add(unit.createdBy);
        });
      });

      const facultyMap: Record<number, string> = {};
      if (facultyIds.size > 0) {
        const { data: facultyData } = await supabase
          .from("faculty")
          .select("facultyId, fullName")
          .in("facultyId", Array.from(facultyIds));
        facultyData?.forEach((f: any) => {
          facultyMap[f.facultyId] = f.fullName;
        });
      }

      const colorPalettes = [
        {
          radialStart: "#10FD77",
          radialEnd: "#1C6B3F",
          remainingColor: "#A1FFCA",
        },
        {
          radialStart: "#EFEDFF",
          radialEnd: "#705CFF",
          remainingColor: "#E8E4FF",
        },
        {
          radialStart: "#FFFFFF",
          radialEnd: "#FFBE48",
          remainingColor: "#F7EBD5",
        },
        {
          radialStart: "#FEFFFF",
          radialEnd: "#008993",
          remainingColor: "#C4FBFF",
        },
      ];

      const mappedSubjects = subjectData.map((sub: any, index: number) => {
        const units = sub.college_subject_units || [];
        const totalUnits = units.length;

        const avgPercentage =
          totalUnits > 0
            ? Math.round(
                units.reduce(
                  (acc: number, curr: any) =>
                    acc + (curr.completionPercentage || 0),
                  0,
                ) / totalUnits,
              )
            : 0;

        const firstUnit = units[0];
        const professor =
          firstUnit && facultyMap[firstUnit.createdBy]
            ? t("Prof {name}", { name: facultyMap[firstUnit.createdBy] }) // Natural Key
            : t("Faculty Assigned"); // Natural Key
        const colors = colorPalettes[index % colorPalettes.length];

        return {
          title: sub.subjectName,
          professor: professor,
          image: sub.image || "",
          percentage: avgPercentage,
          radialStart: colors.radialStart,
          radialEnd: colors.radialEnd,
          remainingColor: colors.remainingColor,
        };
      });

      setSubjects(mappedSubjects);
    } catch (err) {
      toast.error("Failed to load subjects");
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
      studentContext.collegeEducationType === "Inter",
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
        "active",
      );

      if (res.success) {
        setDueAssignmentsCount(res.totalCount);
      }
    } catch (err) {
      console.error("Failed to load assignment count", err);
    } finally {
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
      value:
        attendancePercent === null ? <ValueShimmer /> : `${attendancePercent}%`,
      label: t("Attendance"), // Natural Key
      to: "/attendance",
    },
    {
      style: "bg-[#FFEDDA] h-[126.35px] w-[182px]",
      icon: <UsersThree size={32} weight="fill" color="#FFBB70" />,
      value: assignmentsLoading ? (
        <ValueShimmer />
      ) : (
        t("{count} Due", { count: dueAssignmentsCount }) // Pluralization/Variable key
      ),
      label: t("Assignments"), // Natural Key
      to: "/assignments",
    },
    {
      style: "bg-[#E6FBEA] h-[126.35px] w-[182px]",
      icon: <BookOpen size={32} weight="fill" color="#74FF8F" />,
      value: t("Mid Exams"), // Natural Key
      label: t("N/A"), // Natural Key
      onClick: () => setView("exams"),
    },
    {
      style: "bg-[#CEE6FF] h-[126.35px] w-[182px]",
      icon: <ClockAfternoon size={32} weight="fill" color="#60AEFF" />,
      value: feeLoading ? (
        <ValueShimmer />
      ) : (
        `₹${pendingFeeAmount?.toLocaleString("en-IN")}`
      ),
      label: t("Fee Due"), // Natural Key
      to: "/payments",
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
    router.push("/calendar");
    return;
  };

  const handleSubjectProgress = () => {
    router.push("/academics");
    return;
  };

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
              <AcademicPerformance studentId={studentId} />
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
                    <h6 className="text-[#282828] font-semibold">
                      {t("Upcoming Events")}
                    </h6>
                    <FaChevronRight
                      className="cursor-pointer text-black"
                      onClick={handleUpcomingClasses}
                    />
                  </div>
                  <div className="overflow-y-auto pr-1">
                    {loadingLectures ? (
                      <div className="flex justify-center items-center h-[120px]">
                        <div className="w-8 h-8 border-4 border-[#E8EAED] border-t-[#16284F] rounded-full animate-spin"></div>
                      </div>
                    ) : lectures.length === 0 ? (
                      <div className="bg-red-00 min-h-[25vh] flex items-center justify-center">
                        <p className="text-[#282828] text-sm">
                          {t("No events scheduled")}
                        </p>
                      </div>
                    ) : (
                      lectures.map((lec) => (
                        <div
                          key={lec.calendarEventId}
                          className="relative mb-3 last:mb-0"
                        >
                          <LectureCard
                            time={`${formatTimeToAMPM(lec.fromTime)}\n-\n${formatTimeToAMPM(lec.toTime)}`}
                            title={lec.eventTitle}
                            professor={t("Prof {name}", {
                              name: lec.facultyName,
                            })}
                            description={`${lec.eventTopic} • ${formatDate(lec.date)}`}
                            status={lec.isCancelled ? t("Cancelled") : ""}
                          />
                          {lec.meetingLink && !lec.isCancelled && (
                            <a
                              href={lec.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="absolute right-4 top-1/2 -translate-y-1/2 bg-[#43C17A] text-white px-4 py-0.5 rounded-md text-xs font-medium hover:bg-[#35a868] transition-colors shadow-sm z-10 cursor-pointer"
                            >
                              {t("Join")}
                            </a>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <MidExams onBack={() => setView("dashboard")} />
        )}
      </div>
    </>
  );
}
