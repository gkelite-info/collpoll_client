import { motion, AnimatePresence } from 'framer-motion';
import { X, Warning, Clock, User, Buildings } from '@phosphor-icons/react';
import { ConflictItem } from '@/lib/helpers/collegeMeetings/fetchMeetingConflicts';

interface ConflictWarningModalProps {
    isOpen: boolean;
    conflicts: ConflictItem[];
    onClose: () => void;
    onChangeTimings: () => void;
}

export default function ConflictWarningModal({ isOpen, conflicts, onClose, onChangeTimings }: ConflictWarningModalProps) {
    // Early return removed so AnimatePresence can handle exit animations
    const formatTime12h = (time24: string) => {
        if (!time24) return '';
        const [hoursStr, minutes] = time24.split(':');
        let h = parseInt(hoursStr, 10);
        const ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12 || 12;
        return `${h}:${minutes} ${ampm}`;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div key="conflict-modal-overlay" className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
                    <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm cursor-pointer"
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
                    className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                >
                    <div className="px-6 py-5 border-b border-rose-100 bg-rose-50 flex items-center justify-between sticky top-0 z-10">
                        <div className="flex items-center gap-3 text-rose-600">
                            <Warning size={24} weight="fill" />
                            <h2 className="text-lg font-bold">Time Conflict Detected</h2>
                        </div>
                        <button onClick={onChangeTimings} className="p-2 rounded-full cursor-pointer hover:bg-rose-100 text-rose-400 hover:text-rose-600 transition-colors">
                            <X size={20} weight="bold" />
                        </button>
                    </div>

                    <div className="p-6 overflow-y-auto custom-scrollbar max-h-[60vh]">
                        <p className="text-sm font-medium text-gray-600 mb-4">
                            The selected time conflicts with the following scheduled events. Please consider changing the meeting timings.
                        </p>
                        
                        <div className="space-y-3">
                            {conflicts.map((c, idx) => (
                                <div key={idx} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                                    <div className="flex items-start justify-between gap-3 mb-2">
                                        <h3 className="font-bold text-gray-800 text-[15px] leading-tight">{c.title}</h3>
                                        <span className={`shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md
                                            ${c.type === 'meeting' ? 'bg-blue-100 text-blue-700' : 
                                              c.type === 'calendar_event' ? 'bg-purple-100 text-purple-700' : 
                                              'bg-orange-100 text-orange-700'}`}
                                        >
                                            {c.type.replace(/_/g, ' ')}
                                        </span>
                                    </div>
                                    <div className="flex flex-col gap-1.5 mt-3">
                                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-600">
                                            <Clock size={16} className="text-gray-400" />
                                            {formatTime12h(c.fromTime)} - {formatTime12h(c.toTime)}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                                            <User size={16} className="text-gray-400" />
                                            {c.organizer}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                        {/* 
                        <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-200 transition-colors">
                            Ignore (Not Recommended)
                        </button>
                        */}
                        <button onClick={onChangeTimings} className="px-5 py-2.5 rounded-xl cursor-pointer text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-colors">
                            Change Timings
                        </button>
                    </div>
                </motion.div>
            </div>
            )}
        </AnimatePresence>
    );
}
