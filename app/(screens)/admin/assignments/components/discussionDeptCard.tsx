"use client";
import { User, UserCircle } from "@phosphor-icons/react";
import { useRouter, useSearchParams } from "next/navigation";

interface FacultyItem {
  id: number;
  name: string;
}

interface Props {
  name: string;
  year: string;
  text: string;
  color: string;
  bgColor: string;
  activeText: string;
  activeCount: string | number;
  students: number;
  yearId: number;
  branchId: number;
  facultyCount: number;
  facultyPhotos?: string[];
}

export default function DiscussionDeptCard({
  name,
  year,
  text,
  color,
  bgColor,
  activeText,
  activeCount,
  students,
  yearId,
  branchId,
  facultyCount,
  facultyPhotos = []
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleViewDetails = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("dept", name);
    params.set("year", year);
    params.set("yearId", String(yearId));
    params.set("branchId", String(branchId));
    router.push(`?${params.toString()}`);
  };

  // const displayAvatars = facultyList.slice(0, 4);
  // const extraFaculty = facultyList.length > 4 ? facultyList.length - 4 : 0;

  const displayCount = Math.min(facultyCount, 4);

  const facultyIcons = Array.from({ length: Math.min(facultyCount, 4) }, (_, i) => i + 1);

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
          {/* <span>Year</span> */}
          <span className="ml-1">{year}</span>
        </div >
      </div >

      <div className="flex items-center gap-2 mb-4">
        <span className="text-[#282828] text-[13px] font-medium">Faculty -</span>
        {/* <div className="flex -space-x-2.5">
          {mockFaculty.map((fac) => (
            <div
              key={fac}
              className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 overflow-hidden shadow-sm relative"
            >
              <img
                // src={`https://i.pravatar.cc/100?img=${fac + Math.floor(Math.random() * 10)}`}
                src={`https://i.pravatar.cc/100?img=${(fac * 3) % 70}`}
                alt="faculty"
                className="w-full h-full object-cover contrast-125"
              />
            </div>
          ))}
        </div> */}
        {facultyCount > 0 ? (
          <>
            <div className="flex -space-x-2.5">
              {Array.from({ length: displayCount }).map((_, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 overflow-hidden shadow-sm relative flex items-center justify-center"
                >
                  {facultyPhotos[i] ? (
                    <img
                      src={facultyPhotos[i]}
                      alt="faculty"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={18} weight="bold" className="text-gray-500" />
                  )}
                </div>
              ))}
            </div>
            <span className="text-gray-700 font-semibold text-sm ml-1">
              {facultyCount > 4 ? `+${facultyCount - 4}` : facultyCount}
            </span>
          </>
        ) : (
          <span className="text-gray-400 text-[12px] italic">No faculty assigned</span>
        )}
        {/* <span className="text-gray-700 font-semibold text-sm ml-1">{facultyCount}</span> */}
      </div >

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
          className="bg-[#16284F] cursor-pointer text-white lg:px-3 lg:py-1.5 rounded-md text-xs tracking-wide transition-colors"
        >
          View Details
        </button>
      </div>
    </div >
  );
}
