'use client'
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import { AnimatePresence, motion } from 'framer-motion';
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import MeetingCard from "../../finance/meetings/components/MeetingCard";
import { Plus } from "@phosphor-icons/react";
import MeetingCardShimmer from "@/app/utils/shimmers/MeetingCardShimmer";
import CreateMeetingModal from "./components/CreateMeetingModal";
import SelectExecutiveModal from "./components/SelectExecutiveModal";
import { Pagination } from "../../admin/academic-setup/components/pagination";
import ConfirmDeleteModal from "../../admin/calendar/components/ConfirmDeleteModal";

type MeetingType = 'upcoming' | 'previous';

const MOCK_MEETINGS = Array.from({ length: 30 }).map((_, i) => ({
    id: String(i + 1),
    financeMeetingId: 100 + i,
    financeMeetingSectionsId: 200 + i,
    category: "Faculty",
    title: i < 15 ? "Hostel Issues Review Meeting" : "Safety Drill Coordination",
    timeRange: "08:00 - 09:00",
    educationType: "UG",
    branch: "CSE",
    description: i < 15
        ? "Weekly discussion pending hostel complaints..."
        : "Planning and coordination for upcoming safety drill...",
    date: i < 15 ? "20 Feb 2026" : "15 Jan 2026",
    participants: Math.floor(Math.random() * 20) + 1,
    year: "2nd Year",
    section: "A, B",
    tags: "Review",
    type: i < 15 ? "upcoming" : "previous",
    meetingLink: "https://meet.google.com/abc-defg-hij",
    hostName: "Sare ali khan",
    hostImage: "https://i.pravatar.cc/150?img=" + (i % 50)
}));

export type Executive = {
    id: string;
    name: string;
    department: string;
    empId: string;
    avatar: string;
};

const ITEMS_PER_PAGE = 10;

export default function WellbeingMeetingsPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const currentType = (searchParams.get('type') as MeetingType) || 'upcoming';
    const [meetings, setMeetings] = useState<any[]>([]);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isSelectExecutiveModalOpen, setIsSelectExecutiveModalOpen] = useState(false);
    const [selectedExecutives, setSelectedExecutives] = useState<Executive[]>([]);
    const [meetingToEdit, setMeetingToEdit] = useState<any>(null);
    const [meetingToDelete, setMeetingToDelete] = useState<any>(null);

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
            const simulatedServerResponse = filtered.slice(
                (page - 1) * ITEMS_PER_PAGE,
                page * ITEMS_PER_PAGE
            );
            setMeetings(simulatedServerResponse);
            setTotalItems(filtered.length);
            setIsLoading(false);
        }, 800);
    };

    const handleOpenExecutiveSelect = () => {
        setIsCreateModalOpen(false);
        setIsSelectExecutiveModalOpen(true);
    };

    const handleCloseExecutiveSelect = () => {
        setIsSelectExecutiveModalOpen(false);
        setIsCreateModalOpen(true);
    };

    const handleEditMeeting = (meetingId: number) => {
        const meeting = meetings.find(m => m.meetingId === meetingId);
        if (meeting) {
            setMeetingToEdit(meeting);
            setSelectedExecutives([{
                id: "mock-1",
                name: meeting.hostName,
                department: "Faculty",
                empId: "12345",
                avatar: meeting.hostImage
            }]);
            setIsCreateModalOpen(true);
        }
    };

    const handleConfirmDelete = () => {
        if (meetingToDelete) {
            setMeetings(prev => prev.filter(m => m.id !== meetingToDelete.id));
            setTotalItems(prev => prev - 1);
            setMeetingToDelete(null);
        }
    };

    const handleCloseCreateModal = () => {
        setIsCreateModalOpen(false);
        setMeetingToEdit(null);
        setSelectedExecutives([]);
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
            <div className="bg-red-00 pb-5">
                <div className="flex items-center justify-between w-full relative mb-4 max-md:flex-col max-md:gap-4">
                    <div className="hidden md:block w-32"></div>
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
                    <div className="flex justify-end  max-md:w-full">
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="bg-[#16284F] text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 hover:bg-[#0f1c38] transition-colors cursor-pointer w-full justify-center md:w-auto"
                        >
                            <Plus size={16} weight="bold" />
                            Create Meeting
                        </button>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-2 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {isLoading ? (
                            <MeetingCardShimmer
                                role="Wellbeing Manager"
                                category="Faculty"
                                type={currentType}
                                count={8}
                            />
                        ) : meetings.length > 0 ? (
                            meetings.map((meeting) => (
                                <MeetingCard
                                    key={meeting.id}
                                    data={meeting}
                                    role="Wellbeing Manager"
                                    onDelete={() => setMeetingToDelete(meeting)}
                                    onEdit={() => handleEditMeeting(meeting.meetingId)}
                                />
                            ))
                        ) : (
                            <div className="col-span-full py-20 text-center text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
                                <p className="text-lg">
                                    No {currentType} meetings found.
                                </p>
                            </div>
                        )}
                    </div>
                    {!isLoading && totalItems > 0 && (
                        <Pagination
                            currentPage={page}
                            totalItems={totalItems}
                            itemsPerPage={ITEMS_PER_PAGE}
                            onPageChange={setPage}
                            roundedBottom="rounded-b-xl pb-4"
                        />
                    )}
                </div>

            </div>
            <AnimatePresence>
                {isCreateModalOpen && (
                    <CreateMeetingModal
                        onClose={() => setIsCreateModalOpen(false)}
                        onOpenExecutiveSelect={handleOpenExecutiveSelect}
                        selectedExecutives={selectedExecutives}
                        onRemoveExecutive={(id) => setSelectedExecutives(prev => prev.filter(e => e.id !== id))}
                        editData={meetingToEdit}
                    />
                )}
                {isSelectExecutiveModalOpen && (
                    <SelectExecutiveModal
                        onClose={handleCloseExecutiveSelect}
                        selectedExecutives={selectedExecutives}
                        setSelectedExecutives={setSelectedExecutives}
                    />
                )}

                {meetingToDelete && (
                    <ConfirmDeleteModal
                        open={!!meetingToDelete}
                        onConfirm={handleConfirmDelete}
                        onCancel={() => setMeetingToDelete(null)}
                        title="Delete"
                        name={`"${meetingToDelete.title}"`}
                        actionType="remove"
                    />
                )}
            </AnimatePresence>
        </div>
    )
};
