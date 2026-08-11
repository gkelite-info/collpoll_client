import React, { useEffect, useState } from "react";
import { X } from "@phosphor-icons/react";
import toast from "react-hot-toast";
import { updateProjectSubmissionMarks } from "@/lib/helpers/student/student_project_submissionsAPI";
import { useMutation, useQueryClient } from "@tanstack/react-query";

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
    projectId?: number | null;
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

  useEffect(() => {
    if (submission) {
      setMarks(submission.obtainedMarks?.toString() || "");
    }
  }, [submission]);

  const queryClient = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: async (marksInt: number) => {
      if (!submission) throw new Error("No submission");
      const { success, error } = await updateProjectSubmissionMarks(
        submission.id,
        marksInt
      );
      if (!success) throw new Error("Failed to save marks");
      return marksInt;
    },
    onSuccess: (marksInt) => {
      toast.success("Marks saved successfully");
      if (submission?.projectId) {
        // Invalidate the submissions list query
        queryClient.invalidateQueries({ queryKey: ["projectSubmissions", submission.projectId] });
      }
      onSave(marksInt);
      onClose(); // Automatically close modal
    },
    onError: () => {
      toast.error("Failed to save marks");
    },
  });

  const handleSave = () => {
    if (!submission) return;
    const marksInt = parseInt(marks);
    if (isNaN(marksInt) || marksInt < 0) {
      toast.error("Please enter valid marks");
      return;
    }
    if (marksInt > submission.totalMarks) {
      toast.error(`Marks cannot exceed total marks (${submission.totalMarks})`);
      return;
    }
    saveMutation.mutate(marksInt);
  };

  const isSaving = saveMutation.isPending;

  if (!isOpen || !submission) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white rounded-3xl w-full max-w-sm p-6 relative shadow-xl">
        <button
          onClick={onClose}
          disabled={isSaving}
          className="absolute right-5 top-5 text-gray-500 hover:text-gray-800 cursor-pointer disabled:cursor-not-allowed"
        >
          <X size={20} />
        </button>

        <h3 className="text-[#0d1b2a] text-xl font-bold mb-5">
          {submission?.obtainedMarks !== null && submission?.obtainedMarks !== undefined ? "Edit Marks" : "Add Marks"}
        </h3>

        <div className="space-y-3">
          <p className="text-[#38b000] font-bold">{submission?.name}</p>

          <div className="grid grid-cols-[100px_1fr] gap-2 text-[15px] font-medium text-gray-800">
            <span>Student ID</span>
            <span>: {submission?.rollNo}</span>

            <span>Submitted On</span>
            <span>: {submission?.submittedOn}</span>

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
            {submission?.totalMarks}
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="flex-1 py-3 border border-gray-300 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-70"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 py-3 bg-[#38b000] rounded-xl font-bold text-white hover:bg-[#2b8a00] transition-colors disabled:opacity-70 cursor-pointer disabled:cursor-not-allowed flex justify-center items-center"
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </span>
            ) : (
              "Save"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
