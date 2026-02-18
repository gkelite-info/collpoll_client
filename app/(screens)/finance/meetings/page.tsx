'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader } from '../../(student)/calendar/right/timetable';
import DateBadge from './components/DateBadge';
import MeetingCard from './components/MeetingCard';

type MeetingType = 'upcoming' | 'previous';
type MeetingCategory = 'parent' | 'student' | 'faculty' | 'admin';

export interface Meeting {
    id: string;
    title: string;
    timeRange: string;
    educationType: string;
    date: string;
    participants: number;
    year: string;
    section: string;
    tags?: string[];
    category: MeetingCategory;
    type: MeetingType;
}

const MOCK_MEETINGS: Meeting[] = [
    {
        id: '1',
        title: 'Fee Structure Discussion',
        timeRange: '8:00 AM - 9:00 AM',
        educationType: 'B.Tech',
        date: '20 Feb 2026',
        participants: 20,
        year: '2nd Year',
        section: 'A',
        tags: ['CSE'],
        category: 'parent',
        type: 'upcoming',
    },
    {
        id: '2',
        title: 'Digital Payment Process Awareness',
        timeRange: '8:00 AM - 9:00 AM',
        educationType: 'B.Tech',
        date: '20 Feb 2026',
        participants: 20,
        year: '2nd Year',
        section: 'A',
        category: 'parent',
        type: 'upcoming',
    },
    {
        id: '3',
        title: 'Tuition & Exam Fee Clarification',
        timeRange: '8:00 AM - 9:00 AM',
        educationType: 'B.Tech',
        date: '20 Feb 2026',
        participants: 20,
        year: '2nd Year',
        section: 'A',
        tags: ['CSE'],
        category: 'parent',
        type: 'upcoming',
    },
    {
        id: '4',
        title: 'Upcoming Academic Year Planning',
        timeRange: '8:00 AM - 9:00 AM',
        educationType: 'B.Tech',
        date: '20 Feb 2026',
        participants: 20,
        year: '2nd Year',
        section: 'A',
        category: 'parent',
        type: 'upcoming',
    },
    {
        id: '5',
        title: 'Hostel Administration Review',
        timeRange: '10:00 AM - 11:00 AM',
        educationType: 'B.Tech',
        date: '21 Feb 2026',
        participants: 15,
        year: '3rd Year',
        section: 'B',
        category: 'parent',
        type: 'upcoming',
    },
    {
        id: '6',
        title: 'Placement Cell Orientation',
        timeRange: '11:00 AM - 12:00 PM',
        educationType: 'B.Tech',
        date: '22 Feb 2026',
        participants: 120,
        year: '4th Year',
        section: 'All',
        category: 'parent',
        type: 'upcoming',
    },
    {
        id: '7',
        title: 'Library Digital Access',
        timeRange: '02:00 PM - 03:00 PM',
        educationType: 'B.Tech',
        date: '22 Feb 2026',
        participants: 40,
        year: '1st Year',
        section: 'A',
        category: 'parent',
        type: 'upcoming',
    },
];

const MeetingListContent = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const currentType = (searchParams.get('type') as MeetingType) || 'upcoming';
    const currentCategory = (searchParams.get('category') as MeetingCategory) || 'parent';

    const updateFilter = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set(key, value);
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const filteredMeetings = MOCK_MEETINGS.filter(
        (m) => m.type === currentType && m.category === currentCategory
    );

    const typeTabs = [
        { id: 'upcoming', label: 'Upcoming Meetings' },
        { id: 'previous', label: 'Previous Meetings' }
    ];

    const categoryTabs = [
        { id: 'parent', label: 'Parent Meetings' },
        { id: 'student', label: 'Student Meetings' },
        { id: 'faculty', label: 'Faculty Meetings' },
        { id: 'admin', label: 'Admin Meetings' },
    ];

    return (
        <div className="h-screen flex flex-col overflow-hidden bg-[#e8eaed] font-sans text-slate-800">
            <div className="shrink-0 p-6 pb-2 z-10">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Meetings</h1>
                        <p className="text-gray-600 mt-1">
                            View and join meetings or schedule meetings
                        </p>
                    </div>
                    <div className="flex flex-col items-end gap-4">
                        <DateBadge />
                        <button className="bg-[#4ade80] hover:bg-green-400 text-white px-6 py-2 rounded-md font-medium shadow-sm transition-colors flex items-center gap-2">
                            Create Meeting
                        </button>
                    </div>
                </div>

                <div className="flex justify-center mb-6">
                    <div className="bg-gray-200 p-1 rounded-full inline-flex relative">
                        {typeTabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => updateFilter('type', tab.id)}
                                className={`relative z-10 px-6 py-2 rounded-full text-sm font-medium transition-colors ${currentType === tab.id ? 'text-white' : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                {tab.label}
                                {currentType === tab.id && (
                                    <motion.div
                                        layoutId="type-pill"
                                        className="absolute inset-0 rounded-full bg-[#4ade80] shadow-sm -z-10"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex justify-center gap-3 mb-4 flex-wrap">
                    {categoryTabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => updateFilter('category', tab.id)}
                            className={`relative px-6 py-2 rounded-full text-sm font-semibold transition-colors z-10 ${currentCategory === tab.id ? 'text-white' : 'text-gray-600 hover:bg-gray-200/50'
                                }`}
                        >
                            {tab.label}
                            {currentCategory === tab.id && (
                                <motion.div
                                    layoutId="category-pill"
                                    className="absolute inset-0 rounded-full bg-[#1e293b] shadow-sm -z-10"
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 pt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6 pb-20">
                    {filteredMeetings.length > 0 ? (
                        filteredMeetings.map((meeting) => (
                            <MeetingCard key={meeting.id} data={meeting} />
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
                            <p className="text-lg">No meetings found for {currentCategory} in {currentType}.</p>
                        </div>
                    )}
                </div>
            </div>

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