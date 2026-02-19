'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface CreateMeetingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const getTodayDateString = () => {
    const d = new Date();
    return d.toISOString().split("T")[0];
};

// 🔴 ADDED
const convertTo24Hour = (
    hour: string,
    minute: string,
    period: "AM" | "PM"
) => {
    let h = parseInt(hour);

    if (period === "PM" && h !== 12) h += 12;
    if (period === "AM" && h === 12) h = 0;

    return h * 60 + parseInt(minute);
};


const CreateMeetingModal = ({ isOpen, onClose }: CreateMeetingModalProps) => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [role, setRole] = useState("Select Role");
    const [date, setDate] = useState(getTodayDateString());
    const [startHour, setStartHour] = useState("09");
    const [startMinute, setStartMinute] = useState("00");
    const [startPeriod, setStartPeriod] = useState<"AM" | "PM">("AM");
    const [endHour, setEndHour] = useState("10");
    const [endMinute, setEndMinute] = useState("00");
    const [endPeriod, setEndPeriod] = useState<"AM" | "PM">("AM");
    const [branch, setBranch] = useState("CSE");
    const [year, setYear] = useState("Select Year");
    const [section, setSection] = useState("Select Section");
    const [meetingLink, setMeetingLink] = useState("");
    const [inAppNotification, setInAppNotification] = useState(false);
    const [emailNotification, setEmailNotification] = useState(false);
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
            setTitle("");
            setDescription("");
            setRole("Select Role");
            setDate(getTodayDateString());
            setStartHour("09");
            setStartMinute("00");
            setStartPeriod("AM");
            setEndHour("10");
            setEndMinute("00");
            setEndPeriod("AM");
            setBranch("CSE");
            setYear("Select Year");
            setSection("Select Section");
            setMeetingLink("");
            setInAppNotification(false);
            setEmailNotification(false);
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handleSubmit = async () => {
        try {
            if (!title.trim()) {
                toast.error("Meeting title is required");
                return;
            }
            if (!description.trim()) {
                toast.error("Meeting description is required");
                return;
            }
            if (!role || role === "Select Role") {
                toast.error("Please select a role");
                return;
            }
            if (!date) {
                toast.error("Please select meeting date");
                return;
            }
            if (role !== "Admin") {

                if (!branch) {
                    toast.error("Please select branch");
                    return;
                }

                if (!year || year === "Select Year") {
                    toast.error("Please select year");
                    return;
                }

                if (!section || section === "Select Section") {
                    toast.error("Please select section");
                    return;
                }
            }
            if (!meetingLink.trim()) {
                toast.error("Meeting link is required");
                return;
            }
            try {
                new URL(meetingLink);
            } catch {
                toast.error("Please enter a valid meeting link");
                return;
            }
            const startTime = convertTo24Hour(startHour, startMinute, startPeriod);
            const endTime = convertTo24Hour(endHour, endMinute, endPeriod);

            if (startTime >= endTime) {
                toast.error("End time must be greater than start time");
                return;
            }
            if (!inAppNotification && !emailNotification) {
                toast.error("Please select at least one notification type");
                return;
            }
            toast.success("Meeting scheduled successfully");

            console.log("Saving Meeting...", {
                title,
                description,
                role,
                branch,
                year,
                section,
                date,
                meetingLink,
                inAppNotification,
                emailNotification
            });

            onClose();

        } catch (error) {
            console.error("Meeting submission failed:", error);
            toast.error("Something went wrong. Please try again.");
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                style={{ backgroundColor: "#3E3D3DA3" }}
                className="fixed inset-0 z-50 flex justify-center items-center p-4 backdrop-blur-sm"
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white rounded-lg shadow-xl w-full max-w-112.5 max-h-[90vh] overflow-y-auto flex flex-col"
                >
                    <div className="p-6 pb-0">
                        <h2 className="text-2xl font-bold text-[#282828]">Create Meeting</h2>
                    </div>
                    <div className="p-6 space-y-2 pt-0 mt-3">
                        <div className="space-y-1">
                            <label className="text-sm text-[#282828]">Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Ex:- Monthly Review with B.Tech Admins"
                                className="w-full px-3 py-2 border text-[#454545] border-[#CCCCCC] rounded-md focus:outline-none focus:ring-1 focus:ring-[#43C17A] text-sm"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm text-[#282828]">Description</label>
                            <textarea
                                rows={3}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Brief description of the meeting......!!!!"
                                className="w-full px-3 py-2 border border-[#CCCCCC] rounded-md focus:outline-none focus:ring-1 focus:ring-[#43C17A] text-sm resize-none"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm text-[#282828]">Role</label>
                                <div className="relative">
                                    <select
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                        className="w-full px-3 py-2 border border-[#CCCCCC] rounded-md focus:outline-none focus:ring-1 focus:ring-[#43C17A] text-sm appearance-none bg-white text-gray-500 cursor-pointer"
                                    >
                                        <option disabled>Select Role</option>
                                        <option value="Parent">Parent</option>
                                        <option value="Student">Student</option>
                                        <option value="Faculty">Faculty</option>
                                        <option value="Admin">Admin</option>
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#282828]">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm text-[#282828]">Date</label>
                                <input
                                    type="date"
                                    value={date}
                                    min={getTodayDateString()}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full px-3 py-2 border border-[#CCCCCC] rounded-md focus:outline-none focus:ring-1 focus:ring-[#43C17A] text-sm cursor-pointer"
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm text-[#282828]">Time</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <span className="text-xs text-gray-500 mb-1 block">From</span>
                                    <div className="flex gap-2">
                                        <select
                                            value={startHour}
                                            onChange={(e) => setStartHour(e.target.value)}
                                            className="flex-1 px-2 py-2 border border-[#CCCCCC] rounded-md text-sm bg-white cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#43C17A]"
                                        >
                                            {Array.from({ length: 12 }, (_, i) => {
                                                const h = String(i + 1).padStart(2, "0");
                                                return <option key={h} value={h}>{h}</option>;
                                            })}
                                        </select>

                                        <select
                                            value={startMinute}
                                            onChange={(e) => setStartMinute(e.target.value)}
                                            className="flex-1 px-2 py-2 border border-[#CCCCCC] rounded-md text-sm bg-white cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#43C17A]"
                                        >
                                            {Array.from({ length: 12 }, (_, i) => {
                                                const m = String(i * 5).padStart(2, "0");
                                                return <option key={m} value={m}>{m}</option>;
                                            })}
                                        </select>

                                        <select
                                            value={startPeriod}
                                            onChange={(e) => setStartPeriod(e.target.value as "AM" | "PM")}
                                            className="flex-1 px-2 py-2 border border-[#CCCCCC] rounded-md text-sm bg-white cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#43C17A]"
                                        >
                                            <option value="AM">AM</option>
                                            <option value="PM">PM</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <span className="text-xs text-gray-500 mb-1 block">To</span>
                                    <div className="flex gap-2">
                                        <select
                                            value={endHour}
                                            onChange={(e) => setEndHour(e.target.value)}
                                            className="flex-1 px-2 py-2 border border-[#CCCCCC] rounded-md text-sm bg-white cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#43C17A]"
                                        >
                                            {Array.from({ length: 12 }, (_, i) => {
                                                const h = String(i + 1).padStart(2, "0");
                                                return <option key={h} value={h}>{h}</option>;
                                            })}
                                        </select>
                                        <select
                                            value={endMinute}
                                            onChange={(e) => setEndMinute(e.target.value)}
                                            className="flex-1 px-2 py-2 border border-[#CCCCCC] rounded-md text-sm bg-white cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#43C17A]"
                                        >
                                            {Array.from({ length: 12 }, (_, i) => {
                                                const m = String(i * 5).padStart(2, "0");
                                                return <option key={m} value={m}>{m}</option>;
                                            })}
                                        </select>

                                        <select
                                            value={endPeriod}
                                            onChange={(e) => setEndPeriod(e.target.value as "AM" | "PM")}
                                            className="flex-1 px-2 py-2 border border-[#CCCCCC] rounded-md text-sm bg-white cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#43C17A]"
                                        >
                                            <option value="AM">AM</option>
                                            <option value="PM">PM</option>
                                        </select>
                                    </div>
                                </div>

                            </div>
                        </div>
                        {role !== "Admin" &&
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm text-[#282828]">Branch</label>
                                    <div className="relative">
                                        <select
                                            value={branch}
                                            onChange={(e) => setBranch(e.target.value)}
                                            className="w-full px-3 py-2 border border-[#CCCCCC] rounded-md focus:outline-none focus:ring-1 focus:ring-[#43C17A] text-sm appearance-none bg-white cursor-pointer"
                                        >
                                            <option value="CSE">CSE</option>
                                            <option value="ECE">ECE</option>
                                            <option value="MECH">MECH</option>
                                        </select>
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm text-[#282828]">Year</label>
                                    <div className="relative">
                                        <select
                                            value={year}
                                            onChange={(e) => setYear(e.target.value)}
                                            className="w-full px-3 py-2 border border-[#CCCCCC] rounded-md focus:outline-none focus:ring-1 focus:ring-[#43C17A] text-sm appearance-none bg-white text-gray-500 cursor-pointer"
                                        >
                                            <option disabled>Select Year</option>
                                            <option value="1st Year">1st Year</option>
                                            <option value="2nd Year">2nd Year</option>
                                            <option value="3rd Year">3rd Year</option>
                                            <option value="4th Year">4th Year</option>
                                        </select>
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        }

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {role !== "Admin" &&
                                <div className="space-y-1">
                                    <label className="text-sm text-[#282828]">Section</label>
                                    <div className="relative">
                                        <select
                                            value={section}
                                            onChange={(e) => setSection(e.target.value)}
                                            className="w-full px-3 py-2 border border-[#CCCCCC] rounded-md focus:outline-none focus:ring-1 focus:ring-[#43C17A] text-sm appearance-none bg-white text-gray-500 cursor-pointer"
                                        >
                                            <option disabled>Select Section</option>
                                            <option value="A">A</option>
                                            <option value="B">B</option>
                                            <option value="C">C</option>
                                        </select>
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                        </div>
                                    </div>
                                </div>
                            }
                            <div className="space-y-1">
                                <label className="text-sm text-[#282828]">Meeting Link</label>
                                <input
                                    type="url"
                                    value={meetingLink}
                                    onChange={(e) => setMeetingLink(e.target.value)}
                                    placeholder="https://meet.google.com/..."
                                    className="w-full px-3 py-2 border border-[#CCCCCC] rounded-md focus:outline-none focus:ring-1 focus:ring-[#43C17A] text-sm"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm text-[#282828]">Notifications</label>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <label className="flex items-center gap-2 p-3 py-2 border border-[#CCCCCC] rounded-md flex-1 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={inAppNotification}
                                        onChange={(e) => setInAppNotification(e.target.checked)}
                                        className="w-4 h-4 text-[#43C17A] rounded focus:ring-[#43C17A] border-[#CCCCCC]"
                                    />
                                    <span className="text-sm text-[#282828]">In-app notification</span>
                                </label>
                                <label className="flex items-center gap-2 p-3 py-2 border border-[#CCCCCC] rounded-md flex-1 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={emailNotification}
                                        onChange={(e) => setEmailNotification(e.target.checked)}
                                        className="w-4 h-4 text-[#43C17A] rounded focus:ring-[#43C17A] border-[#CCCCCC]"
                                    />
                                    <span className="text-sm text-[#282828]">Email notification</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 px-6 pb-6 -mt-1">
                        <button
                            onClick={onClose}
                            className="px-8 rounded-md bg-[#E3E3E3] text-[#282828] font-medium w-full md:w-auto cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="px-8 py-1.5 rounded-md bg-[#43C17A] text-white font-medium  w-full md:w-auto shadow-sm cursor-pointer"
                        >
                            Schedule
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default CreateMeetingModal;