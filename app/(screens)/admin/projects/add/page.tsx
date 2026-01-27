"use client";

import React from "react";
import { Plus } from "@phosphor-icons/react";
import ProjectsHeader from "../compounents/ProjectsHeader";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";

const inputStyle =
  "w-full h-[42px] px-3 border border-gray-300 rounded-lg text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#22C55E]/20";

export default function AddProjectPage() {
  return (
    <div className="p-6 flex justify-center bg-[#F5F6FA] min-h-screen">
      <div className="w-full max-w-[980px]">

        {/* HEADER */}
        <div className="flex justify-between ">
        <ProjectsHeader
          title="Projects"
          subtitle="Create, manage, and track student projects effortlessly."
        />

        {/* Right side date card */}
        <div className="w-[350px]">
          <CourseScheduleCard />
        </div>

        </div>



        {/* CARD */}
        <div className="bg-white rounded-2xl p-8 shadow-[0_6px_24px_rgba(0,0,0,0.08)] space-y-6 text-sm">

          {/* Project Title + Domain */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="font-medium text-[#282828]">Project Title</label>
              <input
                className={`${inputStyle} mt-2`}
                placeholder="Smart Attendance System using Face Recognition"
              />
            </div>

            <div>
              <label className="font-medium text-[#282828]">Domain</label>
              <select className={`${inputStyle} mt-2`}>
                <option>Select Domain</option>
                <option>AI / ML</option>
                <option>Web Development</option>
                <option>Data Science</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="font-medium text-[#282828]">Description</label>
            <textarea
              className={`${inputStyle} h-[90px] resize-none mt-2 
    pt-[30px] leading-normal`}
              placeholder="Develop a system that automates student attendance using facial recognition."
            />

          </div>

          {/* Skills + Marks */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="font-medium text-[#282828]">Skills Required</label>
              <div className="flex items-center gap-2 flex-wrap border border-[#D0D5DD] rounded-lg px-3 py-2 min-h-[42px] mt-2 text-black">
                {["Python", "OpenCV", "React"].map((skill) => (
                  <span
                    key={skill}
                    className="px-3 h-7 rounded-full bg-[#EEF2FF] text-[#4F46E5] text-xs flex items-center border border-[#C7D2FE]"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="font-medium text-[#282828]">Marks</label>
              <input className={`${inputStyle} mt-2`} placeholder="10" />
            </div>
          </div>

          {/* Team + Mentor */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="font-medium text-[#282828]">Team Members</label>
              <div className="mt-2 flex items-center gap-3 border border-[#D0D5DD] rounded-lg px-3 py-2 min-h-[42px]">
                <button className="w-7 h-7 rounded-full bg-[#22C55E] flex items-center justify-center text-white">
                  <Plus size={14} />
                </button>
                <div className="flex -space-x-2.5">
                  {[10, 20, 30, 40, 50].map((seed, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 overflow-hidden shadow-sm"
                    >
                      <img
                       src={`https://i.pravatar.cc/100?u=member-${seed}`}
                        alt="faculty"
                        className="w-full h-full object-cover contrast-125"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="font-medium text-[#282828]">Mentor / Guide</label>
              <div className="mt-2 flex items-center gap-2 border border-[#D0D5DD] rounded-lg px-3 py-2 min-h-[42px]">
                <img
                  src="https://i.pravatar.cc/100?u=mentor"
                  className="w-7 h-7 rounded-full"
                />
                <span className="text-[#111827]">Dr. Anjani Verma</span>
              </div>
            </div>
          </div>

          {/* Duration + Type */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="font-medium text-[#282828]">Duration</label>
              <div className="flex gap-2">
                <input className={`${inputStyle} mt-2`} placeholder="From (DD/MM/YYYY)" />
                <input className={`${inputStyle} mt-2`} placeholder="To (DD/MM/YYYY)" />
              </div>
            </div>

            <div>
              <label className="font-medium text-[#282828]">Project Type</label>
              <select className={`${inputStyle} mt-2`}>
                <option>Select Project Type</option>
                <option>Mini Project</option>
                <option>Major Project</option>
              </select>
            </div>
          </div>

          {/* Upload */}
          <div>
            <label className="font-medium text-[#282828]">Upload Your File</label>
            <div className="mt-2 border-2 border-dashed border-[#D0D5DD] rounded-xl p-10 text-center">
              <p className="text-[#6B7280] mb-2">Drag & Drop Your File here or</p>
              <button className="px-4 py-2 border border-[#D0D5DD] rounded-lg text-black">
                Browse Files
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-center gap-4 pt-6">
            <button className="px-12 h-10 rounded-lg bg-[#22C55E] text-white font-medium">
              Save
            </button>
            <button className="px-12 h-10 rounded-lg border border-[#D0D5DD] text-black">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
