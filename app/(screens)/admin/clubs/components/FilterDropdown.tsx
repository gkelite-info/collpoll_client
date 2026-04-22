import { CaretDown } from "@phosphor-icons/react";

interface FilterDropdownProps {
    id: string;
    label: string;
    options: string[];
    value: string | null;
    isOpen: boolean;
    onToggle: (id: string | null) => void;
    onChange: (val: string | null) => void;
}

export const FilterDropdown = ({ 
    id, 
    label, 
    options, 
    value, 
    isOpen, 
    onToggle, 
    onChange 
}: FilterDropdownProps) => (
    <div className="filter-dropdown relative flex items-center gap-2">
        <span className="text-[#525252] font-medium text-[15px]">
            {label} {label !== "Education Type" && ":"}
        </span>
        <div className="relative">
            <button
                onClick={() => onToggle(isOpen ? null : id)}
                className="bg-green-50 cursor-pointer text-[#43C17A] px-3 py-1.5 rounded-md flex items-center gap-2 hover:bg-green-100 transition-colors text-[14px] font-semibold min-w-[80px] justify-between"
            >
                {value || "All"} 
                <CaretDown 
                    size={14} 
                    weight="bold" 
                    className={`transition-transform ${isOpen ? "rotate-180" : ""}`} 
                />
            </button>
            {isOpen && (
                <div className="absolute top-full mt-1 left-0 bg-white shadow-xl border border-gray-100 rounded-md py-1 min-w-[120px] z-50">
                    <div 
                        className="px-4 py-2 hover:bg-green-50 hover:text-[#43C17A] cursor-pointer text-[14px] font-medium transition-colors" 
                        onClick={() => { onChange(null); onToggle(null); }}
                    >
                        All
                    </div>
                    {options.map(opt => (
                        <div 
                            key={opt} 
                            className="px-4 py-2 hover:bg-green-50 hover:text-[#43C17A] cursor-pointer text-[14px] font-medium transition-colors" 
                            onClick={() => { onChange(opt); onToggle(null); }}
                        >
                            {opt}
                        </div>
                    ))}
                </div>
            )}
        </div>
    </div>
);