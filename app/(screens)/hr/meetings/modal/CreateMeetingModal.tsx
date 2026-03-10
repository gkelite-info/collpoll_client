'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { CaretDown, CaretRight } from '@phosphor-icons/react';
import SelectFacultyModal from './SelectFacultyModal'; 
import { useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

export default function CreateMeetingModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // 1. Local state for form dropdown
    const [selectedRole, setSelectedRole] = useState('Select Role');

    // 2. Read from URL Props (URL Search Params)
    const selectModalRoleParam = searchParams.get('selectRole'); // Gets 'Placement', 'Admin', etc. from URL
    const isSelectModalOpen = !!selectModalRoleParam; // Opens modal if param exists in URL

    // Helper to dynamically change text based on local state
    const getDynamicSelectionText = () => {
        switch (selectedRole) {
            case 'Admin': return 'Select Admins';
            case 'Faculty': return 'Select Faculties';
            case 'Placement': return 'Select Placements';
            case 'Finance': return 'Select Finance';
            default: return 'Select Faculties'; 
        }
    };
    const dynamicText = getDynamicSelectionText();

    // Helper to get title specifically for the second modal based on the URL prop
    const getModalTitleFromUrl = () => {
        switch (selectModalRoleParam) {
            case 'Admin': return 'Select Admins';
            case 'Placement': return 'Select Placements';
            case 'Finance': return 'Select Finance';
            default: return 'Select Faculties';
        }
    }

    // 3. Open Modal: Push prop to URL
    const handleOpenSelectModal = () => {
        const params = new URLSearchParams(searchParams.toString());
        const roleToPass = selectedRole === 'Select Role' ? 'Faculty' : selectedRole;
        params.set('selectRole', roleToPass); // Sets e.g., ?selectRole=Placement
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    // 4. Close Modal: Remove prop from URL
    const handleCloseSelectModal = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete('selectRole'); // Removes ?selectRole=...
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
                        onClick={onClose}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 10 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl w-full max-w-2xl p-8 shadow-xl custom-scrollbar overflow-y-auto max-h-[90vh]"
                        >
                            <h2 className="text-[22px] font-bold text-[#282828] mb-6">Create Meeting</h2>

                            <div className="space-y-3">
                                {/* Title */}
                                <div>
                                    <label className="block text-base font-semibold text-[#282828] mb-1.5">Title</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g., Internal Assessment Discussion" 
                                        className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2.5 text-sm font-medium outline-none focus:border-[#43C17A] text-[#282828]" 
                                    />
                                </div>

                                {/* Agenda */}
                                <div>
                                    <label className="block text-base font-semibold text-[#282828] mb-1.5">Agenda</label>
                                    <textarea 
                                        placeholder="Brief description of the meeting......!!!!" 
                                        rows={3}
                                        className="w-full border border-[#E0E0E0] rounded-lg px-3 py-1 text-sm font-medium outline-none focus:border-[#43C17A] resize-none text-[#282828]" 
                                    />
                                </div>

                                {/* Date & Role */}
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-base font-semibold text-[#282828] mb-1.5">Date</label>
                                        <input 
                                            type="date" 
                                            className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2.5 text-sm font-medium outline-none text-[#555555] cursor-pointer" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-base font-semibold text-[#282828] mb-1.5">Role</label>
                                        <div className="relative">
                                            <select 
                                                value={selectedRole}
                                                onChange={(e) => setSelectedRole(e.target.value)}
                                                className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2.5 text-sm outline-none appearance-none bg-white text-[#555555] cursor-pointer"
                                            >
                                                <option disabled value="Select Role">Select Role</option>
                                                <option value="Admin">Admin</option>
                                                <option value="Faculty">Faculty</option>
                                                <option value="Placement">Placement</option>
                                                <option value="Finance">Finance</option>
                                            </select>
                                            <CaretDown size={14} className="absolute right-3 top-3.5 text-[#555555] pointer-events-none" />
                                        </div>
                                    </div>
                                </div>

                                {/* Time */}
                                <div>
                                    <label className="block text-base font-semibold text-[#282828] mb-1.5">Time</label>
                                    <div className="grid grid-cols-2 gap-6">
                                        {/* From Time */}
                                        <div>
                                            <span className="text-base text-[#555555] block mb-1">From</span>
                                            <div className="flex gap-2">
                                                <div className="relative flex-1">
                                                    <select className="w-full border border-[#E0E0E0] rounded-lg pl-2 pr-6 py-2.5 text-sm outline-none appearance-none bg-white text-center cursor-pointer">
                                                        <option>09</option>
                                                    </select>
                                                    <CaretDown size={14} className="absolute right-2 top-3.5 text-[#555555] pointer-events-none" />
                                                </div>
                                                <div className="relative flex-1">
                                                    <select className="w-full border border-[#E0E0E0] rounded-lg pl-2 pr-6 py-2.5 text-sm outline-none appearance-none bg-white text-center cursor-pointer">
                                                        <option>00</option>
                                                    </select>
                                                    <CaretDown size={14} className="absolute right-2 top-3.5 text-[#555555] pointer-events-none" />
                                                </div>
                                                <div className="relative flex-1">
                                                    <select className="w-full border border-[#E0E0E0] rounded-lg pl-2 pr-6 py-2.5 text-sm outline-none appearance-none bg-white text-center cursor-pointer">
                                                        <option>AM</option>
                                                    </select>
                                                    <CaretDown size={14} className="absolute right-2 top-3.5 text-[#555555] pointer-events-none" />
                                                </div>
                                            </div>
                                        </div>
                                        {/* To Time */}
                                        <div>
                                            <span className="text-base text-[#555555] block mb-1">To</span>
                                            <div className="flex gap-2">
                                                <div className="relative flex-1">
                                                    <select className="w-full border border-[#E0E0E0] rounded-lg pl-2 pr-6 py-2.5 text-sm outline-none appearance-none bg-white text-center cursor-pointer">
                                                        <option>09</option>
                                                    </select>
                                                    <CaretDown size={14} className="absolute right-2 top-3.5 text-[#555555] pointer-events-none" />
                                                </div>
                                                <div className="relative flex-1">
                                                    <select className="w-full border border-[#E0E0E0] rounded-lg pl-2 pr-6 py-2.5 text-sm outline-none appearance-none bg-white text-center cursor-pointer">
                                                        <option>00</option>
                                                    </select>
                                                    <CaretDown size={14} className="absolute right-2 top-3.5 text-[#555555] pointer-events-none" />
                                                </div>
                                                <div className="relative flex-1">
                                                    <select className="w-full border border-[#E0E0E0] rounded-lg pl-2 pr-6 py-2.5 text-sm outline-none appearance-none bg-white text-center cursor-pointer">
                                                        <option>AM</option>
                                                    </select>
                                                    <CaretDown size={14} className="absolute right-2 top-3.5 text-[#555555] pointer-events-none" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Dynamic Selection Block (Faculties / Admin / Placement / etc.) */}
                                <div>
                                    <label className="block text-base font-semibold text-[#282828] mb-1.5">{dynamicText}</label>
                                    <div 
                                        onClick={handleOpenSelectModal}
                                        className="relative cursor-pointer"
                                    >
                                        <div className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2.5 text-sm bg-white text-[#555555]">
                                            {dynamicText}
                                        </div>
                                        <CaretRight size={14} className="absolute right-3 top-3.5 text-[#555555] pointer-events-none" />
                                    </div>
                                </div>

                                {/* Notifications */}
                                <div>
                                    <label className="block text-base font-semibold text-[#282828] mb-1.5">Notifications</label>
                                    <div className="flex gap-4">
                                        <label className="flex-1 border border-[#E0E0E0] rounded-lg px-3 py-2.5 flex items-center gap-2 cursor-pointer">
                                            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 accent-[#43C17A] cursor-pointer" />
                                            <span className="text-sm text-[#282828]">In-app notification</span>
                                        </label>
                                        <label className="flex-1 border border-[#E0E0E0] rounded-lg px-3 py-2.5 flex items-center gap-2 cursor-pointer">
                                            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 accent-[#43C17A] cursor-pointer" />
                                            <span className="text-sm text-[#282828]">Email notification</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-4 pt-2">
                                    <button 
                                        onClick={onClose} 
                                        className="flex-1 py-3 bg-[#E9E9E9] rounded-lg font-semibold text-[#282828] hover:bg-[#d8d8d8] transition-colors cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        className="flex-1 py-3 bg-[#43C17A] rounded-lg font-semibold text-white hover:bg-[#38a869] transition-colors shadow-sm cursor-pointer"
                                    >
                                        Schedule
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Sub-modal reading directly from the URL param */}
            <SelectFacultyModal 
                isOpen={isSelectModalOpen} 
                onClose={handleCloseSelectModal} 
                onSelect={() => {}} 
                title={getModalTitleFromUrl()}
                roleName={selectModalRoleParam || 'Faculty'}
            />
        </>
    );
}