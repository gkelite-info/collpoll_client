"use client";

import { useParams, useSearchParams } from "next/navigation";
import AssignmentsLeft from "./components/left";
import AssignmentsRight from "./components/right";
import { decryptId } from "@/app/utils/encryption";

export default function AdminSubjectAssignmentPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const subjectId = Number(params.subjectId);
  const facultyIdParam = searchParams.get("facultyId");
  const decryptedFacultyId =
    facultyIdParam && !/^\d+$/.test(facultyIdParam)
      ? decryptId(facultyIdParam)
      : null;
  const facultyId = Number(decryptedFacultyId ?? facultyIdParam);

  return (
    <main className="flex w-full min-h-screen bg-[#F3F6F9]">
      <AssignmentsLeft
        subjectId={subjectId}
        facultyId={facultyId}
        isAdminView={true}
      />
      <AssignmentsRight facultyId={facultyId} collegeSubjectId={subjectId} />
    </main>
  );
}
