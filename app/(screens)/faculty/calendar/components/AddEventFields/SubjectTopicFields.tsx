"use client";

import React, { useRef, useEffect } from "react";
import { CaretDown } from "@phosphor-icons/react";
import { ModalSelect } from "./ModalSelect";

interface SubjectTopicFieldsProps {
  calendarMode: "single" | "bulk";
  subjects: any[];
  subjectId?: number;
  setSubjectId: (id: number) => void;
  subject: string;
  setSubject: (name: string) => void;
  topicId: number | null;
  setTopicId: (id: number | null) => void;
  topics: any[];
  unitIds: number[];
  setUnitIds: (ids: number[] | ((prev: number[]) => number[])) => void;
  units: any[];
  isUnitOpen: boolean;
  setIsUnitOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  INPUT_HEIGHT: string;
}

const SubjectTopicFields: React.FC<SubjectTopicFieldsProps> = ({
  calendarMode,
  subjects,
  subjectId,
  setSubjectId,
  subject,
  setSubject,
  topicId,
  setTopicId,
  topics,
  unitIds,
  setUnitIds,
  units,
  isUnitOpen,
  setIsUnitOpen,
  INPUT_HEIGHT,
}) => {
  const [isSubjectFocused, setIsSubjectFocused] = React.useState(false);
  const [isTopicFocused, setIsTopicFocused] = React.useState(false);
  const unitDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleDropdownClose = (e: MouseEvent) => {
      if (isUnitOpen && unitDropdownRef.current && !unitDropdownRef.current.contains(e.target as Node)) {
        setIsUnitOpen(false);
      }
    };
    document.addEventListener("mousedown", handleDropdownClose);
    return () => document.removeEventListener("mousedown", handleDropdownClose);
  }, [isUnitOpen, setIsUnitOpen]);

  return (
    <div className={calendarMode === "bulk" ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "space-y-5"}>
      <div className="flex-1 space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          Subject <span className="text-red-500">*</span>
        </label>

        {subjects.length <= 1 ? (
          <input
            type="text"
            readOnly
            value={subjects.find((s) => s.collegeSubjectId === subjectId)?.subjectName || subject || ""}
            placeholder="Select Subject"
            className={`w-full ${INPUT_HEIGHT} border border-[#C9C9C9] rounded-lg px-3 bg-gray-50 text-gray-900 cursor-not-allowed outline-none placeholder:text-gray-400`}
          />
        ) : (
            <ModalSelect
              value={subjectId}
              options={subjects.map((s) => ({ value: s.collegeSubjectId, label: s.subjectName }))}
              onChange={(val) => {
                setSubjectId(Number(val));
                setSubject(subjects.find((s) => s.collegeSubjectId === Number(val))?.subjectName || "");
                setTopicId(null);
              }}
              placeholder="Select Subject"
              INPUT_HEIGHT={INPUT_HEIGHT}
            />
        )}
      </div>

      <div className="flex-1 space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          {calendarMode === "bulk" ? "Unit" : "Topic"} <span className="text-red-500">*</span>
        </label>

        {calendarMode === "bulk" ? (
          <div className="relative" ref={unitDropdownRef}>
            <div
              onClick={() => setIsUnitOpen((p) => !p)}
              className={`w-full ${INPUT_HEIGHT} border rounded-lg px-3 text-sm cursor-pointer flex items-center justify-between transition-all ${unitIds.length === 0 ? "bg-white border-[#C9C9C9] text-gray-400 focus:ring-2 focus:ring-[#43C17A]" : "bg-emerald-50 border-emerald-500 text-emerald-700 font-semibold focus:ring-2 focus:ring-emerald-500"}`}
            >
              <span>
                {unitIds.length === 0
                  ? "Select Units"
                  : units.filter((u) => unitIds.includes(u.collegeSubjectUnitId)).map((u) => `Unit ${u.unitNumber}`).join(", ")}
              </span>
              <CaretDown
                size={16}
                weight="bold"
                className={`transition-transform duration-200 ${isUnitOpen ? "rotate-180" : "rotate-0"} ${unitIds.length === 0 ? "text-gray-400" : "text-emerald-700"}`}
              />
            </div>

            {isUnitOpen && (
              <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-md max-h-48 overflow-y-auto">
                {units.map((u) => {
                  const checked = unitIds.includes(u.collegeSubjectUnitId);
                  return (
                    <label key={u.collegeSubjectUnitId} className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          setUnitIds((prev) =>
                            checked ? prev.filter((id) => id !== u.collegeSubjectUnitId) : [...prev, u.collegeSubjectUnitId]
                          );
                        }}
                        className="accent-emerald-500"
                      />
                      <span className="text-sm text-gray-700">Unit {u.unitNumber}: {u.unitTitle}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          topics.length === 0 ? (
            <input
              type="text"
              readOnly
              value={topics.find((t) => t.collegeSubjectUnitTopicId === topicId)?.topicTitle || ""}
              placeholder="Select Topic"
              className={`w-full ${INPUT_HEIGHT} border border-[#C9C9C9] rounded-lg px-3 bg-gray-50 text-gray-900 cursor-not-allowed outline-none placeholder:text-gray-400`}
            />
          ) : (
            <ModalSelect
              value={topicId}
              options={topics.map((t) => ({ value: t.collegeSubjectUnitTopicId, label: t.topicTitle }))}
              onChange={(val) => setTopicId(Number(val))}
              placeholder="Select Topic"
              INPUT_HEIGHT={INPUT_HEIGHT}
            />
          )
        )}
      </div>
    </div>
  );
};

export default SubjectTopicFields;
