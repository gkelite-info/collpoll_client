"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { updateAdminAssignment } from "@/lib/helpers/admin/assignments/updateAdminAssignment";

export default function AssignmentForm({ initialData, onSave, onCancel }: any) {
  const [deadline, setDeadline] = useState(initialData.toDate || "");
  const [status, setStatus] = useState(initialData.status || "Active");
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const res = await updateAdminAssignment(
      initialData.assignmentId,
      deadline,
      status,
    );

    if (res.success) {
      toast.success("Assignment updated successfully");
      onSave({ ...initialData, toDate: deadline, status });
    } else {
      toast.error(res.error);
    }
    setIsSaving(false);
  };

  return (
    <div className="w-[68%] mx-1 max-w-3xl">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Edit Assignment (Admin)
      </h2>
      <form
        onSubmit={handleSubmit}
        className="bg-white p-4 rounded-xl text-[#282828]"
      >
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-gray-400">
            Topic Name (Read-Only)
          </label>
          <textarea
            disabled
            value={initialData.description}
            className="w-full rounded-md border bg-gray-50 px-3 py-2 text-sm"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-400">
              Total Marks (Read-Only)
            </label>
            <input
              disabled
              value={initialData.marks}
              className="w-full rounded-md border bg-gray-50 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="Active">Active</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Expired">Expired</option>
            </select>
          </div>
        </div>

        <div className="mb-6">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Submission Deadline
          </label>
          <input
            type="date"
            required
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSaving}
            className="flex-1 bg-[#43C17A] text-white py-2 rounded-md hover:bg-green-600"
          >
            {isSaving ? "Saving..." : "Update Deadline"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 border py-2 rounded-md hover:bg-gray-100"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
