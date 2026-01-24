"use client";

import { UsersThree } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";

export interface Department {
  name: string;
  text: string;
  color: string;
  bgColor: string;
  studentTeams: number;
  facultyGuides: number;
  projectsCount: number;
  lastUpdate: string;
}

const FacultyAcademicCard = ({
  name,
  text,
  color,
  bgColor,
  studentTeams,
  facultyGuides,
  projectsCount,
  lastUpdate,
}: Department) => {
  const router = useRouter();

  return (
    <div
      className="bg-white rounded-xl p-5 shadow-[0_6px_24px_rgba(0,0,0,0.06)] border-l-[8px]"
      style={{ borderLeftColor: color }}
    >
      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold" style={{ color: text }}>
          {name}
        </h2>

        <div className="flex items-center gap-1 text-sm font-medium text-[#282828]">
          <UsersThree size={18} weight="fill" className="text-[#22C55E]" />
          Student Teams: {studentTeams}
        </div>
      </div>

      {/* FACULTY GUIDES */}
      <div className="flex items-center gap-2 text-sm text-[#282828] mb-3">
        <span className="whitespace-nowrap">
          Faculty Guides - {facultyGuides}
        </span>

        <div className="flex -space-x-2 ml-2">
          {[1, 2, 3, 4].map((i) => (
            <img
              key={i}
              src={`https://i.pravatar.cc/40?img=${i}`}
              className="w-7 h-7 rounded-full border-2 border-white"
              alt="faculty"
            />
          ))}
        </div>

        <span className="text-sm font-semibold ml-1">+08</span>
      </div>

      {/* PROJECTS */}
      <div className="flex items-center gap-2 text-sm text-[#282828] mb-4">
        Projects -
        <span
          className="px-3 py-0.5 rounded-full text-sm font-medium"
          style={{ backgroundColor: bgColor, color: text }}
        >
          {projectsCount}
        </span>
      </div>

      {/* FOOTER ROW (Last Update + Button aligned) */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-[#282828]">
          Last Update - {lastUpdate}
        </p>

        <button
          onClick={() =>
            router.push(`/admin/projects/${encodeURIComponent(name)}`)
          }
          className="
            bg-[#16284F] text-white 
            w-[140px] h-[36px]
            rounded-md text-sm
            hover:bg-[#253b66] cursor-pointer
          "
          style={{width:"100px"}}
        >
          View Project
        </button>
      </div>
    </div>
  );
};

export default FacultyAcademicCard;
