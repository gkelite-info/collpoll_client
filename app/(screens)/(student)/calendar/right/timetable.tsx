"use client";
import { fetchStudentContext } from "@/app/utils/context/student/studentContextAPI";
import { useStudent } from "@/app/utils/context/student/useStudent";
import { fetchStudentTimetableByDate } from "@/lib/helpers/profile/calender/fetchStudentTimetable";
import { supabase } from "@/lib/supabaseClient";
import { FilePdf } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import TimetableCardShimmer from "./TimetableCardShimmer";
import { useTranslations } from "next-intl";
import { fetchTopicResources, fetchUnitResources } from "@/lib/helpers/faculty/Savetopicresource";
import { isSchoolEducation } from "@/lib/helpers/admin/academicSetup/schoolHelper";

const formatTimeToAMPM = (time24?: string | null) => {
  if (!time24) return "";
  const parts = time24.split(":");
  if (parts.length < 2) return time24;
  let hour = Number(parts[0]);
  const period = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${hour}:${parts[1]} ${period}`;
};

export const Loader = () => (
  <div className="flex justify-center items-center h-[300px]">
    <div className="w-10 h-10 border-4 border-[#E8EAED] border-t-[#16284F] rounded-full animate-spin"></div>
  </div>
);

interface TimetableItem {
  start: string;
  end: string;
  title: string;
  topic: string;
  room: string;
  faculty: string;
  img: string;
  isCancelled?: boolean;
  pdfUrl: string | null;
}

interface RawTimetableItem {
  calendarEventId: number;
  fromTime: string;
  toTime: string;
  eventTitle: string;
  eventTopic: string;
  topicId?: number | null;
  facultyName: string;
  roomNo: string;
  isCancelled?: boolean;
  isBulk?: boolean;
}

export default function CalendarTimeTable({
  selectedDate,
  height = "lg:min-h-[784px]",
}: {
  selectedDate: string;
  height?: string;
}) {
  const [timetable, setTimetable] = useState<TimetableItem[]>([]);
  const [loading, setLoading] = useState(true);
  const student = useStudent();
  const {
    collegeEducationType,
    collegeEducationId,
    collegeBranchId,
    collegeAcademicYearId,
    collegeSemesterId,
    collegeSectionsId,
    college_sections,
    loading: studentLoading,
    userId,
  } = student;
  const t = useTranslations("Calendar.student");

  // Derive display date and weekday name from selectedDate
  const dateObj = (() => {
    if (selectedDate) {
      const parts = selectedDate.split("-").map(Number);
      if (parts.length === 3 && parts[0] && parts[1] && parts[2]) {
        return new Date(parts[0], parts[1] - 1, parts[2]);
      }
    }
    return new Date();
  })();

  const displayDateNum = String(dateObj.getDate()).padStart(2, "0");
  const displayDayName = dateObj
    .toLocaleDateString("en-US", { weekday: "short" })
    .replace(".", "");

  useEffect(() => {
    let isCancelled = false;

    const loadTimetable = async () => {
      // If student context is still loading from provider, wait for it
      if (studentLoading) {
        setLoading(true);
        return;
      }

      try {
        setLoading(true);

        let eduId = collegeEducationId;
        let branchId = collegeBranchId;
        let acadYearId = collegeAcademicYearId;
        let semId = collegeSemesterId;
        let secId = collegeSectionsId;
        let secName = college_sections;
        let eduType = collegeEducationType;

        // Fallback: if student context fields are missing, fetch directly
        if (!eduId || !acadYearId || !secId) {
          let resolvedUserId = userId;
          if (!resolvedUserId) {
            const {
              data: { user },
            } = await supabase.auth.getUser();
            if (user) {
              const { data: userRow } = await supabase
                .from("users")
                .select("userId")
                .eq("auth_id", user.id)
                .maybeSingle();
              if (userRow?.userId) resolvedUserId = userRow.userId;
            }
          }

          if (resolvedUserId) {
            const ctx = await fetchStudentContext(resolvedUserId);
            if (ctx) {
              eduId = ctx.collegeEducationId;
              branchId = ctx.collegeBranchId;
              acadYearId = ctx.collegeAcademicYearId;
              semId = ctx.collegeSemesterId;
              secId = ctx.collegeSectionsId;
              secName = ctx.collegeSections;
              eduType = ctx.collegeEducationType;
            }
          }
        }

        if (!eduId || !acadYearId || !secId) {
          if (!isCancelled) {
            setTimetable([]);
            setLoading(false);
          }
          return;
        }

        const isInter =
          eduType === "Inter" || eduType === "Intermediate";
        const isSchool = isSchoolEducation(eduType);

        const rawData = await fetchStudentTimetableByDate({
          date: selectedDate,
          collegeEducationId: eduId,
          collegeBranchId: branchId,
          collegeAcademicYearId: acadYearId,
          collegeSemesterId: semId,
          collegeSectionId: secId,
          collegeSectionName: secName,
          isInter,
          isSchool,
        });

        if (isCancelled) return;

        const getSecurePdfUrl = (url: string | null) => {
          if (!url) return null;
          const match = url.match(/\/storage\/v1\/object\/public\/(.*)/);
          if (match && match[1]) {
            try {
              const b64 = btoa(encodeURIComponent(match[1])).replace(/=/g, "");
              return `/api/files/${b64}`;
            } catch {
              return url;
            }
          }
          return url;
        };

        const timetableWithResources = await Promise.all(
          (rawData as RawTimetableItem[]).map(async (item) => {
            let pdfUrl: string | null = null;

            try {
              if (item.topicId && !item.isBulk) {
                const resources = await fetchTopicResources(Number(item.topicId));
                if (resources && resources.length > 0) {
                  pdfUrl = getSecurePdfUrl(resources[0].resourceUrl);
                }
              } else if (item.topicId && item.isBulk) {
                const resources = await fetchUnitResources(Number(item.topicId));
                if (resources && resources.length > 0) {
                  pdfUrl = getSecurePdfUrl(resources[0].resourceUrl);
                }
              }
            } catch (resErr) {
              console.warn("Topic resource fetch skipped:", resErr);
            }

            return {
              start: formatTimeToAMPM(item.fromTime),
              end: formatTimeToAMPM(item.toTime),
              title: item.eventTitle || "Class",
              topic: item.eventTopic || "",
              room: item.roomNo || "",
              faculty: item.facultyName || "Faculty",
              img: "/stu_class.png",
              isCancelled: item.isCancelled,
              pdfUrl: pdfUrl,
            };
          }),
        );

        if (!isCancelled) {
          setTimetable(timetableWithResources);
        }
      } catch (err) {
        console.error("Failed to load timetable", err);
        if (!isCancelled) {
          setTimetable([]);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    loadTimetable();

    return () => {
      isCancelled = true;
    };
  }, [
    selectedDate,
    studentLoading,
    collegeEducationId,
    collegeAcademicYearId,
    collegeSectionsId,
    collegeEducationType,
    collegeBranchId,
    collegeSemesterId,
    college_sections,
    userId,
  ]);

  return (
    <div
      className={`bg-white ${height} w-full rounded-lg lg:p-4 shadow-md flex flex-col overflow-y-auto max-lg:bg-transparent max-lg:shadow-none max-lg:p-0`}
    >
      <div className="w-full">
        {/* DESKTOP HEADER */}
        <div className="hidden lg:flex bg-[#E8EAED] w-max h-[54px] rounded-md shadow-md mb-2">
          <div className="bg-[#16284F] w-[45px] h-[54px] rounded-l-md flex flex-col items-center justify-center">
            <p className="text-md font-black text-[#EFEFEF]">{displayDateNum}</p>
            <p className="text-xs text-[#FFFFFF] font-light">{displayDayName}</p>
          </div>
          <div className="flex items-center justify-center px-6 rounded-r-md">
            <p className="text-[#16284F] font-medium text-lg">
              {t("Timetable")}
            </p>
          </div>
        </div>

        {/* MOBILE HEADER */}
        <div className="hidden max-lg:flex items-center gap-0 mt-2 mb-3">
          <div className="bg-[#16284F] text-white flex flex-col items-center justify-center w-10 h-10 md:w-14 md:h-14 rounded-l-md">
            <span className="text-[14px] md:text-[18px] font-bold leading-none">
              {displayDateNum}
            </span>
            <span className="text-[10px] md:text-[12px] font-light leading-none">
              {displayDayName}
            </span>
          </div>
          <div className="bg-[#E8EAED] text-[#16284F] font-semibold text-sm md:text-base h-10 md:h-14 flex items-center px-4 rounded-r-md">
            {t("Timetable")}
          </div>
        </div>

        <div className="mt-5 flex w-full flex-col gap-4 max-lg:mt-2 max-lg:gap-3">
          {loading ? (
            <TimetableCardShimmer count={6} />
          ) : timetable.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 w-full text-center">
              <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-3 text-gray-400">
                <svg
                  className="w-7 h-7"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <p className="text-[#282828] font-semibold text-base">
                {t("No classes scheduled")}
              </p>
              <p className="text-gray-400 text-xs mt-1">
                There are no classes scheduled for this date.
              </p>
            </div>
          ) : (
            timetable.map((item, index) => (
              <div key={index} className="w-full">
                {/* DESKTOP CARD VIEW */}
                <div className="hidden lg:flex h-[102px] w-full justify-between">
                  <div className="w-[88px] shrink-0 flex flex-col items-center justify-center">
                    <p className="text-[#282828] text-xs">{item.start}</p>
                    <span className="text-[#282828]">-</span>
                    <p className="text-[#282828] text-xs">{item.end}</p>
                  </div>

                  <div className="bg-[#16284F] flex-1 rounded-xl flex justify-end ml-2">
                    <div className="w-[98%] h-full bg-[#E8E9ED] gap-3 rounded-r-lg flex items-center px-2">
                      <div className="h-[84px] w-[84px] shrink-0 rounded-lg bg-yellow-00 flex items-center justify-center">
                        <img src={item.img} alt="class" />
                      </div>

                      <div className="h-[84px] flex-1 min-w-0 gap-2 flex items-center justify-between">
                        <div className="flex flex-col justify-center gap-1 h-full w-[80%] overflow-x-auto">
                          <p className="text-[#282828] font-medium leading-tight truncate">
                            {item.title}
                          </p>
                          <p className="text-[#282828] font-medium text-sm truncate">
                            Topic / Unit:{" "}
                            <span className="text-[#282828] font-normal text-xs ml-1">
                              {item.topic || "-"}
                            </span>
                          </p>
                          <div className="flex gap-2">
                            <p className="text-[#282828] font-medium text-xs">
                              Room:{" "}
                              <span className="font-normal">
                                {item.room || "-"}
                              </span>
                            </p>
                            <p className="text-[#282828] font-medium text-xs">
                              Faculty:{" "}
                              <span className="font-normal">
                                {item.faculty}
                              </span>
                            </p>
                            {item.isCancelled && (
                              <p className="text-red-500 text-xs font-semibold">
                                CANCELLED
                              </p>
                            )}
                          </div>
                        </div>

                        <div
                          className={`shrink-0 rounded-full h-[40px] w-[40px] flex items-center justify-center transition-all ${
                            item.pdfUrl
                              ? "bg-[#16284F] cursor-pointer"
                              : "bg-gray-300"
                          }`}
                          onClick={() =>
                            item.pdfUrl && window.open(item.pdfUrl, "_blank")
                          }
                        >
                          <FilePdf
                            size={23}
                            className={
                              item.pdfUrl ? "text-white" : "text-gray-500"
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* MOBILE CARD VIEW */}
                <div className="lg:hidden w-full bg-white rounded-xl p-3 md:p-4 flex gap-3 md:gap-4 relative shadow-sm border border-gray-100">
                  <div className="h-16 w-16 md:h-20 md:w-20 rounded-lg bg-gray-100 shrink-0">
                    <img
                      src={item.img}
                      alt="class"
                      className="h-full w-full object-cover rounded-lg"
                    />
                  </div>

                  <div className="flex flex-col grow min-w-0 pr-8 md:pr-12">
                    <div className="flex justify-between items-start w-full">
                      <p className="text-[#16284F] font-bold text-[13px] md:text-[16px] truncate leading-tight">
                        {item.title}
                      </p>
                    </div>
                    <p className="text-gray-600 text-[10px] md:text-[12px] shrink-0 mt-0.5 md:mt-1">
                      {item.start} - {item.end}
                    </p>

                    <p className="text-gray-700 text-[11px] md:text-[13px] mt-1.5 md:mt-2 truncate">
                      <span className="font-semibold text-gray-800">
                        Topic / Unit:
                      </span>{" "}
                      {item.topic || "-"}
                    </p>
                    <p className="text-gray-700 text-[11px] md:text-[13px] truncate mt-0.5 md:mt-1">
                      <span className="font-semibold text-gray-800">Room:</span>{" "}
                      {item.room || "-"} ·{" "}
                      <span className="font-semibold text-gray-800">
                        Faculty:
                      </span>{" "}
                      {item.faculty}
                    </p>
                    {item.isCancelled && (
                      <p className="text-red-500 text-[10px] md:text-[12px] font-bold mt-0.5 md:mt-1">
                        CANCELLED
                      </p>
                    )}
                  </div>

                  <div
                    className={`absolute bottom-3 right-3 md:bottom-4 md:right-4 rounded-full h-7 w-7 md:h-10 md:w-10 flex items-center justify-center ${
                      item.pdfUrl
                        ? "bg-[#16284F] cursor-pointer"
                        : "bg-gray-300"
                    }`}
                    onClick={() =>
                      item.pdfUrl && window.open(item.pdfUrl, "_blank")
                    }
                  >
                    <FilePdf
                      size={14}
                      className={`md:w-5 md:h-5 ${item.pdfUrl ? "text-white" : "text-gray-500"}`}
                      weight="fill"
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
