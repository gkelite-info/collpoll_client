import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Meeting } from '../meetingTypes';
import { X, CalendarBlank, Clock, User, Link as LinkIcon, Note, Users, WarningCircle } from '@phosphor-icons/react';
import toast from 'react-hot-toast';
import { CustomDropdown } from '@/app/components/CustomDropdown';
import { UserMultiSelect, UserSingleSelect, TimeSelector } from './MeetingFormInputs';
import ConflictWarningModal from './ConflictWarningModal';
import { useCreateMeeting, useUpdateMeeting } from '../hooks/useMeetingsMutation';
import { useUser } from '@/app/utils/context/UserContext';
import { fetchMeetingConflicts } from '@/lib/helpers/collegeMeetings/fetchMeetingConflicts';
import { getUsersByIds, SelectUser } from '@/lib/helpers/Hr/meetings/getCollegeUsers';

interface MeetingFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: Meeting | null;
    timings?: any[];
    holidays?: any[];
}

export default function MeetingFormModal({ isOpen, onClose, initialData, timings = [], holidays = [] }: MeetingFormModalProps) {
    const { collegeId, userId } = useUser();
    
    const { mutateAsync: createMeeting } = useCreateMeeting(collegeId || 0);
    const { mutateAsync: updateMeeting } = useUpdateMeeting(collegeId || 0);

    const defaultState = {
        title: '',
        date: '',
        startTime: '10:00',
        endTime: '11:00',
        organizer: '',
        type: 'Internal' as Meeting['type'],
        agenda: '',
        attendees: '', // comma separated userIds
        meetingLink: '',
        zoomId: '',
        zoomPassword: '',
        platform: 'Google Meet' as 'Google Meet' | 'Zoom Meeting' | 'Others' | undefined
    };

    const [formData, setFormData] = useState(defaultState);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [warningMsg, setWarningMsg] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    
    const [conflicts, setConflicts] = useState<any[]>([]);
    const [showConflictModal, setShowConflictModal] = useState(false);

    const [initialAttendees, setInitialAttendees] = useState<SelectUser[]>([]);
    const [initialOrganizer, setInitialOrganizer] = useState<SelectUser | null>(null);

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
                attendees: initialData.participantDetails?.map(p => p.userId).join(',') || '',
                meetingLink: initialData.meetingLink || '',
                zoomId: initialData.zoomId || '',
                zoomPassword: initialData.zoomPassword || '',
                platform: initialData.platform || 'Google Meet'
            });

            if (collegeId) {
                const preloadedAttendees: SelectUser[] = (initialData.participantDetails || []).map(p => ({
                    id: p.userId,
                    userId: p.userId,
                    name: p.name,
                    subLabel: p.role || 'Attendee',
                    avatar: p.avatar,
                    displayId: String(p.userId)
                }));
                setInitialAttendees(preloadedAttendees);

                // If organizer is a string, we might not have their ID.
                // But we can try to fetch it if we had their ID. If not, the input just displays the string.
                // If initialData provides organizerAvatar or if we fetch by name...
                // Actually the UserSingleSelect can just display the name. 
                // But for a better experience, we can construct a SelectUser object manually
                // since we don't have the organizer ID.
                setInitialOrganizer({
                    id: 0,
                    userId: 0,
                    name: initialData.organizer,
                    subLabel: 'Organizer',
                    avatar: initialData.organizerAvatar || null,
                    displayId: ''
                });
            }

        } else if (isOpen) {
            setFormData({
                ...defaultState,
                date: new Date().toISOString().split('T')[0]
            });
            setInitialAttendees([]);
            setInitialOrganizer(null);
        }
    }, [isOpen, initialData, collegeId]);

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
            setWarningMsg(`Warning: ${formData.date} is a holiday (${holiday.title}).`);
        }

        const dayTiming = timings.find(t => t.dayOfWeek === dayName);
        if (dayTiming && !dayTiming.isOpen) {
            setWarningMsg(`Warning: The college is usually closed on ${dayName}s.`);
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

    const performSave = async () => {
        const platform = formData.platform as string;
        const attendeesList = formData.attendees.split(',').filter(Boolean).map(id => ({
            userId: parseInt(id),
            role: 'Attendee'
        }));

        const platformMap: Record<string, string> = {
            'Google Meet': 'googlemeet',
            'Zoom Meeting': 'zoom',
            'Others': 'others'
        };

        const payload = {
            id: initialData ? parseInt(initialData.id) : undefined,
            collegeId: collegeId || 0,
            title: formData.title.trim(),
            date: formData.date,
            fromTime: formData.startTime,
            toTime: formData.endTime,
            organizer: formData.organizer,
            type: formData.type.toLowerCase(),
            agenda: formData.agenda.trim(),
            participants: attendeesList,
            meetingLink: platform === 'Zoom Meeting' ? undefined : formData.meetingLink?.trim(),
            zoomId: platform === 'Zoom Meeting' ? formData.zoomId?.trim() : undefined,
            zoomPassword: platform === 'Zoom Meeting' ? formData.zoomPassword?.trim() : undefined,
            platform: platformMap[platform] || 'googlemeet',
        };

        try {
            if (initialData) {
                await updateMeeting({ payload, userId: userId || 0 });
            } else {
                await createMeeting({ payload, userId: userId || 0 });
            }
            onClose();
        } catch (error) {
            // Error is handled in mutation hooks via toast
        } finally {
            setIsSubmitting(false);
        }
    };

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

        const todayDate = new Date().toISOString().split('T')[0];
        if (formData.date < todayDate) {
            toast.error('Meetings cannot be scheduled in the past.', { id: toastId });
            return;
        }
        if (formData.date === todayDate) {
            const currentHour = new Date().getHours();
            const currentMinute = new Date().getMinutes();
            const currentTimeStr = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;
            if (formData.endTime <= currentTimeStr) {
                toast.error('End Time must be greater than the current time.', { id: toastId });
                return;
            }
        }

        if (!formData.organizer) {
            toast.error('Organizer is required.', { id: toastId });
            return;
        }

        const trimmedAgenda = formData.agenda.trim();
        if (!trimmedAgenda) {
            toast.error('Agenda cannot be empty.', { id: toastId });
            return;
        }

        if (!formData.attendees) {
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
        } else if (platform === 'Google Meet' || platform === 'Others') {
            const trimmedLink = formData.meetingLink?.trim() || '';
            if (!trimmedLink) {
                toast.error('Meeting Link is required.', { id: toastId });
                return;
            }
        }

        setIsSubmitting(true);
        
        try {
            const attendeesIds = formData.attendees.split(',').filter(Boolean).map(id => parseInt(id));
            const participantUserIds = userId ? [...new Set([...attendeesIds, userId])] : attendeesIds;

            // Check conflicts before saving
            const foundConflicts = await fetchMeetingConflicts({
                collegeId: collegeId || 0,
                date: formData.date,
                fromTime: formData.startTime,
                toTime: formData.endTime,
                participantUserIds,
                excludeMeetingId: initialData ? parseInt(initialData.id) : undefined
            });

            if (foundConflicts.length > 0) {
                setConflicts(foundConflicts);
                setShowConflictModal(true);
                setIsSubmitting(false);
                return;
            }

            await performSave();
        } catch (error) {
            toast.error('An error occurred. Please try again.', { id: toastId });
            setIsSubmitting(false);
        }
    };

    // Removed getBounds and auto-adjusting useEffect so users can select any time

    return (
        <AnimatePresence>
            {isOpen && (
                <div key="meeting-modal-overlay" className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6">
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
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl flex items-center justify-center text-center gap-3 text-sm font-semibold shadow-sm">
                                    <WarningCircle size={20} weight="fill" className="text-amber-500 shrink-0" />
                                    <span>{warningMsg}</span>
                                </motion.div>
                            )}
                            {errorMsg && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl flex items-center justify-center text-center gap-3 text-sm font-semibold shadow-sm">
                                    <WarningCircle size={20} weight="fill" className="text-red-500 shrink-0" />
                                    <span>{errorMsg}</span>
                                </motion.div>
                            )}

                            <div>
                                <label className="flex items-center gap-2 text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">
                                     Meeting Title <span className="text-red-500">*</span>
                                </label>
                                <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[15px] font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all" placeholder="e.g. Weekly Sync" />
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
                                    <input type="date" min={new Date().toISOString().split('T')[0]} value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="cursor-pointer w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[15px] font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="flex items-center gap-2 text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">
                                        <Clock size={16} weight="bold" /> Start Time <span className="text-red-500">*</span>
                                    </label>
                                    <TimeSelector value={formData.startTime} onChange={v => setFormData({...formData, startTime: v})} bounds={{start: 0, end: 24}} />
                                </div>
                                <div>
                                    <label className="flex items-center gap-2 text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">
                                        <Clock size={16} weight="bold" /> End Time <span className="text-red-500">*</span>
                                    </label>
                                    <TimeSelector value={formData.endTime} onChange={v => setFormData({...formData, endTime: v})} bounds={{start: 0, end: 24}} />
                                </div>
                            </div>

                            <div className="w-full">
                                <label className="flex items-center gap-2 text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">
                                    <User size={16} weight="bold" /> Organizer <span className="text-red-500">*</span>
                                </label>
                                <UserSingleSelect value={formData.organizer} onChange={v => setFormData({...formData, organizer: v})} initialSelectedUser={initialOrganizer} />
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
                                        <input type="text" value={formData.zoomId} onChange={e => setFormData({...formData, zoomId: e.target.value})} placeholder="Enter Zoom ID" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[15px] font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all" />
                                    </div>
                                    <div>
                                        <label className="flex items-center gap-2 text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">
                                            Password <span className="text-red-500">*</span>
                                        </label>
                                        <input type="text" value={formData.zoomPassword} onChange={e => setFormData({...formData, zoomPassword: e.target.value})} placeholder="Enter Password" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[15px] font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all" />
                                    </div>
                                </div>
                            ) : (
                                <div className="animate-in fade-in duration-200">
                                    <label className="flex items-center gap-2 text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">
                                        <LinkIcon size={16} weight="bold" /> {(formData.platform as string) === 'Others' ? 'Meeting' : formData.platform} Link <span className="text-red-500">*</span>
                                    </label>
                                    <input type="url" value={formData.meetingLink} onChange={e => setFormData({...formData, meetingLink: e.target.value})} placeholder={`https://${(formData.platform as string) === 'Zoom Meeting' ? 'zoom.us' : 'meet.google.com'}/...`} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[15px] font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all" />
                                </div>
                            )}

                            <div>
                                <label className="flex items-center gap-2 text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">
                                    <Users size={16} weight="bold" /> Attendees <span className="text-red-500">*</span>
                                </label>
                                <UserMultiSelect value={formData.attendees} onChange={v => setFormData({...formData, attendees: v})} initialSelectedUsers={initialAttendees} />
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">
                                    <Note size={16} weight="bold" /> Agenda <span className="text-red-500">*</span>
                                </label>
                                <textarea maxLength={1000} rows={6} value={formData.agenda} onChange={e => setFormData({...formData, agenda: e.target.value})} placeholder="Enter meeting agenda details..." className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[15px] font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all resize-none min-h-[140px]"></textarea>
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
            
            <ConflictWarningModal
                key="conflict-warning-modal"
                isOpen={showConflictModal}
                conflicts={conflicts}
                onClose={() => {
                    setShowConflictModal(false);
                    setIsSubmitting(true);
                    performSave();
                }}
                onChangeTimings={() => setShowConflictModal(false)}
            />
        </AnimatePresence>
    );
}
