import { motion, AnimatePresence } from 'framer-motion';
import { Meeting } from '../meetingTypes';
import { X, CalendarBlank, Clock, User, Link as LinkIcon, Users, Note, PencilSimple, Trash } from '@phosphor-icons/react';
import Link from 'next/link';
import { useUser } from "@/app/utils/context/UserContext";
import { useState, useEffect } from 'react';

interface MeetingViewModalProps {
    meeting: Meeting | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function MeetingViewModal({ meeting, isOpen, onClose }: MeetingViewModalProps) {
    if (!meeting) return null;

    const formatTime12h = (time24: string) => {
        if (!time24) return '';
        const [hours, minutes] = time24.split(':');
        let h = parseInt(hours, 10);
        const ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12 || 12;
        return `${h}:${minutes} ${ampm}`;
    };

    const { userId } = useUser();
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        if (!isOpen) return;
        setCurrentTime(new Date()); // initial set when opened
        const timer = setInterval(() => setCurrentTime(new Date()), 10000); // Check every 10 seconds
        return () => clearInterval(timer);
    }, [isOpen]);

    // Check if the current user owns this meeting (assuming meeting.userId exists, if not fallback to true or handle)
    const isMyMeeting = meeting.userId ? meeting.userId === userId : true;

    const meetStart = new Date(`${meeting.date}T${meeting.startTime}`);
    const meetEnd = new Date(`${meeting.date}T${meeting.endTime}`);
    
    const msBeforeStart = meetStart.getTime() - currentTime.getTime();
    const minsBeforeStart = msBeforeStart / 60000;
    
    const hasEnded = currentTime.getTime() > meetEnd.getTime();
    
    const todayStr = `${currentTime.getFullYear()}-${String(currentTime.getMonth() + 1).padStart(2, '0')}-${String(currentTime.getDate()).padStart(2, '0')}`;
    const isSameDate = meeting.date === todayStr;
    const isTooEarly = (!isSameDate && meetStart.getTime() > currentTime.getTime()) || (isSameDate && minsBeforeStart > 15);

    let earlyStatusText = "";
    if (isTooEarly) {
        if (!isSameDate) {
            earlyStatusText = "Upcoming";
        } else {
            earlyStatusText = `Starts in ${Math.ceil(minsBeforeStart)}m`;
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm cursor-pointer"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
                        className="relative w-full max-w-lg bg-white rounded-[24px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                    >

                        <div className="bg-gradient-to-r from-slate-50 to-white px-5 sm:px-6 py-4 sm:py-5 border-b border-gray-100 flex items-start justify-between gap-4 sticky top-0 z-10">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="px-2.5 py-1 bg-[#43C17A]/10 text-[#43C17A] text-[10px] font-bold uppercase tracking-wider rounded-full">
                                        {meeting.type}
                                    </span>
                                </div>
                                <h2 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight break-words">{meeting.title}</h2>
                            </div>
                            
                            <div className="flex items-center gap-1 shrink-0 pt-1">
                                <button
                                    onClick={onClose}
                                    className="cursor-pointer p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors ml-1"
                                >
                                    <X size={20} weight="bold" />
                                </button>
                            </div>
                        </div>

                        <div className="px-5 sm:px-6 py-5 sm:py-6 overflow-y-auto custom-scrollbar flex-1 space-y-6 sm:space-y-8">

                            {/* Prominent Top-Level Join Section */}
                            {(meeting.meetingLink || meeting.platform === 'Zoom Meeting') && isMyMeeting && (
                                <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <LinkIcon size={20} weight="fill" className="text-emerald-600 shrink-0" />
                                            <h3 className="text-[15px] font-bold text-gray-800 tracking-tight">{meeting.platform || 'Meeting'} Details</h3>
                                        </div>
                                        {meeting.platform === 'Zoom Meeting' ? (
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm mt-2">
                                                <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-md border border-gray-200">
                                                    <span className="text-gray-500 font-medium">ID:</span> <span className="font-bold text-gray-800">{meeting.zoomId || 'N/A'}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-md border border-gray-200">
                                                    <span className="text-gray-500 font-medium">Pass:</span> <span className="font-bold text-gray-800">{meeting.zoomPassword || 'N/A'}</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-500 truncate mt-0.5">{meeting.meetingLink}</p>
                                        )}
                                    </div>
                                    <div className="shrink-0 w-full sm:w-auto">
                                        {!isTooEarly && !hasEnded ? (
                                            <Link 
                                                href={meeting.meetingLink || `https://zoom.us/j/${meeting.zoomId?.replace(/\s/g, '')}`} 
                                                target="_blank" 
                                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-white rounded-xl font-bold text-[15px] transition-all active:scale-95 group bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20"
                                            >
                                                <span>Join Meeting</span>
                                                <LinkIcon size={18} weight="bold" className="group-hover:rotate-12 transition-transform" />
                                            </Link>
                                        ) : (
                                            <div className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-200/80 text-gray-400 rounded-xl font-semibold text-[15px] cursor-not-allowed">
                                                <span>{hasEnded ? "Meeting Ended" : (earlyStatusText || "Join Meeting")}</span>
                                                <LinkIcon size={18} weight="bold" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                <div className="bg-gray-50 rounded-2xl p-3 sm:p-4 flex items-center gap-3 sm:gap-4 overflow-hidden">
                                    <div className="h-10 w-10 sm:h-12 sm:w-12 shrink-0 rounded-full bg-white shadow-sm flex items-center justify-center text-[#43C17A]">
                                        <CalendarBlank size={22} weight="duotone" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[11px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">Date</p>
                                        <div className="text-[13px] sm:text-[14px] font-bold text-gray-800 break-words flex flex-col leading-snug">
                                            <span>{new Date(meeting.date).toLocaleDateString('en-US', { weekday: 'long' })},</span>
                                            <span className="text-gray-600 font-semibold">{new Date(meeting.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 rounded-2xl p-3 sm:p-4 flex items-center gap-3 sm:gap-4 overflow-hidden">
                                    <div className="h-10 w-10 sm:h-12 sm:w-12 shrink-0 rounded-full bg-white shadow-sm flex items-center justify-center text-blue-500">
                                        <Clock size={22} weight="duotone" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[11px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">Time</p>
                                        <div className="text-[13px] sm:text-[14px] font-bold text-gray-800 break-words flex flex-col leading-snug">
                                            <span>{formatTime12h(meeting.startTime)}</span>
                                            <span className="text-gray-500 text-[11px] sm:text-[12px]">to {formatTime12h(meeting.endTime)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-5 sm:gap-6">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                                        <User size={18} weight="fill" className="text-gray-400 shrink-0" />
                                        <h3 className="text-xs sm:text-sm font-bold text-gray-700 uppercase tracking-wider break-words">Organizer</h3>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-tr from-[#43C17A] to-emerald-400 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                                            {meeting.organizer.charAt(0)}
                                        </div>
                                        <span className="text-[13px] sm:text-[14px] font-semibold text-gray-800 break-words">{meeting.organizer}</span>
                                    </div>
                                </div>
                            </div>

                            <hr className="border-gray-100" />

                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <Note size={18} weight="fill" className="text-gray-400" />
                                    <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Agenda</h3>
                                </div>
                                <div className="bg-gray-50 rounded-2xl p-4 sm:p-5 text-[14px] text-gray-600 leading-relaxed border border-gray-100/50 break-words">
                                    {meeting.agenda || "No agenda provided."}
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <Users size={18} weight="fill" className="text-gray-400" />
                                    <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Attendees</h3>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {meeting.attendees.map((attendee, idx) => (
                                        <div key={idx} className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 shadow-sm flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-gray-300"></div>
                                            {attendee}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
