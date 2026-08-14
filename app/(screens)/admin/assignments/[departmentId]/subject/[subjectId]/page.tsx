"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useState } from "react";
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

  // Do not silently filter the initial assignment list to today's date.
  // A date filter is applied only after the admin selects a calendar date.
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  return (
    <main className="flex h-[calc(100vh-100px)] w-full overflow-hidden bg-[#F4F4F4]">
      <AssignmentsLeft
        subjectId={subjectId}
        facultyId={facultyId}
        isAdminView={true}
        selectedDate={selectedDate}
      />
      <AssignmentsRight 
        facultyId={facultyId} 
        collegeSubjectId={subjectId}
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate}
      />
    </main>
  );
}
