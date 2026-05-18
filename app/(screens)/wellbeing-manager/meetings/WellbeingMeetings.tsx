'use client'
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import { motion } from 'framer-motion';
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import MeetingCard from "../../finance/meetings/components/MeetingCard";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import MeetingCardShimmer from "@/app/utils/shimmers/MeetingCardShimmer";

type MeetingType = 'upcoming' | 'previous';

const MOCK_MEETINGS = [
    {
        id: "1",
        financeMeetingId: 101,
        financeMeetingSectionsId: 201,
        category: "Faculty",
        title: "Wellbeing Sync Up",
        timeRange: "10:00  - 11:30 ",
        educationType: "UG",
        branch: "Computer Science",
        description: "Monthly discussion on student wellbeing initiatives and progress tracking.",
        date: "24 Nov 2024",
        participants: 12,
        year: "2nd Year",
        section: "A, B",
        tags: "Mental Health, Planning",
        type: "upcoming",
        meetingLink: "https://meet.google.com/abc-defg-hij"
    },
    {
        id: "2",
        financeMeetingId: 102,
        financeMeetingSectionsId: 202,
        category: "Faculty",
        title: "Counseling Orientation",
        timeRange: "02:00 - 03:00",
        educationType: "UG",
        branch: "Electronics",
        description: "Orientation for new counselors and mentors.",
        date: "25 Nov 2024",
        participants: 8,
        year: "1st Year",
        section: "C",
        tags: "Orientation, Guidance",
        type: "upcoming",
        meetingLink: "https://meet.google.com/xyz-uvwx-yz"
    },
    {
        id: "3",
        financeMeetingId: 103,
        financeMeetingSectionsId: 203,
        category: "Faculty",
        title: "Past Wellbeing Review",
        timeRange: "04:00 - 05:00",
        educationType: "PG",
        branch: "Management",
        description: "Review of last month's counseling sessions and feedback.",
        date: "10 Nov 2024",
        participants: 15,
        year: "Final Year",
        section: "All",
        tags: "Review, Feedback",
        type: "previous",
        meetingLink: "https://meet.google.com/qwe-rtyu-iop"
    }
];

export default function WellbeingMeetingsPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const [totalPages, setTotalPages] = useState(1);
    const currentType = (searchParams.get('type') as MeetingType) || 'upcoming';
    const [meetings, setMeetings] = useState<any[]>([]);

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

    useEffect(() => {
        loadMeetings();
    }, [currentType, page]);

    const loadMeetings = () => {
        setIsLoading(true);
        setTimeout(() => {
            const filtered = MOCK_MEETINGS.filter(m => m.type === currentType);
            setMeetings(filtered);
            setTotalPages(1);
            setIsLoading(false);
        }, 800);
    };

    return (
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
                                            layoutId="type-pill-wb"
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
                            <MeetingCardShimmer
                                role="Wellbeing Manager"
                                category="Faculty"
                                type={currentType}
                                count={4}
                            />
                        ) : meetings.length > 0 ? (
                            meetings.map((meeting) => (
                                <MeetingCard key={meeting.id} data={meeting} role="Wellbeing Manager" />
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
    )
};
