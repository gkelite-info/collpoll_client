"use client";

import { updateStudentDiscussionMarks } from "@/lib/helpers/discussionForum/discussionFileUploadsAPI";
import { X, FilePdf } from "@phosphor-icons/react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

interface AddMarksModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: any;
  onSuccess: () => void;
}

export default function AddMarksModal({
  isOpen,
  onClose,
  student,
  onSuccess,
}: AddMarksModalProps) {
  const [marks, setMarks] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (student?.marksObtained) {
      setMarks(String(student.marksObtained));
    } else {
      setMarks("");
    }
  }, [student]);

  const handleSave = async () => {
    const numMarks = Number(marks);
    if (isNaN(numMarks) || numMarks < 0) {
      toast.error("Please enter a valid number");
      return;
    }

    if (numMarks > student.totalMarks) {
      toast.error(`Marks cannot exceed total marks (${student.totalMarks})`);
      return;
    }

    setIsSaving(true);
    try {
      const res = await updateStudentDiscussionMarks(
        student.studentId,
        student.discussionId,
        numMarks,
      );

      if (res.success) {
        toast.success("Marks saved successfully");
        onSuccess();
        onClose();
      } else {
        toast.error("Failed to save marks");
      }
    } catch (error) {
      toast.error("An error occurred while saving marks");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-[400px] p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-[#111827]">Add Marks</h2>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="text-[#000000] cursor-pointer disabled:opacity-50"
          >
            <X size={20} weight="regular" />
          </button>
        </div>

        <h3 className="text-[#43C17A] font-bold text-sm mb-4">
          {student.profiles?.full_name}
        </h3>

        <div className="grid grid-cols-[100px_1fr] gap-y-3 text-sm font-semibold text-[#282828] mb-8">
          <span>Student ID</span>
          <span className="font-medium text-gray-600">
            : {student.studentId}
          </span>

          <span>Submitted On</span>
          <span className="font-medium text-gray-600">
            : {new Date(student.submittedAt).toLocaleDateString()}
          </span>

          <span>Files</span>
          <span className="font-medium text-gray-600 flex flex-wrap items-center gap-1">
            :
            <span className="text-[#43C17A] font-bold ml-1">
              {student.files?.length || 0}
            </span>{" "}
            attached
          </span>
        </div>

        <div className="flex justify-center items-center gap-3 mb-8">
          <input
            type="number"
            value={marks}
            onChange={(e) => setMarks(e.target.value)}
            placeholder="0"
            min="0"
            max={student.totalMarks}
            className="w-20 h-14 bg-[#FFF1F1] text-[#16284F] text-2xl font-bold rounded-lg text-center outline-none focus:ring-2 focus:ring-[#43C17A]/50 transition-all"
          />
          <div className="w-20 h-14 bg-[#16284F] text-white text-2xl font-bold rounded-lg flex items-center justify-center">
            {student.totalMarks}
          </div>
        </div>

        <div className="flex justify-center gap-3 w-full">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="flex-1 py-2.5 cursor-pointer rounded-lg border border-[#7B7B7B] text-[#7B7B7B] font-bold text-sm disabled:opacity-50 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !marks}
            className="flex-1 py-2.5 cursor-pointer rounded-lg bg-[#43C17A] text-white font-bold text-sm disabled:opacity-50 hover:bg-[#34a362] transition-colors"
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
