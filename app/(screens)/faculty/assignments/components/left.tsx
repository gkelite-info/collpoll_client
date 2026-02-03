"use client";

import { useState, useEffect } from "react";
import AssignmentForm from "./assignmentForm";
import AssignmentCard from "./assignmentCard";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";
import { fetchFacultyAssignments } from "@/lib/helpers/faculty/assignment/fetchFacultyAssignments";
import { deleteFacultyAssignment } from "@/lib/helpers/faculty/assignment/deleteFacultyAssignment";
import AssignmentSkeleton from "../shimmer/assignmentShimmer";

export interface Assignment {
  sectionId: string | number | readonly string[] | undefined;
  assignmentId?: number;
  image: string;
  title: string;
  description: string;
  fromDate: string | number;
  toDate: string | number;
  totalSubmissions: string;
  totalSubmitted: string;
  marks: string | number;
}

export default function AssignmentsLeft() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [view, setView] = useState<"list" | "add" | "edit">("list");
  const [editing, setEditing] = useState<Assignment | null>(null);
  const [activeView, setActiveView] = useState<"active" | "previous">("active");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAssignments();
  }, []);

  async function fetchAssignments() {
    try {
      setIsLoading(true);

      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return;

      const { data: userData } = await supabase
        .from("users")
        .select("userId")
        .eq("auth_id", auth.user.id)
        .single();

      if (!userData) return;

      const { data: facultyData } = await supabase
        .from("faculty")
        .select("facultyId")
        .eq("userId", userData.userId)
        .single();

      if (!facultyData) return;

      const { data, error } = await fetchFacultyAssignments(
        facultyData.facultyId,
      );

      if (error) {
        toast.error("Failed to fetch assignments");
        return;
      }

      if (data) {
        const formatted: Assignment[] = data.map((a: any) => ({
          sectionId: a.collegeSectionsId,
          assignmentId: a.assignmentId,
          image: "/ds.jpg",
          title: a.college_subjects?.subjectName || "Unknown Subject",
          description: a.topicName,
          fromDate: a.dateAssignedInt,
          toDate: a.submissionDeadlineInt,
          totalSubmissions: String(a.totalSubmissionsExpected || 0),
          totalSubmitted: "0",
          marks: a.marks ? String(a.marks) : "0",
        }));
        setAssignments(formatted);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  const handleDelete = async (id: number) => {
    const res = await deleteFacultyAssignment(id);
    if (!res.success) {
      toast.error("Failed to delete: " + res.error);
      return;
    }
    toast.success("Assignment deleted");
    setAssignments((prev) => prev.filter((a) => a.assignmentId !== id));
  };

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
          Create, manage, and evaluate assignments for your students
          efficiently.
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

          {isLoading ? (
            <div className="w-full">
              {[1, 2, 3].map((i) => (
                <AssignmentSkeleton key={i} />
              ))}
            </div>
          ) : assignments.length === 0 ? (
            <div className="w-full py-10 text-center text-gray-500">
              No assignments found.
            </div>
          ) : (
            <AssignmentCard
              cardProp={assignments}
              activeView={activeView}
              onEdit={(a) => {
                setEditing(a);
                setView("edit");
              }}
              onDelete={handleDelete}
            />
          )}
        </div>
      </div>
    </div>
  );
}
