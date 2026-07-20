import { MouseEvent } from 'react';
import { Meeting } from '../meetingTypes';
import { CalendarBlank, Clock, MapPin, Users, CaretRight, Trash, PencilSimple } from '@phosphor-icons/react';

interface MeetingCardProps {
    meeting: Meeting;
    onClick: () => void;
    onDelete?: (e: MouseEvent) => void;
    onEdit?: (e: MouseEvent) => void;
}

export default function MeetingCard({ meeting, onClick, onDelete, onEdit }: MeetingCardProps) {
    const isToday = meeting.date === new Date().toISOString().split('T')[0];

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'Internal': return 'bg-blue-50 text-blue-600 border-blue-200';
            case 'External': return 'bg-purple-50 text-purple-600 border-purple-200';
            case 'Staff': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
            case 'Management': return 'bg-amber-50 text-amber-600 border-amber-200';
            default: return 'bg-gray-50 text-gray-600 border-gray-200';
        }
    };

    const formatTime12h = (time24: string) => {
        if (!time24) return '';
        const [hours, minutes] = time24.split(':');
        let h = parseInt(hours, 10);
        const ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12 || 12;
        return `${h}:${minutes} ${ampm}`;
    };

    return (
        <div 
            onClick={onClick}
            className="group cursor-pointer bg-white rounded-[20px] p-4 sm:p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-gray-100 hover:border-[#43C17A]/40 transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 relative overflow-hidden"
        >
            {/* Left Accent Line */}
            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${isToday ? 'bg-gradient-to-b from-[#43C17A] to-emerald-400' : 'bg-transparent group-hover:bg-[#43C17A]/40 transition-colors'}`}></div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 w-full ml-1 sm:ml-2">
                {/* Date/Time Block - Distinctive UI */}
                <div className={`flex flex-row sm:flex-col items-center sm:justify-center p-3 sm:px-4 sm:py-3 rounded-2xl sm:min-w-[90px] border shadow-sm ${isToday ? 'bg-gradient-to-br from-[#43C17A]/10 to-emerald-50 border-[#43C17A]/20 text-[#43C17A]' : 'bg-gray-50/80 border-gray-100 text-gray-500 group-hover:bg-gray-50'}`}>
                    <CalendarBlank size={22} weight={isToday ? "fill" : "duotone"} className="mr-2 sm:mr-0 sm:mb-1" />
                    <span className="text-xs sm:text-[11px] font-bold uppercase tracking-wider text-center">
                        {isToday ? 'Today' : (
                            <span className="flex flex-row sm:flex-col items-center gap-1 sm:gap-0">
                                <span className="text-sm sm:text-base text-gray-800 font-extrabold">{meeting.date.split('-')[2]}</span>
                                <span>{new Date(meeting.date).toLocaleString('default', { month: 'short' })}</span>
                            </span>
                        )}
                    </span>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 w-full">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold border uppercase tracking-wider ${getTypeColor(meeting.type)}`}>
                            {meeting.type}
                        </span>
                        {isToday && (
                            <span className="text-[10px] px-2 py-1 rounded-full font-bold bg-rose-50 text-rose-500 border border-rose-100 uppercase tracking-wider flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span> Happening Today
                            </span>
                        )}
                    </div>
                    
                    <h3 className="text-gray-900 font-extrabold text-[17px] sm:text-[19px] truncate group-hover:text-[#43C17A] transition-colors pr-4">{meeting.title}</h3>
                    
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2.5 mt-2.5 text-[13px] text-gray-500 font-semibold">
                        <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-lg">
                            <Clock size={16} weight="duotone" className="text-gray-400" />
                            <span>{formatTime12h(meeting.startTime)} - {formatTime12h(meeting.endTime)}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-700 text-[10px] border border-white shadow-sm">
                                {meeting.organizer.charAt(0)}
                            </div>
                            <span className="truncate max-w-[120px] sm:max-w-none">{meeting.organizer}</span>
                        </div>
                        {meeting.meetingLink && (
                            <div className="flex items-center gap-1.5 text-blue-500 hover:text-blue-600 transition-colors" onClick={(e) => e.stopPropagation()}>
                                <MapPin size={16} weight="duotone" />
                                <a href={meeting.meetingLink} target="_blank" rel="noopener noreferrer" className="hover:underline">Online Link</a>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex flex-row items-center gap-2 sm:gap-3 w-full sm:w-auto sm:pl-5 sm:border-l border-gray-100 mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 justify-end sm:justify-start">
                <div className="flex items-center gap-1 sm:gap-2 mr-auto sm:mr-0">
                    {onEdit && (
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit(e);
                            }}
                            className="cursor-pointer p-2 sm:p-2.5 rounded-xl text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
                            title="Edit Meeting"
                        >
                            <PencilSimple size={20} weight="duotone" />
                        </button>
                    )}
                    {onDelete && (
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(e);
                            }}
                            className="cursor-pointer p-2 sm:p-2.5 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-all duration-200"
                            title="Delete Meeting"
                        >
                            <Trash size={20} weight="duotone" />
                        </button>
                    )}
                </div>
                
                <div className="cursor-pointer p-2 sm:p-2.5 rounded-xl bg-gray-50 text-gray-400 group-hover:bg-[#43C17A] group-hover:text-white group-hover:shadow-md group-hover:shadow-[#43C17A]/20 transition-all duration-300">
                    <CaretRight size={20} weight="bold" />
                </div>
            </div>
        </div>
    );
}
