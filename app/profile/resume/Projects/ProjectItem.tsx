"use client";

import { useState, useRef } from "react";
import { Trash } from "@phosphor-icons/react";
import toast from "react-hot-toast";
import Field from "./Field";
import { upsertResumeProject } from "@/lib/helpers/student/Resume/resumeProjectsAPI";
import { useUser } from "@/app/utils/context/UserContext";

export interface ProjectData {
  projectName: string;
  domain: string;
  startDate: string;
  endDate: string;
  tools: string[];
  projectLink: string;
  description: string;
  isSubmitted: boolean;
  dbId?: number;
}

interface Props {
  index: number;
  data: ProjectData;
  onUpdate: (data: ProjectData) => void;
  onDelete?: () => void;
  isDeleting?: boolean;
}

function FieldLabel({ label, required }: { label: string; required?: boolean }) {
  return (
    <label className="form-label font-medium text-[#282828]">
      {label}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

export default function ProjectItem({ index, data, onUpdate, onDelete, isDeleting }: Props) {
  const { studentId } = useUser();
  const [search, setSearch] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async () => {
    if (!studentId) {
      toast.error("Student ID not found. Please refresh.");
      return;
    }
    if (!data.projectName.trim() || !data.domain.trim() || !data.startDate) {
      toast.error("Please fill all required fields");
      return;
    }

    setIsSaving(true);
    try {
      const result = await upsertResumeProject({
        resumeProjectId: data.dbId,
        studentId,
        projectName: data.projectName,
        domain: data.domain,
        startDate: data.startDate,
        endDate: data.endDate || null,
        projectUrl: data.projectLink || null,
        toolsAndTechnologies: data.tools,
        description: data.description || null,
      });

      onUpdate({ ...data, isSubmitted: true, dbId: result.resumeProjectId });
      toast.success(data.dbId ? `Project ${index + 1} updated` : `Project ${index + 1} saved`);
    } catch (err: any) {
      console.error("Project save error:", err);
      toast.error(`Failed to save: ${err.message || "Unknown error"}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mb-12">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium text-[#282828]">Project {index + 1}</h3>
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            disabled={isDeleting}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors cursor-pointer"
          >
            {isDeleting ? (
              <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Trash size={18} />
            )}
          </button>
        )}
      </div>

      {/* Row 1: Project Name | Domain | Start Date | End Date */}
      <div className="grid grid-cols-2 gap-4">
        <Field
          label="Project Name"
          required
          type="text"
          value={data.projectName}
          placeholder="Enter Project Name"
          onChange={(v) => onUpdate({ ...data, projectName: v, isSubmitted: false })}
        />
        <Field
          label="Domain"
          required
          type="text"
          value={data.domain}
          placeholder="Enter Domain"
          onChange={(v) => onUpdate({ ...data, domain: v, isSubmitted: false })}
        />
        <Field
          label="Start Date"
          required
          type="date"
          value={data.startDate}
          onChange={(v) => onUpdate({ ...data, startDate: v, isSubmitted: false })}
        />

        {/* End Date - optional */}
        <div className="flex flex-col">
          <FieldLabel label="End Date" />
          <input
            type="date"
            value={data.endDate}
            onChange={(e) => onUpdate({ ...data, endDate: e.target.value, isSubmitted: false })}
            className="border border-[#CCCCCC] text-[#525252] rounded-md px-3 h-10 py-1 focus:outline-none cursor-pointer"
          />
        </div>
      </div>

      {/* Row 2: Tools | Project Link */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">

        {/* Tools & Technologies - free text input */}
        <div className="flex flex-col" ref={containerRef}>
          <FieldLabel label="Tools & Technologies Used" />
          <div
            className="flex items-center flex-wrap gap-2 border border-[#CCCCCC] rounded-md px-3 py-2 min-h-[40px] cursor-text mt-1"
            onClick={() => containerRef.current?.querySelector('input')?.focus()}
          >
            {data.tools.map((tool) => (
              <span
                key={tool}
                className="flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-sm text-[#525252] whitespace-nowrap"
              >
                {tool}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdate({
                      ...data,
                      tools: data.tools.filter((t) => t !== tool),
                      isSubmitted: false,
                    });
                  }}
                  className="text-gray-400 hover:text-black ml-1"
                >
                  ✕
                </button>
              </span>
            ))}
            <input
              className="flex-1 outline-none text-sm min-w-[120px] text-[#525252]"
              placeholder={data.tools.length ? "" : "Type and press Enter to add"}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if ((e.key === "Enter" || e.key === ",") && search.trim()) {
                  e.preventDefault();
                  const val = search.trim().replace(/,$/, "");
                  if (val && !data.tools.includes(val)) {
                    onUpdate({ ...data, tools: [...data.tools, val], isSubmitted: false });
                  }
                  setSearch("");
                }
                if (e.key === "Backspace" && !search && data.tools.length) {
                  onUpdate({ ...data, tools: data.tools.slice(0, -1), isSubmitted: false });
                }
              }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">Press Enter or comma to add a technology</p>
        </div>

        <Field
          label="Project Link / GitHub"
          type="text"
          value={data.projectLink}
          placeholder="Enter Project Link"
          onChange={(v) => onUpdate({ ...data, projectLink: v, isSubmitted: false })}
        />
      </div>

      {/* Description - optional */}
      <div className="mt-4 flex flex-col">
        <FieldLabel label="Short Description" />
        <textarea
          rows={4}
          maxLength={500}
          className="border border-[#CCCCCC] rounded-md px-3 py-1 focus:outline-none resize-none mt-1"
          value={data.description}
          onChange={(e) => onUpdate({ ...data, description: e.target.value, isSubmitted: false })}
        />
        <div className="text-right text-xs text-gray-400">{data.description.length}/500</div>
      </div>

      {/* Submit */}
      <div className="flex justify-end mt-4">
        <button
          onClick={handleSubmit}
          disabled={isSaving}
          className={`px-6 py-1.5 rounded-md text-sm font-medium text-white bg-[#43C17A] ${
            isSaving ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
          }`}
        >
          {isSaving ? "Saving..." : data.isSubmitted ? "Saved ✓" : "Submit Project"}
        </button>
      </div>
    </div>
  );
}