import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Meeting } from '../meetingTypes';
import { X, CalendarBlank, Clock, User, Link as LinkIcon, Note, Users, TextAa, CaretDown, WarningCircle } from '@phosphor-icons/react';
import toast from 'react-hot-toast';
import { useRef } from 'react';

const CustomSelect = ({ value, onChange, options, className = "flex-1", innerClassName = "py-3 px-4" }: any) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedLabel = options.find((o: any) => o.value === value)?.label || value;

    return (
        <div ref={dropdownRef} className={`relative ${className}`}>
            <div 
                onClick={() => setIsOpen(!isOpen)}
                className={`cursor-pointer w-full bg-gray-50 border border-gray-200 rounded-xl text-[14px] font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 flex items-center justify-between transition-colors hover:bg-gray-100/50 ${innerClassName}`}
            >
                <span className="truncate pr-2 text-left">{selectedLabel}</span>
                <CaretDown className={`text-gray-400 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} size={14} weight="bold" />
            </div>
            
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.15 }}
                        className="absolute top-full mt-2 left-0 w-full max-h-60 overflow-y-auto bg-white rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-gray-100 z-[70] custom-scrollbar py-1"
                    >
                        {options.map((opt: any) => (
                            <div 
                                key={opt.value}
                                onClick={() => {
                                    if (opt.disabled) return;
                                    onChange(opt.value);
                                    setIsOpen(false);
                                }}
                                className={`px-4 py-2.5 text-[14px] font-bold cursor-pointer transition-colors text-left mx-1 rounded-lg
                                    ${opt.disabled ? 'opacity-40 cursor-not-allowed bg-gray-50 text-gray-400' : 
                                      value === opt.value ? 'bg-emerald-50 text-emerald-600' : 'text-gray-700 hover:bg-gray-100'}
                                `}
                            >
                                {opt.label}
                            </div>
                        ))}
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
        hourOptions.push({ value: String(i).padStart(2, '0'), label: String(i).padStart(2, '0'), disabled: isDisabled });
    }

    const minOptions = Array.from({length: 12}).map((_, i) => ({ value: String(i*5).padStart(2, '0'), label: String(i*5).padStart(2, '0') }));
    
    return (
        <div className="flex gap-1.5 items-center w-full">
            <CustomSelect value={String(hour12).padStart(2, '0')} onChange={handleHourChange} options={hourOptions} innerClassName="py-2.5 px-3" />
            <span className="text-gray-500 font-bold">:</span>
            <CustomSelect value={minute} onChange={handleMinuteChange} options={minOptions} innerClassName="py-2.5 px-3" />
            <CustomSelect value={ampm} onChange={handleAmPmChange} options={[{value:'AM', label:'AM'}, {value:'PM', label:'PM'}]} className="w-[75px]" innerClassName="py-2.5 px-2" />
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
        meetingLink: ''
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
                meetingLink: initialData.meetingLink || ''
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
        setIsSubmitting(true);
        
        try {
            await new Promise(resolve => setTimeout(resolve, 800));
            
            onSubmit({
                title: formData.title,
                date: formData.date,
                startTime: formData.startTime,
                endTime: formData.endTime,
                organizer: formData.organizer,
                type: formData.type,
                agenda: formData.agenda,
                attendees: formData.attendees.split(',').map(a => a.trim()).filter(Boolean),
                meetingLink: formData.meetingLink,
                isEditable: true
            }, initialData?.id);
            
            toast.success(initialData ? 'Meeting updated successfully!' : 'Meeting created successfully!', { id: 'meeting-toast' });
            onClose();
        } catch (error) {
            toast.error('An error occurred. Please try again.', { id: 'meeting-toast' });
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
        
        return { start: startHour, end: endHour };
    };

    const bounds = getBounds();

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-6">
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm cursor-pointer"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
                        className="relative w-full max-w-xl bg-white rounded-[24px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[85vh]"
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
                                    <TextAa size={16} weight="bold" /> Meeting Title
                                </label>
                                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[15px] font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all" placeholder="e.g. Weekly Sync" />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="flex items-center gap-2 text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">
                                        Type
                                    </label>
                                    <CustomSelect 
                                        value={formData.type} 
                                        onChange={(v: string) => setFormData({...formData, type: v as any})} 
                                        options={[
                                            { value: 'Internal', label: 'Internal' },
                                            { value: 'External', label: 'External' },
                                            { value: 'Staff', label: 'Staff' },
                                            { value: 'Management', label: 'Management' }
                                        ]} 
                                        className="w-full"
                                    />
                                </div>
                                <div>
                                    <label className="flex items-center gap-2 text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">
                                        <CalendarBlank size={16} weight="bold" /> Date
                                    </label>
                                    <input required type="date" min={new Date().toISOString().split('T')[0]} value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="cursor-pointer w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[15px] font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="flex items-center gap-2 text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">
                                        <Clock size={16} weight="bold" /> Start Time
                                    </label>
                                    <TimeSelector value={formData.startTime} onChange={v => setFormData({...formData, startTime: v})} bounds={bounds} />
                                </div>
                                <div>
                                    <label className="flex items-center gap-2 text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">
                                        <Clock size={16} weight="bold" /> End Time
                                    </label>
                                    <TimeSelector value={formData.endTime} onChange={v => setFormData({...formData, endTime: v})} bounds={bounds} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="flex items-center gap-2 text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">
                                        <User size={16} weight="bold" /> Organizer
                                    </label>
                                    <input required type="text" value={formData.organizer} onChange={e => setFormData({...formData, organizer: e.target.value})} placeholder="e.g. Principal Sharma" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[15px] font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all" />
                                </div>
                                <div>
                                    <label className="flex items-center gap-2 text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">
                                        <LinkIcon size={16} weight="bold" /> Meeting Link (Optional)
                                    </label>
                                    <input type="url" value={formData.meetingLink} onChange={e => setFormData({...formData, meetingLink: e.target.value})} placeholder="https://meet.google.com/..." className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[15px] font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all" />
                                </div>
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">
                                    <Users size={16} weight="bold" /> Attendees
                                </label>
                                <input required type="text" value={formData.attendees} onChange={e => setFormData({...formData, attendees: e.target.value})} placeholder="Comma separated (e.g. John, Admin Team, All Staff)" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[15px] font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all" />
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">
                                    <Note size={16} weight="bold" /> Agenda
                                </label>
                                <textarea required rows={4} value={formData.agenda} onChange={e => setFormData({...formData, agenda: e.target.value})} placeholder="Enter meeting agenda details..." className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[15px] font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all resize-none"></textarea>
                            </div>
                        </form>

                        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/80 flex flex-col sm:flex-row justify-end gap-3 sticky bottom-0">
                            <button type="button" onClick={onClose} disabled={isSubmitting} className="cursor-pointer w-full sm:w-auto px-6 py-2.5 rounded-xl text-[15px] font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 hover:text-gray-900 transition-colors disabled:opacity-50 shadow-sm">
                                Cancel
                            </button>
                            <button type="submit" form="meeting-form" disabled={isSubmitting || !!errorMsg} className="cursor-pointer w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-[15px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed">
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
