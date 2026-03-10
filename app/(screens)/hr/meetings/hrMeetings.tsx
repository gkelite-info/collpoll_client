'use client'
import { useUser } from "@/app/utils/context/UserContext";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
// import { fetchAdminFinanceMeetings } from "@/lib/helpers/finance/meetings/meetingsAPI";
import { motion } from 'framer-motion';
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { Loader } from "../../(student)/calendar/right/timetable";
import NewMeetingCard from "./components/NewMeetingCard";

type MeetingType = 'upcoming' | 'previous';
type MeetingCategory = 'Hr';

interface Meeting {
    id: string;
    financeMeetingId: number;
    financeMeetingSectionsId: number;
    category: MeetingCategory;
    title: string;
    timeRange: string;
    educationType: string;
    branch: string;
    description: string;
    date: string;
    participants: number;
    year: string;
    section: string;
    tags: string;
    type: MeetingType;
    meetingLink: string;
    sections?: any[];
}

const MOCK_MEETINGS: Meeting[] = [
    { id: 'u1', financeMeetingId: 101, financeMeetingSectionsId: 1, category: 'Hr', title: 'Q2 Budget Allocation Review', timeRange: '10:00 - 11:30', educationType: 'B.Tech', branch: 'CSE', description: 'Reviewing department-wise budget requests for Q2.', date: '25 Mar 2026', participants: 15, year: '2026', section: 'A', tags: 'Budget, Planning', type: 'upcoming', meetingLink: 'https://meet.google.com/abc-defg-hij' },
    { id: 'u2', financeMeetingId: 102, financeMeetingSectionsId: 2, category: 'Hr', title: 'Infrastructure Expansion Funds', timeRange: '02:00  - 03:00 ', educationType: 'M.Tech', branch: 'Civil', description: 'Discussing the release of funds for the new library wing.', date: '28 Mar 2026', participants: 8, year: '2026', section: 'B', tags: 'Infrastructure, Capital', type: 'upcoming', meetingLink: 'https://meet.google.com/xyz-uvwx-yz' },
    { id: 'u3', financeMeetingId: 103, financeMeetingSectionsId: 3, category: 'Hr', title: 'Faculty Salary Revisions', timeRange: '11:00 - 12:30 ', educationType: 'B.Sc', branch: 'Physics', description: 'Annual appraisal and salary revision meeting.', date: '02 Apr 2026', participants: 12, year: '2026', section: 'A', tags: 'HR, Payroll', type: 'upcoming', meetingLink: 'https://meet.google.com/qwe-rtyu-iop' },
    { id: 'u4', financeMeetingId: 104, financeMeetingSectionsId: 4, category: 'Hr', title: 'Scholarship Grant Approvals', timeRange: '04:00  - 05:00 ', educationType: 'B.Tech', branch: 'ECE', description: 'Finalizing the list of students for merit scholarships.', date: '05 Apr 2026', participants: 20, year: '2026', section: 'C', tags: 'Grants, Students', type: 'upcoming', meetingLink: 'https://meet.google.com/asd-fghj-klz' },
    { id: 'u5', financeMeetingId: 105, financeMeetingSectionsId: 5, category: 'Hr', title: 'Alumni Endowment Review', timeRange: '09:00 - 10:30', educationType: 'MBA', branch: 'Finance', description: 'Reviewing recent alumni contributions and fund allocation.', date: '10 Apr 2026', participants: 10, year: '2026', section: 'N/A', tags: 'Alumni, Funds', type: 'upcoming', meetingLink: 'https://meet.google.com/xcv-bnmq-wer' },
    { id: 'u6', financeMeetingId: 106, financeMeetingSectionsId: 6, category: 'Hr', title: 'Vendor Payment Schedules', timeRange: '03:00  - 04:30 ', educationType: 'B.Tech', branch: 'Mechanical', description: 'Setting up payment milestones for lab equipment vendors.', date: '15 Apr 2026', participants: 6, year: '2026', section: 'A', tags: 'Vendors, Procurement', type: 'upcoming', meetingLink: 'https://meet.google.com/tyu-iopa-sdf' },

    { id: 'p1', financeMeetingId: 201, financeMeetingSectionsId: 7, category: 'Hr', title: 'Annual Financial Audit', timeRange: '10:00 - 01:00', educationType: 'All', branch: 'All', description: 'External audit of the college financial records.', date: '10 Feb 2026', participants: 25, year: '2025', section: 'All', tags: 'Audit, Compliance', type: 'previous', meetingLink: 'https://meet.google.com/prev-123' },
    { id: 'p2', financeMeetingId: 202, financeMeetingSectionsId: 8, category: 'Hr', title: 'Tech Fest Sponsorships', timeRange: '02:00 - 03:00', educationType: 'B.Tech', branch: 'IT', description: 'Finalizing sponsor funds for the upcoming tech fest.', date: '15 Feb 2026', participants: 14, year: '2026', section: 'A', tags: 'Events, Sponsorship', type: 'previous', meetingLink: 'https://meet.google.com/prev-456' },
    { id: 'p3', financeMeetingId: 203, financeMeetingSectionsId: 9, category: 'Hr', title: 'Hostel Maintenance Budget', timeRange: '11:00 - 12:00', educationType: 'B.Tech', branch: 'Facilities', description: 'Approving the quarterly budget for hostel repairs.', date: '20 Feb 2026', participants: 9, year: '2026', section: 'N/A', tags: 'Maintenance, Operations', type: 'previous', meetingLink: 'https://meet.google.com/prev-789' },
    { id: 'p4', financeMeetingId: 204, financeMeetingSectionsId: 10, category: 'Hr', title: 'Emergency Software Licensing', timeRange: '04:00 - 04:45', educationType: 'B.Tech', branch: 'CSE', description: 'Approval for urgent renewal of IDE licenses.', date: '25 Feb 2026', participants: 5, year: '2026', section: 'B', tags: 'Software, IT', type: 'previous', meetingLink: 'https://meet.google.com/prev-abc' },
    { id: 'p5', financeMeetingId: 205, financeMeetingSectionsId: 11, category: 'Hr', title: 'Research Grant Allocation', timeRange: '09:30 - 11:00', educationType: 'Ph.D', branch: 'Biotech', description: 'Allocating state grants to ongoing research projects.', date: '01 Mar 2026', participants: 18, year: '2026', section: 'A', tags: 'Research, Grants', type: 'previous', meetingLink: 'https://meet.google.com/prev-def' },
    { id: 'p6', financeMeetingId: 206, financeMeetingSectionsId: 12, category: 'Hr', title: 'Transportation Fleet Insurance', timeRange: '01:00 - 02:00', educationType: 'B.Tech', branch: 'Transport', description: 'Negotiating insurance renewals for college buses.', date: '05 Mar 2026', participants: 7, year: '2026', section: 'N/A', tags: 'Transport, Insurance', type: 'previous', meetingLink: 'https://meet.google.com/prev-ghi' },
];

export default function MeetingsPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const [totalPages, setTotalPages] = useState(1);
    const currentType = (searchParams.get('type') as MeetingType) || 'upcoming';
    const currentCategory = 'Student';
    const [meetings, setMeetings] = useState<Meeting[]>([]);

    const updateFilter = (key: string, value: string) => {
        setIsLoading(true);
        setPage(1)
        const params = new URLSearchParams(searchParams.toString());
        params.set(key, value);
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const formatMeetingDate = (dateStr: string) => {
        if (!dateStr) return '';
        if (dateStr.includes(' ')) return dateStr;
        const [year, month, day] = dateStr.split('-');
        const date = new Date(Number(year), Number(month) - 1, Number(day));
        return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const typeTabs = [
        { id: 'upcoming', label: 'Upcoming Meetings' },
        { id: 'previous', label: 'Previous Meetings' }
    ];

    useEffect(() => {
        if (!currentCategory) {
            setMeetings([]);
            return;
        }
        loadMeetings();

    }, [currentType, page]);

    const loadMeetings = async () => {
        try {
            setIsLoading(true);

            /*
            const res = await fetchAdminFinanceMeetings({
                role: currentCategory,
                type: currentType,
                page,
                limit: 10,
            });

            const finalMeetings: Meeting[] = res.data.map((meeting: any) => ({
                ...meeting,
                section: meeting.section || "N/A",
                date: formatMeetingDate(meeting.date),
            }));

            setMeetings(finalMeetings);
            setTotalPages(res.totalPages || 1);
            */

            setTimeout(() => {
                const filteredMeetings = MOCK_MEETINGS.filter(m => m.type === currentType);

                const finalMeetings: Meeting[] = filteredMeetings.map((meeting: any) => ({
                    ...meeting,
                    section: meeting.section || "N/A",
                    date: formatMeetingDate(meeting.date),
                }));

                setMeetings(finalMeetings);
                setTotalPages(1);
                setIsLoading(false);
            }, 500);

        } catch (err) {
            toast.error(`Failed to fetch ${currentType} meetings`);
            setIsLoading(false);
        }
        finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="bg-red-00 h-screen p-2 flex flex-col">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-[#282828]">Meetings</h1>
                    <p className="text-[#282828] text-sm mt-1">
                        View and join meetings scheduled by the Tekton Campus team
                    </p>
                </div>
                <div className='w-[320px]'>
                    <CourseScheduleCard isVisibile={false} />
                </div>
            </div>
            <div className="bg-red-00 flex flex-col flex-1 min-h-0">
                <div className="flex items-center justify-center w-full sticky top-0 z-20 py-2">
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
                <div className="flex-1 overflow-y-auto p-2 mt-4 min-h-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-10">
                        {isLoading ? (
                            <div className="col-span-full flex justify-center items-center h-[400px]">
                                <Loader />
                            </div>
                        ) : meetings.length > 0 ? (
                            meetings.map((meeting) => (
                                <NewMeetingCard key={meeting.id} data={meeting} role={"Finance"} />
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