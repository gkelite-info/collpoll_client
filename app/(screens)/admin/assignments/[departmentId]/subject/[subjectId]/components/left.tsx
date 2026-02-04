"use client";

import { useState, useEffect } from "react";
import AssignmentCard from "./assignmentCard";
import toast from "react-hot-toast";
import { fetchAdminFacultyAssignments } from "@/lib/helpers/admin/assignments/fetchAdminFacultyAssignments";
import AssignmentSkeleton from "@/app/(screens)/faculty/assignments/shimmer/assignmentShimmer";
import AssignmentForm from "./assignmentForm";

interface Props {
  subjectId: number;
  facultyId: number;
  isAdminView?: boolean;
}

export default function AssignmentsLeft({
  subjectId,
  facultyId,
  isAdminView,
}: Props) {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // State to track if we are editing an assignment
  const [editingAssignment, setEditingAssignment] = useState<any | null>(null);

  useEffect(() => {
    if (subjectId && facultyId) loadAssignments();
  }, [subjectId, facultyId]);

  async function loadAssignments() {
    try {
      setIsLoading(true);
      const { data, error } = await fetchAdminFacultyAssignments(
        subjectId,
        facultyId,
      );

      if (error) {
        toast.error("Failed to load assignments");
        return;
      }

      if (data && Array.isArray(data)) {
        const formatted = data.map((a: any) => ({
          assignmentId: a.assignmentId,
          sectionId: a.collegeSectionsId,
          image: "/ds.jpg",
          title: a.subjectName,
          description: a.topicName,
          fromDate: String(a.dateAssignedInt || ""),
          toDate: String(a.submissionDeadlineInt || ""),
          totalSubmissions: "0",
          totalSubmitted: "0",
          marks: String(a.marks || 0),
        }));

        setAssignments(formatted);
      } else {
        setAssignments([]);
      }
    } catch (err) {
      console.error("MAPPING ERROR:", err);
    } finally {
      setIsLoading(false);
    }
  }

  if (editingAssignment) {
    return (
      <AssignmentForm
        initialData={editingAssignment}
        onSave={(updated: any) => {
          setAssignments((prev) =>
            prev.map((a) =>
              a.assignmentId === updated.assignmentId ? updated : a,
            ),
          );
          setEditingAssignment(null);
        }}
        onCancel={() => setEditingAssignment(null)}
      />
    );
  }

  return (
    <div className="w-[68%] p-2 flex flex-col">
      <div className="mb-4">
        <h1 className="text-[#282828] font-bold text-2xl mb-1">
          Subject Assignments
        </h1>
        <p className="text-[#282828] text-sm">
          Reviewing assignments created by the instructor.
        </p>
      </div>

      {isLoading ? (
        <>
          <AssignmentSkeleton />
          <AssignmentSkeleton />
          <AssignmentSkeleton />
        </>
      ) : assignments.length === 0 ? (
        <div className="py-20 text-center text-gray-400 border border-dashed rounded-xl bg-white">
          No assignments found for this subject and faculty.
        </div>
      ) : (
        <AssignmentCard
          activeView="active"
          cardProp={assignments}
          onEdit={(item: any) => setEditingAssignment(item)}
          onDelete={(id: number) => {}}
        />
      )}
    </div>
  );
}
