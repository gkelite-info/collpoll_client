'use client'
import { useUser } from "@/app/utils/context/UserContext";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import { fetchStudentFinanceMeetings } from "@/lib/helpers/finance/meetings/meetingsAPI";
import { motion } from 'framer-motion';
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Loader } from "../calendar/right/timetable";
import MeetingCard from "../../finance/meetings/components/MeetingCard";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { useStudent } from "@/app/utils/context/student/useStudent";

type MeetingType = 'upcoming' | 'previous';
type MeetingCategory = 'Student';

export interface Meeting {
    id: string;
    financeMeetingId: number;
    financeMeetingSectionsId: number;
    category: MeetingCategory;
    title: string;
    timeRange: string;
    educationType: string;
    branch: string;
    date: string;
    participants: number;
    year: string;
    section: string;
    tags: string;
    type: MeetingType;
    meetingLink: string;
    sections?: any[];
}

export default function StudentMeetingsPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const [totalPages, setTotalPages] = useState(1);
    const currentType = (searchParams.get('type') as MeetingType) || 'upcoming';
    const currentCategory = 'Student';
    const [meetings, setMeetings] = useState<Meeting[]>([]);

    const { studentId, collegeBranchCode, role } = useUser();
    const { collegeSectionsId, college_sections } = useStudent();

    const updateFilter = (key: string, value: string) => {
        setIsLoading(true);
        setPage(1)
        const params = new URLSearchParams(searchParams.toString());
        params.set(key, value);
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const formatMeetingDate = (dateStr: string) => {
        if (!dateStr) return '';
        const [year, month, day] = dateStr.split('-');
        const date = new Date(Number(year), Number(month) - 1, Number(day));
        return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const typeTabs = [
        { id: 'upcoming', label: 'Upcoming Meetings' },
        { id: 'previous', label: 'Previous Meetings' }
    ];

    useEffect(() => {
        if (!studentId || !collegeBranchCode || !collegeSectionsId) {
            setMeetings([]);
            return;
        }

        loadMeetings();
    }, [currentType, page, studentId, collegeBranchCode, collegeSectionsId]);

    const loadMeetings = async () => {
        try {
            setIsLoading(true);
            setMeetings([]);

            const res = await fetchStudentFinanceMeetings({
                role: currentCategory,
                collegeBranchCode: collegeBranchCode!,
                collegeSectionsId: Number(collegeSectionsId),
                type: currentType,
                page,
                limit: 10,
            });

            console.log("what is response", res);



            const finalMeetings: Meeting[] = res.data.map((meeting: any) => ({
                ...meeting,
                section: meeting.section || college_sections || "N/A",
                date: formatMeetingDate(meeting.date),
            }));

            setMeetings(finalMeetings);
            setTotalPages(res.totalPages || 1);
        } catch (err) {
            toast.error(`Failed to fetch ${currentType} meetings`);
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <>
            <div className="bg-red-00 h-screen p-2 flex flex-col">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-[#282828]">Meetings</h1>
                        <p className="text-[#282828] text-sm mt-1">
                            View and join scheduled meetings.
                        </p>
                    </div>
                    <div className='w-[320px]'>
                        <CourseScheduleCard isVisibile={false} />
                    </div>
                </div>
                <div className="bg-red-00">
                    <div className="flex items-center justify-center w-full">
                        <div className="bg-white/80 p-2 rounded-full inline-flex gap-2 mx-auto self-center">
                            {typeTabs.map((tab) => {
                                const isActive = currentType === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => updateFilter('type', tab.id)}
                                        className={`relative z-10 cursor-pointer px-5 py-2 rounded-full text-sm font-medium transition-colors ${isActive
                                            ? 'text-[#E9E9E9]'
                                            : 'text-[#414141]'
                                            }`}
                                    >
                                        {tab.label}
                                        {isActive && (
                                            <motion.div
                                                layoutId="type-pill"
                                                className="absolute inset-0 rounded-full bg-[#43C17A] shadow-sm -z-10"
                                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                            />
                                        )}

                                        {!isActive && (
                                            <div className="absolute inset-0 rounded-full bg-[#DEDEDE] shadow-sm -z-10" />
                                        )}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 mt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-10">
                            {isLoading ? (
                                <div className="col-span-full flex justify-center items-center h-[400px]">
                                    <Loader />
                                </div>
                            ) : meetings.length > 0 ? (
                                meetings.map((meeting) => (
                                    <MeetingCard key={meeting.id} data={meeting} role={role} />
                                ))
                            ) : (
                                <div className="col-span-full py-20 text-center text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
                                    <p className="text-lg">
                                        No {currentType} meetings found.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                    {totalPages > 1 && (
                        <div className="flex justify-center pb-4">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className={`p-2 rounded-md ${page === 1
                                        ? 'bg-gray-100 text-gray-400'
                                        : 'bg-gray-200 hover:bg-gray-300'
                                        }`}
                                >
                                    <CaretLeft size={16} weight="bold" />
                                </button>

                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                                    (p) => (
                                        <button
                                            key={p}
                                            onClick={() => setPage(p)}
                                            className={`px-3 py-1 rounded-md text-sm font-medium ${page === p
                                                ? 'bg-[#16284F] text-white'
                                                : 'bg-gray-200 hover:bg-gray-300'
                                                }`}
                                        >
                                            {p}
                                        </button>
                                    )
                                )}

                                <button
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className={`p-2 rounded-md ${page === totalPages
                                        ? 'bg-gray-100 text-gray-400'
                                        : 'bg-gray-200 hover:bg-gray-300'
                                        }`}
                                >
                                    <CaretRight size={16} weight="bold" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
};
