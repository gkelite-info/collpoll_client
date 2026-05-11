"use client";

import { useEffect, useState, useMemo } from "react";
import { CaretCircleRight, CaretRight } from "@phosphor-icons/react";
import { useTranslations, useLocale } from "next-intl";
import { supabase } from "@/lib/supabaseClient";
import { fetchStudentContext } from "@/app/utils/context/student/studentContextAPI";
import { fetchStudentTimetableByDate } from "@/lib/helpers/profile/calender/fetchStudentTimetable";
import { useStudent } from "@/app/utils/context/student/useStudent";
import { getUserIdFromAuth } from "@/lib/helpers/fetchUserDetails";
import { fetchFacultyTasksForStudent } from "@/lib/helpers/faculty/facultyTasks";

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
        { weekday: "short" },
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

export default function CalendarLeft({
  onDateSelect,
  selectedDate,
  setExtraInfo,
}: CalendarLeftProps) {
  const locale = useLocale();
  const t = useTranslations("Calendar.student");

  const week = useMemo(() => getWeekDays(locale), [locale]);
  const { collegeEducationType } = useStudent();

  const [weeklyData, setWeeklyData] = useState<Record<string, DayData>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (weeklyData[selectedDate]) {
      const data = weeklyData[selectedDate];
      setExtraInfo({
        quizzes: data.quizCount,
        assignments: data.assignmentCount,
        discussions: data.discussionCount,
        focus: data.focus,
        tip: data.tip,
      });
    }
  }, [selectedDate, weeklyData, setExtraInfo]);

  useEffect(() => {
    const loadAllData = async () => {
      try {
        setLoading(true);
        const {
          data: { user },
        } = await supabase.auth.getUser();
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
            supabase
              .from("quizzes")
              .select("*")
              .eq("collegeSectionsId", studentContext.collegeSectionsId)
              .eq("isActive", true)
              .gte("startDate", `${day.fullDate}T00:00:00`)
              .lte("startDate", `${day.fullDate}T23:59:59`),
            supabase
              .from("discussion_forum_sections")
              .select(
                "discussionSectionId, discussion_forum!inner(deadline, title)",
              )
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
            }),
          ]);

          const qCount = quizRes.data?.length || 0;
          const aCount = facultyTasks?.length || 0;
          const dCount = discRes.data?.length || 0;

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
            tip,
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
    <div className="bg-white relative overflow-hidden rounded-lg p-3 flex flex-col shadow-md max-md:bg-transparent max-md:shadow-none max-md:p-0">
      <h4 className="text-[#282828] font-medium max-md:font-semibold max-md:mb-3">
        {t("Weekly Calendar Overview")}
      </h4>

      {/* DESKTOP VIEW */}
      <div className="hidden md:flex flex-col lg:mt-2">
        {week.map((item, index) => {
          const isActive = item.fullDate === selectedDate;
          const dayInfo = weeklyData[item.fullDate];

          return (
            <div
              key={index}
              className={`flex items-center p-3 rounded-md mt-2 gap-2 transition-all duration-200 ${isActive ? "bg-[#43C17A]" : "bg-[#FFFFFF] border border-[#D4D4D4]"}`}
            >
              <div
                className={`flex flex-col items-center justify-center gap-0.5 h-[73.1px] w-[73.1px] rounded-md ${isActive ? "bg-[#FFFFFF]" : "bg-[#D3F1E0]"}`}
              >
                <p
                  className={`text-xs font-semibold ${isActive ? "text-[#43C17A]" : "text-[#282828]"}`}
                >
                  {item.dayName}
                </p>
                <p
                  className={`text-lg font-bold ${isActive ? "text-[#43C17A]" : "text-[#282828]"}`}
                >
                  {item.dateNum}
                </p>
              </div>

              <div className="w-[80%] flex justify-between items-center">
                <div className="flex flex-col w-full pl-2">
                  <p
                    className={`text-[11px] lg:text-[13px] font-medium ${isActive ? "text-white" : "text-[#282828]"}`}
                  >
                    📘{" "}
                    {loading || !dayInfo
                      ? "0"
                      : t("Classes", { count: dayInfo.classCount })}{" "}
                    · 📝{" "}
                    {loading || !dayInfo
                      ? "0"
                      : t("Quizzes", { count: dayInfo.quizCount })}
                  </p>
                  <p
                    className={`text-[11px] lg:text-[13px] font-medium ${isActive ? "text-white" : "text-[#282828]"}`}
                  >
                    🧾{" "}
                    {loading || !dayInfo
                      ? "0"
                      : t("Assignments", {
                          count: dayInfo.assignmentCount,
                        })}{" "}
                    · 💬{" "}
                    {loading || !dayInfo
                      ? "0"
                      : t("Discussions", { count: dayInfo.discussionCount })}
                  </p>
                  <p
                    className={`text-[12px] mt-1 font-semibold ${isActive ? "text-white" : "text-[#43C17A]"}`}
                  >
                    🎯 {t("Focus Area")}:{" "}
                    <span
                      className={
                        isActive
                          ? "text-white/90"
                          : "text-[#282828] font-normal"
                      }
                    >
                      {loading || !dayInfo ? "..." : dayInfo.focus}
                    </span>
                  </p>
                  <p
                    className={`text-[11px] italic ${isActive ? "text-white/80" : "text-gray-500"}`}
                  >
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

      {/*  MOBILE VIEW */}
      <div className="flex md:hidden flex-col gap-3 w-full overflow-hidden">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 w-full">
          {week.map((item, index) => {
            const isActive = item.fullDate === selectedDate;

            return (
              <div
                key={index}
                onClick={() => onDateSelect(item.fullDate)}
                className={`flex flex-col items-center justify-center gap-0.5 h-16 w-16 min-w-[64px] rounded-lg cursor-pointer transition-colors duration-200 ${
                  isActive
                    ? "bg-[#43C17A] text-white shadow-md scale-[1.02]"
                    : "bg-[#DCEAE2] text-[#282828]"
                }`}
              >
                <span className="text-[12px] font-semibold">
                  {item.dayName}
                </span>
                <span className="text-[18px] font-bold">{item.dateNum}</span>
              </div>
            );
          })}
        </div>

        {week.map((item, index) => {
          const isActive = item.fullDate === selectedDate;
          const dayInfo = weeklyData[item.fullDate];
          if (!isActive) return null;

          return (
            <div
              key={`active-${index}`}
              className="bg-[#43C17A] rounded-xl p-3 flex items-stretch gap-3 shadow-md w-full relative"
            >
              <div className="bg-white rounded-lg flex flex-col items-center justify-center w-[72px] shrink-0">
                <span className="text-[#43C17A] font-semibold text-[13px]">
                  {item.dayName}
                </span>
                <span className="text-[#43C17A] font-bold text-3xl">
                  {item.dateNum}
                </span>
              </div>

              <div className="flex flex-col text-white justify-center gap-1 min-w-0 pr-6">
                <p className="text-[11px] font-medium leading-tight truncate">
                  📘{" "}
                  {loading || !dayInfo
                    ? "0"
                    : t("Classes", { count: dayInfo.classCount })}{" "}
                  · 📝{" "}
                  {loading || !dayInfo
                    ? "0"
                    : t("Quizzes", { count: dayInfo.quizCount })}
                </p>
                <p className="text-[11px] font-medium leading-tight truncate">
                  🧾{" "}
                  {loading || !dayInfo
                    ? "0"
                    : t("Assignments", { count: dayInfo.assignmentCount })}{" "}
                  · 💬{" "}
                  {loading || !dayInfo
                    ? "0"
                    : t("Discussions", { count: dayInfo.discussionCount })}
                </p>
                <p className="text-[11px] font-semibold mt-0.5 leading-tight truncate">
                  🎯 {t("Focus Area")}:{" "}
                  <span className="font-normal">
                    {loading || !dayInfo ? "..." : dayInfo.focus}
                  </span>
                </p>
                <p className="text-[10px] italic text-white/90 leading-tight truncate">
                  🪄 {t("Tip")}: {loading || !dayInfo ? "..." : dayInfo.tip}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
