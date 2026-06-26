import React, { useState } from "react";
import { X } from "@phosphor-icons/react";
import toast from "react-hot-toast";
import { updateProjectSubmissionMarks } from "@/lib/helpers/student/student_project_submissionsAPI";

interface AddMarksModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (marksObtained: number) => void;
  submission: {
    id: number;
    name: string;
    rollNo: string;
    submittedOn: string;
    totalMarks: number;
    obtainedMarks?: number | null;
  } | null;
}

export default function AddMarksModal({
  isOpen,
  onClose,
  onSave,
  submission,
}: AddMarksModalProps) {
  const [marks, setMarks] = useState<string>(
    submission?.obtainedMarks?.toString() || ""
  );
  const [isSaving, setIsSaving] = useState(false);

  React.useEffect(() => {
    if (submission) {
      setMarks(submission.obtainedMarks?.toString() || "");
    }
  }, [submission]);

  if (!isOpen || !submission) return null;

  const handleSave = async () => {
    const marksInt = parseInt(marks);
    if (isNaN(marksInt) || marksInt < 0) {
      toast.error("Please enter valid marks");
      return;
    }
    if (marksInt > submission.totalMarks) {
      toast.error(`Marks cannot exceed total marks (${submission.totalMarks})`);
      return;
    }

    setIsSaving(true);
    try {
      const { success, error } = await updateProjectSubmissionMarks(
        submission.id,
        marksInt
      );
      if (success) {
        toast.success("Marks saved successfully");
        onSave(marksInt);
      } else {
        toast.error("Failed to save marks");
      }
    } catch (err) {
      toast.error("Failed to save marks");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white rounded-3xl w-full max-w-sm p-6 relative shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 text-gray-500 hover:text-gray-800"
        >
          <X size={20} />
        </button>

        <h3 className="text-[#0d1b2a] text-xl font-bold mb-5">Add Marks</h3>

        <div className="space-y-3">
          <p className="text-[#38b000] font-bold">{submission.name}</p>

          <div className="grid grid-cols-[100px_1fr] gap-2 text-[15px] font-medium text-gray-800">
            <span>Student ID</span>
            <span>: {submission.rollNo}</span>

            <span>Submitted On</span>
            <span>: {submission.submittedOn}</span>

            <span>Files</span>
            <span>
              : <span className="text-[#38b000]">1</span> attached
            </span>
          </div>
        </div>

        <div className="flex justify-center items-center gap-4 mt-8 mb-8">
          <input
            type="number"
            value={marks}
            onChange={(e) => setMarks(e.target.value)}
            className="w-20 h-16 bg-[#fff0f3] text-[#0d1b2a] font-bold text-3xl text-center rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ffb3c1]"
          />
          <div className="w-20 h-16 bg-[#0d1b2a] text-white font-bold text-3xl flex items-center justify-center rounded-xl">
            {submission.totalMarks}
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 py-3 border border-gray-300 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 py-3 bg-[#38b000] rounded-xl font-bold text-white hover:bg-[#2b8a00] transition-colors disabled:opacity-70"
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
