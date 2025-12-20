"use client";

import { FormEvent, useState } from "react";
import { Assignment } from "../data";

type Props = {
  initialData?: Assignment | null;
  onSave: (data: Assignment) => void;
  onCancel: () => void;
};

export default function AssignmentForm({
  initialData,
  onSave,
  onCancel,
}: Props) {
  const [form, setForm] = useState<Assignment>(
    initialData ?? {
      id: crypto.randomUUID(),
      image: "/ds.jpg",
      title: "",
      description: "",
      fromDate: "",
      toDate: "",
      totalSubmissions: "",
      totalSubmitted: "32",
      marks: "",
    }
  );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave(form);
  };
  return (
    <div className="w-[68%] mx-1 max-w-3xl">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {initialData ? "Edit Assignment" : "Add New Assignment"}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Create, manage, and evaluate assignments for your students efficiently
        </p>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="bg-white p-4 rounded-xl text-[#282828]">
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Assignment Title
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Implementation of Stack and Queue"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            />
          </div>

          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Topic Name
            </label>
            <textarea
              value={form.description}
              required
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Student will implement stack and queue data structure using arrays and linked lists."
              className="w-full resize-none rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              rows={3}
            />
          </div>

          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Schedule
            </label>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="mb-1 block text-xs text-gray-500">
                  Date Assigned
                </label>
                <input
                  type="date"
                  required
                  value={form.fromDate}
                  onChange={(e) =>
                    setForm({ ...form, fromDate: e.target.value })
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs text-gray-500">
                  Submission Deadline
                </label>
                <input
                  type="date"
                  required
                  value={form.toDate}
                  onChange={(e) => setForm({ ...form, toDate: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Total Submissions
              </label>
              <input
                value={form.totalSubmissions}
                required
                type="number"
                onChange={(e) =>
                  setForm({ ...form, totalSubmissions: e.target.value })
                }
                placeholder="32"
                className="w-full resize-none rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>
            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Total Marks
              </label>
              <input
                value={form.marks}
                required
                type="number"
                onChange={(e) => setForm({ ...form, marks: e.target.value })}
                placeholder="32"
                className="w-full resize-none rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Instructions
            </label>

            <div className="rounded-md border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
              <ul className="list-disc space-y-1 pl-4">
                <li>Read the question carefully before starting your work.</li>
                <li>Submit before the deadline to avoid late penalties.</li>
                <li>Attach files in the required format (PDF, ZIP, or DOC).</li>
                <li>Add brief notes or explanations if required.</li>
                <li>Review and confirm your submission before uploading.</li>
              </ul>
            </div>
          </div>

          <div className="flex w-full items-center gap-3">
            <button
              type="submit"
              className="rounded-md flex-1 cursor-pointer bg-[#43C17A] px-6 py-2 text-sm font-medium text-white hover:bg-green-600"
            >
              Save
            </button>

            <button
              type="button"
              onClick={onCancel}
              className="rounded-md cursor-pointer flex-1 border border-gray-300 px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
