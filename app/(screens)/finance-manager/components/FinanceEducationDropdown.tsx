import { useFinanceManager } from "@/app/utils/context/financeManager/useFinanceManager";
import { CaretDown } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";

export default function FinanceEducationDropdown() {
  const {
    collegeEducationTypes,
    collegeEducationIds,
    collegeEducationType,
    collegeEducationId,
    setEducation,
  } = useFinanceManager();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!collegeEducationTypes || collegeEducationTypes.length === 0) {
    return null;
  }

  const handleSelect = (index: number) => {
    const id = collegeEducationIds[index];
    const type = collegeEducationTypes[index];
    if (id && type) {
      setEducation(id, type);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg border border-[#E5E5E5] bg-white px-4 py-2 text-sm font-medium text-[#282828] shadow-sm transition-colors hover:bg-gray-50 focus:outline-none"
      >
        <span>{collegeEducationType || "Select Education"}</span>
        <CaretDown
          size={16}
          weight="bold"
          className={`text-[#714EF2] transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-1 w-full min-w-[160px] rounded-lg border border-[#E5E5E5] bg-white py-1 shadow-lg">
          {collegeEducationTypes.map((type, index) => (
            <button
              key={collegeEducationIds[index] || index}
              type="button"
              onClick={() => handleSelect(index)}
              className={`w-full px-4 py-2 text-left text-sm transition-colors hover:bg-[#F9F9F9] ${
                collegeEducationType === type
                  ? "bg-[#F4F4F4] font-semibold text-[#714EF2]"
                  : "text-[#282828]"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
