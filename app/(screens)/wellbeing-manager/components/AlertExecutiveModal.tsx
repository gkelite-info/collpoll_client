"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Warning, Info, CheckFatIcon, CheckIcon } from "@phosphor-icons/react";
import { useState } from "react";
import Image from "next/image";

interface AlertExecutiveModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AlertExecutiveModal({ isOpen, onClose }: AlertExecutiveModalProps) {
    const [isNotifyEnabled, setIsNotifyEnabled] = useState(true);

    const [selectedIssueIds, setSelectedIssueIds] = useState<number[]>([1, 2, 3]);

    const toggleIssueSelection = (id: number) => {
        setSelectedIssueIds(prev =>
            prev.includes(id) ? prev.filter(issueId => issueId !== id) : [...prev, id]
        );
    };

    const selectedIssues = [
        { id: 1, name: "Shreya Patel", details: "B.Tech CSE", stu_id: "ID-28939", title: "WiFi not working in Hostel Floor 3", desc: "Internet connectivity is very poor or completely unavailable on the entire floor, preventing students from accessing online lectures and completing their academic assignments. The frequent dropouts and high latency have made it nearly impossible to maintain a stable connection for essential tasks.", category: "Infrastructure", priority: "High" },
        { id: 2, name: "Shreya Patel", details: "B.Tech CSE", stu_id: "ID-28939", title: "WiFi not working in Hostel Floor 3", desc: "Internet connectivity is very poor or completely unavailable on the entire floor, preventing students from accessing online lectures and completing their academic assignments. The frequent dropouts and high latency have made it nearly impossible to maintain a stable connection for essential tasks.", category: "Infrastructure", priority: "High" },
        { id: 3, name: "Shreya Patel", details: "B.Tech CSE", stu_id: "ID-28939", title: "WiFi not working in Hostel Floor 3", desc: "Internet connectivity is very poor or completely unavailable on the entire floor, preventing students from accessing online lectures and completing their academic assignments. The frequent dropouts and high latency have made it nearly impossible to maintain a stable connection for essential tasks.", category: "Infrastructure", priority: "High" },
    ];

    const recipients = [
        { id: 1, name: "Shreya Patel", idNum: "ID-28939", img: "https://i.pravatar.cc/150?img=45" },
        { id: 2, name: "Shreya Patel", idNum: "ID-28939", img: "https://i.pravatar.cc/150?img=47" },
        { id: 3, name: "Rahul Sharma", idNum: "ID-28939", img: "https://i.pravatar.cc/150?img=11" },
        { id: 4, name: "Sameer Rathod", idNum: "ID-28939", img: "https://i.pravatar.cc/150?img=12" },
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
                        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[100] flex items-center justify-center p-4 md:p-6"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-[#F8F9FB] w-full max-w-2xl rounded-xl shadow-2xl overflow-auto flex flex-col max-h-[90vh]"
                        >
                            <div className="p-6 bg-white flex  items-center gap-4 border-b border-gray-100">
                                <div className="bg-[#FFF4E5] p-3 rounded-full shrink-0">
                                    <Warning size={32} weight="fill" className="text-[#F59E0B]" />
                                </div>
                                <div className="flex justify-between w-full">
                                    <div className="flex-grow">
                                        <h2 className="text-lg font-bold text-[#16284F]">Alert Infrastructure Executive</h2>
                                        <p className="text-sm text-gray-500 font-medium mt-0.5">Notify executive about selected issues for immediate attention.</p>
                                    </div>
                                    <button onClick={onClose} className="p-2 cursor-pointer hidden sm:inline-flex rounded-full transition-colors">
                                        <X size={20} weight="bold" className="text-gray-400" />
                                    </button>
                                </div>
                            </div>

                            <div className="p-6 overflow-y-auto custom-scrollbar flex flex-col gap-6">
                                <div className="flex flex-col gap-3">
                                    <h3 className="text-[15px] font-bold text-[#16284F]">Selected Issues</h3>
                                    <div className="flex flex-col gap-3">
                                        {selectedIssues.map((issue, idx) => {
                                            const isSelected = selectedIssueIds.includes(issue.id);
                                            return (
                                                <div
                                                    key={idx}
                                                    onClick={() => toggleIssueSelection(issue.id)}
                                                    className="bg-white border border-gray-200 rounded-xl p-3 md:p-4 flex flex-col md:flex-row md:items-center gap-3 md:gap-4 shadow-sm hover:border-[#43C17A]/50 transition-colors cursor-pointer select-none"
                                                >
                                                    <div className="flex items-center gap-3 md:gap-4 w-full md:w-[35%] shrink-0">
                                                        <div className={`w-5 h-5 rounded-[4px] flex items-center justify-center shrink-0 transition-colors border ${isSelected ? 'bg-[#43C17A] border-[#43C17A]' : 'bg-transparent border-gray-300'}`}>
                                                            {isSelected && (
                                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                                                    <polyline points="20 6 9 17 4 12"></polyline>
                                                                </svg>
                                                            )}
                                                        </div>

                                                        <div className="w-10 h-10 md:w-11 md:h-11 rounded-full overflow-hidden shrink-0 border border-gray-100 bg-gray-50">
                                                            <img src={`https://i.pravatar.cc/150?img=${40 + idx}`} alt="" className="object-cover w-full h-full" />
                                                        </div>

                                                        <div className="flex flex-col justify-center min-w-0">
                                                            <span className="text-[14px] md:text-[15px] font-bold text-[#16284F] truncate leading-tight">{issue.name}</span>
                                                            <p className="text-[12px] md:text-[13px] text-gray-500 font-medium mt-0.5 whitespace-normal leading-snug">{issue.details}</p>
                                                            <p className="text-[12px] md:text-[13px] text-gray-500 font-medium mt-0.5 whitespace-normal leading-snug">{issue.stu_id}</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col min-w-0 w-full md:w-auto flex-grow pl-8 md:pl-0">
                                                        <p className="text-[14px] md:text-[15px] font-bold text-[#16284F] truncate leading-tight">{issue.title}</p>
                                                        <p className="text-[12px] md:text-[13px] text-gray-500 font-medium truncate mt-0.5">{issue.desc}</p>
                                                    </div>

                                                    <div className="flex md:flex-col gap-2 justify-center items-center md:gap-1.5 pl-8 md:pl-0 shrink-0">
                                                        <span className="text-[11px] md:text-[12px] font-semibold px-3 py-1 rounded-full bg-[#E5F0FF] text-[#4B7bec] w-fit text-center border border-[#E5F0FF]">
                                                            {issue.category}
                                                        </span>
                                                        <span className="text-[11px] md:text-[12px] font-bold px-3 py-1 rounded-full bg-[#FFF0F0] text-[#FF4757] w-fit text-center border border-[#FFF0F0]">
                                                            {issue.priority}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <h3 className="text-sm font-bold text-[#16284F] uppercase tracking-wider">Add Message</h3>
                                    <textarea
                                        placeholder="Please Prioritize these hostel issues immediately. Multiple complaints are pending..."
                                        className="w-full h-24 p-4 text-[#282828] rounded-2xl border border-gray-200 focus:ring-2 focus:ring-[#43C17A]/20 focus:border-[#43C17A] outline-none text-sm font-medium resize-none transition-all"
                                    />
                                </div>

                                <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 gap-4">
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-[14px] font-bold text-[#16284F]">Send Notification</h4>
                                        <p className="text-[11px] text-gray-400 font-medium leading-tight mt-0.5 break-words">
                                            Alert Infrastructure category executives via notification
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setIsNotifyEnabled(!isNotifyEnabled)}
                                        className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-1 shrink-0 ${isNotifyEnabled ? 'bg-[#43C17A]' : 'bg-gray-300'}`}
                                    >
                                        <motion.div
                                            animate={{ x: isNotifyEnabled ? 24 : 0 }}
                                            className="w-4 h-4 bg-white rounded-full shadow-sm"
                                        />
                                    </button>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <h3 className="text-sm font-bold text-[#16284F] uppercase tracking-wider">Recipients :</h3>
                                    <div className="flex items-center gap-4 overflow-x-auto pb-2 custom-scrollbar snap-x no-scrollbar">
                                        {recipients.map((person, idx) => (
                                            <div key={idx} className="flex items-center gap-3 bg-white border border-gray-100 rounded-full py-1.5 pl-1.5 pr-4 shrink-0 shadow-sm snap-start">
                                                <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-50">
                                                    <img src={person.img} alt="" className="object-cover" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[11px] font-bold text-[#16284F] whitespace-nowrap">{person.name}</span>
                                                    <span className="text-[9px] text-gray-400 font-bold leading-none">{person.idNum}</span>
                                                </div>
                                                <div className="ml-2 w-4 h-4 rounded-full bg-[#43C17A] flex items-center justify-center">
                                                    <CheckIcon size={12} weight="bold" className="text-white" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-white border-t border-gray-100 flex items-center gap-4">
                                <button
                                    onClick={onClose}
                                    className="flex-1 py-3 cursor-pointer rounded-md border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={onClose}
                                    className="flex-1 py-3 cursor-pointer rounded-md bg-[#43C17A] text-white font-bold text-sm shadow-lg shadow-[#43C17A]/20 hover:bg-[#34A362] transition-colors flex items-center justify-center gap-2">
                                    Send Alert
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}