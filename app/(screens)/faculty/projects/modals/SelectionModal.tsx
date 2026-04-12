import React from "react";
import { FaTimes } from "react-icons/fa";
import FacultyShimmer from "../shimmers/facultyShimmer";
import { Avatar } from "@/app/utils/Avatar";

interface SelectionItem {
    id: number;
    name: string;
    image?: string; // Optional image property
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
    if (!isOpen) return null;

    const handleSelectAll = () => {
        if (selectedIds.length === items.length) {
            onSelectionChange([]);
        } else {
            onSelectionChange(items.map((item) => item.id));
        }
    };

    const toggleItem = (id: number) => {
        if (selectedIds.includes(id)) {
            onSelectionChange(selectedIds.filter((itemId) => itemId !== id));
        } else {
            onSelectionChange([...selectedIds, id]);
        }
    };

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md m-4 overflow-hidden border border-gray-100">
                {/* Header */}
                <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-gray-800">{title}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-black p-1 hover:text-red-500 cursor-pointer">
                        <FaTimes />
                    </button>
                </div>

                {/* Select All */}
                <div className="p-4 bg-white border-b hover:bg-gray-50 transition-colors">
                    <label className="flex items-center justify-between cursor-pointer">
                        <span className="text-sm font-bold text-gray-700">Select All</span>
                        <input
                            type="checkbox"
                            className="w-5 h-5 accent-[#43C17A] cursor-pointer"
                            checked={selectedIds.length === items.length && items.length > 0}
                            onChange={handleSelectAll}
                        />
                    </label>
                </div>

                {/* List */}
                <div className="p-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-1 gap-3">
                        {isLoading ? (
                            // Render 5 shimmer rows while loading
                            Array.from({ length: 5 }).map((_, i) => <FacultyShimmer key={i} />)
                        ) :
                            <>
                                {items.map((item) => (
                                    <label key={item.id} className="flex items-center justify-between p-3 hover:bg-green-50 rounded-lg cursor-pointer transition-colors group">
                                        <div className="flex items-center gap-3">
                                            {/* Profile Picture / Avatar */}
                                            <Avatar
                                                src={item.image}
                                                alt={item.name}
                                                size={40}
                                            />

                                            <span className="text-sm font-medium text-gray-700 group-hover:text-green-700 transition-colors">
                                                {item.name}
                                            </span>
                                        </div>
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 accent-[#43C17A] cursor-pointer"
                                            checked={selectedIds.includes(item.id)}
                                            onChange={() => toggleItem(item.id)}
                                        />
                                    </label>
                                ))}
                            </>
                        }
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t bg-gray-50">
                    <button
                        onClick={onClose}
                        className="w-full bg-[#43C17A] text-white py-2.5 rounded-lg font-bold shadow-md cursor-pointer transition-all"
                    >
                        Confirm ({selectedIds.length} Selected)
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SelectionModal;