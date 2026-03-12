'use client'
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import { motion } from 'framer-motion';
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { Loader } from "../../(student)/calendar/right/timetable";
import NewMeetingCard from "./components/NewMeetingCard";
import CreateMeetingModal from "./modal/CreateMeetingModal";
import { deactivateHrMeeting, fetchHrMeetings } from "@/lib/helpers/Hr/meetings/meetingsAPI";
import { useCollegeHr } from "@/app/utils/context/hr/useCollegeHr";
import ConfirmDeleteModal from "../../admin/calendar/components/ConfirmDeleteModal";

type MeetingType = 'upcoming' | 'previous';
type MeetingCategory = 'Hr';

interface Meeting {
    id: string;
    hrMeetingId: number;
    hrMeetingSectionsId: number;
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

const getCurrentTime12Hour = () => {
    const now = new Date();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const period = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    if (hours === 0) hours = 12;
    return `${String(hours).padStart(2, "0")}:${minutes} ${period}`;
};

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
    const isCreateModalOpen = searchParams.get('create') === 'true';
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const { collegeHrId, collegeId } = useCollegeHr()
    const itemsPerPage = 10;

    const openCreateModal = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('create', 'true');
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const closeCreateModal = () => {
        const params = new URLSearchParams(searchParams.toString());

        params.delete('create');
        params.delete('selectRole');
        params.delete('editMeetingId'); // ⭐ FIX

        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

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
        if (!currentCategory || !collegeHrId) {
            setMeetings([]);
            return;
        }
        loadMeetings();
    }, [currentType, page, collegeHrId, collegeId]);

    const loadMeetings = async () => {
        if (!collegeHrId || !collegeId) return;
        try {
            setIsLoading(true);
            const now = new Date();
            const currentDate = now.toISOString().split("T")[0];
            const currentTime = now.toTimeString().slice(0, 8);

            const res = await fetchHrMeetings({
                createdBy: collegeHrId!,
                collegeId: collegeId!,
                type: currentType,
                page,
                limit: itemsPerPage,
                currentDate,
                currentTime
            });

            const formattedMeetings: Meeting[] = res.data.map((m: any) => ({
                ...m,
                type: currentType,
                date: formatMeetingDate(m.date)
            }));

            setMeetings(formattedMeetings);
            setTotalPages(res.totalPages);

        } catch (err) {
            toast.error(`Failed to fetch ${currentType} meetings`);
            setMeetings([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteClick = (meeting: Meeting) => {
        setSelectedMeeting(meeting);
        setDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedMeeting) return;
        try {
            setIsDeleting(true);
            const res = await deactivateHrMeeting(selectedMeeting.hrMeetingId);
            if (!res.success) {
                toast.error("Failed to delete meeting");
                return;
            }
            toast.success("Meeting deleted successfully");
            loadMeetings();
            setDeleteModalOpen(false);
            setSelectedMeeting(null);
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            <div className="bg-red-00 h-screen p-2 flex flex-col">
                <div className="flex justify-between items-start mb-6 shrink-0">
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

                <div className="bg-red-00 flex flex-col h-full overflow-hidden">
                    <div className="w-full relative flex items-center justify-center mb-4 mt-2 shrink-0">
                        <div className="bg-white/80 p-2 rounded-full inline-flex gap-2 mx-auto  items-center overflow-hidden">
                            {typeTabs.map((tab) => {
                                const isActive = currentType === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => updateFilter('type', tab.id)}
                                        disabled={isActive}
                                        className={`relative z-10 focus:outline-none cursor-pointer px-5 py-2 rounded-full text-sm font-medium transition-colors ${isActive
                                            ? 'text-[#E9E9E9]'
                                            : 'text-[#414141]'
                                            }`}
                                    >
                                        {tab.label}
                                        {isActive && (
                                            <motion.div
                                                layoutId="type-pill"
                                                className="absolute inset-0 rounded-full bg-[#43C17A] shadow-sm -z-10 flex items-center justify-center"
                                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                            />
                                        )}
                                        {!isActive && (
                                            <div className="absolute focus:outline-none inset-0 rounded-full bg-[#DEDEDE] shadow-sm -z-10" />
                                        )}
                                    </button>
                                )
                            })}
                        </div>

                        <div className="absolute right-0 top-1/2 -translate-y-1/2">
                            <button
                                onClick={openCreateModal}
                                className="bg-[#43C17A] focus:outline-none text-white px-3 py-2 rounded-lg font-semibold hover:bg-[#38a869] transition-colors shadow-sm cursor-pointer"
                            >
                                Create Meeting
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 mt-4 min-h-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-10">
                            {(isLoading || !collegeHrId) ? (
                                <div className="col-span-full flex justify-center items-center h-[400px]">
                                    <Loader />
                                </div>
                            ) : meetings.length > 0 ? (
                                meetings.map((meeting) => (
                                    <NewMeetingCard key={meeting.id} data={meeting} role={"Finance"} onDelete={handleDeleteClick} />
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
                        <div className="flex justify-center pb-4 shrink-0 pt-2">
                            {/* <div className="flex items-center gap-2"> */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className={`p-2 rounded-md ${page === 1
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-gray-200 hover:bg-gray-300 cursor-pointer'
                                        }`}
                                >
                                    <CaretLeft size={16} weight="bold" />
                                </button>
                                <div className="flex items-center gap-2 max-w-[60vw] overflow-x-auto scrollbar-hide">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                                        (p) => (
                                            <button
                                                key={p}
                                                onClick={() => setPage(p)}
                                                className={`px-3 py-1 cursor-pointer rounded-md text-sm font-medium ${page === p
                                                    ? 'bg-[#16284F] text-white'
                                                    : 'bg-gray-200 hover:bg-gray-300'
                                                    }`}
                                            >
                                                {p}
                                            </button>
                                        )
                                    )}
                                </div>

                                <button
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className={`p-2 rounded-md ${page === totalPages
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-gray-200 hover:bg-gray-300 cursor-pointer'
                                        }`}
                                >
                                    <CaretRight size={16} weight="bold" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                <ConfirmDeleteModal
                    open={deleteModalOpen}
                    onConfirm={handleConfirmDelete}
                    onCancel={() => setDeleteModalOpen(false)}
                    isDeleting={isDeleting}
                    name="meeting"
                />
            </div>
            <CreateMeetingModal
                isOpen={isCreateModalOpen}
                onClose={closeCreateModal}
            />
        </>
    )
};