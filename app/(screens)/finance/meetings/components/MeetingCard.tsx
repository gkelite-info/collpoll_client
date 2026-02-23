'use client';

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Laptop, PencilSimple, Trash, X } from "@phosphor-icons/react";
import PillTag from "./PillTag";
import { Meeting } from "../page";

const formatToAMPM = (timeStr: string) => {
    if (!timeStr) return "";
    const [hourStr, minuteStr] = timeStr.split(":");
    let hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return `${String(hour).padStart(2, '0')}:${minuteStr} ${ampm}`;
};

export default function MeetingCard({ data, onDelete, role, category, onEdit, }: { data: Meeting, onDelete?: (meeting: Meeting) => void; role: string | null, category?: string | null, onEdit?: (meeting: number, sectionId: number | null) => void; },) {
    const [fromTime, toTime] = data.timeRange.split(" - ");
    const formattedTimeRange = `${formatToAMPM(fromTime)} - ${formatToAMPM(toTime)}`;
    const [isModalOpen, setIsModalOpen] = useState(false);
    return (
        <>
            <div
                onClick={() => setIsModalOpen(true)}
                className="bg-white rounded-t-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow cursor-pointer">
                <div className="bg-[#43C17A26] px-4 py-2 flex items-center justify-between gap-3 border-b-2 border-dotted border-[#43C17A]">
                    <div className="flex gap-2 items-center justify-center">
                        <div className="bg-[#43C17A] p-1 rounded-full text-white">
                            <Laptop size={20} weight="fill" color="#E9E9E9" />
                        </div>
                        <span className="text-[#11934A] font-medium text-base">{formattedTimeRange}</span>
                    </div>
                    {(data.type === "upcoming" && role === "Finance") &&
                        <div className="flex gap-2 items-center justify-center">
                            <button
                                className="w-7 h-7 cursor-pointer flex items-center justify-center rounded-full bg-white"
                                onClick={(e: any) => {
                                    e.stopPropagation();
                                    onEdit?.(data.financeMeetingId, data.financeMeetingSectionsId)
                                }
                                }
                            >
                                <PencilSimple size={16} weight="fill" className="text-[#43C17A]" />
                            </button>

                            <button
                                className="w-7 h-7 cursor-pointer flex items-center justify-center rounded-full bg-white"
                                onClick={(e: any) => {
                                    e.stopPropagation();
                                    onDelete?.(data)
                                }
                                }
                            >
                                <Trash size={16} weight="fill" className="text-[#FF0000]" />
                            </button>
                        </div>
                    }
                </div>

                <div className="p-4 flex-1 flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                        <div className="w-[80%] overflow-x-auto whitespace-nowrap scrollbar-hide">
                            <h2 className="text-[#43C17A] font-semibold inline-block min-w-full">
                                {data.title}
                            </h2>
                        </div>
                        {category !== "Admin" &&
                            <span className="bg-[#22c55e] text-[#ffffff] px-3 py-1 rounded-full text-xs whitespace-nowrap">
                                {data.branch} - {data.section}
                            </span>
                        }
                    </div>

                    <div className="space-y-3 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                            <span className="min-w-22 text-[#303030] font-normal text-sm">Description :</span>
                            <p className="truncate text-sm text-[#16284F]">{data.description}</p>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-1">
                                <span className="min-w-20.5 text-[#303030] font-normal text-base">Date :</span>
                                <PillTag label={data.date} />
                            </div>
                            <button
                                className={`px-4 py-1 rounded-full text-sm font-medium ${data.type === 'previous'
                                    ? 'bg-[#CDCDCD] text-[#414141]'
                                    : 'bg-[#16284F] text-white cursor-pointer'
                                    }`}
                                onClick={(e: any) => {
                                    e.stopPropagation();
                                    data.type !== "previous" && window.open(data.meetingLink, '_blank', 'noopener,noreferrer')
                                }
                                }
                            >
                                {data.type === 'previous' ? 'Completed' : 'Join Meeting'}
                            </button>
                        </div>
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
                        style={{ background: "#3E3D3DA3" }}
                        className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden relative p-5 py-4"
                        >
                            <div className="flex justify-between items-center mb-3">
                                <h2 className="text-lg font-bold text-[#282828] leading-none">
                                    {data.title}
                                </h2>

                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-1 cursor-pointer rounded-full"
                                >
                                    <X size={20} weight="bold" className="text-[#282828]" />
                                </button>
                            </div>
                            <p className="text-sm text-[#282828] mb-6 leading-none">
                                {data.description}
                            </p>

                            <div className="grid grid-cols-2 gap-x-6">
                                <div className="flex gap-y-3 flex-col">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[#303030] font-medium text-sm">Role :</span>
                                        <PillTag label={data.category || "N/A"} />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-[#303030] font-medium text-sm">Date :</span>
                                        <PillTag label={data.date || "N/A"} />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[#303030] font-medium text-sm">Time :</span>
                                        <PillTag label={formattedTimeRange} />
                                    </div>
                                </div>
                                {category !== "Admin" &&
                                    <div className="flex gap-y-3 flex-col">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[#303030] font-medium text-sm">Branch :</span>
                                            <PillTag label={data.branch || "N/A"} />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[#303030] font-medium text-sm">Year :</span>
                                            <PillTag label={data.year || "N/A"} />
                                        </div>


                                        <div className="flex items-center justify-between">
                                            <span className="text-[#303030] font-medium text-sm">Section :</span>
                                            <PillTag label={data.section || "N/A"} />
                                        </div>
                                    </div>
                                }
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};