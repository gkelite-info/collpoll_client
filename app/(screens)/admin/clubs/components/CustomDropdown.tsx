"use client";

import { Avatar } from "@/app/utils/Avatar";

export type UserOption = {
    id: string;
    name: string;
    avatar: string;
};

interface CustomDropdownProps {
    label: string;
    value: UserOption | null;
    options: UserOption[];
    isOpen: boolean;
    onToggle: () => void;
    onSelect: (user: UserOption) => void;
    direction?: "up" | "down";
}

export default function CustomDropdown({
    label,
    value,
    options,
    isOpen,
    onToggle,
    onSelect,
    direction = "down",
}: CustomDropdownProps) {
    return (
        <div className="relative custom-dropdown-container">
            <label className="block text-[15px] font-semibold text-[#282828] mb-2">{label}</label>
            <div
                onClick={onToggle}
                className="w-full border border-[#CCCCCC] rounded-lg px-3 py-2.5 bg-white flex items-center justify-between cursor-pointer hover:border-gray-300 transition-colors"
            >
                {value ? (
                    <div className="flex items-center gap-3">
                        <Avatar src={value.avatar} alt={value.name} size={28} />
                        <span className="text-sm font-semibold text-[#282828]">{value.name}</span>
                    </div>
                ) : (
                    <span className="text-sm text-gray-400 font-medium">Select {label}</span>
                )}
                <svg
                    className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
            </div>

            {isOpen && (
                <div
                    className={`absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto ${direction === "up" ? "bottom-full mb-1" : "top-full mt-1"
                        }`}
                >
                    {options.map((user) => (
                        <div
                            key={user.id}
                            onClick={() => {
                                onSelect(user);
                            }}
                            className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                            <Avatar src={user.avatar} alt={user.name} size={28} />
                            <span className="text-sm font-semibold text-[#282828]">{user.name}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}