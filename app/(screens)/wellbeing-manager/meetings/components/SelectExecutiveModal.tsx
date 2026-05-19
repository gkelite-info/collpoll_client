"use client";

import { motion } from "framer-motion";
import { MagnifyingGlass, X } from "@phosphor-icons/react";
import { Executive } from "../WellbeingMeetings";
import { useState } from "react";

interface SelectExecutiveModalProps {
    onClose: () => void;
    selectedExecutives: Executive[];
    setSelectedExecutives: (execs: Executive[]) => void;
}

const MOCK_EXECUTIVES: Executive[] = [
    { id: "1", name: "Rohan Sharma", department: "Infrastructure", empId: "2352892", avatar: "https://i.pravatar.cc/150?img=11" },
    { id: "2", name: "Ananya Verma", department: "Infrastructure", empId: "2352892", avatar: "https://i.pravatar.cc/150?img=5" },
    { id: "3", name: "Karthik Reddy", department: "Infrastructure", empId: "2352892", avatar: "https://i.pravatar.cc/150?img=12" },
    { id: "4", name: "Sneha Patel", department: "Infrastructure", empId: "2352892", avatar: "https://i.pravatar.cc/150?img=9" },
    { id: "5", name: "Arjun Mehta", department: "Infrastructure", empId: "2352892", avatar: "https://i.pravatar.cc/150?img=14" },
    { id: "6", name: "Pooja Nair", department: "Infrastructure", empId: "2352892", avatar: "https://i.pravatar.cc/150?img=20" },
    { id: "7", name: "Nikhil Jain", department: "Infrastructure", empId: "2352892", avatar: "https://i.pravatar.cc/150?img=33" },
    { id: "8", name: "Aishwarya Kulkarni", department: "Infrastructure", empId: "2352892", avatar: "https://i.pravatar.cc/150?img=44" },
    { id: "9", name: "Rahul Singh", department: "Infrastructure", empId: "2352892", avatar: "https://i.pravatar.cc/150?img=15" },
    { id: "10", name: "Nikhil Jain", department: "Infrastructure", empId: "2352892", avatar: "https://i.pravatar.cc/150?img=33" },
    { id: "11", name: "Aishwarya Kulkarni", department: "Infrastructure", empId: "2352892", avatar: "https://i.pravatar.cc/150?img=44" },
    { id: "12", name: "Rahul Singh", department: "Infrastructure", empId: "2352892", avatar: "https://i.pravatar.cc/150?img=15" },
];

export default function SelectExecutiveModal({ 
    onClose, 
    selectedExecutives, 
    setSelectedExecutives 
}: SelectExecutiveModalProps) {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredExecutives = MOCK_EXECUTIVES.filter(exec => 
        exec.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const isAllSelected = filteredExecutives.length > 0 && 
        filteredExecutives.every(exec => selectedExecutives.some(s => s.id === exec.id));

    const handleSelectAll = () => {
        if (isAllSelected) {
            const filteredIds = filteredExecutives.map(e => e.id);
            setSelectedExecutives(selectedExecutives.filter(s => !filteredIds.includes(s.id)));
        } else {
            const newSelections = [...selectedExecutives];
            filteredExecutives.forEach(exec => {
                if (!newSelections.some(s => s.id === exec.id)) {
                    newSelections.push(exec);
                }
            });
            setSelectedExecutives(newSelections);
        }
    };

    const handleToggleExecutive = (exec: Executive) => {
        if (selectedExecutives.some(s => s.id === exec.id)) {
            setSelectedExecutives(selectedExecutives.filter(s => s.id !== exec.id));
        } else {
            setSelectedExecutives([...selectedExecutives, exec]);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 10 }}
                className="bg-white rounded-xl shadow-2xl w-full max-w-[480px] flex flex-col max-h-[80vh]"
            >
                <div className="p-5 border-b border-gray-100 flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-[#282828]">Select Executive</h2>
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={handleSelectAll}
                                className="bg-[#16284F] text-white text-xs font-semibold px-4 py-1.5 rounded-md hover:bg-[#0f1c38] transition-colors cursor-pointer"
                            >
                                {isAllSelected ? "Deselect All" : "Select All"}
                            </button>
                            <button onClick={onClose} className="text-gray-500 hover:text-gray-800 cursor-pointer">
                                <X size={20} weight="bold" />
                            </button>
                        </div>
                    </div>

                    <div className="relative">
                        <MagnifyingGlass size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#43C17A]" weight="bold" />
                        <input 
                            type="text" 
                            placeholder="Search by Executive Name" 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[#F5F5F5] border-none rounded-full pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#43C17A] placeholder-gray-400"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                    {filteredExecutives.map(exec => {
                        const isSelected = selectedExecutives.some(s => s.id === exec.id);
                        return (
                            <label 
                                key={exec.id} 
                                className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <img src={exec.avatar} alt={exec.name} className="w-10 h-10 rounded-full object-cover" />
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold text-[#282828]">{exec.name}</span>
                                        <span className="text-[13px] text-gray-500">
                                            <span className="text-[#43C17A] font-medium">{exec.department}</span> - ID {exec.empId}
                                        </span>
                                    </div>
                                </div>
                                <input 
                                    type="checkbox" 
                                    checked={isSelected}
                                    onChange={() => handleToggleExecutive(exec)}
                                    className="w-5 h-5 text-[#43C17A] border-2 border-gray-300 rounded focus:ring-[#43C17A] accent-[#43C17A] cursor-pointer" 
                                />
                            </label>
                        );
                    })}
                    
                    {filteredExecutives.length === 0 && (
                        <div className="text-center text-gray-500 py-10 text-sm">
                            No executives found matching "{searchTerm}"
                        </div>
                    )}
                </div>
                
                <div className="p-4 border-t border-gray-100 md:hidden">
                     <button 
                        onClick={onClose}
                        className="w-full bg-[#16284F] text-white py-3 rounded-md font-semibold transition-colors cursor-pointer"
                    >
                        Done
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}