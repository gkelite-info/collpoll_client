import { motion, AnimatePresence } from 'framer-motion';
import { Meeting } from '../meetingTypes';
import { X, CalendarBlank, Clock, User, Link as LinkIcon, Users, Note, PencilSimple, Trash } from '@phosphor-icons/react';
import Link from 'next/link';

interface MeetingViewModalProps {
    meeting: Meeting | null;
    isOpen: boolean;
    onClose: () => void;
    onEdit?: (meeting: Meeting) => void;
    onDelete?: (meeting: Meeting) => void;
}

export default function MeetingViewModal({ meeting, isOpen, onClose, onEdit, onDelete }: MeetingViewModalProps) {
    if (!meeting) return null;

    const formatTime12h = (time24: string) => {
        if (!time24) return '';
        const [hours, minutes] = time24.split(':');
        let h = parseInt(hours, 10);
        const ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12 || 12;
        return `${h}:${minutes} ${ampm}`;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">

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
                                {onEdit && (
                                    <button
                                        onClick={() => { onClose(); onEdit(meeting); }}
                                        className="cursor-pointer p-2 rounded-xl text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
                                        title="Edit Meeting"
                                    >
                                        <PencilSimple size={20} weight="duotone" />
                                    </button>
                                )}
                                {onDelete && (
                                    <button
                                        onClick={() => { onClose(); onDelete(meeting); }}
                                        className="cursor-pointer p-2 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-all duration-200"
                                        title="Delete Meeting"
                                    >
                                        <Trash size={20} weight="duotone" />
                                    </button>
                                )}
                                <button
                                    onClick={onClose}
                                    className="cursor-pointer p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors ml-1"
                                >
                                    <X size={20} weight="bold" />
                                </button>
                            </div>
                        </div>

                        <div className="px-5 sm:px-6 py-5 sm:py-6 overflow-y-auto custom-scrollbar flex-1 space-y-6 sm:space-y-8">

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

                                {meeting.meetingLink && (
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2 sm:mb-3">
                                            <LinkIcon size={18} weight="fill" className="text-gray-400 shrink-0" />
                                            <h3 className="text-xs sm:text-sm font-bold text-gray-700 uppercase tracking-wider break-words">Meeting Link</h3>
                                        </div>
                                        <Link href={meeting.meetingLink} target="_blank" className="inline-flex max-w-full items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl font-semibold text-sm transition-colors">
                                            <span className="break-words">Join Meeting</span>
                                            <LinkIcon size={14} weight="bold" className="flex-shrink-0" />
                                        </Link>
                                    </div>
                                )}
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
