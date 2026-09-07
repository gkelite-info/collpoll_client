import { useState, useRef, useEffect } from 'react';
import MonthPicker from './components/MonthPicker';
import { Plus, CaretLeft, CaretRight, CaretDown, CalendarBlank } from '@phosphor-icons/react';
import UserSearchBar from './components/UserSearchBar';
import { SelectUser } from "@/lib/helpers/Hr/meetings/getCollegeUsers";

type ViewMode = 'Day' | 'Work week' | 'Week';

interface MeetingsToolbarProps {
    currentDate: Date;
    setCurrentDate: (date: Date) => void;
    viewMode: ViewMode;
    setViewMode: (mode: ViewMode) => void;
    navigate: (direction: 'prev' | 'next') => void;
    goToToday: () => void;
    currentUser: SelectUser;
    viewedUser: SelectUser | null;
    setViewedUser: (user: SelectUser | null) => void;
    isReadOnly: boolean;
    onNewMeeting: () => void;
}

export default function MeetingsToolbar({
    currentDate,
    setCurrentDate,
    viewMode,
    setViewMode,
    navigate,
    goToToday,
    currentUser,
    viewedUser,
    setViewedUser,
    isReadOnly,
    onNewMeeting
}: MeetingsToolbarProps) {
    const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
    const [isViewDropdownOpen, setIsViewDropdownOpen] = useState(false);
    const monthPickerRef = useRef<HTMLDivElement>(null);
    const viewDropdownRef = useRef<HTMLDivElement>(null);

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

    const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    return (
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
                {!isReadOnly && (
                    <div className="w-full sm:w-auto">
                        <UserSearchBar 
                            currentUser={currentUser} 
                            selectedUser={viewedUser} 
                            onSelectUser={setViewedUser} 
                        />
                    </div>
                )}

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

                    {!viewedUser && !isReadOnly && (
                        <button 
                            onClick={onNewMeeting}
                            className="cursor-pointer flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-5 h-10 bg-emerald-600 text-white rounded-lg text-sm sm:text-base font-bold shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition-all active:scale-95 whitespace-nowrap"
                        >
                            <Plus size={16} weight="bold" />
                            New Meeting
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
