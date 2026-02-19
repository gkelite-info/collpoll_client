'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader } from '../../(student)/calendar/right/timetable';
import MeetingCard from './components/MeetingCard';
import CourseScheduleCard from '@/app/utils/CourseScheduleCard';
import { MOCK_MEETINGS } from './components/mockMeetings'
import CreateMeetingModal from './components/CreateMeetingModal';

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
    tags: string;
    category: MeetingCategory;
    type: MeetingType;
}

const MeetingListContent = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const currentType = (searchParams.get('type') as MeetingType) || 'upcoming';
    const currentCategory = (searchParams.get('category') as MeetingCategory) || 'parent';

    const updateFilter = (key: string, value: string) => {
        setIsLoading(true);
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

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 500);

        return () => clearTimeout(timer);
    }, [currentType, currentCategory]);

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
                            <Loader /> {/* ✅ centered loader */}
                        </div>
                    ) : filteredMeetings.length > 0 ? (
                        filteredMeetings.map((meeting) => (
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