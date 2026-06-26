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

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  return (
    <main className="flex w-full min-h-screen bg-[#F3F6F9]">
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
