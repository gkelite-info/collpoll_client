"use client";

import { Plus, CaretDown } from "@phosphor-icons/react";

interface ProjectCardProps {
  title: string;
  type: string;
  description: string;
  duration: string;
  tech: string;
  mentor: string;
  marks: string;
  status: string;
}

export default function ProjectCard({
  title,
  type,
  description,
  duration,
  tech,
  mentor,
  marks,
  status,
}: ProjectCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm relative">
      {/* HEADER */}
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-[#282828]">
          {title}
        </h3>

        {/* Completed pill */}
        <div className="flex items-center gap-1 h-7 px-3 rounded-full bg-[#43C17A]">
          <span className="text-sm font-medium text-[#FFFFFF]">
            {status}
          </span>
          <CaretDown size={12} className="text-[#ffffff]" />
        </div>
      </div>

      {/* TYPE PILL */}
      <div className="mb-3">
        <div className="inline-flex items-center h-7 px-3 rounded-full" style={{ backgroundColor: "#795FD924" }}>
          <span className="text-sm font-medium" style={{ color: "#795FD9" }}>
            {type}
          </span>
        </div>
      </div>

      {/* DESCRIPTION */}
      <p className="text-sm text-[#4B5563] mb-4">
        {description}
      </p>

      {/* DETAILS */}
      <div className="space-y-3 text-sm">
        {/* Duration */}
        <div className="flex items-center gap-4 ">
          <span className="w-[120px] font-medium text-[#282828]">
            Duration
          </span>
          <div
            className="
    inline-flex items-center
    h-[23px] px-[10px] py-[3px]
    rounded-md
  "
            style={{ backgroundColor: "#795FD924" }}
          >
            <span className="text-[13px] font-medium px-2 py-1" style={{ color: "#795FD9" }}>
              {duration}
            </span>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="flex items-start gap-4">
          <span className="w-[120px] font-medium text-[#282828]">
            Tech Stack
          </span>
          <span className="text-[#374151]">
            {tech}
          </span>
        </div>

        {/* Team Members */}
        <div className="flex items-center gap-4">
          <span className="w-[120px] font-medium text-[#282828]">
            Team Members
          </span>

          <div className="flex items-center gap-3">
            <div className="flex -space-x-2.5">
              {[10, 20, 30, 40, 50].map((seed, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 overflow-hidden shadow-sm"
                >
                  <img
                    src={`https://i.pravatar.cc/100?u=${name}${seed}`}
                    alt="faculty"
                    className="w-full h-full object-cover contrast-125"
                  />
                </div>
              ))}
            </div>

            <div className="h-7 px-3 rounded-full bg-[#43C17A1C] flex items-center">
              <span className="text-xs font-medium text-[#22C55E] cursor-pointer">
                See all
              </span>
            </div>
          </div>
        </div>

        {/* Mentor */}
        <div className="flex items-start gap-4">
          <span className="w-[120px] font-medium text-[#282828]">
            Mentor
          </span>
          <span className="text-[#374151]">
            {mentor}
          </span>
        </div>

        {/* Marks */}
        <div className="flex items-start gap-4">
          <span className="w-[120px] font-medium text-[#282828]">
            Marks
          </span>
          <span className="text-[#374151]">
            {marks}
          </span>
        </div>

        {/* Attachments */}
        <div className="flex items-start gap-4">
          <span className="w-[120px] font-medium text-[#282828]">
            Attachments
          </span>
          <a
            href="#"
            className="text-[#6B7280] truncate hover:underline"
          >
            https://ai-attendance-demo.vercel.app
          </a>
        </div>
      </div>

      {/* FLOATING PLUS */}
      <button className="absolute bottom-4 right-4 w-9 h-9 rounded-full bg-[#7C5CFF] flex items-center justify-center text-white">
        <Plus size={16} />
      </button>
    </div >
  );
}
