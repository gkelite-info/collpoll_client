"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Meeting } from './meetingTypes';
import MeetingViewModal from './components/MeetingViewModal';
import MeetingFormModal from './components/MeetingCreateModal';
import ConfirmDeleteModal from '@/app/(screens)/admin/calendar/components/ConfirmDeleteModal';
import MonthPicker from './components/MonthPicker';
import MeetingsShimmer from './MeetingsShimmer';
import { Plus, CaretLeft, CaretRight, CaretDown, CalendarBlank } from '@phosphor-icons/react';
import toast from 'react-hot-toast';
import { useUser } from "@/app/utils/context/UserContext";
import { getCollegeTimings, DayTimingPayload } from "@/lib/helpers/collegeTimings/collegeTimingsAPI";
import { fetchCollegeHolidays, CollegeHoliday } from "@/lib/helpers/Hr/holidays/holidayAPI";

interface MeetingsClientProps {
    initialMeetings: Meeting[];
}

type ViewMode = 'Day' | 'Work week' | 'Week';

export default function MeetingsClient({ initialMeetings }: MeetingsClientProps) {
    const { collegeId } = useUser();

    const [meetings, setMeetings] = useState<Meeting[]>(initialMeetings);
    const [timings, setTimings] = useState<DayTimingPayload[]>([]);
    const [holidays, setHolidays] = useState<CollegeHoliday[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);

    const [viewMode, setViewMode] = useState<ViewMode>('Work week');
    const [isViewDropdownOpen, setIsViewDropdownOpen] = useState(false);

    const [currentDate, setCurrentDate] = useState<Date>(new Date());
    const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);

    const [viewMeeting, setViewMeeting] = useState<Meeting | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editMeeting, setEditMeeting] = useState<Meeting | null>(null);
    const [deleteMeeting, setDeleteMeeting] = useState<Meeting | null>(null);
    
    const [currentTime, setCurrentTime] = useState<Date>(new Date());

    const monthPickerRef = useRef<HTMLDivElement>(null);
    const viewDropdownRef = useRef<HTMLDivElement>(null);

    // Update current time every minute for the time indicator line
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const loadData = async () => {
            if (!collegeId) return;
            setIsLoadingData(true);
            try {
                const [timingsRes, holidaysRes] = await Promise.all([
                    getCollegeTimings(collegeId),
                    fetchCollegeHolidays(collegeId, currentDate.getFullYear())
                ]);
                
                if (timingsRes.success && timingsRes.data) {
                    setTimings(timingsRes.data);
                }
                if (holidaysRes) {
                    setHolidays(holidaysRes);
                }
            } catch (error) {
                console.error("Failed to fetch calendar data", error);
            } finally {
                setIsLoadingData(false);
            }
        };
        loadData();
    }, [collegeId, currentDate.getFullYear()]); // Refetch if year changes

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (monthPickerRef.current && !monthPickerRef.current.contains(event.target as Node)) {
                setIsMonthPickerOpen(false);
            }
            if (viewDropdownRef.current && !viewDropdownRef.current.contains(event.target as Node)) {
                setIsViewDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getStartOfWeek = (date: Date, startOnMonday = true) => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 && startOnMonday ? -6 : (startOnMonday ? 1 : 0));
        d.setDate(diff);
        d.setHours(0, 0, 0, 0);
        return d;
    };

    const navigate = (direction: 'prev' | 'next') => {
        const next = new Date(currentDate);
        if (viewMode === 'Day') {
            next.setDate(next.getDate() + (direction === 'next' ? 1 : -1));
        } else {
            next.setDate(next.getDate() + (direction === 'next' ? 7 : -7));
        }
        setCurrentDate(next);
    };

    const goToToday = () => setCurrentDate(new Date());

    const daysToRender = useMemo(() => {
        if (viewMode === 'Day') {
            return [new Date(currentDate)];
        }
        const start = getStartOfWeek(currentDate, viewMode === 'Work week');
        
        let length = 7;
        if (viewMode === 'Work week') {
            let isSaturdayClosed = false;

            if (timings.length > 0) {
                const saturdayTiming = timings.find(t => t.dayOfWeek === 'Saturday');
                if (saturdayTiming && !saturdayTiming.isOpen) {
                    isSaturdayClosed = true;
                }
            }
            
            if (holidays.length > 0) {
                const hasSaturdayWeeklyOff = holidays.some(h => {
                    if (!h.holidayDate) return false;
                    const [year, month, day] = h.holidayDate.split('-').map(Number);
                    const hDate = new Date(year, month - 1, day);
                    return hDate.getDay() === 6 && h.holidayType === 'weekly_off';
                });
                if (hasSaturdayWeeklyOff) {
                    isSaturdayClosed = true;
                }
            }

            length = isSaturdayClosed ? 5 : 6;
        }
        
        return Array.from({ length }).map((_, i) => {
            const d = new Date(start);
            d.setDate(d.getDate() + i);
            return d;
        });
    }, [currentDate, viewMode, timings]);

    const getGridBounds = useCallback(() => {
        let minHour = 8; // Default 8 AM
        let maxHour = 18; // Default 6 PM
        
        if (timings.length > 0) {
            const allHours = timings
                .filter(t => t.isOpen && t.openAt && t.closeAt)
                .flatMap(t => {
                    const openH = parseInt(t.openAt!.split(':')[0]);
                    let closeH = parseInt(t.closeAt!.split(':')[0]);
                    if (closeH < openH) closeH += 12; // Handle AM/PM fix if close hour is lower than open
                    return [openH, closeH];
                });
            
            if (allHours.length > 0) {
                minHour = Math.max(0, Math.min(...allHours) - 1); // 1 hour before earliest open
                maxHour = Math.min(24, Math.max(...allHours) + 1); // 1 hour after latest close
                if (minHour < 6) minHour = 6;
                if (maxHour > 22) maxHour = 22;
            }
        }

        return Array.from({ length: maxHour - minHour + 1 }).map((_, i) => minHour + i);
    }, [timings]);

    const gridHours = getGridBounds();

    const currentTimeOffset = useMemo(() => {
        if (!gridHours.length) return -1;
        const minHour = gridHours[0];
        const h = currentTime.getHours();
        const m = currentTime.getMinutes();
        const offset = (h - minHour) * 60 + m;
        return offset;
    }, [currentTime, gridHours]);

    const isCurrentWeek = useMemo(() => {
        if (!daysToRender.length) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const firstDay = new Date(daysToRender[0]);
        firstDay.setHours(0, 0, 0, 0);
        
        const startOfRenderWeek = getStartOfWeek(firstDay, viewMode === 'Work week');
        const startOfTodayWeek = getStartOfWeek(today, viewMode === 'Work week');
        
        return startOfRenderWeek.getTime() === startOfTodayWeek.getTime();
    }, [daysToRender, viewMode]);

    const formatTime12h = (time24: string) => {
        if (!time24) return '';
        const [hoursStr, minutes] = time24.split(':');
        let h = parseInt(hoursStr, 10);
        const ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12 || 12;
        return `${h}:${minutes} ${ampm}`;
    };

    const getMeetingStyle = (meeting: Meeting) => {
        const [startHour, startMin] = meeting.startTime.split(':').map(Number);
        const [endHour, endMin] = meeting.endTime.split(':').map(Number);
        
        const minHour = gridHours[0];
        const startOffset = (startHour - minHour) * 60 + startMin;
        const duration = (endHour * 60 + endMin) - (startHour * 60 + startMin);
        
        return {
            top: `${startOffset}px`,
            height: `${duration}px`,
            minHeight: '24px'
        };
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'Internal': return 'bg-blue-100/90 border-blue-300 text-blue-900 hover:bg-blue-200';
            case 'External': return 'bg-purple-100/90 border-purple-300 text-purple-900 hover:bg-purple-200';
            case 'Staff': return 'bg-emerald-100/90 border-emerald-300 text-emerald-900 hover:bg-emerald-200';
            case 'Management': return 'bg-amber-100/90 border-amber-300 text-amber-900 hover:bg-amber-200';
            default: return 'bg-gray-100/90 border-gray-300 text-gray-900 hover:bg-gray-200';
        }
    };

    const handleFormSubmit = (newMeeting: Omit<Meeting, 'id'>, id?: string) => {
        if (id) {
            setMeetings(meetings.map(m => m.id === id ? { ...newMeeting, id } : m));
        } else {
            const meeting: Meeting = { ...newMeeting, id: `m_${Date.now()}` };
            setMeetings([...meetings, meeting]);
        }
    };

    const handleDeleteConfirm = async () => {
        if (deleteMeeting) {
            try {
                await new Promise(resolve => setTimeout(resolve, 600));
                setMeetings(meetings.filter(m => m.id !== deleteMeeting.id));
                toast.success('Meeting deleted successfully!', { id: 'delete-toast' });
            } catch (error) {
                toast.error('Failed to delete meeting.', { id: 'delete-toast' });
            } finally {
                setDeleteMeeting(null);
            }
        }
    };

    const openEditModal = (meeting: Meeting) => {
        setEditMeeting(meeting);
        setIsFormOpen(true);
    };

    const getLocalISODate = (d: Date) => {
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    const getDayStatus = (date: Date) => {
        const dayName = date.toLocaleString('en-US', { weekday: 'long' });
        const dateStr = getLocalISODate(date);
        
        const isHoliday = holidays.find(h => h.holidayDate === dateStr);
        const dayTiming = timings.find(t => t.dayOfWeek === dayName);
        
        const isClosed = dayTiming ? !dayTiming.isOpen : false;
        
        return {
            isBlocked: !!isHoliday || isClosed,
            reason: isHoliday ? isHoliday.title : (isClosed ? 'Weekly Off' : null)
        };
    };

    const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    if (isLoadingData) {
        return <MeetingsShimmer />;
    }

    return (
        <div className="w-full flex flex-col h-[calc(100vh-140px)] bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative mb-5">

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 border-b border-gray-200 bg-white z-40 relative shadow-sm">
                
                <div className="flex items-center justify-between w-full sm:w-auto gap-2 sm:gap-4">
                    <div className="relative" ref={monthPickerRef}>
                        <button 
                            onClick={() => setIsMonthPickerOpen(!isMonthPickerOpen)}
                            className="cursor-pointer flex items-center gap-1.5 px-2 sm:px-4 py-2 rounded-lg hover:bg-gray-50 text-base sm:text-lg font-bold text-gray-800 transition-colors"
                        >
                            <span className="whitespace-nowrap">{monthName}</span>
                            <CaretDown size={14} weight="bold" className={`text-gray-400 transition-transform ${isMonthPickerOpen ? 'rotate-180' : ''}`} />
                        </button>
                        <MonthPicker 
                            isOpen={isMonthPickerOpen} 
                            currentDate={currentDate} 
                            onChangeDate={setCurrentDate} 
                            onClose={() => setIsMonthPickerOpen(false)} 
                        />
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <button onClick={goToToday} className="cursor-pointer px-3 py-2 text-xs sm:text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg shadow-sm flex items-center gap-1.5 transition-colors">
                            <CalendarBlank size={16} weight="bold" className="hidden sm:block" />
                            Today
                        </button>
                        
                        <div className="flex items-center">
                            <button onClick={() => navigate('prev')} className="cursor-pointer p-2 hover:bg-gray-50 border border-gray-200 rounded-l-lg bg-white text-gray-500 transition-colors shadow-sm">
                                <CaretLeft size={16} weight="bold" />
                            </button>
                            <button onClick={() => navigate('next')} className="cursor-pointer p-2 hover:bg-gray-50 border-y border-r border-gray-200 rounded-r-lg bg-white text-gray-500 transition-colors shadow-sm">
                                <CaretRight size={16} weight="bold" />
                            </button>
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">

                    <div className="relative w-[115px] sm:w-[130px]" ref={viewDropdownRef}>
                        <button 
                            onClick={() => setIsViewDropdownOpen(!isViewDropdownOpen)}
                            className="cursor-pointer w-full flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
                        >
                            <span className="whitespace-nowrap pr-2">{viewMode}</span>
                            <CaretDown size={14} weight="bold" className={`text-gray-400 transition-transform flex-shrink-0 ${isViewDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {isViewDropdownOpen && (
                            <div className="absolute top-full left-0 sm:right-0 mt-2 w-[115px] sm:w-[130px] bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden py-1">
                                {(['Day', 'Work week', 'Week'] as ViewMode[]).map(mode => (
                                    <button
                                        key={mode}
                                        onClick={() => { setViewMode(mode); setIsViewDropdownOpen(false); }}
                                        className={`cursor-pointer w-full text-left px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold transition-colors ${viewMode === mode ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'}`}
                                    >
                                        {mode}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <button 
                        onClick={() => { setEditMeeting(null); setIsFormOpen(true); }}
                        className="cursor-pointer flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-5 py-2 sm:py-2.5 bg-indigo-600 text-white rounded-lg text-sm sm:text-base font-bold shadow-md shadow-indigo-600/20 hover:bg-indigo-700 transition-all active:scale-95 whitespace-nowrap"
                    >
                        <Plus size={16} weight="bold" />
                        New Meeting
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-auto custom-scrollbar relative bg-white">
                <div className="min-w-[800px] h-full flex flex-col relative">

                    <div className="flex border-b border-gray-200 sticky top-0 bg-white z-30 shadow-sm pr-4">
                        <div className="w-[60px] flex-shrink-0 border-r border-gray-200 bg-white"></div>
                        <div className={`flex-1 grid`} style={{ gridTemplateColumns: `repeat(${daysToRender.length}, minmax(0, 1fr))` }}>
                            {daysToRender.map((day, idx) => {
                                const isToday = day.toDateString() === new Date().toDateString();
                                const status = getDayStatus(day);
                                return (
                                    <div key={idx} className={`pt-3 pb-6 flex flex-col items-center border-r border-gray-200 relative
                                        ${status.isBlocked ? 'bg-gray-50/80' : 'bg-white'}`}
                                    >
                                        <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${isToday ? 'text-indigo-600' : 'text-gray-500'}`}>
                                            {day.toLocaleString('default', { weekday: 'short' })}
                                        </p>
                                        <div className={`h-9 w-9 flex items-center justify-center rounded-full text-lg font-bold
                                            ${isToday ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-800'}`}>
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

                    <div className="flex flex-1 relative bg-white pr-4 pb-1">

                        <div className="w-[60px] flex-shrink-0 border-r border-gray-200 bg-white relative z-20 sticky left-0">
                            {gridHours.map(hour => (
                                <div key={hour} className="h-[60px] relative">
                                    <span className="absolute -top-3 right-2 text-[11px] font-bold text-gray-500 bg-white px-1 leading-none z-20">
                                        {hour > 12 ? `${hour - 12} PM` : hour === 12 ? '12 PM' : hour === 0 ? '12 AM' : `${hour} AM`}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className={`flex-1 grid relative`} style={{ gridTemplateColumns: `repeat(${daysToRender.length}, minmax(0, 1fr))` }}>

                            <div className="absolute inset-0 pointer-events-none z-0">
                                {gridHours.map((_, i) => (
                                    <div key={i} className="h-[60px] border-b border-gray-100 w-full"></div>
                                ))}
                            </div>
                            
                            {/* Full width current time dashed line */}
                            {currentTimeOffset >= 0 && currentTimeOffset <= gridHours.length * 60 && isCurrentWeek && (
                                <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
                                    <div 
                                        className="absolute left-0 right-0 border-t border-dashed border-red-400/70"
                                        style={{ top: `${currentTimeOffset}px` }}
                                    ></div>
                                </div>
                            )}

                            {daysToRender.map((day, dayIdx) => {
                                const dateStr = getLocalISODate(day);
                                const dayMeetings = meetings.filter(m => m.date === dateStr);
                                const isToday = day.toDateString() === new Date().toDateString();
                                const status = getDayStatus(day);

                                return (
                                    <div key={dayIdx} className={`relative border-r border-gray-200 z-10 transition-colors
                                        ${status.isBlocked 
                                            ? 'bg-[url("data:image/svg+xml,%3Csvg width=\'10\' height=\'10\' viewBox=\'0 0 10 10\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M-1,1 l2,-2 M0,10 l10,-10 M9,11 l2,-2\' stroke=\'%23f3f4f6\' stroke-width=\'1\'/%3E%3C/svg%3E")] bg-gray-50/50' 
                                            : 'bg-transparent'}`}
                                    >
                                    
                                        {/* Current Time Indicator for Today's Column */}
                                        {isToday && currentTimeOffset >= 0 && currentTimeOffset <= gridHours.length * 60 && (
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
                                                className={`absolute left-1 right-1 rounded-md border-l-[3px] p-1.5 cursor-pointer overflow-hidden transition-all shadow-sm ${getTypeColor(meeting.type)} z-20 hover:z-30 hover:shadow-md`}
                                                style={getMeetingStyle(meeting)}
                                            >
                                                <div className="text-[13px] font-bold truncate leading-tight">{meeting.title}</div>
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

            <MeetingViewModal 
                isOpen={!!viewMeeting} 
                onClose={() => setViewMeeting(null)} 
                meeting={viewMeeting} 
                onEdit={viewMeeting?.isEditable ? openEditModal : undefined}
                onDelete={viewMeeting?.isEditable ? (meeting) => setDeleteMeeting(meeting) : undefined}
            />

            <MeetingFormModal 
                isOpen={isFormOpen} 
                onClose={() => setIsFormOpen(false)} 
                onSubmit={handleFormSubmit}
                initialData={editMeeting}
                timings={timings}
                holidays={holidays}
            />

            <ConfirmDeleteModal
                open={!!deleteMeeting}
                onConfirm={handleDeleteConfirm}
                onCancel={() => setDeleteMeeting(null)}
                title="Delete Meeting"
                name={deleteMeeting?.title}
                customDescription={`Are you sure you want to delete the meeting "${deleteMeeting?.title}"? This action is permanent and cannot be undone.`}
            />
        </div>
    );
}
