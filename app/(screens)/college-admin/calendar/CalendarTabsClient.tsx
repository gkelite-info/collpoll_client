"use client";

import { useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@/app/utils/context/UserContext";
import HolidayCalendar from "@/app/(screens)/hr/calendar/components/HolidayCalendar";
import HolidayCalendarShimmer from "@/app/(screens)/hr/calendar/components/HolidayCalendarShimmer";
import { fetchCollegeHolidays, CollegeHoliday } from "@/lib/helpers/Hr/holidays/holidayAPI";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import { Toaster } from 'react-hot-toast';

interface CalendarTabsClientProps {
    children: React.ReactNode;
}

export default function CalendarTabsClient({ children }: CalendarTabsClientProps) {
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
        <main className="w-full h-full p-1.5 md:p-2.5 lg:p-4 flex flex-col min-h-[calc(100vh-80px)] bg-[#f3f4f6]">
            <section className="bg-indigo-00 flex justify-between items-center mb-4">
                <div>
                    <h1 className="text-black text-xl font-semibold">
                        {activeMainTab === "Holidays" ? "Holiday Calendar" : "Calendar & Meetings"}
                    </h1>
                    <p className="text-black text-sm text-gray-500 mt-1">
                        {activeMainTab === "Holidays"
                            ? "View the complete holiday schedule for the academic year."
                            : "Stay organized and on track with your personalised calendar and meetings."}
                    </p>
                </div>

                <CourseScheduleCard isVisibile={false} style="w-[320px] hidden md:flex lg:flex" />
            </section>

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
                <div>
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
                    {children}
                </div>
            )}
        </main>
    );
}
