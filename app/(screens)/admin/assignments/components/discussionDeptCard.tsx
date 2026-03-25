"use client";
import { UserCircle } from "@phosphor-icons/react";
import { useRouter, useSearchParams } from "next/navigation";

interface FacultyItem {
  id: number;
  name: string;
}

interface Props {
  branchId?: number;
  yearId?: number;
  name: string;
  year: string;
  text: string;
  color: string;
  bgColor: string;
  activeText: string;
  activeCount: string | number;
  students: number;
  facultyList?: FacultyItem[];
}

export default function DiscussionDeptCard({
  branchId,
  yearId,
  name,
  year,
  text,
  color,
  bgColor,
  activeText,
  activeCount,
  students,
  facultyList = [],
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleViewDetails = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("dept", name);
    params.set("year", year);
    params.set("branchId", String(branchId));
    params.set("yearId", String(yearId));
    router.push(`?${params.toString()}`);
  };

  const displayAvatars = facultyList.slice(0, 4);
  const extraFaculty = facultyList.length > 4 ? facultyList.length - 4 : 0;

  return (
    <div
      className="bg-white rounded-[10px] p-4 shadow-[0_4px_20px_rgb(0,0,0,0.04)] border-l-[8px] flex flex-col"
      style={{ borderLeftColor: color }}
    >
      <div className="flex justify-between items-start mb-4">
        <h2
          className="text-[17px] font-bold tracking-tight truncate block"
          style={{ color: text }}
        >
          {name}
        </h2>
        <div
          className="flex items-center gap-1 px-3 py-1 rounded-full text-[12px] font-semibold"
          style={{ backgroundColor: bgColor, color: text }}
        >
          <span className="ml-1">{year}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <span className="text-[#282828] text-[13px] font-medium">
          Faculty -
        </span>

        {facultyList.length > 0 ? (
          <>
            <div className="flex -space-x-2.5">
              {displayAvatars.map((fac, index) => (
                <div
                  key={fac.id}
                  className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 overflow-hidden shadow-sm relative cursor-pointer"
                  title={fac.name}
                >
                  <img
                    src={`https://i.pravatar.cc/100?img=${(index * 3 + 12) % 70}`}
                    alt={fac.name}
                    className="w-full h-full object-cover contrast-125"
                  />
                </div>
              ))}
            </div>
            {extraFaculty > 0 && (
              <span className="text-gray-700 font-semibold text-sm ml-1">
                +{extraFaculty}
              </span>
            )}
          </>
        ) : (
          <span className="text-gray-400 text-xs italic">No faculty</span>
        )}
      </div>

      <div className="flex items-center justify-between mb-6">
        <p className="text-[#282828] text-[13px]">{activeText}</p>
        <div className="bg-[#D0EFDE] text-[12px] font-bold flex justify-center items-center text-[#43C17A] px-3 py-1 rounded-full">
          {activeCount}
        </div>
      </div>

      <div className="flex justify-between items-center mt-auto">
        <div className="flex items-center gap-2 text-[#282828] font-medium">
          <UserCircle size={28} className="text-[#43C17A]" weight="fill" />
          <span className="text-[13px]">{students} Students</span>
        </div>
        <button
          onClick={handleViewDetails}
          className="bg-[#16284F] cursor-pointer text-white px-5 py-1.5 rounded-md text-xs tracking-wide hover:bg-[#1a2f5c] transition-colors"
        >
          View Details
        </button>
      </div>
    </div>
  );
}
