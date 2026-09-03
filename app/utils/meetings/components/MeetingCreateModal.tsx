import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Meeting } from '../meetingTypes';
import { X, CalendarBlank, Clock, User, Link as LinkIcon, Note, Users, TextAa, CaretDown, WarningCircle, Check } from '@phosphor-icons/react';
import toast from 'react-hot-toast';
import { useRef } from 'react';
import { Avatar } from '@/app/utils/Avatar';

import { CustomDropdown } from '@/app/components/CustomDropdown';

const STATIC_USERS = [
    { id: '1', employeeId: '100234', name: 'John Doe', role: 'Faculty', avatar: 'J' },
    { id: '2', employeeId: '100235', name: 'Jane Smith', role: 'Admin', avatar: 'J' },
    { id: '3', employeeId: '100236', name: 'Dr. Sharma', role: 'Principal', avatar: 'S' },
    { id: '4', employeeId: '100237', name: 'Admin Team', role: 'Staff', avatar: 'A' },
    { id: '5', employeeId: '100238', name: 'All Staff', role: 'Group', avatar: 'A' },
    { id: '6', employeeId: '100239', name: 'Michael Scott', role: 'Regional Manager', avatar: 'M' },
    { id: '7', employeeId: '100240', name: 'Pam Beesly', role: 'Receptionist', avatar: 'P' },
    { id: '8', employeeId: '100241', name: 'Jim Halpert', role: 'Sales', avatar: 'J' },
];

const StaticUserMultiSelect = ({ value, onChange }: { value: string, onChange: (v: string) => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearch('');
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedNames = value ? value.split(',').map(v => v.trim()).filter(Boolean) : [];
    
    const toggleUser = (name: string) => {
        if (selectedNames.includes(name)) {
            onChange(selectedNames.filter(n => n !== name).join(', '));
        } else {
            onChange([...selectedNames, name].join(', '));
        }
    };

    const filteredUsers = STATIC_USERS.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.role.toLowerCase().includes(search.toLowerCase()));

    return (
        <div ref={dropdownRef} className="relative w-full">
            <div 
                onClick={() => setIsOpen(!isOpen)}
                className="cursor-pointer w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 flex flex-wrap items-center gap-2 min-h-[48px] transition-colors hover:bg-gray-100/50"
            >
                {selectedNames.length > 0 ? (
                    selectedNames.map(name => (
                        <span key={name} className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            {name}
                            <X size={12} weight="bold" className="cursor-pointer hover:text-emerald-900 ml-1" onClick={() => toggleUser(name)} />
                        </span>
                    ))
                ) : (
                    <span className="text-gray-400">Search and select attendees...</span>
                )}
                <CaretDown className={`ml-auto text-gray-400 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} size={16} weight="bold" />
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.15 }}
                        className="absolute top-full mt-2 left-0 w-full bg-white rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-gray-100 z-[70] overflow-hidden flex flex-col"
                    >
                        <div className="p-3 border-b border-gray-100">
                            <input 
                                autoFocus
                                type="text"
                                placeholder="Search by name or role..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-[14px] outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-gray-400"
                            />
                        </div>
                        <div className="max-h-60 overflow-y-auto custom-scrollbar p-2 space-y-1">
                            {filteredUsers.length === 0 ? (
                                <div className="p-4 text-center text-sm text-gray-500">No users found</div>
                            ) : (
                                filteredUsers.map(user => {
                                    const isSelected = selectedNames.includes(user.name);
                                    return (
                                        <div 
                                            key={user.id}
                                            onClick={() => toggleUser(user.name)}
                                            className={`px-3 py-2.5 flex items-center gap-3 cursor-pointer transition-colors rounded-lg
                                                ${isSelected ? 'bg-emerald-50' : 'hover:bg-gray-50'}
                                            `}
                                        >
                                            <Avatar alt={user.name} size={36} />
                                            <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                                                <div className={`text-[14px] font-bold leading-none truncate ${isSelected ? 'text-emerald-700' : 'text-gray-800'}`}>{user.name}</div>
                                                <div className="text-[11px] text-gray-400 font-semibold leading-none truncate">{user.employeeId}</div>
                                                <div className="text-[11px] text-gray-500 font-medium leading-none truncate">{user.role}</div>
                                            </div>
                                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors shrink-0 ${isSelected ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300 bg-white'}`}>
                                                {isSelected && <Check size={12} weight="bold" className="text-white" />}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const StaticUserSingleSelect = ({ value, onChange }: { value: string, onChange: (v: string) => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearch('');
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedUser = STATIC_USERS.find(u => u.name === value);

    const toggleUser = (name: string) => {
        onChange(name);
        setIsOpen(false);
        setSearch('');
    };

    const filteredUsers = STATIC_USERS.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.role.toLowerCase().includes(search.toLowerCase()));

    return (
        <div ref={dropdownRef} className="relative w-full">
            <div 
                onClick={() => setIsOpen(!isOpen)}
                className="cursor-pointer w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 flex flex-wrap items-center gap-2 min-h-[48px] transition-colors hover:bg-gray-100/50"
            >
                {selectedUser ? (
                    <div className="flex items-center gap-2">
                        <Avatar alt={selectedUser.name} size={24} />
                        <span className="font-bold text-emerald-700">{selectedUser.name}</span>
                    </div>
                ) : (
                    <span className="text-gray-400">Search and select an organizer...</span>
                )}
                <CaretDown className={`ml-auto text-gray-400 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} size={16} weight="bold" />
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.15 }}
                        className="absolute top-full mt-2 left-0 w-full bg-white rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-gray-100 z-[70] overflow-hidden flex flex-col"
                    >
                        <div className="p-3 border-b border-gray-100">
                            <input 
                                autoFocus
                                type="text"
                                placeholder="Search by name or role..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-[14px] outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-gray-400"
                            />
                        </div>
                        <div className="max-h-60 overflow-y-auto custom-scrollbar p-2 space-y-1">
                            {filteredUsers.length === 0 ? (
                                <div className="p-4 text-center text-sm text-gray-500">No users found</div>
                            ) : (
                                filteredUsers.map(user => {
                                    const isSelected = value === user.name;
                                    return (
                                        <div 
                                            key={user.id}
                                            onClick={() => toggleUser(user.name)}
                                            className={`px-3 py-2.5 flex items-center gap-3 cursor-pointer transition-colors rounded-lg
                                                ${isSelected ? 'bg-emerald-50' : 'hover:bg-gray-50'}
                                            `}
                                        >
                                            <Avatar alt={user.name} size={36} />
                                            <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                                                <div className={`text-[14px] font-bold leading-none truncate ${isSelected ? 'text-emerald-700' : 'text-gray-800'}`}>{user.name}</div>
                                                <div className="text-[11px] text-gray-400 font-semibold leading-none truncate">{user.employeeId}</div>
                                                <div className="text-[11px] text-gray-500 font-medium leading-none truncate">{user.role}</div>
                                            </div>
                                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors shrink-0 ${isSelected ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300 bg-white'}`}>
                                                {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const TimeSelector = ({ value, onChange, bounds }: { value: string, onChange: (v: string) => void, bounds: {start: number, end: number} }) => {
    const [hStr, mStr] = value ? value.split(':') : ['10', '00'];
    let h24 = parseInt(hStr, 10) || 10;
    const minute = mStr || '00';
    
    let hour12 = h24 % 12 || 12;
    let ampm = h24 >= 12 && h24 < 24 ? 'PM' : 'AM';

    const handleHourChange = (newH12: string) => {
        let nH24 = parseInt(newH12, 10);
        if (ampm === 'PM' && nH24 !== 12) nH24 += 12;
        if (ampm === 'AM' && nH24 === 12) nH24 = 0;
        if (nH24 < bounds.start) nH24 = bounds.start;
        if (nH24 > bounds.end) nH24 = bounds.end;
        onChange(`${String(nH24).padStart(2, '0')}:${minute}`);
    };

    const handleMinuteChange = (newM: string) => {
        onChange(`${String(h24).padStart(2, '0')}:${newM}`);
    };

    const handleAmPmChange = (newAmPm: string) => {
        let nH24 = hour12;
        if (newAmPm === 'PM' && hour12 !== 12) nH24 += 12;
        if (newAmPm === 'AM' && hour12 === 12) nH24 = 0;
        if (nH24 < bounds.start) nH24 = bounds.start;
        if (nH24 > bounds.end) nH24 = bounds.end;
        onChange(`${String(nH24).padStart(2, '0')}:${minute}`);
    };

    const hourOptions = [];
    for (let i = 1; i <= 12; i++) {
        let test24 = i;
        if (ampm === 'PM' && i !== 12) test24 += 12;
        if (ampm === 'AM' && i === 12) test24 = 0;
        const isDisabled = test24 < bounds.start || test24 > bounds.end;
        if (!isDisabled) {
            hourOptions.push({ value: String(i).padStart(2, '0'), label: String(i).padStart(2, '0') });
        }
    }

    const minOptions = [];
    for (let i = 0; i < 12; i++) {
        minOptions.push({ value: String(i*5).padStart(2, '0'), label: String(i*5).padStart(2, '0') });
    }
    
    const isAmDisabled = bounds.start >= 12;
    const isPmDisabled = bounds.end < 12;
    const amPmOptions = [];
    if (!isAmDisabled) amPmOptions.push({value: 'AM', label: 'AM'});
    if (!isPmDisabled) amPmOptions.push({value: 'PM', label: 'PM'});
    
    return (
        <div className="flex gap-1.5 items-center w-full">
            <CustomDropdown value={String(hour12).padStart(2, '0')} onChange={(v) => handleHourChange(String(v))} options={hourOptions} theme="green" className="py-2 px-2 rounded-xl" widthClassName="flex-1" />
            <span className="text-gray-500 font-bold">:</span>
            <CustomDropdown value={minute} onChange={(v) => handleMinuteChange(String(v))} options={minOptions} theme="green" className="py-2 px-2 rounded-xl" widthClassName="flex-1" />
            <CustomDropdown value={ampm} onChange={(v) => handleAmPmChange(String(v))} options={amPmOptions} theme="green" className="py-2 px-1 rounded-xl" widthClassName="w-[70px]" />
        </div>
    );
};

interface MeetingFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (meeting: Omit<Meeting, 'id'>, id?: string) => void;
    initialData?: Meeting | null;
    timings?: any[];
    holidays?: any[];
}

export default function MeetingFormModal({ isOpen, onClose, onSubmit, initialData, timings = [], holidays = [] }: MeetingFormModalProps) {
    const defaultState = {
        title: '',
        date: new Date().toISOString().split('T')[0],
        startTime: '10:00',
        endTime: '11:00',
        organizer: '',
        type: 'Internal' as Meeting['type'],
        agenda: '',
        attendees: '',
        meetingLink: '',
        zoomId: '',
        zoomPassword: '',
        platform: 'Google Meet' as 'Google Meet' | 'Zoom Meeting' | 'Others' | undefined
    };

    const [formData, setFormData] = useState(defaultState);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [warningMsg, setWarningMsg] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [isTypeOpen, setIsTypeOpen] = useState(false);

    useEffect(() => {
        if (isOpen && initialData) {
            setFormData({
                title: initialData.title,
                date: initialData.date,
                startTime: initialData.startTime,
                endTime: initialData.endTime,
                organizer: initialData.organizer,
                type: initialData.type,
                agenda: initialData.agenda,
                attendees: initialData.attendees.join(', '),
                meetingLink: initialData.meetingLink || '',
                zoomId: initialData.zoomId || '',
                zoomPassword: initialData.zoomPassword || '',
                platform: initialData.platform || 'Google Meet'
            });
        } else if (isOpen) {
            setFormData(defaultState);
        }
    }, [isOpen, initialData]);

    useEffect(() => {
        setWarningMsg(null);
        setErrorMsg(null);
        if (!formData.date) return;
        
        if (formData.startTime >= formData.endTime) {
            setErrorMsg('Start Time must be strictly before End Time.');
        }

        const dateObj = new Date(formData.date);
        const dayName = dateObj.toLocaleString('en-US', { weekday: 'long' });

        const holiday = holidays.find(h => h.holidayDate === formData.date);
        if (holiday) {
            setErrorMsg(`Error: ${formData.date} is a holiday (${holiday.title}). Meetings cannot be scheduled.`);
            return;
        }

        const dayTiming = timings.find(t => t.dayOfWeek === dayName);
        if (dayTiming && !dayTiming.isOpen) {
            setErrorMsg(`Error: The college is closed on ${dayName}s. Meetings cannot be scheduled.`);
            return;
        }

        if (dayTiming && dayTiming.isOpen && dayTiming.openAt && dayTiming.closeAt && formData.startTime && formData.endTime) {

            const to24 = (timeStr: string) => {
                if (!timeStr) return '00:00';
                if (!timeStr.toLowerCase().includes('am') && !timeStr.toLowerCase().includes('pm')) return timeStr;
                
                const parts = timeStr.trim().split(' ');
                if (parts.length !== 2) return timeStr;
                
                let [hours, minutes] = parts[0].split(':');
                if (hours === '12') hours = '00';
                if (parts[1].toLowerCase() === 'pm') hours = String(parseInt(hours, 10) + 12);
                
                return `${hours.padStart(2, '0')}:${minutes}`;
            };
            
            const open24 = to24(dayTiming.openAt);
            const close24 = to24(dayTiming.closeAt);

            if (formData.startTime < open24 || formData.endTime > close24) {

                setWarningMsg(`Warning: The selected time is outside normal college hours (${dayTiming.openAt} - ${dayTiming.closeAt}).`);
            }
        }
    }, [formData.date, formData.startTime, formData.endTime, timings, holidays]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        
        const toastId = 'meeting-validation';

        const trimmedTitle = formData.title.trim();
        if (!trimmedTitle) {
            toast.error('Meeting title is required.', { id: toastId });
            return;
        }
        if (trimmedTitle.length < 3) {
            toast.error('Meeting title must be at least 3 characters long.', { id: toastId });
            return;
        }

        if (!formData.date || !formData.startTime || !formData.endTime) {
            toast.error('Date, Start Time, and End Time are required.', { id: toastId });
            return;
        }

        if (formData.endTime <= formData.startTime) {
            toast.error('End Time must be after Start Time.', { id: toastId });
            return;
        }

        if (!formData.organizer) {
            toast.error('Organizer is required.', { id: toastId });
            return;
        }

        if (!formData.type) {
            toast.error('Meeting type is required.', { id: toastId });
            return;
        }

        const trimmedAgenda = formData.agenda.trim();
        if (!trimmedAgenda) {
            toast.error('Agenda cannot be empty.', { id: toastId });
            return;
        }

        const attendeesList = formData.attendees.split(',').map(a => a.trim()).filter(Boolean);
        if (attendeesList.length === 0) {
            toast.error('Please select at least one attendee.', { id: toastId });
            return;
        }

        const platform = formData.platform as string;
        if (platform === 'Zoom Meeting') {
            const trimmedZoomId = formData.zoomId?.trim() || '';
            if (!trimmedZoomId) {
                toast.error('Zoom Meeting ID is required.', { id: toastId });
                return;
            }
            if (trimmedZoomId.replace(/\D/g, '').length < 6) {
                toast.error('Zoom Meeting ID must be at least 6 digits.', { id: toastId });
                return;
            }
        } else if (platform === 'Google Meet' || platform === 'Others') {
            const trimmedLink = formData.meetingLink?.trim() || '';
            if (!trimmedLink) {
                toast.error('Meeting Link is required.', { id: toastId });
                return;
            }
            try {
                new URL(trimmedLink);
            } catch (err) {
                toast.error('Please enter a valid URL for the Meeting Link.', { id: toastId });
                return;
            }
        }

        setIsSubmitting(true);
        
        try {
            await new Promise(resolve => setTimeout(resolve, 800));
            
            onSubmit({
                title: trimmedTitle,
                date: formData.date,
                startTime: formData.startTime,
                endTime: formData.endTime,
                organizer: formData.organizer,
                type: formData.type,
                agenda: trimmedAgenda,
                attendees: attendeesList,
                meetingLink: platform === 'Zoom Meeting' ? undefined : formData.meetingLink?.trim(),
                zoomId: platform === 'Zoom Meeting' ? formData.zoomId?.trim() : undefined,
                zoomPassword: platform === 'Zoom Meeting' ? formData.zoomPassword?.trim() : undefined,
                platform: formData.platform as Meeting['platform'],
                isEditable: true
            }, initialData?.id);
            
            toast.success(initialData ? 'Meeting updated successfully!' : 'Meeting created successfully!', { id: toastId });
            onClose();
        } catch (error) {
            toast.error('An error occurred. Please try again.', { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    const getBounds = () => {
        if (!formData.date) return { start: 8, end: 21 };
        const dateObj = new Date(formData.date);
        const dayName = dateObj.toLocaleString('en-US', { weekday: 'long' });
        const dayTiming = timings.find(t => t.dayOfWeek === dayName);
        
        let startHour = 8;
        let endHour = 21;
        
        if (dayTiming && dayTiming.isOpen && dayTiming.openAt && dayTiming.closeAt) {
            startHour = parseInt(dayTiming.openAt.split(':')[0], 10);
            let closeH = parseInt(dayTiming.closeAt.split(':')[0], 10);
            if (closeH < startHour) closeH += 12; 
            endHour = closeH;
        }
        
        const todayDate = new Date().toISOString().split('T')[0];
        if (formData.date === todayDate) {
            const currentHour = new Date().getHours();
            if (currentHour > startHour) {
                startHour = Math.min(currentHour, endHour);
            }
        }
        
        return { start: startHour, end: endHour };
    };

    const bounds = getBounds();

    useEffect(() => {
        if (!isOpen) return;
        
        let currentStart = parseInt(formData.startTime.split(':')[0], 10);
        let currentEnd = parseInt(formData.endTime.split(':')[0], 10);
        let updated = false;

        if (currentStart < bounds.start) {
            currentStart = bounds.start;
            updated = true;
        } else if (currentStart > bounds.end) {
            currentStart = bounds.end;
            updated = true;
        }

        if (currentEnd <= currentStart || currentEnd > bounds.end + 1) {
            currentEnd = Math.min(currentStart + 1, bounds.end + 1);
            updated = true;
        }

        if (updated) {
            setFormData(prev => ({
                ...prev,
                startTime: `${String(currentStart).padStart(2, '0')}:${prev.startTime.split(':')[1] || '00'}`,
                endTime: `${String(currentEnd).padStart(2, '0')}:${prev.endTime.split(':')[1] || '00'}`
            }));
        }
    }, [formData.date, bounds.start, bounds.end, isOpen]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6">
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm cursor-pointer"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
                        className="relative w-full max-w-lg bg-white rounded-[24px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[85vh]"
                    >

                        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between sticky top-0 z-10 bg-white/80 backdrop-blur-md">
                            <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
                                {initialData ? 'Edit Meeting' : 'Schedule New Meeting'}
                            </h2>
                            <button onClick={onClose} className="cursor-pointer p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                                <X size={20} weight="bold" />
                            </button>
                        </div>

                        <form id="meeting-form" onSubmit={handleSubmit} className="overflow-y-auto custom-scrollbar flex-1 px-4 sm:px-6 py-6 space-y-6">

                            {warningMsg && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl flex gap-3 text-sm font-semibold shadow-sm">
                                    <WarningCircle size={20} weight="fill" className="text-amber-500 shrink-0 mt-0.5" />
                                    <span>{warningMsg}</span>
                                </motion.div>
                            )}
                            {errorMsg && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl flex gap-3 text-sm font-semibold shadow-sm">
                                    <WarningCircle size={20} weight="fill" className="text-red-500 shrink-0 mt-0.5" />
                                    <span>{errorMsg}</span>
                                </motion.div>
                            )}

                            <div>
                                <label className="flex items-center gap-2 text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">
                                    {/* <TextAa size={16} weight="bold" /> */}
                                     Meeting Title <span className="text-red-500">*</span>
                                </label>
                                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[15px] font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all" placeholder="e.g. Weekly Sync" />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="flex items-center gap-2 text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">
                                        Type <span className="text-red-500">*</span>
                                    </label>
                                    <CustomDropdown 
                                        value={formData.type} 
                                        onChange={(v: string | number) => setFormData({...formData, type: String(v) as any})} 
                                        options={[
                                            { value: 'Internal', label: 'Internal' },
                                            { value: 'Staff', label: 'Staff' },
                                            { value: 'Management', label: 'Management' }
                                        ]} 
                                        widthClassName="w-full"
                                        theme="green"
                                        className="!py-3 !px-4 !rounded-xl"
                                    />
                                </div>
                                <div>
                                    <label className="flex items-center gap-2 text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">
                                        <CalendarBlank size={16} weight="bold" /> Date <span className="text-red-500">*</span>
                                    </label>
                                    <input required type="date" min={new Date().toISOString().split('T')[0]} value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="cursor-pointer w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[15px] font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="flex items-center gap-2 text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">
                                        <Clock size={16} weight="bold" /> Start Time <span className="text-red-500">*</span>
                                    </label>
                                    <TimeSelector value={formData.startTime} onChange={v => setFormData({...formData, startTime: v})} bounds={bounds} />
                                </div>
                                <div>
                                    <label className="flex items-center gap-2 text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">
                                        <Clock size={16} weight="bold" /> End Time <span className="text-red-500">*</span>
                                    </label>
                                    <TimeSelector value={formData.endTime} onChange={v => setFormData({...formData, endTime: v})} bounds={bounds} />
                                </div>
                            </div>

                            <div className="w-full">
                                <label className="flex items-center gap-2 text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">
                                    <User size={16} weight="bold" /> Organizer <span className="text-red-500">*</span>
                                </label>
                                <StaticUserSingleSelect value={formData.organizer} onChange={v => setFormData({...formData, organizer: v})} />
                            </div>
                            
                            <div className="flex flex-col gap-2 mt-2">
                                <label className="flex items-center gap-2 text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">
                                    Meeting Platform <span className="text-red-500">*</span>
                                </label>
                                <div className="flex items-center gap-4">
                                    {(['Google Meet', 'Zoom Meeting', 'Others'] as const).map(plat => (
                                        <label key={plat} className="flex items-center gap-2 cursor-pointer">
                                            <input 
                                                type="radio" 
                                                name="platform" 
                                                value={plat} 
                                                checked={formData.platform === plat}
                                                onChange={() => setFormData({...formData, platform: plat})}
                                                className="w-4 h-4 text-emerald-600 focus:ring-emerald-600 border-gray-300 accent-emerald-600"
                                            />
                                            <span className="text-[14px] font-medium text-gray-700">{plat}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {(formData.platform as string) === 'Zoom Meeting' ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 animate-in fade-in duration-200">
                                    <div>
                                        <label className="flex items-center gap-2 text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">
                                            <LinkIcon size={16} weight="bold" /> Zoom ID <span className="text-red-500">*</span>
                                        </label>
                                        <input required type="text" value={formData.zoomId} onChange={e => setFormData({...formData, zoomId: e.target.value})} placeholder="Enter Zoom ID" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[15px] font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all" />
                                    </div>
                                    <div>
                                        <label className="flex items-center gap-2 text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">
                                            Password <span className="text-red-500">*</span>
                                        </label>
                                        <input required type="text" value={formData.zoomPassword} onChange={e => setFormData({...formData, zoomPassword: e.target.value})} placeholder="Enter Password" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[15px] font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all" />
                                    </div>
                                </div>
                            ) : (
                                <div className="animate-in fade-in duration-200">
                                    <label className="flex items-center gap-2 text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">
                                        <LinkIcon size={16} weight="bold" /> {(formData.platform as string) === 'Others' ? 'Meeting' : formData.platform} Link <span className="text-red-500">*</span>
                                    </label>
                                    <input required type="url" value={formData.meetingLink} onChange={e => setFormData({...formData, meetingLink: e.target.value})} placeholder={`https://${(formData.platform as string) === 'Zoom Meeting' ? 'zoom.us' : 'meet.google.com'}/...`} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[15px] font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all" />
                                </div>
                            )}

                            <div>
                                <label className="flex items-center gap-2 text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">
                                    <Users size={16} weight="bold" /> Attendees <span className="text-red-500">*</span>
                                </label>
                                <StaticUserMultiSelect value={formData.attendees} onChange={v => setFormData({...formData, attendees: v})} />
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">
                                    <Note size={16} weight="bold" /> Agenda <span className="text-red-500">*</span>
                                </label>
                                <textarea required maxLength={1000} rows={6} value={formData.agenda} onChange={e => setFormData({...formData, agenda: e.target.value})} placeholder="Enter meeting agenda details..." className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[15px] font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all resize-none min-h-[140px]"></textarea>
                                <div className="text-right text-[11px] font-medium text-gray-400 mt-1.5 flex justify-end items-center gap-1">
                                    <span className={formData.agenda.length >= 1000 ? 'text-red-500 font-bold' : ''}>{formData.agenda.length}</span>
                                    <span>/ 1000</span>
                                </div>
                            </div>
                        </form>

                        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/80 flex flex-col sm:flex-row justify-end gap-3 sticky bottom-0">
                            <button type="button" onClick={onClose} disabled={isSubmitting} className="cursor-pointer w-full sm:w-auto px-6 py-2.5 rounded-xl text-[15px] font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 hover:text-gray-900 transition-colors disabled:opacity-50 shadow-sm">
                                Cancel
                            </button>
                            <button type="submit" form="meeting-form" disabled={isSubmitting || !!errorMsg} className="cursor-pointer w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-[15px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed">
                                {isSubmitting ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                        Submitting...
                                    </>
                                ) : (
                                    initialData ? 'Save Changes' : 'Schedule Meeting'
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
