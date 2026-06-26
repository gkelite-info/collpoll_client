"use client";

import { useState, useEffect } from "react";
import { X } from "@phosphor-icons/react";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabaseClient";

export type TaskPayload = {
  title: string;
  description: string;
  dueDate: string;
  dueTime: string;
  collegeAcademicYearId?: number | null;
  collegeSectionsId?: number | null;
};

type TaskModalProps = {
  open: boolean;
  role?: "faculty" | "student";
  collegeSubjectId?: number;
  facultyId?: number;
  studentId?: number;
  onClose: () => void;

  defaultValues?: {
    facultyTaskId: number;
    title: string;
    description: string;
    time: string;
    date: string;
    collegeAcademicYearId?: number | null;
    collegeSectionsId?: number | null;
  } | null;

  onSave: (
    payload: {
      title: string;
      description: string;
      dueDate: string;
      dueTime: string;
      collegeAcademicYearId?: number | null;
      collegeSectionsId?: number | null;
    },
    taskId?: number,
  ) => Promise<void>;
};

const getWordCount = (text: string) => {
  return text.trim().split(/\s+/).filter(Boolean).length;
};

export default function TaskModal({
  open,
  role,
  collegeSubjectId,
  facultyId,
  studentId,
  onClose,
  onSave,
  defaultValues,

}: TaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [saving, setSaving] = useState(false);

  const [selectedYearId, setSelectedYearId] = useState<string>("");
  const [selectedSectionId, setSelectedSectionId] = useState<string>("");
  const [academicYears, setAcademicYears] = useState<{ id: number; name: string }[]>([]);
  const [allSections, setAllSections] = useState<any[]>([]);

  useEffect(() => {
    if (defaultValues?.facultyTaskId) {
      setTitle(defaultValues.title);
      setDescription(defaultValues.description);
      setDueTime(defaultValues.time);

      setDueDate(defaultValues.date ?? new Date().toISOString().split("T")[0]);
      setSelectedYearId(defaultValues.collegeAcademicYearId ? String(defaultValues.collegeAcademicYearId) : "");
      setSelectedSectionId(defaultValues.collegeSectionsId ? String(defaultValues.collegeSectionsId) : "");
    } else {
      setTitle("");
      setDescription("");
      setDueDate("");
      setDueTime("");
      setSelectedYearId("");
      setSelectedSectionId("");
    }
  }, [defaultValues]);

  useEffect(() => {
    if (!open || role !== "faculty" || !facultyId || !collegeSubjectId) {
      setAcademicYears([]);
      setAllSections([]);
      return;
    }

    const fetchYearsAndSections = async () => {
      try {
        const { data, error } = await supabase
          .from("faculty_sections")
          .select(`
            collegeSectionsId,
            collegeAcademicYearId,
            college_sections:collegeSectionsId!inner (
              collegeSections
            ),
            college_academic_year:collegeAcademicYearId!inner (
              collegeAcademicYear
            )
          `)
          .eq("facultyId", facultyId)
          .eq("collegeSubjectId", collegeSubjectId)
          .eq("isActive", true)
          .is("deletedAt", null);

        if (error) throw error;

        if (data) {
          const uniqueSectionsMap = new Map();
          data.forEach((item: any) => {
            if (!uniqueSectionsMap.has(item.collegeSectionsId)) {
              uniqueSectionsMap.set(item.collegeSectionsId, item);
            }
          });
          const uniqueSections = Array.from(uniqueSectionsMap.values());
          setAllSections(uniqueSections);

          const yearsMap = new Map();
          uniqueSections.forEach((item: any) => {
            const yId = item.collegeAcademicYearId;
            const yName = Array.isArray(item.college_academic_year)
              ? item.college_academic_year[0]?.collegeAcademicYear
              : item.college_academic_year?.collegeAcademicYear;
            if (yId && yName) {
              yearsMap.set(yId, { id: yId, name: yName });
            }
          });
          setAcademicYears(Array.from(yearsMap.values()));
        }
      } catch (err) {
        console.error("Error fetching years and sections for task modal:", err);
      }
    };

    fetchYearsAndSections();
  }, [open, role, facultyId, collegeSubjectId]);

  if (!open) return null;

  const handleCancel = () => {
    setTitle("");
    setDescription("");
    setDueDate("");
    setDueTime("");
    setSelectedYearId("");
    setSelectedSectionId("");

    onClose();
  };
  const handleSave = async () => {
    // if (!onSave) {
    //   toast.error("Save action is not configured.");
    //   return;
    // }

    if (!title.trim()) {
      toast.error("Task title is required.");
      return;
    }

    if (!description.trim()) {
      toast.error("Description is required.");
      return;
    }

    if (role === "faculty") {
      if (!selectedYearId) {
        toast.error("Please select an academic year.");
        return;
      }
      if (!selectedSectionId) {
        toast.error("Please select a section.");
        return;
      }
    }

    if (!dueDate) {
      toast.error("Please select a date.");
      return;
    }

    if (!dueTime) {
      toast.error("Please select a time.");
      return;
    }

    try {
      setSaving(true);

      await onSave({
        title: title.trim(),
        description: description.trim(),
        dueDate,
        dueTime,
        collegeAcademicYearId: selectedYearId ? Number(selectedYearId) : null,
        collegeSectionsId: selectedSectionId ? Number(selectedSectionId) : null,
      },
        defaultValues?.facultyTaskId,
      );

      toast.success(
        defaultValues
          ? "Task updated successfully"
          : "Task created successfully",
      );

      handleCancel();
    } catch {
      toast.error("Failed to save task");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-[1000000]">
      <div className="bg-white rounded-lg shadow-xl p-6 lg:w-[450px] animate-fadeIn relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-[#282828]">
            {defaultValues ? "Edit Task" : "Add Task"}
          </h2>

          <button onClick={onClose}>
            <X
              size={24}
              weight="bold"
              className="text-[#282828] cursor-pointer"
            />
          </button>
        </div>

        <div className="flex flex-col mb-3 text-left">
          <label className="text-sm font-medium mb-1 text-[#282828]">
            Task Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Enter task title"
            value={title}
            onChange={(e) => {
              const value = e.target.value;
              if (/^[A-Za-z0-9\s]*$/.test(value)) {
                setTitle(value);
              }
            }}
            className="border rounded-md px-3 py-2 text-sm outline-none text-[#282828]"
          />
        </div>

        <div className="flex flex-col mb-5 text-left">
          <label className="text-sm font-medium mb-1 text-[#282828]">
            Description / Notes <span className="text-red-500">*</span>
          </label>
          <textarea
            placeholder="Enter task description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm h-[80px] resize-none outline-none text-[#282828]"
          />
        </div>

        {role === "faculty" && (
          <div className="flex gap-3 mb-5">
            <div className="flex flex-col w-1/2 text-left">
              <label className="text-sm font-medium mb-1 text-[#282828]">
                Academic Year <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedYearId}
                onChange={(e) => {
                  setSelectedYearId(e.target.value);
                  setSelectedSectionId("");
                }}
                className="border rounded-md px-3 py-2 text-sm outline-none text-[#282828] bg-white cursor-pointer"
              >
                <option value="">Select Year</option>
                {academicYears.map((year) => (
                  <option key={year.id} value={year.id}>
                    {year.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col w-1/2 text-left">
              <label className="text-sm font-medium mb-1 text-[#282828]">
                Section <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedSectionId}
                onChange={(e) => setSelectedSectionId(e.target.value)}
                disabled={!selectedYearId}
                className="border rounded-md px-3 py-2 text-sm outline-none text-[#282828] bg-white cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">Select Section</option>
                {Array.from(
                  new Map(
                    allSections
                      .filter((item) => String(item.collegeAcademicYearId) === selectedYearId)
                      .map((item) => {
                        const secName = Array.isArray(item.college_sections)
                          ? item.college_sections[0]?.collegeSections
                          : item.college_sections?.collegeSections;
                        return [secName, item];
                      })
                  ).values()
                ).map((item: any) => {
                  const secId = item.collegeSectionsId;
                  const secName = Array.isArray(item.college_sections)
                    ? item.college_sections[0]?.collegeSections
                    : item.college_sections?.collegeSections;
                  return (
                    <option key={secId} value={secId}>
                      {secName}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        )}

        <h3 className="text-sm font-semibold text-[#282828] mb-2">Schedule</h3>

        <div className="flex gap-3 mb-5">
          <div className="flex flex-col w-1/2 text-left">
            <label className="text-sm font-medium mb-1 text-[#282828]">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              min={new Date().toISOString().split("T")[0]}
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm outline-none text-[#282828]"
            />
          </div>

          <div className="flex flex-col w-1/2 text-left">
            <label className="text-sm font-medium mb-1 text-[#282828]">
              Time <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              value={dueTime}
              onChange={(e) => setDueTime(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm outline-none text-[#282828]"
            />
          </div>
        </div>

        <div className="flex justify-between gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className={`w-1/2 py-2 rounded-md text-sm cursor-pointer ${saving
              ? "bg-[#A7DDBE] text-white cursor-not-allowed"
              : "bg-[#43C17A] text-white"
              }`}
          >
            {saving ? "Saving..." : "Save task"}
          </button>

          <button
            className="w-1/2 border py-2 rounded-md text-sm text-[#282828] cursor-pointer"
            onClick={handleCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
