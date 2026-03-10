'use client';
import { X, MagnifyingGlass } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

const MOCK_FACULTY = [
    { id: 1, name: "Rohan Sharma", dept: "CSE - A", img: "https://i.pravatar.cc/150?u=1" },
    { id: 2, name: "Ananya Verma", dept: "CSE - A", img: "https://i.pravatar.cc/150?u=2" },
    { id: 3, name: "Karthik Reddy", dept: "CSE - A", img: "https://i.pravatar.cc/150?u=3" },
    { id: 4, name: "Sneha Patel", dept: "CSE - A", img: "https://i.pravatar.cc/150?u=4" },
    { id: 5, name: "Arjun Mehta", dept: "CSE - A", img: "https://i.pravatar.cc/150?u=5" },
    { id: 6, name: "Pooja Nair", dept: "CSE - A", img: "https://i.pravatar.cc/150?u=6" },
    { id: 7, name: "Nikhil Jain", dept: "CSE - A", img: "https://i.pravatar.cc/150?u=7" },
    { id: 8, name: "Aishwarya Kulkarni", dept: "CSE - A", img: "https://i.pravatar.cc/150?u=8" },
];

export default function SelectFacultyModal({ 
    isOpen, 
    onClose, 
    onSelect,
    title = "Select Faculties",  
    roleName = "Faculty"         
}: { 
    isOpen: boolean; 
    onClose: () => void; 
    onSelect: (f: any[]) => void;
    title?: string;
    roleName?: string;
}) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const filteredFaculty = MOCK_FACULTY.filter(f => 
        f.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const isAllSelected = filteredFaculty.length > 0 && filteredFaculty.every(f => selectedIds.includes(f.id));

    const handleSelectAll = () => {
        if (isAllSelected) {
            const filteredIds = filteredFaculty.map(f => f.id);
            setSelectedIds(prev => prev.filter(id => !filteredIds.includes(id)));
        } else {
            const filteredIds = filteredFaculty.map(f => f.id);
            const newSelections = Array.from(new Set([...selectedIds, ...filteredIds]));
            setSelectedIds(newSelections);
        }
    };

    const toggleSelection = (id: number) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    useEffect(() => {
        const selectedObjects = MOCK_FACULTY.filter(f => selectedIds.includes(f.id));
        onSelect(selectedObjects);
    }, [selectedIds, onSelect]);

    useEffect(() => {
        if (!isOpen) setSearchQuery('');
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
                >
                    <motion.div 
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        // INCREASED HEIGHT TO h-[650px]
                        className="bg-white rounded-xl w-full max-w-md h-[650px] p-6 shadow-xl flex flex-col"
                    >
                        <div className="flex justify-between items-center mb-4 shrink-0">
                            <h3 className="text-[20px] font-bold text-[#282828]">{title}</h3>
                            <div className="flex gap-4 items-center">
                                <button 
                                    onClick={handleSelectAll}
                                    className="bg-[#16284F] text-white text-xs px-4 py-2 rounded-md font-medium hover:bg-[#111e3b] transition-colors cursor-pointer"
                                >
                                    {isAllSelected ? "Unselect All" : "Select All"}
                                </button>
                                <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
                                    <X size={20} className="text-[#555555] cursor-pointer"/>
                                </button>
                            </div>
                        </div>

                        <div className="relative mb-4 shrink-0">
                            <MagnifyingGlass className="absolute left-3 top-2.5 text-gray-400" size={18} />
                            <input 
                                type="text" 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={`Search by name`} 
                                className="w-full pl-10 pr-4 py-2 bg-[#F6F6F6] border border-transparent rounded-full text-sm outline-none focus:border-[#43C17A] transition-colors" 
                            />
                        </div>

                        {/* INCREASED LIST HEIGHT TO h-[450px] */}
                        <div className="space-y-4 h-[450px] overflow-y-auto pr-2 custom-scrollbar flex-1">
                            {filteredFaculty.length > 0 ? (
                                filteredFaculty.map((f) => (
                                    <div key={f.id} className="flex items-center justify-between hover:bg-gray-50 p-1 -mx-1 rounded-md transition-colors cursor-pointer" onClick={() => toggleSelection(f.id)}>
                                        <div className="flex items-center gap-3">
                                            <img src={f.img} className="w-10 h-10 rounded-full object-cover border border-gray-200" alt={f.name} />
                                            <div>
                                                <p className="font-semibold text-sm text-[#282828]">{f.name}</p>
                                                <p className="text-xs text-gray-500">{f.dept}</p>
                                            </div>
                                        </div>
                                        <input 
                                            type="checkbox" 
                                            checked={selectedIds.includes(f.id)}
                                            onChange={() => toggleSelection(f.id)}
                                            onClick={(e) => e.stopPropagation()} 
                                            className="w-5 h-5 rounded border-[#CCCCCC] text-[#16284F] focus:ring-[#16284F] accent-[#16284F] cursor-pointer" 
                                        />
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-sm text-gray-500 py-4">No {roleName.toLowerCase()} found.</p>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}