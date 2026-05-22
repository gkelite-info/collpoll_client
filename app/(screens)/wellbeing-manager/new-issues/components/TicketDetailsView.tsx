"use client";

import {
    Warning,
    UserCircle,
    FileText,
    DownloadSimple,
    UserPlus,
    CaretRight,
    PaperclipIcon
} from "@phosphor-icons/react";

import { MdPictureAsPdf } from "react-icons/md";
import { HiOutlinePaperClip } from "react-icons/hi";
import { useState } from "react";
import ReassignTicketModal from "../../components/ReassignTicketModal";

interface TicketDetailsViewProps {
    ticketId: string;
    onBack: () => void;
}

const evidenceFiles = [
    {
        id: 1,
        name: "Signal_Strength_Report.pdf",
        size: "1.2 MB",
        dateAdded: "ADDED TODAY AT 11:30 AM",
    },
    {
        id: 2,
        name: "Network_Diagnostic_Logs.pdf",
        size: "2.4 MB",
        dateAdded: "ADDED TODAY AT 11:45 AM",
    },
    {
        id: 3,
        name: "Coverage_Map_Analysis.pdf",
        size: "850 KB",
        dateAdded: "ADDED YESTERDAY AT 4:15 PM",
    },
];

export default function TicketDetailsView({ ticketId, onBack }: TicketDetailsViewProps) {
    const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
    return (
        <main className="w-full min-h-screen p-2 flex flex-col gap-5 md:gap-6">

            <div className="flex items-center gap-2 text-sm font-medium select-none">
                <span
                    onClick={onBack}
                    className="text-gray-600 cursor-pointer hover:text-gray-900 transition-colors"
                >
                    Tickets
                </span>
                <CaretRight size={12} weight="bold" className="text-gray-500 mt-0.5" />
                <span className="text-[#047857] font-bold">{ticketId}</span>
            </div>

            <div className="flex items-start sm:items-center gap-3 bg-[#FCE8E8] rounded-xl p-4 text-[#9B1C1C]">
                <Warning size={24} weight="fill" className="shrink-0 mt-0.5 sm:mt-0 text-[#7F1D1D]" />
                <div className="flex flex-col">
                    <span className="font-bold text-sm sm:text-[15px]">High Priority Warning</span>
                    <span className="text-xs sm:text-sm mt-0.5 font-medium opacity-90">
                        This ticket has been marked as critical due to service impact in public study areas.
                    </span>
                </div>
            </div>

            <div className="bg-white rounded-2xl p-5 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-lg md:text-xl font-bold text-gray-800">
                            {ticketId}: WiFi Connection Issues
                        </h1>
                        <span className="bg-[#E8F0E4] text-[#006E2F] text-[11px] font-bold px-3 py-1 rounded-full tracking-wide">
                            NEW
                        </span>
                    </div>
                    <p className="text-[13px] md:text-sm text-gray-500 font-semibold">
                        Reported 2 hours ago • Categorized under IT Infrastructure
                    </p>
                </div>
                <button
                    onClick={() => setIsReassignModalOpen(true)}
                    className="flex items-center justify-center cursor-pointer gap-2 bg-[#047857] hover:bg-[#036549] transition-all text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-sm shrink-0 active:scale-95">
                    <UserPlus size={18} weight="bold" />
                    Reassign
                </button>
            </div>

            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-[#16284F] font-bold px-1 ml-3 mt-1">
                    <UserCircle size={20} weight="bold" className="text-[#047857]" />
                    <h2 className="text-[15px]">Requester Information</h2>
                </div>
                <div className="bg-white rounded-2xl p-5 md:p-7 shadow-sm">
                    <div className="flex flex-col md:flex-row gap-5 md:gap-8 items-center md:items-start w-full">
                        <div className="shrink-0 flex justify-center w-full md:w-auto mb-1 md:mb-0">
                            <img
                                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80"
                                alt="Requester profile"
                                className="w-32 h-32 sm:w-28 sm:h-28 md:w-32 md:h-32 object-cover rounded-2xl bg-[#E8F0E4] shadow-sm border border-gray-100"
                            />
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-y-4 md:gap-y-6 gap-x-4 md:gap-x-8 w-full px-2 md:px-0">
                            <div className="flex flex-col gap-1">
                                <span className="text-[12px] md:text-[13px] text-gray-500 font-semibold uppercase tracking-wider">Full Name</span>
                                <span className="text-[15px] text-gray-900 font-bold">Ankitha Sharma</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[12px] md:text-[13px] text-gray-500 font-semibold uppercase tracking-wider">Education Type</span>
                                <span className="text-[15px] text-gray-900 font-bold">B.Tech</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[12px] md:text-[13px] text-gray-500 font-semibold uppercase tracking-wider">Branch</span>
                                <span className="text-[15px] text-gray-900 font-bold">CSE</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[12px] md:text-[13px] text-gray-500 font-semibold uppercase tracking-wider">Student ID</span>
                                <span className="text-[15px] text-gray-900 font-bold">903546</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[12px] md:text-[13px] text-gray-500 font-semibold uppercase tracking-wider">Email</span>
                                <span className="text-[15px] text-gray-900 font-bold break-all">
                                    a.sharma.cse@university.edu
                                </span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[12px] md:text-[13px] text-gray-500 font-semibold uppercase tracking-wider">Mobile</span>
                                <span className="text-[15px] text-gray-900 font-bold">+91 9087654321</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-3 bg-white rounded-2xl shadow-sm ">
                <div className="flex items-center gap-2 text-[#16284F] font-bold px-1 ml-3 mt-3">
                    <FileText size={20} weight="fill" className="text-[#047857]" />
                    <h2 className="text-[15px]">Issue Description</h2>
                </div>
                <div className="p-5 pt-1">
                    <p className="text-gray-700 text-[14px] md:text-[15px] leading-relaxed mb-5 font-medium">
                        Users are reporting consistent signal drops and "Authentication Error" messages while attempting to connect to the 'EduWell-Campus-Main' network specifically within the sports practice area and the adjacent athletics locker rooms.
                    </p>
                    <p className="text-gray-700 text-[14px] md:text-[15px] leading-relaxed font-medium">
                        The instability seems to peak between 4 PM and 7 PM during peak practice hours. Affected devices include laptops (Windows/MacOS) and mobile devices. Initial checks suggest a possible blind spot or interference from recently installed equipment in the gym.
                    </p>
                </div>
            </div>

            <div className="flex flex-col gap-3 pb-4 pt-4 bg-white rounded-2xl shadow-sm mb-3">
                <div className="flex items-center gap-2 text-[#16284F] font-bold px-1 ml-4">
                    <HiOutlinePaperClip className="text-[#047857] -rotate-43 font-extrabold text-[20px]" />
                    <h2 className="text-[15px]">Proof / Evidence</h2>
                </div>
                <div className="p-5 pt-2 grid grid-cols-1 md:grid-cols-2 gap-4">

                    {evidenceFiles.map((file) => (
                        <div
                            key={file.id}
                            className="flex items-center justify-between bg-[#F3FCEF] rounded-xl p-3 px-2  border border-[#E8F0E4]"
                        >
                            <div className="flex items-center gap-3 md:gap-4">
                                <div className="bg-[#FCE8E8] p-2.5 rounded-sm shrink-0">
                                    <MdPictureAsPdf className="text-[#D32F2F] text-[24px]" />
                                    {/* <FilePdf size={24} weight="fill" className="text-[#D32F2F]" /> */}
                                </div>
                                <div className="flex flex-col justify-center">
                                    <span className="text-[14px] md:text-[15px] font-bold text-gray-800 break-all leading-tight">
                                        {file.name}
                                    </span>
                                    <span className="text-[10px] md:text-[11px] text-gray-500 font-bold tracking-wide uppercase mt-1">
                                        {file.size} • {file.dateAdded}
                                    </span>
                                </div>
                            </div>
                            <button className="p-2.5 rounded-lg transition-colors shrink-0">
                                <DownloadSimple size={20} weight="bold" className="text-[#047857] cursor-pointer" />
                            </button>
                        </div>
                    ))}

                </div>
            </div>
            <ReassignTicketModal
                isOpen={isReassignModalOpen}
                onClose={() => setIsReassignModalOpen(false)}
                ticketId={ticketId}
            />
        </main>
    );
}