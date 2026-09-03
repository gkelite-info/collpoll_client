"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Meeting } from './meetingTypes';
import MeetingViewModal from './components/MeetingViewModal';
import MeetingFormModal from './components/MeetingCreateModal';
import ConfirmDeleteModal from '@/app/(screens)/admin/calendar/components/ConfirmDeleteModal';
import MonthPicker from './components/MonthPicker';
import MeetingsShimmer from './MeetingsShimmer';
import { Plus, CaretLeft, CaretRight, CaretDown, CalendarBlank, PencilSimple, Trash } from '@phosphor-icons/react';
import toast from 'react-hot-toast';
import { useUser } from "@/app/utils/context/UserContext";
import { getCollegeTimings, DayTimingPayload } from "@/lib/helpers/collegeTimings/collegeTimingsAPI";
import { fetchCollegeHolidays, CollegeHoliday } from "@/lib/helpers/Hr/holidays/holidayAPI";
import UserSearchBar from './components/UserSearchBar';
import ViewingUserBanner from './components/ViewingUserBanner';
import { getDummyMeetingsByUserId } from './meetingDummyData';
import { SelectUser } from "@/lib/helpers/Hr/meetings/getCollegeUsers";

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
    
    // User Search / Viewing State
    const [viewedUser, setViewedUser] = useState<SelectUser | null>(null);
    const [viewedUserMeetings, setViewedUserMeetings] = useState<Meeting[]>([]);
    const [isLoadingUserMeetings, setIsLoadingUserMeetings] = useState(false);
    
    const [currentTime, setCurrentTime] = useState<Date>(new Date());
    
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [hasInitialScrolled, setHasInitialScrolled] = useState(false);
    
    // Current user context
    const { userId, fullName, role, profilePhoto, collegePublicId } = useUser();
    const currentUser: SelectUser = useMemo(() => ({
        id: userId || 0,
        userId: userId || 0,
        name: fullName || "Me",
        subLabel: role || "Current User",
        avatar: profilePhoto
    }), [userId, fullName, role, profilePhoto]);

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

    useEffect(() => {
        if (!viewedUser) {
            setViewedUserMeetings([]);
            return;
        }

        const fetchUserMeetings = async () => {
            setIsLoadingUserMeetings(true);
            try {
                // Simulate network delay
                await new Promise(resolve => setTimeout(resolve, 400));
                // Fetch using our dummy helper
                const userMeetings = getDummyMeetingsByUserId(viewedUser.userId);
                setViewedUserMeetings(userMeetings);
            } catch (error) {
                console.error("Failed to load user meetings", error);
                toast.error("Failed to load user's calendar");
            } finally {
                setIsLoadingUserMeetings(false);
            }
        };

        fetchUserMeetings();
    }, [viewedUser]);

    const displayMeetings = viewedUser ? viewedUserMeetings : meetings;

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
        
        const days = [];
        for (let i = 0; i < length; i++) {
            const d = new Date(start);
            d.setDate(d.getDate() + i);
            days.push(d);
        }
        return days;
    }, [currentDate, viewMode, timings]);

    const getGridBounds = useCallback(() => {
        let minHour = 8; // Default 8 AM
        let maxHour = 18; // Default 6 PM
        
        if (timings.length > 0) {
            const allHours: number[] = [];
            timings.forEach(t => {
                if (t.isOpen && t.openAt && t.closeAt) {
                    const openH = parseInt(t.openAt.split(':')[0]);
                    let closeH = parseInt(t.closeAt.split(':')[0]);
                    if (closeH < openH) closeH += 12; // Handle AM/PM fix if close hour is lower than open
                    allHours.push(openH, closeH);
                }
            });
            
            if (allHours.length > 0) {
                minHour = Math.max(0, Math.min(...allHours) - 1); // 1 hour before earliest open
                maxHour = Math.min(24, Math.max(...allHours) + 1); // 1 hour after latest close
                if (minHour < 6) minHour = 6;
                if (maxHour > 22) maxHour = 22;
            }
        }

        const result = [];
        for (let i = 0; i <= maxHour - minHour; i++) {
            result.push(minHour + i);
        }
        return result;
    }, [timings]);

    const gridHours = getGridBounds();

    const HOUR_HEIGHT = 160; // Decreased from 160px

    const currentTimeOffset = useMemo(() => {
        if (!gridHours.length) return -1;
        const minHour = gridHours[0];
        const h = currentTime.getHours();
        const m = currentTime.getMinutes();
        const offsetMins = (h - minHour) * 60 + m;
        return offsetMins * (HOUR_HEIGHT / 60);
    }, [currentTime, gridHours]);

    useEffect(() => {
        // Auto-scroll to position the current time indicator near the top/center
        if (!isLoadingData && !hasInitialScrolled && scrollContainerRef.current && currentTimeOffset > 0) {
            // Target scroll is the line offset minus ~150px so it shows comfortably near the top
            const scrollTarget = Math.max(0, currentTimeOffset - 150);
            
            // Small timeout ensures layout is fully calculated before scrolling
            setTimeout(() => {
                if (scrollContainerRef.current) {
                    scrollContainerRef.current.scrollTo({ top: scrollTarget, behavior: 'smooth' });
                }
            }, 100);
            
            setHasInitialScrolled(true);
        }
    }, [isLoadingData, hasInitialScrolled, currentTimeOffset]);

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

    const isMeetingInPast = (meeting: Meeting) => {
        if (!meeting.date || !meeting.endTime) return false;
        const endDateTime = new Date(`${meeting.date}T${meeting.endTime}`);
        return currentTime.getTime() > endDateTime.getTime();
    };

    const getMeetingStyle = (meeting: Meeting) => {
        const [startHour, startMin] = meeting.startTime.split(':').map(Number);
        const [endHour, endMin] = meeting.endTime.split(':').map(Number);
        
        const minHour = gridHours[0];
        const startOffsetMins = (startHour - minHour) * 60 + startMin;
        const durationMins = (endHour * 60 + endMin) - (startHour * 60 + startMin);
        
        const startOffsetPx = startOffsetMins * (HOUR_HEIGHT / 60);
        const durationPx = durationMins * (HOUR_HEIGHT / 60);

        return {
            top: `${startOffsetPx}px`,
            height: `${durationPx}px`,
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

    const todayDateString = new Date().toDateString();

    return (
        <>
            <div className="w-full flex flex-col h-[calc(100vh-40px)] min-h-[850px] bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative mb-5 shrink-0">

            <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4 p-4 border-b border-gray-200 bg-white z-40 relative shadow-sm">
                
                <div className="flex items-center justify-between w-full xl:w-auto gap-2 sm:gap-4">
                    <div className="relative" ref={monthPickerRef}>
                        <button 
                            onClick={() => setIsMonthPickerOpen(!isMonthPickerOpen)}
                            className="cursor-pointer flex items-center justify-center gap-1.5 px-3 h-10 rounded-lg border border-gray-200 bg-white shadow-sm hover:bg-gray-50 text-base font-bold text-gray-800 transition-colors"
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
                        <button onClick={goToToday} className="cursor-pointer px-3 h-10 text-xs sm:text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-colors">
                            <CalendarBlank size={16} weight="bold" className="hidden sm:block" />
                            Today
                        </button>
                        
                        <div className="flex items-center">
                            <button onClick={() => navigate('prev')} className="cursor-pointer px-2 h-10 flex items-center justify-center hover:bg-gray-50 border border-gray-200 rounded-l-lg bg-white text-gray-500 transition-colors shadow-sm">
                                <CaretLeft size={16} weight="bold" />
                            </button>
                            <button onClick={() => navigate('next')} className="cursor-pointer px-2 h-10 flex items-center justify-center hover:bg-gray-50 border-y border-r border-gray-200 rounded-r-lg bg-white text-gray-500 transition-colors shadow-sm">
                                <CaretRight size={16} weight="bold" />
                            </button>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 w-full xl:w-auto">

                    <div className="w-full sm:w-auto">
                        <UserSearchBar 
                            currentUser={currentUser} 
                        selectedUser={viewedUser} 
                        onSelectUser={setViewedUser} 
                    />
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="relative w-[115px] sm:w-[130px] shrink-0" ref={viewDropdownRef}>
                        <button 
                            onClick={() => setIsViewDropdownOpen(!isViewDropdownOpen)}
                            className="cursor-pointer w-full flex items-center justify-between px-3 sm:px-4 h-10 text-xs sm:text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
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
                                        className={`cursor-pointer w-full text-left px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold transition-colors ${viewMode === mode ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700 hover:bg-gray-50'}`}
                                    >
                                        {mode}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {!viewedUser && (
                        <button 
                            onClick={() => { setEditMeeting(null); setIsFormOpen(true); }}
                            className="cursor-pointer flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-5 h-10 bg-emerald-600 text-white rounded-lg text-sm sm:text-base font-bold shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition-all active:scale-95 whitespace-nowrap"
                        >
                            <Plus size={16} weight="bold" />
                            New Meeting
                        </button>
                    )}
                </div>
            </div>
            </div>

            {viewedUser && (
                <ViewingUserBanner 
                    viewedUser={viewedUser} 
                    onBackToMyCalendar={() => setViewedUser(null)} 
                />
            )}

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
                                                    {meeting.isEditable && !viewedUser && !isMeetingInPast(meeting) && (
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

            <MeetingViewModal 
                isOpen={!!viewMeeting} 
                onClose={() => setViewMeeting(null)} 
                meeting={viewMeeting} 
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
        {/* Spacer to guarantee scroll padding at the bottom of the page */}
        <div className="h-8 shrink-0 w-full"></div>
        </>
    );
}
