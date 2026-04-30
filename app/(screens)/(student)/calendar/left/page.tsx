"use client";

import { useEffect, useState, useMemo } from "react";
import { CaretCircleRight } from "@phosphor-icons/react";
import { useTranslations, useLocale } from "next-intl";
import { supabase } from "@/lib/supabaseClient";
import { fetchStudentContext } from "@/app/utils/context/student/studentContextAPI";
import { fetchStudentTimetableByDate } from "@/lib/helpers/profile/calender/fetchStudentTimetable";
import { useStudent } from "@/app/utils/context/student/useStudent";
import { getUserIdFromAuth } from "@/lib/helpers/fetchUserDetails";
import { fetchFacultyTasksForStudent } from "@/lib/helpers/faculty/facultyTasks";

/**
 * Generates the current week days (Mon-Sat) based on the locale
 */
function getWeekDays(locale: string) {
  const today = new Date();
  const day = today.getDay();
  const monday = new Date(today);
  const diffToMonday = day === 0 ? -6 : 1 - day;
  monday.setDate(today.getDate() + diffToMonday);

  const days = [];
  for (let i = 0; i < 6; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    days.push({
      dayName: date.toLocaleDateString(
        locale === "te" ? "te-IN" : locale === "hi" ? "hi-IN" : "en-US",
        { weekday: "short" }
      ),
      dateNum: date.getDate(),
      fullDate: date.toISOString().split("T")[0],
      isToday: date.toDateString() === today.toDateString(),
    });
  }
  return days;
}

interface DayData {
  classCount: number;
  quizCount: number;
  assignmentCount: number;
  discussionCount: number;
  facultyTasks: any[];
  quizzes: any[];
  focus: string;
  tip: string;
}

interface CalendarLeftProps {
  onDateSelect: (date: string) => void;
  selectedDate: string;
  setExtraInfo: (info: any) => void;
}

export default function CalendarLeft({ onDateSelect, selectedDate, setExtraInfo }: CalendarLeftProps) {
  const locale = useLocale();
  const t = useTranslations("Calendar.student");

  const week = useMemo(() => getWeekDays(locale), [locale]);
  const { collegeEducationType } = useStudent();

  const [weeklyData, setWeeklyData] = useState<Record<string, DayData>>({});
  const [loading, setLoading] = useState(true);

  // Sync extra info to parent when date changes
  useEffect(() => {
    if (weeklyData[selectedDate]) {
      const data = weeklyData[selectedDate];
      setExtraInfo({
        quizzes: data.quizCount,
        assignments: data.assignmentCount,
        discussions: data.discussionCount,
        focus: data.focus,
        tip: data.tip
      });
    }
  }, [selectedDate, weeklyData, setExtraInfo]);

  useEffect(() => {
    const loadAllData = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const userResult = await getUserIdFromAuth(user.id);
        if (!userResult.success || !userResult.userId) return;

        const studentContext = await fetchStudentContext(userResult.userId);
        if (!studentContext) return;

        const resultsMap: Record<string, DayData> = {};

        const promises = week.map(async (day) => {
          const [classes, quizRes, discRes, facultyTasks] = await Promise.all([
            fetchStudentTimetableByDate({
              date: day.fullDate,
              collegeEducationId: studentContext.collegeEducationId,
              collegeBranchId: studentContext.collegeBranchId,
              collegeAcademicYearId: studentContext.collegeAcademicYearId,
              collegeSemesterId: studentContext.collegeSemesterId,
              collegeSectionId: studentContext.collegeSectionsId,
              isInter: collegeEducationType === "Inter",
            }),
            supabase.from("quizzes")
              .select("*")
              .eq("collegeSectionsId", studentContext.collegeSectionsId)
              .eq("isActive", true)
              .gte("startDate", `${day.fullDate}T00:00:00`)
              .lte("startDate", `${day.fullDate}T23:59:59`),
            supabase.from("discussion_forum_sections")
              .select("discussionSectionId, discussion_forum!inner(deadline, title)")
              .eq("collegeSectionsId", studentContext.collegeSectionsId)
              .eq("is_deleted", false)
              .gte("discussion_forum.deadline", `${day.fullDate}T00:00:00`)
              .lte("discussion_forum.deadline", `${day.fullDate}T23:59:59`),
            fetchFacultyTasksForStudent({
              date: day.fullDate,
              collegeId: studentContext.collegeId,
              collegeBranchId: studentContext.collegeBranchId,
              collegeAcademicYearId: studentContext.collegeAcademicYearId,
              collegeSemesterId: studentContext.collegeSemesterId,
            })
          ]);

          const qCount = quizRes.data?.length || 0;
          const aCount = facultyTasks?.length || 0;
          const dCount = discRes.data?.length || 0;

          // Translation Logic for Dynamic Strings
          let focus = t("General Revision");
          if (aCount > 0) {
            focus = facultyTasks[0].taskTitle;
          } else if (qCount > 0) {
            focus = quizRes.data![0].quizTitle;
          }

          let tip = t("Organize your study desk");
          const deadlines = [];
          if (qCount > 0) deadlines.push(t("Quizzes", { count: qCount }));
          if (aCount > 0) deadlines.push(t("Assignments", { count: aCount }));
          if (dCount > 0) deadlines.push(t("Discussions", { count: dCount }));

          if (deadlines.length > 0) {
            tip = `${t("Check the deadlines for")}: ${deadlines.join(", ")}`;
          }

          resultsMap[day.fullDate] = {
            classCount: classes.length,
            quizCount: qCount,
            assignmentCount: aCount,
            discussionCount: dCount,
            facultyTasks: facultyTasks || [],
            quizzes: quizRes.data || [],
            focus,
            tip
          };
        });

        await Promise.all(promises);
        setWeeklyData(resultsMap);
      } catch (err) {
        console.error("UI LOAD ERROR:", err);
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, [collegeEducationType, week, t]);

  return (
    <div className="bg-white relative overflow-hidden rounded-lg p-3 flex flex-col shadow-md">
      <h4 className="text-[#282828] font-medium">{t("Weekly Calendar Overview")}</h4>

      <div className="flex flex-col lg:mt-2">
        {week.map((item, index) => {
          const isActive = item.fullDate === selectedDate;
          const dayInfo = weeklyData[item.fullDate];

          return (
            <div
              key={index}
              className={`flex items-center p-3 rounded-md mt-2 gap-2 transition-all duration-200 ${isActive ? "bg-[#43C17A]" : "bg-[#FFFFFF] border border-[#D4D4D4]"
                }`}
            >
              <div
                className={`flex flex-col items-center justify-center gap-0.5 h-[73.1px] w-[73.1px] rounded-md ${isActive ? "bg-[#FFFFFF]" : "bg-[#D3F1E0]"
                  }`}
              >
                <p className={`text-xs font-semibold ${isActive ? "text-[#43C17A]" : "text-[#282828]"}`}>
                  {item.dayName}
                </p>
                <p className={`text-lg font-bold ${isActive ? "text-[#43C17A]" : "text-[#282828]"}`}>
                  {item.dateNum}
                </p>
              </div>

              <div className="w-[80%] flex justify-between items-center">
                <div className="flex flex-col w-full pl-2">
                  <p className={`text-[11px] lg:text-[13px] font-medium ${isActive ? "text-white" : "text-[#282828]"}`}>
                    📘 {loading || !dayInfo ? "0" : t("Classes", { count: dayInfo.classCount })} ·
                    📝 {loading || !dayInfo ? "0" : t("Quizzes", { count: dayInfo.quizCount })}
                  </p>

                  <p className={`text-[11px] lg:text-[13px] font-medium ${isActive ? "text-white" : "text-[#282828]"}`}>
                    🧾 {loading || !dayInfo ? "0" : t("Assignments", { count: dayInfo.assignmentCount })} ·
                    💬 {loading || !dayInfo ? "0" : t("Discussions", { count: dayInfo.discussionCount })}
                  </p>

                  <p className={`text-[12px] mt-1 font-semibold ${isActive ? "text-white" : "text-[#43C17A]"}`}>
                    🎯 {t("Focus Area")}: <span className={isActive ? "text-white/90" : "text-[#282828] font-normal"}>
                      {loading || !dayInfo ? "..." : dayInfo.focus}
                    </span>
                  </p>

                  <p className={`text-[11px] italic ${isActive ? "text-white/80" : "text-gray-500"}`}>
                    🪄 {t("Tip")}: {loading || !dayInfo ? "..." : dayInfo.tip}
                  </p>
                </div>

                <CaretCircleRight
                  size={28}
                  weight="fill"
                  className={`cursor-pointer transition-transform hover:scale-110 ${isActive ? "text-white" : "text-[#43C17A]"}`}
                  onClick={() => onDateSelect(item.fullDate)}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}