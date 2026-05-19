"use client";

import { motion } from "framer-motion";
import { CaretDown, CaretLeft, X } from "@phosphor-icons/react";
import { Executive } from "../WellbeingMeetings";
import { useEffect, useState } from "react";

interface CreateMeetingModalProps {
    onClose: () => void;
    onOpenExecutiveSelect: () => void;
    selectedExecutives: Executive[];
    onRemoveExecutive: (id: string) => void;
    editData?: any;
}

const getTodayDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const parseDateString = (dateStr: string) => {
    if (!dateStr) return getTodayDateString();
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return getTodayDateString();
    return d.toISOString().split('T')[0];
};

export default function CreateMeetingModal({
    onClose,
    onOpenExecutiveSelect,
    selectedExecutives,
    onRemoveExecutive,
    editData
}: CreateMeetingModalProps) {

    const [title, setTitle] = useState("");
    const [agenda, setAgenda] = useState("");
    const [date, setDate] = useState(getTodayDateString());
    const [startHour, setStartHour] = useState("09");
    const [startMinute, setStartMinute] = useState("00");
    const [startPeriod, setStartPeriod] = useState<"AM" | "PM">("AM");
    const [endHour, setEndHour] = useState("10");
    const [endMinute, setEndMinute] = useState("00");
    const [endPeriod, setEndPeriod] = useState<"AM" | "PM">("AM");
    const [isPastTimeError, setIsPastTimeError] = useState(false);

    useEffect(() => {
        if (editData) {
            setTitle(editData.title || "");
            setAgenda(editData.description || "");
            setDate(parseDateString(editData.date));

            if (editData.timeRange) {
                const [start, end] = editData.timeRange.split(" - ");
                const [sh, sm] = start.split(":");
                const [eh, em] = end.split(":");

                const sHourNum = parseInt(sh);
                setStartPeriod(sHourNum >= 12 ? "PM" : "AM");
                setStartHour(String(sHourNum > 12 ? sHourNum - 12 : sHourNum === 0 ? 12 : sHourNum).padStart(2, '0'));
                setStartMinute(sm.trim());

                const eHourNum = parseInt(eh);
                setEndPeriod(eHourNum >= 12 ? "PM" : "AM");
                setEndHour(String(eHourNum > 12 ? eHourNum - 12 : eHourNum === 0 ? 12 : eHourNum).padStart(2, '0'));
                setEndMinute(em.trim());
            }
        }
    }, [editData]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 10 }}
                className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden flex flex-col"
            >
                <div className="p-6 overflow-y-auto max-h-[90vh] custom-scrollbar">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-[22px] font-bold text-[#282828]">
                            {editData ? "Edit Meeting" : "Create Meeting"}
                        </h2>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-800 cursor-pointer">
                            <X size={20} weight="bold" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-base font-semibold text-[#282828] mb-1.5">
                                Title<span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g., Internal Assessment Discussion"
                                className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2.5 text-sm font-regular outline-none focus:border-gray-300 focus:ring-0 text-[#282828]"
                            />
                        </div>

                        <div>
                            <label className="block text-base font-semibold text-[#282828] mb-1.5">
                                Agenda<span className="text-red-500">*</span>
                            </label>
                            <textarea
                                rows={3}
                                value={agenda}
                                onChange={(e) => setAgenda(e.target.value)}
                                placeholder="Brief description of the meeting......!!!!"
                                className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2.5 text-sm font-regular outline-none resize-none focus:border-gray-300 text-[#282828]"
                            ></textarea>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-base font-semibold text-[#282828] mb-1.5">
                                    Date<span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    min={getTodayDateString()}
                                    className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2.5 text-sm font-regular outline-none text-[#555555] cursor-pointer focus:border-gray-300"
                                />
                            </div>
                            <div>
                                <label className="block text-base font-semibold text-[#282828] mb-1.5">
                                    Select Executives<span className="text-red-500">*</span>
                                </label>
                                <div
                                    onClick={onOpenExecutiveSelect}
                                    className="relative w-full border border-[#E0E0E0] rounded-lg px-3 h-[42px] flex items-center justify-between cursor-pointer bg-white overflow-hidden"
                                >
                                    {selectedExecutives.length === 0 ? (
                                        <span className="text-sm text-[#555555]">Select Executives</span>
                                    ) : selectedExecutives.length === 1 ? (
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <img src={selectedExecutives[0].avatar} alt="" className="w-6 h-6 rounded-full flex-shrink-0" />
                                            <span className="text-sm font-medium text-[#282828] truncate">{selectedExecutives[0].name}</span>
                                        </div>
                                    ) : (
                                        <div className="flex flex-nowrap gap-1.5 overflow-x-auto pr-8 max-w-[calc(100%-24px)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                                            {selectedExecutives.map(exec => (
                                                <span key={exec.id} className="inline-flex items-center gap-1 bg-[#F0FDF4] text-[#11934A] px-2 py-0.5 rounded-full text-xs font-medium border border-[#43C17A]/30 flex-shrink-0">
                                                    {exec.name}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onRemoveExecutive(exec.id);
                                                        }}
                                                        className="hover:bg-[#43C17A]/20 rounded-full p-0.5 cursor-pointer"
                                                    >
                                                        <X size={10} weight="bold" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    <CaretLeft size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555555] pointer-events-none bg-white pl-1" />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-base font-semibold text-[#282828] mb-1.5">Time</label>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <span className={`text-base block mb-1 font-semibold transition-colors ${isPastTimeError ? "font-bold text-red-600" : "text-[#282828]"}`}>
                                        From<span className="text-red-500">*</span>
                                    </span>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <select
                                                value={startHour}
                                                onChange={(e) => { setStartHour(e.target.value); setIsPastTimeError(false); }}
                                                className={`w-full border rounded-lg pl-2 pr-6 py-2.5 text-sm outline-none appearance-none bg-white text-center cursor-pointer transition-colors ${isPastTimeError ? "border-red-500 text-red-600 font-medium" : "border-[#E0E0E0] text-[#282828]"}`}
                                            >
                                                {Array.from({ length: 12 }, (_, i) => {
                                                    const h = String(i + 1).padStart(2, "0");
                                                    return <option key={h} value={h} className="text-[#282828]">{h}</option>;
                                                })}
                                            </select>
                                            <CaretDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#555555] pointer-events-none" />
                                        </div>
                                        <div className="relative flex-1">
                                            <select
                                                value={startMinute}
                                                onChange={(e) => { setStartMinute(e.target.value); setIsPastTimeError(false); }}
                                                className={`w-full border rounded-lg pl-2 pr-6 py-2.5 text-sm outline-none appearance-none bg-white text-center cursor-pointer transition-colors ${isPastTimeError ? "border-red-500 text-red-600 font-medium" : "border-[#E0E0E0] text-[#282828]"}`}
                                            >
                                                {Array.from({ length: 12 }, (_, i) => {
                                                    const m = String(i * 5).padStart(2, "0");
                                                    return <option key={m} value={m} className="text-[#282828]">{m}</option>;
                                                })}
                                            </select>
                                            <CaretDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#555555] pointer-events-none" />
                                        </div>
                                        <div className="relative flex-1">
                                            <select
                                                value={startPeriod}
                                                onChange={(e) => { setStartPeriod(e.target.value as "AM" | "PM"); setIsPastTimeError(false); }}
                                                className={`w-full border rounded-lg pl-2 pr-6 py-2.5 text-sm outline-none appearance-none bg-white text-center cursor-pointer transition-colors ${isPastTimeError ? "border-red-500 text-red-600 font-medium" : "border-[#E0E0E0] text-[#282828]"}`}
                                            >
                                                <option value="AM">AM</option>
                                                <option value="PM">PM</option>
                                            </select>
                                            <CaretDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#555555] pointer-events-none" />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <span className={`text-base block mb-1 font-semibold transition-colors ${isPastTimeError ? "font-bold text-red-600" : "text-[#282828]"}`}>
                                        To<span className="text-red-500">*</span>
                                    </span>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <select
                                                value={endHour}
                                                onChange={(e) => { setEndHour(e.target.value); setIsPastTimeError(false); }}
                                                className={`w-full border rounded-lg pl-2 pr-6 py-2.5 text-sm outline-none appearance-none bg-white text-center cursor-pointer transition-colors ${isPastTimeError ? "border-red-500 text-red-600 font-medium" : "border-[#E0E0E0] text-[#282828]"}`}
                                            >
                                                {Array.from({ length: 12 }, (_, i) => {
                                                    const h = String(i + 1).padStart(2, "0");
                                                    return <option key={h} value={h} className="text-[#282828]">{h}</option>;
                                                })}
                                            </select>
                                            <CaretDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#555555] pointer-events-none" />
                                        </div>
                                        <div className="relative flex-1">
                                            <select
                                                value={endMinute}
                                                onChange={(e) => { setEndMinute(e.target.value); setIsPastTimeError(false); }}
                                                className={`w-full border rounded-lg pl-2 pr-6 py-2.5 text-sm outline-none appearance-none bg-white text-center cursor-pointer transition-colors ${isPastTimeError ? "border-red-500 text-red-600 font-medium" : "border-[#E0E0E0] text-[#282828]"}`}
                                            >
                                                {Array.from({ length: 12 }, (_, i) => {
                                                    const m = String(i * 5).padStart(2, "0");
                                                    return <option key={m} value={m} className="text-[#282828]">{m}</option>;
                                                })}
                                            </select>
                                            <CaretDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#555555] pointer-events-none" />
                                        </div>
                                        <div className="relative flex-1">
                                            <select
                                                value={endPeriod}
                                                onChange={(e) => { setEndPeriod(e.target.value as "AM" | "PM"); setIsPastTimeError(false); }}
                                                className={`w-full border rounded-lg pl-2 pr-6 py-2.5 text-sm outline-none appearance-none bg-white text-center cursor-pointer transition-colors ${isPastTimeError ? "border-red-500 text-red-600 font-medium" : "border-[#E0E0E0] text-[#282828]"}`}
                                            >
                                                <option value="AM">AM</option>
                                                <option value="PM">PM</option>
                                            </select>
                                            <CaretDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#555555] pointer-events-none" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-base font-semibold text-[#282828] mb-1.5">
                                Notifications<span className="text-red-500">*</span>
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <label className="flex-1 border border-[#E0E0E0] rounded-lg px-3 h-[42px] flex items-center gap-2 cursor-pointer bg-white">
                                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 cursor-pointer accent-[#43C17A]" />
                                    <span className="text-xs font-medium text-[#282828] whitespace-nowrap">In-app notification</span>
                                </label>
                                <label className="flex-1 border border-[#E0E0E0] rounded-lg px-3 h-[42px] flex items-center gap-2 cursor-pointer bg-white">
                                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 cursor-pointer accent-[#43C17A]" />
                                    <span className="text-xs font-medium text-[#282828] whitespace-nowrap">Email notification</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 mt-8">
                        <button
                            onClick={onClose}
                            className="flex-1 py-2.5 bg-[#E9E9E9] rounded-lg font-semibold text-[#282828] hover:bg-[#d8d8d8] transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onClose}
                            className="flex-1 py-2.5 rounded-lg font-semibold text-white transition-colors shadow-sm bg-[#43C17A] hover:bg-[#38a869] cursor-pointer"
                        >
                            {editData ? "Update" : "Schedule"}
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}