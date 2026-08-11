import React, { useState, useEffect } from "react";
import { X } from "@phosphor-icons/react";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProjectDates } from "@/lib/helpers/projects/project";
import { ProjectCardProps } from "@/lib/projectTypes/project";

interface EditProjectDatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectCardProps | null;
}

export default function EditProjectDatesModal({
  isOpen,
  onClose,
  project,
}: EditProjectDatesModalProps) {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const queryClient = useQueryClient();

  useEffect(() => {
    if (project) {
      // The duration string is like "07/08/2026 - 28/08/2026" or project might have startDate and endDate directly.
      // Wait, ProjectCardProps might not have raw dates, but let's parse from duration or if they exist.
      // ProjectCardProps has endDate?: string | null; but maybe not startDate. 
      // If we don't have exact raw dates, we can extract from duration.
      if (project.duration) {
        const parts = project.duration.split(" - ");
        if (parts.length === 2) {
          // Format DD/MM/YYYY to YYYY-MM-DD for input type="date"
          const parseDate = (d: string) => {
            const [day, month, year] = d.split("/");
            return year && month && day ? `${year}-${month}-${day}` : "";
          };
          setStartDate(parseDate(parts[0]));
          setEndDate(parseDate(parts[1]));
        }
      }
    }
  }, [project]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!project || !project.projectId) throw new Error("No project found");
      const { success, error } = await updateProjectDates(
        project.projectId,
        startDate || null,
        endDate || null
      );
      if (!success) throw new Error("Failed to update dates");
      return true;
    },
    onSuccess: () => {
      toast.success("Project dates updated successfully");
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      onClose();
    },
    onError: () => {
      toast.error("Failed to update project dates");
    },
  });

  const handleSave = () => {
    if (!project) return;
    if (!startDate || !endDate) {
      toast.error("Please provide both From and to dates");
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      toast.error("From date cannot be after to date");
      return;
    }
    saveMutation.mutate();
  };

  const isSaving = saveMutation.isPending;

  if (!isOpen || !project) return null;

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
          Edit Project Dates
        </h3>

        <div className="space-y-4">
          <p className="text-gray-700 font-semibold truncate" title={project.title}>
            {project.title}
          </p>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-600">From Date</label>
            <input
              type="date"
              value={startDate}
              max={endDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full h-12 bg-gray-50 text-gray-800 font-medium px-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#38b000]"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-600">To Date</label>
            <input
              type="date"
              value={endDate}
              min={startDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full h-12 bg-gray-50 text-gray-800 font-medium px-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#38b000]"
            />
          </div>
        </div>

        <div className="flex gap-4 mt-8">
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
