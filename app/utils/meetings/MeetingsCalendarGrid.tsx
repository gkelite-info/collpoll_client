import { useEffect, useRef, useState, useMemo } from 'react';
import { Meeting } from './meetingTypes';
import { PencilSimple, Trash } from '@phosphor-icons/react';
import { SelectUser } from "@/lib/helpers/Hr/meetings/getCollegeUsers";

interface MeetingsCalendarGridProps {
    daysToRender: Date[];
    gridHours: number[];
    currentTimeOffset: number;
    isCurrentWeek: boolean;
    displayMeetings: Meeting[];
    todayDateString: string;
    getDayStatus: (date: Date) => { isBlocked: boolean; reason: string | null };
    getTypeColor: (type: string) => string;
    getMeetingStyle: (meeting: Meeting) => React.CSSProperties;
    formatTime12h: (time24: string) => string;
    isMeetingInPast: (meeting: Meeting) => boolean;
    viewedUser: SelectUser | null;
    isReadOnly: boolean;
    setViewMeeting: (meeting: Meeting) => void;
    openEditModal: (meeting: Meeting) => void;
    setDeleteMeeting: (meeting: Meeting) => void;
    isLoadingData: boolean;
}

export default function MeetingsCalendarGrid({
    daysToRender,
    gridHours,
    currentTimeOffset,
    isCurrentWeek,
    displayMeetings,
    todayDateString,
    getDayStatus,
    getTypeColor,
    getMeetingStyle,
    formatTime12h,
    isMeetingInPast,
    viewedUser,
    isReadOnly,
    setViewMeeting,
    openEditModal,
    setDeleteMeeting,
    isLoadingData
}: MeetingsCalendarGridProps) {
    const HOUR_HEIGHT = 160;
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [hasInitialScrolled, setHasInitialScrolled] = useState(false);

    useEffect(() => {
        // Auto-scroll to position the current time indicator near the top/center
        if (!isLoadingData && !hasInitialScrolled && scrollContainerRef.current && currentTimeOffset > 0) {
            const scrollTarget = Math.max(0, currentTimeOffset - 150);
            setTimeout(() => {
                if (scrollContainerRef.current) {
                    scrollContainerRef.current.scrollTo({ top: scrollTarget, behavior: 'smooth' });
                }
            }, 100);
            setHasInitialScrolled(true);
        }
    }, [isLoadingData, hasInitialScrolled, currentTimeOffset]);

    const getLocalISODate = (d: Date) => {
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    return (
        <div 
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto overflow-x-auto custom-scrollbar relative bg-white"
        >
            <div className="min-w-[800px] flex flex-col relative w-full">

                <div className="flex border-b border-gray-200 sticky top-0 bg-white z-30 shadow-sm pr-4">
                    <div className="w-[60px] flex-shrink-0 border-r border-gray-200 bg-white"></div>
                    <div className={`flex-1 grid`} style={{ gridTemplateColumns: `repeat(${daysToRender.length}, minmax(0, 1fr))` }}>
                        {daysToRender.map((day, idx) => {
                            const isToday = day.toDateString() === todayDateString;
                            const status = getDayStatus(day);
                            return (
                                <div key={idx} className={`pt-3 pb-6 flex flex-col items-center border-r border-gray-200 relative
                                    ${status.isBlocked ? 'bg-gray-50/80' : 'bg-white'}`}
                                >
                                    <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${isToday ? 'text-emerald-600' : 'text-gray-500'}`}>
                                        {day.toLocaleString('default', { weekday: 'short' })}
                                    </p>
                                    <div className={`h-9 w-9 flex items-center justify-center rounded-full text-lg font-bold
                                        ${isToday ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-800'}`}>
                                        {day.getDate()}
                                    </div>
                                    {status.isBlocked && status.reason && (
                                        <div className="absolute bottom-1 w-full text-center px-1">
                                            <span className="text-[9px] font-bold text-rose-500 uppercase tracking-widest truncate block">
                                                {status.reason}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="flex flex-1 relative bg-white pr-4 pb-4">

                    <div className="w-[60px] flex-shrink-0 border-r border-gray-200 bg-white relative z-20 sticky left-0">
                        {gridHours.map(hour => (
                            <div key={hour} className="relative" style={{ height: `${HOUR_HEIGHT}px` }}>
                                <span className="absolute -top-3 right-2 text-[11px] font-bold text-gray-500 bg-white px-1 leading-none z-20">
                                    {hour > 12 ? `${hour - 12} PM` : hour === 12 ? '12 PM' : hour === 0 ? '12 AM' : `${hour} AM`}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className={`flex-1 grid relative`} style={{ gridTemplateColumns: `repeat(${daysToRender.length}, minmax(0, 1fr))` }}>

                        <div className="absolute inset-0 pointer-events-none z-0">
                            {gridHours.map((_, i) => (
                                <div key={i} className="border-b border-gray-100 w-full" style={{ height: `${HOUR_HEIGHT}px` }}></div>
                            ))}
                        </div>
                        
                        {/* Full width current time dashed line */}
                        {currentTimeOffset >= 0 && currentTimeOffset <= gridHours.length * HOUR_HEIGHT && isCurrentWeek && (
                            <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
                                <div 
                                    className="absolute left-0 right-0 border-t border-dashed border-red-400/70"
                                    style={{ top: `${currentTimeOffset}px` }}
                                ></div>
                            </div>
                        )}

                        {daysToRender.map((day, dayIdx) => {
                            const dateStr = getLocalISODate(day);
                            const dayMeetings = displayMeetings.filter(m => m.date === dateStr);
                            const isToday = day.toDateString() === todayDateString;
                            const status = getDayStatus(day);

                            return (
                                <div key={dayIdx} className={`relative border-r border-gray-200 z-10 transition-colors
                                    ${status.isBlocked 
                                        ? 'bg-[url("data:image/svg+xml,%3Csvg width=\'10\' height=\'10\' viewBox=\'0 0 10 10\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M-1,1 l2,-2 M0,10 l10,-10 M9,11 l2,-2\' stroke=\'%23f3f4f6\' stroke-width=\'1\'/%3E%3C/svg%3E")] bg-gray-50/50' 
                                        : 'bg-transparent'}`}
                                >
                                
                                    {/* Current Time Indicator for Today's Column */}
                                    {isToday && currentTimeOffset >= 0 && currentTimeOffset <= gridHours.length * HOUR_HEIGHT && (
                                        <div 
                                            className="absolute left-0 right-0 z-40 pointer-events-none flex items-center"
                                            style={{ top: `${currentTimeOffset}px`, transform: 'translateY(-50%)' }}
                                        >
                                            <div className="w-2.5 h-2.5 rounded-full bg-red-500 absolute -left-1.5 shadow-sm"></div>
                                            <div className="w-full h-[2px] bg-red-500 shadow-sm"></div>
                                        </div>
                                    )}

                                    {dayMeetings.map(meeting => (
                                        <div 
                                            key={meeting.id}
                                            onClick={() => setViewMeeting(meeting)}
                                            className={`absolute left-1 right-1 rounded-md border-l-[3px] p-1.5 cursor-pointer overflow-hidden transition-all shadow-sm ${getTypeColor(meeting.type)} z-20 hover:z-30 hover:shadow-md group`}
                                            style={getMeetingStyle(meeting)}
                                        >
                                            <div className="flex justify-between items-start gap-1">
                                                <div className="text-[13px] font-bold truncate leading-tight flex-1">{meeting.title}</div>
                                                {/* Edit/Delete Actions */}
                                                {!viewedUser && !isReadOnly && !isMeetingInPast(meeting) && (
                                                    <div className="hidden group-hover:flex items-center shrink-0 bg-white/95 backdrop-blur-md rounded-md shadow-sm border border-gray-100 p-1 mt-[-4px] mr-[-4px] gap-1 z-50">
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); openEditModal(meeting); }} 
                                                            className="cursor-pointer p-1.5 hover:bg-blue-50 text-gray-500 hover:text-blue-600 rounded-md transition-colors"
                                                            title="Edit Meeting"
                                                        >
                                                            <PencilSimple size={16} weight="bold" />
                                                        </button>
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); setDeleteMeeting(meeting); }} 
                                                            className="cursor-pointer p-1.5 hover:bg-rose-50 text-gray-500 hover:text-rose-600 rounded-md transition-colors"
                                                            title="Delete Meeting"
                                                        >
                                                            <Trash size={16} weight="bold" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-[11px] font-semibold opacity-80 mt-0.5 truncate">
                                                {formatTime12h(meeting.startTime)} - {formatTime12h(meeting.endTime)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
