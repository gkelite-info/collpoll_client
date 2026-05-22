"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
    X,
    Basketball,
    Wrench,
    FirstAid,
    PaperPlaneRight,
    BasketballIcon,
    ConfettiIcon,
    FirstAidKitIcon,
    ShieldCheckIcon
} from "@phosphor-icons/react";
import { useState } from "react";

interface ReassignTicketModalProps {
    isOpen: boolean;
    onClose: () => void;
    ticketId?: string;
}

export default function ReassignTicketModal({ isOpen, onClose, ticketId = "#482857" }: ReassignTicketModalProps) {
    const [selectedDept, setSelectedDept] = useState("Infrastructure");
    const [selectedPriority, setSelectedPriority] = useState("High");
    const [note, setNote] = useState("Students reported unstable WiFi access in the sports practice area. Forwarding to Infrastructure department for network support.");

    const departments = [
        { id: "Sports", icon: BasketballIcon },
        { id: "Infrastructure", icon: Wrench },
        { id: "Event", icon: ConfettiIcon },
        { id: "Medical", icon: FirstAidKitIcon },
        { id: "Safety", icon: ShieldCheckIcon },
    ];

    const priorities = [
        { id: "Urgent", color: "bg-red-600", activeBg: "bg-red-50 border-red-200" },
        { id: "High", color: "bg-red-600", activeBg: "bg-red-600 text-white border-red-600" },
        { id: "Medium", color: "bg-amber-500", activeBg: "bg-amber-50 border-amber-200" },
        { id: "Low", color: "bg-emerald-500", activeBg: "bg-emerald-50 border-emerald-200" },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
                    >
                        {/* Modal Content */}
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            transition={{ type: "spring", duration: 0.5, bounce: 0.15 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-[#F8F9FB] w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl overflow-y-auto my-8"
                        >
                            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-white">
                                <h2 className="text-xl font-bold text-[#16284F]">Reassign Support Ticket</h2>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-gray-100 rounded-full cursor-pointer transition-colors text-gray-500"
                                >
                                    <X size={20} weight="bold" />
                                </button>
                            </div>

                            <div className="p-4 md:p-6 flex flex-col gap-6 md:gap-8">
                                <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-6 md:gap-4">
                                    <div className="flex flex-col gap-2">
                                        <span className="text-[12px] font-extrabold text-gray-500 tracking-wider uppercase">Share Ticket</span>
                                        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                                            <div className="flex justify-between items-start mb-4">
                                                <span className="bg-[#FFF4E5] text-[#D97706] text-[11px] font-bold px-3 py-1 rounded-full">
                                                    Ticket Summary
                                                </span>
                                                <span className="text-[13px] font-bold text-gray-400 font-mono">
                                                    ID: {ticketId}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-4 mb-6">
                                                {/* <Image 
                                                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&q=80" 
                                                    alt="User" 
                                                    className="rounded-full object-cover"
                                                    height={48}
                                                    width={48}
                                                /> */}

                                                <img
                                                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&q=70"
                                                    alt="User"
                                                    className="h-12 w-12 rounded-full object-cover"
                                                />

                                                <div className="flex flex-col">
                                                    <span className="font-bold text-[#16284F] text-[16px]">Ankitha Sharma</span>
                                                    <span className="text-[12px] font-semibold text-gray-500">B.Tech CSE • ID-28939</span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wide">Issue</span>
                                                    <span className="text-[13px] font-bold text-gray-800">WiFi not working</span>
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wide">Category</span>
                                                    <div className="flex items-center gap-1.5 text-[13px] font-bold text-gray-800">
                                                        <BasketballIcon size={16} weight="fill" className="text-[#3D4A3D]" />
                                                        Sports
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        <span className="text-[12px] font-extrabold text-gray-500 tracking-wider uppercase">Target Department</span>
                                        <div className="grid grid-cols-2 gap-2.5">
                                            {departments.map((dept) => {
                                                const Icon = dept.icon;
                                                const isActive = selectedDept === dept.id;
                                                return (
                                                    <button
                                                        key={dept.id}
                                                        onClick={() => setSelectedDept(dept.id)}
                                                        className={`flex flex-col sm:flex-row items-center cursor-pointer gap-3 p-3 rounded-xl font-bold text-[14px] transition-all border shadow-sm ${isActive
                                                            ? 'bg-[#14B86A] border-[#14B86A] text-white shadow-[#14B86A]/20'
                                                            : 'bg-white border-gray-200 text-gray-700 hover:border-[#14B86A]'
                                                            }`}
                                                    >
                                                        <span className={`p-2 rounded-sm ${isActive ? 'text-[#22C55E] bg-[#E8F0E4] ' : 'bg-[#E8F0E4]'} `}>
                                                            <Icon size={20} weight="fill" />
                                                        </span>
                                                        {dept.id}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <span className="text-[12px] font-extrabold text-gray-500 tracking-wider uppercase">Internal Note</span>
                                    <textarea
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        className="w-full h-28 p-4 rounded-2xl border border-gray-200 bg-white text-[14px] text-gray-700 font-medium resize-none focus:outline-none focus:ring-2 focus:ring-[#14B86A]/20 focus:border-[#14B86A] shadow-sm custom-scrollbar"
                                    />
                                </div>

                            </div>

                            <div className="bg-white border-t border-gray-100 p-4 md:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                                <div className="flex flex-col gap-2 w-full sm:w-auto">
                                    <span className="text-[11px] font-extrabold text-gray-500 tracking-wider uppercase">Confirm Priority</span>
                                    <div className="flex flex-wrap items-center gap-2">
                                        {priorities.map((priority) => {
                                            const isActive = selectedPriority === priority.id;
                                            return (
                                                <button
                                                    key={priority.id}
                                                    onClick={() => setSelectedPriority(priority.id)}

                                                    className={`flex items-center cursor-pointer gap-2 px-4 py-2 rounded-full border-2 text-[13px] font-bold transition-all ${isActive
                                                        ? `${priority.activeBg} ${priority.id === 'High' ? 'text-white border-red-800' :
                                                            priority.id === 'Medium' ? 'text-[#282828] border-amber-500' :
                                                                priority.id === 'Urgent' ? 'text-[#282828] border-red-200' :
                                                                    'text-[#282828] border-green-500'
                                                        }`
                                                        : `bg-white border-gray-200 text-gray-600 ${priority.id === 'High' ? 'hover:border-red-500' :
                                                            priority.id === 'Medium' ? 'hover:border-amber-500' :
                                                                priority.id === 'Urgent' ? 'hover:border-red-200' :
                                                                    'hover:border-green-500'
                                                        }`
                                                        }`}
                                                >
                                                    <span className={`w-2 h-2 rounded-full ${isActive && priority.id === 'High' ? 'bg-white' : priority.color}`} />
                                                    {priority.id}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="w-full cursor-pointer sm:w-auto flex self-end items-center justify-center gap-2 bg-[#14B86A] hover:bg-[#109f5b] transition-colors text-white px-8 py-3 rounded-xl font-bold shadow-md shadow-[#14B86A]/20 active:scale-95"
                                >
                                    <PaperPlaneRight size={20} weight="fill" />
                                    Share
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}