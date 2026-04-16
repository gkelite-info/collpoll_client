"use client";

import React, { useState, useMemo, useEffect } from "react";
import { FaTimes, FaSearch } from "react-icons/fa";
import FacultyShimmer from "../shimmers/facultyShimmer";
import { Avatar } from "@/app/utils/Avatar";

interface SelectionItem {
    id: number;
    name: string;
    image?: string;
}

interface SelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    items: SelectionItem[];
    selectedIds: number[];
    onSelectionChange: (ids: number[]) => void;
    isLoading: boolean;
}

const SelectionModal: React.FC<SelectionModalProps> = ({
    isOpen,
    onClose,
    title,
    items,
    selectedIds,
    onSelectionChange,
    isLoading
}) => {
    const [localSelectedIds, setLocalSelectedIds] = useState<number[]>([]);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        if (isOpen) {
            setLocalSelectedIds(selectedIds);
            setSearchQuery("");
        }
    }, [isOpen, selectedIds]);

    const filteredItems = useMemo(() => {
        return items.filter((item) =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [items, searchQuery]);

    if (!isOpen) return null;

    const handleSelectAll = () => {
        const allFilteredSelected = filteredItems.every(item => localSelectedIds.includes(item.id));
        if (allFilteredSelected) {
            const filteredIds = filteredItems.map(item => item.id);
            setLocalSelectedIds(localSelectedIds.filter(id => !filteredIds.includes(id)));
        } else {
            const newIds = Array.from(new Set([...localSelectedIds, ...filteredItems.map(item => item.id)]));
            setLocalSelectedIds(newIds);
        }
    };

    const toggleItem = (id: number) => {
        if (localSelectedIds.includes(id)) {
            setLocalSelectedIds(localSelectedIds.filter((itemId) => itemId !== id));
        } else {
            setLocalSelectedIds([...localSelectedIds, id]);
        }
    };

    const handleConfirm = () => {
        onSelectionChange(localSelectedIds);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md m-4 overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">

                <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-gray-800">{title}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-red-500 p-1 cursor-pointer transition-colors">
                        <FaTimes />
                    </button>
                </div>

                <div className="p-4 bg-white border-b">
                    <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                        <input
                            type="text"
                            placeholder={`Search ${title.toLowerCase()}...`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full text-[#282828] pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#43C17A] focus:ring-1 focus:ring-[#43C17A] transition-all"
                        />
                    </div>
                </div>

                <div className="px-4 py-3 bg-white border-b hover:bg-gray-50 transition-colors">
                    <label className="flex items-center justify-between cursor-pointer">
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-700">Select All</span>
                            <span className="text-[10px] text-gray-500">
                                {searchQuery ? `Matching: ${filteredItems.length}` : `Total: ${items.length}`}
                            </span>
                        </div>
                        <input
                            type="checkbox"
                            className="w-5 h-5 accent-[#43C17A] cursor-pointer"
                            checked={filteredItems.length > 0 && filteredItems.every(item => localSelectedIds.includes(item.id))}
                            onChange={handleSelectAll}
                        />
                    </label>
                </div>

                <div className="p-2 flex-grow overflow-y-auto custom-scrollbar min-h-[200px]">
                    <div className="grid grid-cols-1 gap-1">
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => <FacultyShimmer key={i} />)
                        ) : filteredItems.length > 0 ? (
                            filteredItems.map((item) => (
                                <label key={item.id} className="flex items-center justify-between p-3 hover:bg-green-50 rounded-lg cursor-pointer transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <Avatar src={item.image} alt={item.name} size={40} />
                                        <span className="text-sm font-medium text-gray-700 group-hover:text-green-700">
                                            {item.name}
                                        </span>
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 accent-[#43C17A] cursor-pointer"
                                        checked={localSelectedIds.includes(item.id)}
                                        onChange={() => toggleItem(item.id)}
                                    />
                                </label>
                            ))
                        ) : (
                            <div className="py-10 text-center text-gray-400 text-sm">No results found.</div>
                        )}
                    </div>
                </div>

                <div className="p-4 border-t bg-gray-50">
                    <button
                        onClick={handleConfirm}
                        className="w-full bg-[#43C17A] hover:bg-[#36a365] text-white py-2.5 rounded-lg font-bold shadow-md cursor-pointer transition-all active:scale-[0.98]"
                    >
                        Confirm ({localSelectedIds.length} Selected)
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SelectionModal;