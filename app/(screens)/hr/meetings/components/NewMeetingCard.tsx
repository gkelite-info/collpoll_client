'use client';

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Laptop, PencilSimple, Trash, X } from "@phosphor-icons/react";

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

const formatToAMPM = (timeStr: string) => {
    if (!timeStr) return "";
    const [hourStr, minuteStr] = timeStr.split(":");
    let hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return `${String(hour).padStart(2, '0')}:${minuteStr} ${ampm}`;
};

const DetailPill = ({ label }: { label: string | number }) => (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-normal bg-[#16284F1F] text-[#16284F] mx-1">
        {label}
    </span>
);

export default function NewMeetingCard({
    data,
    onDelete,
    role,
    category,
    onEdit,
}: {
    data: Meeting;
    onDelete?: (meeting: Meeting) => void;
    role: string | null;
    category?: string | null;
    onEdit?: (meetingId: number, sectionId: number | null) => void;
}) {
    const [fromTime, toTime] = data.timeRange.split(" - ");
    const formattedTimeRange = `${formatToAMPM(fromTime)} - ${formatToAMPM(toTime)}`;
    const [isModalOpen, setIsModalOpen] = useState(false);

    const mockFaculties = Array.from({ length: Math.min(data.participants, 4) }).map((_, i) => ({
        id: i,
        name: i === 0 ? "Sameer Shaik" : `Faculty ${i + 1}`,
        avatar: `https://i.pravatar.cc/100?u=${data.id}-${i}`
    }));

    return (
        <>
            <div
                onClick={() => setIsModalOpen(true)}
                className="bg-[#FFFFFF] rounded-t-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow cursor-pointer"
            >
                <div className="bg-[#43C17A26] px-4 py-3 flex items-center justify-between gap-3 border-b-2 border-dashed border-[#43C17A]">
                    <div className="flex gap-2 items-center justify-center">
                        <div className="bg-[#43C17A] p-1.5 rounded-full text-white">
                            <Laptop size={18} weight="fill" color="#ffffff" />
                        </div>
                        <span className="text-[#11934A] font-medium text-base tracking-wide">
                            {formattedTimeRange}
                        </span>
                    </div>

                    {(data.type === "upcoming" && role === "Finance") && (
                        <div className="flex gap-2 items-center justify-center">
                            <button
                                className="w-8 h-8 cursor-pointer flex items-center justify-center rounded-full bg-white shadow-sm hover:bg-gray-50"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit?.(data.financeMeetingId, data.financeMeetingSectionsId);
                                }}
                            >
                                <PencilSimple size={16} weight="fill" className="text-[#43C17A]" />
                            </button>

                            <button
                                className="w-8 h-8 cursor-pointer flex items-center justify-center rounded-full bg-white shadow-sm hover:bg-gray-50"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete?.(data);
                                }}
                            >
                                <Trash size={16} weight="fill" className="text-[#FF0000]" />
                            </button>
                        </div>
                    )}
                </div>

                <div className="p-4 flex-1 flex flex-col gap-3">
                    <div className="flex justify-between items-start gap-2">
                        <div className="overflow-x-auto whitespace-nowrap max-w-full scrollbar-hide">
                            <h2 className="text-[#43C17A] font-semibold leading-tight inline-block">
                                {data.title}
                            </h2>
                        </div>
                        {data.branch && (
                            <span className="bg-[#43C17A] text-white px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap">
                                {data.branch} {data.section && data.section !== "N/A" ? `- ${data.section}` : ""}
                            </span>
                        )}
                    </div>

                    <div className="flex items-start gap-2">
                        <span className="text-[#303030] font-normal text-sm whitespace-nowrap">Description :</span>
                        <p className="text-sm text-[#16284F] line-clamp-2 leading-relaxed">
                            {data.description}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-[#303030] font-normal text-sm whitespace-nowrap">Date :</span>
                        <DetailPill label={data.date} />
                    </div>

                    <div className="flex items-center justify-between ">
                        <div className="flex items-center">
                            <div className="flex -space-x-2">
                                {mockFaculties.slice(0, 3).map((f) => (
                                    <img
                                        key={f.id}
                                        src={f.avatar}
                                        alt={f.name}
                                        className="w-8 h-8 rounded-full border-[2px] border-white object-cover"
                                    />
                                ))}
                            </div>
                            <span className="text-sm text-[#303030] ml-3 font-medium">
                                + {data.participants} Faculties
                            </span>
                        </div>

                        <button
                            className={`px-5 py-1.5 rounded-full cursor-pointer text-sm font-semibold transition-colors ${data.type === 'previous'
                                ? 'bg-[#E9E9E9] text-[#7A7A7A] cursor-not-allowed'
                                : 'bg-[#16284F] text-white hover:bg-[#111e3b]'
                                }`}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (data.type !== "previous") {
                                    window.open(data.meetingLink, '_blank', 'noopener,noreferrer');
                                }
                            }}
                        >
                            {data.type === 'previous' ? 'Completed' : 'Join Meeting'}
                        </button>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsModalOpen(false)}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 10 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-xl shadow-xl w-full max-w-xl overflow-hidden p-5 relative"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h2 className="text-lg font-bold text-[#282828]">
                                    {data.title}
                                </h2>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-1 hover:bg-gray-100 cursor-pointer rounded-full transition-colors"
                                >
                                    <X size={24} className="text-[#555555]" />
                                </button>
                            </div>

                            <p className="text-sm text-[#555555] mb-6 leading-relaxed">
                                This meeting is Scheduled to discuss {data.description.toLowerCase()}
                            </p>

                            <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                                <div className="flex flex-col gap-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[#414141] text-sm">Date :</span>
                                        <DetailPill label={data.date || "N/A"} />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[#414141] text-sm">Time :</span>
                                        <DetailPill label={formattedTimeRange} />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[#414141] text-sm">Branch :</span>
                                        <DetailPill label={data.branch || "N/A"} />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[#414141] text-sm">Year :</span>
                                        <DetailPill label={data.year || "N/A"} />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[#414141] text-sm">Section :</span>
                                        <DetailPill label={data.section || "N/A"} />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-[#414141] text-sm">Faculties :</span>
                                        <div className="flex items-center">
                                            {data.participants === 1 ? (
                                                <div className="flex items-center gap-2">
                                                    <img
                                                        src={mockFaculties[0].avatar}
                                                        alt={mockFaculties[0].name}
                                                        className="w-7 h-7 rounded-full object-cover"
                                                    />
                                                    <span className="text-sm text-[#16284F] font-medium">
                                                        {mockFaculties[0].name}
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center">
                                                    <div className="flex -space-x-2">
                                                        {mockFaculties.slice(0, 3).map((f) => (
                                                            <img
                                                                key={f.id}
                                                                src={f.avatar}
                                                                alt={f.name}
                                                                className="w-7 h-7 rounded-full border-2 border-white object-cover"
                                                            />
                                                        ))}
                                                    </div>
                                                    {data.participants > 3 && (
                                                        <span className="text-sm text-[#16284F] font-medium ml-2">
                                                            + {data.participants - 3}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}