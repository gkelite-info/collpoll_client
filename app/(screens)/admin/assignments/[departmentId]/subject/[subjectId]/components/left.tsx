"use client";

import { useState, useEffect } from "react";

import AssignmentForm from "./assignmentForm";
import AssignmentCard from "./assignmentCard";
import { supabase } from "@/lib/supabaseClient";
import type { Assignment } from "../data";
import { deleteFacultyAssignment } from "@/lib/helpers/faculty/deleteFacultyAssignment";
import toast from "react-hot-toast";

export default function AssignmentsLeft() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [view, setView] = useState<"list" | "add" | "edit">("list");
  const [editing, setEditing] = useState<Assignment | null>(null);
  const [activeView, setActiveView] = useState<"active" | "previous">("active");

  useEffect(() => {
    fetchAssignments();
  }, []);

  async function fetchAssignments() {
    const { data, error } = await supabase
      .from("faculty_assignments")
      .select("*")
      .order("assignmentId", { ascending: false });

    if (error) {
      console.error("FETCH ERROR:", error);
      return;
    }

    const formatted: Assignment[] = data.map(a => ({
      assignmentId: a.assignmentId,
      image: "/ds.jpg",
      title: a.assignmentTitle,
      description: a.topicName,
      fromDate: convertIntToDate(a.dateAssignedInt),
      toDate: convertIntToDate(a.submissionDeadlineInt),
      totalSubmissions: String(a.totalSubmissionsExpected),
      totalSubmitted: "0",
      marks: String(a.totalMarks),
    }));

    setAssignments(formatted);
  }

  const handleDelete = async (id: number) => {
  console.log("Deleting:", id);

  const res = await deleteFacultyAssignment(id);

  if (!res.success) {
    toast.error("Failed to delete: " + res.error);
    return;
  }

  toast.success("Assignment deleted");

  setAssignments(prev => prev.filter(a => a.assignmentId !== id));
};

  function convertIntToDate(intVal: number) {
    if (!intVal) return "";
    const s = intVal.toString();
    return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
  }

  if (view === "add" || view === "edit") {
    return (
      <AssignmentForm
        initialData={editing}
        onCancel={() => {
          setEditing(null);
          setView("list");
        }}
        onSave={() => {
          fetchAssignments();
          setEditing(null);
          setView("list");
        }}
      />
    );
  }

  return (
    <div className="w-[68%] p-2 flex flex-col">
      <div className="mb-4">
        <h1 className="text-[#282828] font-bold text-2xl mb-1">Assignments</h1>
        <p className="text-[#282828]">
          Create, manage, and evaluate assignments for your students efficiently.
        </p>
      </div>

      <div className="w-full flex flex-col">
        <div className="flex flex-col justify-between items-start">
          <div className="flex justify-between mb-2 w-full">
            <div className="flex gap-4 pb-1">
              <h5
                className={`text-sm cursor-pointer pb-1 ${
                  activeView === "active"
                    ? "text-[#43C17A] font-medium border-b-2 border-[#43C17A]"
                    : "text-[#282828]"
                }`}
                onClick={() => setActiveView("active")}
              >
                Active Assignments
              </h5>

              <h5
                className={`text-sm cursor-pointer pb-1 ${
                  activeView === "previous"
                    ? "text-[#43C17A] font-medium border-b-2 border-[#43C17A]"
                    : "text-[#282828]"
                }`}
                onClick={() => setActiveView("previous")}
              >
                Evaluated Assignments
              </h5>
            </div>

            <button
              className="text-sm text-white cursor-pointer bg-[#16284F] px-4 py-1 rounded-sm"
              onClick={() => setView("add")}
            >
              Add Assignment
            </button>
          </div>

          <AssignmentCard
            cardProp={assignments}
            activeView={activeView}
            onEdit={(a) => {
              setEditing(a);
              setView("edit");
            }}
             onDelete={handleDelete}
          />
        </div>
      </div>
    </div>
  );
}
