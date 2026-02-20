'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader } from '../../(student)/calendar/right/timetable';
import MeetingCard from './components/MeetingCard';
import CourseScheduleCard from '@/app/utils/CourseScheduleCard';
import CreateMeetingModal from './components/CreateMeetingModal';
import { fetchFinanceMeetings } from '@/lib/helpers/finance/meetings/meetingsAPI';
import { fetchSectionsForMeetings } from '@/lib/helpers/finance/meetings/meetingsSectionsAPI';
import { useFinanceManager } from '@/app/utils/context/financeManager/useFinanceManager';
import toast from 'react-hot-toast';
import { CaretLeft, CaretRight } from '@phosphor-icons/react';

type MeetingType = 'upcoming' | 'previous';
type MeetingCategory = 'Parent' | 'Student' | 'Faculty' | 'Admin';

export interface Meeting {
    id: string;
    title: string;
    timeRange: string;
    educationType: string;
    branch: string;
    date: string;
    participants: number;
    year: string;
    section: string;
    tags: string;
    category: MeetingCategory;
    type: MeetingType;
    meetingLink: string;
    sections?: any[];
}

const formatMeetingDate = (dateStr: string) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const MeetingListContent = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const currentType = (searchParams.get('type') as MeetingType) || 'upcoming';
    const currentCategory = (searchParams.get('category') as MeetingCategory) || 'Parent';
    const { financeManagerId } = useFinanceManager()

    const updateFilter = (key: string, value: string) => {
        setIsLoading(true);
        setPage(1)
        const params = new URLSearchParams(searchParams.toString());
        params.set(key, value);
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const typeTabs = [
        { id: 'upcoming', label: 'Upcoming Meetings' },
        { id: 'previous', label: 'Previous Meetings' }
    ];

    const categoryTabs = [
        { id: 'Parent', label: 'Parent Meetings' },
        { id: 'Student', label: 'Student Meetings' },
        { id: 'Faculty', label: 'Faculty Meetings' },
        { id: 'Admin', label: 'Admin Meetings' },
    ];

    useEffect(() => {
        setPage(1);
    }, [currentType, currentCategory]);

    useEffect(() => {
        if (!financeManagerId) return
        const loadMeetings = async () => {
            try {
                setIsLoading(true);
                const res = await fetchFinanceMeetings({
                    createdBy: financeManagerId,
                    role: currentCategory,
                    type: currentType,
                    page,
                    limit: 6,
                });

                const meetingIds = res.data.map((m) => m.financeMeetingId);
                const sections = await fetchSectionsForMeetings(meetingIds);
                const expandedMeetings: Meeting[] = [];

                res.data.forEach((meeting: any) => {
                    const meetingSections = sections.filter(
                        (s: any) => s.financeMeetingId === meeting.financeMeetingId
                    );

                    const formattedDate = formatMeetingDate(meeting.date);

                    if (meetingSections.length === 0) {
                        expandedMeetings.push({
                            id: String(meeting.financeMeetingId),
                            title: meeting.title ?? '',
                            timeRange: `${meeting.fromTime ?? ''} - ${meeting.toTime ?? ''}`,
                            educationType: '',
                            branch: '',
                            date: formattedDate ?? '',
                            participants: 0,
                            year: '',
                            section: '',
                            tags: '',
                            category: currentCategory,
                            type: currentType,
                            meetingLink: meeting.meetingLink ?? '',
                            sections: [],
                        });
                    } else {
                        meetingSections.forEach((s: any) => {
                            expandedMeetings.push({
                                id: `${meeting.financeMeetingId}-${s.college_sections?.collegeSectionsId ?? 'none'}`,
                                title: meeting.title ?? '',
                                timeRange: `${meeting.fromTime ?? ''} - ${meeting.toTime ?? ''}`,
                                educationType: s.college_education?.collegeEducationType ?? '',
                                branch: s.college_branch?.collegeBranchCode ?? s.college_branch?.collegeBranchType ?? '',
                                date: formattedDate ?? '',
                                participants: 0,
                                year: s.college_academic_year?.collegeAcademicYear ?? '',
                                section: s.college_sections?.collegeSections ?? '',
                                tags: '',
                                category: currentCategory,
                                type: currentType,
                                meetingLink: meeting.meetingLink ?? '',
                                sections: [s],
                            });
                        });
                    }
                });

                setMeetings(expandedMeetings);
                setTotalPages(res.totalPages || 1);
            } catch (err) {
                toast.error(`Failed to fetch ${currentCategory} in ${currentType}.`)
            } finally {
                setIsLoading(false);
            }
        };

        loadMeetings();
    }, [currentType, currentCategory, page, financeManagerId]);

    return (
        <div className="h-screen flex flex-col overflow-hidden font-sans text-slate-800">
            <div className="shrink-0 p-2 z-10">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-[#282828]">Meetings</h1>
                        <p className="text-[#282828] text-sm mt-1">
                            View and join meetings or schedule meetings
                        </p>
                    </div>
                    <div className='w-[320px]'>
                        <CourseScheduleCard isVisibile={false} />
                    </div>
                </div>

                <div className="flex mb-4 relative">
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

                    <button onClick={() => setIsModalOpen(true)} className="absolute cursor-pointer -right-1 bg-[#43C17A] text-[#E9E9E9] text-sm px-4 py-2 rounded-md font-medium flex items-center gap-2">
                        Create Meeting
                    </button>
                </div>

                <div className="flex justify-center gap-3 mb-2 flex-wrap">
                    <div className="bg-white/80 p-2 rounded-full inline-flex gap-2 relative">
                        {categoryTabs.map((tab) => {
                            const isActive = currentCategory === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => updateFilter('category', tab.id)}
                                    className={`relative px-6 py-1 cursor-pointer rounded-full text-sm font-semibold transition-colors z-10 ${isActive ? 'text-[#E9E9E9]' : 'text-[#414141]'}`}
                                >
                                    {tab.label}
                                    {isActive && (
                                        <motion.div
                                            layoutId="category-pill"
                                            className="absolute inset-0 rounded-full bg-[#16284F] shadow-sm -z-10"
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
            </div>

            <div className="flex-1 overflow-y-auto p-2 pt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-10">
                    {isLoading ? (
                        <div className="col-span-full flex justify-center items-center h-[400px]">
                            <Loader />
                        </div>
                    ) : meetings.length > 0 ? (
                        meetings.map((meeting) => (
                            <MeetingCard key={meeting.id} data={meeting} />
                        ))
                    ) : (
                        <div className="col-span-full py-30 text-center text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
                            <p className="text-lg">
                                No meetings found for {currentCategory} in {currentType}.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {totalPages > 1 && (
                <div className="flex justify-center mt-6 overflow-x-auto pb-4">
                    <div className="flex items-center gap-2 min-w-max px-2">
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className={`p-2 rounded-md flex items-center justify-center transition-colors ${page === 1
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300 cursor-pointer"
                                }`}
                        >
                            <CaretLeft size={16} weight="bold" />
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                            <button
                                key={p}
                                onClick={() => setPage(p)}
                                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${page === p
                                    ? "bg-[#16284F] text-white"
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300 cursor-pointer"
                                    }`}
                            >
                                {p}
                            </button>
                        ))}
                        <button
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className={`p-2 rounded-md flex items-center justify-center transition-colors ${page === totalPages
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300 cursor-pointer"
                                }`}
                        >
                            <CaretRight size={16} weight="bold" />
                        </button>
                    </div>
                </div>
            )}

            <CreateMeetingModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />

        </div>
    );
};

export default function MeetingsPage() {
    return (
        <Suspense fallback={<div><Loader /></div>}>
            <MeetingListContent />
        </Suspense>
    );
}