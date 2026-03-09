"use client";

import { useState, useEffect } from "react";
import AssignmentCard from "./assignmentCard";
import toast from "react-hot-toast";
import { fetchAdminFacultyAssignments } from "@/lib/helpers/admin/assignments/fetchAdminFacultyAssignments";
import AssignmentSkeleton from "@/app/(screens)/faculty/assignments/shimmer/assignmentShimmer";
import AssignmentForm from "./assignmentForm";
import { CaretLeftIcon } from "@phosphor-icons/react";
import { Pagination } from "@/app/(screens)/faculty/assignments/components/pagination";

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

  const [editingAssignment, setEditingAssignment] = useState<any | null>(null);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    if (subjectId && facultyId) loadAssignments(page);
  }, [subjectId, facultyId, page]);

  async function loadAssignments(currentPage: number) {
    try {
      setIsLoading(true);
      const { data, error, count } = await fetchAdminFacultyAssignments(
        subjectId,
        facultyId,
        currentPage,
        pageSize,
      );

      if (error) {
        toast.error("Failed to load assignments");
        return;
      }

      setTotalCount(count || 0);

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
    <div className="w-[68%] p-2 flex flex-col h-full">
      <div className="mb-4">
        <div className="flex items-center gap-1">
          <CaretLeftIcon
            size={22}
            className="text-[#282828] cursor-pointer -ml-1"
            onClick={() => window.history.back()}
          />
          <h1 className="text-[#282828] font-bold text-2xl mb-1">
            Subject Assignments
          </h1>
        </div>
        <p className="text-[#282828] text-sm">
          Reviewing assignments created by the instructor.
        </p>
      </div>
      <div className="h-[114.6vh] overflow-y-auto pr-1 pb-4">
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
            onDelete={(id: number) => { }}
          />
        )}
      </div>
      {!isLoading && totalCount > pageSize && (
        <Pagination
          currentPage={page}
          totalItems={totalCount}
          itemsPerPage={pageSize}
          onPageChange={(p: number) => setPage(p)}
        />
      )}
    </div>
  );
}
