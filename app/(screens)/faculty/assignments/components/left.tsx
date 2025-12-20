"use client";

import { useState } from "react";

import AssignmentForm from "./assignmentForm";
import AssignmentCard from "./assignmentCard";
import { Assignment, initialAssignments } from "../data";

export default function AssignmentsLeft() {
  const [assignments, setAssignments] =
    useState<Assignment[]>(initialAssignments);

  const [view, setView] = useState<"list" | "add" | "edit">("list");
  const [editing, setEditing] = useState<Assignment | null>(null);
  const [activeView, setActiveView] = useState<"active" | "previous">("active");

  if (view === "add" || view === "edit") {
    return (
      <AssignmentForm
        initialData={editing}
        onCancel={() => {
          setEditing(null);
          setView("list");
        }}
        onSave={(assignment) => {
          if (editing) {
            setAssignments((prev) =>
              prev.map((a) => (a.id === assignment.id ? assignment : a))
            );
          } else {
            setAssignments((prev) => [...prev, assignment]);
          }
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
          Create, manage, and evaluate assignments for your students
          efficiently.
        </p>
      </div>

      <div className="w-full flex flex-col">
        <div className="flex flex-col justify-between items-start">
          <div className="flex justify-between mb-2 w-full">
            <div className="flex gap-4 pb-1">
              <h5
                className={`
                                text-sm cursor-pointer pb-1
                                ${
                                  activeView === "active"
                                    ? "text-[#43C17A] font-medium border-b-2 border-[#43C17A]"
                                    : "text-[#282828]"
                                }
                            `}
                onClick={() => setActiveView("active")}
              >
                Active Assignments
              </h5>

              <h5
                className={`
                                text-sm cursor-pointer pb-1
                                ${
                                  activeView === "previous"
                                    ? "text-[#43C17A] font-medium border-b-2 border-[#43C17A]"
                                    : "text-[#282828]"
                                }
                            `}
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
            onDelete={(id) =>
              setAssignments((prev) => prev.filter((a) => a.id !== id))
            }
          />
        </div>
      </div>
    </div>
  );
}
