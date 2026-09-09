"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Meeting } from './meetingTypes';
import MeetingViewModal from './components/MeetingViewModal';
import MeetingFormModal from './components/MeetingCreateModal';
import ConfirmDeleteModal from '@/app/(screens)/admin/calendar/components/ConfirmDeleteModal';
import MeetingsShimmer from './MeetingsShimmer';
import toast from 'react-hot-toast';
import { useUser } from "@/app/utils/context/UserContext";
import { getCollegeTimings, DayTimingPayload } from "@/lib/helpers/collegeTimings/collegeTimingsAPI";
import { fetchCollegeHolidays, CollegeHoliday } from "@/lib/helpers/Hr/holidays/holidayAPI";
import ViewingUserBanner from './components/ViewingUserBanner';
import { SelectUser } from "@/lib/helpers/Hr/meetings/getCollegeUsers";
import MeetingsToolbar from './MeetingsToolbar';
import MeetingsCalendarGrid from './MeetingsCalendarGrid';
import { useMeetingsMonthly, useUserMeetingsMonthly } from './hooks/useMeetingsQuery';
import { useDeleteMeeting } from './hooks/useMeetingsMutation';

type ViewMode = 'Day' | 'Work week' | 'Week';

interface MeetingsClientProps {
    isReadOnly?: boolean;
}

const parseTimeToHour = (timeStr: string, isEnd = false): number | null => {
    if (!timeStr) return null;
    const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?$/i);
    if (!match) return null;
    let h = parseInt(match[1], 10);
    const m = parseInt(match[2], 10);
    const ampm = match[3]?.toUpperCase();
    if (ampm === 'PM' && h !== 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;
    // If end time has minutes (e.g. 03:30 PM), round up to next hour so the slot fully covers the time
    if (isEnd && m > 0) {
        h = Math.min(24, h + 1);
    }
    return h;
};

export default function MeetingsClient({ isReadOnly = false }: MeetingsClientProps) {
    const { collegeId, userId, fullName, role, profilePhoto } = useUser();

    const [timings, setTimings] = useState<DayTimingPayload[]>([]);
    const [holidays, setHolidays] = useState<CollegeHoliday[]>([]);
    const [isLoadingMetadata, setIsLoadingMetadata] = useState(true);

    const [viewMode, setViewMode] = useState<ViewMode>('Work week');
    const [currentDate, setCurrentDate] = useState<Date>(new Date());
    const [currentTime, setCurrentTime] = useState<Date>(new Date());

    const [viewMeeting, setViewMeeting] = useState<Meeting | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editMeeting, setEditMeeting] = useState<Meeting | null>(null);
    const [deleteMeeting, setDeleteMeeting] = useState<Meeting | null>(null);
    
    // User Search / Viewing State
    const [viewedUser, setViewedUser] = useState<SelectUser | null>(null);
    
    const currentUser: SelectUser = useMemo(() => ({
        id: userId || 0,
        userId: userId || 0,
        name: fullName || "Me",
        subLabel: role || "Current User",
        avatar: profilePhoto
    }), [userId, fullName, role, profilePhoto]);

    // Data fetching using React Query
    const { 
        data: myMeetings, 
        isLoading: isLoadingMyMeetings 
    } = useMeetingsMonthly(collegeId || 0, currentDate.getFullYear(), currentDate.getMonth(), userId || 0, role || "Admin");

    const { 
        data: userMeetings, 
        isLoading: isLoadingUserMeetings 
    } = useUserMeetingsMonthly(collegeId || 0, viewedUser?.userId || null, currentDate.getFullYear(), currentDate.getMonth());

    const { mutateAsync: deleteMeetingMutation } = useDeleteMeeting(collegeId || 0);

    // Update current time every minute for the time indicator line
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const loadMetadata = async () => {
            if (!collegeId) return;
            setIsLoadingMetadata(true);
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
                console.error("Failed to fetch calendar metadata", error);
            } finally {
                setIsLoadingMetadata(false);
            }
        };
        loadMetadata();
    }, [collegeId, currentDate.getFullYear()]);

    const displayMeetings = viewedUser ? (userMeetings || []) : (myMeetings || []);
    const isLoadingData = isLoadingMetadata || isLoadingMyMeetings || (viewedUser ? isLoadingUserMeetings : false);

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
    }, [currentDate, viewMode, timings, holidays]);

    const gridHours = useMemo(() => {
        let minHour = 8; // Default 8 AM
        let maxHour = 18; // Default 6 PM
        
        if (timings.length > 0) {
            const openHours: number[] = [];
            const closeHours: number[] = [];
            timings.forEach(t => {
                if (t.isOpen && t.openAt && t.closeAt) {
                    const openH = parseTimeToHour(t.openAt, false);
                    const closeH = parseTimeToHour(t.closeAt, true);
                    if (openH !== null) openHours.push(openH);
                    if (closeH !== null) closeHours.push(closeH);
                }
            });
            
            if (openHours.length > 0) {
                minHour = Math.max(0, Math.min(...openHours));
            }
            if (closeHours.length > 0) {
                maxHour = Math.min(24, Math.max(...closeHours));
            }
        }

        // Also check if any meetings fall outside these hours
        if (displayMeetings && displayMeetings.length > 0) {
            displayMeetings.forEach(m => {
                if (m.startTime && m.endTime) {
                    const startH = parseTimeToHour(m.startTime, false);
                    const endH = parseTimeToHour(m.endTime, true);
                    if (startH !== null && startH < minHour) minHour = Math.max(0, startH);
                    if (endH !== null && endH > maxHour) maxHour = Math.min(24, endH);
                }
            });
        }
        
        if (minHour < 6) minHour = 6;
        if (maxHour > 23) maxHour = 23;

        const result = [];
        for (let i = 0; i <= maxHour - minHour; i++) {
            result.push(minHour + i);
        }
        return result;
    }, [timings, displayMeetings]);
    const HOUR_HEIGHT = 160;

    const currentTimeOffset = useMemo(() => {
        if (!gridHours.length) return -1;
        const minHour = gridHours[0];
        const h = currentTime.getHours();
        const m = currentTime.getMinutes();
        const offsetMins = (h - minHour) * 60 + m;
        return offsetMins * (HOUR_HEIGHT / 60);
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

    const isMeetingStartedOrPast = (meeting: Meeting) => {
        if (!meeting.date || !meeting.startTime) return false;
        const startDateTime = new Date(`${meeting.date}T${meeting.startTime}`);
        return currentTime.getTime() >= startDateTime.getTime();
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
        const lowerType = type.toLowerCase();
        switch (lowerType) {
            case 'class': return 'bg-indigo-100/90 border-indigo-300 text-indigo-900 hover:bg-indigo-200';
            case 'exam': return 'bg-red-100/90 border-red-300 text-red-900 hover:bg-red-200';
            case 'meeting': return 'bg-blue-100/90 border-blue-300 text-blue-900 hover:bg-blue-200';
            case 'internal': return 'bg-blue-100/90 border-blue-300 text-blue-900 hover:bg-blue-200';
            case 'external': return 'bg-purple-100/90 border-purple-300 text-purple-900 hover:bg-purple-200';
            case 'staff': return 'bg-emerald-100/90 border-emerald-300 text-emerald-900 hover:bg-emerald-200';
            case 'management': return 'bg-amber-100/90 border-amber-300 text-amber-900 hover:bg-amber-200';
            default: return 'bg-gray-100/90 border-gray-300 text-gray-900 hover:bg-gray-200';
        }
    };

    const handleDeleteConfirm = async () => {
        if (deleteMeeting) {
            try {
                await deleteMeetingMutation(parseInt(deleteMeeting.id));
            } catch (error) {
                // error is handled by mutation hook
            } finally {
                setDeleteMeeting(null);
            }
        }
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

    if (isLoadingMetadata) {
        return <MeetingsShimmer />;
    }

    const todayDateString = new Date().toDateString();

    return (
        <>
            <div className="w-full flex flex-col h-[calc(100vh-40px)] min-h-[850px] bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative mb-5 shrink-0">

                <MeetingsToolbar 
                    currentDate={currentDate}
                    setCurrentDate={setCurrentDate}
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                    navigate={navigate}
                    goToToday={goToToday}
                    currentUser={currentUser}
                    viewedUser={viewedUser}
                    setViewedUser={setViewedUser}
                    isReadOnly={isReadOnly}
                    onNewMeeting={() => { setEditMeeting(null); setIsFormOpen(true); }}
                />

                {viewedUser && (
                    <ViewingUserBanner 
                        viewedUser={viewedUser} 
                        onBackToMyCalendar={() => setViewedUser(null)} 
                    />
                )}

                {isLoadingData ? (
                    <MeetingsShimmer 
                        hideToolbar 
                        gridHoursLength={gridHours.length} 
                        daysLength={daysToRender.length} 
                    />
                ) : (
                    <MeetingsCalendarGrid 
                        daysToRender={daysToRender}
                        gridHours={gridHours}
                        currentTimeOffset={currentTimeOffset}
                        isCurrentWeek={isCurrentWeek}
                        displayMeetings={displayMeetings}
                        todayDateString={todayDateString}
                        getDayStatus={getDayStatus}
                        getTypeColor={getTypeColor}
                        getMeetingStyle={getMeetingStyle}
                        formatTime12h={formatTime12h}
                        isMeetingInPast={isMeetingStartedOrPast}
                        viewedUser={viewedUser}
                        isReadOnly={isReadOnly}
                        setViewMeeting={setViewMeeting}
                        openEditModal={(m) => { setEditMeeting(m); setIsFormOpen(true); }}
                        setDeleteMeeting={setDeleteMeeting}
                        isLoadingData={isLoadingData}
                    />
                )}

                <MeetingViewModal 
                    isOpen={!!viewMeeting} 
                    onClose={() => setViewMeeting(null)} 
                    meeting={viewMeeting} 
                    isViewingOtherUser={!!viewedUser}
                />

                <MeetingFormModal 
                    isOpen={isFormOpen} 
                    onClose={() => setIsFormOpen(false)} 
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
