"use client";

import { FormEvent, useState } from "react";
import { upsertFacultyAssignment } from "@/lib/helpers/faculty/upsertFacultyAssignment";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabaseClient";
import type { Assignment } from "../data";


type Props = {
  initialData?: Assignment | null;
  onSave: (data: Assignment) => void;
  onCancel: () => void;
};

// Convert saved DD/MM/YYYY or INT → YYYY-MM-DD (HTML date format)
function toHtmlDate(dateStr: string | number | undefined) {
  if (!dateStr) return "";

  const str = dateStr.toString();

  // If INT: 20250103
  if (/^\d{8}$/.test(str)) {
    return `${str.slice(0, 4)}-${str.slice(4, 6)}-${str.slice(6, 8)}`;
  }

  // If DD/MM/YYYY
  if (str.includes("/")) {
    const [dd, mm, yyyy] = str.split("/");
    return `${yyyy}-${mm}-${dd}`;
  }

  return str; // Already YYYY-MM-DD
}


export default function AssignmentForm({
  initialData,
  onSave,
  onCancel,
}: Props) {

  /* -----------------------------------------
     FIX 2: PROPER form STATE INITIALIZATION
  ------------------------------------------ */
  const [form, setForm] = useState<Assignment>(
    initialData
      ? {
        ...initialData,
        fromDate: toHtmlDate(initialData.fromDate),
        toDate: toHtmlDate(initialData.toDate),
      }
      : {
        assignmentId: undefined,
        image: "/ds.jpg",
        title: "",
        description: "",
        fromDate: "",
        toDate: "",
        totalSubmissions: "",
        totalSubmitted: "0",
        marks: "",
      }
  );


  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const { data: auth } = await supabase.auth.getUser();
    const authId = auth?.user?.id;

    if (!authId) {
      toast.error("Faculty not logged in");
      return;
    }

    const { data: faculty } = await supabase
      .from("users")
      .select("userId")
      .eq("auth_id", authId)
      .single();

    if (!faculty) {
      toast.error("Faculty record missing");
      return;
    }

    const facultyId = faculty.userId;

    const payload = {
      assignmentId: form.assignmentId ?? undefined,
      facultyId,
      assignmentTitle: form.title,
      topicName: form.description,
      dateAssigned: form.fromDate,              // FIXED
      submissionDeadline: form.toDate,          // FIXED
      totalSubmissionsExpected: Number(form.totalSubmissions),
      totalMarks: Number(form.marks),
      instructions: form.description,
    };

    const res = await upsertFacultyAssignment(payload);

    if (!res.success) {
      toast.error(res.error);
      return;
    }

    toast.success("Assignment saved!");
    onSave(form);
  };


  return (
    <div className="bg-red-00 w-[68%] mx-1 max-w-3xl">
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
                  required={!initialData} // only required for NEW assignment
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
                  required={!initialData} // only required for NEW assignment
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

function convertToIntDate(dateStr: string) {
  if (!dateStr) return null;
  return Number(dateStr.replace(/-/g, ""));
}

function setAssignments(arg0: (prev: any) => any) {
  throw new Error("Function not implemented.");
}

