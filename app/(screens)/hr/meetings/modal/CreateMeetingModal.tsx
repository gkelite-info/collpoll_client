'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { CaretDown, CaretRight } from '@phosphor-icons/react';
import SelectFacultyModal from './SelectFacultyModal';
import { useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';


const convertTo24Hour = (hour: string, minute: string, period: "AM" | "PM") => {
    let h = parseInt(hour);
    if (period === "PM" && h !== 12) h += 12;
    if (period === "AM" && h === 12) h = 0;
    return h * 60 + parseInt(minute);
};

const MIN_TIME = 8 * 60;
const MAX_TIME = 22 * 60;

const MAX_MEETING_DURATION = 4 * 60; // 4 hours

const validateTimeRange = (
    sHour: string, sMinute: string, sPeriod: "AM" | "PM",
    eHour: string, eMinute: string, ePeriod: "AM" | "PM"
) => {

    const start = convertTo24Hour(sHour, sMinute, sPeriod);
    const end = convertTo24Hour(eHour, eMinute, ePeriod);

    const startInvalid = start < MIN_TIME || start > MAX_TIME;
    const endInvalid = end < MIN_TIME || end > MAX_TIME;

    if (startInvalid && endInvalid) {
        toast.error("Start and End time must be between 8:00 AM and 10:00 PM", { id: "time-error" });
        return false;
    }

    if (startInvalid) {
        toast.error("Start time must be between 8:00 AM and 10:00 PM", { id: "time-error" });
        return false;
    }

    if (endInvalid) {
        toast.error("End time must be between 8:00 AM and 10:00 PM", { id: "time-error" });
        return false;
    }

    if (start === end) {
        toast.error("Start and End time cannot be the same", { id: "time-error" });
        return false;
    }

    if (end < start) {
        toast.error("End time must be greater than start time", { id: "time-error" });
        return false;
    }

    const duration = end - start;

    if (duration > MAX_MEETING_DURATION) {
        toast.error("Meeting duration cannot exceed 4 hours", { id: "time-error" });
        return false;
    }

    return true;
};

const getTodayDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export default function CreateMeetingModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // 1. Local state for form dropdown
    const [selectedRole, setSelectedRole] = useState('Select Role');
    const [title, setTitle] = useState("");
    const [agenda, setAgenda] = useState("");
    const [date, setDate] = useState("");
    const [inAppNotification, setInAppNotification] = useState(false);
    const [emailNotification, setEmailNotification] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState<any[]>([]);

    const [startHour, setStartHour] = useState("09");
    const [startMinute, setStartMinute] = useState("00");
    const [startPeriod, setStartPeriod] = useState<"AM" | "PM">("AM");

    const [endHour, setEndHour] = useState("10");
    const [endMinute, setEndMinute] = useState("00");
    const [endPeriod, setEndPeriod] = useState<"AM" | "PM">("AM");

    // 2. Read from URL Props (URL Search Params)
    const selectModalRoleParam = searchParams.get('selectRole'); // Gets 'Placement', 'Admin', etc. from URL
    const isSelectModalOpen = !!selectModalRoleParam; // Opens modal if param exists in URL

    // Helper to dynamically change text based on local state
    const getDynamicSelectionText = () => {
        switch (selectedRole) {
            case 'Admin': return 'Select Admins';
            case 'Faculty': return 'Select Faculties';
            case 'Placement': return 'Select Placements';
            case 'Finance': return 'Select Finance';
            default: return 'Select Faculties';
        }
    };
    const dynamicText = getDynamicSelectionText();

    // Helper to get title specifically for the second modal based on the URL prop
    const getModalTitleFromUrl = () => {
        switch (selectModalRoleParam) {
            case 'Admin': return 'Select Admins';
            case 'Placement': return 'Select Placements';
            case 'Finance': return 'Select Finance';
            default: return 'Select Faculties';
        }
    }

    const validateTitle = (title: string) => {
        const regex = /^[A-Za-z\s]+$/;

        if (!title.trim()) {
            toast.error("Meeting title is required");
            return false;
        }

        if (!regex.test(title.trim())) {
            toast.error("Title can contain only letters and spaces");
            return false;
        }

        return true;
    };

    const validateAgenda = (agenda: string) => {
        if (!agenda.trim()) {
            toast.error("Agenda is required");
            return false;
        }
        return true;
    };

    const validateDate = (date: string) => {
        if (!date) {
            toast.error("Please select meeting date");
            return false;
        }

        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
            toast.error("Meeting date cannot be in the past");
            return false;
        }

        return true;
    };

    // 3. Open Modal: Push prop to URL
    const handleOpenSelectModal = () => {
        const params = new URLSearchParams(searchParams.toString());
        const roleToPass = selectedRole === 'Select Role' ? 'Faculty' : selectedRole;
        params.set('selectRole', roleToPass); // Sets e.g., ?selectRole=Placement
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    // 4. Close Modal: Remove prop from URL
    const handleCloseSelectModal = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete('selectRole'); // Removes ?selectRole=...
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const handleSubmit = () => {

        // Title validation
        if (!validateTitle(title)) return;

        // Agenda validation
        if (!validateAgenda(agenda)) return;

        // Role validation
        if (!selectedRole || selectedRole === "Select Role") {
            toast.error("Please select a role", { id: "role-error" });
            return;
        }

        // Date validation
        if (!validateDate(date)) return;

        // Time validation
        if (!validateTimeRange(
            startHour,
            startMinute,
            startPeriod,
            endHour,
            endMinute,
            endPeriod
        )) return;

        if (selectedUsers.length === 0) {
            toast.error(`Please select at least one ${selectedRole.toLowerCase()}`, { id: "participant-error" });
            return;
        }

        // Notification validation
        if (!inAppNotification && !emailNotification) {
            toast.error("Please select at least one notification option", { id: "notification-error" });
            return;
        }

        // Success
        toast.success("Meeting scheduled successfully");
    };

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
                        onClick={onClose}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 10 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl w-full max-w-2xl p-8 shadow-xl custom-scrollbar overflow-y-auto max-h-[90vh]"
                        >
                            <h2 className="text-[22px] font-bold text-[#282828] mb-6">Create Meeting</h2>

                            <div className="space-y-3">
                                {/* Title */}
                                <div>
                                    <label className="block text-base font-semibold text-[#282828] mb-1.5">Title</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => {
                                            const value = e.target.value;

                                            // Allow only letters and spaces
                                            if (/^[A-Za-z\s]*$/.test(value)) {
                                                setTitle(value);
                                            } else {
                                                toast.error("Title can contain only letters and spaces", { id: "title-error" });
                                            }
                                        }}
                                        placeholder="e.g., Internal Assessment Discussion"
                                        className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2.5 text-sm font-medium outline-none focus:border-[#43C17A] text-[#282828]"
                                    />

                                </div>

                                {/* Agenda */}
                                <div>
                                    <label className="block text-base font-semibold text-[#282828] mb-1.5">Agenda</label>
                                    <textarea
                                        rows={3}
                                        value={agenda}
                                        onChange={(e) => setAgenda(e.target.value)}
                                        placeholder="Brief description of the meeting......!!!!"
                                        className="w-full border border-[#E0E0E0] rounded-lg px-3 py-1 text-sm font-medium outline-none focus:border-[#43C17A] resize-none text-[#282828]"
                                    />
                                </div>

                                {/* Date & Role */}
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-base font-semibold text-[#282828] mb-1.5">Date</label>
                                        <input
                                            type="date"
                                            value={date}
                                            min={getTodayDateString()}
                                            onChange={(e) => setDate(e.target.value)}
                                            className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2.5 text-sm font-medium outline-none text-[#555555] cursor-pointer"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-base font-semibold text-[#282828] mb-1.5">Role</label>
                                        <div className="relative">
                                            <select
                                                value={selectedRole}
                                                onChange={(e) => setSelectedRole(e.target.value)}
                                                className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2.5 text-sm outline-none appearance-none bg-white text-[#555555] cursor-pointer"
                                            >
                                                <option disabled value="Select Role">Select Role</option>
                                                <option value="Admin">Admin</option>
                                                <option value="Faculty">Faculty</option>
                                                <option value="Placement">Placement</option>
                                                <option value="Finance">Finance</option>
                                            </select>
                                            <CaretDown size={14} className="absolute right-3 top-3.5 text-[#555555] pointer-events-none" />
                                        </div>
                                    </div>
                                </div>

                                {/* Time */}
                                <div>
                                    <label className="block text-base font-semibold text-[#282828] mb-1.5">Time</label>
                                    <div className="grid grid-cols-2 gap-6">
                                        {/* From Time */}
                                        {/* From Time */}
                                        <div>
                                            <span className="text-base text-[#555555] block mb-1">From</span>

                                            <div className="flex gap-2">

                                                {/* Hour */}
                                                <div className="relative flex-1">
                                                    <select
                                                        value={startHour}
                                                        onChange={(e) => setStartHour(e.target.value)}
                                                        className="w-full border border-[#E0E0E0] rounded-lg pl-2 pr-6 py-2.5 text-sm outline-none appearance-none bg-white text-[#282828] text-center cursor-pointer"
                                                    >
                                                        {Array.from({ length: 12 }, (_, i) => {
                                                            const h = String(i + 1).padStart(2, "0");
                                                            return (
                                                                <option key={h} value={h} className="text-[#282828]">
                                                                    {h}
                                                                </option>
                                                            );
                                                        })}
                                                    </select>
                                                </div>

                                                {/* Minute */}
                                                <div className="relative flex-1">
                                                    <select
                                                        value={startMinute}
                                                        onChange={(e) => setStartMinute(e.target.value)}
                                                        className="w-full border border-[#E0E0E0] rounded-lg pl-2 pr-6 py-2.5 text-sm outline-none appearance-none bg-white text-[#282828] text-center cursor-pointer"
                                                    >
                                                        {Array.from({ length: 12 }, (_, i) => {
                                                            const m = String(i * 5).padStart(2, "0");
                                                            return (
                                                                <option key={m} value={m} className="text-[#282828]">
                                                                    {m}
                                                                </option>
                                                            );
                                                        })}
                                                    </select>
                                                </div>

                                                {/* AM / PM */}
                                                <div className="relative flex-1">
                                                    <select
                                                        value={startPeriod}
                                                        onChange={(e) => setStartPeriod(e.target.value as "AM" | "PM")}
                                                        className="w-full border border-[#E0E0E0] rounded-lg pl-2 pr-6 py-2.5 text-sm outline-none appearance-none bg-white text-[#282828] text-center cursor-pointer"
                                                    >
                                                        <option value="AM">AM</option>
                                                        <option value="PM">PM</option>
                                                    </select>
                                                </div>

                                            </div>
                                        </div>
                                        {/* To Time */}
                                        {/* From Time */}
                                        <div>
                                            <span className="text-base text-[#555555] block mb-1">To</span>

                                            <div className="flex gap-2">

                                                {/* Hour */}
                                                <div className="relative flex-1">
                                                    <select
                                                        value={endHour}
                                                        onChange={(e) => setEndHour(e.target.value)}
                                                        className="w-full border border-[#E0E0E0] rounded-lg pl-2 pr-6 py-2.5 text-sm outline-none appearance-none bg-white text-[#282828] text-center cursor-pointer"
                                                    >
                                                        {Array.from({ length: 12 }, (_, i) => {
                                                            const h = String(i + 1).padStart(2, "0");
                                                            return (
                                                                <option key={h} value={h}>
                                                                    {h}
                                                                </option>
                                                            );
                                                        })}
                                                    </select>
                                                </div>

                                                {/* Minute */}
                                                <div className="relative flex-1">
                                                    <select
                                                        value={endMinute}
                                                        onChange={(e) => setEndMinute(e.target.value)}
                                                        className="w-full border border-[#E0E0E0] rounded-lg pl-2 pr-6 py-2.5 text-sm outline-none appearance-none bg-white text-[#282828] text-center cursor-pointer"
                                                    >
                                                        {Array.from({ length: 12 }, (_, i) => {
                                                            const m = String(i * 5).padStart(2, "0");
                                                            return (
                                                                <option key={m} value={m}>
                                                                    {m}
                                                                </option>
                                                            );
                                                        })}
                                                    </select>
                                                </div>

                                                {/* AM / PM */}
                                                <div className="relative flex-1">
                                                    <select
                                                        value={endPeriod}
                                                        onChange={(e) => setEndPeriod(e.target.value as "AM" | "PM")}
                                                        className="w-full border border-[#E0E0E0] rounded-lg pl-2 pr-6 py-2.5 text-sm outline-none appearance-none bg-white text-[#282828] text-center cursor-pointer"
                                                    >
                                                        <option value="AM">AM</option>
                                                        <option value="PM">PM</option>
                                                    </select>
                                                </div>

                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Dynamic Selection Block (Faculties / Admin / Placement / etc.) */}
                                <div>
                                    <label className="block text-base font-semibold text-[#282828] mb-1.5">{dynamicText}</label>
                                    <div
                                        onClick={handleOpenSelectModal}
                                        className="relative cursor-pointer"
                                    >
                                        <div className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2.5 text-sm bg-white text-[#555555]">
                                            {dynamicText}
                                        </div>
                                        <CaretRight size={14} className="absolute right-3 top-3.5 text-[#555555] pointer-events-none" />
                                    </div>
                                </div>

                                {/* Notifications */}
                                <div>
                                    <label className="block text-base font-semibold text-[#282828] mb-1.5">Notifications</label>
                                    <div className="flex gap-4">
                                        <label className="flex-1 border border-[#E0E0E0] rounded-lg px-3 py-2.5 flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={inAppNotification}
                                                onChange={(e) => setInAppNotification(e.target.checked)}
                                                className="w-4 h-4 rounded border-gray-300 accent-[#43C17A] cursor-pointer"
                                            />
                                            <span className="text-sm text-[#282828]">In-app notification</span>
                                        </label>
                                        <label className="flex-1 border border-[#E0E0E0] rounded-lg px-3 py-2.5 flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={emailNotification}
                                                onChange={(e) => setEmailNotification(e.target.checked)}
                                                className="w-4 h-4 rounded border-gray-300 accent-[#43C17A] cursor-pointer"
                                            />
                                            <span className="text-sm text-[#282828]">Email notification</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-4 pt-2">
                                    <button
                                        onClick={onClose}
                                        className="flex-1 py-3 bg-[#E9E9E9] rounded-lg font-semibold text-[#282828] hover:bg-[#d8d8d8] transition-colors cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        className="flex-1 py-3 bg-[#43C17A] rounded-lg font-semibold text-white hover:bg-[#38a869] transition-colors shadow-sm cursor-pointer"
                                    >
                                        Schedule
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Sub-modal reading directly from the URL param */}
            <SelectFacultyModal
                isOpen={isSelectModalOpen}
                onClose={handleCloseSelectModal}
                onSelect={(users) => setSelectedUsers(users)}
                title={getModalTitleFromUrl()}
                roleName={selectModalRoleParam || 'Faculty'}
            />
        </>
    );
}