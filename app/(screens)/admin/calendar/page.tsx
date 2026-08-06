"use client"

import { Suspense, useEffect, useState, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import CourseScheduleCard from "@/app/utils/CourseScheduleCard"
import FacultyOverview from "./components/FacultyOverview"
import CalendarView from "./components/CalendarView"
import { Loader } from "@/app/(screens)/(student)/calendar/right/timetable"
import CalendarViewShimmer from "@/app/utils/shimmers/CalendarViewShimmer"
import { fetchFilteredFaculties } from "@/lib/helpers/admin/calender/fetchFacultyCalendar"
import { useUser } from "@/app/utils/context/UserContext"
import { useAdmin } from "@/app/utils/context/admin/useAdmin"
import toast from "react-hot-toast"
import { decryptId, encryptId } from "@/app/utils/encryption"
import HolidayCalendar from "@/app/(screens)/hr/calendar/components/HolidayCalendar"
import HolidayCalendarShimmer from "@/app/(screens)/hr/calendar/components/HolidayCalendarShimmer"
import { fetchCollegeHolidays, CollegeHoliday } from "@/lib/helpers/Hr/holidays/holidayAPI"

function PageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const urlParamId = searchParams.get("facultyId")
  const facultyId = urlParamId ? decryptId(urlParamId) : null
  const { collegeId } = useUser()
  const { collegeEducationId } = useAdmin()

  const createQueryString = useCallback(
    (name: string, value: string | null) => {
      const params = new URLSearchParams(Array.from(searchParams.entries()))
      if (value === null) {
        params.delete(name)
      } else {
        params.set(name, value)
      }
      return params.toString()
    },
    [searchParams]
  )

  const tabQuery = searchParams.get("tab");
  const activeTab = tabQuery === "Holidays" ? "Holidays" : "overview";

  const [holidays, setHolidays] = useState<CollegeHoliday[]>([]);
  const [holidayYear, setHolidayYear] = useState(new Date().getFullYear());
  const [isFetchingHolidays, setIsFetchingHolidays] = useState(false);

  const loadHolidays = useCallback(async () => {
    if (!collegeId) return;
    setIsFetchingHolidays(true);
    try {
      const data = await fetchCollegeHolidays(collegeId, holidayYear);
      setHolidays(data || []);
    } catch (error) {
      console.error("Error fetching holidays:", error);
    } finally {
      setIsFetchingHolidays(false);
    }
  }, [collegeId, holidayYear]);

  useEffect(() => {
    if (activeTab === "Holidays") {
      loadHolidays();
    }
  }, [activeTab, loadHolidays, holidayYear, collegeId]);

  const { data: selectedFaculty, isLoading: isLoadingFaculty } = useQuery({
    queryKey: ["selectedAdminCalendarFaculty", collegeId, facultyId],
    queryFn: async () => {
      if (!collegeId || !facultyId) return null;
      try {
        const { data } = await fetchFilteredFaculties({
          collegeId,
          facultyId: Number(facultyId),
        });
        if (data && data.length > 0) {
          return data[0];
        } else {
          toast.error("Faculty not found");
          router.push("/admin/calendar");
          return null;
        }
      } catch (error) {
        toast.error("Failed to load faculty data");
        router.push("/admin/calendar");
        return null;
      }
    },
    enabled: !!collegeId && !!facultyId,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });

  useEffect(() => {
    if (urlParamId && !facultyId) {
      toast.error("Invalid calendar link");
      router.push("/admin/calendar");
    }
  }, [urlParamId, facultyId, router]);

  if (facultyId && (!selectedFaculty || isLoadingFaculty)) {
    return (
      <div className="p-4 bg-[#f3f4f6] min-h-screen">
        <CalendarViewShimmer />
      </div>
    )
  }

  return (
    <div className="p-4 bg-[#f3f4f6] min-h-screen">
      {!selectedFaculty && (
        <section className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold text-[#1F2937]">
              {activeTab === "Holidays" ? "Holiday Calendar" : "Calendar Overview"}
            </h1>
            <p className="text-sm text-gray-500">
              {activeTab === "Holidays" 
                ? "View the complete holiday schedule for the academic year."
                : "Select a faculty, branch, or course calendar to view or manage schedules."}
            </p>
          </div>
          <div className="flex items-center justify-center">
            <CourseScheduleCard style="w-[320px] mt-4" isVisibile={false} />
          </div>
        </section>
      )}

      {!selectedFaculty && (
        <div className="flex gap-3 mb-5">
          <button
            onClick={() => router.push(`/admin/calendar?${createQueryString("tab", "overview")}`, { scroll: false })}
            className={`px-5 cursor-pointer py-2 rounded-lg text-sm font-semibold transition-all shadow-sm ${activeTab === "overview" ? "bg-[#43C17A] text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}
          >
            Calendar Overview
          </button>
          <button
            onClick={() => router.push(`/admin/calendar?${createQueryString("tab", "Holidays")}`, { scroll: false })}
            className={`px-5 cursor-pointer py-2 rounded-lg text-sm font-semibold transition-all shadow-sm ${activeTab === "Holidays" ? "bg-[#43C17A] text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}
          >
            Holiday Calendar
          </button>
        </div>
      )}

      {activeTab === "Holidays" ? (
        isFetchingHolidays ? (
          <HolidayCalendarShimmer />
        ) : (
          <HolidayCalendar
            holidays={holidays}
            year={holidayYear}
            setYear={setHolidayYear}
            onRefresh={loadHolidays}
            readOnly={true}
          />
        )
      ) : (
        selectedFaculty ? (
          <CalendarView
            faculty={selectedFaculty}
            onBack={() => router.push(`/admin/calendar?${createQueryString("facultyId", null)}`, { scroll: false })}
          />
        ) : (
          <FacultyOverview onSelect={(faculty) => router.push(`/admin/calendar?${createQueryString("facultyId", encryptId(faculty.id))}`, { scroll: false })} />
        )
      )}
    </div>
  )
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-[#f3f4f6]">
          <Loader />
        </div>
      }
    >
      <PageContent />
    </Suspense>
  )
}
