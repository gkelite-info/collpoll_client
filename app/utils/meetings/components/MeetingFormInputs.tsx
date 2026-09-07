import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CaretDown, Check } from '@phosphor-icons/react';
import { Avatar } from '@/app/utils/Avatar';
import { CustomDropdown } from '@/app/components/CustomDropdown';
import { SelectUser } from "@/lib/helpers/Hr/meetings/getCollegeUsers";
import { useUser } from "@/app/utils/context/UserContext";
import { useInfiniteCollegeUsers } from '../hooks/useInfiniteCollegeUsers';
import UserSearchShimmer from './UserSearchShimmer';
import { useInView } from 'react-intersection-observer';

export const UserMultiSelect = ({ value, onChange, initialSelectedUsers = [] }: { value: string, onChange: (v: string) => void, initialSelectedUsers?: SelectUser[] }) => {
    const { collegeId } = useUser();
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [selectedUserObjects, setSelectedUserObjects] = useState<SelectUser[]>(initialSelectedUsers);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 300);
        return () => clearTimeout(handler);
    }, [searchQuery]);

    useEffect(() => {
        if (initialSelectedUsers.length > 0) {
            setSelectedUserObjects(initialSelectedUsers);
        }
    }, [initialSelectedUsers]);

    const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } = useInfiniteCollegeUsers(collegeId || 0, debouncedSearchQuery);
    const users = data?.pages.flatMap(page => page) || [];
    const { ref: loadMoreRef, inView } = useInView();

    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchQuery('');
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedIds = value ? value.split(',').map(v => parseInt(v.trim(), 10)).filter(v => !isNaN(v)) : [];
    
    const toggleUser = (user: SelectUser) => {
        const id = user.userId;
        if (selectedIds.includes(id)) {
            onChange(selectedIds.filter(n => n !== id).join(','));
            setSelectedUserObjects(prev => prev.filter(u => u.userId !== id));
        } else {
            onChange([...selectedIds, id].join(','));
            if (!selectedUserObjects.find(u => u.userId === id)) {
                setSelectedUserObjects(prev => [...prev, user]);
            }
        }
        setSearchQuery('');
    };

    return (
        <div ref={dropdownRef} className="relative w-full">
            <div 
                onClick={() => setIsOpen(true)}
                className={`cursor-text w-full bg-gray-50 border rounded-xl px-4 py-2.5 text-[14px] font-medium transition-colors hover:bg-gray-100/50 flex flex-wrap items-center gap-2 min-h-[48px] focus-within:outline-none focus-within:ring-2 focus-within:ring-emerald-600/20 ${
                    isOpen ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-white' : 'border-gray-200'
                }`}
            >
                {selectedUserObjects.map(user => (
                    <span key={user.userId} className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        {user.name}
                        <X size={12} weight="bold" className="cursor-pointer hover:text-emerald-900 ml-1" onClick={() => toggleUser(user)} />
                    </span>
                ))}
                
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    placeholder={selectedUserObjects.length > 0 ? "Add more..." : "Search and select attendees..."}
                    className="flex-1 bg-transparent border-none outline-none text-[15px] font-medium placeholder:text-emerald-700/50 text-gray-800 min-w-[150px] w-full"
                />

                <CaretDown className={`ml-auto text-gray-400 transition-transform duration-200 flex-shrink-0 cursor-pointer ${isOpen ? 'rotate-180' : ''}`} onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }} size={16} weight="bold" />
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.15 }}
                        className="absolute top-[calc(100%+8px)] left-0 w-full bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 z-[9999] overflow-hidden flex flex-col"
                    >
                        <div className="max-h-60 overflow-y-auto custom-scrollbar p-1.5 space-y-1">
                            {isLoading ? (
                                <UserSearchShimmer />
                            ) : users.length === 0 ? (
                                <div className="p-4 text-center text-sm text-gray-500">No users found</div>
                            ) : (
                                <>
                                    {users.map(user => {
                                        const isSelected = selectedIds.includes(user.userId);
                                        return (
                                            <div 
                                                key={user.userId}
                                                onClick={() => toggleUser(user)}
                                                className={`px-3 py-2.5 flex items-center gap-3 cursor-pointer transition-colors rounded-lg
                                                    ${isSelected ? 'bg-emerald-50/80' : 'hover:bg-gray-50'}
                                                `}
                                            >
                                                <Avatar alt={user.name} src={user.avatar} size={36} />
                                                <div className="flex-1 min-w-0 flex flex-col">
                                                    <div className={`text-[14px] font-bold leading-tight truncate ${isSelected ? 'text-emerald-700' : 'text-gray-800'}`}>{user.name}</div>
                                                    <div className="text-[12px] text-gray-500 font-medium leading-tight truncate">ID: {user.displayId || user.userId}</div>
                                                    <div className="text-[11px] text-gray-400 font-medium leading-tight truncate">{user.subLabel}</div>
                                                </div>
                                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors shrink-0 ${isSelected ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300 bg-white'}`}>
                                                    {isSelected && <Check size={12} weight="bold" className="text-white" />}
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {hasNextPage && (
                                        <div ref={loadMoreRef}>
                                            <UserSearchShimmer />
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export const UserSingleSelect = ({ value, onChange, initialSelectedUser = null }: { value: string, onChange: (v: string) => void, initialSelectedUser?: SelectUser | null }) => {
    const { collegeId } = useUser();
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [selectedUserObject, setSelectedUserObject] = useState<SelectUser | null>(initialSelectedUser);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 300);
        return () => clearTimeout(handler);
    }, [searchQuery]);

    useEffect(() => {
        if (initialSelectedUser) {
            setSelectedUserObject(initialSelectedUser);
        }
    }, [initialSelectedUser]);

    const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } = useInfiniteCollegeUsers(collegeId || 0, debouncedSearchQuery);
    const users = data?.pages.flatMap(page => page) || [];
    const { ref: loadMoreRef, inView } = useInView();

    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchQuery('');
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleUser = (user: SelectUser) => {
        onChange(user.name);
        setSelectedUserObject(user);
        setIsOpen(false);
        setSearchQuery('');
    };

    return (
        <div ref={dropdownRef} className="relative w-full">
            <div 
                onClick={() => setIsOpen(true)}
                className={`cursor-text w-full bg-gray-50 border rounded-xl px-4 py-2.5 text-[14px] font-medium transition-colors hover:bg-gray-100/50 flex flex-wrap items-center gap-2 min-h-[48px] focus-within:outline-none focus-within:ring-2 focus-within:ring-emerald-600/20 ${
                    isOpen ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-white' : 'border-gray-200'
                }`}
            >
                {!isOpen && selectedUserObject ? (
                    <div className="flex items-center gap-2 shrink-0">
                        <Avatar alt={selectedUserObject.name} src={selectedUserObject.avatar} size={24} />
                    </div>
                ) : null}
                
                <input
                    type="text"
                    value={isOpen ? searchQuery : (selectedUserObject ? selectedUserObject.name : '')}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    placeholder="Search and select an organizer..."
                    className={`flex-1 bg-transparent border-none outline-none text-[15px] font-medium placeholder:text-emerald-700/50 w-full truncate ${isOpen ? 'text-gray-900' : 'text-emerald-800'}`}
                />

                {isOpen && searchQuery && (
                    <button 
                        onClick={(e) => { e.stopPropagation(); setSearchQuery(""); }}
                        className="p-1 hover:bg-gray-200 rounded-full text-gray-500 transition-colors cursor-pointer"
                    >
                        <X size={14} weight="bold" />
                    </button>
                )}
                {!isOpen && (
                    <CaretDown className="ml-auto text-gray-400 transition-transform duration-200 flex-shrink-0 cursor-pointer" onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }} size={16} weight="bold" />
                )}
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.15 }}
                        className="absolute top-[calc(100%+8px)] left-0 w-full bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 z-[9999] overflow-hidden flex flex-col"
                    >
                        <div className="max-h-60 overflow-y-auto custom-scrollbar p-1.5 space-y-1">
                            {isLoading ? (
                                <UserSearchShimmer />
                            ) : users.length === 0 ? (
                                <div className="p-4 text-center text-sm text-gray-500">No users found</div>
                            ) : (
                                <>
                                    {users.map(user => {
                                        const isSelected = value === user.name;
                                        return (
                                            <div 
                                                key={user.userId}
                                                onClick={() => toggleUser(user)}
                                                className={`px-3 py-2.5 flex items-center gap-3 cursor-pointer transition-colors rounded-lg
                                                    ${isSelected ? 'bg-emerald-50/80' : 'hover:bg-gray-50'}
                                                `}
                                            >
                                                <Avatar alt={user.name} src={user.avatar} size={36} />
                                                <div className="flex-1 min-w-0 flex flex-col">
                                                    <div className={`text-[14px] font-bold leading-tight truncate ${isSelected ? 'text-emerald-700' : 'text-gray-800'}`}>{user.name}</div>
                                                    <div className="text-[12px] text-gray-500 font-medium leading-tight truncate">ID: {user.displayId || user.userId}</div>
                                                    <div className="text-[11px] text-gray-400 font-medium leading-tight truncate">{user.subLabel}</div>
                                                </div>
                                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors shrink-0 ${isSelected ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300 bg-white'}`}>
                                                    {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {hasNextPage && (
                                        <div ref={loadMoreRef}>
                                            <UserSearchShimmer />
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export const TimeSelector = ({ value, onChange, bounds }: { value: string, onChange: (v: string) => void, bounds: {start: number, end: number} }) => {
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
