"use client";
import PageUnderConstruction from "@/app/utils/PageUnderConstruction";
import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@/app/utils/context/UserContext";
import HolidayCalendar from "@/app/(screens)/hr/calendar/components/HolidayCalendar";
import HolidayCalendarShimmer from "@/app/(screens)/hr/calendar/components/HolidayCalendarShimmer";
import { fetchCollegeHolidays, CollegeHoliday } from "@/lib/helpers/Hr/holidays/holidayAPI";
import { Loader } from "../../(student)/calendar/right/timetable";

function PageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const tabQuery = searchParams.get("tab");
    const activeMainTab = tabQuery === "Holidays" ? "Holidays" : "Academics";

    const { collegeId } = useUser();
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
        if (activeMainTab === "Holidays") {
            loadHolidays();
        }
    }, [activeMainTab, loadHolidays, holidayYear, collegeId]);

    return (
        <div className="w-full h-full p-4 flex flex-col min-h-screen bg-[#f3f4f6]">
            <div className="flex gap-3 mb-5 mt-2">
                <button
                    onClick={() => router.push("/college-admin/calendar")}
                    className={`px-5 cursor-pointer py-2 rounded-lg text-sm font-semibold transition-all shadow-sm ${activeMainTab === "Academics" ? "bg-[#43C17A] text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}
                >
                    Calendar Overview
                </button>
                <button
                    onClick={() => router.push("/college-admin/calendar?tab=Holidays")}
                    className={`px-5 cursor-pointer py-2 rounded-lg text-sm font-semibold transition-all shadow-sm ${activeMainTab === "Holidays" ? "bg-[#43C17A] text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}
                >
                    Holiday Calendar
                </button>
            </div>

            {activeMainTab === "Holidays" ? (
                <div className="bg-white shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden relative rounded-xl p-4">
                    {isFetchingHolidays ? (
                        <HolidayCalendarShimmer />
                    ) : (
                        <HolidayCalendar
                            holidays={holidays}
                            year={holidayYear}
                            setYear={setHolidayYear}
                            onRefresh={loadHolidays}
                            readOnly={true}
                        />
                    )}
                </div>
            ) : (
                <div className="w-full h-full flex flex-col flex-1">
                    <PageUnderConstruction />
                </div>
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
    );
}